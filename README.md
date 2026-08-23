# Free Proxy List

[![Status](https://img.shields.io/badge/status-live-brightgreen)](https://mqkgv51l.status.cron-job.org/)
[![License](https://img.shields.io/github/license/cyberh4ck3r/free-proxy-list)](LICENSE)
[![Commits](https://img.shields.io/github/commit-activity/m/cyberh4ck3r/free-proxy-list)](https://github.com/cyberh4ck3r/free-proxy-list/commits)

automatically updated proxy lists from multiple sources — with health-check every 30 minutes (fast/stable/elite filters).


## download — raw lists (unverified)
these come straight from the sources, no testing applied:

- **HTTP** — `http-proxies.txt`
```bash
https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/unchecked/http-proxies.txt
```
- **HTTPS** — `https-proxies.txt`
```bash
https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/unchecked/https-proxies.txt
```
- **SOCKS4** — `socks4-proxies.txt`
```bash
https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/unchecked/socks4-proxies.txt
```
- **SOCKS5** — `socks5-proxies.txt`
```bash
https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/unchecked/socks5-proxies.txt
```


## download — verified (health-checked)

> generated after the first health-check run — a 404 just means the next 30min run hasn't created it yet. `TXT` = `host:port` per line, `JSON` = full records.

| List | Proxies | TXT | JSON |
|---|---|---|---|
| **All healthy** | healthy only | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/all/all-proxies.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/all/all-proxies.json) |
| **HTTP healthy** | HTTP | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/protocols/http/http-proxies.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/protocols/http/http-proxies.json) |
| **HTTPS healthy** | HTTPS | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/protocols/https/https-proxies.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/protocols/https/https-proxies.json) |
| **SOCKS4 healthy** | SOCKS4 | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/protocols/socks4/socks4-proxies.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/protocols/socks4/socks4-proxies.json) |
| **SOCKS5 healthy** | SOCKS5 | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/protocols/socks5/socks5-proxies.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/protocols/socks5/socks5-proxies.json) |
| **Fast proxies** | `latency <= 1000ms` | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/latency/fast/fast-proxies.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/latency/fast/fast-proxies.json) |
| **Stable proxies** | `consecutiveSuccesses >= 2` | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/stability/stable/stable-proxies.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/stability/stable/stable-proxies.json) |
| **Elite proxies** | `anonymity == elite` | [TXT](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/anonymity/elite/elite-proxies.txt) | [JSON](https://raw.githubusercontent.com/cyberh4ck3r/free-proxy-list/main/proxies/checked/anonymity/elite/elite-proxies.json) |


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
