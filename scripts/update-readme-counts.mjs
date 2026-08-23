import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const README = join(ROOT, "README.md")

function countLines(path) {
  if (!existsSync(path)) return "—"
  const txt = readFileSync(path, "utf-8")
  const n = txt.split("\n").filter(s => s.trim()).length
  return String(n)
}

const counts = {
  all: countLines(join(ROOT, "proxies/checked/all/all-proxies.txt")),
  http: countLines(join(ROOT, "proxies/checked/protocols/http/http-proxies.txt")),
  https: countLines(join(ROOT, "proxies/checked/protocols/https/https-proxies.txt")),
  socks4: countLines(join(ROOT, "proxies/checked/protocols/socks4/socks4-proxies.txt")),
  socks5: countLines(join(ROOT, "proxies/checked/protocols/socks5/socks5-proxies.txt")),
  fast: countLines(join(ROOT, "proxies/checked/latency/fast/fast-proxies.txt")),
  stable: countLines(join(ROOT, "proxies/checked/stability/stable/stable-proxies.txt")),
  elite: countLines(join(ROOT, "proxies/checked/anonymity/elite/elite-proxies.txt")),
}

let readme = readFileSync(README, "utf-8")
let lines = readme.split("\n")
const want = {
  "All healthy": counts.all,
  "HTTP healthy": counts.http,
  "HTTPS healthy": counts.https,
  "SOCKS4 healthy": counts.socks4,
  "SOCKS5 healthy": counts.socks5,
  "Fast proxies": counts.fast,
  "Stable proxies": counts.stable,
  "Elite proxies": counts.elite,
}
lines = lines.map(line => {
  for (const [name, count] of Object.entries(want)) {
    if (line.includes(`**${name}**`)) {
      // split by |, count is 3rd data column (index 3)
      const parts = line.split("|")
      // parts: ["", " **All healthy** ", " healthy only ", " `—` ", " [TXT]... ", " [JSON]... ", ""]
      if (parts.length >= 5) {
        parts[3] = ` \`${count}\` `
        return parts.join("|")
      }
    }
  }
  return line
})
readme = lines.join("\n")

writeFileSync(README, readme, "utf-8")
console.log("Updated README counts:", counts)
