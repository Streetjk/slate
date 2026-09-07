# Campaign 8D1M-G — Post-Repair `Voice service error`: Ingest, Attribute, Recover

## Live reconciliation at instruction issue

Issued after reconciling PR #2 at live head:

```text
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
HEAD_BRANCH=feature/gemini-35-live-evaluation
BASE_BRANCH=integration/note4-custom
LIVE_HEAD_AT_ISSUE=640efafb0a4b8a8ab9864fb889fb1458d4271284
CURRENT_CAMPAIGN=8D1M_G_VOICE_WORKS_LATENCY_TEXT_AUDIO_RECOVERY
CURRENT_STAGE=M4_COMBINED_INSTRUMENTED_SESSION_ARMED
ACTIVE_BACKEND_TAG=slate:m4-voice-repair-f10ade6
ACTIVE_BACKEND_CANONICAL_IMAGE_ID=sha256:7cd37e6a48382f87b01ef731d8d0d8c76822d323fc651fa52ce712b0cd648ccb
ACTIVE_FIRMWARE_APP_SHA256=dc7669190bb17fa2a62958427e152ae8697887beae8fa4618058d2515ba7dc91
OBSERVER_LAUNCHD_LABEL=com.streetjk.slate.m4observer
OBSERVER_LIVE_STATE=RUNNING
```

Before execution, re-fetch PR #2 and `docs/campaign-reports/CAMPAIGN-STATE.md` at the exact live head. If GitHub advanced, reconcile from the newer frontier and preserve this instruction's intent rather than replaying stale state.

Keep PR #2 **OPEN / DRAFT / UNMERGED**. Do not merge or release.

## New authoritative operator result

The combined instrumented physical boundary has now been consumed. The device currently shows:

```text
LATEST_PHYSICAL_RESULT=VOICE_SERVICE_ERROR
PREVIOUS_RESULT=VOICE_AI_WORKED_VISIBLE_RESPONSE_BUT_SLOW_TEXT_SLOW_AND_NO_AUDIO
```

Treat this as a new post-repair physical failure event. Do **not** request another Voice AI retry before ingesting the already-running sanitized observer and exhausting all safe nonphysical work.

Immediately update the campaign state to consume the stale physical boundary. While technical work remains:

```text
WAITING_HUMAN_COUNT=0
HUMAN_ACTION_REQUIRED=NO
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
```

unless an actual authority or safety boundary is reached.

## Known established fact — do not reopen the old WebSocket defect without evidence

The previous corrected instrumented attempt mechanically proved:

```text
POST_REFLASH_OLD_BRANCH_REPRODUCED=NO
OLD_WS_TRANSPORT_FIX_STATUS=FIXED_IN_DEPLOYED_FIRMWARE
VOICE_WS_CONNECT_RESULT=OPEN
VOICE_WS_AUTH_RESULT=PASS
VOICE_WS_ACCEPTED=YES
VOICE_SESSION_INIT_SENT=YES
VOICE_MIC_STREAM_STARTED=YES
BACKEND_WS_UPGRADE=PASS
```

Therefore do not regress to `CASE_H` merely because the UI now displays a generic error. Reopen the lower WebSocket transport root cause only if the new observer evidence explicitly reproduces it.

## Critical semantic point — `Voice service error` is not a diagnosis

The current backend collapses multiple distinct failures into the same device alert via `handleLiveFailure()` / `fail()`:

```text
Voice service error
```

At minimum, the same visible message may be caused by:

- provider session create failure;
- Gemini Live `onerror`;
- unexpected Gemini Live `onclose`;
- bridge/runtime failure;
- backend audio/transcript/codec exception;
- WebSocket/session failure after successful open;
- lifecycle race introduced by the connect/listen decoupling changes.

Do not infer the root cause from the screen text.

## Phase 1 — ingest the already-running sanitized evidence first

Consume the exact current observer output for this physical attempt before making code changes.

Use only allow-listed structural markers, timestamps, counters, status classes and close codes. Do not retain raw serial lines, audio, transcripts, provider payloads, credentials, auth headers, Calendar/Outlook/private contents.

