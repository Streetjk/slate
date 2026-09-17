# Evidence-first C7/C8 multi-mission checkpoint

Date: 2026-09-12 (Australia/Perth)

This checkpoint reconciles the live PR #2 head `41ed09603681e1a8cf0f4987a226440d2dd9de33` and executes the safe M00-M07 work permitted by the evidence-first plan. It does not activate production, flash firmware, consume a provider session, or request a physical test.

## Live control bus

```text
PR1=OPEN_DRAFT_UNMERGED head=641e358f7067d7e314e4f2c1eb18258690268cab
PR2=OPEN_DRAFT_UNMERGED head=41ed09603681e1a8cf0f4987a226440d2dd9de33
PR3=OPEN_DRAFT_UNMERGED head=61700ea8c5b7755aa39259a45554289ca01ff700
PR4=OPEN_DRAFT_UNMERGED head=e9a6cfac86c63cb461a62d5029080332fac06865
SOURCE_TREE=f5c444ad65667d2c2b46484d8720ad055f34ba29
EVIDENCE_PLAN_BLOB=da9f49b0df4bd73da445219b36913529d9b4918b
COLLECTOR_BLOB=f5a14ce0b573406648be3e28b12e559e332b8cc1
PRODUCT_BYTE_DIFF_FROM_HISTORICAL_REVIEWED_SOURCE=0
HISTORICAL_REVIEWED_SOURCE=b235f67b2ace99a6b3112ec0754fb5ba068dc228
HISTORICAL_GROK_REVIEW=PASS_P0_0_P1_0_P2_0_SECURITY_0
HISTORICAL_REVIEW_PRESERVED=YES_NOT_REUSED_AS_CURRENT_M07_PASS
```

## M00 — reconcile

```text
M00_STATUS=PASS_RECONCILED
M00_SOURCE_INSPECTED=YES
M00_HOST_EXECUTED=YES
M00_BUILD_VERIFIED=NO_NEW_BUILD
M00_DEPLOYMENT_VERIFIED=NO_NOT_AUTHORIZED
M00_PHYSICAL_OBSERVED=NO
```

The live state file contained older historical frontiers and did not contain this plan's M00-M07 ledger. This report and the prepended state section are the corrective checkpoint; historical sections are preserved.

## M01 — observer contract

```text
M01_STATUS=BLOCKED_AFTER_BASELINE_REPRODUCTION
M01_COLLECTOR=scripts/slate-m4-sanitized-observer-v2.py
M01_COLLECTOR_CONTRACT_VERSION=UNVERSIONED_V2
M01_SELF_TEST=PASS
M01_EXACT_PRODUCER_FIXTURE_CAPTURE=FAIL
M01_FRAME_FIXTURE_EVENTS=0
M01_FONT_FIXTURE_EVENTS=0
M01_LAYOUT_FIXTURE_EVENTS=0
M01_WEATHER_FIXTURE_EVENTS=0
M01_REQUIRED_MISSING_EVIDENCE_FAIL_CLOSED=NOT_YET_IMPLEMENTED
M01_RAW_PRIVATE_CONTENT_RETAINED=NO
```

The exact live producer fixtures are lower-case `frame marker`, `voice font marker`, `voice layout marker`, and `[slate] weather lifecycle marker` lines. The current collector self-test passes while all seven exact producer fixtures return no sanitized events. This proves F1 without inventing runtime observations.

The designated writer invocation was attempted once through the exact configured Z.ai profile:

```text
IMPLEMENTATION_WRITER=Z.AI
IMPLEMENTATION_MODEL=glm-5.3-flash
ZAI_PROFILE_PROVIDER=zai
ZAI_PROFILE_ENDPOINT_CLASS=ZAI_API_V1
ZAI_PROFILE_ENV_NAME=ZAI_API_KEY
ZAI_ENV_PRESENT=YES
ZAI_ENDPOINT_MODEL_BINDING=PASS
ZAI_AUTH_FAILURE_BOUNDARY=AUTHENTICATION_BEFORE_MODEL_EXECUTION
ZAI_AUTH_FAILURE_CLASS=PROVIDER_REJECTION_OR_SOURCE_NOT_LOADED_UNRESOLVED
ZAI_WRITER_STATUS=BLOCKED_ZAI_GLM_5_3_FLASH
SILENT_SUBSTITUTE=NO
```

