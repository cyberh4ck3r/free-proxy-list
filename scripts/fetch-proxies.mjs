import { writeFileSync, existsSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIRS = [
  join(__dirname, ".."),
  join(__dirname, "..", "proxies", "unchecked"),
]

const FETCH_TIMEOUT_MS = 20000
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1500

const SOURCES = [
  {
    label: "TheSpeedX HTTP",
    url: "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt",
    protocols: ["HTTP"],
  },
  {
    label: "TheSpeedX SOCKS4",
    url: "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks4.txt",
    protocols: ["SOCKS4"],
  },
  {
    label: "TheSpeedX SOCKS5",
    url: "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt",
    protocols: ["SOCKS5"],
  },
  {
    label: "free-proxy-list US",
    url: "https://free-proxy-list.net/en/us-proxy.html",
    protocols: ["HTTP", "HTTPS"],
  },
  {
    label: "free-proxy-list SOCKS",
    url: "https://free-proxy-list.net/en/socks-proxy.html",
    protocols: ["SOCKS4", "SOCKS5"],
  },
  // proxyscrape.com/free-proxy-list is a JS-rendered landing page — scraping it directly
  // yields nothing useful. Use their documented raw-text API endpoints instead.
  {
    label: "proxyscrape HTTP",
    url: "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all",
    protocols: ["HTTP", "HTTPS"],
  },
  {
    label: "proxyscrape SOCKS4",
    url: "https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks4&timeout=10000&country=all",
    protocols: ["SOCKS4"],
  },
  {
    label: "proxyscrape SOCKS5",
    url: "https://api.proxyscrape.com/v2/?request=getproxies&protocol=socks5&timeout=10000&country=all",
    protocols: ["SOCKS5"],
  },
  {
    label: "proxynova",
    url: "https://www.proxynova.com/proxy-server-list/",
    protocols: ["HTTP", "HTTPS", "SOCKS4", "SOCKS5"],
  },
  {
    label: "proxybros",
    url: "https://proxybros.com/free-proxy-list/",
    protocols: ["HTTP", "HTTPS", "SOCKS4", "SOCKS5"],
  },
  {
    label: "proxydb",
    url: "https://proxydb.net/?protocol=http&country=",
    protocols: ["HTTP", "HTTPS"],
  },
  {
    label: "spys.one",
    url: "https://spys.one/en/free-proxy-list/",
    protocols: ["HTTP", "HTTPS", "SOCKS4", "SOCKS5"],
  },
]

const PROTOCOL_FILES = {
  HTTP: "http-proxies.txt",
  HTTPS: "https-proxies.txt",
  SOCKS4: "socks4-proxies.txt",
  SOCKS5: "socks5-proxies.txt",
}

// Basic sanity bounds so we don't collect garbage like "999.999.999.999:99999"
function isValidProxy(ip, port) {
  const octets = ip.split(".").map(Number)
  if (octets.some((o) => o < 0 || o > 255)) return false
  const p = Number(port)
  if (p < 1 || p > 65535) return false
  return true
}

function extractProxies(text) {
  const ipPortRegex = /\b((?:\d{1,3}\.){3}\d{1,3}):(\d{2,5})\b/g
  const found = new Set()
  let match
  while ((match = ipPortRegex.exec(text)) !== null) {
    const [, ip, port] = match
    if (isValidProxy(ip, port)) found.add(`${ip}:${port}`)
  }
  return [...found]
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Some of these sites reject requests with no user agent at all.
        "User-Agent":
          "Mozilla/5.0 (compatible; ProxyListBot/1.0; +https://github.com/)",
      },
    })
    return res
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchSource(source) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(source.url, FETCH_TIMEOUT_MS)
      if (!res.ok) {
        console.error(`  [${source.label}] HTTP ${res.status}`)
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS)
          continue
        }
        return []
      }
      const text = await res.text()
      const proxies = extractProxies(text)
      console.log(`  [${source.label}] ${proxies.length} proxies`)
      if (proxies.length === 0) {
        console.warn(
          `  [${source.label}] WARNING: 0 proxies extracted — page may be JS-rendered or its markup changed`
        )
      }
      return proxies
    } catch (e) {
      const isLast = attempt === MAX_RETRIES
      console.error(
        `  [${source.label}] FAILED (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${e.message}`
      )
      if (!isLast) await sleep(RETRY_DELAY_MS)
      else return []
    }
  }
  return []
}

async function main() {
  console.log("Fetching proxy sources...")

  const results = await Promise.all(
    SOURCES.map(async (source) => ({
      source,
      proxies: await fetchSource(source),
    }))
  )

  const byProtocol = {}
  for (const { source, proxies } of results) {
    for (const protocol of source.protocols) {
      if (!byProtocol[protocol]) byProtocol[protocol] = new Set()
      for (const p of proxies) byProtocol[protocol].add(p)
    }
  }

  // Snapshot counts BEFORE converting sets to sorted arrays, so the summary
  // reflects the actual number of unique proxies per protocol.
  const counts = {}
  for (const protocol of Object.keys(PROTOCOL_FILES)) {
    counts[protocol] = byProtocol[protocol] ? byProtocol[protocol].size : 0
  }

  for (const dir of OUT_DIRS) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    for (const [protocol, filename] of Object.entries(PROTOCOL_FILES)) {
      const list = byProtocol[protocol] ? [...byProtocol[protocol]].sort() : []
      writeFileSync(join(dir, filename), list.join("\n") + (list.length ? "\n" : ""), "utf-8")
    }
  }

  console.log(`\nDone. Saved to: ${OUT_DIRS.join(", ")}`)
  let total = 0
  for (const [protocol, filename] of Object.entries(PROTOCOL_FILES)) {
    console.log(`  ${filename}: ${counts[protocol]} proxies`)
    total += counts[protocol]
  }
  console.log(`Total: ${total}`)
}

main().catch((e) => {
  console.error("Fatal error:", e)
  process.exit(1)
})
