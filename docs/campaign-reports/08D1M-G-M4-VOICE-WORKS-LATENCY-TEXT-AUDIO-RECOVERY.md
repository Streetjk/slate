# Campaign 8D1M-G — Voice Works, But Latency / Text Refresh / Audio Are Broken

## Zero-provider artifact qualification checkpoint — cumulative runtime candidate

The complete frozen runtime candidate was independently reviewed after the
backend lifecycle correction, including the cumulative firmware changes from
the parent repair. No Gemini provider session, microphone session, production
deployment, credential access, or firmware flash was used.

```text
SOURCE_CANDIDATE_COMMIT=f10ade66e75522d27f023573f2aad03d39f4d8a2
PROVIDER_CALLS_THIS_STAGE=0
PRODUCTION_CHANGED=NO
FIRMWARE_FLASHED_THIS_STAGE=NO
BACKEND_IMAGE_TAG=slate:m4-voice-repair-f10ade6
BACKEND_IMAGE_ID=sha256:14aad6490d63236776c89e1aeff1b1c630f21de13f65a6c9b6b99023cf52087c
BACKEND_IMAGE_PLATFORM=linux/arm64
BACKEND_IMAGE_SIZE_BYTES=1130677690
BACKEND_IMAGE_TAR_SHA256=4ad2a5f49e893dbfbbc02dbc6f5056d6359a7b0a176be444744f0a494dd5d156
BACKEND_PROVIDER_DISABLED_TESTS=6_PASS_0_FAIL_NETWORK_NONE_READONLY_SYNTHETIC_SECRET
FIRMWARE_BUILD=PASS_ESP_IDF_5_5_2_ESP32S3
FIRMWARE_APP_SHA256=dc7669190bb17fa2a62958427e152ae8697887beae8fa4618058d2515ba7dc91
FIRMWARE_FULL_IMAGE_SHA256=d92a5c1465a75f803a3ba2b363be62ac9a49b5bc535aba3e0708f65b4360b753
FIRMWARE_BOOTLOADER_SHA256=c8bdf749de7240e872c4869e765dbd9f4017ee3c56640c52916265050525bc42
FIRMWARE_PARTITION_TABLE_SHA256=6f0657eb6b8007c0dbfed6f64cf7a0d59f8ee1752af898e2f66dd218846b1835
FIRMWARE_HOST_TESTS=PASS
TARGETED_BACKEND_TESTS=60_PASS_0_FAIL
FULL_BACKEND_TESTS=346_PASS_5_SKIP_0_FAIL
BACKEND_LINT=PASS
BACKEND_TYPECHECK=PASS
CHANGED_FILE_FORMAT=PASS
SECRET_SCAN=PASS_NO_MATCHES
ZAI_REVIEWER=glm-5.3-flash
ZAI_REVIEW_TARGET_SHA=f10ade66e75522d27f023573f2aad03d39f4d8a2
ZAI_REVIEW_VERDICT=PASS
ZAI_REVIEW_P0=0
ZAI_REVIEW_P1=0
ZAI_REVIEW_P2=0
ZAI_REVIEW_P3=0
ZAI_REVIEW_SECURITY_FINDINGS=NONE
ZAI_REVIEW_FINDINGS=NONE
AUDIO_ROOT_CAUSE=NOT_PROVEN_PHYSICAL_DOWNSTREAM_MARKERS_REQUIRED
BACKEND_DEPLOYMENT=NOT_YET
FIRMWARE_FLASH=NOT_YET
OBSERVER=REARM_REQUIRED_AFTER_DEPLOYMENT_QUALIFICATION
```

The ARM64 image was built and loaded through the disposable local Colima
builder, then exercised with `--network none`, read-only rootfs, tmpfs and a
synthetic-only secret file. The firmware was built and merged with ESP-IDF
5.5.2 for ESP32-S3. No credential value was read or persisted. The cumulative
review’s required exact contract was:

```text
REVIEWER=glm-5.3-flash
REVIEW_TARGET_SHA=f10ade66e75522d27f023573f2aad03d39f4d8a2
VERDICT=PASS
P0=0
P1=0
P2=0
P3=0
SECURITY_FINDINGS=NONE
FINDINGS=NONE
```

