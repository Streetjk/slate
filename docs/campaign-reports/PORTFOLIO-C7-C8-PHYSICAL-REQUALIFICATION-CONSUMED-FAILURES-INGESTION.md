# C7+C8 consumed physical requalification — operator evidence ingestion

Date: 2026-09-11 (Australia/Perth)

This directive ingests the operator's single bounded physical requalification against the exact activated backend and application-only firmware artifacts. It supersedes the prior ARMED/PENDING classification for this attempt. Do not auto-repeat the physical test.

## Live identities at ingestion

```text
LIVE_PR2_HEAD_AT_INGESTION=8fd408a43b4f16cbea2ae440ec508db7ecb79e3a
PR2_STATE=OPEN
PR2_DRAFT=YES
PR2_MERGED=NO

BACKEND_SOURCE=6d6bd5ddd2d6c463d094f17b4e756cc820131474
BACKEND_REVIEWED_IMAGE=sha256:684849bb2bf8e0bc261b9dc973d7e5d23e69460772995bfd6be3426ff493b4e5
RUNNING_IMAGE_LOAD_EQUIVALENCE=PASS_RECORDED

FIRMWARE_APP_SHA256=0b4c9f1c989cf3157ef54d9a904bc33c05e202f3c31d4d2661b16a18bc32619a
VOICE_FONT_SHA256=99c2673c97bd17c8a378e64236abe46cfcdd04933ecd5b5a6cda692ae46a8bb0
FIRMWARE_FLASH_SCOPE=APPLICATION_PARTITION_ONLY
FIRMWARE_FLASH_RESULT=PASS_HASH_VERIFIED_RECORDED

PHYSICAL_REQUALIFICATION_MAX_ATTEMPTS=1
PHYSICAL_REQUALIFICATION_CONSUMED=YES
PHYSICAL_REQUALIFICATION_PENDING=NO
AUTO_REPEAT_AUTHORIZED=NO
```

## Operator evidence from the consumed requalification

Only explicit operator observations and visible screenshots/photos are classified here. Anything not observed remains UNKNOWN.

### C7 Weather

The existing Perth Weather card was preserved. The card still visibly shows the same red `Invalid configuration: ...` error while weather preview content remains visible.

```text
C7_WEATHER_EXISTING_CARD_USED=YES
C7_WEATHER_PREVIEW_CONTENT_VISIBLE=YES
C7_WEATHER_INVALID_CONFIGURATION_ERROR_PRESENT=YES_AFTER_REPAIR_DEPLOYMENT
C7_WEATHER_PHYSICAL_REQUALIFICATION=FAIL
C7_WEATHER_ICON_ACCEPTANCE=UNKNOWN_BLOCKED_BY_VISIBLE_CONFIGURATION_ERROR
```

The prior conclusion `STALE_DERIVED_RENDER_ERROR ... SCHEDULED_RENDER_CLEARED_STALE_ERROR` is therefore not sufficient to close the physical failure. Do not assume the persisted config is invalid; the previous structural read showed a valid Open-Meteo Perth coordinate shape. Diagnose the exact boundary between persisted record, server-side derived error/render state, API serialization/cache and frontend local/query cache.

Required provider-disabled/read-only diagnosis before any new physical action:

```text
C7_WEATHER_DB_CONFIG_SHAPE=
C7_WEATHER_DB_ERROR_FIELD_PRESENT=
C7_WEATHER_DB_LAST_RENDER_STATUS=
C7_WEATHER_DB_LAST_RENDER_TIMESTAMP_CLASS=
C7_WEATHER_API_ERROR_FIELD_PRESENT=
C7_WEATHER_API_RENDER_STATUS=
C7_WEATHER_FRONTEND_QUERY_CACHE_CAN_RETAIN_OLD_ERROR=
C7_WEATHER_SUCCESS_PATH_CLEARS_ERROR_FIELD=
C7_WEATHER_FIRST_BOUNDARY_WHERE_STALE_ERROR_SURVIVES=
C7_WEATHER_ROOT_CAUSE=
```

Do not delete or recreate the card. Do not call external weather services merely to diagnose this state. Use deterministic fixtures and read-only structural production inspection first.

### C7 Google News

The operator reports Google News appears to be working now.

```text
C7_GOOGLE_NEWS_GENERAL_OPERATION=PASS_PARTIAL_OPERATOR_REPORTED
C7_GOOGLE_NEWS_UNKNOWN_DYNAMIC_TYPE_ERROR_PRESENT=NO_OPERATOR_REPORTED
C7_GOOGLE_NEWS_AU=UNKNOWN_NOT_SEPARATELY_CONFIRMED
C7_GOOGLE_NEWS_TW=UNKNOWN_NOT_SEPARATELY_CONFIRMED
C7_GOOGLE_NEWS_BOTH=UNKNOWN_NOT_SEPARATELY_CONFIRMED
```

Preserve this successful sub-result. Do not reopen or change Google News unless new evidence requires it.

### C7 Outlook