Capture or derive at minimum:

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
PROVIDER_FIRST_OUTPUT_EVENT=
PROVIDER_FIRST_AUDIO_EVENT=
BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=
FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED=
FIRMWARE_FIRST_DECODED_PCM=
AUDIO_PLAYER_FIRST_WRITE=
AUDIO_PLAYER_WRITE_RESULT=
TTS_START_RECEIVED=
TTS_STOP_RECEIVED=
TRANSCRIPT_UPDATE_COUNT=
SLATE_HEALTH=
SLATE_RESTART_COUNT=
MYSQL_HEALTH=
MYSQL_RESTART_COUNT=
ACTIVE_BACKEND_IMAGE_ID=
ACTIVE_FIRMWARE_APP_SHA256=
DEVICE_PORT_CONTINUITY=
```

Publish:

```text
LATEST_VOICE_SERVICE_ERROR_INGESTED=YES
OLD_WS_TRANSPORT_FAILURE_REPRODUCED=YES|NO|UNKNOWN
FAILURE_STAGE=
FAILURE_ROOT_CAUSE_CLASS=
REGRESSION_FROM_F10ADE6_OR_LATER=YES|NO|INCONCLUSIVE
PREVIOUS_LATENCY_TEXT_FIX_STILL_ACTIVE=YES|NO|UNKNOWN
AUDIO_FAILURE_STAGE=
NEXT_AUTONOMOUS_ACTION=
```

## Phase 2 — if the observer cannot distinguish the generic error source

Treat that as an observability defect, not as permission for a blind retry.

The current backend needs structural attribution between these paths. Add the narrowest privacy-safe markers needed to distinguish:

```text
LIVE_FAILURE_SOURCE=CONNECT_REJECT|PROVIDER_ONERROR|PROVIDER_ONCLOSE|BRIDGE_ERROR|MESSAGE_HANDLER_EXCEPTION|AUDIO_CODEC_EXCEPTION|SOCKET_SEND_EXCEPTION|OTHER_SAFE_CLASS
PROVIDER_CLOSE_EXPECTED=YES|NO
PROVIDER_CLOSE_GENERATION=
ACTIVE_CONNECT_GENERATION=
ACTIVE_LISTEN_GENERATION=
LISTENING_STATE_AT_FAILURE=YES|NO
LIVE_SESSION_PRESENT_AT_FAILURE=YES|NO
CONNECTING_PROMISE_PRESENT_AT_FAILURE=YES|NO
```

Do not log exception text, provider payloads, transcript text, raw audio, credentials, URLs containing secrets, auth headers, or private data.

If production/runtime bytes change for observability, use the normal AGY -> deterministic tests -> privacy/secret scan -> impacted build -> exact freeze -> fresh ZAI `glm-5.3-flash` review loop before deployment/reflash.

## Phase 3 — specifically audit the new provider lifecycle repair

The active reviewed candidate is:

```text
SOURCE_CANDIDATE_COMMIT=f10ade66e75522d27f023573f2aad03d39f4d8a2
MESSAGE=fix(voice): guard pending session lifecycle transitions
```

The current session implementation now contains:

- `connectingPromise`;
- `connectGeneration`;
- `listenGeneration`;
- bounded pre-provider mic queue;
- asynchronous `ensureLive()` on listen start;
- generation-based stale callback suppression;
- `handleLiveFailure()` that increments `connectGeneration`, clears queues/transcript state, closes `live`, and emits the generic error;
- provider callbacks routed through `isCurrentAttempt(generation)`.

Mechanically audit whether the new failure can result from a lifecycle race or false unexpected-close classification, including:

1. provider `onerror` occurring during or immediately after connection establishment;
2. provider `onclose` after a turn or `audioStreamEnd` being treated as fatal when it is expected;
3. stop/start generation changes invalidating a healthy provider callback;
4. `connectingPromise` being cleared or superseded while valid mic frames remain;
5. stale callback suppression incorrectly routing a live current session to `handleLiveFailure()`;
6. connect failure path incrementing `connectGeneration` and then re-entering failure handling twice;
7. firmware `ListeningMode::kAutoStop` sending stop semantics that interact badly with the new async provider-connect lifecycle;
8. `endAudio()` / provider turn completion / provider close ordering;
9. exceptions inside transcript streaming, PCM encode, WebSocket binary send, or tool handling being collapsed into `fail()`;
10. any mismatch between the Bun and Node bridge close/error semantics.

Do not patch speculatively. First prove the earliest failing transition with structural evidence or deterministic reproduction.

## Phase 4 — exact recovery branches

### Branch A — provider/session create fails before first mic/provider progression

Classify the sanitized failure (`CONNECT_TIMEOUT`, `CREDENTIAL_ERROR`, `CONFIG_ERROR`, `NETWORK_ERROR`, bridge stage, etc.). Use bounded same-route recovery only. Do not change credentials, provider, model, billing, OAuth, ADC, Calendar, Outlook or private-data authority.

If a code regression is proven, repair through the designated AGY route and test it deterministically.

### Branch B — provider session starts, then `onerror` / unexpected `onclose`

Determine whether the close/error is genuinely fatal or an expected turn/session transition. Add deterministic tests that reproduce the exact callback ordering and assert that expected close/turn completion does not surface `Voice service error`, while genuine provider failure still does.

### Branch C — provider output begins, then backend processing throws

Trace separately:

```text
OUTPUT_TRANSCRIPT_EVENT
AUDIO_EVENT
TRANSCRIPT_COALESCE
OPUS_ENCODE
JSON_SEND
BINARY_SEND
TURN_COMPLETE
TTS_STOP
```

Identify the exact first exception boundary. Repair only that boundary.

### Branch D — backend session remains healthy but firmware surfaces error

Trace the firmware structural path, WebSocket close code/state, incoming JSON parser, tts state transitions, audio queue and scene state. Do not change provider behavior if the backend remained healthy.

### Branch E — observer evidence is incomplete

Implement durable sanitized attribution, mechanically self-test it, deploy/reflash only if required and reviewed, re-arm it, then request at most one minimal physical action.

## Phase 5 — preserve the prior latency/text/audio work unless disproven

Do not throw away the previous improvements wholesale.

The prior qualified candidate established:

```text
PROVIDER_CONNECT_BLOCKS_MIC_PROCESSING=YES_CODE_PROVEN
PRE_PROVIDER_MIC_QUEUE=BOUNDED_50_FRAMES_100_KIB
TEXT_STREAM_COALESCING=100MS_TESTED
ONE_LOGICAL_ASSISTANT_BUBBLE=YES
EPD_IN_PLACE_BUBBLE_UPDATE=YES
DETERMINISTIC_AUDIO_PIPELINE_TEST=PASS
```

If the generic error regression is isolated to session lifecycle handling, preserve the bounded mic queue, transcript coalescing, one-bubble semantics, and e-ink in-place update.

The missing-audio investigation also remains open until the physical audio chain is proven end-to-end. Do not declare M4 success merely because the service error is removed.

## Required AGY / validation / ZAI loop for changed production bytes

For every proven runtime defect:

```text
evidence
-> Codex adjudication
-> same designated AGY Gemini 3.8 Flash minimal repair
-> narrow deterministic regression
-> impacted tests
-> backend full tests where impacted
-> firmware host tests where impacted
-> lint/typecheck/format for changed files
-> privacy/secret scan
-> build exact impacted artifact
-> freeze exact identities
-> fresh ZAI glm-5.3-flash exact review
-> REVISE -> AGY repair -> retest -> refreeze -> fresh ZAI automatically
```

Do not silently substitute writer/reviewer/provider/model.

## Deployment / reflash

Only after a fresh PASS for changed runtime bytes:

- deploy the exact reviewed backend artifact if backend bytes changed;
- app-only flash the exact reviewed firmware at `0x10000` if firmware bytes changed and the existing authorized boundary still applies;
- no full erase;
- no partition/NVS/LittleFS/pairing reset;
- verify exact hashes;
- verify boot/Wi-Fi/polling/backend/MySQL health;
- re-arm and mechanically verify the sanitized observer.

Do not rerun containerd V6 migration, repartition NVMe, touch Deluge data, remove rollback roots/images/backups, change credentials/provider/model/billing/private-data authority, merge or release.

## Physical retry gate

Do not request another physical Voice AI attempt until all nonphysical `READY` / `READONLY_READY` work is exhausted and the current generic-error source is either exactly attributed or reduced to the strongest mechanically supported class.

Required gate before another attempt:

```text
LATEST_VOICE_SERVICE_ERROR_INGESTED=YES
FAILURE_ROOT_CAUSE_CLASS=EXACT_OR_MAXIMALLY_SUPPORTED
DETERMINISTIC_REGRESSION=PASS_IF_BYTES_CHANGED
IMPACTED_TESTS=PASS
PRIVACY_SECRET_SCAN=PASS
FRESH_ZAI_REVIEW=PASS_IF_BYTES_CHANGED
DEPLOYMENT_OR_APP_ONLY_REFLASH=PASS_IF_REQUIRED
POST_CHANGE_REQUALIFICATION=PASS_IF_REQUIRED
SANITIZED_OBSERVER=ARMED_AND_MECHANICALLY_VERIFIED
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
```

Only then may:

```text
WAITING_HUMAN_COUNT=1
HUMAN_ACTION_REQUIRED=YES
```

for one minimal instrumented physical attempt.

## Report-push invariant

At every meaningful checkpoint, stage transition, hard stop, reviewer block, failure or success:

1. update this report with exact evidence;
2. update `docs/campaign-reports/CAMPAIGN-STATE.md` if stage/frontier changed;
3. run `git diff --check`;
4. run the applicable secret-safe scan;
5. commit and push selectively;
6. fetch-verify the exact pushed SHA;
7. verify PR #2 remains OPEN / DRAFT / UNMERGED;
8. continue automatically while any safe `READY` / `READONLY_READY` node exists.

Do not exit merely because a checkpoint, test, review, build, deploy, flash, transient provider/tool failure or child milestone completed.
