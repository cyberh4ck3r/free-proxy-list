import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import pkgHttp from "https-proxy-agent"
import pkgSocks from "socks-proxy-agent"
import { fetch as undiciFetch, ProxyAgent } from "undici"
const { HttpProxyAgent } = pkgHttp
const { SocksProxyAgent } = pkgSocks

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

// ---- config ----
const TIMEOUT_MS = 8000
const CONCURRENCY = 100
const FAST_THRESHOLD_MS = 1000
const STABLE_THRESHOLD = 2
const TARGET_HTTP = "http://httpbin.org/ip"
const TARGET_HTTPS = "https://httpbin.org/ip"
const TARGET_HEADERS = "http://httpbin.org/headers"
const HISTORY_PATH = join(ROOT, "stats", "proxy-history.json")

const PROTOCOL_FILES = {
  HTTP: "http-proxies.txt",
  HTTPS: "https-proxies.txt",
  SOCKS4: "socks4-proxies.txt",
  SOCKS5: "socks5-proxies.txt",
}

// ---- helpers ----
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true })
}

function loadProxies() {
  const entries = []
  for (const [protocol, file] of Object.entries(PROTOCOL_FILES)) {
    const path = join(ROOT, file)
    if (!existsSync(path)) continue
    const text = readFileSync(path, "utf-8")
    const lines = text.split("\n").map(s => s.trim()).filter(Boolean)
    for (const line of lines) {
      const [host, portStr] = line.split(":")
      if (!host || !portStr) continue
      const port = Number(portStr)
      if (!port) continue
      entries.push({ proxy: line, host, port, protocol })
    }
  }
  // dedup by proxy|protocol
  const seen = new Set()
  const uniq = []
  for (const e of entries) {
    const key = `${e.proxy}|${e.protocol}`
    if (!seen.has(key)) { seen.add(key); uniq.push(e) }
  }
  return uniq
}

function loadHistory() {
  if (!existsSync(HISTORY_PATH)) return {}
  try { return JSON.parse(readFileSync(HISTORY_PATH, "utf-8")) } catch { return {} }
}

function saveHistory(h) {
  ensureDir(dirname(HISTORY_PATH))
  writeFileSync(HISTORY_PATH, JSON.stringify(h, null, 2))
}

function getDispatcher(proxy, protocol) {
  const p = protocol.toLowerCase()
  if (p === "socks4") return new SocksProxyAgent(`socks4://${proxy}`)
  if (p === "socks5") return new SocksProxyAgent(`socks5://${proxy}`)
  // HTTP/HTTPS use undici ProxyAgent (handles CONNECT for https)
  return new ProxyAgent(`http://${proxy}`)
}

async function fetchViaProxy(url, proxy, protocol, timeoutMs) {
  const dispatcher = getDispatcher(proxy, protocol)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const start = Date.now()
  try {
    // race against hard timeout in case dispatcher hangs and doesn't respect abort
    const fetchPromise = undiciFetch(url, {
      dispatcher,
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ProxyHealthCheck/1.0)" },
    })
    const timeoutPromise = new Promise((_, rej) => setTimeout(() => rej(new Error("hard timeout")), timeoutMs + 500))
    const res = await Promise.race([fetchPromise, timeoutPromise])
    const latencyMs = Date.now() - start
    if (!res.ok) return { ok: false, latencyMs, status: res.status }
    const text = await res.text()
    if (!text || text.length < 2) return { ok: false, latencyMs, status: 0 }
    return { ok: true, latencyMs, status: res.status, body: text }
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - start, error: e.message }
  } finally {
    clearTimeout(timer)
    // don't await close forever — fire and forget with timeout
    try {
      if (dispatcher.close) {
        const p = dispatcher.close()
        if (p && p.catch) p.catch(()=>{})
        // also set a 1s cap
        setTimeout(()=>{ try{ if(dispatcher.destroy) dispatcher.destroy() }catch{} }, 1000)
      }
    } catch {}
  }
}

async function checkAnonymity(proxy, protocol) {
  // SOCKS is always elite at transport layer
  if (protocol === "SOCKS4" || protocol === "SOCKS5") return "elite"
  try {
    const r = await fetchViaProxy(TARGET_HEADERS, proxy, protocol, TIMEOUT_MS)
    if (!r.ok) return "unknown"
    const body = r.body || ""
    const lower = body.toLowerCase()
    // httpbin returns JSON with headers object
    // heuristic: if body contains proxy ip or via/proxy headers -> not elite
    // we don't know client ip here, so check generic proxy headers
    if (lower.includes("via") || lower.includes("x-forwarded-for") || lower.includes("x-real-ip") || lower.includes("proxy-connection")) {
      // if Via present but no forward-for -> anonymous, else transparent
      // simple: if via present -> anonymous, transparent only if we could verify IP leak (skip for now)
      if (lower.includes("via")) return "anonymous"
      return "anonymous"
    }
    return "elite"
  } catch {
    return "unknown"
  }
}

