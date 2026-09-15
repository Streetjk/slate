# Campaign 8D1M-G — Second M4 Failure with Live Observer: Attribution and Repair Continuation

## Attribution checkpoint — exact firmware transport branch; AGY implementation blocked

The live PTY observer captured the second physical attempt's firmware-side
branch without retaining serial contents:

```text
SERIAL_MARKER=VOICE_WS_CONNECT_START
SERIAL_MARKER=VOICE_WS_CONNECT_RESULT=TRANSPORT_FAIL
SERIAL_MARKER=VOICE_GENERIC_FAILURE_BRANCH=WS_CONNECT_FAIL
SERIAL_MARKER=VOICE_MIC_STREAM_STARTED=NO
BACKEND_WS_UPGRADE_DURING_SECOND_ATTEMPT=NOT_OBSERVED
PROVIDER_SESSION_CREATE_DURING_SECOND_ATTEMPT=NOT_OBSERVED
MIC_AUDIO_REACHED_PROVIDER=NO
FAILURE_STAGE=FIRMWARE_WEBSOCKET_TRANSPORT_OR_HANDSHAKE_BEFORE_BACKEND_UPGRADE
ROOT_CAUSE_CLASS=CASE_H_FIRMWARE_WEBSOCKET_TRANSPORT_FAILURE_BEFORE_BACKEND_UPGRADE
```

This closes the prior attribution gap. Static inspection proves the narrow
source defect: the WebSocket receive callback is installed after the
handshake request is sent, so a fast response can be discarded and surfaced
as the generic transport failure branch. No credential, model, billing,
provider, or private-data change is indicated.

The designated AGY `gemini-3.8-flash-high` implementation attempt was started
with the exact bounded repair request but returned no patch. Its terminal
result was:

```text
agy-staff error: agy reported an error (status ERROR, exit 1).
agy error: timeout waiting for response
```

The working tree confirms no tracked source bytes changed. Per the AGY
implementer failure protocol, no alternate writer, reviewer substitution, or
altered retry is being attempted in this controller turn.

```text
AGY_IMPLEMENTATION_STATUS=EXTERNALLY_BLOCKED_TIMEOUT
SOURCE_BYTES_CHANGED=NO
PROVIDER_CALLS_THIS_ACTION=0
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=0
EXTERNALLY_BLOCKED_COUNT=1
CURRENT_BLOCKED_NODE=AGY_BOUNDED_WEBSOCKET_CALLBACK_ORDER_REPAIR
HUMAN_ACTION_REQUIRED=NO
TERMINAL_REASON=AGY_IMPLEMENTER_TIMEOUT_PER_REQUIRED_SKILL_FAILURE_PROTOCOL
NEXT_ACTION=RECOVER_DESIGNATED_AGY_WRITER_ROUTE_THEN_APPLY_BOUNDED_REPAIR
```

## Operator result

The operator performed the next authorized physical M4 attempt after the live sanitized PTY observer had been armed.

Result:

```text
VOICE_SERVICE_UNAVAILABLE=YES
SECOND_OBSERVED_M4_FAILURE=YES
MANUAL_RETRY_AFTER_THIS_RESULT=NO
```

This new operator result supersedes the stale `WAITING_HUMAN=1` physical-retest boundary recorded before the attempt. The human boundary has now been satisfied and the frontier must return to technical attribution/repair.

Do **not** ask the operator for another blind Voice AI retry at this stage.

## Mission

Reconcile live PR #2 and continue under `FRONTIER_DRIVEN_LONGRUN` from the second physical failure.

The prior failure already proved:

```text
VOICE_WEBSOCKET_AUTHENTICATED_RESULT=PASS
VOICE_WEBSOCKET_OPEN_RESULT=ACCEPTED
BACKEND_FIRST_MIC_FRAME=NO
MIC_AUDIO_REACHED_PROVIDER=NO
ROOT_CAUSE_CLASS=CASE_B_OR_CASE_E_PRE_MIC_FAILURE_WITH_OBSERVER_CAPTURE_GAP
SOURCE_DEFECT=NOT_PROVEN
```

The purpose of the second attempt was specifically to close that firmware-side observer gap using the newly armed live PTY serial observer.

Therefore the immediate task is **not another retest**. It is to ingest and correlate the live observer evidence from this second attempt.

## Immediate action — ingest the second attempt mechanically

Locate the exact time window for the second operator-visible `Voice service unavailable` event and correlate:

1. live PTY serial sanitized markers;
2. backend structural markers;
3. backend health/restart state;
4. device connection/port continuity;
5. exact active backend and firmware identities.

Retain no raw audio, transcript text, provider payloads, credentials, auth headers, Calendar data, Outlook data, or other private content.

Extract, where available:

```text
VOICE_CONFIG_REQUEST_START=
VOICE_CONFIG_RESULT=
VOICE_CONFIG_PARSE=
VOICE_WS_CONNECT_START=
VOICE_WS_CONNECT_RESULT=
VOICE_WS_CLOSE_CODE=
VOICE_SESSION_INIT_SENT=
VOICE_MIC_STREAM_STARTED=
VOICE_GENERIC_FAILURE_BRANCH=

VOICE_CONFIG_AUTH_ATTEMPT=
VOICE_CONFIG_AUTH_RESULT=
VOICE_CONFIG_RESPONSE_CLASS=
VOICE_WS_UPGRADE_ATTEMPT=
VOICE_WS_AUTH_RESULT=
VOICE_WS_ACCEPTED=
PROVIDER_SESSION_CREATE_START=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
FIRST_MIC_FRAME_RECEIVED=

SLATE_RESTART_COUNT=
MYSQL_RESTART_COUNT=
LOCAL_HEALTH=
PUBLIC_HEALTH=
```

