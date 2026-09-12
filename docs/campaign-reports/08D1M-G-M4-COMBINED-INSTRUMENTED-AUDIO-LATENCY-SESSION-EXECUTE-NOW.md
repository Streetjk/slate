# Campaign 8D1M-G — Combined Instrumented M4 Audio / Latency Acceptance — Execute Now

## Live frontier at instruction issue

Reconciled PR #2 at:

```text
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
HEAD_BRANCH=feature/gemini-35-live-evaluation
BASE_BRANCH=integration/note4-custom
RECONCILED_PR_HEAD=16140c3e3f536e8d03a90366dc69b4cf17cc09cc
MODE=FRONTIER_DRIVEN_LONGRUN
```

Before execution, re-fetch live PR #2 and `docs/campaign-reports/CAMPAIGN-STATE.md` at the exact live head. If the branch advanced, reconcile from the newer live frontier and preserve this instruction's intent rather than replaying stale state.

Keep PR #2 **OPEN / DRAFT / UNMERGED**. Do not merge or release.

## Current qualified state

The previous lower WebSocket transport defect is no longer current. It was mechanically proven fixed in deployed firmware during the latest observed physical attempt.

The latency/text/audio recovery candidate has completed all available nonphysical work and is active:

```text
CAMPAIGN=8D1M_G_VOICE_WORKS_LATENCY_TEXT_AUDIO_RECOVERY
CURRENT_STAGE=M4_NONPHYSICAL_REQUALIFICATION_PASS_WAITING_COMBINED_INSTRUMENTED_SESSION
SOURCE_CANDIDATE_COMMIT=f10ade66e75522d27f023573f2aad03d39f4d8a2
TEXT_STREAMING_FIX=QUALIFIED
EPD_BUBBLE_FIX=QUALIFIED
PROVIDER_CONNECT_BLOCKS_MIC_PROCESSING=YES_CODE_PROVEN
PRE_PROVIDER_MIC_QUEUE=BOUNDED_50_FRAMES_100_KIB
TEXT_STREAM_COALESCING=100MS_TESTED
ONE_LOGICAL_ASSISTANT_BUBBLE=YES
EPD_IN_PLACE_BUBBLE_UPDATE=YES
DETERMINISTIC_AUDIO_PIPELINE_TEST=PASS
TARGETED_BACKEND_TESTS=60_PASS_0_FAIL
FULL_BACKEND_TESTS=346_PASS_5_SKIP_0_FAIL
BACKEND_LINT=PASS
BACKEND_TYPECHECK=PASS
FIRMWARE_HOST_TESTS=PASS
SECRET_SCAN=PASS_NO_MATCHES
ZAI_REVIEWER=glm-5.3-flash
ZAI_REVIEW_TARGET_SHA=f10ade66e75522d27f023573f2aad03d39f4d8a2
ZAI_REVIEW_VERDICT=PASS
ZAI_REVIEW_P0=0
ZAI_REVIEW_P1=0
ZAI_REVIEW_P2=0
ZAI_REVIEW_P3=0
ZAI_REVIEW_SECURITY=NONE
BACKEND_TAG=slate:m4-voice-repair-f10ade6
BACKEND_REMOTE_CANONICAL_IMAGE_ID=sha256:7cd37e6a48382f87b01ef731d8d0d8c76822d323fc651fa52ce712b0cd648ccb
BACKEND_HEALTH=PASS
MYSQL_HEALTH=PASS
FIRMWARE_APP_SHA256=dc7669190bb17fa2a62958427e152ae8697887beae8fa4618058d2515ba7dc91
FIRMWARE_FLASH=PASS_APP_ONLY_OFFSET_0x10000
DEVICE_IDENTITY_VERIFIED=YES
DEVICE_PORT=/dev/cu.usbmodem31101
OBSERVER_SELF_TEST=PASS
OBSERVER_LAUNCHD_LABEL=com.streetjk.slate.m4observer
OBSERVER_LIVE_STATE=RUNNING
OBSERVER_FATAL_MARKERS=0
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_DEVICE_COUNT=0
WAITING_HUMAN_COUNT=1
CURRENT_BLOCKED_NODE=ONE_COMBINED_INSTRUMENTED_M4_PHYSICAL_SESSION
```

