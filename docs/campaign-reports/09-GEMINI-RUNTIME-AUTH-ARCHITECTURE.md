# Campaign 9 Stage Report

Stage: Campaign 9 — Gemini runtime/auth architecture
Date: 2026-09-02 (Australia/Perth)
Status: PASS — evaluation complete; existing Vertex ADC retained; Developer OAuth/ADC not production-ready

## Repository State

Repository: `Streetjk/slate`
Branch: `feature/gemini-runtime-auth-architecture`
Base SHA: `2d4a2a9e9a380c591c2ac7f0f3120f1f7939b65d`
Start SHA: `bbdfb2c08e49e8069ade7bb150c1f9df278f35e4`
Head SHA: `bbdfb2c08e49e8069ade7bb150c1f9df278f35e4` before this report/state commit
Report commit: recorded by the final Git handoff after commit creation
Upstream/integration source: `origin/integration/note4-custom` @ `2d4a2a9e9a380c591c2ac7f0f3120f1f7939b65d`
PR: #3, draft, base `integration/note4-custom`

## Harness

Codex version: authenticated local Codex session; exact CLI version not exposed to the repository
AGY version: `1.1.23`
AGY model: `gemini-3.7-flash-high`
AGY authentication: official AGY Google OAuth; no API key used
Orchestration mode: Codex primary controller; AGY read-only independent reviewer

## Objective

Evaluate, in order, Gemini Developer API OAuth/ADC, paid Developer API, Vertex/Agent Platform ADC, and the explicitly unauthorized key fallback. Determine whether a minimal backend runtime/client factory is justified while preserving Live voice, EN/JP, Search grounding, function calling, Calendar proposal/Confirm safety, Outlook isolation, reconnect, credential refresh and backend-only credentials.

## Work Completed

This campaign was an architecture and evidence campaign. No production application or firmware code was changed.

### A0 — current Slate audit

- `@google/genai` is `2.20.0` from the lockfile.
- `backend/src/modules/assistant/gemini.client.ts` already provides the narrow injected `GEMINI_CLIENT_FACTORY` seam and constructs `GoogleGenAI`.
- `GeminiAssistantService` and `GeminiLiveService` are the consumers. Both pass `{ vertexai: true, project, location }` and take model IDs from `GEMINI_TEXT_MODEL` and `GEMINI_LIVE_MODEL`.
- The text path enables the existing narrow tool registry and returns validated tool requests. The Live path enables input/output transcription, Search/function declarations through the registry, reconnect/close lifecycle and timeout handling.
- Google credentials and model selection remain backend-only. Firmware contains neither Gemini credentials nor Gemini model IDs.
- Existing tests preserve the Google Calendar proposal-only flow and the Outlook/Microsoft isolation boundary.

### A1 — official capability/auth audit

Evidence was checked against the current official Google documentation on 2026-09-02:

- Developer API OAuth quickstart: <https://ai.google.dev/gemini-api/docs/oauth>. It documents Cloud project setup, Generative Language API enablement, OAuth consent, ADC, a REST bearer-token request and `x-goog-user-project` attribution. It also requires an interactive OAuth setup for a new account/project.
- Current Developer API model catalogue: <https://ai.google.dev/gemini-api/docs/models>. It lists `gemini-3.1-flash-live-preview`, `gemini-3.5-transcribe-live`, and `gemini-3.5-live-translate-preview`; it does not list a full conversational Gemini 3.5 Live model.
- `gemini-3.1-flash-live-preview`: <https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview>. The model page lists Live API, audio generation, Search grounding and function calling.
- Live capabilities: <https://ai.google.dev/gemini-api/docs/live-api/capabilities>. The current guide documents audio input/output, transcription, Search/function calling, English and Japanese support, and server-to-server WebSocket use.
- Gemini 3.5 Transcribe: <https://ai.google.dev/gemini-api/docs/models/gemini-3.5-transcribe>. The live variant is streaming STT, not a conversational audio-output assistant and not a replacement for Slate's reasoning/tool session.
- Gemini 3.5 Live Translate: <https://ai.google.dev/gemini-api/docs/models/gemini-3.5-live-translate-preview>. It is audio-to-audio translation and explicitly lacks Search grounding and function calling.
- Developer API pricing: <https://ai.google.dev/gemini-api/docs/pricing>. It publishes free/paid data-use distinctions, Live audio rates and Search grounding limits.
- Developer API rate limits: <https://ai.google.dev/gemini-api/docs/rate-limits>. Limits are project/model/tier dependent and the active account values must be checked in AI Studio.
- Key fallback documentation: <https://ai.google.dev/gemini-api/docs/api-key>. New keys are authorization keys bound to service accounts; unrestricted standard keys are being rejected in September 2026. No key was created or used.
- Vertex data governance: <https://docs.cloud.google.com/vertex-ai/generative-ai/docs/vertex-ai-zero-data-retention>. Google states that Vertex/Agent Platform customer data is not used to train or fine-tune models without prior permission or instruction. Live session resumption is disabled by default; enabling it stores session data for up to 24 hours.
- Vertex pricing: <https://cloud.google.com/vertex-ai/generative-ai/pricing>. Current published Vertex pricing includes Gemini 2.5 Flash Live audio input/output and Search grounding limits.

