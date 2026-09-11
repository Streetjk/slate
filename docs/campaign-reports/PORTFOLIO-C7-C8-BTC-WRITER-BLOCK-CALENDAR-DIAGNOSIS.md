# C7/C8 consumed requalification and BTC weekly-only diagnosis

Date: 2026-09-11 (Australia/Perth)

## Live reconciliation

```text
LIVE_PR2_HEAD_AT_RECONCILIATION=c003bede1ae4e2b4b96fd352facffcc8027ca38a
PR1_HEAD=641e358f7067d7e314e4f2c1eb18258690268cab
PR2_HEAD=c003bede1ae4e2b4b96fd352facffcc8027ca38a
PR3_HEAD=61700ea8c5b7755aa39259a45554289ca01ff700
PR4_HEAD=e9a6cfac86c63cb461a62d5029080332fac06865
ALL_PRS=OPEN_DRAFT_UNMERGED
```

The physical requalification is consumed. No physical action, provider call,
deployment, firmware flash, reset, pairing, Wi-Fi change, OAuth action or
credential action was performed in this checkpoint.

```text
PHYSICAL_REQUALIFICATION_CONSUMED=YES
PHYSICAL_REQUALIFICATION_PENDING=NO
AUTO_REPEAT_AUTHORIZED=NO
C7_MONTH_CALENDAR_RESULT=FAIL_CHINESE_LUNAR_NO_WA_HOLIDAY_AFTER_REPAIR_DEPLOYMENT
C7_OUTLOOK_RESULT=PASS_SAFE_ENGLISH_ERROR_EXPECTED_UNCONFIGURED_OAUTH
C7_WEATHER_RESULT=FAIL_VISIBLE_INVALID_CONFIGURATION_AFTER_REPAIR_DEPLOYMENT
C7_GOOGLE_NEWS_RESULT=PASS_PARTIAL_OPERATOR_REPORTED
C8_JAPANESE_GLYPH_RESULT=FAIL_MISSING_GLYPH_SQUARE_AFTER_EXACT_APP_FLASH
```

## Calendar read-only diagnosis

The read-only production record and exact source path provide the following
structural evidence:

```text
C7_MONTH_CALENDAR_PERSISTED_TYPE=month_calendar
C7_MONTH_CALENDAR_PERSISTED_CONFIG_LOCALE=ABSENT_FROM_SHARED_CONFIG_SCHEMA
C7_MONTH_CALENDAR_PERSISTED_CONFIG_TIMEZONE=Australia/Perth
C7_MONTH_CALENDAR_LAST_RENDER_TIMESTAMP_CLASS=WITHIN_24H
C7_MONTH_CALENDAR_API_FRAME_IDENTITY_OR_ETAG_CLASS=PRESENT_NOT_EXPOSED
C7_MONTH_CALENDAR_ACTIVE_PROVIDER_PATH=MonthCalendarProvider->CalendarDataService
C7_MONTH_CALENDAR_ACTIVE_RENDERER_PATH=DynamicFrameRendererService->renderMonthCalendarFrame
C7_MONTH_CALENDAR_EFFECTIVE_LOCALE=en-AU_HARDCODED_RENDERER_WEEKDAY_LABELS
C7_MONTH_CALENDAR_EFFECTIVE_TIMEZONE=Australia/Perth
C7_MONTH_CALENDAR_WA_HOLIDAY_TABLE_REACHABLE_FROM_ACTIVE_PATH=YES
C7_MONTH_CALENDAR_STALE_RENDER_OR_CACHE=NOT_PROVEN_PHYSICAL_FRAME_MISMATCH_REMAINS
C7_MONTH_CALENDAR_FIRST_FAILED_BOUNDARY=PHYSICAL_FRAME_OR_ACTIVE_DEVICE_ARTIFACT_AFTER_SERVER_RENDER
C7_MONTH_CALENDAR_ROOT_CAUSE=UNRESOLVED_PHYSICAL_FRAME_CACHE_OR_ACTIVE_ARTIFACT_MISMATCH
```

The current provider constructs the Perth calendar data and reaches the WA
holiday table. The current monthly renderer emits English weekday labels and
uses the configured timezone; its month-cell subtitle helper selects public
holidays rather than lunar annotations. Therefore the photographed Chinese
and lunar presentation cannot be assigned to the current source path without
new structural evidence. No card was deleted or recreated and no production
mutation was made.

