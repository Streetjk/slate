# Portfolio C8+C7 physical acceptance — Weather and Google News addendum

Date: 2026-09-11 (Australia/Perth)

## Purpose

This addendum records additional operator-visible C7 failures from the same already-consumed combined C8+C7 physical acceptance. It supplements:

- `docs/campaign-reports/PORTFOLIO-C8-C7-PHYSICAL-ACCEPTANCE-GLYPH-OUTLOOK-INGESTION.md`
- the exact live `CAMPAIGN-STATE.md`
- `docs/campaign-reports/AUTONOMY-AND-HUMAN-GATE-POLICY.md`
- `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`

PR #1 and PR #2 must remain OPEN / DRAFT / UNMERGED.

This addendum grants no deployment, provider call, firmware flash, NOTE4 reset, re-pair, Wi-Fi change, OAuth consent, credential/private-data action, merge or release authority.

## Live control context at ingestion

```text
LIVE_PR2_HEAD_BEFORE_ADDENDUM=23b912a45d26ac82bd1e0ebfb41740d066c4db69
DEPLOYED_COMBINED_SOURCE=d26efe2441407faf71c4c508f66e9f5c39f98fae
DEPLOYED_COMBINED_TAG=slate:m4-postphysical-c8-c7-d26efe2
PHYSICAL_ACCEPTANCE_ALREADY_CONSUMED=YES
REPEAT_PHYSICAL_ACCEPTANCE_AUTHORIZED=NO
```

## New operator evidence

The operator supplied a dashboard screenshot from the deployed combined candidate.

Visible Weather card:

```text
CARD_TITLE=Perth weather
C7_WEATHER_CARD_VISIBLE=YES
C7_WEATHER_PREVIEW_CONTENT_VISIBLE=YES
C7_WEATHER_ERROR_VISIBLE=YES
C7_WEATHER_ERROR_PREFIX=Invalid configuration:
C7_WEATHER_CONFIGURATION_ACCEPTANCE=FAIL
C7_WEATHER_ICON_ACCEPTANCE=UNKNOWN_NOT_RELIABLY_TESTABLE_WHILE_CONFIGURATION_IS_REJECTED
```

The exact serialized validation object is truncated in the screenshot and must not be reconstructed by guesswork. Diagnose from runtime/config/schema evidence.

Visible Google News card:

```text
CARD_TITLE=Google News
C7_GOOGLE_NEWS_CARD_VISIBLE=YES
C7_GOOGLE_NEWS_PREVIEW_CONTENT_VISIBLE=YES
C7_GOOGLE_NEWS_ERROR_VISIBLE=YES
C7_GOOGLE_NEWS_ERROR_EXACT_VISIBLE_TEXT=Unknown dynamic type: google_news
C7_GOOGLE_NEWS_DYNAMIC_TYPE_ACCEPTANCE=FAIL
```

Do not infer AU/TW/Both runtime acceptance from the preview text while the card reports an unknown dynamic type.

## Immediate classification

Add these distinct C7 repair nodes to the consumed physical acceptance:

```text
C7_WEATHER_RUNTIME_CONFIGURATION=FAIL_INVALID_CONFIGURATION
C7_WEATHER_WMO_ICON_MAPPING_PHYSICAL=UNKNOWN_BLOCKED_BY_CONFIGURATION_FAILURE
C7_GOOGLE_NEWS_RUNTIME_TYPE_REGISTRATION=FAIL_UNKNOWN_DYNAMIC_TYPE_GOOGLE_NEWS
C7_GOOGLE_NEWS_AU_PHYSICAL=UNKNOWN_BLOCKED_BY_DYNAMIC_TYPE_FAILURE
C7_GOOGLE_NEWS_TW_PHYSICAL=UNKNOWN_BLOCKED_BY_DYNAMIC_TYPE_FAILURE
C7_GOOGLE_NEWS_BOTH_PHYSICAL=UNKNOWN_BLOCKED_BY_DYNAMIC_TYPE_FAILURE
```

These failures are separate from the previously ingested Outlook and C8 Japanese-glyph failures. Preserve successful/partial evidence independently.

## Weather zero-provider diagnosis

Do not begin with another physical test. Mechanically trace the exact deployed Weather card from persisted dynamic-content record through shared schema, backend validation, runtime renderer, API serialization, frontend config model, and any migration/normalization layer.

Determine:

```text
C7_WEATHER_PERSISTED_DYNAMIC_TYPE=
C7_WEATHER_PERSISTED_CONFIG_SHAPE=
C7_WEATHER_SHARED_SCHEMA_EXPECTED_SHAPE=
C7_WEATHER_BACKEND_SCHEMA_EXPECTED_SHAPE=
C7_WEATHER_FRONTEND_SCHEMA_EXPECTED_SHAPE=
C7_WEATHER_VALIDATION_LAYER_RETURNING_ERROR=
C7_WEATHER_SCHEMA_VERSION_OR_MIGRATION_MISMATCH=
C7_WEATHER_LEGACY_RECORD_COMPATIBILITY=
C7_WEATHER_EARLIEST_FAILED_BOUNDARY=
```

Check specifically for version skew between previously persisted Weather configuration and the new C7 Open-Meteo/global schema. Do not delete/recreate user data to hide an incompatible record. Prefer a bounded compatibility/migration/normalization repair that preserves existing content identity when safe.

Tests must cover at minimum:

- legacy persisted Weather config accepted or deterministically migrated;
- current Open-Meteo Perth config accepted;
- malformed config still fails safely;
- no raw validation internals/private data are exposed to the user UI;
- known WMO codes continue to map to valid assets after config acceptance;
- unknown WMO codes still use the explicit unknown fallback.

The dashboard target is concise user-facing English on failure, not a raw Zod/schema object dump.

