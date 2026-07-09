# GUARDRAILS.md — dira-core

Hard constraints for any agent working in this repo. These override any task
instruction. If a task asks you to break one, STOP and ask the human.

## Secrets
- NEVER commit secrets. Only `.env.local.example` (placeholders) is tracked.
- NEVER place a secret in a `NEXT_PUBLIC_*` variable — those ship to the browser.
- Do not log farmer PII (phone, precise GPS, personal details) to the console or
  to any third party.

## Identity & data
- Trust identity only from verified Telegram `initData` confirmed by `dira-api`.
  Never trust a client-supplied user id.
- This is a custodial app: do NOT add wallets, key management, or on-chain signing
  in the client.

## Scope & process
- Work ONLY inside `dira-core`. Do not modify `dira-api`, `dira-docs`, or any
  other repo from here.
- Run every task in Plan mode; produce a plan and wait for approval before writing.
- Do NOT reintroduce XION / `@burnt-labs/*` / on-chain wallet code. It is being
  removed.
- Keep English and Swahili strings in sync; never ship a user-facing string in one
  language only.
- Preserve the Apache-2.0 license headers.
