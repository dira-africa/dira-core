# AGENTS.md — dira-core

> Read this before doing anything in this repo. Pair it with `GUARDRAILS.md`.

## What this repo is
`dira-core` is the **Telegram Mini App frontend** for Dira Africa, built with
**Next.js 14 (App Router)** and the Telegram Web App SDK (`@twa-dev/sdk`). Farmers
and Data Agents open it inside Telegram to onboard, capture weather/crop
observations, view reports, and redeem Climate Token rewards. It talks to the
backend (`dira-api`) over HTTP via `lib/api-client.ts`.

## Target architecture (Hedera-native, custodial)
The user experience is pure Web2: identity comes from Telegram, and all
blockchain work happens server-side in `dira-api` on **Hedera (HCS + HTS)**.
Farmers never hold keys, wallets, or seed phrases.

## Migration in progress — remove XION
This app currently ships **XION account abstraction**, which must be removed:
- Remove `@burnt-labs/abstraxion` and `@burnt-labs/ui` from `package.json`.
- Remove `components/XionProvider.tsx` and any `useAbstraxion`/Xion usage.
- Remove `NEXT_PUBLIC_XION_*` from `.env.local.example` and all references.
- KEEP `components/TelegramProvider.tsx` and `@twa-dev/sdk` — Telegram is the
  identity and entry point.
- The **wallet** screens become **custodial**: show the balance and redemption
  options fetched from `dira-api`; there is no on-chain wallet in the client.

## Stack & conventions
- **Framework:** Next.js 14 App Router, React 18, TypeScript. Dev: `npm run dev`.
- **Route groups:** `app/(auth)` onboarding, `app/(farmer)`, `app/(agent)`,
  `app/(shared)` (home, wallet, redeem, public, privacy), `app/admin`.
- **Components:** `components/*` (SubmitCapture, FarmerDashboard, Reports,
  TelegramProvider, AuthGuard, AppInitializer, wallet/*).
- **Libs:** `lib/api-client.ts` (API calls), `lib/auth.ts` (Telegram auth),
  `lib/sync.ts`, `lib/onboarding.ts`, `lib/sensors/barometer.ts` (device pressure
  for weather capture), `lib/i18n/*` (English + Swahili — keep both in sync).
- **UI data:** Leaflet maps, Chart.js dashboards.
- **Env:** only `NEXT_PUBLIC_*` values are exposed to the browser — never put a
  secret in a `NEXT_PUBLIC_` variable. API base URLs live in
  `NEXT_PUBLIC_FASTIFY_API_URL` / `NEXT_PUBLIC_API_URL`.
- **Licensing:** preserve the existing Apache-2.0 headers.

## How to work here
1. Produce a PLAN artifact and wait for human approval before changing code.
2. Stay inside this repo. Never edit `dira-api` or `dira-docs` from here.
3. Verify Telegram identity via the backend — never trust client-side identity.
4. Keep every user-facing string in both English and Swahili (`lib/i18n`).
