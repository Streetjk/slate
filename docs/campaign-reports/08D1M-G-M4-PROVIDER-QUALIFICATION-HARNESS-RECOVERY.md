# Campaign 8D1M-G M4 — provider qualification harness recovery before any second live session

## Purpose

The exact reviewed backend candidate `b0606b6beb22a21b49570c17c323a64d486c38c9` is now deployed and healthy, but the single authorized synthetic EN/JA provider qualification attempt was consumed without a sanitized completion record. The result is therefore ambiguous, not PASS and not a demonstrated product failure.

Do not spend another provider session until the qualification path itself is made mechanically self-evidencing and fail-closed.

This directive is controlled by and preserves:

- `docs/campaign-reports/08D1M-G-M4-LONG-CONTINUOUS-CAMPAIGN.md`
- `docs/campaign-reports/AUTONOMY-AND-HUMAN-GATE-POLICY.md`
- `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`
- `docs/campaign-reports/08D1M-G-M4-PHYSICAL-SOAK-CONSUMED-INPUT-LATENCY-ASR-FOLLOWUP.md`

PR #2 must remain OPEN / DRAFT / UNMERGED.

## Activation snapshot

```text
MODE=FRONTIER_DRIVEN_LONGRUN
LIVE_HEAD_AT_ACTIVATION=7c535e56bb06c635b4152ac9e2c93b58fac19903
PR_NUMBER=2
PR_STATE_REQUIRED=OPEN
PR_DRAFT_REQUIRED=YES
PR_MERGED_REQUIRED=NO
DEPLOYED_PRODUCT_SOURCE=b0606b6beb22a21b49570c17c323a64d486c38c9
DEPLOYED_BACKEND_TAG=slate:m4-asr-input-repaired
FIRMWARE_CHANGED=NO
FIRMWARE_FLASHED=NO
PROVIDER_QUALIFICATION_SESSION_ATTEMPTS=1
PROVIDER_QUALIFICATION_SESSION_MAX_ALREADY_CONSUMED=1
PROVIDER_RETRY_AUTHORIZED=NO
PROVIDER_QUALIFICATION_RESULT=AMBIGUOUS_NO_SANITIZED_COMPLETION
```

The current `CAMPAIGN-STATE.md` says zero-provider work may continue but also reports `READY_NODE_COUNT=0` and `READONLY_READY_NODE_COUNT=0`. That work-queue state is inconsistent with the remaining safe harness diagnosis. Correct the frontier so zero-provider harness recovery is represented as READY or READONLY_READY until it is actually exhausted.

## Immediate rule

Do **not** request or consume a second provider session yet.

Do not perform another physical NOTE4 session, reset, re-pair, firmware flash, Wi-Fi change, Gemini model/provider/auth change, credential change, billing change, private-data expansion, Calendar/Outlook action, merge or release.

Keep the currently deployed reviewed backend candidate in place while it remains healthy. No redeploy/restart is required merely to diagnose the qualification harness.

## Reconstruct the consumed attempt mechanically

Recover the exact sanitized execution path of the consumed qualification attempt without exposing or retaining raw transcript/audio/credentials/provider payloads.

Determine, where available:

```text
QUALIFICATION_DRIVER_IDENTITY=
QUALIFICATION_DRIVER_COMMAND_CLASS=
QUALIFICATION_DRIVER_SOURCE_OR_INLINE_SCRIPT_IDENTITY=
DRIVER_START_OBSERVED=
DRIVER_PROCESS_EXIT_OBSERVED=
DRIVER_EXIT_CLASS=
DRIVER_TIMEOUT_OR_KILL_CLASS=
CHILD_NODE_BRIDGE_START_OBSERVED=
CHILD_NODE_BRIDGE_EXIT_OBSERVED=
PROVIDER_CONNECT_ATTEMPT_OBSERVED=
PROVIDER_SESSION_ESTABLISHED_OBSERVED=
FIRST_SYNTHETIC_AUDIO_SENT_OBSERVED=
END_AUDIO_OR_TURN_COMMIT_OBSERVED=
FIRST_INPUT_TRANSCRIPTION_EVENT_OBSERVED=
FIRST_PROVIDER_OUTPUT_EVENT_OBSERVED=
PROVIDER_ERROR_CLASS=
WS_OR_STREAM_CLOSE_CLASS=
TERMINAL_COMPLETION_MARKER_EXPECTED=
TERMINAL_COMPLETION_MARKER_EMITTED=NO
EARLIEST_MISSING_OR_FAILED_BOUNDARY=
```

