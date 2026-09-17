# Portfolio C7+C8 post-deployment physical failures ingestion

Date: 2026-09-11 (Australia/Perth)

This checkpoint records explicit operator observations from the single bounded
post-deployment NOTE4 acceptance cycle. It does not authorize another physical
test, firmware flash, provider qualification call, OAuth action, deployment,
merge, or release.

## Live control-plane entry

```text
PR2_HEAD_AT_INGESTION=30d48c2cce0dcecf8760a6d643c84f837e1b8f5b
PR2_STATE=OPEN
PR2_DRAFT=YES
PR2_MERGED=NO
RUNNING_REVIEWED_SOURCE=bdfbcc86e7b7e4c7ae49b9ee10469658fc854885
RUNNING_REVIEWED_IMAGE=sha256:f1a33bc31e6c44a0a5d1bf803e453f5ea3ec903e9e9972247e61d84b3e0693ce
```

The deployment report already established healthy Slate/MySQL, exact reviewed
runtime identity, approved Gemini configuration continuity, read-only secret
mount, NOTE4 authenticated polling and sanitized observer state before physical
acceptance.

## Physical acceptance result: consumed with failures

```text
PHYSICAL_ACCEPTANCE_CONSUMED=YES
PHYSICAL_ACCEPTANCE_RESULT=FAIL_PARTIAL_WITH_MULTIPLE_ACTIONABLE_FINDINGS
AUTO_REPEAT_AUTHORIZED=NO
```

### C7 Weather

Operator screenshot shows the existing Perth Weather card still displaying a
visible `Invalid configuration` error after deployment.

```text
C7_WEATHER_EXISTING_CARD_USED=YES
C7_WEATHER_INVALID_CONFIGURATION_ERROR_PRESENT=YES
C7_WEATHER_CONTENT_PREVIEW_VISIBLE=YES
C7_WEATHER_RUNTIME_CONFIGURATION=FAIL_PERSISTED_OR_RUNTIME_COMPATIBILITY_STILL_UNRESOLVED
C7_WEATHER_ICON_ACCEPTANCE=NOT_RELIABLY_QUALIFIED_WHILE_CONFIG_ERROR_PRESENT
C7_WEATHER_NEXT_ACTION=DIAGNOSE_EXACT_EXISTING_PERSISTED_RECORD_AGAINST_DEPLOYED_SCHEMA_WITHOUT_RECREATING_CARD
```

Do not delete/recreate the Weather card as a workaround. Determine the exact
persisted payload and the earliest validation/normalization boundary that still
rejects it. Preserve identity and migrate/normalize compatibly if justified.

### C7 Google News

Operator reports Google News now appears to be working.

```text
C7_GOOGLE_NEWS_UNKNOWN_DYNAMIC_TYPE_ERROR_PRESENT=NO_OPERATOR_REPORTED
C7_GOOGLE_NEWS_GENERAL_OPERATION=PASS_PARTIAL_OPERATOR_REPORTED
C7_GOOGLE_NEWS_AU=UNKNOWN_NOT_SEPARATELY_CONFIRMED
C7_GOOGLE_NEWS_TW=UNKNOWN_NOT_SEPARATELY_CONFIRMED
C7_GOOGLE_NEWS_BOTH=UNKNOWN_NOT_SEPARATELY_CONFIRMED
```

Preserve this successful subresult. Do not regress or reopen this node unless
new evidence appears.

### C7 Outlook

Operator screenshot shows the Connect action now produces a visible English
`Outlook server error` rather than the previous Chinese envelope or silent
no-op.

```text
C7_OUTLOOK_CONNECT_CLICK=ATTEMPTED
C7_OUTLOOK_VISIBLE_RESPONSE=YES
C7_OUTLOOK_SILENT_NOOP=NO
C7_OUTLOOK_ERROR_LANGUAGE=PASS_ENGLISH
C7_OUTLOOK_CONNECTION_SUCCESS=FAIL_SERVER_ERROR
C7_OUTLOOK_NEXT_ACTION=DIAGNOSE_BACKEND_AUTH_URL_SERVER_ERROR_WITHOUT_OAUTH_CONSENT_OR_PRIVATE_DATA_ACCESS
```

Preserve `Calendars.Read` only. Do not initiate Microsoft consent or access
private Outlook data during diagnosis.

### C7 Monthly calendar regression

Operator screenshot shows the monthly calendar has regressed to the Chinese
presentation path: Chinese weekday labels and Chinese lunar-date annotations
are visible. The operator also reports the expected WA public-holiday marking
is absent.

