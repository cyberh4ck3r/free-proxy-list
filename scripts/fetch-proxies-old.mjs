import { writeFileSync, existsSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIRS = [__dirname + "/.."]

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
  {
    label: "proxyscrape",
    url: "https://proxyscrape.com/free-proxy-list",
    protocols: ["HTTP", "HTTPS", "SOCKS4", "SOCKS5"],
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

function extractProxies(text) {
  const ipPortRegex = /\b(?:\d{1,3}\.){3}\d{1,3}:\d{2,5}\b/g
  const matches = text.match(ipPortRegex)
  return matches ? [...new Set(matches.map((m) => m.trim()))] : []
}

async function fetchSource(source) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)
    const res = await fetch(source.url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return []
    const text = await res.text()
    const proxies = extractProxies(text)
    console.log(`  [${source.label}] ${proxies.length} proxies`)
    return proxies
  } catch (e) {
    console.error(`  [${source.label}] FAILED: ${e.message}`)
    return []
  }
}

async function main() {
  console.log("Fetching proxy sources...")
  const allProxies = await Promise.all(
    SOURCES.map(async (source) => {
      const proxies = await fetchSource(source)
      return { source, proxies }
    })
  )

  const result = {}
  for (const { source, proxies } of allProxies) {
    for (const protocol of source.protocols) {
      if (!result[protocol]) result[protocol] = new Set()
      for (const p of proxies) result[protocol].add(p)
    }
  }

  const protocolFiles = {
    HTTP: "http-proxies.txt",
    HTTPS: "https-proxies.txt",
    SOCKS4: "socks4-proxies.txt",
    SOCKS5: "socks5-proxies.txt",
  }

  for (const dir of OUT_DIRS) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    for (const [protocol, filename] of Object.entries(protocolFiles)) {
      const list = result[protocol] ? [...result[protocol]].sort() : []
      writeFileSync(join(dir, filename), list.join("\n"), "utf-8")
    }
  }

  console.log(`\nDone. Saved to data/ and github/`)
  let total = 0
  for (const [protocol, list] of Object.entries(result)) {
    console.log(`  ${filename(protocol)}: ${list.size} proxies`)
    total += list.size
  }
  console.log(`Total: ${total}`)
}

function filename(protocol) {
  const map = { HTTP: "http-proxies.txt", HTTPS: "https-proxies.txt", SOCKS4: "socks4-proxies.txt", SOCKS5: "socks5-proxies.txt" }
  return map[protocol] || protocol
}

main()
