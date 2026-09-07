# Campaign 8D1M-G — Reconnect NOTE4, Re-arm Corrected Observer, Then Instrumented Retest

## Stage 3 checkpoint — corrected observer live; one minimal instrumented attempt authorized

The same qualified NOTE4 was reconnected on a changed USB path and verified
read-only. No firmware write or persistent-device operation occurred.

```text
DEVICE_IDENTITY_VERIFIED=YES
DEVICE_PORT_CURRENT=/dev/cu.usbmodem31101
DEVICE_TARGET=ESP32-S3_REV_V0.2
DEVICE_FLASH_SIZE=16MB
DEVICE_FLASH_ID=46_4018
CORRECTED_OBSERVER_PROCESS=RUNNING
CORRECTED_OBSERVER_SERIAL_PORT_OPEN=YES
CORRECTED_OBSERVER_VALUE_CAPTURE_SELF_TEST=PASS
CORRECTED_OBSERVER_RAW_CONTENT_RETAINED=NO
BACKEND_SANITIZED_OBSERVER=RUNNING
BACKEND_HEALTH=PASS_LOCAL_200_PUBLIC_200
MYSQL_HEALTH=PASS_HEALTHY_RESTART_0
SLATE_HEALTH=PASS_HEALTHY_RESTART_0
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
```

All nonphysical work is exhausted. The next human action is exactly one
minimal instrumented Voice AI initiation, only to capture the earliest
failure branch. Do not perform a second question, EN/JA acceptance sequence,
Search, Calendar, Outlook, or any other tool action during this attempt.

## Live reconciliation at instruction issue

This instruction was issued after reconciling live PR #2 at:

```text
RECONCILED_PR_HEAD=7547a4086c20242c5ac9d33ed4722b700ad956f9
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
HEAD_BRANCH=feature/gemini-35-live-evaluation
BASE_BRANCH=integration/note4-custom
MODE=FRONTIER_DRIVEN_LONGRUN
```

Before execution, re-fetch PR #2 and `docs/campaign-reports/CAMPAIGN-STATE.md` at the exact current head. If GitHub has advanced, reconcile from the newer live frontier and preserve the intent of this instruction rather than replaying stale steps.

Keep PR #2 **OPEN / DRAFT / UNMERGED**. Do not merge or release without explicit human authority.

## Current exact problem

The already-completed post-reflash physical Voice AI attempt still displayed `Voice service unavailable`, but the observer active during that attempt retained allow-listed marker names without the marker values needed to classify the branch.

Current evidence therefore is:

```text
POST_REFLASH_VOICE_SERVICE_UNAVAILABLE=YES
POST_REFLASH_FAILURE_INGESTED=YES_SANITIZED_KEYS_ONLY
POST_REFLASH_OLD_BRANCH_REPRODUCED=UNKNOWN
POST_REFLASH_FAILURE_STAGE=WS_CONNECT_MARKERS_PRESENT_VALUES_NOT_CAPTURED
POST_REFLASH_ROOT_CAUSE_CLASS=CASE_C_OBSERVER_VALUE_CAPTURE_INCOMPLETE
PREVIOUS_REPAIR_EFFECTIVE=INCONCLUSIVE
NEW_DOWNSTREAM_STAGE_REACHED=UNKNOWN
VOICE_WS_CONNECT_RESULT=UNKNOWN_VALUE
VOICE_GENERIC_FAILURE_BRANCH=UNKNOWN_VALUE
VOICE_SESSION_INIT_SENT=UNKNOWN
VOICE_MIC_STREAM_STARTED=UNKNOWN_VALUE
BACKEND_WS_UPGRADE=NO_SANITIZED_VOICE_MARKER_OBSERVED
PROVIDER_SESSION_CREATE_RESULT=NOT_OBSERVED
FIRST_MIC_FRAME_RECEIVED=UNKNOWN
```

Do **not** reinterpret this as proof that the old WebSocket transport defect persists. The repaired firmware remains:

```text
FIRMWARE_APP_SHA256=640ab435c9ec2f69ad4465520a712405bc28b7b0849a96b16fcb8685693716da
FLASH_STATUS=PASS_EXACT_APP_ONLY_HASH_VERIFIED
POST_FLASH_REQUALIFICATION_STATUS=PASS_BOOT_WIFI_POLLING_HEALTH
ZAI_REVIEW_STATUS=PASS_EXACT_IDENTITIES
```

The durable corrected observer is:

```text
OBSERVER_REPAIR=scripts/slate-m4-sanitized-observer-v2.py
OBSERVER_REPAIR_SHA256=325f4f24f8c831b7fb0c342246bde678c49216de5dfe204b1de44158116559a6
OBSERVER_SELF_TEST=PASS
```

The current blocker is only that the previously qualified NOTE4 was disconnected before the corrected observer could be live-rearmed.

## Stage 1 — reconnect only the same qualified NOTE4

When the NOTE4 is physically reconnected:

1. enumerate serial devices read-only;
2. resolve the previously qualified NOTE4 identity;
3. require exact identity continuity with the previously qualified ESP32-S3 / 16 MB device;
4. do not flash, erase, repartition, reset NVS, reset pairing, or write persistent data;
5. do not start Voice AI yet;
6. do not consume a Gemini/provider session merely for reconnection or observer setup.

If the connected device identity does not match the previously qualified NOTE4, stop at a device-identity human boundary and do not write anything.

## Stage 2 — mechanically prove corrected observer live readiness

Start the corrected sanitized observer on the verified NOTE4 and prove it is actually live before asking for another physical Voice AI interaction.

Required proof:

```text
DEVICE_IDENTITY_VERIFIED=YES
CORRECTED_OBSERVER_PROCESS=RUNNING
CORRECTED_OBSERVER_SERIAL_PORT_OPEN=YES
CORRECTED_OBSERVER_VALUE_CAPTURE_SELF_TEST=PASS
CORRECTED_OBSERVER_RAW_CONTENT_RETAINED=NO
BACKEND_SANITIZED_OBSERVER=RUNNING
BACKEND_HEALTH=PASS
MYSQL_HEALTH=PASS
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
```

The observer must preserve only approved structural keys/enums/counters/timestamps and must not retain raw serial lines, raw audio, transcripts, provider payloads, credentials, auth headers, Calendar content, Outlook content, or private message content.

If observer live readiness fails, repair the observer/harness autonomously and repeat its self-test/rearm. Do not ask for a Voice retry while the observer is unproven.

## Stage 3 — one minimal instrumented physical Voice AI attempt only after observer proof

Once Stage 2 is mechanically PASS and no other nonphysical READY/READONLY_READY work remains, the next human boundary may be exactly one minimal Voice AI initiation sufficient to reproduce or clear the failure.

This is not a blind retry. It exists specifically because the previous event cannot be attributed from retained evidence.

The controller must first publish a checkpoint stating:

```text
CORRECTED_OBSERVER_LIVE=YES
PHYSICAL_RETEST_PURPOSE=CAPTURE_EXACT_POST_REFLASH_FAILURE_BRANCH
NO_REFLASH_REQUIRED=YES
NO_PROVIDER_SUBSTITUTION=YES
WAITING_HUMAN_COUNT=1
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=ONE_MINIMAL_INSTRUMENTED_VOICE_AI_ATTEMPT
```

Do not require EN/JA conversational validation yet if the generic failure occurs before a usable session opens. First capture the earliest failing branch.

## Stage 4 — immediately ingest the instrumented result

