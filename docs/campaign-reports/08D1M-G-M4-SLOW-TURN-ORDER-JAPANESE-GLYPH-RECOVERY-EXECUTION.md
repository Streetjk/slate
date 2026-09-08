# 08D1M-G M4 Slow Turn, Order, and Japanese Glyph Recovery — Execution Checkpoint

This is the durable execution checkpoint for the directive in
`08D1M-G-M4-SLOW-TURN-ORDER-JAPANESE-GLYPH-RECOVERY.md`. It is reconciled from
GitHub and the exact working-tree head below; the previous Codex transcript is
not authoritative.

## Live control-bus state

```text
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
CURRENT_HEAD=77a3ea87ed719fc863a23137d5916df6bba3f3f8
MODE=FRONTIER_DRIVEN_LONGRUN
LATEST_DIRECTIVE=08D1M-G-M4-SLOW-TURN-ORDER-JAPANESE-GLYPH-RECOVERY.md
LATEST_PHYSICAL_SESSION_INGESTED=YES
HUMAN_BOUNDARY_CONSUMED=YES
```

## Combined-session reconciliation

The operator result for the completed combined session was ingested. The
already-running sanitized observer was also queried using its allowlisted
markers. Its retained evidence showed successful Voice session creation/start,
WebSocket authentication/acceptance, and first microphone ingress. It did not
retain provider output, backend first-audio, firmware audio, or timing markers.

```text
CONFIG_ERROR_REPRODUCED=NO
VOICE_SERVICE_ERROR=NO_FOR_THIS_SESSION
PROVIDER_SESSION_CREATE=PASS
PROVIDER_SESSION_STARTED=YES
FIRST_MIC_FRAME_RECEIVED=YES
LIVE_FAILURE_SOURCE=NOT_EMITTED
ASSISTANT_RESPONSE_VISIBLE=YES
VOICE_RESPONSE_LATENCY=OPERATOR_REPORTED_APPROX_10000_MS_PLUS
DOMINANT_LATENCY_STAGE=UNDETERMINED_OBSERVER_GAP_NOT_MECHANICALLY_ASSIGNABLE
LATENCY_STAGE_BREAKDOWN=PROVIDER_READY_UNKNOWN;FIRST_PROVIDER_OUTPUT_UNKNOWN;BACKEND_FIRST_AUDIO_UNKNOWN;FIRMWARE_AUDIO_UNKNOWN;DISPLAY_UNKNOWN
TURN_BUBBLE_SEQUENCE=ASSISTANT_ANSWER_THEN_USER_QUESTION
EXPECTED_TURN_SEQUENCE=USER_QUESTION_THEN_ASSISTANT_ANSWER
TURN_ORDER_REPAIR=IMPLEMENTED_AND_DETERMINISTICALLY_TESTED
JAPANESE_SESSION_REACHED=YES
JAPANESE_VISIBLE_TEXT=YES_BUT_GLYPHS_CORRUPTED
JAPANESE_EXAMPLE_EXPECTED=の
JAPANESE_EXAMPLE_RENDERED=ㄇ
AUDIO_CHAIN_STATUS=BACKEND_MIC_INGRESS_AND_PROVIDER_SESSION_ESTABLISHED;PROVIDER_OUTPUT_TO_PLAYER_AND_PHYSICAL_AUDIBILITY_UNKNOWN_NOT_OBSERVED
AUDIO_ACCEPTANCE=OPEN
```

The historical `VOICE_CONFIG_AUTH_RESULT=REJECT` marker is not the latest
session failure: the same retained observer window also contains successful
session creation/start and WebSocket authentication. No `LIVE_FAILURE_SOURCE`
was emitted. Because the deployed image predates the new numeric timing trace,
the reported 10+ second latency cannot be assigned to a stage retroactively.
The candidate now emits sanitized stage timestamps for the next qualified
session; no raw transcript, audio, credential, or private-data payload is
retained.

## Runtime repairs completed in the candidate

The designated AGY Gemini 3.8 Flash implementer completed the scoped repair and
the timing-observer follow-up. The repaired candidate preserves streaming:

* Backend input transcription is coalesced briefly and flushed before output
  or audio markers, so the user bubble is committed before the assistant bubble
  without buffering the assistant until `turnComplete`.
* Firmware tracks one user and one assistant bubble per turn, merges streaming
  assistant deltas, and inserts a late user transcript before an already
  displayed assistant response.
* UTF-8 input and Japanese code-point coverage are tested. Voice AI bubbles use
  the new Japanese-capable font path; existing English/Chinese rendering paths
  remain unchanged.
* `Zfull_16` was confirmed to be GB2312-oriented and not to provide the needed
  Hiragana cmap entry for U+306E. The minimum candidate uses the repository's
  existing `Zfull-GB.ttf` as the source for a direct Voice font plus the
  existing fallback strategy, covering Hiragana, Katakana, Japanese punctuation,
  and the selected common-Kanji strategy. No transliteration was introduced.
