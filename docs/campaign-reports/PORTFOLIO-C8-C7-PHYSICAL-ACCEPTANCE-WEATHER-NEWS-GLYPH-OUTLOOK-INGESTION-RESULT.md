# C8+C7 consumed physical acceptance: glyph, Outlook, Weather and News ingestion

Date: 2026-09-11 (Australia/Perth)

## Durable classification

The single authorized combined physical acceptance is consumed. No new provider
call, physical test, firmware flash, backend deployment, NOTE4 reset, pairing,
Wi-Fi, OAuth, credential, billing, C10 or Campaign 9 action is authorized by
this checkpoint.

```text
PHYSICAL_ACCEPTANCE=CONSUMED
C8_JAPANESE_TEXT_MOSTLY_LEGIBLE=YES
C8_JAPANESE_GLYPH_INTEGRITY=FAIL
C8_JAPANESE_WRONG_CHARACTER_EXAMPLE=U+3107_BOPOMOFO_ㄇ
C8_JAPANESE_MISSING_GLYPH_SQUARE_PRESENT=YES
C8_REAL_ACCENT_ASR=UNKNOWN
C8_INPUT_LATENCY=UNKNOWN
C8_STABILITY=UNKNOWN
C8_AUDIO_OUTPUT=UNKNOWN
C8_VOICE_EXIT=UNKNOWN
C8_BUBBLE_SEMANTICS=UNKNOWN

C7_OUTLOOK_SILENT_NOOP_REPAIR=PARTIAL_PASS_VISIBLE_ERROR_NOW_PRESENT
C7_OUTLOOK_CONNECTION_SUCCESS=FAIL_OR_NOT_ESTABLISHED
C7_OUTLOOK_ERROR_LANGUAGE=FAIL_CHINESE
C7_WEATHER_RUNTIME_CONFIGURATION=FAIL_INVALID_CONFIGURATION
C7_WEATHER_WMO_ICON_MAPPING_PHYSICAL=UNKNOWN_BLOCKED_BY_CONFIGURATION_FAILURE
C7_GOOGLE_NEWS_RUNTIME_TYPE_REGISTRATION=FAIL_UNKNOWN_DYNAMIC_TYPE_GOOGLE_NEWS
C7_GOOGLE_NEWS_AU_PHYSICAL=UNKNOWN_BLOCKED_BY_DYNAMIC_TYPE_FAILURE
C7_GOOGLE_NEWS_TW_PHYSICAL=UNKNOWN_BLOCKED_BY_DYNAMIC_TYPE_FAILURE
C7_GOOGLE_NEWS_BOTH_PHYSICAL=UNKNOWN_BLOCKED_BY_DYNAMIC_TYPE_FAILURE
C7_CALENDAR=UNKNOWN
```

## Exact source/runtime reconciliation

The live PR #2 head was `0bc636ea10fcc3f22d53fea89bee6bdbd10e89ac` and remains
OPEN / DRAFT / UNMERGED. The running Slate backend remains the previously
accepted `d26efe2441407faf71c4c508f66e9f5c39f98fae` /
`slate:m4-postphysical-c8-c7-d26efe2` artifact. The source tree at that
candidate is unchanged from the live PR #2 runtime source.

Path-level comparison against Campaign 7 source
`641e358f7067d7e314e4f2c1eb18258690268cab` proves that the deployed/current
PR #2 source omits the full `google_news` feature paths: shared discriminator,
backend definition/registry/provider/renderer, and frontend type/config/edit
paths. This is an omission during the C7-to-C8 combination, before runtime
registration, not a provider or network failure.

The current deployed/shared/backend/frontend Weather schemas are QWeather-only
(`provider: "qweather"`). The reviewed Campaign 7 source adds the Open-Meteo
variant and Perth coordinates. Therefore the observed `Invalid configuration:`
failure is consistent with the earliest boundary being backend persisted-config
validation, before provider fetch or icon mapping. The exact persisted values
were not retained from the screenshot and are not reconstructed here; the
record shape remains a privacy-safe structural evidence gap until a key-only
inspection is available.

```text
C7_GOOGLE_NEWS_EARLIEST_FAILED_BOUNDARY=COMBINED_SOURCE_OMISSION_BEFORE_RUNTIME_REGISTRATION
C7_GOOGLE_NEWS_ROOT_CAUSE=PR2_D26_OMITS_REVIEWED_C7_GOOGLE_NEWS_PATHS
C7_WEATHER_EARLIEST_FAILED_BOUNDARY=BACKEND_PERSISTED_CONFIG_VALIDATION
C7_WEATHER_ROOT_CAUSE=DEPLOYED_QWEATHER_ONLY_SCHEMA_REJECTS_C7_OPEN_METEO_SHAPE
C7_WEATHER_PERSISTED_CONFIG_SHAPE=UNKNOWN_NOT_RETAINED;KEY_ONLY_EVIDENCE_REQUIRED
C7_EXPECTED_RUNTIME_PATHS_PRESENT_IN_D26EFE2=NO_FOR_GOOGLE_NEWS_AND_OPEN_METEO
C7_GOOGLE_NEWS_REGISTRATION_PATH_MATCH=FAIL_FULL_PATH_OMITTED
C7_COMBINATION_OMISSION_OR_VERSION_SKEW=COMBINATION_OMISSION
```

## Safe work queue

```text
NODE_C8_JAPANESE_GLYPH_INTEGRITY=READONLY_READY_PROVIDER_DISABLED_FONT_UTF8_CMAP_DIAGNOSIS
NODE_C7_OUTLOOK_ENGLISH_SAFE_ERROR=READY_PROVIDER_OAUTH_FREE_TRACE_AND_TEST
NODE_C7_WEATHER_COMPATIBILITY=READY_PROVIDER_DISABLED_SCHEMA_MIGRATION_AND_MAPPING_TESTS
NODE_C7_GOOGLE_NEWS_REGISTRATION=READY_PROVIDER_DISABLED_CREATE_READ_REFRESH_RENDER_TESTS
FIRMWARE_FLASH=NO
BACKEND_DEPLOYMENT=NO_NEW_AUTHORITY
PROVIDER_CALL=NO
```

The next implementation, if mechanical tests confirm these boundaries, must
preserve content identity, Outlook read-only Calendars.Read isolation, C8 voice
repairs, and the no-private-data/no-provider-call boundary. Material runtime
changes require AGY implementation, deterministic validation, privacy/secret
scan, exact freeze and fresh Grok 4.6 review. Firmware changes may be built and
reviewed but must not be flashed.