Inspect the exact driver/harness implementation or inline invocation that was used. Distinguish at minimum among:

1. driver never implemented a terminal completion marker;
2. terminal marker existed but a success/error/timeout branch bypassed it;
3. stdout/stderr buffering or process termination lost the marker;
4. child Node bridge remained open and the parent timed out;
5. provider connect/session setup never completed;
6. synthetic audio/turn-end was never delivered;
7. provider returned an error that the driver swallowed or failed to sanitize;
8. provider events occurred but the driver had no bounded success predicate;
9. external timeout/SSH/session termination interrupted otherwise valid execution.

Do not call the provider to resolve these questions.

## Build a fail-closed qualification harness

Before another provider authority is requested, make the qualification harness deterministic under mocks/replays/provider-disabled execution.

The next live qualification must always end in exactly one sanitized terminal class, for example:

```text
QUALIFICATION_TERMINAL=PASS
QUALIFICATION_TERMINAL=FAIL_CONFIG
QUALIFICATION_TERMINAL=FAIL_CONNECT
QUALIFICATION_TERMINAL=FAIL_SESSION_SETUP
QUALIFICATION_TERMINAL=FAIL_AUDIO_SEND
QUALIFICATION_TERMINAL=FAIL_NO_INPUT_TRANSCRIPTION
QUALIFICATION_TERMINAL=FAIL_LANGUAGE_EXPECTATION
QUALIFICATION_TERMINAL=FAIL_NO_PROVIDER_OUTPUT
QUALIFICATION_TERMINAL=FAIL_PROTOCOL
QUALIFICATION_TERMINAL=TIMEOUT
QUALIFICATION_TERMINAL=DRIVER_ERROR
```

No execution path may terminate silently or without a terminal class.

The harness must also emit only sanitized structural evidence needed for the actual hypothesis, including where supported:

```text
PROVIDER_SESSION_ESTABLISHED=YES|NO
INPUT_TRANSCRIPTION_HINT=en-US;ja-JP
EN_TRANSCRIPTION_EVENT_SEEN=YES|NO
JA_TRANSCRIPTION_EVENT_SEEN=YES|NO
EN_LANGUAGE_EXPECTATION_MET=YES|NO|UNKNOWN
JA_LANGUAGE_EXPECTATION_MET=YES|NO|UNKNOWN
T_AUDIO_INPUT_COMMIT_OR_TURN_END=
T_PROVIDER_INPUT_TRANSCRIPTION_FIRST_PARTIAL=
T_PROVIDER_READY=
T_PROVIDER_FIRST_OUTPUT=
ASSISTANT_OUTPUT_EVENT_SEEN=YES|NO
```

Never print transcript text, generated audio, request/response payloads, credentials, auth headers, protected secret contents, device identity, private NOTE4 data, Calendar or Outlook content.

## Route fidelity

The previous attempt used a direct synthetic driver and therefore could not capture Slate WebSocket/backend bubble timing. For the next live qualification, determine the narrowest route that actually validates the intended deployed production behavior.

Prefer a harness that exercises the deployed `node_bridge` and Slate voice-session path sufficiently to observe the production input-transcription configuration and new structural timing markers, while still using synthetic/non-sensitive audio and no physical microphone.

If direct provider/bridge qualification is still the correct first stage, state exactly what it can and cannot prove. Do not claim backend bubble timing from a route that bypasses Slate WebSocket/session handling.

