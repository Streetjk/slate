# Stage Report

Stage: Campaign 7 — Perth Calendar, Weather, and Google News
Date: 2026-09-01 (Australia/Perth)
Status: PASS — software implementation complete; deployment and physical validation not performed

## Repository State

Repository: `Streetjk/slate`
Branch: `feature/perth-calendar-weather-google-news`
Base SHA: `2d4a2a9e9a380c591c2ac7f0f3120f1f7939b65d` (`origin/integration/note4-custom`)
Head SHA: `fb45b794baf02b0ad8b367755a83a25c4af29308` (reviewed implementation candidate; report commit follows)
Upstream SHA: not changed by this feature branch
Pull request: #1, draft, base `integration/note4-custom`

## Harness

Codex version: `codex-cli 0.152.0`
AGY version: `1.1.23`
AGY model: `gemini-3.7-flash-medium`
AGY authentication: OAuth via the official AGY CLI; no model API key used
Orchestration mode: Codex primary controller; AGY read-only reviewer

## Objective

Add an isolated backend/shared/frontend feature set for an English Perth calendar, versioned Western Australian public holidays, global weather with a working Perth path, and a dedicated AU/Taiwan Google News tile. Campaign 6D firmware, refresh timing, controller configuration, and flash state were out of scope.

## Work Completed

- Changed daily and month calendar presentation to English with `en-AU`/`Australia/Perth` defaults and deterministic UTC-to-Perth boundary coverage. The renderer no longer displays lunar, Ganzhi, solar-term, traditional-festival, 宜/忌, or Chinese relative-day content.
- Added versioned WA public-holiday data for confirmed 2026 and 2027 Perth dates, including Anzac, Christmas, and Boxing Day observed dates. Unknown years return no fabricated holidays.
- Preserved the existing Outlook path and its read-only Graph/AI isolation. No Outlook provider or assistant tool was exposed by this PR.
- Diagnosed the weather limitation as structural: the prior path accepted only QWeather, forced China-specific lookup/language parameters, and required deployment QWeather host/key configuration. Added fixed-endpoint Open-Meteo geocoding and forecast support with Celsius, km/h, hPa, metric precipitation, English WMO descriptions, Perth coordinates/timezone, bounded cache, timeout, and reuse behavior. Historical configs without a provider continue to default to QWeather; new frontend defaults select Open-Meteo.
- Added first-class `google_news` configuration/provider/renderer with `au`, `tw`, and `both` editions. Feeds are fixed Google News RSS routes; parser input is bounded, entity declarations are rejected, links are restricted to `news.google.com`, items are deduplicated/capped, and only headline/source metadata is rendered. No article bodies or Gemini summarization are used.
- Added frontend editor controls for global weather selection and Google News edition selection.

Live source probes during implementation returned data from:

- Australia feed: `https://news.google.com/rss?hl=en-AU&gl=AU&ceid=AU:en` (107,472 bytes)
- Taiwan Traditional Chinese feed: `https://news.google.com/rss?hl=zh-TW&gl=TW&ceid=TW:zh-Hant` (107,131 bytes)
- Open-Meteo forecast: `https://api.open-meteo.com/v1/forecast`
- Open-Meteo geocoding: `https://geocoding-api.open-meteo.com/v1/search`