The Connect action visibly returns `Outlook server error` in English. The deployed runtime is already known to have the Microsoft OAuth configuration fields absent and the read-only `Calendars.Read` scope preserved.

```text
C7_OUTLOOK_VISIBLE_RESPONSE=YES
C7_OUTLOOK_SILENT_NOOP=NO
C7_OUTLOOK_ERROR_LANGUAGE=PASS_ENGLISH
C7_OUTLOOK_VISIBLE_ERROR=OUTLOOK_SERVER_ERROR
C7_OUTLOOK_CONNECTION_SUCCESS=NO_UNCONFIGURED_OAUTH
C7_OUTLOOK_PHYSICAL_UX_RESULT=PASS_EXPECTED_SAFE_ENGLISH_ERROR_FOR_UNCONFIGURED_OAUTH
C7_OUTLOOK_REPAIR_REQUIRED=NO_WITHOUT_SEPARATE_OAUTH_AUTHORITY
```

Do not initiate Microsoft sign-in, consent, credentials, project configuration or private Outlook access under this directive.

### C7 Monthly calendar

The monthly calendar visibly remains/returns to the Chinese/lunar presentation after deployment of the reviewed calendar repair. The screenshot shows Chinese weekday labels and lunar annotations; the operator reports WA public holidays are absent.

```text
C7_MONTH_CALENDAR_ENGLISH_ONLY=FAIL_AFTER_REPAIR_DEPLOYMENT
C7_MONTH_CALENDAR_CHINESE_WEEKDAY_LABELS_PRESENT=YES
C7_MONTH_CALENDAR_CHINESE_LUNAR_ANNOTATIONS_PRESENT=YES
C7_MONTH_CALENDAR_WA_PUBLIC_HOLIDAY_MARKING=FAIL_OPERATOR_REPORTED_ABSENT
C7_MONTH_CALENDAR_PHYSICAL_REQUALIFICATION=FAIL
```

The prior deterministic repair is not physically proven. Do not immediately assume the source repair is wrong: determine whether the visible frame is stale pre-deploy rendered image/cache versus current renderer output, or whether the active production type/provider/renderer path still resolves to an older Chinese path.

Required safe diagnosis:

```text
C7_MONTH_CALENDAR_PERSISTED_TYPE=
C7_MONTH_CALENDAR_PERSISTED_CONFIG_LOCALE=
C7_MONTH_CALENDAR_PERSISTED_CONFIG_TIMEZONE=
C7_MONTH_CALENDAR_LAST_RENDER_TIMESTAMP_CLASS=
C7_MONTH_CALENDAR_API_FRAME_IDENTITY_OR_ETAG_CLASS=
C7_MONTH_CALENDAR_ACTIVE_PROVIDER_PATH=
C7_MONTH_CALENDAR_ACTIVE_RENDERER_PATH=
C7_MONTH_CALENDAR_EFFECTIVE_LOCALE=
C7_MONTH_CALENDAR_EFFECTIVE_TIMEZONE=
C7_MONTH_CALENDAR_WA_HOLIDAY_TABLE_REACHABLE_FROM_ACTIVE_PATH=
C7_MONTH_CALENDAR_STALE_RENDER_OR_CACHE=
C7_MONTH_CALENDAR_FIRST_FAILED_BOUNDARY=
C7_MONTH_CALENDAR_ROOT_CAUSE=
```

Prefer read-only structural inspection plus deterministic local reproduction using the persisted config shape. Do not mutate production content just to force a pass before root cause is known.

### C8 Japanese glyph

After the exact reviewed application-only firmware flash, the operator still observes a missing-glyph square in the Japanese Voice assistant text. The photo visibly shows a square immediately before `り時々雨` in a Tokyo weather sentence, which is consistent with the expected phrase `曇り時々雨`; however, the exact upstream codepoint is not proven solely from the photo.

```text
C8_JAPANESE_MISSING_GLYPH_SQUARE_PRESENT=YES_AFTER_EXACT_APP_FLASH
C8_JAPANESE_GLYPH_INTEGRITY=FAIL_AFTER_REPAIR_FLASH
C8_PRIOR_U66C7_REPAIR_SUFFICIENT=NO_PHYSICAL_EVIDENCE_DISPROVES_CLOSURE
C8_VISIBLE_CONTEXT=BOX_IMMEDIATELY_BEFORE_RI_TOKIDOKI_AME_CONSISTENT_WITH_KUMORI_PHRASE
C8_EXACT_UPSTREAM_CODEPOINT=UNKNOWN_NOT_PROVEN_FROM_PHOTO
C8_FIRMWARE_APP_FLASH_IDENTITY=EXACT_REVIEWED_HASH_RECORDED
```

This materially invalidates the prior closure `VOICE_FONT_GENERATOR_SYMBOL_OMISSION` as a complete physical root cause. Preserve the fact that host coverage/UTF-8 tests passed, but reopen the first unresolved runtime boundary.

