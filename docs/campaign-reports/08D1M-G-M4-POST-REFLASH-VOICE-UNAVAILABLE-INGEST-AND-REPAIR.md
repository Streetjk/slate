# Campaign 8D1M-G — Post-Reflash `Voice service unavailable`: Ingest, Re-Attribute, Repair

## Stage 1 checkpoint — post-reflash observer ingestion incomplete; durable value capture repaired

Recorded 2026-09-07 from the already-armed live PTY observer. The physical
attempt produced structural key markers for `VOICE_WS_CONNECT_START`,
`VOICE_WS_CONNECT_RESULT`, `VOICE_GENERIC_FAILURE_BRANCH`, and
`VOICE_MIC_STREAM_STARTED`, but the first observer emitted only marker names,
not their sanitized enum values. It therefore cannot prove whether the old
`WS_CONNECT_FAIL` branch persisted.

```text
POST_REFLASH_VOICE_SERVICE_UNAVAILABLE=YES
POST_REFLASH_FAILURE_INGESTED=YES_SANITIZED_KEYS_ONLY
POST_REFLASH_OLD_BRANCH_REPRODUCED=UNKNOWN
POST_REFLASH_FAILURE_STAGE=WS_CONNECT_MARKERS_PRESENT_VALUES_NOT_CAPTURED
POST_REFLASH_ROOT_CAUSE_CLASS=CASE_C_OBSERVER_VALUE_CAPTURE_INCOMPLETE
PREVIOUS_REPAIR_EFFECTIVE=INCONCLUSIVE
NEW_DOWNSTREAM_STAGE_REACHED=UNKNOWN
VOICE_WS_CONNECT_START=YES_MARKER
VOICE_WS_CONNECT_RESULT=UNKNOWN_VALUE
VOICE_GENERIC_FAILURE_BRANCH=UNKNOWN_VALUE
VOICE_SESSION_INIT_SENT=UNKNOWN
VOICE_MIC_STREAM_STARTED=UNKNOWN_VALUE
BACKEND_WS_UPGRADE=NO_SANITIZED_VOICE_MARKER_OBSERVED
PROVIDER_SESSION_CREATE_RESULT=NOT_OBSERVED
FIRST_MIC_FRAME_RECEIVED=UNKNOWN
SLATE_RESTART_COUNT=0
MYSQL_RESTART_COUNT=0
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
ACTIVE_BACKEND_IMAGE_ID=slate:overnight-observability-e0b89e0a
FIRMWARE_APP_SHA256=640ab435c9ec2f69ad4465520a712405bc28b7b0849a96b16fcb8685693716da
DEVICE_PORT_CONTINUITY=/dev/cu.usbmodem31201
RAW_CONTENT_RETAINED=NO
```

The old pre-fix branch is not reclassified from the identical user-facing
message. The first observer is retired. A durable repository observer repair
now extracts only allow-listed structural key/value enums, including the
actual `TRANSPORT_FAIL`/`OPEN`, `YES`/`NO`, and close-code values, while
discarding the source line. Its self-test passes:

```text
OBSERVER_REPAIR=scripts/slate-m4-sanitized-observer-v2.py
OBSERVER_REPAIR_SHA256=325f4f24f8c831b7fb0c342246bde678c49216de5dfe204b1de44158116559a6
OBSERVER_SELF_TEST=PASS
PRODUCTION_BYTES_CHANGED=NO
```

No further physical Voice AI attempt is authorized until this corrected
observer is re-armed and its readiness is proven.

## Live reconciliation at instruction issue

This instruction is issued after reconciling live PR #2 at:

```text
RECONCILED_PR_HEAD=2a953c01264512941609ce05dea3d730419836d3
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
HEAD_BRANCH=feature/gemini-35-live-evaluation
BASE_BRANCH=integration/note4-custom
MODE=FRONTIER_DRIVEN_LONGRUN
```

Before execution, re-fetch PR #2 and `docs/campaign-reports/CAMPAIGN-STATE.md` at the exact live head. If GitHub advanced, reconcile from the newer live frontier and preserve the intent of this instruction rather than replaying stale state.

Keep PR #2 **OPEN / DRAFT / UNMERGED**. Do not merge or release without explicit human authority.

