# Security

## supported versions

| Version | Supported |
|---|---|
| `main` | yes |

only the `main` branch with the latest proxy lists and health-check is supported.

## reporting a vulnerability

if you find a security issue (e.g. dependency vulnerability, proxy injection, workflow secret leak):

- **do not** open a public issue
- open a private report via **GitHub Security -> Report a vulnerability** or contact the maintainer via GitHub profile

you will get a response within 7 days. please include:

- description and impact
- steps to reproduce
- affected file / dependency

## scope

this repo only aggregates public proxy lists. it does not host or operate proxies. do not send sensitive data through these proxies.

## dependencies

- Node 24, `undici`, `https-proxy-agent`, `socks-proxy-agent`
- run `npm audit` locally before reporting a dependency issue