Required provider-disabled diagnosis against the exact flashed source/artifact:

1. Trace the assistant bubble render path to the exact LVGL/font object actually selected at runtime; prove whether `voice_font_16` is used for this bubble and whether any other font/fallback overrides it.
2. On the exact generated font, call the same glyph-description and glyph-bitmap lookup APIs used by runtime for U+66C7 and representative surrounding Japanese codepoints; prove descriptor and bitmap are non-null.
3. Inspect generated cmap/range/index tables for U+66C7 and any duplicate/alias/collision that can return the missing-glyph path despite host coverage scripts.
4. Prove the compiled app artifact contains and references the repaired font object; detect duplicate stale font objects or a different linked font selected by the Voice UI.
5. Reproduce the exact known literal `曇り時々雨` through the same firmware text layout/render function in a host/provider-disabled harness where feasible, not merely direct cmap membership.
6. Distinguish `UPSTREAM_CODEPOINT_NOT_U66C7` from `RUNTIME_FONT_SELECTION` from `GLYPH_LOOKUP` from `CACHE/INDEX` from `LAYOUT/RENDER` without retaining transcript content. If future instrumentation is required, expose only sanitized codepoint class/hex for the single failing position and only after separate authority if firmware/deployment bytes must change.

Publish:

```text
C8_RUNTIME_VOICE_FONT_OBJECT=
C8_U66C7_RUNTIME_GLYPH_DESCRIPTOR=
C8_U66C7_RUNTIME_GLYPH_BITMAP=
C8_U66C7_CMAP_INDEX_PATH=
C8_DUPLICATE_OR_STALE_FONT_OBJECT=
C8_EXACT_APP_REFERENCES_REPAIRED_FONT=
C8_LITERAL_KUMORI_LAYOUT_REPLAY=
C8_FIRST_FAILED_BOUNDARY=
C8_GLYPH_ROOT_CAUSE=
C8_FIRMWARE_CHANGE_REQUIRED=
```

Do not reflash or repeat physical testing until deterministic diagnosis and any minimum repair are frozen and independently reviewed.

## Other C8 acceptance fields

The current operator evidence does not fully report all four planned Voice turns, audio, exit, latency, freeze or bubble semantics. Preserve them as UNKNOWN unless sanitized observer evidence or explicit operator statements support them.

```text
C8_REAL_ACCENT_ASR=UNKNOWN
C8_INPUT_LATENCY=UNKNOWN
C8_STABILITY=UNKNOWN
C8_AUDIO_OUTPUT=UNKNOWN
C8_VOICE_EXIT=UNKNOWN
C8_BUBBLE_SEMANTICS=UNKNOWN
```

## Controller actions now authorized

This ingestion authorizes safe deterministic/provider-disabled/read-only diagnosis only. It does not authorize changed production deployment, another app flash, another physical acceptance, external provider qualification, OAuth, credentials, billing, private-data access, MySQL mutation, Wi-Fi/pairing/reset or merge/release.

The controller must:

- mark this requalification consumed;
- preserve Google News and Outlook successful sub-results;
- reopen only Weather, Monthly Calendar and Japanese glyph repair nodes;
- exhaust safe deterministic/read-only diagnosis across those independent nodes;
- if product changes are justified, use Codex adjudication -> designated writer -> deterministic tests -> build/typecheck/lint/format -> privacy/secret scan -> `git diff --check` -> exact artifact freeze -> fresh `grok -m grok-4.6` review;
- do not stop while READY/READONLY_READY work exists;
- prepare the smallest next combined authority only after safe diagnosis and review are complete.

No automatic physical retry.

## Required durable frontier

```text
PHYSICAL_REQUALIFICATION_CONSUMED=YES
PHYSICAL_REQUALIFICATION_PENDING=NO

C7_WEATHER_RESULT=FAIL_VISIBLE_INVALID_CONFIGURATION_AFTER_REPAIR_DEPLOYMENT
C7_GOOGLE_NEWS_RESULT=PASS_PARTIAL_OPERATOR_REPORTED
C7_OUTLOOK_RESULT=PASS_SAFE_ENGLISH_ERROR_EXPECTED_UNCONFIGURED_OAUTH
C7_MONTH_CALENDAR_RESULT=FAIL_CHINESE_LUNAR_NO_WA_HOLIDAY_AFTER_REPAIR_DEPLOYMENT
C8_JAPANESE_GLYPH_RESULT=FAIL_MISSING_GLYPH_SQUARE_AFTER_EXACT_APP_FLASH

READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=0
WAITING_HUMAN_COUNT=0
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
HUMAN_ACTION_REQUIRED=NO_UNTIL_SAFE_DIAGNOSIS_EXHAUSTED
HUMAN_ACTION_REASON=NONE_SAFE_WORK_REMAINS
TERMINAL_REASON=
NEXT_ACTION=EXHAUST_SAFE_WEATHER_CALENDAR_GLYPH_DIAGNOSIS;NO_REPEAT_PHYSICAL_TEST
```