### Capability and auth matrix

| Surface | Auth evidence | Full Live EN/JP | Search | Function calling | Quota/probe result | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| Vertex/Agent Platform ADC | Supported by current Slate and Google Gen AI Node path with project/location ADC | Current Slate baseline; official Live surface | Existing Slate path | Existing Slate path | Deterministic only in this environment; production baseline retained | **Retain as current and rollback runtime** |
| Developer API OAuth/ADC | Official OAuth/ADC REST quickstart exists; installed Node SDK 2.20.0 documents `googleAuthOptions` for Vertex clients and `apiKey` as required for Gemini API clients | `gemini-3.1-flash-live-preview` is documented on Developer API, but Node OAuth Live handshake was not verified | Model supports it | Model supports it, sequential function calling | Account quota and Live OAuth probe unavailable: no `gcloud`, ADC, project or credential path | **Defer; no runtime branch** |
| Developer API paid | Technically requires billing/paid project and current supported auth path | Potentially viable after auth path proof | Available on supported model with published limits | Available on supported model | Billing was not enabled and no paid probe was run | **Do not activate** |
| Developer API authorization key | Current auth-key mechanism exists, service-account bound | Not tested | Not tested | Not tested | Explicitly unauthorized in this campaign | **Forbidden fallback** |
| Gemini 3.5 Transcribe Live | Developer API model | STT only | Not supported | Not a general assistant tool surface | Not tested | Optional future STT experiment only |
| Gemini 3.5 Live Translate | Developer API model | Translation only | Not supported | Not supported | Not tested | Not suitable for Slate assistant core |

The installed SDK evidence is decisive for implementation safety: `backend/node_modules/@google/genai/dist/node/node.d.ts` documents `apiKey` as required for Gemini API clients and `googleAuthOptions` as Vertex authentication options. Its README likewise gives ADC setup under the Vertex/Enterprise path and API-key initialization for the Developer API. Introducing `developer_oauth` into the current Node factory without a supported Live transport/auth path would create an untestable or misleading production mode.

### A2 — bounded non-production probes

```text
GEMINI_API_KEY_USED=NO
GOOGLE_API_KEY_USED=NO
BILLING_ENABLED=NO
ORANGE_PI_ENV_CHANGED=NO
PRODUCTION_DEPLOYMENT=NO
FIRMWARE_CHANGED=NO
FIRMWARE_FLASHED=NO
```

Local auth capability check:

```text
gcloud=ABSENT
~/.config/gcloud=ABSENT
GOOGLE_APPLICATION_CREDENTIALS=UNSET
GOOGLE_CLOUD_PROJECT=UNSET
GOOGLE_CLOUD_LOCATION=UNSET
ADC_PROBE=UNAVAILABLE
```

