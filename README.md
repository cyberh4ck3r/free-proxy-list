# Free Proxy List

[![Status](https://img.shields.io/badge/status-live-brightgreen)](https://mqkgv51l.status.cron-job.org/)
[![License](https://img.shields.io/github/license/cyberh4ck3r/free-proxy-list)](LICENSE)
[![Commits](https://img.shields.io/github/commit-activity/m/cyberh4ck3r/free-proxy-list)](https://github.com/cyberh4ck3r/free-proxy-list/commits)

automatically updated proxy lists from multiple sources — with health-check every 30 minutes (fast/stable/elite filters).

## download — raw lists (unverified)

- **HTTP** — `http-proxies.txt`
```bash
https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/http-proxies.txt
```
- **HTTPS** — `https-proxies.txt`
```bash
https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/https-proxies.txt
```
- **SOCKS4** — `socks4-proxies.txt`
```bash
https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/socks4-proxies.txt
```
- **SOCKS5** — `socks5-proxies.txt`
```bash
https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/socks5-proxies.txt
```

## download — verified (health-checked)

> E2E-verifiziert via `httpbin.org/ip` (8s timeout), rechecked every 30min. `fast <=1000ms`, `stable >=2 consecutive successes`, `elite = no header leak`. Struktur wie bei [xyzs996/free-proxy-health-list](https://github.com/xyzs996/free-proxy-health-list).

| List | Proxies | TXT | JSON | CSV | jsDelivr |
|---|---|---|---|---|---|
| **All healthy** | healthy only | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/all/data.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/all/data.json) | [CSV](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/all/data.csv) | [jsDelivr](https://cdn.jsdelivr.net/gh/cyberh4ck3r/free-proxy-list@main/proxies/all/data.txt) |
| **HTTP healthy** | HTTP | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/protocols/http/data.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/protocols/http/data.json) | [CSV](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/protocols/http/data.csv) | [jsDelivr](https://cdn.jsdelivr.net/gh/cyberh4ck3r/free-proxy-list@main/proxies/protocols/http/data.txt) |
| **HTTPS healthy** | HTTPS | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/protocols/https/data.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/protocols/https/data.json) | [CSV](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/protocols/https/data.csv) | [jsDelivr](https://cdn.jsdelivr.net/gh/cyberh4ck3r/free-proxy-list@main/proxies/protocols/https/data.txt) |
| **SOCKS4 healthy** | SOCKS4 | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/protocols/socks4/data.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/protocols/socks4/data.json) | [CSV](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/protocols/socks4/data.csv) | [jsDelivr](https://cdn.jsdelivr.net/gh/cyberh4ck3r/free-proxy-list@main/proxies/protocols/socks4/data.txt) |
| **SOCKS5 healthy** | SOCKS5 | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/protocols/socks5/data.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/protocols/socks5/data.json) | [CSV](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/protocols/socks5/data.csv) | [jsDelivr](https://cdn.jsdelivr.net/gh/cyberh4ck3r/free-proxy-list@main/proxies/protocols/socks5/data.txt) |
| **Fast proxies** | `latency <= 1000ms` | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/latency/fast/data.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/latency/fast/data.json) | [CSV](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/latency/fast/data.csv) | [jsDelivr](https://cdn.jsdelivr.net/gh/cyberh4ck3r/free-proxy-list@main/proxies/latency/fast/data.txt) |
| **Stable proxies** | `consecutiveSuccesses >= 2` | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/stability/stable/data.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/stability/stable/data.json) | [CSV](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/stability/stable/data.csv) | [jsDelivr](https://cdn.jsdelivr.net/gh/cyberh4ck3r/free-proxy-list@main/proxies/stability/stable/data.txt) |
| **Elite proxies** | `anonymity == elite` | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/anonymity/elite/data.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/anonymity/elite/data.json) | [CSV](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/anonymity/elite/data.csv) | [jsDelivr](https://cdn.jsdelivr.net/gh/cyberh4ck3r/free-proxy-list@main/proxies/anonymity/elite/data.txt) |

**jsDelivr CDN** — `https://cdn.jsdelivr.net/gh/cyberh4ck3r/free-proxy-list@main/<path>` ist identisch zu `raw.githubusercontent` aber schneller/cachiert.

**JSON shape** per entry:
```json
{
  "proxy": "1.2.3.4:8080",
  "host": "1.2.3.4",
  "port": 8080,
  "protocol": "http",
  "latencyMs": 842,
  "anonymity": "elite",
  "supportsHttps": true,
  "consecutiveSuccesses": 3,
  "reliabilityScore": 96.5,
  "lastChecked": "2026-08-23T12:00:00Z"
}
```

## notes

for educational purposes only. i do not own or manage any of these proxies.

## credits

proxies are aggregated from the following public sources:

- [TheSpeedX/SOCKS-List](https://github.com/TheSpeedX/SOCKS-List)
- [free-proxy-list.net](https://free-proxy-list.net/)
- [ProxyScrape](https://proxyscrape.com/free-proxy-list)
- [ProxyNova](https://www.proxynova.com/proxy-server-list/)
- [ProxyBros](https://proxybros.com/free-proxy-list/)
- [ProxyDB](https://proxydb.net/)
- [spys.one](https://spys.one/en/free-proxy-list/)

all credit goes to the original maintainers of these sources. this project just aggregates and re-publishes their public lists.
