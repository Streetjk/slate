# Campaign 8D1M-G — Combined instrumented M4 physical session execution and ingest

## Live reconciliation at issue

Issued after reconciling PR #2 at:

```text
LIVE_HEAD_AT_ISSUE=c51758915b6a1ace8c7c765e6aaf8f753e6f55ad
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
HEAD_BRANCH=feature/gemini-35-live-evaluation
BASE_BRANCH=integration/note4-custom
CURRENT_STAGE=M4_ATTRIBUTION_DEPLOYED_REQUALIFIED_OBSERVER_REARMED_WAITING_COMBINED_PHYSICAL_SESSION
ACTIVE_BACKEND_TAG=slate:m4-voice-attribution-dd8b5b4
ACTIVE_FIRMWARE_APP_SHA256=dc7669190bb17fa2a62958427e152ae8697887beae8fa4618058d2515ba7dc91
OBSERVER_LABEL=com.streetjk.slate.m4observer
OBSERVER_STATE=RUNNING
OBSERVER_PORT=/dev/cu.usbmodem31101
READY_NODE_COUNT=0
READONLY_READY_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=0
```

Before acting, re-fetch live PR #2 and `docs/campaign-reports/CAMPAIGN-STATE.md` at the exact live head. If GitHub advanced, reconcile the newer frontier and preserve this instruction's intent rather than replaying stale state.

Keep PR #2 **OPEN / DRAFT / UNMERGED**. Do not merge or release.

## Why a physical session is now justified

All safe nonphysical work for the current Voice service error has been exhausted:

- the previous physical Voice service error was ingested;
- the old lower WebSocket transport defect was not reproduced and remains fixed unless new evidence proves otherwise;
- generic `Voice service error` observability was identified as insufficient;
- sanitized failure attribution was implemented at source commit `dd8b5b48067933e5431f196bb474c22eb657ad75`;
- exact deterministic attribution tests passed;
- full impacted validation passed;
- fresh ZAI `glm-5.3-flash` exact review passed with no P0/P1/P2/P3/security findings;
- the exact ARM64 backend image was built and provider-disabled qualified;
- the corrected backend was deployed successfully after a rejected missing-secret-mount invocation was rolled back safely;
- Slate/MySQL and local/public health are green;
- firmware remains the already-qualified app-only build;
- the sanitized observer is rearmed and running;
- no further READY or READONLY_READY nonphysical work remains.

This is therefore a genuine physical boundary, not a checkpoint that Codex should bypass or duplicate with more speculative code changes.

## Required operator action — exactly one combined instrumented physical session

Ask the operator for **one combined physical Voice AI session only**. Do not ask for repeated retries.

The preferred compact sequence is:

1. Enter Voice AI normally on NOTE4.
2. Start one conversation using the normal short ENTER action.
3. Ask one short English question, for example: `What time is it?`
4. Observe the first outcome long enough to determine whether any assistant text appears, any audible assistant audio is produced, or `Voice service error` appears.
5. If the same live Voice AI session remains usable, ask one short Japanese question, for example: `今日の曜日は何ですか？`
6. Observe the same three outcome classes again: visible assistant text, audible assistant audio, and error state.
7. Exit Voice AI normally after the combined session.

Do not perform unrelated button actions, repeated rapid start/stop cycles, settings changes, volume changes, network changes, power cycles, firmware resets, or additional retries during this evidence capture.

If `Voice service error` occurs before the Japanese question and the Voice session becomes unusable, **do not force another retry just to obtain Japanese coverage**. The first failure is sufficient evidence for attribution. Record Japanese coverage as `NOT_REACHED_DUE_TO_EARLIER_FAILURE` and immediately ingest the observer.

## Operator-visible result to capture

The operator only needs to report the visible/audible result. Do not require manual timestamps because the observer owns timing evidence.

Record:

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

Do not ask the operator to diagnose the cause.

## Immediate post-session ingest — no second physical retry

As soon as the operator completes the single combined session, treat the human boundary as consumed:

```text
WAITING_HUMAN_COUNT=0
HUMAN_ACTION_REQUIRED=NO
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
```

until/unless a new genuine authority/safety boundary is reached.

Ingest the already-running sanitized observer before making code changes. Capture the earliest safe failure/progression evidence, including where available:

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
SLATE_HEALTH=
SLATE_RESTART_COUNT=
MYSQL_HEALTH=
MYSQL_RESTART_COUNT=
DEVICE_PORT_CONTINUITY=
```

Never retain raw serial lines, raw mic audio, PCM, transcripts, provider payloads, credentials, auth headers, Calendar/Outlook contents, or other private data.

## Required classification after ingest

Publish a compact exact classification:

```text
LATEST_COMBINED_PHYSICAL_SESSION_INGESTED=YES
OLD_WS_TRANSPORT_FAILURE_REPRODUCED=YES|NO|UNKNOWN
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