Therefore the following are explicitly **NOT CLAIMED**: actual account free-tier quota, Developer API OAuth model listing, Developer API OAuth text request, Developer API OAuth Live WebSocket, EN/JP live audio, Search live call, live function call, live credential refresh, or latency comparison against Vertex. Google documents the OAuth setup, but completing a new consent/project setup is an interactive human boundary and was not performed.

Existing deterministic tests do cover the corresponding Slate seams: tool allowlist, Search configuration, function/proposal validation, Calendar confirmation safety, Outlook isolation, Live timeout/reconnect lifecycle, and ADC fail-closed behavior.

### A3 — cost and privacy model

The table below is a transparent estimate, not an account bill. Assumption: the stated daily minutes are active audio session minutes, with one minute of model audio output for each minute of input audio. It excludes text/context tokens, idle time, storage, taxes and Search overage. Thirty days/month is used.

Developer API `gemini-3.1-flash-live-preview` published paid audio rates are approximately `$0.005/min` input and `$0.018/min` output, or `$0.023/active minute` before Search overage.

| Active voice use/day | Developer API free tier | Developer API paid audio estimate/month | Vertex 2.5 Flash Live audio estimate/month* |
| ---: | ---: | ---: | ---: |
| 5 min | `$0` if account quota permits; not verified | `$3.45` | `$3.38` |
| 15 min | `$0` if account quota permits; not verified | `$10.35` | `$10.13` |
| 30 min | `$0` if account quota permits; not verified | `$20.70` | `$20.25` |
| 60 min | `$0` if account quota permits; not verified | `$41.40` | `$40.50` |

`*` Vertex estimate uses the current pricing page's `$3.00/1M` audio input and `$12.00/1M` audio output and the Live documentation's 25 audio tokens/second convention: `1,500 tokens/min`, or approximately `$0.0225/active minute`. The configured Slate Vertex model alias and account-specific availability still require a live project check.

Search grounding is not free merely because model inference is free in every surface. Current official pages publish 5,000 shared Gemini 3.x Search requests/month on the relevant paid surface, then `$14/1,000` Search queries; one user prompt may create multiple queries. Actual account limits must be verified before relying on this estimate.

Privacy is the material tradeoff:

- Developer API free-tier content is marked as usable to improve Google products on the current pricing page. This is unsuitable as an automatic default for private always-on voice/calendar use without an explicit privacy decision.
- Developer API paid-tier content is marked not used to improve Google products on the current pricing page, but requires billing and was not activated.
- Vertex/Agent Platform's current training restriction states customer data is not used to train or fine-tune models without permission or instruction. Live session resumption is separately disabled by default and should remain disabled unless its 24-hour data retention is deliberately accepted.

### A4/A5 — implementation and selection

No runtime factory change was justified. Slate already has the smallest useful injection seam, and only one runtime was actually verified in this checkout. The selected design is:

```text
Selected current runtime: vertex_adc
  GoogleGenAI({ vertexai: true, project, location })
  model IDs from backend environment/config
  ADC credential lifecycle owned by Google auth libraries/runtime

Deferred experiment: developer_oauth
  requires a supported Node SDK/Live auth path, an interactive OAuth setup,
  account quota evidence, and live capability/latency/reconnect evidence

Forbidden unless separately authorized: developer_auth_key
```

The existing Vertex path is the rollback path. No `GEMINI_RUNTIME` enum or dormant credential configuration was added, avoiding a false readiness signal and mixed-auth ambiguity. PR #2's Slate-owned NOTE4 voice routing is not duplicated or modified.

## Files Changed

- `docs/campaign-reports/09-GEMINI-RUNTIME-AUTH-ARCHITECTURE.md` — this evidence report.
- `docs/campaign-reports/CAMPAIGN-STATE.md` — durable Campaign 9 checkpoint.

No backend, frontend, shared, firmware, deployment, or Orange Pi production files were changed.

## Architecture Decisions

