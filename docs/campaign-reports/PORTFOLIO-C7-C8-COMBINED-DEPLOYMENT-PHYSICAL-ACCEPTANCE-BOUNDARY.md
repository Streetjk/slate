# Portfolio C7+C8 combined deployment and physical acceptance boundary

Date: 2026-09-10 (Australia/Perth)

## Purpose

Define the exact next human authority boundary after Campaign 8 restored Gemini 2.5 session compatibility and passed one bounded synthetic EN/JA provider qualification, and after Campaign 7 was forward-combined with the accepted Campaign 8 source, deterministically qualified, independently reviewed, and frozen as an ARM64 backend artifact.

This document does **not** itself authorize deployment, provider use, firmware action, physical testing, merge, or release. It prepares the smallest next authority package so the operator can explicitly approve it.

Preserve:

- `docs/campaign-reports/PORTFOLIO-LONGRUN-CONTROLLER-C7-C8-C9.md`
- `docs/campaign-reports/PORTFOLIO-AUTHORITY-SEQUENCING-C8-C7-C9.md`
- `docs/campaign-reports/AUTONOMY-AND-HUMAN-GATE-POLICY.md`
- `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`
- `docs/campaign-reports/08D1M-G-M4-EXACT-RESTORE-DEPLOYMENT-AND-PROVIDER-QUALIFICATION-RESULT.md`
- `docs/campaign-reports/08D1M-G-C7-C8-COMBINED-CANDIDATE-RECONCILIATION.md`
- the exact live `CAMPAIGN-STATE.md` at execution time.

PR #1, #2 and #3 must remain OPEN / DRAFT / UNMERGED unless the operator separately authorizes merge/release.

## Accepted evidence entering this boundary

```text
C8_RESTORE_SOURCE=f0dfdad0b4065e48ff8bc82aa505706d40fd9f4c
C8_RESTORE_PROVIDER_QUALIFICATION=PASS_SYNTHETIC_PROVIDER_BRIDGE
C8_PROVIDER_SESSION_ESTABLISHED=YES
C8_EN_INPUT_TRANSCRIPTION=YES
C8_JA_INPUT_TRANSCRIPTION=YES
C8_EN_PROVIDER_OUTPUT=YES
C8_JA_PROVIDER_OUTPUT=YES
C8_CLEAN_CHILD_EXIT=YES
C8_LANGUAGE_CODES_FIELD=ABSENT_EXPECTED_GEMINI25_COMPATIBILITY
C8_FIRMWARE_CHANGED=NO

C7_C8_COMBINED_SOURCE_COMMIT=20c4c3eed2e2d87fd4570039b29e5e5fa64e89d4
C7_C8_COMBINED_BACKEND_TAG=slate:m4-c7-c8-combined-8fcf7c6
C7_C8_COMBINED_ARM64_IMAGE_ID=sha256:9c3e557d8a2df7a1ffd8d15292e7ccc8134be4893c69ad2740691866eb35768f
C7_C8_COMBINED_ARTIFACT_FREEZE=PASS_LOCAL_ARM64_DOCKER_BUILD
C7_C8_COMBINED_REVIEW=PASS_AGY_GEMINI37_MEDIUM_P0_0_P1_0_P2_0_SECURITY_0
C7_C8_PRODUCT_RUNTIME_OVERLAP=0
C8_ASSISTANT_TREE_CHANGED_FROM_ACCEPTED_RESTORE=0
C8_FIRMWARE_TREE_CHANGED_FROM_ACCEPTED_RESTORE=0
C7_FIRMWARE_CHANGED=NO
BACKEND_TESTS=400_PASS_5_SKIP_0_FAIL
SHARED_TESTS=6_PASS_0_FAIL
FRONTEND_TYPECHECK=PASS
FRONTEND_BUILD=PASS
BACKEND_TYPECHECK=PASS
ROOT_LINT=PASS
PRIVACY_SECRET_SCAN=PASS
GIT_DIFF_CHECK=PASS
```

The combined candidate adds Campaign 7 dynamic-content/backend/shared/frontend functionality to the accepted Campaign 8 voice runtime without changing the accepted C8 assistant or firmware trees. The only historical shared-file conflict was coordination state and was resolved explicitly.

## Exact next authority package

The preferred next human authorization is one combined boundary:

```text
AUTHORITY_REQUEST=C7_C8_EXACT_COMBINED_BACKEND_DEPLOYMENT_AND_ONE_BOUNDED_NOTE4_PHYSICAL_ACCEPTANCE
PRODUCTION_BACKEND_SOURCE=20c4c3eed2e2d87fd4570039b29e5e5fa64e89d4
PRODUCTION_BACKEND_TAG=slate:m4-c7-c8-combined-8fcf7c6
PRODUCTION_ARM64_IMAGE_ID=sha256:9c3e557d8a2df7a1ffd8d15292e7ccc8134be4893c69ad2740691866eb35768f
FIRMWARE_ACTION=NONE
MYSQL_RECREATE=NO
NOTE4_RESET_BEFORE_ACCEPTANCE=NO
NOTE4_REPAIR_OR_WIFI_CHANGE=NO
EXTRA_SYNTHETIC_PROVIDER_SESSION=NO
C9_AUTH_OR_BILLING_ACTION=NO
```