Do not infer root cause from the device string `Voice service error`; use the newly deployed attribution markers.

## Autonomous continuation branches

### If `Voice service error` reproduces

Use the first exact `LIVE_FAILURE_SOURCE` and associated state markers to choose the narrowest branch:

- `CONNECT_REJECT` -> classify sanitized provider connect failure and repair only if a code regression is proven;
- `PROVIDER_ONERROR` -> reproduce exact callback ordering deterministically and distinguish genuine provider fault from lifecycle misuse;
- `PROVIDER_ONCLOSE` -> prove whether close was expected or falsely treated as fatal;
- `BRIDGE_ERROR` -> isolate bridge/runtime stage without changing provider/model/credentials;
- `MESSAGE_HANDLER_EXCEPTION` -> reproduce and repair exact parser/handler boundary;
- `AUDIO_CODEC_EXCEPTION` -> isolate encode/decode/format stage;
- `SOCKET_SEND_EXCEPTION` -> isolate WebSocket send-state failure;
- `OTHER_SAFE_CLASS` -> add only the minimum extra sanitized structural attribution needed before another physical action.

Specifically audit the `f10ade66e75522d27f023573f2aad03d39f4d8a2` connect/listen lifecycle logic if evidence points there. Preserve the already-qualified bounded pre-provider mic queue, 100 ms transcript coalescing, one logical assistant bubble, and e-ink in-place update unless evidence shows they are involved.

### If service error is gone but audio is still silent

Do not declare success. Continue the exact audio chain from provider event -> backend PCM/Opus -> binary WebSocket -> firmware state gate -> decode -> player write -> codec/I2S/amplifier. Classify the first failed boundary mechanically.

### If audio works but latency/text remains poor

Use the already-instrumented timing path to publish the dominant latency stages. Preserve one logical bubble and bounded e-ink coalescing; optimize only measured dominant contributors.

### If EN works but JA fails

Treat JA as a separate functional failure and isolate language/session behavior without changing the production model/provider by default.

### If both EN and JA fully pass

Acceptance still requires all of:

```text
VOICE_SERVICE_ERROR=NO
VOICE_RESPONSE_LATENCY=ACCEPTABLE_AND_MEASURED
ASSISTANT_TEXT_BEGINS_PROMPTLY_AND_REMAINS_ONE_BUBBLE
AUDIBLE_ASSISTANT_AUDIO=YES
EN=PASS
JA=PASS
```

Only then advance toward M4 closeout. Do not merge PR #2.

## Required repair/review loop for any changed runtime bytes

For every proven runtime defect:

```text
evidence
-> Codex adjudication
-> same designated AGY Gemini 3.8 Flash writer
-> narrow deterministic regression
-> impacted tests
-> backend full tests where impacted
-> firmware host tests where impacted
-> lint/typecheck/changed-file format
-> privacy/secret scan
-> impacted artifact build
-> exact artifact freeze
-> fresh exact ZAI glm-5.3-flash review
-> REVISE => same AGY repair => retest => refreeze => fresh ZAI automatically
-> bounded deployment/app-only reflash only if existing authority covers exact change
-> health/restart/identity qualification
-> observer rearm
```

Do not silently substitute writer, reviewer, provider, model, auth route, credentials, billing, private-data authority, or production scope.

## FRONTIER_DRIVEN_LONGRUN stop rule

Do not stop on checkpoints, tests, reviewer PASS/REVISE, build completion, deployment completion, flash completion, recoverable failures, or successful intermediate stages while safe READY/READONLY_READY work remains.

Before any controller exit, publish:

```text
CURRENT_HEAD=
CURRENT_STAGE=
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

No exit with READY or READONLY_READY work remaining unless a genuine safety/authority conflict exists.

Human-only gates remain limited to the established set: physical NOTE4 actions, sudo/root password, merge/release, changed device identity, new credentials/provider/billing/private-data authority, and unresolved P0/P1/security boundaries.

## Controller ingest and exact attribution — 2026-09-08

The operator's single combined physical session is consumed. No second physical
attempt was made or requested. The original observer's backend extraction had a
regex defect: it matched the literal `PROVIDER=` token rather than the approved
`PROVIDER_*` marker names. The observer source was corrected locally and its
self-test and Python syntax checks passed. The corrected allow-list does not
retain raw serial, provider, credential, audio, transcript, URL, or auth-header
content.

```text
LATEST_COMBINED_PHYSICAL_SESSION_INGESTED=YES
OBSERVER_EXTRACTION_REPAIR=PROVIDER_KEY_REGEX_CORRECTED
OBSERVER_EXTRACTION_REPAIR_SHA256=4668415c8ae666c6e2c748f55d18457a0b6897c145cb8b19ea328777b4d29e52
OBSERVER_SELF_TEST=PASS
OBSERVER_PYTHON_SYNTAX=PASS
OBSERVER_RAW_CONTENT=NO
```

The retained sanitized backend markers for the completed session are:

```text
VOICE_CONFIG_RESULT=NOT_OBSERVED
VOICE_WS_CONNECT_RESULT=OPEN
VOICE_WS_AUTH_RESULT=PASS
VOICE_WS_ACCEPTED=YES
VOICE_WS_CLOSE_CODE=NOT_OBSERVED
VOICE_SESSION_INIT_SENT=YES
VOICE_MIC_STREAM_STARTED=NO_THEN_YES_OBSERVED
FIRST_MIC_FRAME_RECEIVED=NO
PROVIDER_SESSION_CREATE_START=YES
PROVIDER_SESSION_CREATE_RESULT=CONFIG_ERROR
PROVIDER_SESSION_STARTED=NO
PROVIDER_LIVE_ERROR_CALLBACK=NOT_OBSERVED
PROVIDER_LIVE_CLOSE_CALLBACK=NOT_OBSERVED
LIVE_FAILURE_SOURCE=CONNECT_REJECT
PROVIDER_CLOSE_EXPECTED=NO
ACTIVE_CONNECT_GENERATION=2
ACTIVE_LISTEN_GENERATION=1
LISTENING_STATE_AT_FAILURE=YES
LIVE_SESSION_PRESENT_AT_FAILURE=NO
CONNECTING_PROMISE_PRESENT_AT_FAILURE=YES
PROVIDER_FIRST_OUTPUT_EVENT=NOT_OBSERVED
PROVIDER_FIRST_AUDIO_EVENT=NOT_OBSERVED
BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=NOT_OBSERVED
FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED=NOT_OBSERVED
FIRMWARE_FIRST_AUDIO_PACKET_ACCEPTED=NOT_OBSERVED
FIRMWARE_FIRST_DECODED_PCM=NOT_OBSERVED
AUDIO_PLAYER_FIRST_WRITE=NOT_OBSERVED
AUDIO_PLAYER_WRITE_RESULT=NOT_OBSERVED
TTS_START_RECEIVED=NOT_OBSERVED
TTS_STOP_RECEIVED=NOT_OBSERVED
TRANSCRIPT_UPDATE_COUNT=NOT_OBSERVED
EPD_REFRESH_COUNT_DURING_RESPONSE=NOT_OBSERVED
DEVICE_PORT_CONTINUITY=/dev/cu.usbmodem31101
```

The earliest boundary is exact: NOTE4's WebSocket opened, authenticated and
was accepted; Slate then entered provider session creation, failed its own
production configuration gate, and rejected the active listen turn before a
Gemini Live session existed or the first microphone frame reached the backend.
The `ACTIVE_CONNECT_GENERATION=2` value is the expected post-rejection
invalidation from the current lifecycle code, not evidence of a stale-callback
race. The 33 live-session attribution tests pass, including the tested
connect-rejection path; no source defect is proven.

Read-only production metadata identified the deployment omission:

```text
ACTIVE_BACKEND_TAG=slate:m4-voice-attribution-dd8b5b4
ACTIVE_BACKEND_IMAGE_ID=sha256:63275954b49c147eae65189515655f33517b29d50bf5d582c229f90acec522c9
NODE_ENV=production
ACTIVE_CONTAINER_GEMINI_CONFIGURATION_KEYS=ABSENT
ACTIVE_DOTENV_KEYS=MYSQL_PASSWORD_ONLY
SECRET_DESTINATION=/run/secrets/gemini_api_key
SECRET_MOUNT_RW=false
SLATE_HEALTH=HTTP_200
SLATE_RESTART_COUNT=0
MYSQL_HEALTH=HEALTHY
MYSQL_RESTART_COUNT=0
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
PROVIDER_CALLS_THIS_STAGE=0
PRODUCTION_CHANGED=NO
FIRMWARE_CHANGED=NO
```

This is a production runtime configuration omission, not a provider/model,
credential, firmware, audio, or latency defect. The existing authorized G
activation covers restoring the exact 2.5 native-audio Developer-API
Node-bridge settings with the existing protected read-only credential. A
pre-mutation checkpoint is now published; the next action is the bounded
same-image configuration redeploy, followed by health/config requalification
and observer re-arm. No firmware write is required.
