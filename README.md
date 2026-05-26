# dira-core

**Dira — Climate Data, Verified on Midnight. Rewards Paid in Airtime.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-teal.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Midnight](https://img.shields.io/badge/Midnight-Mainnet-1A1A6E.svg)](https://midnight.network/)
[![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

The Telegram Mini App for the Dira platform. Farmers use it to submit geo-tagged crop photos and receive AI-generated health reports. Data Agents use it to sync barometric pressure readings and earn Climate Tokens. Tokens are redeemable for mobile airtime, farm input vouchers, Dira Circle community cash, or M-Pesa.

**Open to the world. Built for Kenya. Verified on Midnight.**

---

## What this repository contains

| Path | Purpose |
|---|---|
| `/app/(farmer)/` | Farmer module — crop photo capture, health reports, submission history |
| `/app/(agent)/` | Data Agent module — barometric sync, coverage map, leaderboard |
| `/app/(shared)/` | Shared — wallet, four-layer redemption UI, settings |
| `/app/onboarding/` | New user onboarding — language, role, farm/agent profile |
| `/components/` | Reusable UI components |
| `/lib/api/` | Typed API client for dira-api |
| `/lib/i18n/` | English and Swahili translation strings |
| `/lib/sensors/` | Barometric and GPS sensor utilities |

---

## Tech stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Hosting:** Deployed as a Telegram Mini App — opens inside the Telegram WebView via [@DiraBot](https://t.me/DiraBot)
- **Styling:** Tailwind CSS — primary teal `#0A6E56`, secondary midnight `#1A1A6E`
- **Maps:** Leaflet.js — coverage map and farm GPS location
- **Auth:** Telegram Web App SDK — HMAC-SHA256 verified `initData`, no username/password
- **Payments (Layer 1):** Africa's Talking — airtime disbursement from Day 1
- **Payments (Layer 2):** Farm input voucher QR codes — redeemable at agro-dealer partners
- **Payments (Layer 3):** Dira Circle — county-level community cash pool
- **Payments (Layer 4):** Safaricom Daraja B2C — M-Pesa (flag-gated, activates Month 3–4)
- **Storage:** Cloudflare R2 — crop photos uploaded directly from the client (pre-signed URLs)

---

## Quick start

### Prerequisites

- Node.js ≥ 20.x
- npm ≥ 10.x
- A Telegram account (to test the Mini App flow)

### Install

```bash
git clone https://github.com/dira-africa/dira-core.git
cd dira-core
npm install
cp .env.local.example .env.local
# Fill in your values — see .env.local.example for descriptions
```

### Run locally

```bash
npm run dev
# App runs on http://localhost:3000
```

### Type check

```bash
npx tsc --noEmit
# Must pass with zero errors before any commit
```

### Lint

```bash
npm run lint
```

### Test

```bash
npm test
npm run test:coverage  # with coverage report
```

---

## Environment variables

Copy `.env.local.example` to `.env.local`. All `NEXT_PUBLIC_` variables are safe to expose to the browser. Never put secrets in a `NEXT_PUBLIC_` variable.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | dira-api base URL (`https://api.diraafrica.org` in production) |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Yes | `DiraBot` |
| `NEXT_PUBLIC_VOUCHERS_ACTIVE` | Yes | `false` until first agro-dealer MOU signed |
| `NEXT_PUBLIC_DIRA_CIRCLE_ACTIVE` | Yes | `false` until first county coordinator confirmed |
| `NEXT_PUBLIC_DARAJA_ACTIVE` | Yes | `false` until Daraja production credentials approved AND first B2B revenue received |

**Never set `NEXT_PUBLIC_DARAJA_ACTIVE=true` in development.** This flag controls whether the M-Pesa redemption UI is shown to real users. It defaults to `false` and is activated only through a documented production process.

---

## Deployment

Deployed via Coolify on Hetzner at `https://app.diraafrica.org`. Auto-deploys on push to `main`. See [`dira-docs`](https://github.com/dira-africa/dira-docs) for the full deployment guide.

---

## Contributing

We welcome contributions. Before you start, please read:

- **[CONTRIBUTING.md](CONTRIBUTING.md)** — how to set up your environment, branch strategy, commit standards, PR process, code standards, security checklist, and testing requirements
- **[CODE\_OF\_CONDUCT.md](CODE_OF_CONDUCT.md)** — how we treat each other in this community

For security vulnerabilities, do **not** open a public issue. Email **security@diraafrica.org** instead.

---

## Community and support

| Channel | Purpose |
|---|---|
| [GitHub Issues](https://github.com/dira-africa/dira-core/issues) | Bug reports and feature requests |
| [GitHub Discussions](https://github.com/dira-africa/dira-core/discussions) | Architecture questions and ideas |
| community@diraafrica.org | General inquiries |
| security@diraafrica.org | Security vulnerabilities (private) |
| conduct@diraafrica.org | Code of Conduct reports (private) |

---

## Related repositories

| Repository | Description |
|---|---|
| [`dira-api`](https://github.com/dira-africa/dira-api) | Fastify backend API, AI verification, circular economy services |
| [`dira-docs`](https://github.com/dira-africa/dira-docs) | OpenAPI specs, API documentation, reviewer guide |
| [`dira-contracts`](https://github.com/dira-africa/dira-contracts) | Compact smart contracts for Midnight blockchain |

---

## Licence

Apache 2.0 — see [LICENSE](LICENSE).

*Dira Africa Limited, 2026.*
