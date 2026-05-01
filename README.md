# dira-core

**Telegram Mini App — Dira Climate Verification Infrastructure**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Built with Next.js](https://img.shields.io/badge/Built_with-Next.js_14-black)](https://nextjs.org)
[![Midnight Mainnet](https://img.shields.io/badge/Midnight-Mainnet-1A1A6E)](https://midnight.network)
[![Open Source](https://img.shields.io/badge/Open_Source-Apache_2.0-green)](LICENSE)

> *Your data earns your airtime. Your data grows your crops. Your data builds your safety net.*

---

## What Is Dira?

Dira (دائرة — Arabic for "circle") is a Decentralised Physical Infrastructure Network (DePIN) that turns the existing smartphone network into the most granular agricultural weather sensing layer in Sub-Saharan Africa.

**The three problems Dira solves:**

| Problem | Dira's Answer |
|---|---|
| **Basis Risk** — satellite weather data resolves to 3–5 km squares; a farm in drought can sit next to a satellite-reported rain zone | Sub-100-metre atmospheric data from the human sensor network, ZK-verified on Midnight |
| **Trust Gap** — less than 3% of smallholder farmers have ever successfully claimed an agricultural insurance payout | Circular economy: airtime rewards on Day 1, farm input vouchers in Month 1, Dira Circle cash pools in Month 2 |
| **Liquidity Gap** — farmers cannot afford upfront premiums; insurers cannot price risk without historical micro-climate data | Climate Tokens earned through verified data contributions, redeemable immediately for real goods |

---

## This Repository

`dira-core` is the **Telegram Mini App** — the user-facing frontend. It runs inside Telegram's WebView and is the interface through which farmers submit geo-tagged crop photos and Data Agents sync barometric pressure readings.

**Tech stack:**
- Next.js 14 (App Router, TypeScript)
- Telegram Web App SDK (`@twa-dev/sdk`)
- Tailwind CSS (teal primary `#0A6E56`, navy Midnight accent `#1A1A6E`)
- Leaflet.js (coverage maps)
- i18n: English + Swahili

---

## Repository Structure

```
dira-core/
├── app/
│   ├── (auth)/              # Telegram auth + onboarding
│   ├── (farmer)/            # Farmer module: crop photos, health reports
│   ├── (agent)/             # Data Agent module: barometric sync, leaderboard
│   └── (shared)/            # Wallet, settings, notifications
├── components/
│   ├── ui/                  # Base UI primitives
│   ├── wallet/              # Four-layer circular economy wallet UI
│   └── maps/                # Leaflet coverage and farm maps
├── lib/
│   ├── api/                 # Typed API client (connects to dira-api)
│   ├── i18n/                # English and Swahili translation files
│   ├── sensors/             # Barometric sensor and GPS utilities
│   └── types/               # Shared TypeScript types
└── public/
    └── assets/              # Icons, illustrations
```

---

## The Circular Economy Wallet

The wallet implements four redemption layers. Each layer has independent infrastructure — no single layer's failure affects the others:

| Layer | Rate | Infrastructure Required | Available |
|---|---|---|---|
| ⚡ **Airtime** | 1 token = KES 0.55 | Africa's Talking API | Day 1 |
| 🌱 **Farm Inputs** | Token QR voucher | Agro-dealer MOU + weekly bank transfer | Month 1 |
| 👥 **Dira Circle** | 1 token = KES 0.50 (monthly pool) | One transfer per county per month | Month 2 |
| 📱 **M-Pesa B2C** | 1 token = KES 0.50 | Daraja production credentials + float | Month 3–4 |

The `DARAJA_PRODUCTION_ACTIVE` environment variable controls M-Pesa B2C activation. It defaults to `false`. Set it to `true` only when both Daraja production credentials are approved **and** first B2B API revenue has been received.

---

## Local Development

### Prerequisites

```bash
node --version  # 20 LTS required
npm --version   # 9+
```

### Setup

```bash
git clone https://github.com/dira-africa/dira-core.git
cd dira-core
npm install
cp .env.local.example .env.local
# Fill in your values in .env.local
npm run dev
```

The app runs at `http://localhost:3000`.

To test inside Telegram, use [ngrok](https://ngrok.com) to expose your local port and set the Mini App URL in BotFather to the ngrok URL.

### Environment Variables

Copy `.env.local.example` and fill in values:

```bash
# Telegram
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=DiraBot

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Feature flags (circular economy)
NEXT_PUBLIC_VOUCHERS_ACTIVE=false
NEXT_PUBLIC_DIRA_CIRCLE_ACTIVE=false
NEXT_PUBLIC_DARAJA_ACTIVE=false
```

> **Never** prefix secret values with `NEXT_PUBLIC_` — anything with that prefix is bundled into the JavaScript served to every user's browser.

---

## Language Support

The app supports English and Swahili from day one. Translation files live at `lib/i18n/en.ts` and `lib/i18n/sw.ts`. If you find a missing translation or an error in the Swahili, please open an issue or submit a pull request — community corrections are welcome.

---

## Contributing

We welcome contributions from developers, agricultural scientists, and Swahili translators.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: describe your change'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting. All contributions are accepted under the Apache 2.0 license.

---

## Related Repositories

| Repository | Contents |
|---|---|
| [dira-api](https://github.com/dira-africa/dira-api) | Fastify backend API, AI verification engine, token ledger |
| [dira-docs](https://github.com/dira-africa/dira-docs) | OpenAPI specifications, API documentation, impact reports |
| [dira-contracts](https://github.com/dira-africa/dira-contracts) | Compact smart contracts for Midnight blockchain |

---

## License

Copyright 2025 Dira Africa

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for the full text.

The code is a gift to the world. The data, verified on Midnight, is the moat.

---

