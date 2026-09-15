# Portfolio long-run continuation after C7/C8 activation

Date: 2026-09-11 (Australia/Perth)

This directive governs the long-running multi-campaign controller after the exact reviewed C7/C8 backend deployment and application-only NOTE4 firmware flash recorded in `PORTFOLIO-C7-C8-DEPLOYMENT-AND-FLASH-RESULT.md`.

It does not authorize merge/release, new provider/model/auth changes, Microsoft OAuth consent, new credentials, billing changes, C10 deployment, C9 activation, or any second firmware flash/deployment beyond what has already been completed.

```text
PORTFOLIO_MODE=PORTFOLIO_FRONTIER_DRIVEN_LONGRUN
CONTROLLER=CODEX_CLI
IMPLEMENTATION_WRITER_PROVIDER=Z.AI
IMPLEMENTATION_WRITER_MODEL=glm-5.3-flash
CANONICAL_REVIEWER=grok -m grok-4.6
SILENT_WRITER_FALLBACK=NO
SILENT_REVIEWER_FALLBACK=NO
CHECKPOINT_PUSH_IS_NOT_A_STOP=YES
INTERMEDIATE_STAGE_SUCCESS_IS_NOT_A_STOP=YES
CONTINUE_AFTER_REVIEW_PASS=YES
CONTINUE_AFTER_REVIEW_REVISE=YES_WHILE_SAFE_REPAIR_EXISTS
CONTINUE_AFTER_RECOVERABLE_INFRA_FIX=YES
BLOCKED_LANE_DOES_NOT_STOP_UNRELATED_SAFE_LANE=YES
EXHAUSTED_OR_PARKED_LANE_DOES_NOT_SPIN=YES
REPORT_PUSH_INVARIANT=REQUIRED
```

## Current exact C7/C8 activated identities

```text
BACKEND_SOURCE=6d6bd5ddd2d6c463d094f17b4e756cc820131474
BACKEND_IMAGE=sha256:684849bb2bf8e0bc261b9dc973d7e5d23e69460772995bfd6be3426ff493b4e5
BACKEND_REVIEW=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
BACKEND_RUNNING=YES_EXACT_LOAD_EQUIVALENT

FIRMWARE_APP_SHA256=0b4c9f1c989cf3157ef54d9a904bc33c05e202f3c31d4d2661b16a18bc32619a
FIRMWARE_APP_BYTES=2535312
FIRMWARE_APP_PARTITION_BYTES=4194304
VOICE_FONT_SHA256=99c2673c97bd17c8a378e64236abe46cfcdd04933ecd5b5a6cda692ae46a8bb0
FIRMWARE_FLASHED=YES_APPLICATION_PARTITION_ONLY_HASH_VERIFIED
FIRMWARE_REVIEW=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
```

Do not redeploy or reflash these exact bytes merely to reconfirm them.

## Current next boundary

The next active node is exactly one bounded combined C7/C8 NOTE4 physical requalification.

Before arming it, reconcile live GitHub and verify the deployed runtime remains healthy and the exact activated identities are unchanged. If health/identity is not preserved, stop and diagnose that boundary instead of consuming the physical test.

The physical requalification is a single operator-assisted cycle. It must not be repeated automatically.

### C7 Weather

Use the existing Perth Weather card. Do not delete/recreate it.

Verify:

```text
WEATHER_INVALID_CONFIGURATION_ERROR_PRESENT=
WEATHER_CONTENT_LOADS=
WEATHER_PERTH_LOCATION_CORRECT=
WEATHER_ENGLISH_TEXT=
WEATHER_METRIC_UNITS=
WEATHER_ICON_VALID=
WEATHER_UNKNOWN_QUESTION_MARK_ICON_PRESENT=
```

The current structural diagnosis says the saved Open-Meteo Perth configuration is valid and the earlier visible error was stale derived render state. A normal refreshed successful render should therefore clear the error without migration.

### C7 Monthly calendar

Verify the deployed repaired monthly-calendar path:

```text
MONTH_CALENDAR_ENGLISH_WEEKDAY_HEADERS=
MONTH_CALENDAR_CHINESE_LUNAR_ANNOTATIONS_PRESENT=
MONTH_CALENDAR_TIMEZONE=Australia/Perth
MONTH_CALENDAR_LOCALE=en-AU
MONTH_CALENDAR_WA_PUBLIC_HOLIDAY_MARKING=
```