```text
C7_MONTH_CALENDAR_ENGLISH_ONLY=FAIL
C7_MONTH_CALENDAR_CHINESE_WEEKDAY_LABELS_PRESENT=YES
C7_MONTH_CALENDAR_CHINESE_LUNAR_ANNOTATIONS_PRESENT=YES
C7_MONTH_CALENDAR_WA_PUBLIC_HOLIDAY_MARKING=FAIL_OPERATOR_REPORTED_ABSENT
C7_MONTH_CALENDAR_TIMEZONE_TARGET=AUSTRALIA_PERTH_PRESERVE
C7_MONTH_CALENDAR_LOCALE_TARGET=EN_AU
C7_MONTH_CALENDAR_NEXT_ACTION=TRACE_RENDERER_OR_ROUTE_REGRESSION_AND_RESTORE_CAMPAIGN7_ENGLISH_PERTH_WA_HOLIDAY_PATH
```

This is a regression relative to Campaign 7 intent. Diagnose route/component
selection and data-source wiring before changing fixtures or presentation.

### C8 Japanese glyph integrity

A new NOTE4 photo after the reviewed backend deployment still shows a square
missing-glyph placeholder in Japanese assistant output. In the visible context,
the missing position is consistent with the common Japanese weather kanji
`U+66C7` (曇), but this codepoint identification must be verified mechanically
against the exact generated text/render input before it is treated as proven.

```text
C8_JAPANESE_MISSING_GLYPH_SQUARE_PRESENT=YES_OPERATOR_PHOTO
C8_JAPANESE_GLYPH_INTEGRITY=FAIL
C8_JAPANESE_WRONG_BOPOMOFO_CURRENT_SESSION=UNKNOWN
C8_MISSING_GLYPH_CANDIDATE_CODEPOINT=U+66C7_VERIFY_MECHANICALLY
C8_BACKEND_ONLY_DEPLOYMENT_FIXED_GLYPH=NO
C8_FIRMWARE_CHANGE_REQUIRED=UNKNOWN_PENDING_EXACT_CMAP_RENDER_DIAGNOSIS
```

The new evidence materially increases the likelihood of an effective firmware
font/cmap/fallback coverage problem for at least one common Japanese kanji, but
no firmware repair is authorized or justified until the following provider-
disabled checks are complete:

1. prove the exact Unicode scalar reaching the firmware at the missing-glyph
   position using synthetic known input or sanitized codepoint-only tracing;
2. check `U+66C7` in every effective Voice font/cmap/fallback table;
3. check glyph lookup/cache/index behavior for that codepoint;
4. compare direct glyph coverage versus fallback coverage;
5. verify UTF-8 decoder output remains the expected scalar;
6. test a bounded representative set of common Japanese kanji used by weather,
   calendar and ordinary assistant responses so the repair is not one-character
   whack-a-mole;
7. distinguish missing cmap coverage from stale cache/index/render corruption.

Do not retain raw microphone audio, full transcript text, provider payloads,
credentials/tokens/auth headers, private Outlook/Calendar contents or private
device identifiers. Codepoint-only structural diagnostics are allowed.

## Safe next work

The consumed physical test exposes independent safe repair nodes. Continue
without another device test while deterministic/provider-disabled diagnosis is
available.

```text
C7_WEATHER_READY_NODE=YES
C7_MONTH_CALENDAR_READY_NODE=YES
C7_OUTLOOK_READONLY_READY_NODE=YES
C8_GLYPH_READONLY_READY_NODE=YES
C7_GOOGLE_NEWS_READY_NODE=NO_PRESERVE_PARTIAL_PASS
```

For any material product repair:

Codex adjudication -> AGY `gemini-3.8-flash-high` minimum justified repair ->
focused tests -> impacted typecheck/lint/format/build -> privacy/secret scan ->
`git diff --check` -> exact source/artifact freeze -> fresh `grok -m grok-4.6`
review.

If a firmware/font repair becomes justified, build and review exact firmware
bytes but DO NOT FLASH without a separate explicit authority. If backend/shared/
frontend bytes change, qualify and review but DO NOT DEPLOY changed bytes
without separate explicit authority.

Do not repeat the NOTE4 acceptance until safe repair work is exhausted and an
exact reviewed candidate is ready.

PRs #1, #2, #3 and #4 remain OPEN / DRAFT / UNMERGED.