## Deterministic validation

Add tests/replays that prove terminal accounting for every important branch:

- success;
- connect/session failure;
- input-transcription absent;
- provider output absent;
- provider error;
- child-process exit;
- timeout;
- malformed structural event;
- EN/JA hint present;
- privacy redaction/no raw content.

Run relevant typecheck/lint/format, `git diff --check`, and privacy/secret scans.

If harness-only code changes do not modify deployed product bytes, preserve the deployed product artifact identity. Do not redeploy merely because the qualification harness changed.

If production runtime bytes do change during diagnosis, fully qualify/freeze/review them before any new deployment authority is requested.

Use Grok 4.6 as the canonical independent reviewer for any material harness or product qualification change that could cause a false PASS/FAIL decision:

`grok -m grok-4.6`

No ZAI retry and no silent reviewer fallback.

## Decision after zero-provider recovery

Only after the harness can prove deterministic terminal accounting without the provider may Codex decide whether another live provider session is genuinely required.

If no further provider session is needed, continue automatically.

If one further provider session is genuinely required, publish a fully bounded authority request containing:

```text
QUALIFICATION_HARNESS_SOURCE_SHA=
QUALIFICATION_HARNESS_REVIEW_STATUS=
DEPLOYED_PRODUCT_SOURCE=b0606b6beb22a21b49570c17c323a64d486c38c9
DEPLOYED_PRODUCT_CHANGED_SINCE_REVIEW=NO|YES
PROVIDER_SESSION_MAX_REQUESTED=1
EXACT_HYPOTHESIS=
EXACT_SUCCESS_PREDICATE=
EXACT_FAILURE_PREDICATE=
EXPECTED_SANITIZED_TERMINAL_MARKER=
EN_JA_TEST_SCOPE=
PRIVATE_DATA_SCOPE=NONE_SYNTHETIC_ONLY
PHYSICAL_DEVICE_ACTION=NONE
FIRMWARE_ACTION=NONE
```

Do not ask for an open-ended retry pool.

## Work-queue invariant

Until zero-provider harness recovery is exhausted, the frontier must not report both `READY_NODE_COUNT=0` and `READONLY_READY_NODE_COUNT=0` while simultaneously saying `NEXT_ACTION=CONTINUE_ZERO_PROVIDER_DIAGNOSIS`.

Before controller exit publish:

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

Rules:

- if READY > 0, continue;
- if READONLY_READY > 0, continue;
- no provider retry is authorized by this directive;
- no physical NOTE4 test is authorized by this directive;
- report push/review/test success is not a stop while safe zero-provider work remains;
- keep PR #2 OPEN / DRAFT / UNMERGED;
- do not expand into Campaign 9 / PR #3.

## Immediate next action

Reconcile the live branch and exact deployed runtime, then diagnose and harden the provider qualification harness entirely provider-disabled. Continue until either the ambiguity is resolved without another live session or a single fully bounded, mechanically self-evidencing provider qualification session is genuinely the only remaining useful node.

## Provider-disabled recovery checkpoint — 2026-09-09

```text
LIVE_PR_HEAD_AT_RECONCILIATION=10d4d1620ca77dd19be014227a8706666a517d56
HARNESS_SOURCE_COMMIT=1edf33e578030c60d12a20b04ea271b58266195d
HARNESS_FILES=scripts/slate-m4-provider-qualification-harness.mjs;scripts/slate-m4-provider-qualification-harness.test.mjs
HARNESS_REVIEW_STATUS=PASS_GROK_4_6
HARNESS_REVIEW_FINDINGS=P0_0_P1_0_P2_0_SECURITY_0
HARNESS_DETERMINISTIC_TESTS=PASS_15
DEPLOYED_PRODUCT_SOURCE=b0606b6beb22a21b49570c17c323a64d486c38c9
DEPLOYED_PRODUCT_CHANGED_SINCE_REVIEW=NO
PROVIDER_SESSION_USED_FOR_RECOVERY=NO
```