WA holiday source: [Western Australian Government public holidays](https://www.wa.gov.au/service/employment/workplace-arrangements/public-holidays-western-australia), source-as-of `2026-05-25`. Included years: 2026 and 2027 only.

## Files Changed

Backend: dynamic registry/module/policies, English calendar provider/renderers, WA holiday module and tests, Open-Meteo/QWeather weather provider and tests, Google News provider/definition/renderer/tests, and weather city search controller.

Frontend/shared: dynamic type/config schemas, default configuration, type metadata/display names, weather city selection/editor, and Google News editor.

Firmware: none. No Campaign 6D source, artifact, timing data, or flash state was changed.

## Architecture Decisions

- Kept the existing dynamic-content registry, provider lifecycle, cache/reuse policy, 400x300 1bpp rendering pipeline, and frontend editor architecture.
- Kept provider-specific response shapes inside provider modules. `google_news` is separate from `hot_list` so feed, locale, cache, and safety behavior remain explicit.
- Kept Outlook as a separate read-only provider path. Google News has no user-supplied URL and no AI/tool dependency.
- Kept old QWeather configurations compatible while making new global/Perth frontend weather configuration Open-Meteo-based.
- Kept WA holiday data deterministic and versioned rather than scraping the government page on each render.
- No new external package or credential was introduced.

## Tests

Commands executed:

- `bun run --cwd backend test` — PASS; **283 passed, 0 failed**, 868 assertions across 75 files.
- `bun run typecheck` — PASS; frontend and backend TypeScript checks passed.
- `bun run lint` — PASS; frontend and backend ESLint passed with zero warnings.
- `bun run format:check` — PASS; all Prettier checks passed.
- `bun run --cwd frontend build` — PASS; Vite transformed 2,170 modules and produced the production bundle.
- `git diff --check` — PASS.
- Targeted calendar/holiday/weather/news tests — PASS; 9 tests and 14 assertions before the final full regression, with the final full regression above including all added tests.
- Live source probes — PASS for both Google News feeds and both Open-Meteo endpoints; these are evidence probes, not CI dependencies.
- Firmware isolation check — PASS; no changed or untracked file under `firmware/`, so an ESP-IDF build was not required for this backend/shared/frontend-only PR.

## AGY Review

Reviewer model: `gemini-3.7-flash-medium`
Effort level: medium
Review protocol: read-only; no tracked-file changes, commit, push, or merge by AGY

First review verdict: `REVISE`.

Accepted findings:

- P1, `backend/src/modules/dynamic-content/wa-public-holidays.ts`: the confirmed 2027 schedule required `2027-12-27` Christmas Day observed in addition to the Boxing Day observed date. Added the date and full-list regression coverage.
- P2, `frontend/src/features/dynamic/components/config/WeatherConfig.tsx`: offline/local city fallback could revert an active Open-Meteo configuration to QWeather. The selection now preserves the active provider.

Deferred non-blocking observation:

- P3: `CalendarDataService` still computes legacy lunar/Ganzhi/solar-term fields for API compatibility even though the English renderer does not display them. No user-visible regression or schema migration was justified for this PR.

Re-review verdict: `PASS` with no P0/P1/P2 findings and informational P3 observations only. The re-review explicitly confirmed both corrections, calendar timezone behavior, Outlook isolation, fixed weather/news endpoints, renderer bounds, test status, dependency status, and firmware isolation.

## Security Checks

OAuth-only requirement: PASS; no new AI/API credential path was introduced.
Static AI API keys found in the feature diff: NONE.
Outlook read-only: PRESERVED; no write endpoint or broader Graph capability added.
Outlook exposed to Gemini: NO; existing isolation tests remain passing and this PR adds no Outlook dependency to the assistant.
Google Calendar confirmation gate: UNCHANGED; this PR does not alter the write path.
News URL safety: fixed Google News host/feed routes only; no arbitrary URL configuration, article scraping, or Gemini summarization.
Secrets detected in changed diff/report: NONE.
Dependency/license impact: no new dependency; no copied external implementation.

## Known Issues

- Live Microsoft/Google OAuth consent, live Gemini ADC account behavior, physical NOTE4 display validation, and real-device presentation checks remain human-boundary work from earlier campaigns.
- Google News and Open-Meteo live availability can change; provider timeout, bounded cache, and central last-good reuse behavior remain in place.
- Campaign 6D D1 physical measurements and optimized firmware flash remain intentionally untouched and pending their own authorization/review boundary.
- Orange Pi production deployment was not performed.

## Deviations

- The campaign requested Claude Sonnet 5 as an optional bounded worker. No worker was needed; Codex performed the bounded implementation and AGY performed the required independent review.
- A full ESP-IDF build was not rerun because the feature diff contains no firmware changes, as permitted by the Campaign 7 instructions.

## Next Recommended Stage

Human PR review of PR #1. After separately authorized deployment, run the NOTE4 physical checklist for English Perth daily/month calendar, Outlook 24-hour Perth times, Perth weather, and Google News AU/TW/Both. Do not deploy or merge to `integration/note4-custom` automatically from this report.

## Final Stage Verdict

READY FOR HUMAN PR REVIEW; NOT DEPLOYED

