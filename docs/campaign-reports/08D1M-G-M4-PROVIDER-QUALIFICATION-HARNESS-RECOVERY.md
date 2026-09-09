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
