# Campaign 8D1M-G — Post-Repair `Voice service error`: Ingest, Attribute, Recover

## Controller ingestion — 2026-09-08

```text
LATEST_VOICE_SERVICE_ERROR_INGESTED=YES
OBSERVER_LAUNCHD_STATE=RUNNING
OBSERVER_LOG=/tmp/slate-m4-observer-launchd.jsonl
OBSERVER_CAPTURE_SANITIZED=YES
OBSERVER_STRUCTURAL_SEQUENCE=VOICE_WS_CONNECT_RESULT=OPEN,VOICE_SESSION_INIT_SENT=YES,VOICE_MIC_STREAM_STARTED=YES
VOICE_WS_AUTHENTICATED_RESULT=NOT_CAPTURED_IN_THIS_ATTEMPT
PROVIDER_SESSION_CREATE_START=NOT_CAPTURED_IN_THIS_ATTEMPT
PROVIDER_SESSION_CREATE_RESULT=NOT_CAPTURED_IN_THIS_ATTEMPT
PROVIDER_SESSION_STARTED=NOT_CAPTURED_IN_THIS_ATTEMPT
PROVIDER_LIVE_ERROR_CALLBACK=NOT_CAPTURED_IN_THIS_ATTEMPT
PROVIDER_LIVE_CLOSE_CALLBACK=NOT_CAPTURED_IN_THIS_ATTEMPT
PROVIDER_FIRST_OUTPUT_EVENT=NOT_CAPTURED_IN_THIS_ATTEMPT
PROVIDER_FIRST_AUDIO_EVENT=NOT_CAPTURED_IN_THIS_ATTEMPT
BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=NOT_CAPTURED_IN_THIS_ATTEMPT
FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED=NOT_CAPTURED_IN_THIS_ATTEMPT
FIRMWARE_FIRST_DECODED_PCM=NOT_CAPTURED_IN_THIS_ATTEMPT
AUDIO_PLAYER_FIRST_WRITE=NOT_CAPTURED_IN_THIS_ATTEMPT
AUDIO_PLAYER_WRITE_RESULT=NOT_CAPTURED_IN_THIS_ATTEMPT
VOICE_CONFIG_RESULT=NOT_CAPTURED_IN_THIS_ATTEMPT
VOICE_WS_CLOSE_CODE=NOT_CAPTURED_IN_THIS_ATTEMPT
FIRST_MIC_FRAME_RECEIVED=NO_IN_BACKEND_SNAPSHOT
SLATE_HEALTH=HTTP_200
SLATE_RESTART_COUNT=0
MYSQL_HEALTH=HEALTHY
MYSQL_RESTART_COUNT=0
ACTIVE_BACKEND_IMAGE=slate:m4-voice-repair-f10ade6
OLD_WS_TRANSPORT_FAILURE_REPRODUCED=NO
FAILURE_STAGE=UNATTRIBUTED_AFTER_WS_OPEN_BEFORE_CAPTURED_PROVIDER_MARKER
FAILURE_ROOT_CAUSE_CLASS=OBSERVABILITY_INCOMPLETE
REGRESSION_FROM_F10ADE6_OR_LATER=INCONCLUSIVE
PREVIOUS_LATENCY_TEXT_FIX_STILL_ACTIVE=UNKNOWN
AUDIO_FAILURE_STAGE=NOT_CAPTURED
M4_PROVIDER_SESSION_STARTED=UNKNOWN
M4_PROVIDER_CALL_COUNT=UNKNOWN
M4_MIC_AUDIO_REACHED_PROVIDER=UNKNOWN
NEXT_AUTONOMOUS_ACTION=ADD_MINIMUM_SANITIZED_PROVIDER_AND_FAILURE-STAGE ATTRIBUTION
```

The observer emitted no raw serial, transcript, audio, provider payload,
credential, or auth-header content. Because the allow-listed output did not
contain provider session-create, provider callback, bridge, codec, or socket
send markers for this consumed physical attempt, the generic device error is
not mechanically attributable. No provider retry, deployment, reflash, or
source change was performed during ingestion.

## Sanitized attribution candidate — 2026-09-08

The designated AGY writer produced a bounded attribution candidate after the
observer evidence established that the existing marker surface could not
distinguish the generic device error. Codex integrated and inspected the
candidate. The candidate preserves the reviewed lifecycle guard, bounded
50-frame/100 KiB pre-provider mic queue, 100 ms transcript coalescing, one
logical assistant bubble, and in-place e-ink updates.

Changed artifacts are limited to:

```text
backend/src/modules/assistant/xiaozhi-voice-session.ts
backend/src/modules/assistant/xiaozhi-voice-session.test.ts
scripts/slate-m4-sanitized-observer-v2.py
```

The runtime now emits only fixed structural enums and state markers for
connect rejection, provider error/close callbacks, bridge errors, message
handler failures, codec failures, device-socket send failures, generation
state, listening state, live-session presence, and pending-connect presence.
Provider callback errors and close events are classified separately from
provider session creation; expected planned closes remain non-fatal. The
observer allow-list and self-test accept only the fixed values and retain no
raw exception, transcript, audio, provider payload, credential, URL, or auth
header content.

Validation before exact review:

```text
AGY_IMPLEMENTATION=PASS
TARGETED_TESTS=33_PASS_0_FAIL
BACKEND_FULL_TESTS=358_PASS_5_SKIP_0_FAIL
TYPECHECK=PASS
LINT=PASS
FORMAT=PASS
OBSERVER_SELF_TEST=PASS
OBSERVER_PYTHON_SYNTAX=PASS
DIFF_CHECK=PASS
PRODUCTION_RUNTIME_SECRET_SCAN=PASS
```

Frozen working-tree artifact hashes before commit:

```text
SESSION_SOURCE_SHA256=19e827cddb6e191ad495cef1c10d0f0a29179055bdb745441f60ef0d3aef65c8
SESSION_TEST_SHA256=9f652dc6166f3ac88a237c63bbeb20883a47b209a1b39840ec91d78198113a75
OBSERVER_SHA256=f9d2fe645287fccfe69af0bb53f4e52f0726c624ad0537d1abf38bfbe20b8dd8
EXACT_REVIEW_REQUIRED=YES
```

No production deployment, firmware write, provider session, credential
operation, model change, billing change, or private-data operation occurred.
The exact committed candidate is the only artifact eligible for fresh ZAI
`glm-5.3-flash` review; no physical retry is authorized until that review and
all subsequent nonphysical qualification are complete.

## Exact independent review — 2026-09-08

The first supported `codex review --commit` transport did not return a verdict
after its repository inspection and was classified as a reviewer result-return
timeout. The exact request and candidate were preserved. One materially
different same-reviewer route (`codex exec`, read-only, profile
`zai-glm53-reviewer`) then completed after local generated-session storage was
recovered. No candidate bytes changed between attempts.

```text
REVIEWER=glm-5.3-flash
REVIEW_TARGET_SHA=dd8b5b48067933e5431f196bb474c22eb657ad75
VERDICT=PASS
P0=0
P1=0
P2=0
P3=0
SECURITY_FINDINGS=NONE
FINDINGS=NONE
REVIEW_TRANSPORT_RECOVERY=PASS_SAME_REVIEWER_MATERIALLY_DISTINCT_ROUTE
```

The independent review verified exact byte identity, lifecycle-generation
guards, provider create/error/close distinction, bridge/runtime and codec/
device-socket classification, expected-close handling, bounded mic queue,
transcript coalescing, one-bubble/e-ink behavior, and observer privacy
allow-listing. The fallback reviewer process encountered only a local session
recorder storage exhaustion; two inactive generated Codex session logs were
removed to restore workspace capacity. No repository, production, Docker,
credential, firmware, or private-data artifact was removed or changed.

The exact reviewed commit is now frozen for impacted image build and
provider-disabled qualification. A fresh review is required for any later
runtime byte change.

## Exact ARM64 build and provider-disabled image qualification — 2026-09-08

The exact reviewed commit was built in the disposable local Colima ARM64
Docker environment after recovering a local BuildKit I/O fault. The daemon
was restarted locally only; the Orange Pi production daemon and production
containers were not restarted or changed.

```text
BUILD_SOURCE_COMMIT=dd8b5b48067933e5431f196bb474c22eb657ad75
BACKEND_TAG=slate:m4-voice-attribution-dd8b5b4
BACKEND_IMAGE_ID=sha256:144c4b14107fb6266445c51465e89cbfb43b0c6c7e62548fbd49374d8e02ed3d
BACKEND_IMAGE_PLATFORM=linux/arm64
BACKEND_IMAGE_SIZE_BYTES=1130723761
BACKEND_IMAGE_TAR=/tmp/slate-m4-attribution-artifacts/slate-m4-voice-attribution-dd8b5b4.tar
BACKEND_IMAGE_TAR_SHA256=0333345ce78e963d8f2bdf91d090f0f021d8f10971e1ea00476752d2521e6d16
```