* Audio first-packet, queue, decode, playback, and I2S-write markers are now
  structural allowlisted logs. They do not claim physical audibility.

AGY implementation jobs:

```text
AGY_MODEL=gemini-3.8-flash-high
AGY_REPAIR_JOB=implement-mtsi67d1-5d90b762
AGY_TIMING_OBSERVER_JOB=implement-mtsjb8s7-975a1cee
```

## Deterministic validation and exact firmware freeze candidate

```text
BACKEND_VOICE_SESSION_TEST=40_PASS_0_FAIL_371_EXPECTS
BACKEND_AGY_FULL_TEST=365_PASS_5_SKIP_0_FAIL
BACKEND_TYPECHECK=PASS
BACKEND_LINT=PASS
FIRMWARE_VOICE_FONT_COVERAGE=PASS
FIRMWARE_BUBBLE_UPDATE_HOST_TEST=PASS
FIRMWARE_AUDIO_PATH_MARKERS_TEST=PASS
OBSERVER_SELF_TEST=PASS
GIT_DIFF_CHECK=PASS
FIRMWARE_BUILD=ESP_IDF_V5.5.2_ESP32_S3_PASS
FIRMWARE_IMAGE=firmware/build-m4-docker/slate.bin
FIRMWARE_IMAGE_SIZE_BYTES=2532432
FIRMWARE_IMAGE_SHA256=f9ecd177901a6f583028fb1db7f2f395143e7690598af96ff2cd8b34801496dd
FIRMWARE_BASELINE_IMAGE_SIZE_BYTES=2506448
FIRMWARE_BINARY_DELTA_BYTES=25984
FIRMWARE_APP_PARTITION_FREE_BYTES=1661872
VOICE_FONT_OBJECT_FLASH_BYTES=24478
VOICE_FONT_STATIC_RAM_BYTES=0
DIRAM_USED_BYTES=237179
DIRAM_TOTAL_BYTES=341760
IRAM_USED_BYTES=16384
IRAM_TOTAL_BYTES=16384
```

The new font source is approximately 196.2 KiB and its compiled object
contributes 24,478 bytes of flash read-only data with no static RAM increase.
The exact app image remains within the 4 MiB app partition. Font provenance is
the existing repository asset `backend/assets/fonts/vector/Zfull-GB.ttf`; no
external font was introduced. A standalone font license file was not present in
the repository and no new licensing claim is made here.

## Privacy and frontier

```text
PRIVACY_SECRET_SCAN=PASS_NO_REAL_SECRETS_ONLY_INTENTIONAL_SYNTHETIC_TEST_FIXTURES
PROVIDER_MODEL_AUTHORITY_CHANGED=NO
PRIVATE_DATA_AUTHORITY_CHANGED=NO
PRODUCTION_MUTATION_AT_THIS_CHECKPOINT=NO
ZAI_REVIEW_STATUS=PENDING
BACKEND_EXACT_BUILD_STATUS=PENDING
BACKEND_DEPLOYMENT_STATUS=PENDING
APP_ONLY_REFLASH_STATUS=PENDING
OBSERVER_REARM_STATUS=PENDING
READY_NODE_COUNT=1
READONLY_READY_NODE_COUNT=1
WAITING_DEVICE_COUNT=0
WAITING_HUMAN_COUNT=0
EXTERNALLY_BLOCKED_COUNT=0
HUMAN_ACTION_REQUIRED=NO
CURRENT_BLOCKED_NODE=ZAI_EXACT_REVIEW_BACKEND_BUILD_DEPLOYMENT_APP_ONLY_REFLASH_OBSERVER_REARM
TERMINAL_REASON=PHYSICAL_ACCEPTANCE_NOT_YET_REQUALIFIED
NEXT_ACTION=ZAI_REVIEW_BACKEND_BUILD_FREEZE_DEPLOY_REFLASH_REQUALIFY_REARM
```

The existing campaign authority remains bounded to an exact backend artifact
deployment and app-only firmware write at `0x10000`; no erase, partition, NVS,
LittleFS, pairing, provider, model, credential, billing, or private-data
authority is changed. A new combined physical EN/JA acceptance session is not
requested while these nonphysical frontier nodes remain.

## Latest exact review/build checkpoint — source and artifacts frozen

This checkpoint supersedes the pending statuses above without rewriting the
historical evidence. The exact live PR head was re-fetched from GitHub before
this checkpoint.