No credential value, token metadata, raw response, private payload, or product file was read into the report. No implementation change was made. M01's next action is one bounded retry only after independently observed auth recovery; the next writer packet is the exact producer parser/collector-contract repair from the plan.

## M02 — Calendar and Weather

```text
M02_STATUS=SOURCE_DIAGNOSIS_COMPLETE_INSTRUMENTATION_DEPENDENT
M02_CALENDAR_SERVER_CURRENT_FRAME=STRUCTURALLY_IDENTIFIED
M02_CALENDAR_DEVICE_FRAME_MATCH=UNKNOWN_COLLECTOR_CANNOT_INGEST_PRODUCER_MARKERS
M02_CALENDAR_SAME_ID_CHANGED_IMAGE_TEST=NOT_RUN
M02_WEATHER_STORED_ERROR_LIFECYCLE=SOURCE_PATH_PRESENT
M02_WEATHER_ERROR_TO_SUCCESS_TEST=NOT_RUN
M02_PHYSICAL_ACCEPTANCE=UNCLAIMED
```

The source carries manifest/content/image version fields and Weather DB/API/frontend lifecycle producers, but the collector gap prevents an end-to-end PASS. Existing cards remain untouched; no cache clear, deletion, recreation, provider call, or production read was performed.

## M03 — glyph and running artifact

```text
M03_STATUS=SOURCE_FAILURE_BOUNDARY_PROVEN_RUNTIME_PROOF_PENDING
M03_DESCRIPTOR_LOOKUP=SOURCE_PRESENT
M03_BITMAP_RETRIEVAL=NOT_IMPLEMENTED
M03_CURRENT_BITMAP_CLAIM=BOX_DIMENSION_PROXY_NOT_BITMAP_PROOF
M03_INITIAL_BUBBLE_PATH=COVERED_BY_SOURCE_HOOK
M03_IN_PLACE_ASSISTANT_UPDATE_PATH=NOT_SEPARATELY_PROVEN
M03_RUNNING_APP_IDENTITY=NOT_OBSERVED_NO_FLASH_AUTHORIZED
M03_PHYSICAL_GLYPH_RESULT=UNRESOLVED_PRESERVED
```

The current firmware uses `box_w > 0 && box_h > 0` as `direct_bitmap`/`fallback_bitmap`; no actual LVGL bitmap retrieval is present in the locked source. No firmware was changed or flashed.

## M04 — BTC weekly-only safety

```text
M04_STATUS=SOURCE_RACE_AND_FAILURE_ATOMICITY_GAP_PROVEN
M04_TARGET=ONE_WEEKLY_7_DAYS_1_HOUR_MAX_168
M04_UNIT_TESTS=3_PASS_0_FAIL
M04_REAL_ISOLATED_DB_CONCURRENCY=NOT_RUN
M04_FAILURE_INJECTION_RENDER_INTERRUPTION=NOT_RUN
M04_PRODUCTION_CONSOLIDATION=NOT_APPLIED
M04_UNRELATED_CONTENT_MUTATED=NO
```

`appendBtcTrio` reads existing records before acquiring the group-row lock, so concurrent absent-Weekly requests are not proven serialized. Its cleanup deletes old records before replacement creation/render success is secured. The existing unit tests prove planning/idempotence for sequential mocks only; they do not close F4.

## M05 — Voice replay

