# dira-core

**Dira — Climate Data, Verified on XION & zkVerify. Rewards Paid in Airtime.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-teal.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![XION](https://img.shields.io/badge/XION-Mainnet-orange.svg)](https://xion.burnt.com/)
[![zkVerify](https://img.shields.io/badge/zkVerify-Mainnet-purple.svg)](https://zkverify.io/)
[![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

The Telegram Mini App for the Dira platform. Farmers use it to submit geo-tagged crop photos and receive AI-generated health reports. Data Agents use it to sync barometric pressure readings and earn Climate Tokens. Tokens are redeemable for mobile airtime, farm input vouchers, Dira Circle community cash, or M-Pesa.

**Open to the world. Built for Kenya. Verified on XION & zkVerify.**

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

### Testing as a Telegram Mini App

To test inside the Telegram app:
1. Expose your localhost server using a tunneling service (e.g., ngrok or Cloudflare Tunnels):
   ```bash
   ngrok http 3000
   ```
2. Create a test bot using Telegram's BotFather.
3. Configure the bot's Menu Button or WebApp link to point to your secure HTTPS tunnel URL.
4. Launch the WebApp inside Telegram!

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
| `NEXT_PUBLIC_XION_TREASURY_CONTRACT_ADDRESS` | Yes | Treasury Contract Address deployed on the XION Developer Portal |
| `NEXT_PUBLIC_XION_RPC_URL` | No | XION network RPC endpoint (`https://rpc.xion-testnet-2.burnt.com:443` in development) |

**Never set `NEXT_PUBLIC_DARAJA_ACTIVE=true` in development.** This flag controls whether the M-Pesa redemption UI is shown to real users. It defaults to `false` and is activated only through a documented production process.

### XION Treasury Contract Setup

To enable gasless user transactions sponsored by the Dira platform, you must configure a Treasury Contract:
1. **Developer Portal:** Log in or create an account at the [XION Developer Portal](https://app.dev.testnet.burnt.com).
2. **Deploy Treasury:** Create a new Treasury contract and configure a Fee Grant using the `/cosmwasm.feegrant.v1beta1.BasicAllowance` option.
3. **Redirect URL:** Set the OAuth Redirect URL to `https://app.diraafrica.org` (for production) or `http://localhost:3000` (for local development).
4. **Gas Sponsorship:** Fund the newly deployed Treasury Contract address with XION to cover user transaction fee grants.
5. **Configuration:** Copy the Treasury contract address and save it to `NEXT_PUBLIC_XION_TREASURY_CONTRACT_ADDRESS` in `.env.local`.

---

## Deployment

Deployed via Coolify on Hetzner at `https://app.diraafrica.org`. Auto-deploys on push to `main`. See [`dira-docs`](https://github.com/dira-africa/dira-docs) for the full deployment guide.

---

## Contributing

We welcome contributions. Before you start, please read:

- **[CONTRIBUTING.md](CONTRIBUTING.md)** — how to set up your environment, branch strategy, commit standards, PR process, code standards, security checklist, and testing requirements
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — how we treat each other in this community

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

* **[`dira-core`](https://github.com/dira-africa/dira-core)** — Telegram Mini App frontend. Next.js 14 App Router + @twa-dev/sdk. Onboarding, capture (with device barometer), reports, wallet/redeem, maps, dashboards, English/Swahili. Carries XION account abstraction to remove.
* **[`dira-api`](https://github.com/dira-africa/dira-api)** — the backend. Fastify + TypeScript, raw SQL migrations via pg, BullMQ + Redis, Zod env, pgcrypto PII. Services already cover AI verification, triangulation, tokens (internal ledger), airtime, Dira Circle, vouchers, B2B/partner, DPA and the public dashboard. Anchoring is zkVerify + XION and cash-out is Daraja M-Pesa — those are the parts we replace (Hedera for anchoring, Pretium for cash-out).
* **[`dira-docs`](https://github.com/dira-africa/dira-docs)** — docs & evidence room. Architecture, OpenAPI, reviewer guide. Currently XION/zkVerify-themed; rewritten to Hedera in P3.4.
* **`dira-contracts`** — DELETED. Held a CosmWasm/XION contract and a zkVerify circom circuit. Removed entirely in P0.2 (along with the Midnight .compact files inside dira-api) so there are no mix-ups.

---

## Licence

Apache 2.0 — see [LICENSE](LICENSE).

*Dira Africa Limited, 2026.*