1. Keep Gemini model selection and all Google credentials backend-only.
2. Retain Vertex ADC as the only current production/rollback runtime.
3. Do not add a `developer_oauth` branch until the installed Node SDK or an officially supported replacement proves Developer API OAuth Live support end to end.
4. Do not replace the conversational Live model with either specialized 3.5 transcription or translation.
5. Preserve the narrow tool registry, Outlook isolation, and Google Calendar proposal → physical Confirm → single write semantics.
6. Do not enable billing, create a key, modify Orange Pi `.env`, deploy, merge or flash firmware.

## Tests

Commands executed on this branch:

- `bun run format:check` — PASS; Prettier reported all checked files formatted.
- `bun run lint` — PASS; frontend and backend ESLint, zero warnings/errors.
- `bun run typecheck` — PASS; frontend and backend `tsc --noEmit`.
- `bun run --cwd shared test` — PASS; **6 passed, 0 failed**, 27 assertions, 1 file.
- `bun run --cwd backend test` — PASS; **270 passed, 0 failed**, 845 assertions, 71 files.
- `bun run --cwd frontend build` — PASS; Vite transformed 2,169 modules.
- `git diff --check` — PASS.
- Suspicious-value scan over tracked source/docs excluding dependencies/generated artifacts — PASS; no API-key values, private keys, bearer-token values or credential material detected.

No live Google probe was run because the approved OAuth/ADC credential path is absent locally. No API key was used as a workaround.

## AGY Review

Reviewer model: `gemini-3.7-flash-high`
Effort level: high
Mode: read-only; no AGY file edits, commits or pushes observed
Verdict: **PASS (with advisory findings)**

AGY independently confirmed that zero production code changes are required or justified, and confirmed the current injected factory/Vertex ADC path, tool allowlist, Calendar proposal safety and Outlook isolation.

P0 findings: None.

P1 findings:

- **SDK limitation:** installed `@google/genai@2.20.0` does not provide a supported out-of-the-box Developer API OAuth Live path through the current Node factory; its declarations couple `googleAuthOptions` to Vertex and document `apiKey` for Gemini API clients. Accepted as a blocking implementation constraint; no speculative mode added.
- **Verification boundary:** no account-specific quota or Developer OAuth Live handshake can be verified without ADC/project credentials and interactive setup. Accepted; report makes all such results NOT CLAIMED.

P2 findings:

- **Free-tier privacy:** current Developer API pricing marks free-tier content as usable to improve Google products. Accepted as a material product-policy tradeoff, not silently optimized away.
- **Specialized 3.5 models:** Transcribe Live and Live Translate do not satisfy the full Search/function-calling conversational assistant. Accepted; they remain future specialized experiments only.

P3 findings:

- Existing factory/config seam is already minimal; refactoring for hypothetical providers would add dead configuration. Accepted; no refactor made.

Findings accepted: all above, with the resolution recorded in this report.
Findings rejected: none.

## Security Checks

OAuth-only requirement: PASS for this campaign; only official AGY OAuth was used, and no Gemini key or copied token was used.
Static AI API keys found: NO values; no key created or enabled.
Outlook read-only: PRESERVED; no Outlook write capability added.
Outlook exposed to Gemini: NO; existing isolation tests remain passing.
Google Calendar confirmation gate: PRESERVED; no write path changed.
Secrets detected: NONE in tracked source/docs/diff scan.
Credentials in NOTE4 firmware: NONE.
Production Orange Pi `.env` changed: NO.
Billing enabled: NO.

## Known Issues

- Developer API OAuth/ADC quota attribution and all live Developer OAuth probes remain unverified until an authorized Google project/ADC setup is available.
- The installed Node SDK does not present a supported Developer API OAuth Live client path; this must be re-evaluated when the SDK or official integration changes.
- Vertex account/model availability, live EN/JP behavior, Search, latency and refresh still require the existing separate human OAuth/device boundary; this report does not claim those live tests.
- Current Vertex Live sessions are subject to provider session-duration rules; existing reconnect behavior is deterministic but was not live-tested in this environment.

## Deviations

- No minimal runtime factory was added because the required two-surface viability threshold was not met and the only available local runtime remains the existing Vertex factory.
- Live Developer API OAuth, free-tier quota and Vertex latency comparison were not executed because performing them requires an interactive OAuth/project setup unavailable in this environment. No API-key fallback was used.
- No production deployment, billing activation, Orange Pi configuration change, firmware change or firmware flash was performed.