async function checkOne(entry, history) {
  const { proxy, host, port, protocol } = entry
  const target = protocol === "HTTPS" ? TARGET_HTTPS : TARGET_HTTP
  const r = await fetchViaProxy(target, proxy, protocol, TIMEOUT_MS)
  if (!r.ok) {
    // fallback: try opposite scheme once for http proxies that might need https
    if (protocol === "HTTP") {
      const r2 = await fetchViaProxy(TARGET_HTTPS, proxy, protocol, TIMEOUT_MS)
      if (r2.ok) {
        const anonymity = await checkAnonymity(proxy, protocol)
        return { ok: true, proxy, host, port, protocol, latencyMs: r2.latencyMs, supportsHttps: true, anonymity, lastChecked: new Date().toISOString() }
      }
    }
    return { ok: false, proxy, protocol, latencyMs: r.latencyMs }
  }
  // check supportsHttps for HTTP proxies
  let supportsHttps = protocol === "HTTPS"
  if (protocol === "HTTP") {
    const rHttps = await fetchViaProxy(TARGET_HTTPS, proxy, protocol, 4000)
    supportsHttps = rHttps.ok
  }
  if (protocol === "SOCKS4" || protocol === "SOCKS5") {
    const rHttps = await fetchViaProxy(TARGET_HTTPS, proxy, protocol, 4000)
    supportsHttps = rHttps.ok
  }
  const anonymity = await checkAnonymity(proxy, protocol)
  return { ok: true, proxy, host, port, protocol, latencyMs: r.latencyMs, supportsHttps, anonymity, lastChecked: new Date().toISOString() }
}