The deterministic repair restores the Campaign 7 English Perth renderer and versioned WA public-holiday wiring. Do not judge the holiday path as failed solely because the currently visible date has no holiday; use a supported date/navigation path when practical and otherwise preserve deterministic fixture PASS without inventing physical evidence.

### C7 Google News

Perform only a quick regression check. Preserve the already-observed partial PASS unless new evidence contradicts it.

```text
GOOGLE_NEWS_UNKNOWN_DYNAMIC_TYPE_ERROR_PRESENT=
GOOGLE_NEWS_GENERAL_OPERATION=
```

Do not reopen AU/TW/Both implementation merely because those modes were not separately physically confirmed.

### C7 Outlook

Current proven root cause is missing Microsoft OAuth configuration. The safe English error path is expected.

Verify only:

```text
OUTLOOK_VISIBLE_RESPONSE=
OUTLOOK_SAFE_ENGLISH_ERROR=
OUTLOOK_CHINESE_ERROR_PRESENT=
OUTLOOK_SILENT_NOOP=
```

Do not require successful Microsoft sign-in during this C7/C8 requalification.

Do not add Microsoft credentials, initiate consent, expand scopes, or access private Outlook data. `Calendars.Read` remains the maximum approved scope. Actual Outlook connection is a separate optional future authority boundary.

### C8 Voice/Japanese glyph

Use one short normal Voice session only. Ordinary production Voice traffic for this acceptance is allowed; no separate synthetic/provider qualification session is authorized.

Verify:

```text
VOICE_SESSION_ESTABLISHED=
VOICE_ASSISTANT_AUDIO_AUDIBLE=
VOICE_BUBBLE_ORDER_CORRECT=
VOICE_PROGRESSIVE_LAG=
VOICE_FREEZE=
VOICE_EXIT_CLEAN=
JAPANESE_U66C7_SQUARE_PRESENT=
JAPANESE_ANY_NEW_MISSING_GLYPH_SQUARE_PRESENT=
JAPANESE_WRONG_BOPOMOFO_GLYPH_PRESENT=
```

The firmware repair specifically restores direct Voice-font coverage for U+66C7 (`曇`) and broad representative coverage tests. Do not claim glyph PASS unless physical evidence supports it.

## After the one physical requalification

Immediately mark:

```text
PHYSICAL_REQUALIFICATION_CONSUMED=YES
AUTO_REPEAT_AUTHORIZED=NO
```

Ingest explicit operator observations plus sanitized structural observer evidence only.

Preserve successful subresults independently. Do not turn one failing subtest into a blanket campaign failure.

If all C7/C8 acceptance targets pass, mark the C7/C8 technical implementation lanes complete/parked pending only optional merge/release authority. Do not merge or release automatically. Then reconcile all remaining campaign lanes.

If a material defect remains, continue safe deterministic/provider-disabled diagnosis automatically. Do not request another physical test until safe diagnosis and exact reviewed repair artifacts are complete.

For new material implementation work, the mandatory repair loop is:

```text
Codex adjudication
-> Z.ai glm-5.3-flash minimum justified implementation
-> deterministic tests
-> impacted typecheck/lint/format/build
-> privacy/secret scan
-> git diff --check
-> exact source/artifact freeze
-> fresh grok -m grok-4.6 review
```

If Grok returns REVISE, return to Codex adjudication and Z.ai `glm-5.3-flash`; do not silently substitute another writer or reviewer.

If a backend/shared/frontend repair is reviewed PASS, stop only at the exact changed-backend deployment authority boundary.

If a firmware repair is reviewed PASS, stop only at the exact app-only flash authority boundary.

Do not bundle unrelated authority.

## Multi-campaign lane policy

Reconcile C7, C8, C9 and C10 independently at every durable checkpoint.

Current expected non-C7/C8 lanes:

```text
C9_STAGE=PARKED_RESEARCH_ONLY
C9_READY_NODE_COUNT=0
C9_READONLY_READY_NODE_COUNT=0
C9_HUMAN_ACTION_REQUIRED=NO
C9_NEXT_ACTION=REMAIN_PARKED_BY_DESIGN

C10_STAGE=ISOLATED_USAGE_TILES_REVIEWED_NOT_DEPLOYED
C10_READY_NODE_COUNT=0
C10_READONLY_READY_NODE_COUNT=0
C10_HUMAN_ACTION_REQUIRED=NO
C10_NEXT_ACTION=REMAIN_ISOLATED_AND_UNDEPLOYED
```

Do not reopen C9 merely because C7/C8 reaches a gate. No OAuth consent, project creation, billing, credentials, provider experiment, or production auth change without explicit operator authority.

Do not deploy C10 merely because other lanes become idle. Do not manufacture metric work through browser cookies, credential files, undocumented private endpoints, or billable/model calls.

Do not create C11/C12 solely to avoid a legitimate idle state.

A blocked campaign does not stop another independent READY/READONLY_READY lane. A parked/exhausted campaign does not create busywork.

A portfolio-level stop is valid only when aggregate READY and READONLY_READY are zero and all unfinished lanes are either parked/exhausted, at a genuine immediate human/device authority boundary, or externally blocked after bounded retry.

## Durable checkpoint invariant

For every meaningful stage transition, failure, repair, review verdict, deployment/flash result, physical result, human boundary, or terminal portfolio state:

1. update the relevant campaign report;
2. update `CAMPAIGN-STATE.md` if the frontier changed;
3. `git diff --check`;
4. perform a secret/privacy-safe scan where applicable;
5. selectively commit and push;
6. fetch-verify the exact SHA;
7. verify PR states;
8. immediately inspect every campaign lane again before controller exit.

Keep PRs #1, #2, #3 and #4 OPEN / DRAFT / UNMERGED unless the operator explicitly authorizes merge/release.

## Required frontier output before controller exit

Publish:

```text
PORTFOLIO_CURRENT_HEAD=
PORTFOLIO_CURRENT_PRIORITY=
PORTFOLIO_ACTIVE_CAMPAIGNS=

C7_STAGE=
C7_READY_NODE_COUNT=
C7_READONLY_READY_NODE_COUNT=
C7_WAITING_DEVICE_COUNT=
C7_WAITING_HUMAN_COUNT=
C7_EXTERNALLY_BLOCKED_COUNT=
C7_CURRENT_BLOCKED_NODE=
C7_HUMAN_ACTION_REQUIRED=
C7_NEXT_ACTION=

C8_STAGE=
C8_READY_NODE_COUNT=
C8_READONLY_READY_NODE_COUNT=
C8_WAITING_DEVICE_COUNT=
C8_WAITING_HUMAN_COUNT=
C8_EXTERNALLY_BLOCKED_COUNT=
C8_CURRENT_BLOCKED_NODE=
C8_HUMAN_ACTION_REQUIRED=
C8_NEXT_ACTION=

C9_STAGE=
C9_READY_NODE_COUNT=
C9_READONLY_READY_NODE_COUNT=
C9_WAITING_HUMAN_COUNT=
C9_EXTERNALLY_BLOCKED_COUNT=
C9_NEXT_ACTION=

C10_STAGE=
C10_READY_NODE_COUNT=
C10_READONLY_READY_NODE_COUNT=
C10_WAITING_HUMAN_COUNT=
C10_EXTERNALLY_BLOCKED_COUNT=
C10_NEXT_ACTION=

PORTFOLIO_READY_NODE_COUNT=
PORTFOLIO_READONLY_READY_NODE_COUNT=
PORTFOLIO_WAITING_DEVICE_COUNT=
PORTFOLIO_WAITING_HUMAN_COUNT=
PORTFOLIO_EXTERNALLY_BLOCKED_COUNT=
PORTFOLIO_CURRENT_BLOCKED_NODE=
PORTFOLIO_HUMAN_ACTION_REQUIRED=
PORTFOLIO_HUMAN_ACTION_REASON=
PORTFOLIO_TERMINAL_REASON=
PORTFOLIO_NEXT_ACTION=
```

Do not exit while aggregate READY_NODE_COUNT > 0 or READONLY_READY_NODE_COUNT > 0 unless a mechanically documented higher-order safety/authority conflict prevents execution.
