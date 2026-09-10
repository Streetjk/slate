# Portfolio C8+C7 deterministic repair and glyph ingestion

Date: 2026-09-11 (Australia/Perth)

## Durable boundary

The combined C8+C7 physical acceptance is consumed. No new provider call,
backend deployment, firmware flash, NOTE4 reset, re-pair, Wi-Fi change,
OAuth action, private-data access, C10 deployment, C9 activation, merge, or
release is authorized by this checkpoint.

```text
PHYSICAL_ACCEPTANCE=CONSUMED
LIVE_PR2_HEAD_AT_PRIOR_CHECKPOINT=18cebb7ce095509ee348db209c519e32377e80c3
RUNNING_BACKEND_SOURCE=d26efe2441407faf71c4c508f66e9f5c39f98fae
RUNNING_BACKEND_TAG=slate:m4-postphysical-c8-c7-d26efe2
```

## Exact repair candidate and provenance

The C7 source repair was implemented by the designated AGY implementer after
Codex source adjudication. The candidate is kept local pending independent
Grok review and later explicit deployment authority.

```text
COMBINED_BASE=d26efe2441407faf71c4c508f66e9f5c39f98fae
C8_REPAIR_PARENT=6d0b7f274e36872f5f70c89e4ff7f26746714378
C7_REPAIR_PARENT=641e358f7067d7e314e4f2c1eb18258690268cab
C8_C7_OVERLAP_FILES=shared/src/dynamic/config.ts;backend/src/modules/dynamic-content/{dynamic-content-registry.ts,dynamic-content.module.ts,dynamic-content-renderer.service.test.ts,rendering/dynamic-frame-renderer.ts};frontend/src/features/dynamic/model/{config-types.ts,default-config.ts,type-meta.ts}
CONFLICT_FILES=NONE
CONFLICT_RESOLUTION=NO_CONFLICT;C8_ASSISTANT_AND_FIRMWARE_TREES_UNCHANGED
C8_REPAIR_PRESENT=YES
C7_OUTLOOK_REPAIR_PRESENT=YES
C7_WMO_REPAIR_PRESENT=YES
C7_GOOGLE_NEWS_REPAIR_PRESENT=YES
FIRMWARE_CHANGED=NO
REPAIR_SOURCE=d8c5199
```

The final source commit includes the AGY C7 repair and a privacy hardening
follow-up that removes raw Google News upstream exception text from logs.
Google News errors remain structurally classified by the surrounding service;
upstream message/payload text is not persisted.

## C7 mechanical diagnosis

### Weather

The exact persisted record contents were not retained in the physical window,
and no private database contents were accessed for this diagnosis. The
operator-visible record is a `weather` card with a configuration validation
failure. Source comparison proves the deployed d26 WeatherProvider accepted
the older QWeather-only shape, while the reviewed C7 path defines a normalized
provider-discriminated shape supporting `qweather` and `open_meteo`, with
Open-Meteo coordinates/timezone and refresh settings.

```text
C7_WEATHER_PERSISTED_DYNAMIC_TYPE=weather_OPERATOR_VISIBLE;EXACT_RECORD_NOT_RETAINED
C7_WEATHER_PERSISTED_CONFIG_SHAPE=UNKNOWN_EXACT_PRIVATE_RECORD
C7_WEATHER_SHARED_SCHEMA_EXPECTED_SHAPE=provider_qweather_or_open_meteo;provider-specific_fields;refresh_interval_sec
C7_WEATHER_BACKEND_SCHEMA_EXPECTED_SHAPE=WeatherConfig_normalized_provider_discriminator;Open-Meteo_coordinates_and_timezone_supported
C7_WEATHER_FRONTEND_SCHEMA_EXPECTED_SHAPE=provider_selector;Open-Meteo_city_coordinates_timezone_or_legacy_QWeather_fields
C7_WEATHER_VALIDATION_LAYER_RETURNING_ERROR=DEPLOYED_d26_BACKEND_WEATHER_PROVIDER_VALIDATION
C7_WEATHER_SCHEMA_VERSION_OR_MIGRATION_MISMATCH=YES;DEPLOYED_QWEATHER_ONLY_RUNTIME_VS_REVIEWED_C7_OPEN_METEO_SHAPE
C7_WEATHER_LEGACY_RECORD_COMPATIBILITY=QWEATHER_LEGACY_SUPPORTED;OPEN_METEO_LEGACY_RECORD_REJECTED_BY_DEPLOYED_d26
C7_WEATHER_EARLIEST_FAILED_BOUNDARY=BACKEND_PERSISTED_CONFIG_VALIDATION
C7_WEATHER_ROOT_CAUSE=COMBINED_CANDIDATE_OMITTED_C7_OPEN_METEO_SCHEMA_PROVIDER_AND_NORMALIZATION_PATH
```