`REPORT-PUSH-INVARIANT.md` and `AUTONOMY-AND-HUMAN-GATE-POLICY.md` remain binding.

## New operator result — physical boundary consumed

The exact ZAI-reviewed WebSocket repair was app-only flashed and hash-verified before this attempt:

```text
REVIEWED_FIRMWARE_APP_SHA256=640ab435c9ec2f69ad4465520a712405bc28b7b0849a96b16fcb8685693716da
FLASH_STATUS=PASS_EXACT_APP_ONLY_HASH_VERIFIED
FIRMWARE_FLASH_OFFSET=0x10000
FULL_ERASE=NO
POST_FLASH_REQUALIFICATION=PASS_BOOT_WIFI_POLLING_HEALTH
SANITIZED_OBSERVER=ARMED_LIVE_PTY
```

The operator has now performed the authorized post-reflash physical Voice AI attempt and reports:

```text
POST_REFLASH_VOICE_SERVICE_UNAVAILABLE=YES
```

Treat this as a new physical M4 failure event after the reviewed repair.

The prior `M4_COMBINED_PHYSICAL_EN_JA_SESSION` boundary is therefore consumed. Do **not** ask for another blind physical retry now.

The immediate frontier is technical observer ingestion and exact re-attribution.

Unless newer live evidence proves otherwise, reconcile toward:

```text
CURRENT_STAGE=M4_POST_REFLASH_VOICE_UNAVAILABLE_INGEST_AND_REATTRIBUTE
READY_NODE_COUNT>=1
READONLY_READY_NODE_COUNT>=0
WAITING_HUMAN_COUNT=0
HUMAN_ACTION_REQUIRED=NO
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
NEXT_ACTION=INGEST_POST_REFLASH_OBSERVERS_COMPARE_PRE_FIX_THEN_REPAIR_OR_ADVANCE_STAGE
```

## Primary question

Determine mechanically which of these is true:

### Case A — repaired transport failure is gone; failure moved downstream

The new firmware no longer produces the old:

```text
VOICE_WS_CONNECT_RESULT=TRANSPORT_FAIL
VOICE_GENERIC_FAILURE_BRANCH=WS_CONNECT_FAIL
```

and instead reaches one or more later stages such as:

```text
VOICE_WS_CONNECT_RESULT=OPEN
VOICE_SESSION_INIT_SENT=YES
backend WS upgrade/auth accepted
provider session creation
first microphone frame
```

If so, treat the previous lower-transport repair as effective and diagnose the **new downstream failure stage** independently. Do not reopen the old race merely because the user-facing message is identical.

### Case B — the exact old transport branch still occurs

The reviewed post-reflash firmware still produces:

```text
VOICE_WS_CONNECT_RESULT=TRANSPORT_FAIL
VOICE_GENERIC_FAILURE_BRANCH=WS_CONNECT_FAIL
```

before backend WS upgrade.

If so, the previous repair/regression proof was insufficient to eliminate the real field failure. Determine why, without assuming the previous causal hypothesis remains complete.

Possible classes to investigate mechanically include, but are not limited to:

- another pre-callback/receive-task race in the concrete lower transport;
- connect/handshake return semantics independent of callback registration;
- TLS/HTTP upgrade failure currently collapsed into generic `TRANSPORT_FAIL`;
- URL/host/SNI/certificate/network-path issue;
- disconnect/error callback sequencing;
- another exact `esp-ml307` lifecycle defect;
- configuration/identity/token path only if evidence actually points there.

Do not change credentials, model, provider, billing, OAuth/ADC, Calendar, Outlook, or private-data authority merely because `TRANSPORT_FAIL` persists.

### Case C — observer evidence is incomplete

If the post-reflash physical attempt did not leave enough sanitized structural evidence to distinguish Case A from Case B, do not request another physical retry yet.

Treat this as an observability reliability defect and create a READY software node for durable structural capture first.

## Stage 1 — ingest the post-reflash failure immediately

Correlate the exact latest physical failure window from all already-authorized, sanitized sources:

1. live PTY serial observer structural markers;
2. any bounded sanitized observer output/file/ring buffer produced for the session;
3. backend structural `VOICE_*` markers;
4. backend + MySQL health/restart state;
5. exact active backend image identity;
6. exact flashed firmware identity;
7. NOTE4 device/port continuity if available read-only without unnecessary probing.

