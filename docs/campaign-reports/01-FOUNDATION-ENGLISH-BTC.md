# Stage Report

Stage: Campaign 1 — Foundation + English + BTC
Date: 2026-09-01
Status: PASS

## Repository State

Repository: https://github.com/Streetjk/slate
Branch: `integration/note4-custom`
Start SHA: `169dd595fedbc3a0958ab3e41a435305449b0902`
BTC stage base SHA: `ee9d02be5c7774c7781ccaae216798f71f929c48`
Head SHA: `2011ac2c88fcf8c53d12ade1a53269c27b72ee70`
Upstream SHA: `cf5b4ffb0b3db09cb44c058b425b77c4fa58d21e`

Commits:

- `48a50f2` — `feat(ui): localize Slate interfaces in English`
- `8ee34cf` — `test(ui): cover English dynamic status text`
- `eb3c9db` — `merge: integrate English UI`
- `5e60055` — `docs(campaign): advance to BTC stage`
- `ee9d02b` — `docs(campaign): start BTC stage`
- `c4284f4` — `feat(market): add BTC/USD dynamic content`
- `40b3e5a` — `test(market): cover BTC normalization and rendering`
- `db58f88` — `fix(market): bound BTC windows and dates`
- `2011ac2` — `merge: integrate BTC/USD dynamic content`

## Harness

Codex version: `codex-cli 0.147.0`
AGY version: `1.1.22`
AGY model: `gemini-3.7-flash-medium` for BTC review/re-review; `gemini-3.7-flash-high` for BTC architecture research
AGY authentication: OAuth through the official AGY CLI; no model API key used
Orchestration mode: `CODEX_PRIMARY`

## Objective

Complete Campaign 1 foundation work: retain the shared normalized contracts, deliver the English interface, and add cached BTC/USD current, daily, weekly, and monthly dynamic content without replacing Slate’s NOTE4 hardware, rendering, synchronization, or power-management systems.

## Work Completed

- Preserved and carried forward the shared `PriceSeries` and `PricePoint` contracts from Campaign 1A.
- Added the `btc_price` dynamic configuration with validated `daily`, `weekly`, and `monthly` periods and a configurable refresh interval with a five-minute minimum.
- Added a backend provider using Coinbase’s public unauthenticated spot and Exchange candle endpoints. No market-data credential was introduced.
- Normalized spot/candle payloads into `PriceSeries`, filtering malformed values, deduplicating timestamps, sorting chronologically, calculating movement, and bounding periods to 24 hours/7 days/30 days.
- Reused `CachedInflightFetcher` for per-period caching and concurrent-request deduplication. Provider failures fall back to a matching previously stored series.
- Added a monochrome 400×300 renderer with current price, period badge, movement percentage, chart, and explicit UTC/English date-range formatting.
- Registered the provider and definition in Slate’s existing dynamic-content registry/module and refresh/reuse policies.
- Added English Web UI metadata and configuration controls for Daily (1D), Weekly (7D), Monthly (30D), and refresh interval. NOTE4’s existing frame/button cycling remains the local switching mechanism when the three period frames are configured in a group.
- Campaign 1 English UI work remains documented in the separate `01-ENGLISH-UI.md`; this report records the combined campaign promotion after BTC integration.

## Files Changed

- `shared/src/dynamic/config.ts` — added the `btc_price` configuration and dynamic type.
- `backend/src/modules/dynamic-content/providers/btc-price.provider.ts` — public market-data fetch, normalization, cache, and fallback.
- `backend/src/modules/dynamic-content/providers/btc-price.provider.test.ts` — malformed data, cache, period URL, bounds, fallback, and price validation tests.
- `backend/src/modules/dynamic-content/rendering/btc-price-frame-renderer.ts` — 1bpp BTC price/chart renderer and bounded chart/date helpers.
- `backend/src/modules/dynamic-content/rendering/btc-price-frame-renderer.test.ts` — chart-boundary and formatting tests.
- `backend/src/modules/dynamic-content/dynamic-content-registry.ts`, `dynamic-content.module.ts`, `dynamic-refresh-policy.ts`, `dynamic-data-reuse-policy.ts` — existing provider lifecycle integration.
- `backend/src/modules/dynamic-content/rendering/dynamic-frame-renderer.service.ts` and its test — renderer registration and 400×300 regression coverage.
- `frontend/src/features/dynamic/components/config/BtcPriceConfig.tsx` and `DynamicContentFields.tsx` — period and refresh controls.
- `frontend/src/features/dynamic/model/{config-types,default-config,display-name,type-meta}.ts` — frontend config typing and English metadata.
- `backend/src/modules/dynamic-content/status-text/dynamic-content-status-text.ts` — English BTC status label.

## Architecture Decisions

