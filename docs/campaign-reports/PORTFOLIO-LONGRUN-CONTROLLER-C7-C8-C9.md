# Slate portfolio long-run controller — Campaigns 7, 8, and 9

## Purpose

Run the currently open Slate campaign portfolio as one durable `PORTFOLIO_FRONTIER_DRIVEN_LONGRUN` control loop without collapsing campaign isolation, branch ownership, review gates, deployment authority, provider budgets, firmware authority, privacy boundaries, or merge/release authority.

This file coordinates work. It does not replace each campaign's own technical directive.

The controlling campaign documents remain authoritative within their scope:

- Campaign 7 / PR #1: `docs/campaign-reports/07-PERTH-CALENDAR-WEATHER-GOOGLE-NEWS-INSTRUCTIONS.md`
- Campaign 8 / PR #2: current Campaign 8D1M-G directives, especially `CAMPAIGN-STATE.md`, `08D1M-G-M4-LONG-CONTINUOUS-CAMPAIGN.md`, `08D1M-G-M4-PROVIDER-QUALIFICATION-HARNESS-RECOVERY.md`, and `08D1M-G-M4-PROVIDER-SESSION-SETUP-FAILURE-ZERO-PROVIDER-DIAGNOSIS.md`
- Campaign 9 / PR #3: `docs/campaign-reports/09-GEMINI-RUNTIME-AUTH-ARCHITECTURE-INSTRUCTIONS.md`
- Global execution invariants: `docs/campaign-reports/AUTONOMY-AND-HUMAN-GATE-POLICY.md` and `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`

## Activation snapshot

Reconcile these live values at execution time; do not assume this snapshot remains current.

```text
PORTFOLIO_MODE=PORTFOLIO_FRONTIER_DRIVEN_LONGRUN
REPOSITORY=Streetjk/slate
INTEGRATION_BRANCH=integration/note4-custom

C7_PR=1
C7_BRANCH=feature/perth-calendar-weather-google-news
C7_ACTIVATION_HEAD=0a985ab5c18596310290a1ff4da4b4d7b585d947
C7_STATE=SOFTWARE_IMPLEMENTATION_REVIEWED_PASS_NOT_DEPLOYED
C7_FIRMWARE_SCOPE=NONE

C8_PR=2
C8_BRANCH=feature/gemini-35-live-evaluation
C8_ACTIVATION_HEAD=e55a528b5c4b3b7e600c608332c082998d16cd1f
C8_STATE=M4_ZERO_PROVIDER_SETUP_DIAGNOSIS_COMPLETE_REVIEWED_SETUP_RESTORE_AWAITS_AUTHORITY
C8_REVIEWED_RESTORE_SOURCE=f0dfdad0b4065e48ff8bc82aa505706d40fd9f4c
C8_REVIEWED_RESTORE_ARM64_IMAGE=sha256:b271eb8bfcb7a4d04d602d3974ceeb83c928e72721c67fda19c1c2e822a646d5
C8_REVIEW=GROK_4_6_PASS_P0_0_P1_0_P2_0_SECURITY_0
C8_CURRENT_HUMAN_GATE=NEW_BACKEND_DEPLOYMENT_AND_ONE_PROVIDER_SESSION_AUTHORITY

C9_PR=3
C9_BRANCH=feature/gemini-runtime-auth-architecture
C9_ACTIVATION_HEAD=906bdd889cb507db12a1fc3d195a9109e1b18d07
C9_STATE=OLDER_ARCHITECTURE_EVALUATION_PASS_NO_PRODUCTION_CODE_CHANGE
C9_HISTORICAL_SELECTION=VERTEX_ADC
C9_STALENESS_WARNING=RECONCILE_WITH_CURRENT_C8_RUNTIME_BEFORE_RELYING_ON_2026_09_02_CONCLUSIONS
```

All three PRs are required to remain OPEN / DRAFT / UNMERGED unless the operator explicitly authorizes a merge/release transition.

## Core portfolio rule

A human-only gate in one campaign does **not** freeze the whole portfolio when another campaign has safe, non-conflicting READY or READONLY_READY work.

The controller must maintain both:

1. per-campaign frontier counts; and
2. portfolio-wide frontier counts.