Do not retain or publish:

- raw serial contents beyond approved structural enums;
- raw microphone audio;
- transcript text;
- provider payloads;
- API keys/tokens/credentials;
- auth headers;
- Calendar contents;
- Outlook contents;
- other private user content.

Extract where available:

```text
VOICE_CONFIG_REQUEST_START=
VOICE_CONFIG_RESULT=
VOICE_CONFIG_PARSE=

VOICE_WS_CONNECT_START=
VOICE_WS_CONNECT_RESULT=
VOICE_WS_CLOSE_CODE=
VOICE_GENERIC_FAILURE_BRANCH=

VOICE_SESSION_INIT_SENT=
VOICE_MIC_STREAM_STARTED=

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
ACTIVE_BACKEND_IMAGE_ID=
FIRMWARE_APP_SHA256=
DEVICE_PORT_CONTINUITY=
```

Record sanitized timestamps and stage-to-stage deltas sufficient to prove sequencing.

## Stage 2 — compare directly against the pre-fix failure

Use the previous exact observed branch as a baseline:

```text
PRE_FIX_SERIAL_MARKER=VOICE_WS_CONNECT_START
PRE_FIX_SERIAL_MARKER=VOICE_WS_CONNECT_RESULT=TRANSPORT_FAIL
PRE_FIX_SERIAL_MARKER=VOICE_GENERIC_FAILURE_BRANCH=WS_CONNECT_FAIL
PRE_FIX_SERIAL_MARKER=VOICE_MIC_STREAM_STARTED=NO
PRE_FIX_BACKEND_WS_UPGRADE=NOT_OBSERVED
PRE_FIX_PROVIDER_SESSION=NOT_OBSERVED
PRE_FIX_MIC_AUDIO_REACHED_PROVIDER=NO
```

Publish an explicit comparison:

```text
POST_REFLASH_OLD_BRANCH_REPRODUCED=YES|NO|UNKNOWN
POST_REFLASH_FAILURE_STAGE=
POST_REFLASH_ROOT_CAUSE_CLASS=
PREVIOUS_REPAIR_EFFECTIVE=YES|NO|INCONCLUSIVE
NEW_DOWNSTREAM_STAGE_REACHED=YES|NO|UNKNOWN
```

Do not infer success from a build/test/review PASS. The physical evidence is now authoritative for whether the old branch was eliminated on-device.

## Stage 3A — if the failure moved downstream

If the repaired firmware now opens the WebSocket or reaches a later stage, preserve the WebSocket repair and continue automatically from the first failing downstream stage.

Classify narrowly, for example:

```text
D = session-init/send failure after WebSocket open
E = WebSocket open then close/protocol failure before mic
F = provider-session creation failure
G = first-mic-frame path failure
H = another exact sanitized branch
```

Then:

```text
exact attribution
-> root-cause proof
-> same designated AGY gemini-3.8-flash-high minimal repair if production bytes must change
-> Codex deterministic validation
-> privacy/secret scan
-> impacted firmware/backend build only
-> exact identity freeze
-> fresh independent ZAI glm-5.3-flash review for every changed production byte
-> REVISE -> Codex adjudication -> AGY repair -> retest -> rebuild -> new exact freeze -> fresh ZAI rereview
-> repeat until PASS or genuine P0/P1/security/authority boundary
-> reviewed deployment/app-only reflash as actually required
-> zero-private-data post-change requalification
-> re-arm sanitized observers
```

Do not stop at implementation, test PASS/FAIL with bounded repair, review PASS/REVISE, build, flash, deployment, or report publication while READY/READONLY_READY work remains.

## Stage 3B — if the exact old WS_CONNECT_FAIL branch persists

Do not merely reapply the same patch.

Perform a deeper deterministic differential on the actual `esp-ml307` WebSocket/TCP/TLS path used by the device.

At minimum:

1. verify the flashed artifact really contains the reviewed repaired source behavior;
2. re-confirm exact managed-component source identity included in the built firmware;
3. trace `WebSocket::Connect`, `EspTcp::Connect`, `EspSsl::Connect`, receive-task start, callback assignment, send/receive, disconnect and return-value semantics;
4. identify what exact condition causes `Connect()` to return false in the field path;
5. determine whether TLS/HTTP/network errors are being collapsed into a generic false return and whether additional **sanitized structural enum instrumentation** is needed;
6. add only enough privacy-preserving observability to distinguish classes such as DNS/TCP/TLS/HTTP-upgrade/protocol/timeout/callback-close without exposing URLs containing secrets, headers, certificates, payloads, or credentials;
7. build deterministic host/mock regression(s) for the newly proven mechanism, not merely the previously fixed event-loss window.