## Next Recommended Stage

Human-boundary action only if the Developer API experiment is still desired: configure the approved Google OAuth/ADC project using Google's official OAuth quickstart, without sharing credentials in chat; then run a bounded non-production model-list/text/Live EN-JP/Search/function/reconnect/refresh probe and compare it with Vertex. Otherwise continue using the existing Vertex ADC runtime and proceed to the already-defined PR #2 Slate voice-flash authorization separately.

## Final Stage Verdict

**READY_FOR_GEMINI_RUNTIME_DEPLOY=false**

Campaign 9 research is complete and PR #3 is ready for review/documentation. The existing Vertex ADC runtime remains the safe rollback/current candidate. No new runtime is authorized for deployment, billing, Orange Pi configuration, merge, or firmware flash.

## Portfolio current-source and official-document reconciliation — 2026-09-10

```text
C9_LIVE_HEAD=906bdd889cb507db12a1fc3d195a9109e1b18d07
C9_PR_STATE=OPEN
C9_PR_DRAFT=YES
C9_PR_MERGED=NO
C9_CURRENT_INTEGRATION=2d4a2a9e9a380c591c2ac7f0f3120f1f7939b65d
C9_CURRENT_C8_COORDINATION_HEAD=c969d805f73a27b83dce789cd86c696c5e502cdc
C9_REBASE_STATUS=DEFERRED_C8_NOT_YET_STABLE_AND_23_ASSISTANT_CONFIG_PATHS_OVERLAP
C9_PRODUCT_CODE_CHANGED=NO
C9_PROVIDER_CALLS=0
C9_OAUTH_CONSENT=NO
C9_BILLING_ENABLED=NO
C9_PRODUCTION_DEPLOYMENT=NO
C9_FIRMWARE_CHANGED=NO
C9_READY=0
C9_READONLY_READY=0
C9_WAITING_HUMAN=1
C9_EXTERNALLY_BLOCKED=0
```

### Current repository audit

The current C9 branch still uses the narrow `GEMINI_CLIENT_FACTORY` seam and
constructs `GoogleGenAI` from Vertex project/location options. The lockfile
resolves `@google/genai@2.20.0`. Its Node declaration exposes `apiKey`,
`vertexai`, project/location and `googleAuthOptions`; that type-level surface
does not by itself prove a supported Developer API OAuth Live transport. The
current C8 branch has changed 23 assistant/config paths relative to C9,
including the Live bridge, configuration schema and tests. C9 therefore does
not rebase or implement a competing factory before C8 reaches a stable,
reviewed source boundary.

The current C8 durable state records a backend-only Developer API key runtime
for the deployed Gemini 2.5 native-audio path, while the reviewed C8 restore
candidate remains separately gated. C9 neither changes nor claims ownership of
that runtime. Firmware still contains no Gemini credential or model ID.

### Current official capability/auth findings

The official OAuth quickstart now documents a Cloud project, Generative
Language API enablement, OAuth consent/test-user setup, ADC creation and
`x-goog-user-project` attribution. It also describes interactive setup and
credential caching. This establishes that Developer API OAuth/ADC is an
official authentication route, but no local project/ADC credential exists and
no OAuth consent or provider call was performed here.

The current official model catalogue lists `gemini-3.1-flash-live-preview` as
a Live audio-to-audio model with Live API, Search grounding and function
calling. The Live overview documents server-to-server WebSocket operation,
audio input/output, multilingual support including the current Live surface's
supported-language documentation, transcription, Search and function calling.
This is a current candidate for a separately authorized Developer API
experiment, not permission to change Slate's model or auth.

The current official transcription documentation identifies
`gemini-3.5-transcribe-live` as a dedicated low-latency STT pipeline. It
supports automatic language detection and EN/JA (`en-US`, `ja-JP`) among its
documented languages, but its documented response is streaming text and it
does not provide Slate's conversational assistant, audio response, Search or
function-calling surface. A split STT-front-end plus separate conversational
assistant remains an unimplemented, research-only architecture option.