## BTC creation and persistence diagnosis

```text
BTC_TRIO_CREATION_ENTRYPOINT=POST_groups/:groupId/contents/btc-trio->DynamicContentService.appendBtcTrio->createBtcTrioRequests->append
BTC_EXISTING_DAILY_TILE_PERSISTED=YES_COUNT_1_READ_ONLY
BTC_EXISTING_WEEKLY_TILE_PERSISTED=YES_COUNT_1_READ_ONLY
BTC_EXISTING_MONTHLY_TILE_PERSISTED=YES_COUNT_1_READ_ONLY
BTC_STARTUP_AUTO_RECREATION=NOT_FOUND_IN_EXACT_SOURCE_TRACE
BTC_SAFE_MIGRATION_REQUIRED=YES_TARGETED_BTC_ONLY_CONSOLIDATION_REQUIRED_FOR_EXISTING_EXTRAS
BTC_TARGET_VISIBLE_TILE_COUNT=1
BTC_TARGET_VISIBLE_PERIOD=weekly
BTC_WEEKLY_WINDOW=7_DAYS
BTC_WEEKLY_GRANULARITY=1_HOUR
BTC_WEEKLY_MAX_POINTS=168
```

The exact current implementation still defines `BTC_TRIO_PERIODS` as Daily,
Weekly and Monthly and appends all three requests. The read-only production
count proves that the existing three records are persisted content, not only a
frontend default. No startup recreation path was found. A safe implementation
must therefore change the default endpoint to one idempotent Weekly request
and handle only existing BTC Daily/Monthly/duplicate Weekly records through a
targeted deterministic migration; broad deletion and unrelated content
changes remain forbidden.

The baseline trio tests currently pass only because they assert the obsolete
three-request behavior. The provider-disabled weekly semantics remain
unchanged in source. The isolated worktree lacks installed workspace
dependencies, so tests importing Nest modules fail closed with a missing
`@nestjs/common` module; this is an environment limitation, not a product
verdict. The firmware font coverage test passes for the previously reviewed
source, but does not overturn the consumed physical missing-glyph evidence.

## Writer boundary

```text
CONTROLLER=CODEX_CLI
IMPLEMENTATION_WRITER_PROVIDER=Z.AI
IMPLEMENTATION_WRITER_MODEL=glm-5.3-flash
WRITER_STATUS=BLOCKED_ZAI_GLM_5_3_FLASH
WRITER_FAILURE_BOUNDARY=EXACT_MODEL_SESSION_AUTHENTICATION_BEFORE_EXECUTION
WRITER_RESULT=NO_COMPLETION_NO_WORKTREE_CHANGE
SILENT_WRITER_FALLBACK=NO
CANONICAL_REVIEWER=grok -m grok-4.6
```

The exact Z.ai `glm-5.3-flash` execution ended before implementation after an
authentication failure and no terminal result. No AGY, alternate model,
alternate provider or local implementation was substituted. The BTC repair
therefore remains externally blocked and no product source or artifact was
changed.

## Durable frontier

```text
CURRENT_STAGE=C7_C8_CONSUMED_PHYSICAL_EVIDENCE_BTC_REPAIR_WRITER_BLOCKED
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_DEVICE_COUNT=0
WAITING_HUMAN_COUNT=0
EXTERNALLY_BLOCKED_COUNT=1
CURRENT_BLOCKED_NODE=BTC_WEEKLY_ONLY_IMPLEMENTATION_ZAI_GLM_5_3_FLASH_AUTHENTICATION
HUMAN_ACTION_REQUIRED=NO
HUMAN_ACTION_REASON=NONE
TERMINAL_REASON=EXTERNAL_WRITER_INFRASTRUCTURE_BLOCK_AFTER_SAFE_READONLY_DIAGNOSIS
NEXT_ACTION=RESUME_EXACT_ZAI_GLM_5_3_FLASH_WRITER_WHEN_EXISTING_AUTHENTICATION_IS_OPERATIONAL; THEN_IMPLEMENT_TEST_FREEZE_AND_GROK_REVIEW
```

No deployment or reflash authority is requested by this report. C9 remains
parked research-only and C10 remains isolated and undeployed.
