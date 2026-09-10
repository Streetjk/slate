# Campaign 8D1M-G — Final M4 Physical Session and Post-Session Continuation

## Live reconciliation — sanitized observers re-armed; physical boundary preserved

The live PR branch was reconciled at `09ba8e24ebd3282418116e836818537e85d239e9`.
The intervening change adds this final-session directive only; the reviewed
backend and V6 migration artifact remain unchanged. Read-only host checks and
the re-armed sanitized observers confirm the accepted deployment boundary:

```text
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
CONTAINERD_ROOT=/mnt/ssd-tmp/slate-tools/containerd-root
CONTAINERD_STATE=/run/containerd-v5
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
SLATE=running/healthy/restart=0
MYSQL=running/healthy/restart=0
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
ACTIVE_BACKEND_IMAGE=sha256:63db9b2133af17d0a755a7149c0fb22e9cfa0fcaad19df31fbac2ebf344def17
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
NVME_RESERVE=PASS
ORIGINAL_ROOTS_PRESERVED=YES
V5_DROPINS=ABSENT
SERIAL_OBSERVER=ARMED_SANITIZED_PORT_OPEN
BACKEND_OBSERVER=ARMED_SANITIZED_REPEATED_HEALTHY_SAMPLES
GEMINI_PROVIDER_CALLS_THIS_RECONCILIATION=0
M4_STATUS=READY_FOR_ONE_COMBINED_PHYSICAL_SESSION
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=0
```

The observer records only fixed structural serial markers and sanitized
backend status/health/restart/image fields. It does not retain audio,
transcript text, provider payloads, credentials, auth headers, or private
data. No provider call, firmware write, deployment, or production mutation
was initiated by this reconciliation.

## Mission

Execute the sole remaining human boundary for Campaign 8D1M-G: one combined NOTE4 physical English/Japanese Voice AI session with the exact reviewed backend and exact app-only firmware already active.

Operate under `FRONTIER_DRIVEN_LONGRUN`. Live GitHub state is authoritative. Keep PR #2 open, draft, and unmerged.

Before acting, reconcile PR #2 and read:

- `docs/campaign-reports/CAMPAIGN-STATE.md`
- `docs/campaign-reports/08D1M-G-EXACT-IMAGE-IDENTITY-RECOVERY.md`
- `docs/campaign-reports/08D1M-G-ZAI-TIMEOUT-RECOVERY-AND-PHYSICAL-CONTINUATION.md`

Do not create documentation-only `CURRENT_HEAD` loops.

## Accepted current checkpoint

Accept unless live evidence disproves it:

```text
DEVICE_STATUS=CONNECTED_IDENTITY_VERIFIED_AND_FLASH_PASS
DEVICE_PORT=/dev/cu.usbmodem31201
DEVICE_TARGET=ESP32-S3_REV_V0.2
DEVICE_FLASH_SIZE=16MB
SOURCE_BUNDLE_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
BACKEND_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
BACKEND_IMAGE_ACTIVE_ID=sha256:63db9b2133af17d0a755a7149c0fb22e9cfa0fcaad19df31fbac2ebf344def17
BACKEND_IMAGE_IDENTITY_PROOF=PASS_CANONICAL_REMOTE_ID_63DB
ZAI_REVIEW_STATUS=PASS_EXACT_SHA
ZAI_IDENTITY_EQUIVALENCE_STATUS=PASS
BACKEND_DEPLOYMENT_STATUS=PASS
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
FIRMWARE_FLASH_OFFSET=0x10000
FIRMWARE_FLASH_SCOPE=APP_ONLY
FIRMWARE_FLASH_STATUS=PASS
DEVICE_BOOT_STATUS=PASS_SANITIZED
DEVICE_WIFI_STATUS=PASS_SANITIZED
DEVICE_FATAL_MARKER_COUNT=0
SLATE_HEALTH=PASS_RESTART_0
MYSQL_HEALTH=PASS_RESTART_0_IDENTITY_PRESERVED
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
SECRET_MOUNT_READ_ONLY=YES
SERIAL_OBSERVER=ARMED_SANITIZED
BACKEND_OBSERVER=ARMED_SANITIZED
M4_STATUS=READY_FOR_ONE_COMBINED_PHYSICAL_SESSION
M4_PROVIDER_SESSION_STARTED=NOT_STARTED_BY_CONTROLLER
M4_PROVIDER_CALL_COUNT=0_CONTROLLER_CALLS
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=0
```