The repair is compatibility-first: it does not delete or recreate records.
It accepts legacy QWeather configurations, validates Open-Meteo configurations
with bounded coercion for persisted numeric fields, normalizes both providers,
and preserves the existing unknown WMO fallback. Deterministic tests cover
legacy QWeather, current Open-Meteo Perth, malformed configuration, concise
English error handling, representative WMO values and unknown values.

### Google News

The current d8 candidate restores the complete C7 path. The deployed d26
candidate omitted that path before runtime registration, which mechanically
explains `Unknown dynamic type: google_news`.

```text
C7_GOOGLE_NEWS_SHARED_TYPE_REGISTERED=YES_IN_d8;NO_IN_DEPLOYED_d26
C7_GOOGLE_NEWS_BACKEND_DYNAMIC_TYPE_REGISTERED=YES_IN_d8;NO_IN_DEPLOYED_d26
C7_GOOGLE_NEWS_RUNTIME_RENDERER_REGISTERED=YES_IN_d8;NO_IN_DEPLOYED_d26
C7_GOOGLE_NEWS_REFRESH_JOB_REGISTERED=YES_IN_d8;NO_IN_DEPLOYED_d26
C7_GOOGLE_NEWS_FRONTEND_TYPE_REGISTERED=YES_IN_d8;NO_IN_DEPLOYED_d26
C7_GOOGLE_NEWS_PERSISTED_RECORD_TYPE=google_news;AU_TW_BOTH
C7_GOOGLE_NEWS_API_ACCEPTS_TYPE=YES_IN_d8;NO_IN_DEPLOYED_d26
C7_GOOGLE_NEWS_EARLIEST_FAILED_BOUNDARY=COMBINED_SOURCE_OMISSION_BEFORE_RUNTIME_REGISTRATION
C7_GOOGLE_NEWS_ROOT_CAUSE=REVIEWED_C7_GOOGLE_NEWS_PATH_OMITTED_FROM_d26_COMBINED_SOURCE
C7_GOOGLE_NEWS_PROVIDER_DISPATCH_TESTS=AU_TW_BOTH_PASS_PROVIDER_DISABLED
C7_GOOGLE_NEWS_RENDER_DISPATCH_TESTS=AU_TW_BOTH_PASS_PROVIDER_DISABLED
```

The restored provider uses only fixed AU/TW RSS endpoints, bounds response
size/items, rejects unsafe XML constructs and non-Google links, separates
editions, and does not log raw upstream exception text.

### Outlook

The physical result proves a visible failure rather than a silent no-op, but it
does not prove the private underlying Microsoft configuration/service cause.
Source and historical d26 comparison prove the exact user-visible language
boundary:

```text
C7_OUTLOOK_SILENT_NOOP_REPAIR=PARTIAL_PASS_VISIBLE_ERROR_NOW_PRESENT
C7_OUTLOOK_CONNECTION_SUCCESS=FAIL_OR_NOT_ESTABLISHED
C7_OUTLOOK_ERROR_LANGUAGE=FAIL_CHINESE
C7_OUTLOOK_ERROR_CLASS=HTTP_5XX_BACKEND_EXCEPTION_FILTER_CHINESE_ENVELOPE_PROPAGATED_BY_PRE_REPAIR_FRONTEND
C7_OUTLOOK_EARLIEST_FAILED_BOUNDARY=BACKEND_AUTH_URL_REQUEST_EXCEPTION_RESPONSE_TO_FRONTEND_ERROR_PRESENTATION
C7_OUTLOOK_UNDERLYING_MICROSOFT_CONFIG_OR_SERVICE_CAUSE=UNKNOWN_WITHOUT_OAUTH_OR_PRIVATE_ACCESS
C7_OUTLOOK_REPAIRED_BEHAVIOR=HTTP_5XX_OR_NON_ENGLISH_OR_SENSITIVE_ERROR_TO_OUTLOOK_SERVER_ERROR_OR_SAFE_FALLBACK
C7_OUTLOOK_SCOPES_UNCHANGED=openid;profile;offline_access;Calendars.Read
```

The d8 frontend repair adds status-aware, Chinese/error-class-aware
sanitization, redacts sensitive-looking values, and preserves navigation on a
valid authorization URL. It does not initiate OAuth or expand scopes.

## C8 Japanese glyph and text-pipeline diagnosis