The consumed attempt was reconstructed only from durable GitHub evidence. The
exact inline driver source and process-level observer record were not retained,
so unavailable milestones remain `UNKNOWN_NOT_DURABLY_OBSERVED`; no provider
call was made to fill them in:

```text
QUALIFICATION_DRIVER_IDENTITY=UNAVAILABLE_NOT_DURABLY_RECORDED
QUALIFICATION_DRIVER_COMMAND_CLASS=DIRECT_SYNTHETIC_BRIDGE_DRIVER_REPORT_SUPPORTED
QUALIFICATION_DRIVER_SOURCE_OR_INLINE_SCRIPT_IDENTITY=UNAVAILABLE_NOT_DURABLY_RECORDED
DRIVER_START_OBSERVED=UNKNOWN_NOT_DURABLY_OBSERVED
DRIVER_PROCESS_EXIT_OBSERVED=UNKNOWN_NOT_DURABLY_OBSERVED
DRIVER_EXIT_CLASS=UNKNOWN_NOT_DURABLY_OBSERVED
DRIVER_TIMEOUT_OR_KILL_CLASS=UNKNOWN_NOT_DURABLY_OBSERVED
CHILD_NODE_BRIDGE_START_OBSERVED=UNKNOWN_NOT_DURABLY_OBSERVED
CHILD_NODE_BRIDGE_EXIT_OBSERVED=UNKNOWN_NOT_DURABLY_OBSERVED
PROVIDER_CONNECT_ATTEMPT_OBSERVED=UNKNOWN_NOT_DURABLY_OBSERVED
PROVIDER_SESSION_ESTABLISHED_OBSERVED=UNKNOWN_NOT_DURABLY_OBSERVED
FIRST_SYNTHETIC_AUDIO_SENT_OBSERVED=UNKNOWN_NOT_DURABLY_OBSERVED
END_AUDIO_OR_TURN_COMMIT_OBSERVED=UNKNOWN_NOT_DURABLY_OBSERVED
FIRST_INPUT_TRANSCRIPTION_EVENT_OBSERVED=UNKNOWN_NOT_DURABLY_OBSERVED
FIRST_PROVIDER_OUTPUT_EVENT_OBSERVED=UNKNOWN_NOT_DURABLY_OBSERVED
PROVIDER_ERROR_CLASS=UNKNOWN_NOT_DURABLY_OBSERVED
WS_OR_STREAM_CLOSE_CLASS=UNKNOWN_NOT_DURABLY_OBSERVED
TERMINAL_COMPLETION_MARKER_EXPECTED=UNKNOWN_NOT_DURABLY_OBSERVED
TERMINAL_COMPLETION_MARKER_EMITTED=NO
EARLIEST_MISSING_OR_FAILED_BOUNDARY=DRIVER_TERMINAL_ACCOUNTING_AND_SANITIZED_COMPLETION
```

The durable evidence supports an ambiguous direct-driver termination, not a
provider failure. It does not distinguish marker design, buffering, child
liveness, provider setup, synthetic audio delivery, swallowed provider errors,
or SSH/session interruption; those remain explicitly unknown.

The recovery harness is provider-disabled and allowlist-sanitizes structural
events. It requires the exact EN turn followed by the exact JA turn, both audio
and end markers, input transcription and language expectation, provider output,
turn completion, a clean child exit, and rejects duplicate or post-exit events.
Every CLI/library path emits one terminal class and failure paths exit nonzero.
The 15 focused tests cover success, all required failure classes, malformed
input, signal/crash buffering, hint/language binding, child lifecycle and
privacy redaction. `node --check`, focused tests and `git diff --check` passed.

Grok 4.6 independently reviewed the exact staged harness and tests at the
checkpoint above and returned:

```text
VERDICT=PASS
P0=0 P1=0 P2=0 SECURITY=0
```