After the single instrumented attempt, do not ask the human for another retry. Ingest the corrected observer evidence and extract, where available:

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
FIRST_MIC_FRAME_RECEIVED=
```

Then classify mechanically:

### Case A — old branch persists

If:

```text
VOICE_WS_CONNECT_RESULT=TRANSPORT_FAIL
VOICE_GENERIC_FAILURE_BRANCH=WS_CONNECT_FAIL
```

then record:

```text
POST_REFLASH_OLD_BRANCH_REPRODUCED=YES
PREVIOUS_REPAIR_EFFECTIVE=NO_OR_INCOMPLETE
```

Do not assume the same race mechanism. Re-trace the exact current repaired transport path and distinguish:

- repair not executing in the active binary;
- another pre-upgrade transport failure;
- TLS/DNS/socket/handshake failure;
- callback lifetime/concurrency issue;
- backend endpoint reachability/config issue;
- other deterministic lower-transport cause.

Only after proving the new exact defect may production bytes change.

### Case B — WebSocket progresses further

If WebSocket connect/auth/open now succeeds, record the earliest downstream failure stage and treat the previous transport repair as effective for the originally proven defect.

Examples include:

- config/auth/parse failure;
- WebSocket upgrade/auth accepted but session init fails;
- provider session creation fails;
- microphone stream never starts;
- first microphone frame never reaches backend/provider;
- immediate close/error after open.

Do not regress to the old transport diagnosis merely because the same generic UI message is displayed.

## Stage 5 — autonomous repair loop after exact attribution

If source repair is required:

1. prove the exact defect mechanically;
2. use the same designated AGY `gemini-3.8-flash-high` writer route for production-byte edits;
3. make the minimum bounded repair only;
4. add/run the narrow deterministic regression first;
5. run impacted firmware/no-vendor tests and applicable static/format checks;
6. perform privacy/secret scan;
7. rebuild impacted firmware only;
8. freeze exact source/regression/artifact hashes;
9. obtain fresh exact independent ZAI `glm-5.3-flash` review for any changed production bytes;
10. on ZAI `REVISE`, loop automatically through Codex adjudication -> same AGY repair -> retest -> rebuild -> exact rereview;
11. after PASS, perform only the already-established app-only reflash path if current authority still covers it; otherwise stop only at the genuine firmware-write authority boundary;
12. post-flash requalify and re-arm corrected observers before another physical attempt.

Do not silently substitute writer, reviewer, provider, model, credential path, or billing route.

## Stage 6 — campaign continuation rules

A test failure, reviewer REVISE, transient tool/provider failure with bounded recovery, report push, build completion, observer repair, or intermediate checkpoint is not terminal while useful READY/READONLY_READY work remains.

Do not rerun completed containerd migration work, repartition NVMe, touch Deluge data, delete rollback roots/images/backups, full-erase the NOTE4, or alter production Gemini model/provider/credentials/billing/OAuth/ADC/Calendar/Outlook/private-data authority.

Before any controller exit publish and push the durable state required by `REPORT-PUSH-INVARIANT.md`, including:

```text
CURRENT_HEAD=
CURRENT_STAGE=
POST_REFLASH_OLD_BRANCH_REPRODUCED=
PREVIOUS_REPAIR_EFFECTIVE=
EARLIEST_FAILURE_STAGE=
VOICE_WS_CONNECT_RESULT=
VOICE_GENERIC_FAILURE_BRANCH=
VOICE_WS_ACCEPTED=
PROVIDER_SESSION_CREATE_RESULT=
VOICE_MIC_STREAM_STARTED=
FIRST_MIC_FRAME_RECEIVED=
AGY_STATUS=
REGRESSION_STATUS=
ZAI_STATUS=
FIRMWARE_APP_SHA256=
FLASH_STATUS=
CORRECTED_OBSERVER_STATUS=
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

If NOTE4 remains disconnected, the only valid immediate boundary is:

```text
WAITING_DEVICE_COUNT=1
WAITING_HUMAN_COUNT=1
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=RECONNECT_THE_SAME_QUALIFIED_NOTE4_FOR_CORRECTED_OBSERVER_REARM_ONLY
```

No Voice AI interaction is requested until the corrected observer is mechanically proven live.
