# Campaign 8D1M-G — Post-config-restore physical acceptance and ingest

## Live reconciliation at issue

Issued after reconciling PR #2 at live head:

```text
LIVE_HEAD_AT_ISSUE=c5fd86cefbadd09fe93eacfcdba43ecca6c66020
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
HEAD_BRANCH=feature/gemini-35-live-evaluation
BASE_BRANCH=integration/note4-custom
CURRENT_STAGE=M4_CONFIG_ERROR_REPAIRED_EXACT_CONFIG_REQUALIFIED_WAITING_NEW_PHYSICAL_ACCEPTANCE
ACTIVE_BACKEND_TAG=slate:m4-voice-attribution-dd8b5b4
ACTIVE_BACKEND_IMAGE_ID=sha256:63275954b49c147eae65189515655f33517b29d50bf5d582c229f90acec522c9
ACTIVE_FIRMWARE_APP_SHA256=dc7669190bb17fa2a62958427e152ae8697887beae8fa4618058d2515ba7dc91
```

Before acting, re-fetch live PR #2 and `docs/campaign-reports/CAMPAIGN-STATE.md` at the exact live head. If GitHub advanced, reconcile the newer frontier and preserve this instruction's intent rather than replaying stale state.

Keep PR #2 **OPEN / DRAFT / UNMERGED**. Do not merge or release.

## Established root cause from the consumed physical attempt

The previous physical attempt is fully consumed and mechanically classified as a pre-provider runtime configuration failure:

```text
LATEST_COMBINED_PHYSICAL_SESSION_INGESTED=YES
LIVE_FAILURE_SOURCE=CONNECT_REJECT
PROVIDER_SESSION_CREATE_RESULT=CONFIG_ERROR
PROVIDER_SESSION_STARTED=NO
FAILURE_STAGE=PROVIDER_SESSION_CREATE_CONFIG_GATE_BEFORE_LIVE_SESSION
FAILURE_ROOT_CAUSE_CLASS=PRODUCTION_RUNTIME_CONFIGURATION_MISSING
MIC_AUDIO_REACHED_PROVIDER=NO
PROVIDER_OUTPUT_REACHED_BACKEND=NO
PROVIDER_AUDIO_REACHED_BACKEND=NO
OLD_WS_TRANSPORT_FAILURE_REPRODUCED=NO
```

Do not reopen the old WebSocket transport root cause or the f10ade lifecycle repair from this consumed failure. No source regression was proven because Gemini Live never started.

The exact previously approved G production runtime configuration has now been restored on the same reviewed image and requalified:

```text
CONFIG_REDEPLOY=PASS
GEMINI_AUTH_MODE=developer_api_key
GEMINI_DEVELOPER_API_KEY_ENABLED=true
GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED=true
GEMINI_LIVE_RUNTIME=node_bridge
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
GEMINI_API_KEY_FILE=/run/secrets/gemini_api_key
GEMINI_NODE_EXECUTABLE=node
GEMINI_NODE_BRIDGE_SCRIPT=./src/modules/assistant/gemini-live-node-bridge-runtime.mjs
SECRET_MOUNT_RW=false
SLATE_HEALTH=HEALTHY
MYSQL_HEALTH=HEALTHY
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
FIRMWARE_CHANGED=NO
OBSERVER_STATE=RUNNING_CORRECTED
```

No provider/model/credential/billing/private-data authority changed. This is a restoration of already-authorized exact configuration only.

## Physical boundary — exactly one new combined acceptance session

All current nonphysical READY/READONLY_READY work is exhausted. One new physical session is justified because the previous one never reached provider/session/audio processing.

Ask the operator for exactly one combined Voice AI session:

1. Enter Voice AI normally.
2. Start normally with short ENTER.
3. Ask one short English question, preferably `What time is it?`.
4. Observe whether visible assistant text appears, audible assistant audio is heard, `Voice service error` appears, and whether latency is FAST / ACCEPTABLE / SLOW / VERY_SLOW.
5. Only if the same session remains usable, ask one short Japanese question, preferably `今日の曜日は何ですか？`.
6. Observe the same result classes.
7. Exit normally if the session remains open.

Do not perform repeated retries, rapid start/stop cycles, volume/settings/network changes, power cycles, firmware resets, or unrelated button actions during this evidence capture.

If `Voice service error` occurs on the English attempt, do not force Japanese coverage. The single failure is sufficient; mark Japanese as not reached and ingest immediately.

The operator only needs to report:

```text
EN_ATTEMPT_REACHED=YES|NO
EN_VISIBLE_TEXT=YES|NO
EN_AUDIBLE_AUDIO=YES|NO
EN_VOICE_SERVICE_ERROR=YES|NO
EN_SUBJECTIVE_LATENCY=FAST|ACCEPTABLE|SLOW|VERY_SLOW|NOT_APPLICABLE
JA_ATTEMPT_REACHED=YES|NO|NOT_REACHED_DUE_TO_EARLIER_FAILURE
JA_VISIBLE_TEXT=YES|NO|NOT_APPLICABLE
JA_AUDIBLE_AUDIO=YES|NO|NOT_APPLICABLE
JA_VOICE_SERVICE_ERROR=YES|NO|NOT_APPLICABLE
JA_SUBJECTIVE_LATENCY=FAST|ACCEPTABLE|SLOW|VERY_SLOW|NOT_APPLICABLE
SESSION_EXIT=NORMAL|FAILED_SESSION_ALREADY_CLOSED
```

