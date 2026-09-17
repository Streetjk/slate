# Portfolio post-physical ingestion — C7/C8 repair + C10 AI subscription usage tiles

Date: 2026-09-10 (Australia/Perth)

## Purpose

Consume the single already-authorized combined C7+C8 NOTE4 physical acceptance exactly once, preserve the operator's new observations without inventing unreported PASS values, continue safe C7/C8 diagnosis and repair, and explicitly expand the portfolio with a new isolated Campaign 10 for read-only AI subscription/usage dashboard tiles.

This directive does not authorize another physical NOTE4 cycle, a provider call, firmware flash, production redeployment, OAuth/credential change, billing action, merge, or release.

## Operator evidence to ingest

The operator completed the previously armed physical test cycle and supplied a device photograph.

Record exactly:

```text
COMBINED_PHYSICAL_ACCEPTANCE_CONSUMED=YES
PHYSICAL_ACCEPTANCE_REPEAT_AUTHORIZED=NO
VOICE_INPUT_DISPLAY_SPEED=MUCH_BETTER_OPERATOR_REPORTED
VOICE_INPUT_DISPLAY_FURTHER_OPTIMIZATION_REQUESTED=YES
OUTLOOK_DASHBOARD_CONNECT=FAIL_OPERATOR_REPORTED_LINK_NO_RESPONSE
WEATHER_FORECAST_ICONS=FAIL_OPERATOR_REPORTED_ALL_CLOUD_WITH_QUESTION_MARK
C10_AI_USAGE_TILES_REQUESTED=YES
C10_TILE_TARGETS=CODEX;AGY_GEMINI;GROK
```

The supplied photograph supports only the visible sample, not the entire completed cycle. For that visible sample:

```text
PHOTO_VISIBLE_BUBBLE_ORDER=CORRECT_FOR_VISIBLE_COMPLETED_TURNS
PHOTO_VISIBLE_JAPANESE_GLYPHS=LEGIBLE_FOR_VISIBLE_SAMPLE
PHOTO_VISIBLE_INPUT_ASR_ERRORS=YES
PHOTO_VISIBLE_EN_EXAMPLE=INTENDED_WEEK_QUESTION_DISPLAYED_AS_HOW_MANY_DAYS_ARE_YOU_AWAKE
PHOTO_VISIBLE_JA_EXAMPLE=INTENDED_CAPITAL_QUESTION_DISPLAYED_WITH_INCORRECT_WORDING
PHOTO_VISIBLE_ASSISTANT_FACTUAL_ANSWERS=CORRECT_FOR_SHOWN_WEEK_AND_TOKYO_EXAMPLES
```

Do not infer audible audio, clean final exit, no freeze, full six-turn success, Calendar/Outlook privacy, or all C7 screens from the photograph or from operator silence. Mark unavailable fields UNKNOWN.

## C8 — input display speed optimization

Current code at the accepted combined candidate uses a fixed `TRANSCRIPT_STREAM_DELAY_MS = 100` for both input and output transcript streaming. It also flushes input immediately when provider output/audio begins and at device listen-stop/turn end.

Do not simply set the global delay to zero. The prior progressive-lag/freeze repair depends on bounded/coalesced event behavior.

First consume the sanitized observer/timing evidence from the just-completed physical cycle and mechanically split, where available:

```text
T_DEVICE_LISTEN_START
T_FIRST_DEVICE_AUDIO_SENT
T_BACKEND_FIRST_AUDIO_RECEIVED
T_AUDIO_INPUT_COMMIT_OR_TURN_END
T_PROVIDER_INPUT_TRANSCRIPTION_FIRST_PARTIAL
T_BACKEND_USER_TRANSCRIPT_FLUSH
T_USER_BUBBLE_EVENT_POSTED
T_PROVIDER_SESSION_READY
T_PROVIDER_FIRST_OUTPUT_EVENT
T_PROVIDER_FIRST_AUDIO_EVENT
```

Derive only supported deltas, especially:

```text
DEVICE_AUDIO_TO_FIRST_PROVIDER_PARTIAL_MS=
PROVIDER_PARTIAL_TO_BACKEND_FLUSH_MS=
BACKEND_FLUSH_TO_USER_EVENT_MS=
TURN_END_TO_FIRST_PROVIDER_PARTIAL_MS=
TURN_END_TO_USER_EVENT_MS=
```

If provider/VAD time dominates, say so and do not pretend a UI timer change fixes it.

Evaluate a minimum-footprint adaptive input transcript policy provider-disabled:

1. first non-empty input transcription partial for a logical turn may be emitted immediately or with the smallest scheduler-safe delay;
2. subsequent partial updates update the same logical user bubble and remain bounded/coalesced, initially preserving approximately 75–100 ms minimum spacing unless measurements justify another value;
3. final/turn-boundary flush remains immediate;
4. one logical user turn remains one bubble;
5. stale generations cannot mutate a newer turn;
6. backend WebSocket buffered bytes, backend operation queue, firmware UI event queue and E-Ink redraw pressure must remain bounded;
7. add burst tests proving event count is bounded under many provider partials.

Benchmark at least the current 100 ms policy versus the candidate under deterministic replay. Report first-visible latency improvement and update count, not merely timer constants.

## C8 — bilingual ASR accuracy without unsupported languageCodes

Do not re-add `inputAudioTranscription.languageCodes` for the current Gemini 2.5 Native Audio model.

Audit the current hard-coded session language path. At the accepted combined source, `XiaozhiVoiceSession.ensureLive()` calls `liveService.connect('en', ...)`, and `GeminiLiveService` appends `Preferred language: ${language}.` to a system instruction that otherwise says to respond in English or Japanese.

Determine whether the hard-coded English preference is appropriate for a mixed EN/JA continuous session. Do not claim that it changes provider input transcription unless evidence supports that.

Provider-disabled work may:

- trace how `VoiceLanguageT` is selected and whether the device/protocol supplies an actual language;
- compare exact setup objects for hard-coded `en` versus neutral bilingual instruction;
- add tests for mixed EN/JA session setup;
- prepare a minimum candidate that removes an unjustified English-only session bias while retaining the general `Respond in the user language, English or Japanese` instruction.

Do not globally force Japanese. Do not disable Chinese recognition. Do not silently correct/translate transcript text.

Any product-byte change follows: Codex adjudication -> AGY `gemini-3.8-flash-high` minimum repair -> deterministic tests -> privacy/secret scan -> `git diff --check` -> exact freeze -> fresh Grok 4.6 review.

A new provider call or physical Voice retest requires a new exact authority after zero-provider work is exhausted.

## C7 — Outlook dashboard connect link does not respond

Treat this as a C7 acceptance defect even if the original Outlook provider logic predates C7.

Diagnose without performing OAuth consent or accessing mailbox/calendar private data.

Mechanically inspect and test:

1. exact dashboard button/link component and enabled/disabled state;
2. `onClick`/anchor/navigation code path;
3. frontend route and backend OAuth-start endpoint;
4. generated authorization URL and callback/redirect URI construction;
5. same-origin/base-URL handling behind the deployed reverse proxy;
6. popup/window handling and browser security/popup-blocker behavior;
7. whether the click throws a frontend exception or receives a 4xx/5xx;
8. whether a missing configuration is silently converted into a no-op UI;
9. content-security-policy or mixed-content blocking;
10. loading/error state visibility.

Add deterministic frontend/backend tests that prove a click produces either a valid navigation/redirect initiation or a visible safe error; a silent no-op is a failure.

Preserve Outlook read-only scope and existing Gemini isolation. No scope widening, token capture, OAuth consent, credential creation or private Outlook content access is authorized.

If the only remaining proof requires the operator to complete Microsoft OAuth, stop at that exact boundary after the code path itself is proven.

## C7 — weather forecast icons all show unknown cloud + question mark

Trace the exact Open-Meteo WMO code through provider normalization, shared schema, frontend/dashboard icon selection and NOTE4 renderer/icon glyph path.

Determine whether the defect is:

- numeric-versus-string WMO code mismatch;
- current versus forecast field mismatch;
- enum/schema narrowing;
- icon-name mismatch;
- missing asset/import;
- unsupported glyph/font;
- fallback triggered by undefined/null values;
- stale cached old-provider shape;
- another mechanically demonstrated cause.

Add deterministic coverage for representative WMO codes including at least:

```text
0 clear
1 mainly clear
2 partly cloudy
3 overcast
45 fog
51 drizzle
61 rain
63 rain
80 showers
95 thunderstorm
```

Unknown/fallback icon is valid only for genuinely unknown/unmapped values. Do not fabricate weather states.

Repair both dashboard/frontend and NOTE4 render paths if they share the defect; otherwise change only the affected path. Preserve fixed Open-Meteo endpoints, cache/stale behavior and QWeather compatibility.

Material C7 product-byte repair requires impacted tests and fresh independent review before any new deployment request.