The image was exercised without a Gemini credential and without network
access, using a read-only root filesystem, tmpfs-only writable paths, and a
synthetic provider-disabled file at `/run/secrets/slate-test`:

```text
IN_IMAGE_ATTRIBUTION_TESTS=33_PASS_0_FAIL
IN_IMAGE_ADAPTER_TESTS=6_PASS_0_FAIL
IN_IMAGE_NETWORK=NONE
IN_IMAGE_ROOTFS=READ_ONLY
IN_IMAGE_SECRET= SYNTHETIC_ONLY
PROVIDER_SESSION_CREATED=NO
GEMINI_PROVIDER_CALLS=0
```

The first adapter invocation was intentionally rejected by the image's
trusted-secret-path guard because its synthetic file was placed under `/tmp`;
the corrected disposable invocation placed only the synthetic file under the
approved `/run/secrets` path with mode 0600 and passed all six tests. No
production credential was mounted, read, copied, or exposed. The exact image
is ready for the already-authorized bounded backend deployment/requalification
step; firmware remains unchanged.

## Backend deployment and nonphysical requalification — 2026-09-08

The first image-only deployment attempt was rejected from acceptance because
the temporary Compose override omitted the existing protected secret bind. It
was rolled back immediately to `slate:m4-voice-repair-f10ade6`, and the known
good health and read-only secret-mount gates passed. This was a deployment
invocation defect, not a source defect. The candidate was then deployed with
the exact historical host-local protected source bound read-only at the
existing destination.

```text
FIRST_DEPLOYMENT_ATTEMPT=REJECTED_MISSING_SECRET_MOUNT
FIRST_DEPLOYMENT_ROLLBACK=PASS
CORRECTED_DEPLOYMENT=PASS
ACTIVE_BACKEND_TAG=slate:m4-voice-attribution-dd8b5b4
ACTIVE_BACKEND_DAEMON_IMAGE_ID=sha256:63275954b49c147eae65189515655f33517b29d50bf5d582c229f90acec522c9
CANONICAL_META_SHA256=0b61f041b94199fa5499b6410fa636eba8b49957bb49416b880a6e65e72a5855
BACKEND_TAR_SHA256=0333345ce78e963d8f2bdf91d090f0f021d8f10971e1ea00476752d2521e6d16
SECRET_DESTINATION=/run/secrets/gemini_api_key
SECRET_MOUNT_RW=false
SLATE_HEALTH=healthy
SLATE_RESTART_COUNT=0
MYSQL_HEALTH=healthy
MYSQL_RESTART_COUNT=0
MYSQL_RECREATED=NO
LOCAL_HEALTH=200
PUBLIC_HEALTH=200
VOICE_CONFIG_UNAUTH=401
PROVIDER_SESSION_CREATED_BY_VALIDATION=NO
```

The exact loaded candidate then passed the provider-disabled adapter suite on
the Orange Pi with network disabled, a read-only root filesystem, tmpfs-only
writable paths, and a synthetic-only file under `/run/secrets`. The protected
production source was not mounted into this test container and no provider
session was opened.

```text
REMOTE_PROVIDER_DISABLED_ADAPTER_TESTS=6_PASS_0_FAIL
REMOTE_PROVIDER_DISABLED_NETWORK=NONE
REMOTE_PROVIDER_DISABLED_ROOTFS=READ_ONLY
REMOTE_PROVIDER_DISABLED_SECRET=SYNTHETIC_ONLY
```

The corrected sanitized observer was rearmed after deployment and verified
running against the candidate. Its latest structural snapshot reports
Slate/MySQL healthy, local/public health `200,200`, zero fatal serial markers,
and no retained raw serial content. The already-qualified app-only firmware
was not changed.

```text
OBSERVER_LABEL=com.streetjk.slate.m4observer
OBSERVER_STATE=RUNNING
OBSERVER_PORT=/dev/cu.usbmodem31101
OBSERVER_RAW_CONTENT=NO
OBSERVER_FATAL_MARKERS=0
OBSERVER_ACTIVE_BACKEND=slate:m4-voice-attribution-dd8b5b4
OBSERVER_HEALTH=200,200
OBSERVER_MYSQL=running|healthy|0
OBSERVER_SLATE=running|healthy|0
OBSERVER_REARM=PASS
```

All nonphysical attribution, review, build, deployment, provider-disabled
qualification, and observer-rearm work is complete. No provider call or
microphone session was consumed by this recovery. The next action is one
combined instrumented physical EN/JA Voice AI session to capture the now
distinguishable earliest failure boundary and audio/latency markers.

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