The repository-wide format check remains blocked only by preserved generated
JSON under the user-owned `build-ws-repair` directory; all changed source
files pass the formatter check. No provider-side audio root cause is claimed
from deterministic tests alone.

## Authoritative zero-provider repair checkpoint — corrected lifecycle candidate reviewed

The first exact review response was malformed because it omitted the required
final verdict contract. A bounded same-reviewer recovery was performed without
changing the frozen bytes. The second exact ZAI route returned a valid verdict
bound to the candidate below.

```text
SOURCE_CANDIDATE_COMMIT=f10ade66e75522d27f023573f2aad03d39f4d8a2
PROVIDER_CALLS_THIS_STAGE=0
PRODUCTION_CHANGED=NO
FIRMWARE_FLASHED_THIS_STAGE=NO
GEMINI_PROVIDER_SESSION_STARTED_THIS_STAGE=NO
PROVIDER_CONNECT_BLOCKS_MIC_PROCESSING=YES_CODE_PROVEN
PRE_PROVIDER_MIC_QUEUE=BOUNDED_50_FRAMES_100_KIB
TEXT_STREAM_COALESCING=100MS_TESTED
ONE_LOGICAL_ASSISTANT_BUBBLE=YES_HOST_TEST_PASS
EPD_IN_PLACE_BUBBLE_UPDATE=YES_HOST_TEST_PASS
AUDIO_STRUCTURAL_MARKERS=ADDED_IN_29C58F4
STALE_CONNECT_GUARD=PASS
LISTEN_STOP_GENERATION_GUARD=PASS
CONNECT_FAILURE_RECONNECT_GUARD=PASS
TARGETED_BACKEND_TESTS=60_PASS_0_FAIL
FULL_BACKEND_TESTS=346_PASS_5_SKIP_0_FAIL
BACKEND_LINT=PASS
BACKEND_TYPECHECK=PASS
CHANGED_FILE_FORMAT=PASS
FIRMWARE_HOST_TESTS=PASS
SECRET_SCAN=PASS_NO_MATCHES
ROOT_FORMAT_CHECK=BLOCKED_ONLY_BY_PRESERVED_GENERATED_BUILD_WS_REPAIR_JSON
AUDIO_ROOT_CAUSE=NOT_PROVEN_DOWNSTREAM_PHYSICAL_MARKERS_STILL_REQUIRED
REVIEWER=glm-5.3-flash
REVIEW_TARGET_SHA=f10ade66e75522d27f023573f2aad03d39f4d8a2
VERDICT=PASS
P0=0
P1=0
P2=0
P3=0
SECURITY_FINDINGS=NONE
FINDINGS=NONE
DEPLOYMENT=NOT_YET
FLASH=NOT_YET
OBSERVER=REARM_REQUIRED_AFTER_QUALIFICATION
```

The exact reviewer inspected the complete frozen candidate and independently
confirmed the guarded connect/listen generations, stale callback suppression,
bounded queue clearing, transcript handling, privacy sanitization and tests.
The repository-wide format check remains blocked only by pre-existing,
user-preserved generated JSON under `build-ws-repair`; all changed source files
pass the same formatter check. No provider session or production mutation was
used for this checkpoint.


## Authoritative checkpoint — latest instrumented physical attempt ingested

Reconciled live PR #2 at `172172464e3095c583d8a4fb1d5d4e9b23a82e2c`. The
corrected sanitized observer was live before the single physical attempt and
was ingested afterward. The USB serial process ended when the device
disconnected after the attempt; no raw serial, audio, transcript, provider
payload, credential, or private data was retained.

