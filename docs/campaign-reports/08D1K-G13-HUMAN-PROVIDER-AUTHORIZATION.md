# Campaign 8D1K-G13 — Human Authorization for One Corrected Exact-Adapter Provider Revalidation

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Authoritative sequence: `docs/campaign-reports/08D1K-G12-8D1L-LONG-MULTI-CAMPAIGN-SEQUENCE.md`
Human authorization: EXPLICITLY GRANTED

## Purpose

This checkpoint records explicit human authorization for exactly one new G13 Gemini Live provider call after successful G12 zero-provider closure.

It does not reset, extend, retry, or reuse any historical provider-call budget.

## Accepted G12 checkpoint

The accepted product/runtime source remains:

```text
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
```

G12 proved the exact ARM64 validation shape provider-disabled after fixing the disposable harness/runtime-selection defect. The accepted G11/G12 root cause remains:

```text
ROOT_CAUSE=G10_HARNESS_NODE_EXECUTABLE_PATH_MISMATCH
G11_ROOT_CAUSE_PRESERVED=YES
G12_EXACT_SHAPE_PROVIDER_DISABLED_E2E=PASS
BUN_PARENT=PASS
NODE_CHILD_SPAWN=PASS
JSONL_READY=PASS
TEXT_PATH=PASS
DURABLE_RESULT=PASS
FULL_TESTS=PASS
ARM64_BUILD=PASS
PRODUCTION_HEALTH=PASS
```

Do not reinterpret the prior G10 failure as a Gemini provider defect. The child never started in that failed harness.

## Historical accounting — immutable

Preserve exactly:

```text
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_F_PROVIDER_CALLS_USED=1_OF_1
8D1K_G_CORRECTED_PROVIDER_CALLS_USED=1_OF_1
```

This checkpoint creates a new, separate G13 budget only:

```text
CAMPAIGN=8D1K_G13
STATUS=AUTHORIZED_NOT_STARTED
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=0_OF_1
PROVIDER_CALLS_REMAINING=1
MODEL=gemini-3.1-flash-live-preview
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
SYNTHETIC_INPUT_ONLY=YES
PRIVATE_DATA_AUTHORIZED=NO
MICROPHONE_AUTHORIZED=NO
SEARCH_ENABLED=NO
PRODUCTION_MUTATION_AUTHORIZED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=NO_FOR_G13_EXECUTION
NEXT_ACTION=EXECUTE_EXACTLY_ONE_G13_FULL_SLATE_ADAPTER_PROVIDER_REVALIDATION
```

## Current official Google boundary refreshed before authorization

At authorization time, current official Google documentation still lists `gemini-3.1-flash-live-preview` as an available Gemini Live API model with text/audio input, text/audio output, Live API support, function calling, and Search grounding. The current model documentation states that ordinary conversational text after connect must use realtime input rather than client-content history seeding; the accepted Slate source already contains the corresponding compatibility correction.

Current Google API-key documentation states that Standard keys are being replaced by Auth keys and that Standard keys are rejected in September 2026. G13 must not create, replace, move, print, inspect, or expose a credential. It may use only the already-established protected runtime credential mechanism. If that credential does not authenticate, classify the result as an authentication boundary and stop; do not retry and do not create a new key.

Current Google pricing/data-use documentation states that Free Tier submitted content may be used to improve Google products while Paid Tier submitted content is not. The human authorizes this G13 call specifically because the payload is synthetic only (`Say exactly TEST.`) and contains no NOTE4, Outlook, Calendar, microphone, or other private data. This authorization does not approve Free Tier use for real/private production content and does not authorize billing changes.

## Exact G13 call contract

Execute exactly one Live session through the full path:

```text
Slate service
→ Bun parent
→ Node bridge
→ Gemini Live
```

Use:

```text
MODEL=gemini-3.1-flash-live-preview
INPUT=Say exactly TEST.
NODE_ENV=test
AUTH_MODE=developer_api_key
LIVE_RUNTIME=node_bridge
SEARCH_ENABLED=NO
PRIVATE_DATA_SENT=NO
OUTLOOK_DATA_SENT=NO
CALENDAR_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
```

Use the exact accepted G12 source/image lineage and G12-proven executable-selection semantics. Do not hard-code a nonexistent Node path. Use only the established protected host credential source and read-only runtime mount contract; inspect safe metadata only.

Custom function declarations may remain present if that is the actual accepted Slate contract, but no tool invocation is authorized. Record the actual declaration state and require `TOOL_INVOCATIONS=0`.

## PASS criteria

PASS requires at minimum:

```text
NODE_CHILD_SPAWN=YES
BRIDGE_READY=YES
MODEL_EVENT=YES
TURN_COMPLETE=YES
TOOL_INVOCATIONS=0
SEARCH_EXECUTED=NO
PRIVATE_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
OOM=NO
RESULT_DURABLY_RECOVERABLE=YES
```

The durable sanitized result must survive launcher disconnect/timeout and be independently recoverable.

## Failure rule

If the one G13 call fails:

- do not retry;
- do not make a Node control or second provider call;
- preserve the exact consumed G13 accounting as `1_OF_1`;
- capture only sanitized stage/error classification and safe operational metadata;
- do not read raw provider bodies or credential values;
- publish, commit, push, fetch, and verify the hard-stop checkpoint;
- stop for human review.

## Success rule

If G13 passes:

- publish, commit, push, fetch, and verify the G13 PASS checkpoint;
- set `READY_FOR_8D1L=YES`;
- make no additional Gemini provider calls;
- continue automatically into 8D1L under the existing long multi-campaign directive;
- do not return control for routine zero-provider/non-production 8D1L work;
- stop only at the final production/data-policy/deployment decision boundary before 8D1M, or at a genuine security/technical boundary.

## Safety boundaries unchanged

This authorization does **not** authorize:

- a second G13 provider call;
- production deployment or restart;
- production `.env` loading or mutation;
- production Developer API enablement;
- billing enablement or tier changes;
- Vertex enablement;
- firmware flashing;
- PR #2 merge;
- Campaign 6D work;
- PR #1 or PR #3 expansion;
- destructive host/storage actions;
- credential exposure, movement, copying, or replacement;
- private NOTE4/Outlook/Calendar payloads;
- microphone input;
- generated-audio retention;
- 8D1M execution.

Outlook remains read-only and isolated. Google Calendar remains proposal-only until later physical confirmation. NOTE4 must never store Gemini/Google credentials or call Gemini directly.

## REPORT-PUSH-INVARIANT

At every meaningful G13 or subsequent 8D1L checkpoint, obey `docs/campaign-reports/REPORT-PUSH-INVARIANT.md` before returning control.

The current human authorization is complete once this file exists on the PR #2 branch and the remote PR state is verified open/draft/unmerged.