- BTC uses the existing backend dynamic provider/cache/renderer/sync path; firmware low-level display, audio, Wi-Fi, sleep/wake, and button code were not rewritten.
- The provider is public-data-only and uses fixed official public URLs, the shared public-network URL guard, timeout handling, and no API key.
- Each period is a validated dynamic-content configuration. Configuring three frames in a NOTE4 group lets the existing local frame/button navigation switch among cached D/W/M images without a network request per button press.
- Coinbase candle windows use explicit start/end bounds and defensive point caps of 288 five-minute, 168 hourly, and 30 daily points. Renderer date labels use `en-AU` with UTC explicitly, avoiding host locale/timezone drift.
- Provider-specific Coinbase response shapes do not leave the provider module; the rest of Slate receives only the shared `PriceSeries` representation.

## Tests

Commands executed from `/Users/ollama/slate`:

- `bun test backend/src/modules/dynamic-content/providers/btc-price.provider.test.ts backend/src/modules/dynamic-content/rendering/btc-price-frame-renderer.test.ts` — PASS; 7 tests, 0 failures, 31 expectations after review corrections.
- `bun run format:check` — PASS; all matched files use Prettier style.
- `bun run typecheck` — PASS; frontend and backend TypeScript checks completed.
- `bun run lint` — PASS; frontend and backend ESLint completed with zero warnings.
- `bun run --cwd frontend build` — PASS; Vite transformed 2,167 modules.
- `bun run --cwd backend test` — PASS; 213 tests, 0 failures, 712 expectations across 55 files.
- `source /Users/ollama/esp-idf-v5.5.2/export.sh` with `IDF_TOOLS_PATH=/Users/ollama/.espressif-note4`, then `idf.py -C firmware build` — PASS; ESP-IDF `v5.5.2`, target `esp32s3`, `slate.bin` size `0x266120`, 40% app partition free.
- `idf.py -C firmware merge-bin -o slate-full.bin` — PASS; `firmware/build/slate-full.bin` generated, size `0x276120`.
- `cp firmware/build/slate.bin firmware/build/slate-ota.bin` — PASS; OTA artifact generated.
- Firmware artifact SHA-256: `slate-full.bin` `0f01652a1c9e56ca4ce06b8c64539cfdabedefacee8e81f59591a94a13954f50`; `slate-ota.bin` `ab8bc15d04eec7fd088c09dfe807fa37e2401752187642efe285524cac3770ec`.
- `git diff --check` — PASS; no whitespace errors.
- Secret-pattern scan over tracked additions/diff — PASS; no credential values, tokens, cookies, private keys, or authorization headers introduced. Report text contains policy terms only.

## AGY Review

Reviewer model: `gemini-3.7-flash-medium`; architecture research: `gemini-3.7-flash-high`
Effort level: medium review/re-review; high architecture research
Verdict: PASS

P0 findings: NONE

P1 findings: NONE

P2 findings: NONE

P3 findings:

- Initial medium review returned PASS with a P3 about environment-dependent date formatting in `backend/src/modules/dynamic-content/rendering/btc-price-frame-renderer.ts:119`. Accepted and fixed with explicit `getDateTimeFormat('en-AU', { timeZone: 'UTC' })` formatting.
- Initial medium review returned PASS with a P3 about Coinbase monthly candles potentially exceeding 30 days in `backend/src/modules/dynamic-content/providers/btc-price.provider.ts:59`. Accepted and fixed with explicit period windows plus defensive caps; regression coverage was added.
- Re-review of `db58f88` returned `PASS` with P0/P1/P2/P3 all `NONE`.

Findings accepted:

- Both P3 observations were valid hardening improvements. They were fixed in `db58f88`, covered by focused tests, and verified by AGY re-review.

Findings rejected:

- None.

## Security Checks

OAuth-only requirement: Satisfied for AI harness; BTC endpoint is public and unauthenticated by design.
Static AI API keys found: NONE introduced or used. Existing unrelated legacy configuration names were not reused.
Outlook read-only: Not applicable; Outlook is not implemented in this campaign.
Outlook exposed to Gemini: No BTC code or tool path introduces Outlook access.
Google Calendar confirmation gate: Not applicable; Google Calendar is not implemented in this campaign.
Secrets detected: NONE.

## Known Issues

- GitHub Actions workflow registration remains infrastructure debt from Phase 0; the exact local ESP-IDF v5.5.2 path passed this unchanged-firmware regression.
- Docker fallback pull for `espressif/idf:v5.5.2` could not register a layer because Docker Desktop reported `no space left on device`; no Docker prune or unrelated deletion was performed.
- Live Coinbase availability is not a CI dependency; provider tests use deterministic mocks. Live market-data smoke testing remains separate from this software gate.
- Physical NOTE4 display/button behavior is not claimed as tested; existing firmware build and source integration are the automated boundary.

## Deviations

- The requested combined Campaign 1 report is published after the already-pushed standalone English UI report, preserving the earlier audit checkpoint rather than overwriting it.
- Firmware was rebuilt with the exact existing local ESP-IDF v5.5.2 environment because GitHub Actions remains unregistered and Docker could not complete. BTC made no firmware source changes.

## Next Recommended Stage

Begin Campaign 2 — Outlook read-only calendar: first obtain current official Microsoft OAuth/MSAL/Graph requirements through AGY high-effort research, then implement user-owned read-only provider and security-boundary tests.

## Final Stage Verdict

READY
