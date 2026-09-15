# C8/C7 consumed physical result triage: U+6CA2, voice stall and Weather icon

Date: 2026-09-15 (Australia/Perth)

Status: CONSUMED; NO AUTOMATIC REPEAT; SOURCE TRIAGE COMPLETE; NEW FIRMWARE CANDIDATE NOT FLASHED

## Boundary

The operator supplied a new bounded physical result after the previously
approved no-serial acceptance path. It is consumed once. No serial node was
opened, no raw transcript/audio/provider payload was retained, and no reset
cause was observed or inferred.

```text
PHYSICAL_REQUALIFICATION_CONSUMED=YES
PHYSICAL_REQUALIFICATION_PENDING=NO
AUTO_REPEAT_AUTHORIZED=NO
OBSERVER_NONINTERFERENCE_PROVEN=NO
RESET_CAUSE_ATTRIBUTION=UNKNOWN
NOTE4_AUTHENTICATED_POLL=UNKNOWN_POST_ACTIVATION_NO_FRESH_SANITIZED_MARKER
C8_OUTPUT_RESULT=SMOOTHER_FASTER_OPERATOR_REPORTED
C8_INPUT_RESULT=STALL_AFTER_LONG_OUTPUT_OPERATOR_REPORTED
C7_WEATHER_ICON_RESULT=VISIBLE_QUESTION_MARK_OPERATOR_REPORTED
C8_U6CA2_RESULT=沢_FAILS_TO_RENDER_OPERATOR_REPORTED
```

The output improvement is an operator observation, not a measured latency
claim. The input stall, Weather icon and glyph results are retained as
component findings; no unreported Calendar, News, Outlook, audio, reboot or
clean-exit result is upgraded here.

## Grok adjudication

Decision packet: `C8-C7-PHYSICAL-RESULT-20260915`, sent to Grok 4.6 with the
source paths and bounded evidence. The decision was:

```text
DECISION_STATUS=DECIDED
INPUT_STALL_CLASS=UNPROVEN
INPUT_STALL_REPAIR=NONE
WEATHER_ICON_CLASS=UNPROVEN
WEATHER_REPAIR=NONE
GLYPH_CLASS=SOURCE_GENERATOR_OMISSION
GLYPH_REPAIR=ADD_U+6CA2_沢_TO_THE_CONTROLLED_VOICE_AND_ZFULL_SYMBOL_LISTS_AND_EXTEND_COVERAGE_TEST
SELECTED_IMPLEMENTATION_SCOPE=GLYPH_SOURCE_AND_COVERAGE_TEST_ONLY
IMPLEMENTATION_WRITER=CODEX
```

The input path intentionally disables capture during TTS and resumes after
`tts stop` plus playback-queue drain. The supplied evidence does not prove a
backend defect, a lost stop message, or a device/codec defect. Weather source
mapping has deterministic known-code tests and intentionally uses `999.svg`
for unknown/unmapped values; the active frame code/content/hash was not
correlated to the displayed image, so the visible `?` remains unproven as a
source defect.

## Implemented font candidate

The exact source candidate is commit `9e9cc69aa1beacb2ca88515cdf4e2330cf50a80b`.
It adds U+6CA2 to the controlled `Voice_Font_16` generator and selected
`Zfull_16` symbol set, regenerates the checked-in font sources, and adds direct
and reachable coverage assertions plus the `沢` fixture. It does not broaden
the full CJK range and does not claim running-device proof.

```text
PRODUCT_SOURCE_COMMIT=9e9cc69aa1beacb2ca88515cdf4e2330cf50a80b
VOICE_FONT_16_SHA256=9f1670ea5f129ece966f0311adf164ae07573670e5198c824418fae404174e7e
ZFULL_16_SHA256=519a1c30202dc2c5493a323414d42c31de47c5ef184d64e4bd9c21f3d28701e3
BACKEND_CHANGED=NO
FIRMWARE_SOURCE_CHANGED=YES
FIRMWARE_BIN_SHA256=NOT_AVAILABLE_BUILD_BLOCKED
FIRMWARE_ELF_ID=NOT_AVAILABLE_BUILD_BLOCKED
FIRMWARE_FLASH=NO
DEVICE_PROOF=NO
```

## Qualification

```text
FONT_COVERAGE=PASS_U+6CA2_DIRECT_AND_REACHABLE
FIRMWARE_MARKER_TEST=PASS
BUBBLE_UPDATE_HOST_TEST=PASS
AUDIO_PATH_MARKERS_TEST=PASS
WEATHER_PROVIDER_RENDERER_TESTS=22_PASS_0_FAIL
VOICE_SESSION_TESTS=52_PASS_0_FAIL
GIT_DIFF_CHECK=PASS
```

The pinned `espressif/idf:v5.5.2` build reached ESP-IDF component
validation but stopped because the checkout's managed
`78/esp-ml307` component has neither `.component_hash` nor `CHECKSUMS.json`.
No binary was produced and no substitute binary was reviewed. This is an
environment/input blocker, not evidence of a product build failure.

## Fresh exact-candidate review

The fresh Grok 4.6 review returned:

```text
VERDICT=PASS
P0=NONE
P1=NONE
P2=OBSERVER_RESET_ATTRIBUTION_UNKNOWN;NO_DEVICE_PROOF
SECURITY=NONE
REVIEWED_SOURCE_SHA=9e9cc69aa1beacb2ca88515cdf4e2330cf50a80b
REVIEWED_FONT_ID=Voice_Font_16:9f1670ea5f129ece966f0311adf164ae07573670e5198c824418fae404174e7e;Zfull_16:519a1c30202dc2c5493a323414d42c31de47c5ef184d64e4bd9c21f3d28701e3
REVIEWED_FIRMWARE_BIN_SHA256=NONE
REVIEWED_BACKEND_ARTIFACT=NONE
```

This review passes the exact source/font candidate only. It does not authorize
flash, deployment or another physical attempt. A later firmware build and
separate app-only flash authority are required before device confirmation.

## Current frontier

```text
INPUT_STALL_STATUS=UNPROVEN_NO_SOURCE_REPAIR
WEATHER_ICON_STATUS=UNPROVEN_ACTIVE_FRAME_OR_INPUT_CODE_BOUNDARY
U6CA2_STATUS=SOURCE_CANDIDATE_REVIEWED_NO_DEVICE_PROOF
OBSERVER_NONINTERFERENCE_PROVEN=NO
RESET_CAUSE_ATTRIBUTION=UNKNOWN
NEXT_ACTION=NONE_UNTIL_78_ESP_ML307_COMPONENT_HASH_OR_CHECKSUM_INPUT_IS_RECOVERED;NO_FLASH;NO_REPEAT
```