It must not return merely because one campaign is blocked if another campaign can continue safely.

## Global priority order

Default priority is:

```text
P0=C8_ACTIVE_NOTE4_VOICE_STABILITY_AND_LATENCY_RECOVERY
P1=C7_PERTH_CALENDAR_WEATHER_NEWS_REBASE_CONFLICT_REVALIDATION_AND_RELEASE_READINESS
P2=C9_GEMINI_RUNTIME_AUTH_COST_PRIVACY_RECONCILIATION
```

Priority does not mean the lower campaign must remain idle. When the higher campaign is at a genuine human-only boundary, immediately consume safe work from the next campaign.

Do not perform overlapping production writes from multiple campaigns concurrently.

## Campaign 8 — active critical path

### Current frontier

Campaign 8's zero-provider setup diagnosis found that `inputAudioTranscription.languageCodes=["en-US","ja-JP"]` was the only material provider-facing setup difference relative to the prior session-establishing Gemini 2.5 setup, and current model-specific support is undocumented. The minimum reviewed candidate restores Gemini 2.5 session-setup compatibility while preserving new input-side timing instrumentation.

Use the exact live Campaign 8 `CAMPAIGN-STATE.md` rather than this summary when execution begins.

### While C8 is waiting for deployment/provider authority

Do not consume a provider session, redeploy, restart production, flash firmware, reset NOTE4, re-pair, change Wi-Fi, change provider/model/auth, change credentials, or change private-data authority.

Instead, if there is safe C8 read-only work, complete it; otherwise park C8 at its exact authority boundary and move to C7/C9 safe work.

### After C8 authority is explicitly granted

Continue the full C8 long-run automatically:

1. deploy only the exact reviewed candidate authorized by the operator;
2. preserve exact approved production configuration and protected secret handling;
3. run at most the explicitly authorized provider-session count;
4. require deterministic sanitized terminal accounting;
5. classify session establishment before any ASR/latency claim;
6. if session establishment passes, classify input transcript timing, reply timing, EN/JA behaviour, stability, audio, bubble order and exit only from supported evidence;
7. if a provider attempt fails, consume the attempt and continue all zero-provider diagnosis automatically;
8. use Codex adjudication -> designated implementation worker -> tests -> privacy scan -> exact freeze -> fresh Grok 4.6 review for material C8 repairs;
9. do not request a physical NOTE4 action until it is genuinely the only useful remaining node;
10. do not mark Campaign 8 complete while M4 residual acceptance, input-latency, bilingual ASR, audio, glyph, stability, or runtime-identity accounting remains unresolved without an exact bounded authority gate.

### C8 completion checkpoint

Campaign 8 may become `PORTFOLIO_STAGE_COMPLETE` only when the final dossier records at minimum:

```text
C8_FINAL_SOURCE=
C8_FINAL_BACKEND_IMAGE=
C8_FINAL_FIRMWARE_IMAGE=
C8_PROVIDER_MODEL_AUTH=
C8_NETWORK_ACCEPTANCE=
C8_VOICE_STABILITY=
C8_INPUT_LATENCY=
C8_PROVIDER_OUTPUT_LATENCY=
C8_EN_JA_ASR=
C8_JAPANESE_GLYPH=
C8_AUDIBLE_AUDIO=
C8_BUBBLE_ORDER=
C8_NORMAL_EXIT=
C8_PRIVACY_SECRET=
C8_FINAL_REVIEW=
C8_UNRESOLVED_RESIDUALS=
C8_HUMAN_BOUNDARY_IF_ANY=
```

A stable-but-slow path may close stability while latency remains a distinct bounded optimization node.

## Campaign 7 — Perth calendar/weather/news

### Existing evidence

The current PR #1 report says software implementation is complete and independently reviewed, with backend/shared/frontend tests passing, no firmware changes, no new credentials, and production deployment/physical validation not performed.

Because PR #1 was created from an older integration base, do **not** deploy its historical image/source directly over a newer Campaign 8 production system without reconciling branch/base compatibility first.

### Safe work while C8 is blocked

Campaign 7 is the preferred next source of portfolio work while C8 is waiting for human authority.

Perform, without production deployment:

1. fetch/reconcile latest PR #1 head and latest integration/C8-compatible source;
2. identify all conflicts/drift introduced since the reviewed C7 candidate;
3. determine whether C7 touches files now changed by C8 or other later work;
4. preserve Campaign 6D firmware isolation;
5. rebase/forward-port C7 only when the campaign's branch rules allow it and history rewriting is safe;
6. if a rebase/forward-port changes product bytes, rerun all impacted deterministic tests;
7. re-check live external-source assumptions that are freshness-sensitive: WA holiday source, Open-Meteo contracts, Google News RSS endpoints;
8. rerun backend/shared/frontend validation and renderer fixtures;
9. preserve Outlook read-only isolation and Google Calendar safety semantics;
10. perform a fresh independent review if the rebased candidate materially differs from the previously reviewed candidate.

No production deployment, merge or NOTE4 physical validation is authorized merely by this portfolio directive.

### C7 release-readiness checkpoint

Publish:

```text
C7_LIVE_HEAD=
C7_CURRENT_BASE=
C7_REBASE_OR_FORWARD_PORT_STATUS=
C7_CONFLICT_COUNT=
C7_RUNTIME_FILES_CHANGED_SINCE_PRIOR_REVIEW=
C7_BACKEND_TESTS=
C7_SHARED_TESTS=
C7_FRONTEND_BUILD=
C7_RENDERER_TESTS=
C7_PERTH_TIMEZONE_TESTS=
C7_WA_HOLIDAY_SOURCE_AS_OF=
C7_OPEN_METEO_LIVE_PROBE=
C7_GOOGLE_NEWS_AU_PROBE=
C7_GOOGLE_NEWS_TW_PROBE=
C7_PRIVACY_SECRET_SCAN=
C7_REVIEW_STATUS=
C7_FIRMWARE_CHANGED=NO_REQUIRED
C7_DEPLOYED=NO_UNLESS_SEPARATELY_AUTHORIZED
C7_PHYSICAL_ACCEPTANCE=NOT_RUN_UNLESS_SEPARATELY_AUTHORIZED
```

When only deployment/physical acceptance remains, park C7 at that exact human gate and continue another safe campaign.

## Campaign 9 — Gemini runtime/auth/cost/privacy architecture

### Existing evidence is historical, not automatically current

PR #3's 2026-09-02 report concluded that Vertex ADC should remain and that Developer API OAuth/ADC was not production-ready in the then-current local SDK/auth environment.

Do not treat that conclusion as permanently binding without reconciliation because Campaign 8 has since exercised a materially different production runtime/auth path and has changed shared Gemini source.

Campaign 9 must not overwrite or duplicate current C8 voice routing or latency/stability fixes.

### Safe work before C8 completes

C9 may perform READONLY_READY research and current-source reconciliation while C8 is blocked, but must not implement or deploy a competing runtime architecture against an unstable C8 source.

Allowed pre-C8-completion work:

1. fetch current official Google documentation and current SDK documentation;
2. compare C9's historical assumptions with current C8 source/runtime configuration;
3. record current `@google/genai` version and auth/client-construction capabilities;
4. refresh current availability/capability of conversational Live, Transcribe Live and Live Translate models;
5. refresh cost/quota/privacy/data-use matrix from official Google sources;
6. inspect whether current official SDKs now support Developer API OAuth/ADC Live cleanly;
7. inspect whether Gemini 3.5 Transcribe Live could be used as a separate STT front-end without replacing the conversational assistant, but do not implement or call the provider merely from this directive;
8. document whether the current C8 `developer_api_key` runtime is intentional temporary authority, permanent candidate, or something that must be reconciled with C9's governance model;
9. prepare a conflict/rebase plan for C9 against the stable reviewed C8 source.

No new OAuth consent, billing, API/auth key, provider session, production env change, deploy or firmware action is authorized.

### C9 implementation gate

Do not begin material C9 runtime implementation until C8 has reached a stable reviewed source boundary sufficient to avoid overwriting active voice repairs, unless the implementation is entirely isolated and Codex proves there is no shared-file conflict.

When C8 is stable, rebase/reconcile C9 and rerun A0-A5 from current evidence. Prefer the smallest architecture; do not add dormant runtime modes merely for architectural elegance.

Any proposal to change the production provider/model/auth surface must publish a human decision package containing:

```text
C9_RECOMMENDED_RUNTIME=
C9_RECOMMENDED_AUTH=
C9_RECOMMENDED_MODEL_OR_MODEL_CHAIN=
C9_WHY_CURRENT_C8_RUNTIME_LOSES_OR_WINS=
C9_EN_JA_CAPABILITY=
C9_SEARCH_AND_FUNCTION_CALLING=
C9_CALENDAR_SAFETY=
C9_OUTLOOK_ISOLATION=
C9_RECONNECT_RELIABILITY=
C9_LATENCY_EVIDENCE=
C9_QUOTA=
C9_MONTHLY_COST_5M_15M_30M_60M=
C9_DATA_USE_PRIVACY=
C9_CREDENTIAL_LIFECYCLE=
C9_ROLLBACK=
C9_PROVIDER_CALLS_REQUIRED_FOR_FINAL_PROOF=
C9_BILLING_ACTION_REQUIRED=
C9_INTERACTIVE_OAUTH_REQUIRED=
C9_PRODUCTION_DEPLOYMENT_REQUIRED=
C9_REVIEW_STATUS=
```

Then stop only at the smallest real human boundary.

## Cross-campaign conflict rules

1. Never deploy an older branch image over newer production without proving it contains all required accepted later runtime changes.
2. Never resolve shared-file conflicts by silently discarding another campaign's reviewed logic.
3. For every shared file, record provenance of the accepted version.
4. No branch may claim another campaign's physical acceptance.
5. No branch may inherit provider-call authority, deployment authority, firmware-flash authority, credential authority, billing authority, OAuth authority, private-data authority, merge authority, or release authority from another campaign.
6. A reviewer PASS on one branch is not a review of another branch's rebased/combined bytes.
7. If combining campaign changes becomes necessary for a release candidate, create an explicit integration/reconciliation stage, rerun impacted tests, freeze exact combined bytes, and obtain a fresh review before requesting deployment authority.
8. Do not merge PR #1, #2 or #3 automatically.

## Cross-campaign scheduler

At every controller loop:

1. fetch live metadata for PR #1, #2 and #3;
2. fetch each campaign's latest durable state/report at its exact live head;
3. classify every node as `READY`, `READONLY_READY`, `WAITING_DEVICE`, `WAITING_HUMAN`, `EXTERNALLY_BLOCKED`, `COMPLETE`;
4. choose the highest-priority safe READY node;
5. if none, choose the highest-priority READONLY_READY node;
6. if one campaign is WAITING_HUMAN, park it and continue another campaign;
7. after every meaningful stage, push durable evidence and then continue if portfolio READY/READONLY_READY remains;
8. return to the user only when all campaigns are simultaneously at genuine human/external boundaries or the requested portfolio is complete.

Do not use report pushes, tests, builds, reviewer PASS, reviewer REVISE, recoverable infrastructure failures, or branch switches as reasons to stop.

## Portfolio frontier schema

Maintain or publish a portfolio checkpoint containing:

```text
PORTFOLIO_MODE=PORTFOLIO_FRONTIER_DRIVEN_LONGRUN
PORTFOLIO_HEAD_OR_COORDINATION_SHA=
PORTFOLIO_CURRENT_CAMPAIGN=
PORTFOLIO_CURRENT_NODE=

C7_HEAD=
C7_STAGE=
C7_READY=
C7_READONLY_READY=
C7_WAITING_DEVICE=
C7_WAITING_HUMAN=
C7_EXTERNALLY_BLOCKED=
C7_NEXT_ACTION=

C8_HEAD=
C8_STAGE=
C8_READY=
C8_READONLY_READY=
C8_WAITING_DEVICE=
C8_WAITING_HUMAN=
C8_EXTERNALLY_BLOCKED=
C8_NEXT_ACTION=

C9_HEAD=
C9_STAGE=
C9_READY=
C9_READONLY_READY=
C9_WAITING_DEVICE=
C9_WAITING_HUMAN=
C9_EXTERNALLY_BLOCKED=
C9_NEXT_ACTION=

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

Do not exit with `PORTFOLIO_READY_NODE_COUNT > 0` or `PORTFOLIO_READONLY_READY_NODE_COUNT > 0` unless a higher-order safety/authority conflict makes execution impossible.

## Global human-only gates

Stop at the exact relevant boundary for:

- any merge or release;
- any new production deployment/restart not already explicitly authorized for the exact candidate;
- any firmware flash outside previously explicit artifact authority;
- physical NOTE4 button/mic/display acceptance;
- new provider-call budget after an authorized count is consumed;
- provider/model/auth changes;
- new credentials, key creation/rotation, OAuth/ADC setup or consent;
- billing or paid-tier activation;
- private-data scope expansion;
- Calendar or Outlook authority expansion;
- destructive storage/data/database action;
- unresolved P0/P1/security/privacy/data-integrity block;
- repository push/auth conflict;
- campaign-scope expansion beyond C7/C8/C9.

A human gate in one campaign does not prevent safe work in another campaign.

## Privacy and observability

Across all campaigns:

- never persist raw microphone audio;
- never persist raw provider payloads merely for debugging;
- never expose API keys, secret files, access/refresh tokens, auth headers, cookies, private device identifiers, SSID/MAC/IP identifiers, Calendar/Outlook private contents, or private NOTE4 payloads in reports;
- use structural status classes, counters, bounded timings and sanitized enums;
- preserve Outlook isolation from Gemini;
- preserve Google Calendar proposal/confirmation semantics.

## Review policy

Preserve each campaign's explicit reviewer contract unless a newer operator instruction changes it.

For Campaign 8, the canonical reviewer is Grok 4.6 using the established route:

`grok -m grok-4.6`

For Campaign 7 and Campaign 9, do not silently substitute reviewer roles from their current directives. If rebasing or materially changing those candidates invalidates their historical review, obtain the required fresh campaign-appropriate review before claiming release readiness.

No ZAI retry for Campaign 8. No silent reviewer fallback anywhere.

## Immediate portfolio action

1. Reconcile the exact live heads of PR #1, #2 and #3.
2. Treat Campaign 8 as P0 and verify its reviewed setup-restore authority boundary from the current live `CAMPAIGN-STATE.md`.
3. Do not cross that C8 deployment/provider boundary without explicit operator authority.
4. Because C8 is currently human-blocked, immediately open safe C7 work: reconcile PR #1 against the current integration/C8-era source, build a conflict/rebase/forward-port plan, and run any branch-local deterministic validation that does not require production writes.
5. In parallel or after the C7 safe frontier is consumed, perform C9 read-only current-source/current-official-doc reconciliation, explicitly comparing the historical Vertex-ADC conclusion to the current Campaign 8 runtime/auth reality.
6. Continue cycling among C7/C8/C9 according to portfolio READY/READONLY_READY state.
7. Return only when the entire portfolio has no safe work left and the next actions are genuine human/external gates.

This coordination directive does not authorize any merge, release, production deploy, firmware flash, provider session, credential/OAuth/billing action, or private-data expansion.

## Portfolio reconciliation checkpoint — 2026-09-10

The live GitHub reconciliation completed against PR #1, PR #2 and PR #3:

```text
PR1_HEAD=7c0ebae5e351f2650f4b8704532218d6be7b318d
PR1_STATE=OPEN
PR1_DRAFT=YES
PR1_MERGED=NO
PR2_HEAD=9cceb91683fd7446df6efa0ffd35bc886f4c307e
PR2_STATE=OPEN
PR2_DRAFT=YES
PR2_MERGED=NO
PR3_HEAD=61700ea8c5b7755aa39259a45554289ca01ff700
PR3_STATE=OPEN
PR3_DRAFT=YES
PR3_MERGED=NO
INTEGRATION_HEAD=2d4a2a9e9a380c591c2ac7f0f3120f1f7939b65d
```

Campaign 8 remains P0 and is parked at its exact new backend deployment plus
one-provider-session authority boundary. No C8 runtime, production, device,
credential, provider or billing action was taken.

Campaign 7 completed all safe branch-local work. Its live branch was already
based on current integration, had zero runtime-file overlap with C8, preserved
Campaign 6D firmware isolation, passed 283 backend tests, 6 shared tests,
typecheck, lint, format, frontend build, renderer/timezone tests and current
structural external probes. It is parked at separate deployment and physical
acceptance authority.

Campaign 9 completed current official-document and source reconciliation with
zero provider calls and no source/runtime change. The installed lockfile
version is `@google/genai@2.20.0`; official Developer API OAuth/ADC setup is
documented, but end-to-end Node Live OAuth remains unverified without a
project/ADC credential. Current official docs identify `gemini-3.1-flash-live-preview`
as the conversational Live candidate and `gemini-3.5-transcribe-live` as a
dedicated STT-only surface. C9 is parked at the optional architecture/auth,
OAuth and billing decision boundary.

```text
PORTFOLIO_MODE=PORTFOLIO_FRONTIER_DRIVEN_LONGRUN
PORTFOLIO_HEAD_OR_COORDINATION_SHA=da97df0d694c6678059dc1e1784e40b46d2077a8
PORTFOLIO_CURRENT_CAMPAIGN=C8
PORTFOLIO_CURRENT_NODE=C8_REVIEWED_SETUP_RESTORE_REQUIRES_NEW_BACKEND_DEPLOYMENT_AND_PROVIDER_AUTHORITY
C7_HEAD=7c0ebae5e351f2650f4b8704532218d6be7b318d
C7_STAGE=SOFTWARE_REVALIDATED_AGAINST_CURRENT_INTEGRATION_AND_C8_ERA
C7_READY=0
C7_READONLY_READY=0
C7_WAITING_DEVICE=1
C7_WAITING_HUMAN=1
C7_EXTERNALLY_BLOCKED=0
C7_NEXT_ACTION=AWAIT_SEPARATE_DEPLOYMENT_AND_PHYSICAL_ACCEPTANCE_AUTHORITY
C8_HEAD=da97df0d694c6678059dc1e1784e40b46d2077a8
C8_STAGE=M4_ZERO_PROVIDER_SETUP_DIAGNOSIS_COMPLETE_REVIEWED_SETUP_RESTORE_AWAITS_AUTHORITY
C8_READY=0
C8_READONLY_READY=0
C8_WAITING_DEVICE=0
C8_WAITING_HUMAN=1
C8_EXTERNALLY_BLOCKED=0
C8_NEXT_ACTION=AWAIT_EXACT_NEW_BACKEND_DEPLOYMENT_AND_ONE_PROVIDER_QUALIFICATION_AUTHORITY
C9_HEAD=61700ea8c5b7755aa39259a45554289ca01ff700
C9_STAGE=READONLY_RESEARCH_RECONCILED_AGAINST_CURRENT_C8_RUNTIME
C9_READY=0
C9_READONLY_READY=0
C9_WAITING_DEVICE=0
C9_WAITING_HUMAN=1
C9_EXTERNALLY_BLOCKED=0
C9_NEXT_ACTION=AWAIT_EXPLICIT_OAUTH_BILLING_PROVIDER_ARCHITECTURE_AUTHORITY_OR_RETAIN_CURRENT_C8_RUNTIME
PORTFOLIO_READY_NODE_COUNT=0
PORTFOLIO_READONLY_READY_NODE_COUNT=0
PORTFOLIO_WAITING_DEVICE_COUNT=1
PORTFOLIO_WAITING_HUMAN_COUNT=3
PORTFOLIO_EXTERNALLY_BLOCKED_COUNT=0
PORTFOLIO_HUMAN_ACTION_REQUIRED=YES
PORTFOLIO_HUMAN_ACTION_REASON=C8_EXACT_BACKEND_DEPLOYMENT_AND_ONE_PROVIDER_SESSION;C7_DEPLOYMENT_AND_PHYSICAL_ACCEPTANCE;C9_OPTIONAL_OAUTH_BILLING_ARCHITECTURE_DECISION
PORTFOLIO_TERMINAL_REASON=ALL_REMAINING_CAMPAIGNS_AT_GENUINE_HUMAN_AUTHORITY_BOUNDARIES
PORTFOLIO_NEXT_ACTION=AWAIT_MINIMUM_EXPLICIT_CAMPAIGN_AUTHORITY;NO_SAFE_READY_OR_READONLY_READY_NODE_REMAINS
```

No safe READY or READONLY_READY node remains. This is a portfolio-wide
authority boundary, not a campaign completion or merge/release event.