No deployment or physical test may begin until the operator explicitly authorizes this exact package or a narrower subset.

## Deployment execution after explicit authorization

Before changing production:

1. reconcile PR #1, #2 and #3 live states;
2. verify the exact combined source/image identities above remain the reviewed/frozen candidate;
3. verify no runtime bytes changed since combined review/freeze;
4. verify current production is the accepted C8 restore runtime and is healthy;
5. verify MySQL/data/network/secret mounts/approved Gemini model-provider-auth configuration;
6. verify no firmware action is required.

Then, if and only if explicit authority matches the exact candidate:

- deploy/recreate only the Slate backend container as required to activate the frozen combined image;
- do not recreate MySQL;
- preserve existing data, network, database identity, credentials, protected secret mount, Gemini provider/model/auth, NOTE4 identity and firmware;
- do not flash, reset, re-pair or change Wi-Fi merely to deploy C7+C8;
- verify exact running backend image/config identity, Slate/MySQL health, restart counts, local/public HTTP health, NOTE4 authenticated polling, and observer state;
- if any deployment identity/config/health gate fails, do not begin physical acceptance; diagnose provider-free and rollback only under existing safe rollback authority.

## One bounded physical NOTE4 acceptance

After deployment health gates pass, request exactly one operator physical acceptance package. It may include ordinary navigation between screens and exactly one continuous Voice AI session. No separate reset/power cycle/re-pair is part of acceptance.

### C8 Voice acceptance

Use one short continuous Voice AI session of up to 6 non-sensitive turns, alternating EN/JA where practical. The exact wording need not be semantically identical if the operator naturally speaks, but keep prompts short and factual.

Preferred sequence:

1. EN — How many days are in a week?
2. JA — 日本の首都はどこですか？
3. EN — How many minutes are in an hour?
4. JA — 一年は何ヶ月ありますか？
5. EN — What planet do we live on?
6. JA — 日本の通貨は何ですか？

Observe without requiring the operator to measure milliseconds:

```text
VOICE_SESSION_STARTED=YES|NO
EARLY_REPLY_SPEED=FAST|ACCEPTABLE|SLOW|UNKNOWN
LATE_REPLY_SPEED=FAST|ACCEPTABLE|SLOW|UNKNOWN
AUDIO_INPUT_TO_USER_TEXT_SPEED=FAST|ACCEPTABLE|SLOW|UNKNOWN
PROGRESSIVE_LATENCY_DEGRADATION=YES|NO|UNKNOWN
APPARENT_FREEZE=YES|NO
VOICE_SERVICE_ERROR=YES|NO
BUBBLE_ORDER_CORRECT=YES|NO|UNKNOWN
ONE_BUBBLE_PER_ROLE_BEHAVIOR=PASS|FAIL|UNKNOWN
JAPANESE_TRANSCRIPTION_LANGUAGE=JA_CORRECT|MISHEARD_AS_ZH_OR_OTHER|MIXED|UNKNOWN
JAPANESE_KANA_RENDERING=PASS|FAIL|UNKNOWN
JAPANESE_NO_GLYPH=PASS|FAIL|UNKNOWN
AUDIBLE_ASSISTANT_AUDIO=PASS|FAIL|UNKNOWN
VOICE_AI_EXIT=PASS|FAIL|UNKNOWN
UNEXPECTED_REBOOT_OR_SETTINGS_RETURN=YES|NO|UNKNOWN
```

Important: real-accent Japanese-vs-Chinese ASR remains an acceptance question. The synthetic provider test only proved structural EN/JA handling and must not be used to claim real-accent ASR PASS.

Do not ask the operator to repeat the Voice session immediately if it fails or is ambiguous. One attempt is consumed; ingest structural evidence first.

### C7 physical acceptance

Using normal NOTE4 navigation, verify the combined deployment renders and refreshes:

1. built-in daily calendar — English visible text, Perth date/time context;
2. month calendar — English weekday headings and correct WA public-holiday marking where applicable to the displayed month;
3. Outlook calendar — Perth-local 24-hour event time formatting, without changing Outlook read-only semantics;
4. Weather — Perth current conditions and forecast update successfully, English/metric;
5. Google News AU mode — visible AU English headlines;
6. Google News TW mode — visible Taiwan Traditional Chinese headlines;
7. Google News Both mode — both sections visible/usable without pathological crowding or redraw behaviour.

Record:

```text
C7_DAILY_CALENDAR_PHYSICAL=PASS|FAIL|UNKNOWN
C7_MONTH_CALENDAR_PHYSICAL=PASS|FAIL|UNKNOWN
C7_OUTLOOK_PERTH_24H_PHYSICAL=PASS|FAIL|UNKNOWN
C7_WEATHER_PERTH_PHYSICAL=PASS|FAIL|UNKNOWN
C7_GOOGLE_NEWS_AU_PHYSICAL=PASS|FAIL|UNKNOWN
C7_GOOGLE_NEWS_TW_PHYSICAL=PASS|FAIL|UNKNOWN
C7_GOOGLE_NEWS_BOTH_PHYSICAL=PASS|FAIL|UNKNOWN
```

If a tile requires configuration that cannot be changed safely under the current UI/state without new credential/private-data authority, mark it `UNKNOWN_AUTHORITY_BOUNDARY` rather than expanding authority silently.

## Structural evidence during physical acceptance

Use only sanitized observability already authorized by the campaign. Where available record:

```text
VOICE_WS_AUTH=
VOICE_WS_ACCEPTED=
PROVIDER_SESSION_STATUS=
FIRST_MIC_FRAME_STATUS=
T_AUDIO_INPUT_COMMIT_OR_TURN_END=
T_PROVIDER_INPUT_TRANSCRIPTION_FIRST_PARTIAL=
T_BACKEND_USER_TRANSCRIPT_FLUSH=
T_USER_BUBBLE_EVENT_POSTED=
T_PROVIDER_READY=
T_PROVIDER_FIRST_OUTPUT=
PRE_PROVIDER_MIC_QUEUE_TREND=
BACKEND_EVENT_QUEUE_TREND=
FIRMWARE_UI_EVENT_QUEUE_TREND=
FIRMWARE_AUDIO_QUEUE_TREND=
HEAP_INTERNAL_FREE_TREND=
HEAP_PSRAM_FREE_TREND=
RESET_REASON_CLASS=
WATCHDOG_REASON_CLASS=
VOICE_WS_CLOSE_CLASS=
FATAL_MARKER_COUNT=
SLATE_RESTART_COUNT=
MYSQL_RESTART_COUNT=
```

Do not persist raw mic audio, transcript text, provider payloads, keys, auth headers, tokens, device identifiers, Calendar/Outlook private payloads, or other private content.

## Acceptance classification

C8 stability can PASS even if baseline provider latency remains consistently slow; in that case open/continue a separate latency optimization node rather than treating stable-slow as a freeze regression.

C8 real-accent bilingual ASR may FAIL independently of stability. If Japanese is again interpreted as Chinese while the session is otherwise stable, classify it as a distinct bilingual ASR limitation and do not reintroduce the unsupported Gemini-2.5 `languageCodes` setup field.

C7 screen failures should be classified per provider/render/UI boundary and should not automatically invalidate C8 voice acceptance.

On any failure/ambiguity:

- consume the physical attempt;
- do not blind-repeat;
- preserve exact operator observations;
- ingest sanitized structural evidence;
- continue all safe deterministic/provider-disabled diagnosis;
- for material C8 runtime changes use Codex adjudication -> AGY `gemini-3.8-flash-high` minimum repair -> focused tests -> privacy scan -> exact freeze -> fresh Grok 4.6 review;
- for material C7 changes preserve the C7 independent-review contract and rerun impacted combined tests/review;
- request a new provider/deployment/physical/firmware authority only when it is the sole remaining useful node.

## Campaign 9

Campaign 9 remains parked research-only during this boundary:

```text
C9_DISPOSITION=RETAIN_CURRENT_ACCEPTED_C8_RUNTIME_AND_KEEP_C9_RESEARCH_ONLY
C9_OAUTH_ACTION=NO
C9_BILLING_ACTION=NO
C9_PROVIDER_ARCHITECTURE_CHANGE=NO
```

Do not couple C9 OAuth/billing/provider architecture experimentation to C7+C8 acceptance.

## Portfolio continuation

After the authorized physical package is consumed:

- if C8 and C7 pass, publish a combined acceptance dossier and continue safe release-readiness/integration reconciliation without merging;
- if only C8 passes, preserve that result and isolate C7 repair;
- if only C7 passes, preserve that result and isolate C8 repair;
- if either is ambiguous, do not erase the successful portion;
- continue automatically while portfolio READY or READONLY_READY work remains;
- do not merge/release automatically.

Before controller exit publish:

```text
PORTFOLIO_CURRENT_PRIORITY=
C7_HEAD=
C7_STAGE=
C7_PHYSICAL_ACCEPTANCE=
C7_READY=
C7_READONLY_READY=
C7_NEXT_ACTION=
C8_HEAD=
C8_STAGE=
C8_PHYSICAL_ACCEPTANCE=
C8_REAL_ACCENT_ASR=
C8_STABILITY=
C8_INPUT_LATENCY=
C8_READY=
C8_READONLY_READY=
C8_NEXT_ACTION=
C9_HEAD=
C9_STAGE=
C9_DISPOSITION=
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

No exit with portfolio READY/READONLY_READY > 0 unless a higher-order safety/authority conflict prevents further work.