```text
LATEST_INSTRUMENTED_ATTEMPT_INGESTED=YES
POST_REFLASH_OLD_BRANCH_REPRODUCED=NO
OLD_WS_TRANSPORT_FIX_STATUS=FIXED_IN_DEPLOYED_FIRMWARE
VOICE_WS_CONNECT_RESULT=OPEN
VOICE_WS_AUTH_RESULT=PASS
VOICE_WS_ACCEPTED=YES
VOICE_SESSION_INIT_SENT=YES
VOICE_MIC_STREAM_STARTED=YES
BACKEND_WS_UPGRADE=PASS
PROVIDER_SESSION_CREATE_RESULT=UNKNOWN_NOT_CAPTURED
FIRST_MIC_FRAME_RECEIVED=UNKNOWN_NOT_CAPTURED
PROVIDER_FIRST_OUTPUT_EVENT=UNKNOWN_NOT_CAPTURED
PROVIDER_FIRST_AUDIO_EVENT=UNKNOWN_NOT_CAPTURED
BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=UNKNOWN_NOT_CAPTURED
FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED=UNKNOWN_NOT_CAPTURED
FIRMWARE_FIRST_DECODED_PCM=UNKNOWN_NOT_CAPTURED
AUDIO_PLAYER_FIRST_WRITE=UNKNOWN_NOT_CAPTURED
ASSISTANT_RESPONSE_VISIBLE=YES
RESPONSE_LATENCY=UNACCEPTABLY_SLOW
TEXT_DISPLAY_LATENCY=UNACCEPTABLY_SLOW
AUDIO_OUTPUT=NO_AUDIBLE_SOUND
SLATE_HEALTH=PASS_HEALTHY_RESTART_0
MYSQL_HEALTH=PASS_HEALTHY_RESTART_0
LOCAL_PUBLIC_HEALTH=HTTP_200_HTTP_200
OBSERVER_STATUS=INGESTED_SESSION_ENDED_ON_DEVICE_DISCONNECT
M4_PROVIDER_SESSION_STARTED=UNKNOWN
M4_PROVIDER_CALL_COUNT=UNKNOWN_PHYSICAL_OBSERVER_GAP
M4_MIC_AUDIO_REACHED_PROVIDER=UNKNOWN
```

The observed sequence mechanically proves that the previously repaired lower
WebSocket transport failure is absent in the deployed firmware for this
attempt: the backend accepted the authenticated upgrade, the firmware reached
`OPEN`, sent session init, and started microphone streaming. It does not prove
provider audio delivery or playback because those downstream markers were not
available from the current observer. The campaign therefore continues with
zero-provider latency/text/audio tracing and deterministic qualification; no
new physical retry is requested at this checkpoint.

## Live reconciliation at instruction issue

Issued after reconciling PR #2 at:

```text
RECONCILED_PR_HEAD=4e6d6b23eb02bb52757fc7687d9115512a2998c3
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
HEAD_BRANCH=feature/gemini-35-live-evaluation
BASE_BRANCH=integration/note4-custom
MODE=FRONTIER_DRIVEN_LONGRUN
```

Before execution, re-fetch PR #2 and `docs/campaign-reports/CAMPAIGN-STATE.md` at the exact live head. If GitHub has advanced, reconcile from the newer frontier and preserve this instruction's intent rather than replaying stale state.

Keep PR #2 **OPEN / DRAFT / UNMERGED**. Do not merge or release.

## New operator result — consumes the pending instrumented physical attempt

The corrected observer was mechanically live before the operator attempt. The operator has now completed the physical Voice AI attempt and reports:

```text
VOICE_AI_CONNECTION=WORKING
VOICE_SERVICE_UNAVAILABLE=NO_FOR_THIS_ATTEMPT
ASSISTANT_RESPONSE_VISIBLE=YES
RESPONSE_LATENCY=UNACCEPTABLY_SLOW
TEXT_DISPLAY_LATENCY=UNACCEPTABLY_SLOW
AUDIO_OUTPUT=NO_AUDIBLE_SOUND
```

Treat this as the authoritative newest physical result. The stale `WAITING_HUMAN_COUNT=1` minimal-attempt boundary is consumed.

Do **not** ask for another physical Voice AI retry yet. Return immediately to technical ingest, attribution, repair, validation, review, deployment/reflash as required, then re-arm observers. Only after all nonphysical READY/READONLY_READY work is exhausted may another physical acceptance attempt be requested.

## Primary conclusion to test first

The old transport blocker is likely cleared because an actual assistant response became visible, but do not merely infer this from the screen. Mechanically ingest the corrected observer from this exact attempt and prove the progression stage.

Capture only allow-listed structural markers, timestamps, counters and sanitized enums. Never retain raw audio, transcript content, provider payloads, credentials, auth headers, Calendar/Outlook contents or other private data.

Establish at minimum:

```text
VOICE_CONFIG_RESULT=
VOICE_WS_CONNECT_RESULT=
VOICE_WS_AUTH_RESULT=
VOICE_WS_ACCEPTED=
VOICE_SESSION_INIT_SENT=
VOICE_MIC_STREAM_STARTED=
FIRST_MIC_FRAME_RECEIVED=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
PROVIDER_FIRST_OUTPUT_EVENT=
PROVIDER_FIRST_AUDIO_EVENT=
BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=
FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED=
FIRMWARE_FIRST_AUDIO_PACKET_ACCEPTED=
FIRMWARE_FIRST_AUDIO_DECODED=
AUDIO_PLAYER_FIRST_WRITE=
AUDIO_PLAYER_WRITE_RESULT=
TTS_START_RECEIVED=
TTS_STOP_RECEIVED=
TRANSCRIPT_UPDATE_COUNT=
EPD_REFRESH_COUNT_DURING_RESPONSE=
```

If the exact corrected observer proves WS connect/auth/accepted and mic/provider progression, record the previous `CASE_H` WebSocket transport defect as **FIXED_IN_DEPLOYED_FIRMWARE** rather than continuing to carry it as the current root cause.

## Workstream A — exact end-to-end latency decomposition

Do not optimize from subjective delay alone. Produce a timestamped stage breakdown from the current code and sanitized observer.

Use existing timing markers where present and add only safe structural markers where missing. Measure the deltas between:

```text
T_DEVICE_LISTEN_START
T_WS_OPEN_OR_ALREADY_OPEN
T_PROVIDER_SESSION_CREATE_START
T_PROVIDER_SESSION_READY
T_FIRST_DEVICE_AUDIO_SENT
T_BACKEND_FIRST_AUDIO_RECEIVED
T_AUDIO_STREAM_END_OR_END_OF_TURN_SIGNAL
T_PROVIDER_FIRST_OUTPUT_EVENT
T_PROVIDER_FIRST_AUDIO_EVENT
T_TRANSCRIPT_FIRST_FORWARD_TO_DEVICE
T_TRANSCRIPT_FINALIZED
T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE
T_FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED
T_FIRMWARE_FIRST_DECODED_PCM
T_AUDIO_PLAYER_FIRST_WRITE
T_UI_RENDER_REQUEST
T_EPD_REFRESH_START
T_EPD_REFRESH_DONE
```

Publish a latency table with absolute stage timestamps and stage-to-stage deltas. Identify the dominant contributors mechanically.

### Specific latency hypothesis that must be checked

At the current branch, `XiaozhiVoiceSession` serializes incoming WebSocket messages through one `operation` promise chain. On `listen:start`, it awaits `ensureLive()`, which opens the Gemini Live provider session. Binary microphone messages arriving while that provider connection is pending are therefore queued behind that awaited operation.

Mechanically prove whether this is materially contributing to first-turn latency. Record:

```text
PROVIDER_CONNECT_BLOCKS_MIC_PROCESSING=YES|NO
PROVIDER_CONNECT_DURATION_MS=
MIC_FRAME_QUEUE_DELAY_DURING_CONNECT_MS=
```

If proven significant, use the same designated AGY writer route to implement the narrowest safe fix. Preferred design properties:

- do not lose microphone frames;
- do not create an unbounded audio buffer;
- do not create additional provider sessions merely to reduce latency;
- do not silently expand provider budget/cost semantics;
- preserve one logical user turn and one logical assistant turn;
- preserve cancellation/close/reconnect safety.

Candidate approaches may include decoupling provider-connect completion from the WebSocket receive serialization and using a small bounded pre-provider audio queue, but choose the actual repair only after code-level proof and deterministic testing.

## Workstream B — assistant text must begin earlier without bubble fragmentation

Current backend behavior buffers `pendingOutputTranscript` and forwards assistant text to NOTE4 only from `flushPendingTranscripts()` at `turnComplete`.

This is a concrete reason the device cannot show assistant text promptly while the model is responding.

The UX requirement remains:

```text
ONE_LOGICAL_ASSISTANT_TURN=ONE_BUBBLE
NO_TOKEN_BY_TOKEN_BUBBLE_FRAGMENTATION
NO_EINK_REFRESH_STORM
```

Implement a bounded streaming/coalescing path only after tests define the expected behavior.

Required semantics:

1. begin updating the existing assistant bubble before `turnComplete` when incremental output transcription is available;
2. update the **same** logical bubble, never append one bubble per fragment;
3. deduplicate cumulative vs delta transcript forms correctly;
4. rate-limit/coalesce device updates so e-ink is not refreshed per token;
5. send final authoritative text at `turnComplete`;
6. preserve Japanese/English UTF-8 handling;
7. preserve interruption and reconnect semantics.

Add deterministic tests covering cumulative fragments, delta fragments, duplicate fragments, turn completion, interruption and reconnect.

## Workstream C — e-ink display latency and refresh cadence

The firmware display driver already supports urgent partial refresh and uses a sliding debounce. Do not assume provider latency is the same problem as panel latency.

Mechanically measure:

```text
TRANSCRIPT_FORWARD_TO_UI_EVENT_MS=
UI_EVENT_TO_RENDER_REQUEST_MS=
RENDER_TO_LVGL_FLUSH_MS=
LVGL_FLUSH_TO_EPD_REFRESH_START_MS=
EPD_REFRESH_DURATION_MS=
TOTAL_TEXT_VISIBLE_PIPELINE_MS=
```

Inspect the Voice AI render path for avoidable full rebuilds or refresh amplification. In particular, verify whether updating one assistant transcript causes all message bubbles to be destroyed and rebuilt, and whether this is materially affecting render time.

Prefer:

- one persistent assistant bubble updated in place when possible;
- partial-region refresh for conversational text where supported;
- bounded coalescing suitable for the SSD1683/e-ink panel;
- no per-token refresh;
- no excessive ghosting or unsafe refresh cadence.

Do not trade correctness or panel stability for raw refresh frequency. Establish the current debounce/partial-refresh timing, then make the smallest measurable improvement.

## Workstream D — no-audio root-cause trace

This is a functional defect. Do not treat visible text as sufficient Voice AI success.

Both the Bun path and Node Live bridge request:

```text
responseModalities=[AUDIO]
```

Therefore first determine exactly where audio disappears.

Trace this chain mechanically:

```text
Gemini provider audio event
-> Node bridge/Bun Live message representation
-> XiaozhiVoiceSession message.data extraction
-> model PCM format/sample rate
-> OpusPcmCodec encodeModelPcm
-> backend binary WebSocket send
-> firmware WebSocket OnIncomingAudio
-> kSpeaking state gate
-> AudioService decode queue
-> Opus decoder
-> PCM playback queue
-> AudioPlayer BeginXiaozhi / write
-> codec/I2S/amplifier physical output
```

Add privacy-safe counters/markers where needed. Never persist PCM/audio bytes.

Classify the first failed boundary, for example:

```text
AUDIO_ROOT_CAUSE_CLASS=PROVIDER_NO_AUDIO_EVENT
AUDIO_ROOT_CAUSE_CLASS=BRIDGE_AUDIO_FIELD_LOST
AUDIO_ROOT_CAUSE_CLASS=BACKEND_AUDIO_CODEC_OR_PACKETIZATION
AUDIO_ROOT_CAUSE_CLASS=FIRMWARE_PACKET_STATE_GATE_DROP
AUDIO_ROOT_CAUSE_CLASS=FIRMWARE_OPUS_DECODE_FAILURE
AUDIO_ROOT_CAUSE_CLASS=AUDIO_PLAYER_WRITE_FAILURE
AUDIO_ROOT_CAUSE_CLASS=HARDWARE_VOLUME_OR_OUTPUT_PATH
```

Do not guess.

### Required deterministic audio tests before another physical session

Build a zero-provider fixture that injects a known synthetic model-audio event and proves, as far as host/deterministic testing allows:

- backend emits `tts:start` before binary audio;
- binary audio packets are non-empty and bounded;
- `tts:stop` ordering is correct;
- the firmware accepts packets while speaking;
- decode queue and decoder consume them;
- player-write path is invoked in a mock/test harness;
- configured volume is nonzero unless explicitly set to zero by the user.

Also verify the exact provider PCM sample rate/format expected by `encodeModelPcm`; do not assume it.

If the provider emits audio but the Node bridge JSON transport drops or transforms the audio field, repair that exact bridge serialization only. If the backend sends valid audio packets and firmware receives them, continue downward rather than changing provider configuration.

## Writer / validation / reviewer loop

Production/runtime byte changes remain authored by the same designated AGY Gemini 3.8 Flash route. Do not silently substitute writer/model/provider.