```text
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
CURRENT_HEAD=7acb8b96a02130dd0de8b21bc39e3fc43355da5f
MODE=FRONTIER_DRIVEN_LONGRUN
LATEST_POST_CONFIG_RESTORE_PHYSICAL_SESSION_INGESTED=YES
HUMAN_BOUNDARY_CONSUMED=YES
VOICE_SERVICE_ERROR=NO_FOR_LATEST_SESSION
LIVE_FAILURE_SOURCE=NOT_EMITTED
PROVIDER_SESSION_CREATE_RESULT=PASS
PROVIDER_SESSION_STARTED=YES
FIRST_MIC_FRAME_RECEIVED=YES
PROVIDER_OUTPUT_AND_DOWNSTREAM_AUDIO=NOT_RETAINED_BY_PREVIOUS_DEPLOYED_OBSERVER
DOMINANT_LATENCY_STAGE=UNDETERMINED_REQUIRES_NEW_NUMERIC_MARKER_SESSION
TURN_ORDER_ROOT_CAUSE=BACKEND_INPUT_TRANSCRIPT_FLUSHED_ONLY_AT_TURN_COMPLETE;FIRMWARE_ARRIVAL_ORDER
TURN_ORDER_REPAIR_STATUS=QUALIFIED_DETERMINISTICALLY;STREAMING_PRESERVED
JP_GLYPH_ROOT_CAUSE=VOICE_BUBBLES_USED_GB2312_ORIENTED_ZFULL_16_WITHOUT_U+306E_CMAP
JP_GLYPH_REPAIR_STATUS=QUALIFIED_DIRECT_JP_FONT_PLUS_ZFULL_16_FALLBACK
JP_FONT_SOURCE_BYTES=200889
JP_FONT_OBJECT_FLASH_BYTES=24478
JP_FONT_STATIC_RAM_BYTES=0
FIRMWARE_IMAGE=firmware/build-m4-docker/slate.bin
FIRMWARE_IMAGE_SIZE_BYTES=2533424
FIRMWARE_IMAGE_SHA256=4ea31710c6dfd5bff025b5282f2dd5edd49117eacfe4161988dcde0df820c298
FIRMWARE_BASELINE_IMAGE_SIZE_BYTES=2506448
FIRMWARE_BINARY_DELTA_BYTES=26976
FIRMWARE_APP_PARTITION_FREE_BYTES=1661872
BACKEND_IMAGE_TAG=slate:m4-slow-turn-order-jp-7acb8b9
BACKEND_IMAGE_ID=sha256:33b7803a575c9fddb11987f3bdbfa3f5d824882716bc067d1b195ec512a10778
BACKEND_IMAGE_PLATFORM=linux/arm64
BACKEND_IMAGE_SIZE_BYTES=1130744084
BACKEND_IMAGE_TAR_SHA256=0d601b40bb8d8d22c0978ba2ba47cbac752f946edbd97eb1f608dc682ad15962
BACKEND_PROVIDER_DISABLED_VOICE_SESSION_TEST=40_PASS_0_FAIL_371_EXPECTS
BACKEND_PROVIDER_DISABLED_ADAPTER_TEST=6_PASS_0_FAIL_16_EXPECTS
FIRMWARE_VOICE_FONT_COVERAGE=PASS
FIRMWARE_BUBBLE_UPDATE_HOST_TEST=PASS
FIRMWARE_AUDIO_PATH_MARKERS_TEST=PASS
OBSERVER_SELF_TEST=PASS
PRIVACY_SECRET_SCAN=PASS_NO_REAL_SECRETS
ZAI_REVIEW_ROUTE=zai-glm53-reviewer
ZAI_REVIEW_MODEL=glm-5.3-flash
ZAI_REVIEW_TARGET_SHA=7acb8b96a02130dd0de8b21bc39e3fc43355da5f
ZAI_REVIEW_VERDICT=PASS_NO_P0_P1_P2_NO_SECURITY_FINDINGS
ZAI_REVIEW_REMAINING_NOTES=P3_ONLY
BACKEND_EXACT_BUILD_STATUS=PASS_FROZEN
FIRMWARE_EXACT_BUILD_STATUS=PASS_FROZEN
BACKEND_DEPLOYMENT_STATUS=PENDING
APP_ONLY_REFLASH_STATUS=PENDING
OBSERVER_REARM_STATUS=PENDING
READY_NODE_COUNT=1
READONLY_READY_NODE_COUNT=1
WAITING_DEVICE_COUNT=0
WAITING_HUMAN_COUNT=0
EXTERNALLY_BLOCKED_COUNT=0
CURRENT_BLOCKED_NODE=BOUNDED_DEPLOYMENT_APP_ONLY_REFLASH_OBSERVER_REARM
HUMAN_ACTION_REQUIRED=NO
HUMAN_ACTION_REASON=NONE
TERMINAL_REASON=PHYSICAL_ACCEPTANCE_NOT_YET_REQUALIFIED
NEXT_ACTION=DEPLOY_EXACT_REVIEWED_BACKEND;APP_ONLY_REFLASH_EXACT_FIRMWARE;REQUALIFY_AND_REARM_OBSERVER
```

The P3 review notes are retained as nonblocking follow-up: marker boundary
precision, bounded snapshot-copy benchmarking, CI wiring, and hardware
measurement. No provider/model/credential/billing/private-data authority was
changed.
