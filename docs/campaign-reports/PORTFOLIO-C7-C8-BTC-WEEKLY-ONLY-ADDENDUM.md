# C7/C8 addendum — BTC/USD weekly-only tile requirement

Date: 2026-09-11 (Australia/Perth)

This addendum records a new operator product requirement while preserving the consumed C7/C8 physical requalification evidence and the active Weather / Monthly Calendar / Japanese glyph diagnosis.

## Operator requirement

The existing BTC/USD implementation currently auto-creates a trio of dynamic-content tiles:

```text
Daily
Weekly
Monthly
```

The operator now wants the Bitcoin tile set reduced to **7 days only**.

The existing provider already defines `weekly` as exactly a 7-day window with hourly granularity and up to 168 points. Therefore interpret the requested target as:

```text
BTC_TILE_SET_TARGET=SINGLE_WEEKLY_ONLY
BTC_ALLOWED_AUTO_CREATED_PERIOD=weekly
BTC_WEEKLY_WINDOW=7_DAYS
BTC_DAILY_AUTO_TILE=REMOVE_FROM_DEFAULT_OR_AUTO_CREATE_PATH
BTC_MONTHLY_AUTO_TILE=REMOVE_FROM_DEFAULT_OR_AUTO_CREATE_PATH
BTC_PROVIDER_WEEKLY_SEMANTICS=PRESERVE_EXISTING_7_DAY_WINDOW
```

Do not alter the 7-day provider semantics unless deterministic evidence shows they are incorrect.

## Required safe diagnosis

Before implementation, trace where the BTC trio is created and whether currently visible Daily/Weekly/Monthly tiles are:

- auto-seeded by `createBtcTrioRequests` or another bootstrap path;
- persisted user content;
- recreated at startup;
- generated only on first-run/default population.

Publish:

```text
BTC_TRIO_CREATION_ENTRYPOINT=
BTC_EXISTING_DAILY_TILE_PERSISTED=
BTC_EXISTING_WEEKLY_TILE_PERSISTED=
BTC_EXISTING_MONTHLY_TILE_PERSISTED=
BTC_STARTUP_AUTO_RECREATION=
BTC_SAFE_MIGRATION_REQUIRED=
BTC_TARGET_VISIBLE_TILE_COUNT=1
BTC_TARGET_VISIBLE_PERIOD=weekly
```

Avoid destructive broad deletion. If existing Daily/Monthly tiles are persisted content, prefer the smallest deterministic migration/consolidation that leaves one Weekly tile and preserves unrelated dynamic content. Do not touch user-created non-BTC tiles.

## Implementation rules

For material product changes use the current writer/reviewer policy:

```text
CONTROLLER=CODEX_CLI
IMPLEMENTATION_WRITER=Z.ai glm-5.3-flash
CANONICAL_REVIEWER=grok -m grok-4.6
```

No silent writer or reviewer substitution.

Expected minimum behavior after implementation:

1. New/default BTC setup creates exactly one BTC/USD tile.
2. That tile uses `period=weekly`.
3. The provider continues to request a 7-day window.
4. Daily and Monthly BTC tiles are no longer auto-created.
5. Existing unrelated dynamic content is untouched.
6. Existing BTC persistence is handled deterministically without duplicate recreation.
7. Tests cover single-tile creation, no Daily/Monthly default creation, and preserved weekly 7-day provider semantics.

Any implementation must complete deterministic tests, impacted typecheck/lint/format/build, privacy/secret scan, `git diff --check`, exact artifact freeze if production bytes change, and fresh `grok -m grok-4.6` review before deployment authority is requested.

## Interaction with current C7/C8 physical failures

Preserve these already-consumed observations:

```text
C7_MONTH_CALENDAR_RESULT=FAIL_CHINESE_LUNAR_NO_WA_HOLIDAY_AFTER_REPAIR_DEPLOYMENT
C7_OUTLOOK_RESULT=PASS_SAFE_ENGLISH_ERROR_EXPECTED_UNCONFIGURED_OAUTH
C7_WEATHER_RESULT=FAIL_VISIBLE_INVALID_CONFIGURATION_AFTER_REPAIR_DEPLOYMENT
C7_GOOGLE_NEWS_RESULT=PASS_PARTIAL_OPERATOR_REPORTED
C8_JAPANESE_GLYPH_RESULT=FAIL_MISSING_GLYPH_SQUARE_AFTER_EXACT_APP_FLASH
```

The repeated Outlook `Outlook server error` in English is not a new defect under the current unconfigured Microsoft OAuth state. Do not initiate OAuth, credentials, billing or private Outlook access as part of the BTC work.

The Calendar still being Chinese remains an active C7 repair node and must continue safe deterministic/read-only diagnosis. The BTC weekly-only requirement is independent safe product work and should not block or replace Calendar/Weather/glyph diagnosis.

## Authority

This addendum authorizes safe deterministic diagnosis and implementation preparation only. It does NOT authorize production deployment, firmware flash, another physical acceptance, provider qualification, Microsoft OAuth, MySQL mutation, Wi-Fi/pairing/reset, C9/C10 activation, merge or release.

Keep PRs #1-#4 OPEN / DRAFT / UNMERGED.