For each proven defect:

```text
evidence
-> Codex adjudication
-> same designated AGY minimal repair
-> narrow deterministic regression first
-> impacted tests
-> privacy/secret scan
-> build impacted backend/firmware artifact
-> freeze exact identities
-> fresh independent ZAI glm-5.3-flash exact review
```

`REVISE` is not terminal. Continue automatically through repair -> retest -> rebuild -> rereview until PASS or a genuine unresolved P0/P1/security/authority boundary exists.

## Deployment / reflash rules

If only backend bytes change, perform the already-authorized bounded deployment/requalification only if the existing active campaign authority covers that exact class of production change. Preserve rollback image, storage topology, credentials, model/provider and database identity.

If firmware bytes change and existing campaign authority still covers the bounded repair:

- verify NOTE4 identity read-only immediately before write;
- app-only flash at the established application offset;
- no full erase;
- preserve bootloader, partition table, NVS, pairing, LittleFS/user data and device identity;
- post-flash verify boot/Wi-Fi/no fatal markers;
- re-arm corrected sanitized observers.

If a new production/deployment authority is genuinely required because exact scope falls outside prior authorization, fully qualify/review the artifact first and stop only at that true authority boundary.

Do not rerun containerd V6, repartition NVMe, touch Deluge data, delete rollback roots/images/backups, or change Gemini provider/model/credentials/billing/OAuth/ADC/Calendar/Outlook/private-data authority.

## Physical retest gate

Do not ask the operator for another Voice AI attempt until all of these are true:

```text
LATEST_INSTRUMENTED_ATTEMPT_INGESTED=YES
OLD_WS_TRANSPORT_FIX_STATUS=PROVEN
LATENCY_BREAKDOWN=COMPLETE
AUDIO_ROOT_CAUSE=PROVEN_AND_REPAIRED_OR_NO_SOURCE_DEFECT_PROVEN
TEXT_STREAMING_OR_DISPLAY_LATENCY_FIX=QUALIFIED_IF_CHANGED
DETERMINISTIC_AUDIO_PIPELINE_TEST=PASS
IMPACTED_TESTS=PASS
PRIVACY_SECRET_SCAN=PASS
FRESH_ZAI_REVIEW=PASS_FOR_ALL_CHANGED_RUNTIME_BYTES
BACKEND_DEPLOYMENT_REQUALIFICATION=PASS_IF_REQUIRED
APP_ONLY_REFLASH_REQUALIFICATION=PASS_IF_REQUIRED
CORRECTED_OBSERVERS=ARMED_AND_VERIFIED
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
```

The next physical acceptance session, when reached, must check all three user-visible requirements in one compact session:

```text
VOICE_RESPONSE_LATENCY=ACCEPTABLE_AND_MEASURED
ASSISTANT_TEXT_BEGINS_PROMPTLY_AND_REMAINS_ONE_BUBBLE
AUDIBLE_ASSISTANT_AUDIO=YES
```

## Exit/frontier rule

This campaign is not terminal because Voice AI merely produced visible text. Missing audio is a functional failure and the latency/display issues remain READY technical work.

Before any Codex exit, publish and push the updated report/state with at least:

```text
CURRENT_HEAD=
CURRENT_STAGE=
OLD_WS_TRANSPORT_FIX_STATUS=
PROVIDER_CONNECT_DURATION_MS=
MIC_FRAME_QUEUE_DELAY_DURING_CONNECT_MS=
FIRST_OUTPUT_LATENCY_MS=
FIRST_AUDIO_EVENT_LATENCY_MS=
FIRST_DEVICE_AUDIO_PLAYBACK_LATENCY_MS=
TEXT_FIRST_FORWARD_LATENCY_MS=
EPD_REFRESH_LATENCY_MS=
AUDIO_ROOT_CAUSE_CLASS=
AGY_STATUS=
TEST_STATUS=
ZAI_STATUS=
BACKEND_ARTIFACT_ID=
FIRMWARE_APP_SHA256=
DEPLOYMENT_STATUS=
FLASH_STATUS=
OBSERVER_STATUS=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Continue automatically while READY/READONLY_READY work exists. Preserve `REPORT-PUSH-INVARIANT.md` and `AUTONOMY-AND-HUMAN-GATE-POLICY.md`.