## Google News zero-provider diagnosis

Trace `google_news` registration end-to-end on the exact deployed candidate:

```text
C7_GOOGLE_NEWS_SHARED_TYPE_REGISTERED=
C7_GOOGLE_NEWS_BACKEND_DYNAMIC_TYPE_REGISTERED=
C7_GOOGLE_NEWS_RUNTIME_RENDERER_REGISTERED=
C7_GOOGLE_NEWS_REFRESH_JOB_REGISTERED=
C7_GOOGLE_NEWS_FRONTEND_TYPE_REGISTERED=
C7_GOOGLE_NEWS_PERSISTED_RECORD_TYPE=
C7_GOOGLE_NEWS_API_ACCEPTS_TYPE=
C7_GOOGLE_NEWS_EARLIEST_FAILED_BOUNDARY=
```

Compare the exact combined artifact against the reviewed Campaign 7 source so a path omitted during C7->C8 combination is detected mechanically rather than guessed.

Investigate at minimum:

1. shared dynamic-type union/enum;
2. backend DTO/Zod/schema discriminator;
3. dynamic-content service factory/dispatch switch;
4. renderer/fetcher registration;
5. frontend edit/create schemas;
6. existing persisted record compatibility;
7. build/package inclusion/version skew.

A frontend preview existing while runtime reports `Unknown dynamic type: google_news` must not be called PASS. Establish which layer knows the type and which layer does not.

Tests must prove the exact string/type `google_news` survives create/read/refresh/render dispatch for AU, TW and Both modes without overloading another dynamic type.

No live Google News request is required merely to prove type registration/dispatch. Use fixtures/provider-disabled tests where possible. If a real network fetch later becomes the sole remaining useful node, treat that separately according to existing authority policy.

## Cross-check combined-candidate integrity

Because both Weather and Google News are Campaign 7 surfaces that were expected in the deployed combined artifact, perform a path-level provenance check against the exact C7 repair/source lineage and `d26efe2441407faf71c4c508f66e9f5c39f98fae`.

Publish:

```text
C7_EXPECTED_RUNTIME_PATHS_PRESENT_IN_D26EFE2=
C7_WEATHER_SCHEMA_PATH_MATCH=
C7_GOOGLE_NEWS_REGISTRATION_PATH_MATCH=
C7_COMBINATION_OMISSION_OR_VERSION_SKEW=
```

Do not assume the post-physical WMO repair itself caused the Weather config failure. Likewise, do not assume `google_news` is absent from source merely because one runtime dispatcher reports it unknown. Locate the first mismatch.

## Repair/review loop

Continue all safe deterministic work automatically.

For material backend/shared/frontend runtime changes:

1. Codex adjudication;
2. AGY `gemini-3.8-flash-high` minimum justified repair;
3. focused Weather/Google News/Outlook/C8 regression tests;
4. impacted full tests/typecheck/lint/format/build;
5. privacy/secret scan;
6. `git diff --check`;
7. exact source/artifact freeze;
8. fresh Grok 4.6 exact review.

Canonical reviewer:

`grok -m grok-4.6`

No ZAI fallback and no silent reviewer substitution.

If repair affects the combined C7+C8 backend artifact, do not deploy changed bytes without a new explicit deployment authority. If firmware is unchanged, do not manufacture a firmware-flash request.

## Authority and observation discipline

Do not:

- repeat the physical acceptance now;
- call Gemini/provider for these C7 failures;
- flash/reset/re-pair NOTE4;
- recreate MySQL;
- delete/recreate Weather or Google News records as a shortcut;
- initiate Microsoft OAuth consent;
- access private Outlook data;
- deploy C10;
- activate Campaign 9;
- merge/release any PR.

Preserve all unrelated unreported physical fields as UNKNOWN.

## Work-queue requirement

The physical acceptance is consumed and safe C7/C8 diagnosis is now READY/READONLY_READY work. `CAMPAIGN-STATE.md` must not continue to say the physical acceptance is ARMED after these observations are ingested.

Before controller exit publish at minimum:

```text
PORTFOLIO_CURRENT_HEAD=
PORTFOLIO_CURRENT_PRIORITY=

C8_PHYSICAL_ACCEPTANCE=CONSUMED
C8_JAPANESE_GLYPH_INTEGRITY=
C8_GLYPH_ROOT_CAUSE=
C8_READY=
C8_READONLY_READY=
C8_NEXT_ACTION=

C7_PHYSICAL_ACCEPTANCE=CONSUMED_PARTIAL_EVIDENCE
C7_OUTLOOK_CONNECTION_SUCCESS=
C7_OUTLOOK_ERROR_LANGUAGE=
C7_WEATHER_RUNTIME_CONFIGURATION=
C7_WEATHER_EARLIEST_FAILED_BOUNDARY=
C7_WEATHER_WMO_ICON_MAPPING_PHYSICAL=
C7_GOOGLE_NEWS_RUNTIME_TYPE_REGISTRATION=
C7_GOOGLE_NEWS_EARLIEST_FAILED_BOUNDARY=
C7_GOOGLE_NEWS_AU_PHYSICAL=
C7_GOOGLE_NEWS_TW_PHYSICAL=
C7_GOOGLE_NEWS_BOTH_PHYSICAL=
C7_READY=
C7_READONLY_READY=
C7_NEXT_ACTION=

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

Do not exit while safe READY or READONLY_READY work remains.

## Immediate next action

Reconcile live GitHub and exact running combined artifact, then ingest this addendum together with the glyph/Outlook physical report. Diagnose the Weather configuration rejection and `google_news` dynamic-type registration failure provider-disabled, repair only after mechanical root-cause proof, validate/review exact changed bytes, and request a new deployment/physical boundary only when safe work is exhausted.
