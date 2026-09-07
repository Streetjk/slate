# Campaign 8D1M-G — WebSocket Root-Cause Proof + AGY Writer Recovery

## Authority and live-state rule

This instruction was issued after reconciling live PR #2 at:

```text
ISSUED_AGAINST_HEAD=5ffd16d8a2625748a6ac83fb1552af4b80d91302
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

## Current established evidence

The second physical M4 attempt is already complete. Do **not** ask the operator for another blind Voice AI retry now.

The live sanitized observer established:

```text
VOICE_WS_CONNECT_START=YES
VOICE_WS_CONNECT_RESULT=TRANSPORT_FAIL
FIRMWARE_GENERIC_FAILURE_BRANCH=WS_CONNECT_FAIL
VOICE_MIC_STREAM_STARTED=NO
BACKEND_WS_UPGRADE_DURING_SECOND_ATTEMPT=NOT_OBSERVED
PROVIDER_SESSION_CREATE_DURING_SECOND_ATTEMPT=NOT_OBSERVED
MIC_AUDIO_REACHED_PROVIDER=NO
FAILURE_STAGE=FIRMWARE_WEBSOCKET_TRANSPORT_OR_HANDSHAKE_BEFORE_BACKEND_UPGRADE
ROOT_CAUSE_CLASS=CASE_H_FIRMWARE_WEBSOCKET_TRANSPORT_FAILURE_BEFORE_BACKEND_UPGRADE
```

This attribution is strong enough to continue technical investigation without another physical test.

The previous designated AGY implementation attempt timed out and produced no tracked source-byte change:

```text
AGY_IMPLEMENTATION_STATUS=EXTERNALLY_BLOCKED_TIMEOUT
SOURCE_BYTES_CHANGED=NO
HUMAN_ACTION_REQUIRED=NO
NEXT_ACTION=RECOVER_DESIGNATED_AGY_WRITER_ROUTE_THEN_APPLY_BOUNDED_REPAIR
```

A transient writer timeout is not, by itself, a human authority boundary.

## Critical root-cause correction before any production edit

The current report states that static inspection proved the WebSocket receive callback is installed after the handshake request is sent.

Do **not** treat that statement as fully proven yet at the Slate wrapper layer.

At the current branch, `firmware/main/xiaozhi/protocol/websocket_protocol.cc` visibly registers:

```text
websocket->OnData(...)
websocket->OnDisconnected(...)
websocket->OnError(...)
```

before:

```text
websocket->Connect(cfg.url.c_str())
```

Therefore the defect, if it truly is callback/handler ordering, must be proven in the concrete lower transport implementation used by `EspNetwork::CreateWebSocket(1)` or in another exact call path. Do not ask AGY to patch production bytes from a root-cause assertion that has not been traced to a concrete function/source location.

## Stage 1 — mechanically prove the actual transport defect

Perform read-only source/provenance tracing first.

1. Resolve the exact concrete WebSocket implementation returned by:

```text
EspNetwork::CreateWebSocket(1)
```

2. Resolve the exact dependency/component version and source identity used by the qualified firmware build.

3. Trace the concrete `Connect()` implementation through the transport startup/handshake path.

4. Determine the exact ordering of:

```text
application OnData/OnDisconnected/OnError callback assignment
-> lower-level event/callback registration
-> websocket client initialization
-> websocket client start / HTTP upgrade request
-> first possible received handshake/server event
```

5. If the earlier callback-order hypothesis is correct, record the exact offending:

```text
SOURCE_COMPONENT=
SOURCE_FILE=
SOURCE_FUNCTION=
SOURCE_VERSION_OR_SHA=
OFFENDING_ORDER=
MECHANICAL_FAILURE_MECHANISM=
```

6. If it is not correct, revise `SOURCE_DEFECT` and identify the narrowest alternative supported by evidence. Do not preserve a convenient but contradicted root cause.

7. Prefer deterministic inspection/tests over additional live provider calls. No Gemini provider call is needed for this stage.

Publish the proof into the campaign report before changing production bytes.

## Stage 2 — recover the designated AGY writer route

Implementation writer remains the existing designated AGY Gemini 3.8 Flash route. Preserve the existing provider/model identity and the prior high-effort mode if that is how the active route is configured.

Do not silently substitute Codex, Claude, ZAI, Grok, another Gemini model, another provider, or another credential path as production implementation writer.

Perform bounded same-writer recovery:

1. Check AGY route/process/session health using non-secret diagnostics only.
2. Check whether the previous timeout left a stale process/session and clean up only the exact disposable/stale AGY execution state if safe.
3. Do not expose OAuth tokens, API keys, cookies, auth headers, or credential contents.
4. Reinvoke the **same designated AGY writer route** with a smaller self-contained task containing:
   - exact proven source location;
   - exact failure mechanism;
   - minimal allowed file scope;
   - required deterministic regression test;
   - explicit prohibition on unrelated refactors.
5. If the same route times out again, perform another bounded same-route recovery only if the existing AGY failure policy permits it. Do not vary provider/model/credentials merely to get a response.
6. While the writer route is recovering, continue any independent READY/READONLY_READY work that does not require production-byte authorship.

Only report an external writer-route block after bounded same-route recovery is genuinely exhausted and no other useful READY/READONLY_READY node remains.

## Stage 3 — minimal repair, only after root-cause proof

If Stage 1 proves a production source defect, instruct AGY to make the minimum bounded repair required to eliminate it.

Requirements:

- no production Gemini model change;
- no provider change;
- no credential change;
- no billing change;
- no OAuth/ADC authority change;
- no Calendar authority expansion;
- no Outlook authority expansion;
- no private-data authority expansion;
- no unrelated firmware cleanup/refactor;
- preserve NOTE4 identity, NVS, pairing, bootloader, partition table and user data;
- retain privacy-preserving structural observability.

The repair must include a deterministic regression test or harness that specifically proves the previously failing ordering/race condition cannot discard an immediate handshake/server event.

A generic compile PASS is insufficient proof.

If Stage 1 disproves the callback-order hypothesis, AGY must repair only the newly proven exact defect.

## Stage 4 — deterministic validation

After AGY returns a patch:

1. Codex adjudicates the patch against the exact Stage 1 proof.
2. Run the narrow regression test first.
3. Run impacted firmware tests and the existing no-vendor dependency test.
4. Run format/lint/static checks applicable to changed files.
5. Perform privacy/secret scan.
6. Confirm no backend/model/provider/credential/billing authority drift.
7. Build the impacted firmware artifact only.
8. Record exact source commit and firmware artifact identity/hash.

On deterministic failure, continue automatically:

```text
failure evidence
-> Codex adjudication
-> same designated AGY writer repair
-> deterministic retest
```

Do not return control merely because a test failed when a bounded repair remains available.

## Stage 5 — fresh exact ZAI review for changed production bytes

Any production-byte change invalidates the prior review verdict for those bytes.

Use the existing independent reviewer only:

```text
REVIEWER=ZAI glm-5.3-flash
```

Review must:

- be fresh and independent;
- target the exact frozen changed source/artifact bundle;
- bind verdict to exact SHA256;
- inspect the root-cause proof and regression evidence;
- check privacy/security and unintended scope expansion.

If verdict is `REVISE`, continue automatically:

```text
ZAI findings
-> Codex adjudication
-> designated AGY repair
-> deterministic validation
-> privacy/secret scan
-> rebuild impacted artifact
-> new exact freeze
-> fresh ZAI rereview
```

Repeat until PASS or a genuine unresolved P0/P1/security/authority boundary exists.

Do not treat reviewer `REVISE`, reviewer timeout with bounded same-reviewer recovery, or reviewer PASS as terminal campaign events.

## Stage 6 — reviewed app-only reflash and requalification if firmware bytes changed

If the exact reviewed firmware bytes changed and existing campaign authority still permits continuation:

1. verify NOTE4 identity read-only immediately before flash;
2. use app-only flash at the established application offset;
3. do not full-erase;
4. preserve bootloader, partition table, NVS, pairing, LittleFS/user data and device identity;
5. verify clean boot/Wi-Fi and absence of fatal markers;
6. confirm backend/MySQL health and restart counts remain acceptable;
7. arm sanitized firmware/backend observers again.

Do not rerun the completed containerd V6 migration, repartition NVMe, touch Deluge data, or delete rollback roots/images/backups.

## Stage 7 — only then return to a physical M4 boundary

Only after all of the following are true may another physical Voice AI attempt become `WAITING_HUMAN_COUNT=1`:

```text
ROOT_CAUSE_PROOF=PASS
AGY_REPAIR=COMPLETE_OR_NOT_REQUIRED
DETERMINISTIC_REGRESSION=PASS
IMPACTED_TESTS=PASS
PRIVACY_SECRET_SCAN=PASS
FRESH_ZAI_REVIEW=PASS_IF_BYTES_CHANGED
REVIEWED_APP_ONLY_REFLASH=PASS_IF_REQUIRED
POST_FLASH_REQUALIFICATION=PASS_IF_REQUIRED
SANITIZED_OBSERVERS=ARMED_AND_MECHANICALLY_VERIFIED
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
```

Do not ask the operator for a third Voice AI retry before these conditions are met.

## Campaign-state reconciliation requirement

The current `CAMPAIGN-STATE.md` top block still represents the pre-recovery writer timeout checkpoint. Update the authoritative top frontier when this work advances.

Before any Codex exit, publish:

```text
CURRENT_HEAD=
CURRENT_STAGE=
ROOT_CAUSE_CLASS=
SOURCE_DEFECT=
SOURCE_COMPONENT=
SOURCE_FILE=
SOURCE_FUNCTION=
SOURCE_VERSION_OR_SHA=
AGY_IMPLEMENTATION_STATUS=
SOURCE_BYTES_CHANGED=
REGRESSION_TEST_STATUS=
ZAI_REVIEW_STATUS=
FIRMWARE_APP_SHA256=
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

Under `FRONTIER_DRIVEN_LONGRUN`, do not exit while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0` unless an actual safety/authority conflict prevents continuation.

A single blocked AGY node does not convert the whole campaign into a human stop while other safe technical work exists.

## Expected immediate next action

```text
NEXT_ACTION=TRACE_CONCRETE_WEBSOCKET_TRANSPORT_AND_PROVE_EXACT_DEFECT_THEN_RECOVER_SAME_AGY_WRITER_AND_APPLY_MINIMAL_REPAIR
HUMAN_ACTION_REQUIRED=NO
WAITING_HUMAN_COUNT=0
```