This is a valid physical boundary. Do not perform additional nonphysical refactoring merely to avoid the session.

## Operator session — one compact combined EN / JA validation

Once live reconciliation confirms the same qualified backend, firmware, device identity and corrected observer are still active, ask the operator for exactly one combined instrumented Voice AI session.

The operator should perform only the minimum useful acceptance sequence:

1. enter Voice AI;
2. start one short English voice turn and wait for the complete assistant response;
3. observe whether assistant text begins promptly, whether it remains one logical assistant bubble, and whether audible assistant audio is heard;
4. start one short Japanese voice turn and wait for the complete assistant response;
5. observe the same three properties;
6. exit Voice AI cleanly.

Do not require Search, Calendar, Outlook, private-data or unrelated feature validation in this session. Do not ask for multiple repeat attempts merely to improve timing samples.

The operator-visible acceptance questions are:

```text
VOICE_CONNECTION_WORKS=YES|NO
EN_RESPONSE_LATENCY=ACCEPTABLE|SLOW|FAILED
JA_RESPONSE_LATENCY=ACCEPTABLE|SLOW|FAILED
ASSISTANT_TEXT_BEGINS_PROMPTLY=YES|NO
ASSISTANT_TURN_REMAINS_ONE_BUBBLE=YES|NO
AUDIBLE_ASSISTANT_AUDIO_EN=YES|NO
AUDIBLE_ASSISTANT_AUDIO_JA=YES|NO
CLEAN_EXIT=YES|NO
```

Subjective operator labels are supporting UX evidence only. The sanitized timing markers remain authoritative for technical attribution.

## Immediate automatic ingest after the physical session

After the operator reports completion, **do not return control merely because the physical step completed**. Immediately ingest the corrected sanitized observer and backend structural evidence for the exact session.

Retain only approved structural markers, counts, timestamps, latency values, enums, health states and close codes. Never retain raw microphone audio, PCM, transcripts, provider payloads, credentials, auth headers, Calendar/Outlook contents or other private data.

Require, where available:

```text
VOICE_WS_CONNECT_RESULT=
VOICE_WS_AUTH_RESULT=
VOICE_WS_ACCEPTED=
VOICE_SESSION_INIT_SENT=
VOICE_MIC_STREAM_STARTED=
FIRST_MIC_FRAME_RECEIVED=
PROVIDER_SESSION_CREATE_START=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
T_DEVICE_LISTEN_START=
T_PROVIDER_SESSION_READY=
T_FIRST_DEVICE_AUDIO_SENT=
T_BACKEND_FIRST_AUDIO_RECEIVED=
T_AUDIO_STREAM_END_OR_END_OF_TURN_SIGNAL=
T_PROVIDER_FIRST_OUTPUT_EVENT=
T_PROVIDER_FIRST_AUDIO_EVENT=
T_TRANSCRIPT_FIRST_FORWARD_TO_DEVICE=
T_TRANSCRIPT_FINALIZED=
T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=
T_FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED=
T_FIRMWARE_FIRST_AUDIO_PACKET_ACCEPTED=
T_FIRMWARE_FIRST_DECODED_PCM=
T_AUDIO_PLAYER_FIRST_WRITE=
AUDIO_PLAYER_WRITE_RESULT=
T_UI_RENDER_REQUEST=
T_EPD_REFRESH_START=
T_EPD_REFRESH_DONE=
TRANSCRIPT_UPDATE_COUNT=
EPD_REFRESH_COUNT_DURING_RESPONSE=
```

Publish a compact latency decomposition for each useful turn, at minimum:

```text
PROVIDER_CONNECT_DURATION_MS=
MIC_FRAME_QUEUE_DELAY_DURING_CONNECT_MS=
FIRST_OUTPUT_LATENCY_MS=
FIRST_AUDIO_EVENT_LATENCY_MS=
BACKEND_AUDIO_PACKET_FORWARD_LATENCY_MS=
FIRMWARE_AUDIO_RECEIVE_TO_DECODE_MS=
DECODE_TO_PLAYER_WRITE_MS=
FIRST_DEVICE_AUDIO_PLAYBACK_LATENCY_MS=
TEXT_FIRST_FORWARD_LATENCY_MS=
UI_RENDER_LATENCY_MS=
EPD_REFRESH_LATENCY_MS=
TOTAL_TEXT_VISIBLE_PIPELINE_MS=
```

## Audio decision tree

Missing audio remains a functional failure. If the operator still hears no sound, identify the first failed boundary mechanically and continue automatically.

### Case A — provider emits no audio

If:

```text
PROVIDER_FIRST_OUTPUT_EVENT=YES
PROVIDER_FIRST_AUDIO_EVENT=NO
```

then classify as provider/output-generation path. Reconcile the exact active runtime/model/config and official expected audio message representation before changing code. Do not change provider/model/credentials/billing without explicit authority.

### Case B — provider audio exists but backend emits no device packet

If:

```text
PROVIDER_FIRST_AUDIO_EVENT=YES
BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=NO
```

trace and repair only the exact bridge/message extraction/PCM/Opus packetization boundary. Verify actual provider PCM sample rate and format; do not assume it. Use the same designated AGY writer route for production-byte changes.

### Case C — backend sends audio but firmware does not accept/decode

If:

```text
BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=YES
FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED=YES
FIRMWARE_FIRST_AUDIO_PACKET_ACCEPTED=NO
```

or decode never occurs, inspect the firmware state gate, speaking transition, queue epoch, Opus decoder parameters and packet timing. Repair narrowly.

### Case D — decoded PCM reaches player-write path but still no audible output

If:

```text
FIRMWARE_FIRST_DECODED_PCM=YES
AUDIO_PLAYER_FIRST_WRITE=YES
AUDIO_PLAYER_WRITE_RESULT=PASS
AUDIBLE_ASSISTANT_AUDIO=NO
```

then classify as downstream device audio-output path. Before assuming hardware failure, perform safe read-only checks of configured volume, codec/player state, amplifier enable/mute/gain state and any existing known-good non-Voice audio path that can be inspected without writing persistent device state. Do not create repeated provider sessions merely to test speaker output.

If a deterministic local playback fixture can exercise the exact player/codec path without provider data and without destructive device mutation, use it before requesting another Voice AI session.

## Latency decision tree

Do not optimize blindly after this session. Use measured dominant stage.

- If provider-connect duration still dominates first turn, verify the bounded pre-provider microphone queue is actually eliminating mic-frame serialization delay and that the first user audio reaches the provider promptly once ready.
- If end-of-turn detection dominates, inspect the actual audio-stream-end / VAD / turn-completion timing without broad provider changes.
- If provider first-output dominates, record it separately from Slate transport/UI latency; do not disguise provider latency as device latency.
- If transcript forwarding is prompt but EPD visibility is slow, optimize only the UI/EPD path.
- If EPD refresh count is excessive, preserve one logical bubble and strengthen bounded coalescing rather than disabling streaming.

Acceptance does not require impossible e-ink token-by-token animation. It requires visibly earlier useful text with a stable one-bubble UX and no refresh storm.

## Automatic repair / qualification loop

If any source/runtime defect is proven:

```text
evidence
-> Codex adjudication
-> same designated AGY gemini-3.8-flash-high minimal repair
-> narrow deterministic regression first
-> impacted backend/firmware tests
-> privacy/secret scan
-> impacted artifact rebuild
-> freeze exact identities
-> fresh independent ZAI glm-5.3-flash exact review
```

`REVISE` is not terminal. Continue repair -> retest -> rebuild -> rereview automatically until PASS or a genuine unresolved P0/P1/security/authority boundary appears.

If only reports/tests/observability change, do not unnecessarily rebuild or flash runtime artifacts.

If backend runtime bytes change and existing campaign authority still covers the bounded change, deploy the exact reviewed backend candidate and requalify health automatically.