The current official Live transcription guide documents interim and finalized
input transcription and automatic language detection when language codes are
omitted or empty. This supports investigating bilingual disambiguation in a
future compatible path, but does not justify injecting a language hint into
C8's currently qualified Gemini 2.5 setup.

The current official key page says new keys are authorization keys bound to a
service account and that unrestricted standard keys are rejected during the
September 2026 transition. C9 created or rotated no key and does not select a
key fallback.

### Current quota, pricing and privacy model

Official Developer API rate limits remain project/model/tier dependent and
must be checked in AI Studio; they are not safely inferable from this
checkout. The current pricing page lists Developer API free-tier content as
usable to improve Google products and paid-tier content as not used for that
purpose. Search grounding has a published paid-tier allowance of 5,000 shared
requests/month for Gemini 3.x, then USD 14 per 1,000 requests; actual account
limits remain unverified.

For transparent comparison only, assume 30 days/month and one active minute
of model audio output per active minute of user audio input. Excluding text,
context, idle time, taxes and Search overage:

| Active voice/day | Developer 3.1 Live paid audio | Vertex 2.5 Flash Live audio | Separate 3.5 Transcribe Live paid STT only |
| ---: | ---: | ---: | ---: |
| 5 min | USD 3.45/month | USD 3.38/month | USD 1.35/month |
| 15 min | USD 10.35/month | USD 10.13/month | USD 4.05/month |
| 30 min | USD 20.70/month | USD 20.25/month | USD 8.10/month |
| 60 min | USD 41.40/month | USD 40.50/month | USD 16.20/month |

The Developer estimate uses the current published `gemini-3.1-flash-live-preview`
audio rates of USD 0.005/min input and USD 0.018/min output. The Vertex
estimate uses the current published Gemini 2.5 Flash Live rates and the
documented 25 audio tokens/second convention. The Transcribe estimate uses
the current published approximately USD 0.009/min blended Live Transcribe
rate and excludes the conversational assistant's cost. Free-tier rows would
be zero only if the account/model quota permits, which was not verified; the
free-tier privacy tradeoff remains material.

The current Agent Platform zero-data-retention documentation states Google
will not use customer data to train or fine-tune managed models without prior
permission or instruction. It also states Gemini Live session resumption is
disabled by default and enabling it stores cached text, video and audio
session data for up to 24 hours. Slate must keep session resumption disabled
unless separately accepted. These governance properties continue to favor
retaining Vertex ADC as the current rollback/governance candidate until a
Developer OAuth path is fully proven and its free-tier policy is explicitly
accepted.

### Decision and frontier

```text
C9_RECOMMENDED_CURRENT_RUNTIME=RETAIN_CURRENT_C8_RUNTIME_UNTIL_STABLE_REVIEWED_BOUNDARY
C9_HISTORICAL_VERTEX_ADC=SAFE_ROLLBACK_AND_GOVERNANCE_REFERENCE
C9_DEVELOPER_OAUTH=RESEARCH_ONLY;INTERACTIVE_PROJECT_ADC_AND_LIVE_PROBE_REQUIRED
C9_DEVELOPER_AUTH_KEY=FORBIDDEN_WITHOUT_EXPLICIT_AUTHORIZATION
C9_TRANSCRIBE_LIVE_SPLIT=RESEARCH_ONLY;DO_NOT_IMPLEMENT
C9_RUNTIME_FACTORY_CHANGE=NOT_JUSTIFIED
C9_PROVIDER_CALLS=0
C9_NEXT_ACTION=AWAIT_EXPLICIT_OAUTH_BILLING_PROVIDER_ARCHITECTURE_AUTHORITY_OR_RETAIN_CURRENT_C8_RUNTIME
```

No source/runtime artifact, production configuration, credential, billing
tier, provider session, firmware image or private-data authority changed in
this reconciliation. Campaign 9 is parked at the architecture/auth
authority boundary; the portfolio scheduler must not treat the research
checkpoint as a deployment or provider authorization.