## Immediate ingest after that one session

Treat the human boundary as consumed immediately after the single session:

```text
WAITING_HUMAN_COUNT=0
HUMAN_ACTION_REQUIRED=NO
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
```

unless a true new authority/safety boundary is reached.

Ingest the already-running corrected sanitized observer before making any code change. Capture the earliest safe progression/failure markers including:

```text
VOICE_CONFIG_RESULT=
VOICE_WS_CONNECT_RESULT=
VOICE_WS_AUTH_RESULT=
VOICE_WS_ACCEPTED=
VOICE_WS_CLOSE_CODE=
VOICE_SESSION_INIT_SENT=
VOICE_MIC_STREAM_STARTED=
FIRST_MIC_FRAME_RECEIVED=
PROVIDER_SESSION_CREATE_START=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
PROVIDER_LIVE_ERROR_CALLBACK=
PROVIDER_LIVE_CLOSE_CALLBACK=
LIVE_FAILURE_SOURCE=
PROVIDER_CLOSE_EXPECTED=
ACTIVE_CONNECT_GENERATION=
ACTIVE_LISTEN_GENERATION=
LISTENING_STATE_AT_FAILURE=
LIVE_SESSION_PRESENT_AT_FAILURE=
CONNECTING_PROMISE_PRESENT_AT_FAILURE=
PROVIDER_FIRST_OUTPUT_EVENT=
PROVIDER_FIRST_AUDIO_EVENT=
BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=
FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED=
FIRMWARE_FIRST_AUDIO_PACKET_ACCEPTED=
FIRMWARE_FIRST_DECODED_PCM=
AUDIO_PLAYER_FIRST_WRITE=
AUDIO_PLAYER_WRITE_RESULT=
TTS_START_RECEIVED=
TTS_STOP_RECEIVED=
TRANSCRIPT_UPDATE_COUNT=
EPD_REFRESH_COUNT_DURING_RESPONSE=
```

Never retain raw serial lines, raw mic audio, PCM, transcript content, provider payloads, credentials, auth headers, Calendar/Outlook contents, or other private data.

Publish the exact post-session classification:

```text
LATEST_POST_CONFIG_RESTORE_PHYSICAL_SESSION_INGESTED=YES
OLD_WS_TRANSPORT_FAILURE_REPRODUCED=YES|NO|UNKNOWN
CONFIG_ERROR_REPRODUCED=YES|NO
EN_RESULT_CLASS=
JA_RESULT_CLASS=
FAILURE_STAGE=
LIVE_FAILURE_SOURCE=
FAILURE_ROOT_CAUSE_CLASS=
PROVIDER_SESSION_STARTED=YES|NO|UNKNOWN
MIC_AUDIO_REACHED_PROVIDER=YES|NO|UNKNOWN
PROVIDER_OUTPUT_REACHED_BACKEND=YES|NO|UNKNOWN
PROVIDER_AUDIO_REACHED_BACKEND=YES|NO|UNKNOWN
BACKEND_AUDIO_REACHED_FIRMWARE=YES|NO|UNKNOWN
FIRMWARE_AUDIO_DECODED=YES|NO|UNKNOWN
AUDIO_PLAYER_WRITE_OCCURRED=YES|NO|UNKNOWN
VOICE_RESPONSE_LATENCY_MS_OR_RANGE=
TEXT_VISIBLE_LATENCY_MS_OR_RANGE=
AUDIO_FAILURE_STAGE=
NEXT_AUTONOMOUS_ACTION=
```

## Autonomous continuation rules

- If `CONFIG_ERROR` reproduces despite the restored exact config, treat that as a deployment/config persistence defect and prove where the config disappears. Do not change provider/model/credential authority.
- If provider session starts but `Voice service error` occurs, use exact `LIVE_FAILURE_SOURCE` and state markers to isolate the narrowest runtime failure.
- If service error is gone but audio is silent, continue the full provider -> bridge -> backend PCM/Opus -> binary WS -> firmware state gate -> decode -> player -> codec/I2S/amplifier trace. Missing audible audio remains a functional failure.
- If audio works but latency/text is poor, use measured timing stages. Preserve bounded mic queue, 100 ms text coalescing, one logical assistant bubble, and in-place e-ink update unless evidence proves they are involved.
- If EN works but JA fails, isolate language/session behavior without changing production model/provider by default.
- If both EN and JA work, acceptance still requires measured acceptable latency, prompt one-bubble text behavior, and audible assistant audio before M4 closeout.

Any changed runtime bytes must follow the established loop:

```text
evidence
-> Codex adjudication
-> designated AGY Gemini 3.8 Flash minimal repair
-> deterministic regression
-> impacted validation
-> privacy/secret scan
-> exact build/freeze
-> fresh ZAI glm-5.3-flash exact review
-> bounded deployment/reflash if authorized
-> requalification
-> observer rearm
```

Do not request repeated physical attempts while READY/READONLY_READY work remains.

Before any controller stop, publish the standard frontier fields and push every meaningful checkpoint/state change to GitHub.