If firmware runtime bytes change and existing authority still covers it, verify NOTE4 identity read-only then app-only flash at `0x10000`; no full erase; preserve bootloader, partition table, NVS, pairing, LittleFS/user data and device identity; verify boot/Wi-Fi/no fatal markers; then re-arm corrected observers.

Do not rerun containerd V6, repartition NVMe, touch Deluge data, delete rollback roots/images/backups, or change Gemini provider/model/credentials/billing/OAuth/ADC/Calendar/Outlook/private-data authority.

## No blind retry rule

Do not request another physical Voice AI session merely because this one fails. After this session, exhaust all newly READY/READONLY_READY technical work first.

A second physical session is permitted only after a proven repair/requalification requires physical confirmation and all nonphysical frontier work is again exhausted.

## Acceptance / closure criteria

The physical Voice AI UX is accepted only when the evidence supports:

```text
OLD_WS_TRANSPORT_FIX_STATUS=FIXED_IN_DEPLOYED_FIRMWARE
VOICE_CONNECTION_WORKS=YES
EN_RESPONSE_LATENCY=ACCEPTABLE_AND_MEASURED
JA_RESPONSE_LATENCY=ACCEPTABLE_AND_MEASURED
ASSISTANT_TEXT_BEGINS_PROMPTLY=YES
ASSISTANT_TURN_REMAINS_ONE_BUBBLE=YES
EPD_REFRESH_CADENCE=BOUNDED_NO_STORM
AUDIBLE_ASSISTANT_AUDIO_EN=YES
AUDIBLE_ASSISTANT_AUDIO_JA=YES
CLEAN_EXIT=YES
DETERMINISTIC_AUDIO_PIPELINE_TEST=PASS
IMPACTED_TESTS=PASS
PRIVACY_SECRET_SCAN=PASS
FRESH_ZAI_REVIEW=PASS_FOR_ALL_CHANGED_RUNTIME_BYTES
BACKEND_HEALTH=PASS
MYSQL_HEALTH=PASS
CORRECTED_OBSERVER_STATUS=PASS
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
```

If these pass, publish the durable M4 acceptance dossier and advance to the next already-authorized campaign frontier. Do not merge PR #2.

## Required durable exit state

Before any Codex exit, update the active report and `CAMPAIGN-STATE.md`, run `git diff --check` on changed authorized files plus a secret-content scan, commit, push, fetch/verify remote, and verify PR #2 remains OPEN / DRAFT / UNMERGED.

Record at least:

```text
CURRENT_HEAD=
CURRENT_STAGE=
SOURCE_CANDIDATE_COMMIT=
BACKEND_ARTIFACT_ID=
FIRMWARE_APP_SHA256=
OLD_WS_TRANSPORT_FIX_STATUS=
PROVIDER_CONNECT_DURATION_MS=
MIC_FRAME_QUEUE_DELAY_DURING_CONNECT_MS=
FIRST_OUTPUT_LATENCY_MS=
FIRST_AUDIO_EVENT_LATENCY_MS=
FIRST_DEVICE_AUDIO_PLAYBACK_LATENCY_MS=
TEXT_FIRST_FORWARD_LATENCY_MS=
EPD_REFRESH_LATENCY_MS=
AUDIO_ROOT_CAUSE_CLASS=
VOICE_CONNECTION_WORKS=
EN_RESPONSE_LATENCY=
JA_RESPONSE_LATENCY=
ASSISTANT_TEXT_BEGINS_PROMPTLY=
ASSISTANT_TURN_REMAINS_ONE_BUBBLE=
AUDIBLE_ASSISTANT_AUDIO_EN=
AUDIBLE_ASSISTANT_AUDIO_JA=
CLEAN_EXIT=
AGY_STATUS=
TEST_STATUS=
ZAI_STATUS=
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

Under `FRONTIER_DRIVEN_LONGRUN`, report/test/review/deploy/flash completion is not terminal while useful READY/READONLY_READY work remains. Preserve `REPORT-PUSH-INVARIANT.md` and `AUTONOMY-AND-HUMAN-GATE-POLICY.md`.