If production bytes need another change, use the same designated AGY writer and exact ZAI reviewer loop.

Do not silently substitute writer/reviewer/model/provider.

## Stage 3C — if evidence is insufficient

If the live observer failed to capture enough structural markers from this post-reflash attempt:

- do not ask for another blind physical session;
- implement durable sanitized observer capture first;
- prefer a bounded ring buffer/file or fixed post-failure structural snapshot;
- include observer heartbeat/lifecycle proof;
- ensure the observer cannot retain private content;
- mechanically verify capture durability without a real provider/microphone session where possible.

If production bytes change, run AGY -> deterministic tests -> secret/privacy scan -> exact freeze -> fresh ZAI exact review -> reviewed app-only reflash/requalification before another physical attempt.

## Provider and authority constraints

This instruction does not authorize new credential/provider/model/billing/private-data changes.

Do not change:

- production Gemini model;
- provider;
- credentials;
- billing;
- OAuth/ADC authority;
- Calendar authority;
- Outlook authority;
- private-data authority.

Do not rerun completed containerd V6 migration, repartition NVMe, touch Deluge data, or delete rollback roots/images/backups.

Do not merge/release PR #2.

A new provider call or physical microphone session must not be consumed merely for diagnosis when the already-captured observer evidence and zero-provider deterministic work have not been exhausted.

## Final physical boundary rule

Only return to the operator for another physical M4 Voice AI attempt after all nonphysical work is exhausted and the exact current candidate has completed all required repair/test/review/reflash/requalification gates.

Before any such return, require:

```text
POST_REFLASH_FAILURE_INGESTED=YES
ROOT_CAUSE_CLASS=EXACT_OR_MAXIMALLY_SUPPORTED
SOURCE_DEFECT=PROVEN_OR_NO_SOURCE_CHANGE_REQUIRED
DETERMINISTIC_REGRESSION=PASS_IF_BYTES_CHANGED
IMPACTED_TESTS=PASS
PRIVACY_SECRET_SCAN=PASS
FRESH_ZAI_REVIEW=PASS_IF_BYTES_CHANGED
APP_ONLY_REFLASH=PASS_IF_BYTES_CHANGED
POST_FLASH_REQUALIFICATION=PASS_IF_REQUIRED
SANITIZED_OBSERVERS=ARMED_AND_MECHANICALLY_VERIFIED
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
```

Only then may `WAITING_HUMAN_COUNT=1` be set again.

## Campaign-state update requirement

The current top `CAMPAIGN-STATE.md` block still represents the now-consumed physical session boundary. Update it immediately when ingest begins.

Before any Codex exit, publish and push:

```text
CURRENT_HEAD=
CURRENT_STAGE=
POST_REFLASH_VOICE_SERVICE_UNAVAILABLE=
POST_REFLASH_FAILURE_INGESTED=
POST_REFLASH_OLD_BRANCH_REPRODUCED=
POST_REFLASH_FAILURE_STAGE=
POST_REFLASH_ROOT_CAUSE_CLASS=
PREVIOUS_REPAIR_EFFECTIVE=
NEW_DOWNSTREAM_STAGE_REACHED=
VOICE_WS_CONNECT_RESULT=
VOICE_GENERIC_FAILURE_BRANCH=
VOICE_SESSION_INIT_SENT=
VOICE_MIC_STREAM_STARTED=
BACKEND_WS_UPGRADE=
PROVIDER_SESSION_CREATE_RESULT=
FIRST_MIC_FRAME_RECEIVED=
ACTIVE_BACKEND_IMAGE_ID=
FIRMWARE_APP_SHA256=
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

Follow `REPORT-PUSH-INVARIANT.md`: update report/state, secret-safe check, commit, push, fetch/remote verify, record exact pushed SHA, verify PR #2 remains open/draft/unmerged, then continue automatically unless a genuine new human-only boundary is reached.