Provider-disabled host replay passed the exact synthetic Japanese strings
through the repository UTF-8 sanitizer and decoder. Expected codepoints,
including U+306E `の`, were preserved byte-for-byte. A separate intentional
U+3107 `ㄇ` literal decoded to U+3107; it was not substituted by the decoder.

The generated Voice_Font_16 cmap contains U+306E directly. The Zfull_16
fallback cmap does not contain U+306E, and neither effective cmap contains
U+3107. Therefore the current source evidence does not support backend UTF-8
corruption or a decoder substitution. It also does not prove the exact flashed
firmware/render/cache state from this consumed physical window.

```text
C8_UTF8_SYNTHETIC_STRINGS=こんにちは。;今日の天気どう？;日本の首都はどこですか？;一年は何ヶ月ありますか？;日本の通貨は何ですか？
C8_BACKEND_UTF8_CODEPOINT_PRESERVATION=PASS_PROVIDER_DISABLED
C8_FIRMWARE_UTF8_DECODER_PRESERVATION=PASS_HOST_REPLAY
C8_VOICE_FONT_DIRECT_U+306E=YES
C8_FALLBACK_FONT_U+306E=NO
C8_U+3107_IN_EFFECTIVE_CMAPS=NO
C8_GLYPH_ROOT_CAUSE=UNRESOLVED_DEPLOYED_FIRMWARE_RENDER_OR_UPSTREAM_CODEPOINT;SOURCE_UTF8_AND_DECODER_REPLAY_PASS
C8_FIRMWARE_CHANGE_REQUIRED=NO_JUSTIFIED_CHANGE_FROM_CURRENT_EVIDENCE
C8_FIRMWARE_FLASH=NO
```

The physical `ㄇ`/square evidence remains a real glyph-integrity failure, but
the safe conclusion is not to guess a font repair without exact LVGL cmap,
fallback-selection, glyph-cache and e-ink-state evidence. No firmware bytes
were changed.

## Deterministic validation

```text
BACKEND_DYNAMIC_CONTENT_TESTS_ISOLATED=126_PASS_0_FAIL
FRONTEND_TESTS=11_PASS_0_FAIL
SHARED_TESTS=6_PASS_0_FAIL
TYPECHECK=PASS
LINT=PASS
FORMAT_CHECK=PASS
OUTLOOK_CONTROLLER_AND_SAFE_ERROR_TESTS=PASS
WEATHER_SCHEMA_OPEN_METEO_LEGACY_MALFORMED_TESTS=PASS
WMO_MAPPING_KNOWN_AND_UNKNOWN_TESTS=PASS
GOOGLE_NEWS_AU_TW_BOTH_PROVIDER_AND_RENDER_TESTS=PASS
FIRMWARE_UTF8_FONT_HOST_TEST=PASS
FIRMWARE_BUBBLE_HOST_TEST=PASS
FIRMWARE_AUDIO_MARKER_TEST=PASS
FIRMWARE_WEBSOCKET_EVENT_LOSS_TEST=UNRUNNABLE_IN_CHECKOUT;REFERENCED_ESP_TCP_AND_ESP_SSL_SOURCES_ABSENT;NO_PRODUCT_FAILURE_INFERRED
GIT_DIFF_CHECK=PASS
PRIVACY_SECRET_SCAN=PASS_NO_SECRET_VALUES_OR_PRIVATE_PAYLOADS_ADDED
```

The non-isolated backend dynamic-content command is subject to an existing
Bun global-module-mock race; its isolated equivalent is the deterministic
qualification result above. The WebSocket script's missing transport sources
are a checkout/test-fixture limitation, not a change in this candidate.

## Review and authority

```text
AGY_IMPLEMENTATION=SUCCESS_GEMINI_3_8_FLASH_HIGH
AGY_PROVIDER_CALLS=NO_PRODUCT_PROVIDER_CALLS
GROK_REVIEW_COMMAND=grok -m grok-4.6
GROK_REVIEW_STATUS=BLOCKED_RETRYABLE_DEVICE_NOT_CONFIGURED_BEFORE_REVIEW
GROK_REVIEW_FALLBACK=NONE
EXACT_ARTIFACT_BUILD=NOT_YET_FROZEN_PENDING_GROK_REVIEW
BACKEND_DEPLOYMENT=NO_NEW_AUTHORITY
FIRMWARE_FLASH=NO_AUTHORITY
```

Next safe action is to freeze this exact source/artifact and obtain the fresh
independent Grok 4.6 review, retrying the recoverable local reviewer setup
failure through the canonical route only. Changed backend/shared/frontend
bytes remain undeployed until explicit deployment authority is granted.
