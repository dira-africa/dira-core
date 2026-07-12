<div align="center">

# dira-core

**The Dira Africa Telegram Mini App**

Farmers and Data Agents capture climate observations and redeem rewards — all inside Telegram, with no wallet or crypto knowledge required.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-0A6E56.svg)](../LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-1A1A6E.svg)](https://nextjs.org)
[![Telegram Mini App](https://img.shields.io/badge/Telegram-Mini_App-0A6E56.svg)](https://core.telegram.org/bots/webapps)

</div>

---

## Overview

`dira-core` is the frontend for the [Dira Africa](https://github.com/dira-africa) platform — a decentralized climate-data verification network for African smallholder agriculture. It is a **Telegram Mini App** built with Next.js: farmers use it to submit geo-tagged crop photos and receive AI-generated health reports, and Data Agents use it to sync barometric-pressure readings and earn Climate Tokens. Tokens are redeemable for mobile money, airtime, farm-input vouchers, or Dira Circle community cash.

Identity comes from Telegram, and all blockchain activity happens server-side in [`dira-api`](https://github.com/dira-africa/dira-api). This is a **custodial** app: there is no on-chain wallet, no seed phrase, and no key management in the client. The experience is pure Web2.

## Features

- 📲 **Telegram-native onboarding** — sign in with Telegram; role-based flows for farmers and Data Agents.
- 📸 **Guided data capture** — camera capture, crop selection, automatic geolocation, and device-sensor (barometer) readings.
- 📊 **Reports & dashboards** — AI crop-health reports, historical submissions, and maps.
- 💚 **Custodial wallet** — Climate Token balance and one-tap redemption (mobile money, airtime, vouchers, community pool).
- 🌍 **Bilingual** — full English and Swahili support.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Telegram | `@twa-dev/sdk` (Telegram Web App SDK) |
| Maps & charts | Leaflet, Chart.js |
| Styling | Tailwind CSS — primary teal `#0A6E56`, secondary midnight `#1A1A6E` |
| Backend | [`dira-api`](https://github.com/dira-africa/dira-api) over HTTPS |

## Project structure

```
app/
  (auth)/onboarding/   Role, language, and profile onboarding
  (farmer)/            Farmer home, submit (capture → details → upload), reports
  (agent)/             Agent home and settings
  (shared)/            Home, wallet + redemption, public dashboard, privacy
  admin/               Admin views
components/             UI components (SubmitCapture, FarmerDashboard, TelegramProvider, …)
lib/
  api-client.ts        Typed calls to dira-api
  auth.ts              Telegram identity handling
  sensors/barometer.ts Device pressure capture
  i18n/                English + Swahili translations
```

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A running [`dira-api`](https://github.com/dira-africa/dira-api) instance (local or deployed)
- A Telegram bot from [@BotFather](https://t.me/BotFather) with a Mini App configured

### Install & run

```bash
npm install
cp .env.local.example .env.local   # then fill in the values below
npm run dev
```

### Environment

Configure `.env.local`. Only `NEXT_PUBLIC_` values are exposed to the browser — **never place a secret in a `NEXT_PUBLIC_` variable.**

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_FASTIFY_API_URL` | Yes | Base URL of the dira-api backend |
| `NEXT_PUBLIC_TELEGRAM_BOT_NAME` | Yes | Your Telegram bot username |
| `NEXT_PUBLIC_ENVIRONMENT` | Yes | `development` \| `production` |

> Telegram Mini Apps must be served over **HTTPS**. For local testing, tunnel your dev server (e.g. with a secure tunnel) and set that HTTPS URL as the Mini App URL in BotFather.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint the codebase |

## Deployment

Deploy behind HTTPS (the project team uses Coolify on Hetzner) and register the public URL as the Mini App URL in BotFather. Set the environment variables above in your host's configuration.

## Contributing

Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) and our [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md). Keep every user-facing string in both English and Swahili.

## Project status

Active development, testnet-first. The wallet and redemption flows are being wired to the Hedera-backed [`dira-api`](https://github.com/dira-africa/dira-api) endpoints.

## License

## Community and support

| Channel | Purpose |
|---|---|
| [GitHub Issues](https://github.com/dira-africa/dira-core/issues) | Bug reports and feature requests |
| [GitHub Discussions](https://github.com/dira-africa/dira-core/discussions) | Architecture questions and ideas |
| community@diraafrica.org | General inquiries |
| security@diraafrica.org | Security vulnerabilities (private) |
| conduct@dira.africa | Code of Conduct reports (private) |

---

## Related repositories

* **[`dira-core`](https://github.com/dira-africa/dira-core)** — Telegram Mini App frontend. Next.js 14 App Router + @twa-dev/sdk. Onboarding, capture (with device barometer), reports, wallet/redeem, maps, dashboards, English/Swahili.
* **[`dira-api`](https://github.com/dira-africa/dira-api)** — the backend. Fastify + TypeScript, raw SQL migrations via pg, BullMQ + Redis, Zod env, pgcrypto PII. Services cover AI verification, triangulation, tokens (internal ledger), airtime, Dira Circle, vouchers, B2B/partner, DPA and the public dashboard. Anchoring via Hedera HCS/HTS; cash-out via Pretium mobile money.
* **[`dira-docs`](https://github.com/dira-africa/dira-docs)** — docs & evidence room. Architecture, OpenAPI, reviewer guide. Hedera-native.

---

## Licence

Apache 2.0 — see [LICENSE](LICENSE).

*Dira Africa Limited, 2026.*