This is a legitimate physical human boundary. Do not perform further production changes before the operator completes the M4 session.

## Operator protocol — one session only

Use one combined physical session. Do not split English and Japanese into separate provider sessions unless the first session terminates unexpectedly and a later repair/requalification specifically requires another human retest.

1. On NOTE4, enter Voice AI using the normal control path.
2. Ask one short, non-sensitive English question.
   - Suggested: `How many days are in a week?`
3. Wait until the assistant has completely finished.
4. Without leaving Voice AI, ask one short, non-sensitive Japanese question.
   - Suggested: `一年は何ヶ月ありますか？`
5. Wait until the assistant has completely finished.
6. Exit Voice AI normally.

Do not invoke Search, Calendar, Outlook, or other tools during this acceptance session.

## Human-visible acceptance observations

The operator should report only what can be visually/audibly observed.

For English:

```text
EN_VOICE_SERVICE_AVAILABLE=YES|NO
EN_USER_BUBBLES=<number>
EN_ASSISTANT_BUBBLES=<number>
EN_FRAGMENT_CREATED_EXTRA_BUBBLES=YES|NO
EN_EXCESSIVE_EINK_REDRAW_CHURN=YES|NO
EN_AUDIO=NORMAL|ABNORMAL|NO_AUDIO
EN_PERCEIVED_RESPONSE_LATENCY_SECONDS=<approximate or UNKNOWN>
```

For Japanese:

```text
JA_VOICE_SERVICE_AVAILABLE=YES|NO
JA_USER_BUBBLES=<number>
JA_ASSISTANT_BUBBLES=<number>
JA_FRAGMENT_CREATED_EXTRA_BUBBLES=YES|NO
JA_EXCESSIVE_EINK_REDRAW_CHURN=YES|NO
JA_AUDIO=NORMAL|ABNORMAL|NO_AUDIO
JA_PERCEIVED_RESPONSE_LATENCY_SECONDS=<approximate or UNKNOWN>
```

Session exit:

```text
VOICE_AI_EXIT=PASS|FAIL
UNEXPECTED_VENDOR_FALLBACK=YES|NO|UNKNOWN
```

Do not ask the operator to judge internal stages that are mechanically observable from the sanitized serial/backend observers.

## Sanitized observer reconciliation

Immediately after the operator reports completion, ingest and correlate the already-armed sanitized observers.

Never retain or print:

- raw microphone audio;
- transcript text;
- provider payload contents;
- credentials;
- auth headers/tokens;
- Calendar/Outlook contents;
- private user data.

Record only structural markers, timestamps, status classes, counters, close codes, sanitized failure enums, hashes, and latency-stage deltas.

At minimum determine:

```text
VOICE_CONFIG_AUTHENTICATED_RESULT=
VOICE_CONFIG_PARSE_RESULT=
VOICE_WEBSOCKET_AUTHENTICATED_RESULT=
VOICE_WEBSOCKET_OPEN_RESULT=
VOICE_WEBSOCKET_CLOSE_CODE=
PROVIDER_SESSION_CREATE_START=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
MIC_AUDIO_REACHED_PROVIDER=
FIRMWARE_GENERIC_FAILURE_BRANCH=
BACKEND_FIRST_MIC_FRAME=
SANITIZED_STAGE_LATENCY_DELTAS=
```

## PASS criteria

M4 can PASS only if the combined evidence supports all of the following:

- Voice service available for both English and Japanese turns;
- one logical user turn produces one user bubble;
- one logical assistant turn produces one assistant bubble;
- no transcript-fragment-created extra assistant bubbles;
- no excessive fragment-driven e-ink redraw churn;
- normal audio for both turns;
- Voice AI exits normally;
- no unexpected vendor/Tenclass fallback;
- backend remains healthy with Slate/MySQL restart counts stable;
- no production Gemini model, credential, or billing change;
- no raw audio/transcript/provider-payload retention;
- sanitized latency evidence is reconciled as far as available.

Approximate perceived latency is useful but exact human stopwatch timing is not a hard PASS requirement if sanitized stage telemetry is available.

## If `Voice service unavailable` or another M4 failure occurs

Do not ask the human to retry blindly.

Immediately classify the failing stage from the new observability:

```text
CASE_A=authenticated voice-config failure
CASE_B=voice WebSocket/backend auth/handshake failure
CASE_C=provider/session initialization failure
CASE_D=backend runtime/config regression
CASE_E=firmware integration/config/WebSocket regression
CASE_F=mechanically-proven transient external/network defect
CASE_G=other deterministic evidence-backed defect
```

Preserve exact sanitized evidence and provider-session accounting:

```text
M4_PROVIDER_SESSION_STARTED=YES|NO|UNKNOWN
M4_PROVIDER_CALL_COUNT=<n or UNKNOWN>
M4_MIC_AUDIO_REACHED_PROVIDER=YES|NO|UNKNOWN
```

Do not repeat the microphone/provider session until the defect is repaired and requalified.

### Automatic repair loop

Controller/integrator: Codex.

Implementation writer: AGY `gemini-3.8-flash`.

Independent reviewer for changed production bytes: ZAI `glm-5.3-flash`.

If implementation bytes must change:

```text
evidence-backed attribution
-> AGY gemini-3.8-flash minimal repair
-> Codex deterministic validation
-> relevant backend/firmware tests
-> privacy/secret scan
-> build impacted artifacts
-> freeze exact identities
-> fresh ZAI glm-5.3-flash exact review
-> REVISE/repair/retest/rereview automatically until PASS
-> deploy/reflash within existing authority
-> return only for the next genuinely necessary physical retest
```

Reviewer REVISE, deterministic FAIL with bounded repair, deployment PASS, firmware flash PASS, and report publication are not human stops.

If no production bytes change and the failure is operational/configuration-only within existing campaign authority, Codex may perform the bounded correction directly, requalify, and return only when another physical retest is necessary.

Do not change production Gemini model, credentials, billing, provider authority, Calendar authority, Outlook authority, merge/release state, or preserved rollback assets without separate explicit authority.

## If M4 PASS

Continue automatically after the human result:

1. reconcile sanitized serial/backend observer evidence;
2. verify post-session Slate/MySQL health and restart stability;
3. reconcile provider-session accounting;
4. record final bubble-coalescing and latency acceptance;
5. publish the final Campaign 8D1M-G closure dossier;
6. leave PR #2 OPEN / DRAFT / UNMERGED unless separately authorized otherwise;
7. do not merge or release automatically.

A successful physical M4 session is not a reason to stop before the evidence/closure dossier is complete.

## Exit contract

Before any controller exit, report:

```text
CURRENT_HEAD=
CURRENT_STAGE=
DEVICE_STATUS=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
M4_STATUS=
M4_PROVIDER_SESSION_STARTED=
M4_PROVIDER_CALL_COUNT=
VOICE_CONFIG_AUTHENTICATED_RESULT=
VOICE_WEBSOCKET_AUTHENTICATED_RESULT=
PROVIDER_SESSION_CREATE_RESULT=
FIRMWARE_GENERIC_FAILURE_BRANCH=
BACKEND_DEPLOYMENT_STATUS=
FIRMWARE_FLASH_STATUS=
POST_M4_HEALTH_STATUS=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Do not exit while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`.

A legitimate pre-M4 stop is the physical button/microphone boundary only. A legitimate post-failure stop occurs only after all nonphysical attribution/repair/requalification work is exhausted and another physical retest or a genuine authority/security boundary is required.

Keep PR #2 OPEN / DRAFT / UNMERGED.