// simple pool
async function pool(items, concurrency, fn) {
  const results = new Array(items.length)
  let idx = 0
  let done = 0
  async function worker() {
    while (idx < items.length) {
      const cur = idx++
      try { results[cur] = await fn(items[cur], cur) } catch (e) { results[cur] = { ok: false, error: e.message } }
      done++
      if (done % 500 === 0) console.log(`  checked ${done}/${items.length}...`)
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

function toCsv(rows) {
  if (rows.length === 0) return ""
  const cols = Object.keys(rows[0])
  const header = cols.join(",")
  const lines = rows.map(r => cols.map(c => {
    const v = String(r[c] ?? "")
    // escape commas/quotes
    if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`
    return v
  }).join(","))
  return [header, ...lines].join("\n") + "\n"
}

function writeOutputs(healthy) {
  const sorted = [...healthy].sort((a,b) => a.latencyMs - b.latencyMs)

  function writeChecked(baseDir, baseName, items) {
    ensureDir(baseDir)
    const txt = items.map(i => i.proxy).join("\n") + (items.length ? "\n" : "")
    writeFileSync(join(baseDir, `${baseName}.txt`), txt)
    const json = items.map(i => ({
      proxy: i.proxy,
      host: i.host,
      port: i.port,
      protocol: i.protocol.toLowerCase(),
      latencyMs: i.latencyMs,
      anonymity: i.anonymity,
      supportsHttps: i.supportsHttps,
      consecutiveSuccesses: i.consecutiveSuccesses,
      reliabilityScore: i.reliabilityScore,
      lastChecked: i.lastChecked
    }))
    writeFileSync(join(baseDir, `${baseName}.json`), JSON.stringify(json, null, 2))
  }

  // proxies/checked/all/all-proxies.txt|json
  writeChecked(join(ROOT, "proxies", "checked", "all"), "all-proxies", sorted)

  // proxies/checked/protocols/<proto>/*-proxies.txt
  for (const proto of ["HTTP","HTTPS","SOCKS4","SOCKS5"]) {
    const items = sorted.filter(i => i.protocol === proto)
    const fileName = `${proto.toLowerCase()}-proxies`
    writeChecked(join(ROOT, "proxies", "checked", "protocols", proto.toLowerCase()), fileName, items)
    // also keep legacy root healthy for compat (optional)
    writeFileSync(join(ROOT, `${proto.toLowerCase()}-healthy.txt`), items.map(i=>i.proxy).join("\n") + (items.length ? "\n" : ""))
  }

  // proxies/checked/latency/fast/fast-proxies.txt
  const fast = sorted.filter(i => i.latencyMs <= FAST_THRESHOLD_MS)
  writeChecked(join(ROOT, "proxies", "checked", "latency", "fast"), "fast-proxies", fast)

  // proxies/checked/stability/stable/stable-proxies.txt
  const stable = sorted.filter(i => i.consecutiveSuccesses >= STABLE_THRESHOLD)
  writeChecked(join(ROOT, "proxies", "checked", "stability", "stable"), "stable-proxies", stable)

  // proxies/checked/anonymity/elite/elite-proxies.txt
  const elite = sorted.filter(i => i.anonymity === "elite")
  writeChecked(join(ROOT, "proxies", "checked", "anonymity", "elite"), "elite-proxies", elite)

  // badges
  ensureDir(join(ROOT, "proxies", "badges"))
  function badge(label, message, color="brightgreen") {
    return { schemaVersion: 1, label, message: String(message), color }
  }
  writeFileSync(join(ROOT, "proxies", "badges", "total.json"), JSON.stringify(badge("total", healthy.length)))
  for (const proto of ["http","https","socks4","socks5"]) {
    const cnt = sorted.filter(i => i.protocol.toLowerCase()===proto).length
    writeFileSync(join(ROOT, "proxies", "badges", `${proto}.json`), JSON.stringify(badge(proto, cnt)))
  }
  writeFileSync(join(ROOT, "proxies", "badges", "fast.json"), JSON.stringify(badge("fast", fast.length)))
  writeFileSync(join(ROOT, "proxies", "badges", "stable.json"), JSON.stringify(badge("stable", stable.length)))
  writeFileSync(join(ROOT, "proxies", "badges", "elite.json"), JSON.stringify(badge("elite", elite.length)))
  writeFileSync(join(ROOT, "proxies", "badges", "updated.json"), JSON.stringify(badge("updated", new Date().toISOString().slice(0,10))))

  // also write legacy proxies/all for compat during transition
  ensureDir(join(ROOT, "proxies", "all"))
  writeChecked(join(ROOT, "proxies", "all"), "data", sorted)

  console.log(`\nOutputs (checked):`)
  console.log(`  all: ${sorted.length} (fast: ${fast.length}, stable: ${stable.length}, elite: ${elite.length})`)
  for (const proto of ["HTTP","HTTPS","SOCKS4","SOCKS5"]) {
    console.log(`  ${proto}: ${sorted.filter(i=>i.protocol===proto).length}`)
  }
}

async function main() {
  console.log("Loading proxies...")
  let entries = loadProxies()
  // for local dry-run: CHECK_LIMIT=50 npm run check
  if (process.env.CHECK_LIMIT) {
    const n = parseInt(process.env.CHECK_LIMIT, 10)
    entries = entries.slice(0, n)
    console.log(`CHECK_LIMIT=${n} -> testing ${entries.length} entries`)
  }
  console.log(`Found ${entries.length} proxy|protocol entries`)
  if (entries.length === 0) {
    console.warn("No proxies to check - did fetch-proxies run?")
    return
  }
  const history = loadHistory()
  console.log(`History entries: ${Object.keys(history).length}`)
  console.log(`Checking with concurrency=${CONCURRENCY}, timeout=${TIMEOUT_MS}ms...`)

  const results = await pool(entries, CONCURRENCY, async (e) => await checkOne(e, history))

  const healthyRaw = results.filter(r => r && r.ok)

  // enrich with history
  const now = new Date().toISOString()
  const healthy = healthyRaw.map(r => {
    const key = `${r.proxy}|${r.protocol}`
    const prev = history[key] || { consecutiveSuccesses: 0, totalChecks: 0, successes: 0 }
    const consecutiveSuccesses = prev.consecutiveSuccesses + 1
    const totalChecks = (prev.totalChecks || 0) + 1
    const successes = (prev.successes || 0) + 1
    const reliabilityScore = totalChecks ? Math.round((successes / totalChecks) * 10000) / 100 : 100
    const latencyMs = r.latencyMs
    // simple qualityScore: 100 - latency penalty - reliability bonus
    const qualityScore = Math.max(0, Math.round(100 - Math.min(90, latencyMs / 30) + (reliabilityScore >= 90 ? 5 : 0)))
    // update history
    history[key] = { consecutiveSuccesses, totalChecks, successes, lastChecked: now, latencyMs, anonymity: r.anonymity }
    return { ...r, consecutiveSuccesses, totalChecks, successes, reliabilityScore, qualityScore }
  })

  // mark failures in history (reset consecutive)
  for (const r of results) {
    if (!r || r.ok) continue
    // r may have proxy+protocol if failed after fetch, else we need to find original entry
    // we keep results aligned with entries, so use entries index
  }
  // For failed entries, reset consecutive
  results.forEach((r, idx) => {
    if (r && r.ok) return
    const e = entries[idx]
    const key = `${e.proxy}|${e.protocol}`
    const prev = history[key] || { consecutiveSuccesses: 0, totalChecks: 0, successes: 0 }
    history[key] = {
      consecutiveSuccesses: 0,
      totalChecks: (prev.totalChecks || 0) + 1,
      successes: prev.successes || 0,
      lastChecked: now,
      lastFailure: now
    }
  })

  // prune old history (keep only entries seen in last 7 days or still in list?)
  // keep size bounded: if > 20000 entries, drop oldest
  const keys = Object.keys(history)
  if (keys.length > 20000) {
    console.log(`Pruning history ${keys.length} -> 15000`)
    const sortedKeys = keys.sort((a,b) => (history[a].lastChecked||"").localeCompare(history[b].lastChecked||""))
    for (const k of sortedKeys.slice(0, keys.length - 15000)) delete history[k]
  }

  saveHistory(history)
  writeOutputs(healthy)
  console.log(`\nDone. Healthy: ${healthy.length}/${entries.length} (${Math.round(healthy.length/entries.length*100)}%)`)
}

main().catch(e => { console.error("Fatal:", e); process.exit(1) })