Mechanically determine the exact failure branch rather than retaining `CASE_B_OR_CASE_E` if the live serial markers can distinguish it.

## Required classification

Classify the second failure into the narrowest supported stage, for example:

```text
A = authenticated voice-config request/response failure
B = firmware config parse / protocol construction failure
C = WebSocket authentication / upgrade failure
D = WebSocket accepted then firmware-side session-init/send failure
E = WebSocket accepted then pre-mic close / transport / protocol failure
F = provider-session creation failure before mic
G = first mic frame path failure
H = other exact sanitized branch
```

Do not infer a branch that the observer evidence does not support.

Record exact sanitized timestamps and stage deltas sufficient to prove sequencing.

## If the live observer captured the exact firmware branch

If the second attempt resolves the exact failure branch, immediately continue technical recovery without another human stop.

Use:

```text
sanitized exact attribution
-> root-cause proof
-> AGY gemini-3.8-flash minimal repair if product bytes require change
-> Codex deterministic validation
-> privacy/secret scan
-> impacted backend/firmware rebuild only
-> freeze exact identities
-> fresh independent ZAI glm-5.3-flash exact review for every changed production byte
-> reviewer REVISE -> repair -> retest -> rereview loop until PASS
-> reviewed backend redeploy if required
-> exact app-only NOTE4 reflash if required
-> post-deploy/post-flash zero-private-data requalification
-> arm fresh sanitized observers
-> return to human only when one final physical M4 retest is genuinely the sole remaining useful node
```

Do not stop at implementation, test PASS/FAIL, reviewer REVISE/PASS, build, deployment, flash, or report publication while READY/READONLY_READY work remains.

## If no source-code change is required

If the exact branch proves an operational/config/protocol issue that can be corrected without changing production source bytes, perform only the minimum authorized deterministic correction and requalification.

Do not change:

- production Gemini model;
- credentials;
- provider;
- billing;
- OAuth/ADC authority;
- Calendar authority;
- Outlook authority;
- private-data authority.

If any such change is actually required, stop at that genuine authority boundary with a compressed decision packet.

## If the live PTY observer again failed to retain usable markers

Do **not** immediately ask for a third physical retry.

Treat a second observer-capture failure as an instrumentation reliability defect.

Create a READY software node to make observer capture durable and mechanically provable for the next attempt. Prefer one or more of:

- persistent sanitized ring-buffer/file with bounded size;
- automatic timestamped marker flush;
- explicit observer-alive heartbeat;
- automatic capture start/stop tied to Voice AI session lifecycle;
- post-failure snapshot of fixed structural markers only.

No private content may be retained.

If product bytes change for observer reliability, use AGY -> Codex tests -> exact freeze -> fresh ZAI review -> deploy/reflash as required.

Only after durable observer capture is proven and all other READY/READONLY_READY work is exhausted may another physical attempt become `WAITING_HUMAN=1`.

## Reviewer routing

Keep:

```text
IMPLEMENTATION_WRITER=AGY gemini-3.8-flash
INDEPENDENT_REVIEWER=ZAI glm-5.3-flash
```

No reviewer substitution without explicit authority.

Fresh review is mandatory after any production-byte change. The verdict must bind to exact SHA256.

## Preserve accepted platform state

Do not rerun V6.

Do not repartition NVMe.

Do not touch Deluge data.

Do not delete preserved rollback roots/images/backups.

Keep PR #2 `OPEN / DRAFT / UNMERGED`.

## Frontier correction

The prior report's:

```text
WAITING_HUMAN_COUNT=1
NEXT_ACTION=HUMAN_ENTER_VOICE_AI...
```

is stale after the operator's second failure.

Recompute the frontier after ingesting the live evidence.

Expected near-term state should be technical, e.g.:

```text
CURRENT_STAGE=M4_SECOND_FAIL_ATTRIBUTION_OR_REPAIR
READY_NODE_COUNT=>=1
READONLY_READY_NODE_COUNT=>=0
WAITING_HUMAN_COUNT=0
```

unless a genuine authority/security boundary is discovered.

## Exit contract

Before any controller exit record:

```text
CURRENT_HEAD=
CURRENT_STAGE=
M4_STATUS=
SECOND_M4_FAILURE_INGESTED=
VOICE_CONFIG_AUTHENTICATED_RESULT=
VOICE_CONFIG_PARSE_RESULT=
VOICE_WEBSOCKET_AUTHENTICATED_RESULT=
VOICE_WEBSOCKET_OPEN_RESULT=
VOICE_WEBSOCKET_CLOSE_CODE=
VOICE_SESSION_INIT_SENT=
VOICE_MIC_STREAM_STARTED=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
MIC_AUDIO_REACHED_PROVIDER=
FIRMWARE_GENERIC_FAILURE_BRANCH=
ROOT_CAUSE_CLASS=
SOURCE_DEFECT=
OBSERVER_CAPTURE_STATUS=
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

Do not exit while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`.

Do not ask the operator to retry Voice AI again until attribution/repair/requalification has exhausted all nonphysical work and a new physical test is truly the sole remaining node.