```text
M05_STATUS=HOST_REPLAY_PASS
M05_REPLAY_TURNS=100
M05_REPLAY_PARTIALS=1000
M05_PROVIDER_CALLS=0
M05_CONNECT_COUNT=1
M05_USER_UPDATE_EVENTS=200_BOUNDED_SAME_LOGICAL_TURN
M05_ASSISTANT_SENTENCE_EVENTS=100
M05_LOGICAL_USER_ASSISTANT_ORDER=PASS
M05_FINAL_OPERATION_QUEUE=0
M05_FINAL_MIC_QUEUE_FRAMES=0
M05_FINAL_MIC_QUEUE_BYTES=0
M05_OPTICAL_EINK_LATENCY=NOT_MEASURED
M05_PROVIDER_LATENCY=NOT_MEASURED
```

This replay is host/provider-disabled evidence only. It does not claim physical stability, provider latency, optical presentation, audio output, or a new product acceptance.

## M06 — capability matrix baseline

```text
M06_STATUS=DETERMINISTIC_BASELINE_PASS_PHYSICAL_FIELDS_UNKNOWN
M06_BACKEND_SHARED_TARGETED_TESTS=90_PASS_0_FAIL
M06_SHARED_FRONTEND_FIXTURE_TESTS=16_PASS_0_FAIL
M06_TYPECHECK=PASS
M06_LINT=PASS
M06_FORMAT_CHECK=FAIL_PREEXISTING_DYNAMIC_CONTENT_SERVICE_FILE
M06_SECRET_SCAN=SAFE_SCAN_NO_CREDENTIAL_EXPOSURE_BUT_FIXTURE_PATTERN_HITS
M06_WEATHER=DETERMINISTIC_CONFIG_AND_ICON_FIXTURES_PASS
M06_NEWS=DETERMINISTIC_DISPATCH_COVERAGE_PRESENT
M06_OUTLOOK=SAFE_ERROR_PRESENTATION_ONLY_CONNECTIVITY_UNCONFIGURED
M06_PHYSICAL_CALENDAR_WEATHER_NEWS_VOICE=UNKNOWN_OR_PRIOR_FAILURE_PRESERVED
```

The repository-wide secret-pattern scan matched synthetic test/font fixture files only; no credential value was printed or retained. The format failure is also present when checking the historical reviewed source and is not attributed to this plan without identical-condition proof.

## M07 — qualification/review

```text
M07_STATUS=NOT_READY
M07_CLEAN_WORKTREE_DEPENDENCY_RESTORE=NOT_REQUIRED_FOR_BLOCKED_PATCH
M07_COMPLETE_COMBINED_CANDIDATE=NO
M07_FRESH_GROK_REVIEW=NOT_RUN
M07_HISTORICAL_GROK_REVIEW=PASS_PRESERVED_NOT_CURRENT_CANDIDATE_REVIEW
M07_DEPLOYMENT=NONE
M07_FIRMWARE_FLASH=NONE
```

The F1-F5 implementation package is not eligible for a fresh review until the designated writer can produce the M01 contract repair and the remaining M02-M04 gaps are qualified. No deployment, flash, provider session, physical action, credential change, OAuth, billing, merge, or release occurred.

## Frontier and restart packet

```text
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_DEVICE_COUNT=0
WAITING_HUMAN_COUNT=0
EXTERNALLY_BLOCKED_COUNT=1
CURRENT_BLOCKED_NODE=M01_TO_M04_MATERIAL_IMPLEMENTATION_REQUIRES_ZAI_GLM_5_3_FLASH
HUMAN_ACTION_REQUIRED=NO
HUMAN_ACTION_REASON=NONE
TERMINAL_REASON=DESIGNATED_WRITER_AUTHENTICATION_BLOCK_AFTER_ALL_SAFE_READONLY_AND_PROVIDER_DISABLED_WORK
NEXT_ACTION=BOUNDED_RETRY_OF_EXISTING_ZAI_GLM_5_3_FLASH_ROUTE_AFTER_MEANINGFUL_AUTH_RECOVERY; THEN_M01_CONTRACT_REPAIR
```

The portfolio remains open for a later controller invocation; this is not a production or physical gate. PR #1–#4 remain OPEN / DRAFT / UNMERGED.