## Campaign 10 — Codex / AGY Gemini / Grok subscription usage tiles

The operator explicitly requests three dashboard usage tiles. This is sufficient authority to open a new isolated research/implementation campaign, but NOT to deploy it or to copy/extract credentials.

Proposed branch:

`feature/ai-subscription-usage-tiles`

Create a separate draft PR only after reconciling the current accepted C7+C8 source so C10 does not overwrite active repairs.

### Product goal

Add three read-only web-dashboard tiles:

- Codex usage
- AGY/Gemini usage
- Grok usage

Prefer useful subscription-window metrics when an official/supported local source exposes them:

```text
USED_PERCENT
REMAINING_PERCENT
RESET_AT
WINDOW_LABEL
PLAN_OR_TIER_IF_SAFELY_EXPOSED
SESSION_INPUT_TOKENS
SESSION_OUTPUT_TOKENS
SESSION_TOTAL_TOKENS
LAST_UPDATED
SOURCE_STATUS
```

Not every provider will expose every field. Render `Unavailable`/`Unknown` rather than inventing zero usage.

### Security architecture

Credentials and consumer OAuth artifacts must remain on the machine/app that already owns them.

Do NOT:

- copy `~/.codex/auth.json`, Gemini/AGY OAuth files, Grok credentials, browser cookies or bearer tokens into Slate;
- expose tokens to the browser;
- persist raw auth headers;
- scrape private provider web dashboards by default;
- call undocumented private endpoints merely because another third-party app does;
- convert subscription credentials into general API credentials;
- trigger billable model calls just to refresh a usage tile.

Prefer a local read-only collector that invokes already-authenticated supported CLI/status surfaces and emits a small sanitized snapshot to Slate. If the collector is not on the Orange Pi, use an explicit authenticated local-agent/sidecar contract whose payload contains metrics only, never upstream credentials.

Use stale-last-good data with timestamp and source-health state. Default refresh should be low frequency (for example 1–5 minutes) and never create model traffic.

### Codex source hierarchy

Current OpenAI guidance says Codex users can inspect usage in Settings/usage dashboard and `/status` in an active Codex CLI session. Prefer official Codex CLI/app-server read-only status/RPC surfaces when machine-readable and available.

A third-party reference such as CodexBar may be studied for normalization ideas, but do not copy browser cookies/OAuth tokens or depend on undocumented ChatGPT backend endpoints without a separate explicit security/terms decision.

Probe installed Codex capabilities provider-neutral and publish:

```text
CODEX_CLI_PRESENT=
CODEX_VERSION=
CODEX_SUPPORTED_READONLY_USAGE_SURFACE=
CODEX_MACHINE_READABLE_USAGE=
CODEX_METRICS_AVAILABLE=
```

### AGY / Gemini source hierarchy

Google Gemini CLI officially documents `/stats model` as showing token counts and quota information, and its telemetry model includes input/output/thought/cache/tool token usage.

Google also warns against extracting Gemini CLI OAuth credentials for direct third-party access to the services powering Gemini CLI. Therefore prefer invoking a supported local CLI/status/telemetry surface; do not replay/extract OAuth tokens into Slate.

Because the operator named AGY specifically, first identify the installed AGY version and its own supported read-only usage/quota command or structured interface. Do not assume AGY equals stock Gemini CLI. If AGY lacks a supported machine-readable quota source, report that and optionally show local session-token metrics only.

Publish:

```text
AGY_PRESENT=
AGY_VERSION=
AGY_SUPPORTED_READONLY_USAGE_SURFACE=
AGY_MACHINE_READABLE_USAGE=
GEMINI_CLI_PRESENT=
GEMINI_CLI_VERSION=
GEMINI_STATS_MODEL_AVAILABLE=
AGY_GEMINI_METRICS_AVAILABLE=
```

### Grok source hierarchy

Current Grok Build documentation exposes `/usage` in the TUI and `grok usage <session-id> [turn]` for persisted local per-turn token/cost totals. xAI's consumer usage UI exposes a weekly subscription pool, but no public subscription-quota API should be assumed.

Inspect the installed/open-source Grok Build CLI for a supported read-only machine-readable usage source. Prefer official CLI/ACP/local persisted session accounting. Do not scrape browser cookies or private web endpoints to obtain the weekly subscription percentage.

If subscription remaining/reset is not available through a supported machine-readable source, the Grok tile must show that field as unavailable while still showing supported local session token/cost data.

Publish:

```text
GROK_CLI_PRESENT=
GROK_VERSION=
GROK_USAGE_COMMAND_AVAILABLE=
GROK_MACHINE_READABLE_SUBSCRIPTION_USAGE=
GROK_MACHINE_READABLE_SESSION_USAGE=
GROK_METRICS_AVAILABLE=
```

### C10 UI and API requirements

- Three compact responsive dashboard cards with consistent units.
- Show `used` vs `remaining` explicitly; never ambiguous percent.
- Show reset time in browser locale/timezone when available.
- Show `last updated` and stale/error badge.
- Per-provider failure must not break the other tiles.
- Never show secret path, account email, account id or raw provider response.
- Backend response schema must be allowlisted and sanitized.
- Collector command execution must use fixed binaries/subcommands; no arbitrary shell string from frontend input.
- Add timeout, output-size cap and strict parser for CLI output.
- Add tests for unavailable provider, malformed output, expired auth, 100% remaining, 100% used, reset time, stale data and partial provider failure.

C10 material code should receive security-focused Grok 4.6 review after deterministic tests. Do not deploy C10 until separately authorized.

## Portfolio scheduling

Priority after ingesting this physical result:

```text
P0=C8_PHYSICAL_RESULT_INGEST_INPUT_DISPLAY_AND_BILINGUAL_ASR_ZERO_PROVIDER_OPTIMIZATION
P1=C7_OUTLOOK_CONNECT_AND_WEATHER_ICON_REPAIR
P2=C10_AI_SUBSCRIPTION_USAGE_TILES_RESEARCH_AND_BRANCH_LOCAL_IMPLEMENTATION
P3=C9_REMAINS_PARKED_RESEARCH_ONLY
```

A human gate in one node must not stop safe READY/READONLY_READY work in another.

No physical retest should be requested until C8/C7 zero-provider repair work is exhausted and exact reviewed candidate(s) are frozen.

No production deployment of changed C7/C8/C10 bytes is authorized by this directive.

## Durable checkpoint schema

Before controller return publish:

```text
PORTFOLIO_CURRENT_HEAD=

C8_PHYSICAL_ACCEPTANCE_CONSUMED=YES
C8_INPUT_DISPLAY_OPERATOR_RESULT=MUCH_BETTER
C8_INPUT_DISPLAY_DOMINANT_BOUNDARY=
C8_ADAPTIVE_FIRST_PARTIAL_CANDIDATE=
C8_BILINGUAL_SESSION_EN_BIAS_FINDING=
C8_ASR_ACCURACY_STATUS=
C8_REPAIR_SOURCE=
C8_REVIEW_STATUS=
C8_DEPLOYMENT_REQUIRED=
C8_PHYSICAL_RETEST_REQUIRED=

C7_OUTLOOK_CONNECT_ROOT_CAUSE=
C7_OUTLOOK_REPAIR_SOURCE=
C7_WEATHER_ICON_ROOT_CAUSE=
C7_WEATHER_ICON_REPAIR_SOURCE=
C7_TEST_STATUS=
C7_REVIEW_STATUS=
C7_DEPLOYMENT_REQUIRED=
C7_OAUTH_HUMAN_ACTION_REQUIRED=

C10_PR=
C10_HEAD=
C10_CODEX_USAGE_SOURCE=
C10_AGY_GEMINI_USAGE_SOURCE=
C10_GROK_USAGE_SOURCE=
C10_CREDENTIALS_COPIED=NO
C10_BROWSER_COOKIES_USED=NO
C10_BILLABLE_REFRESH_CALLS=NO
C10_TEST_STATUS=
C10_REVIEW_STATUS=
C10_DEPLOYED=NO

C9_STAGE=PARKED_RESEARCH_ONLY

PORTFOLIO_READY_NODE_COUNT=
PORTFOLIO_READONLY_READY_NODE_COUNT=
PORTFOLIO_WAITING_DEVICE_COUNT=
PORTFOLIO_WAITING_HUMAN_COUNT=
PORTFOLIO_EXTERNALLY_BLOCKED_COUNT=
PORTFOLIO_HUMAN_ACTION_REQUIRED=
PORTFOLIO_HUMAN_ACTION_REASON=
PORTFOLIO_TERMINAL_REASON=
PORTFOLIO_NEXT_ACTION=
```

Do not exit with READY or READONLY_READY work remaining unless blocked by a higher-order safety/authority conflict.

Keep PR #1, #2 and #3 OPEN / DRAFT / UNMERGED. Any C10 PR must also remain OPEN / DRAFT / UNMERGED.