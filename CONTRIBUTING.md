# Contributing

## how to contribute

- **new proxy source:** open an issue with URL, sample response and which protocol it provides (`HTTP` / `HTTPS` / `SOCKS4` / `SOCKS5`). PRs should add the source to `SOURCES` in `scripts/fetch-proxies.mjs`.
- **bug fix:** open an issue first, then PR with a clear description.
- **no proxy spam:** do not add private / premium proxies, only public lists.

## development

```bash
npm install
npm run fetch   # scrape raw lists -> http-proxies.txt etc.
npm run check   # health-check (needs proxies) -> proxies/**/*.txt|json|csv
# dry-run with limited proxies:
CHECK_LIMIT=30 npm run check
```

## pull request

- fork -> branch -> PR against `main`
- keep changes small and focused
- update `README.md` if you change download paths
- `npm audit` should pass

## notes

for educational purposes only. this project just aggregates public lists, see `README.md` credits.