The direct synthetic bridge route is the narrowest eventual route currently
available without private data or a physical device. It can prove bridge
startup, provider connection/session setup, the `en-US;ja-JP` hint reaching the
driver boundary, input-transcription events, provider readiness/output and
terminal accounting. It cannot prove Slate WebSocket authentication/backend
transcript flush, user-bubble timing, or firmware UI/audio behaviour when it
bypasses the Slate session. Any eventual live qualification must label those
limits and must not claim backend timing from direct-driver evidence.

Zero-provider recovery is exhausted. A second live provider session is now the
sole remaining useful node for testing the deployed provider behaviour and
bilingual input hypothesis, but it is not authorized by the consumed one-session
budget. No physical action, product redeploy, firmware flash or provider retry
was performed in this checkpoint. The exact bounded request is:

```text
QUALIFICATION_HARNESS_SOURCE_SHA=1edf33e578030c60d12a20b04ea271b58266195d
QUALIFICATION_HARNESS_REVIEW_STATUS=PASS_GROK_4_6
DEPLOYED_PRODUCT_SOURCE=b0606b6beb22a21b49570c17c323a64d486c38c9
DEPLOYED_PRODUCT_CHANGED_SINCE_REVIEW=NO
PROVIDER_SESSION_MAX_REQUESTED=1
EXACT_HYPOTHESIS=THE_RECOVERED_FAIL_CLOSED_ROUTE_WILL_ACCOUNT_FOR_ONE_SYNTHETIC_EN_JA_SESSION_AND_REVEAL_WHETHER_INPUT_TRANSCRIPTION_HINT_AND_INPUT_LATENCY_BOUNDARIES_ARE_PRESENT
EXACT_SUCCESS_PREDICATE=ONE_TERMINAL_QUALIFICATION_TERMINAL_PASS_WITH_CLEAN_CHILD_EXIT;EN_TURN_1_AND_JA_TURN_2_INPUT_EVENTS_AND_LANGUAGE_EXPECTATIONS;PROVIDER_OUTPUT_AND_TURN_COMPLETION_FOR_BOTH;NO_TIMEOUT_ERROR_MALFORMED_DUPLICATE_OR_POST_EXIT_EVENT
EXACT_FAILURE_PREDICATE=ONE_TERMINAL_SANITIZED_NONPASS_CLASS_FOR_ANY_MISSING_CONFIG_CONNECT_SESSION_AUDIO_INPUT_LANGUAGE_OUTPUT_PROTOCOL_TIMEOUT_OR_DRIVER_BOUNDARY
EXPECTED_SANITIZED_TERMINAL_MARKER=QUALIFICATION_TERMINAL=PASS_OR_ONE_EXACT_FAIL_CLASS
EN_JA_TEST_SCOPE=ONE_SYNTHETIC_NON_SENSITIVE_EN_THEN_JA_SESSION;HINT=en-US;ja-JP;NO_TRANSLATION_OR_TRANSCRIPT_REWRITE
PRIVATE_DATA_SCOPE=NONE_SYNTHETIC_ONLY
PHYSICAL_DEVICE_ACTION=NONE
FIRMWARE_ACTION=NONE
```

After publishing this checkpoint, the existing observer was rearmed without
touching the product or device. Its self-test passed and the process is running
with a sanitized serial connection. The observer's structural snapshot reports
remote Slate healthy with restart count 0, MySQL healthy with restart count 0,
and both local/public health probes available where applicable. No raw observer
content is retained.

## Exactly one newly authorized provider session consumed — 2026-09-09

