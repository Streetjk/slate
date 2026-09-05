# Campaign 8D1K-G17 — Human Authorization for One Exact Full-Adapter Provider Validation

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Authoritative base: `integration/note4-custom`

## Human authorization

The human explicitly authorized continuation with G17 after reviewing the completed G16 boundary.

This is a new, separate authorization. It does not reset, extend, retry, or reuse any historical provider-call budget.

```text
CAMPAIGN=8D1K_G17
STATUS=HUMAN_AUTHORIZED_NOT_STARTED
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=0_OF_1
PROVIDER_CALLS_REMAINING=1
MODEL=gemini-3.1-flash-live-preview
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
SDK_VERSION=2.20.0
SYNTHETIC_INPUT_ONLY=YES
SYNTHETIC_PROMPT=Say exactly TEST.
SEARCH_ENABLED=NO
PRIVATE_DATA_AUTHORIZED=NO
OUTLOOK_DATA_AUTHORIZED=NO
CALENDAR_DATA_AUTHORIZED=NO
MICROPHONE_AUTHORIZED=NO
GENERATED_AUDIO_RETAINED=NO
PRODUCTION_MUTATION_AUTHORIZED=NO
PRODUCTION_RESTART_AUTHORIZED=NO
BILLING_CHANGE_AUTHORIZED=NO
VERTEX_CHANGE_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
READY_FOR_8D1L=NO_UNTIL_G17_PASS
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=NO_FOR_G17_EXECUTION
NEXT_ACTION=EXECUTE_EXACTLY_ONE_G17_FULL_ADAPTER_SYNTHETIC_PROVIDER_VALIDATION
```

## 1. Mandatory live reconciliation before the call

Before consuming the single G17 provider session, Codex must live-read and reconcile:

1. PR #2 metadata and current remote head;
2. `docs/campaign-reports/CAMPAIGN-STATE.md`;
3. `docs/campaign-reports/08-GEMINI-35-LIVE.md` latest G14-G16 sections;
4. `docs/campaign-reports/08D1K-G14-G17-8D1L-LONGRUN-POST-READY-RECOVERY.md`;
5. this G17 authorization file;
6. newest PR #2 comments/checkpoints;
7. `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`.

The expected pre-call state is:

```text
PR2_STATE=open_draft_unmerged
G16_COMPLETE=YES
G16_STATUS=ZERO_PROVIDER_POST_READY_BOUNDARY_CLOSED_READY_FOR_HUMAN_G17_DECISION
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
SDK_VERSION=2.20.0
G13_PROVIDER_CALLS_USED=1_OF_1
G14_G16_PROVIDER_CALLS_USED=0
G17_PROVIDER_CALLS_USED=0_OF_1
PRODUCTION_CHANGED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
```

If any material drift exists in PR state, accepted product/runtime source, exact SDK/image/harness lineage, provider-call accounting, model identity, credential boundary, or the G16 closure, do **not** consume the G17 provider call. Publish the sanitized drift boundary under REPORT-PUSH-INVARIANT and return for human review.

Do not silently rebase, merge, switch source candidates, substitute a direct SDK control, or reinterpret historical call accounting.

## 2. Refresh the current official Google boundary

Because G17 is a new provider boundary, refresh current official Google Gemini API / Google GenAI SDK documentation immediately before execution.

At minimum verify the current status and compatibility of:

- `gemini-3.1-flash-live-preview`;
- the Gemini Live API surface used by the exact adapter;
- `@google/genai` Node Live behavior relevant to SDK `2.20.0`;
- Developer API key/Auth key acceptance or migration requirements applicable on 2026-09-04;
- current data-use policy relevant to the synthetic Developer API validation.

This G17 authorization permits only synthetic input and no private NOTE4/Outlook/Calendar/microphone data. It is **not** authorization for later production/private-data use.

If current official documentation shows the exact model/API/auth path is no longer valid or introduces a materially different security/data-policy boundary, do not make the provider call. Publish the evidence and return for human review.

## 3. Exact execution path — no substitute controls

G17 must validate the exact full Slate adapter path:

```text
Slate service
→ Bun parent
→ Node bridge
→ exact @google/genai Node runtime 2.20.0
→ Gemini Live
```

Use the G16-proven exact source/image/SDK/harness lineage.

Do **not** substitute:

- a minimal/direct Node SDK call;
- an ad-hoc provider probe;
- a different model;
- a different SDK version;
- a different source candidate;
- a production container/runtime;
- a private NOTE4 request;
- microphone/audio input.

The synthetic prompt is exactly:

```text
Say exactly TEST.
```

Search must remain disabled. Tool invocation must remain zero. Custom function declarations may remain present if that is the exact full-adapter shape, but no function/tool may execute.

## 4. Credential boundary

Use only the already established protected host credential mechanism:

```text
HOST=note4-orangepi
SOURCE=/mnt/ssd-tmp/slate-tools/gemini-api-key/gemini_api_key
DESTINATION=/run/secrets/gemini_api_key
OWNER=pi
GROUP=pi
MODE=0600
TYPE=regular_non_symlink
MOUNT=read_only
```

Allowed preflight checks are metadata-only: existence, regular-file/non-symlink status, owner/group, restrictive mode, non-zero size, and read-only Docker mount metadata.

Never `cat`, print, hash, copy, move, screenshot, commit, place the credential in argv, place it in a Docker layer/build context, dump it through the environment, or recover it from production `.env`.

Do not create or replace the credential under this authorization.

## 5. G17 harness requirements

Use the G16-proven post-ready harness with:

- distinct connect/bridge-ready/text-dispatch/first-provider-message/turn-complete deadlines;
- a distinct outer launcher timeout;
- monotonic sanitized stage timeline;
- durable atomic result capture;
- independent result recovery after launcher/session disconnect;
- exact image/source/SDK identity in the result;
- no raw provider-body capture;
- no credential-value capture;
- no generated-audio retention.

The outer launcher timing out must not overwrite or misclassify an independently recoverable inner provider result.

Exactly one real provider session is authorized. Once the provider session is initiated, count the budget as consumed even if the outer launcher disconnects or the result is recovered later.

No retry is authorized.

## 6. Required PASS criteria

G17 is PASS only if the durable sanitized result proves at minimum:

```text
CAMPAIGN=8D1K_G17
STATUS=PASS_EXACT_FULL_ADAPTER_REAL_PROVIDER_VALIDATION
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=1_OF_1
PROVIDER_CALLS_REMAINING=0
NODE_CHILD_SPAWN=YES
BRIDGE_READY=YES
TEXT_DISPATCH_PROVEN=YES
FIRST_PROVIDER_MESSAGE=YES
MODEL_EVENT=YES
TURN_COMPLETE=YES
TOOL_INVOCATIONS=0
SEARCH_EXECUTED=NO
PRIVATE_DATA_SENT=NO
OUTLOOK_DATA_SENT=NO
CALENDAR_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
RESULT_DURABLY_RECOVERABLE=YES
OOM=NO
RAW_PROVIDER_BODY_READ=NO
CREDENTIAL_VALUE_READ=NO
PROVIDER_CALL_RETRIED=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=YES
READY_FOR_8D1M=NO
```

Do not require the model text/audio content to be retained merely to prove the transport/event boundary. Record only the minimum sanitized evidence needed for PASS.

## 7. PASS continuation

On G17 PASS:

1. update `docs/campaign-reports/08-GEMINI-35-LIVE.md` with the exact sanitized G17 result and call accounting;
2. update `docs/campaign-reports/CAMPAIGN-STATE.md` to `READY_FOR_8D1L=YES`;
3. run secret-safe checks and `git diff --check`;
4. selectively commit;
5. push the active PR branch;
6. fetch/verify the exact remote SHA;
7. verify PR #2 remains open/draft/unmerged;
8. make **no more provider calls**;
9. continue automatically into the existing `docs/campaign-reports/08D1L-PRODUCTION-READINESS-AUDIT.md` zero-provider, zero-production-mutation audit;
10. do not return for ordinary recoverable 8D1L work;
11. stop only at the 8D1L terminal human production/API-key/data-policy/deployment boundary before 8D1M.

G17 PASS does not authorize 8D1M, production deployment/restart, production `.env` mutation, billing/Vertex changes, firmware flashing, or PR merge.

## 8. FAIL / timeout / ambiguous result

If G17 does not meet every required PASS criterion:

- do not retry;
- do not make a second provider session;
- do not run an ad-hoc direct Node SDK control;
- do not inspect raw provider bodies;
- do not read/print the credential;
- do not change product/runtime source under the consumed G17 authorization;
- keep `READY_FOR_8D1L=NO` and `READY_FOR_8D1M=NO`.

Publish a durable sanitized failure checkpoint containing, where deterministically known:

```text
CAMPAIGN=8D1K_G17
STATUS=HARD_STOP_G17_EXACT_ADAPTER_PROVIDER_FAILURE
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=1_OF_1
PROVIDER_CALLS_REMAINING=0
SOURCE_SHA=<exact>
SDK_VERSION=<exact>
IMAGE_ID=<exact>
FAILURE_STAGE=<exact sanitized stage or UNKNOWN_SAFE_FAILURE>
TEXT_DISPATCH_PROVEN=<YES|NO|UNKNOWN>
FIRST_PROVIDER_MESSAGE=<YES|NO|UNKNOWN>
MODEL_EVENT=<YES|NO>
TURN_COMPLETE=<YES|NO>
TOOL_INVOCATIONS=0
SEARCH_EXECUTED=NO
PRIVATE_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
RESULT_DURABLY_RECOVERABLE=<YES|NO>
RAW_PROVIDER_BODY_READ=NO
CREDENTIAL_VALUE_READ=NO
PROVIDER_CALL_RETRIED=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_G17_SINGLE_CALL_RESULT
```

Include the sanitized monotonic event timeline and clearly distinguish the inner provider/event deadlines from the outer launcher timeout.

Then satisfy REPORT-PUSH-INVARIANT and return for human review.

## 9. Permanent prohibitions under this authorization

This authorization does not permit:

- a second G17 call;
- reuse of G13/F/earlier budgets;
- production deployment or restart;
- loading/mutating production `.env`;
- enabling/changing billing or Vertex;
- sending private NOTE4/Outlook/Calendar data;
- microphone input;
- generated-audio retention;
- credential creation/replacement/exposure;
- raw provider error-body capture;
- firmware flashing;
- PR #2 merge;
- Campaign 6D work;
- PR #1/PR #3 expansion;
- destructive host/storage work.

## 10. Report-push invariant

`docs/campaign-reports/REPORT-PUSH-INVARIANT.md` remains binding at the G17 authorization checkpoint, G17 completion/hard stop, and the later 8D1L terminal boundary.

Before returning control at any legitimate boundary, evidence must include:

```text
REPORT_UPDATED=YES
CAMPAIGN_STATE_UPDATED=YES
REPORT_COMMITTED=YES
REPORT_PUSHED=YES
REMOTE_SHA_VERIFIED=YES
PUSHED_SHA=<exact sha>
PR_STATE_VERIFIED=YES
PR_STATE=open_draft_unmerged
```

A local-only result is not complete.