```text
AUTHORIZATION_SOURCE_HEAD=1f5e1a8ae26bc5a2b3825b9348530ad7a2a6538f
PROVIDER_SESSION_MAX_AUTHORIZED=1
PROVIDER_SESSION_CONSUMED=1
TOTAL_PROVIDER_QUALIFICATION_SESSION_ATTEMPTS=2
QUALIFICATION_DRIVER_IDENTITY=7c21eb112429ad7ed93111fedb8019bfa61da7d0ace47b702658c7f38158ff7f
QUALIFICATION_DRIVER_COMMAND_CLASS=TEMPORARY_DIRECT_SSH_DOCKER_NODE_BRIDGE_DRIVER
QUALIFICATION_DRIVER_SOURCE_OR_INLINE_SCRIPT_IDENTITY=EPHEMERAL_DRIVER_HASH_ABOVE;NOT_RETAINED_AFTER_RUN
DRIVER_START_OBSERVED=YES
DRIVER_PROCESS_EXIT_OBSERVED=YES
DRIVER_EXIT_CLASS=FAIL_SESSION_SETUP
DRIVER_TIMEOUT_OR_KILL_CLASS=NO_TIMEOUT;CHILD_STOP_REQUESTED_AFTER_SANITIZED_BRIDGE_ERROR
CHILD_NODE_BRIDGE_START_OBSERVED=YES
CHILD_NODE_BRIDGE_EXIT_OBSERVED=YES
PROVIDER_CONNECT_ATTEMPT_OBSERVED=YES
PROVIDER_SESSION_ESTABLISHED_OBSERVED=NO
FIRST_SYNTHETIC_AUDIO_SENT_OBSERVED=NO
END_AUDIO_OR_TURN_COMMIT_OBSERVED=NO
FIRST_INPUT_TRANSCRIPTION_EVENT_OBSERVED=NO
FIRST_PROVIDER_OUTPUT_EVENT_OBSERVED=NO
PROVIDER_ERROR_CLASS=SANITIZED_BRIDGE_ERROR_CLASS_NOT_RETAINED_BY_DRIVER
WS_OR_STREAM_CLOSE_CLASS=UNKNOWN_NOT_DURABLY_OBSERVED
TERMINAL_COMPLETION_MARKER_EXPECTED=YES
TERMINAL_COMPLETION_MARKER_EMITTED=YES
EARLIEST_MISSING_OR_FAILED_BOUNDARY=PROVIDER_SESSION_ESTABLISHMENT
QUALIFICATION_TERMINAL=FAIL_SESSION_SETUP
```

The only emitted qualification output was sanitized structural accounting:

```text
INPUT_TRANSCRIPTION_HINT=en-US;ja-JP
INPUT_TRANSCRIPTION_HINT_CONFIGURED=YES
PROVIDER_SESSION_ESTABLISHED=NO
EN_TRANSCRIPTION_EVENT_SEEN=NO
JA_TRANSCRIPTION_EVENT_SEEN=NO
EN_LANGUAGE_EXPECTATION_MET=UNKNOWN
JA_LANGUAGE_EXPECTATION_MET=UNKNOWN
T_AUDIO_INPUT_COMMIT_OR_TURN_END=UNKNOWN
T_PROVIDER_INPUT_TRANSCRIPTION_FIRST_PARTIAL=UNKNOWN
T_PROVIDER_READY=UNKNOWN
T_PROVIDER_FIRST_OUTPUT=UNKNOWN
ASSISTANT_OUTPUT_EVENT_SEEN=NO
QUALIFICATION_TERMINAL=FAIL_SESSION_SETUP
```

`CLEAN_CHILD_EXIT=UNKNOWN_NOT_EMITTED_BY_THIS_CONSUMED_DRIVER_OUTPUT`; it is
not inferred. No transcript, audio, provider payload, credential, auth header,
device identifier or private data was printed or retained. The bridge error's
enum was also not retained, so its exact provider/config/connect subcause
cannot be distinguished after this single session. This is not evidence of a
Gemini model/configuration failure: the supported failed boundary is provider
session establishment, before synthetic audio or provider events.

Codex adjudication: no product/runtime repair, deployment, firmware action,
provider retry or physical action is justified. The deployed product remains
the reviewed `b0606b6beb22a21b49570c17c323a64d486c38c9` candidate with approved
Gemini configuration and read-only secret mount. The one-session authority is
consumed; further provider diagnosis requires separate explicit authority. No
blind retry or physical acceptance request is made.
