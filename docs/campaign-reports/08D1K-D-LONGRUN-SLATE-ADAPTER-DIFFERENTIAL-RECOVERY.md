# Campaign 8D1K-D — Long-run Slate adapter differential recovery

Date: 2026-09-03 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## 1. Purpose

Campaign 8D1K ended at a genuine engineering boundary:

- the exact packaged Node Gemini Live bridge control passed against `gemini-3.1-flash-live-preview`;
- the exact Slate Bun -> `GeminiLiveService` -> Node bridge adapter failed before any model event or turn completion;
- the durable harness worked correctly and preserved the failure result;
- all three previously authorized 8D1K provider calls are consumed;
- no private NOTE4, Outlook, Calendar, Search, microphone, or retained audio data was used;
- production Slate/MySQL remained healthy and untouched;
- no product source was changed after the failure;
- 8D1L did not start.

This campaign exists to determine the exact deterministic cause of the Call 3 delta **without making any new Gemini provider call**.

The key comparison is now:

```text
KNOWN GOOD:
exact Node bridge runtime + protected credential + exact model -> PASS

KNOWN FAILING:
Slate Bun parent + GeminiConfig + GeminiLiveService + child spawn + JSONL bridge + same Node runtime -> SLATE_ADAPTER_ERROR before model event
```

The next engineering task is therefore not generic Gemini diagnosis. It is a bounded differential analysis of the layers added between the successful Node control and the failed full Slate adapter.

## 2. Binding routing

Current routing remains:

- controller / stage authority: **Luna**;
- bounded implementation/correction worker: **Sonnet 4.6**;
- independent reviewer: **GLM-5.3-Flash** via the configured `zai-glm53-reviewer`, read-only;
- repository integrator, validator, checkpoint publisher, and **sole repository writer**: **Codex**.

No silent reviewer or worker substitution is allowed.

If the configured exact GLM-5.3-Flash path is unavailable when a source review is required, stop with:

```text
GLM53_REVIEW_BLOCKED
```

Do not substitute GLM 5.2, Grok, Gemini, another Claude model, or another reviewer.

## 3. Absolute provider-call boundary

**ZERO new Gemini provider calls are authorized by this campaign.**

The prior 8D1K accounting is immutable:

```text
8D1K_TOTAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_REMAINING_PROVIDER_CALLS=0
```

Do not reset, reinterpret, or extend that budget.

This campaign may prepare a later provider-validation plan, but it must stop for explicit human authorization before any new network call to Gemini.

No model metadata call, Live session, Search call, tool call, or other Gemini API call is authorized here.

## 4. Current accepted evidence

Start by fetching and reconciling the latest remote state. Read at minimum:

- `AGENTS.md`;
- `docs/campaign-reports/CAMPAIGN-STATE.md`;
- `docs/campaign-reports/08-GEMINI-35-LIVE.md`;
- `docs/campaign-reports/08D1I-M-MULTI-CAMPAIGN-SEQUENCE.md`;
- `docs/campaign-reports/08D1K-NODE-LIVE-NONPROD-E2E.md`;
- `docs/campaign-reports/08D1K-R-HARNESS-RECOVERY.md`;
- this directive.

Accepted reviewed implementation lineage:

```text
REVIEWED_IMPLEMENTATION_SHA=90ab7cbbff39dfb4dda79cf1260611e5f26cf941
```

Accepted 8D1K final result:

```text
CALL_2_NODE_BRIDGE=PASS
CALL_2_MODEL_EVENT=YES
CALL_2_TURN_COMPLETE=YES
CALL_3_EXACT_SLATE_ADAPTER=FAIL
CALL_3_FAILURE_CLASS=SLATE_ADAPTER_ERROR
CALL_3_MODEL_EVENT=NO
CALL_3_TURN_COMPLETE=NO
CALL_3_EXIT=21
CALL_3_OOM=false
CALL_3_RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
PROVIDER_CALLS_USED=3_OF_3
READY_FOR_8D1L=NO
```

Do not relitigate the durable harness problem: 8D1K-R already proved result survival after launcher disconnect for both success and deterministic failure shapes.

## 5. Primary hypotheses to test — do not assume any is already proven

Investigate these in order because each can explain a failure before provider/model events.

### H1 — non-production evaluation guard versus container `NODE_ENV`

The final Docker image sets:

```text
NODE_ENV=production
```

while `GeminiConfig.isConfigured()` intentionally refuses `node_bridge` in production and `configurationErrorMessage()` states that the Node Live bridge is disabled in production until separately authorized.

This is a high-priority deterministic hypothesis for Call 3.

However, **do not declare it the root cause merely from static inspection**. First determine whether the Call 3 disposable adapter harness explicitly overrode `NODE_ENV` to `development` or `test`.

If the original disposable invocation cannot be recovered safely, report that fact and prove the behavior with a deterministic matrix instead.

The production guard is a security boundary and must not be weakened or removed merely to make a test pass.

### H2 — parent-side executable/script/cwd resolution

The default bridge configuration is:

```text
GEMINI_NODE_EXECUTABLE=node
GEMINI_NODE_BRIDGE_SCRIPT=./src/modules/assistant/gemini-live-node-bridge-runtime.mjs
```

and the normal entrypoint changes cwd to `/app/backend`.

Prove in the exact final-image shape that:

- `node` resolves correctly from PATH for the Bun parent;
- the relative bridge script resolves to the intended tracked file;
- the process is spawned without a shell;
- stdio is available exactly as expected;
- the Bun process can observe child stdout/stderr/exit correctly;
- no public listener or network-facing bridge endpoint exists.

### H3 — credential reference/readability boundary between Bun parent and Node child

Call 2 proved the Node child can use the protected credential mechanism, but the full Slate path adds Bun-side `GeminiConfig.hasUsableCredentialFile()` before child spawn.

Using **synthetic dummy secret files only**, test:

- allowed trusted path shape under `/run/secrets/` or `/var/run/secrets/`;
- regular-file requirement;
- non-empty and <=4096-byte requirement;
- no group/other permission bits;
- actual readability by the final container user;
- symlink rejection;
- parent-side and child-side agreement on the same safe reference;
- UID/GID and mount behavior in the final image.

Do not mount or read the real Gemini credential during these deterministic tests.

### H4 — Bun `child_process` compatibility / private stdio lifecycle

The provider succeeds when the Node runtime is driven directly. The full Slate path additionally relies on Bun's Node-compatible `child_process.spawn` behavior.

Exercise the real Bun parent against provider-disabled deterministic mock child scripts and prove:

- child spawn;
- stdin writes;
- stdout line framing;
- stderr suppression does not block;
- ready frame delivery;
- server-message delivery;
- close frame delivery;
- child exit behavior;
- connect timeout behavior;
- reconnect/epoch behavior;
- stale-response suppression;
- deliberate child crash behavior.

Tests that only mock the process object in-memory are insufficient for this stage. At least one integration path must use the actual Bun runtime spawning an actual Node process in the exact final image or an equivalent architecture-matched container.

### H5 — safe error classification is too lossy

The current full service path normalizes most bridge exceptions to a generic:

```text
Gemini Live connection failed
```

and the 8D1K harness ultimately recorded only:

```text
SLATE_ADAPTER_ERROR
```

This prevented attribution of Call 3 to configuration, spawn, protocol, credential, timeout, or provider-connect stages.

Determine whether existing safe bridge codes can be retained internally without exposing provider raw content or secret material.

If a source change is justified, prefer a **small typed/sanitized error taxonomy**, for example conceptually:

```text
CONFIGURATION_REJECTED
BRIDGE_EXECUTABLE_UNAVAILABLE
BRIDGE_SCRIPT_UNAVAILABLE
BRIDGE_CREDENTIAL_UNAVAILABLE
BRIDGE_PROTOCOL_REJECTED
BRIDGE_CONNECT_TIMEOUT
BRIDGE_PROVIDER_CONNECTION_FAILED
BRIDGE_SESSION_CLOSED
UNKNOWN_SAFE_FAILURE
```

Names may differ if the existing code suggests a cleaner representation.

Requirements:

- never include API keys, tokens, provider response bodies, request bodies, credential contents, filesystem secret contents, or private NOTE4 data;
- do not propagate raw provider errors to clients;
- preserve redaction at all public/API boundaries;
- keep sanitized categories suitable for tests and campaign evidence;
- do not weaken fail-closed behavior.

### H6 — exact open-frame/config differential

Prove the exact open frame produced by `GeminiLiveService` -> `NodeGeminiLiveBridge` in a provider-disabled integration run.

Verify only non-secret fields:

- protocol version;
- model;
- language;
- system-instruction presence/size, not private content;
- timeout;
- web-search enablement;
- tool-registry shape;
- epoch;
- auth-mode category;
- presence of credential **reference** only, never value.

Confirm that the child runtime accepts the frame before any provider operation.

Do not assume tools are the failure solely because Call 3 used the full adapter. The Node runtime's own open-frame validation must be exercised deterministically.

## 6. Stage D0 — remote reconciliation and contamination check

Before any work:

1. `git fetch origin --prune`.
2. Confirm current branch is `feature/gemini-35-live-evaluation`.
3. Confirm local and remote state; do not reset a newer remote checkpoint backward.
4. Inspect `git status` and classify any local changes before touching them.
5. Confirm PR #2 remains open/unmerged.
6. Confirm no unrelated Campaign 6D, PR #1, PR #3, Airtable, Immich, storage, firmware, or other campaign work is mixed into the tree.
7. Confirm production Slate/MySQL health read-only if accessible.
8. Record the exact starting SHA.

If the repository is contaminated in a way that cannot be safely reconciled without destructive action, stop.

## 7. Stage D1 — reconstruct Call 3 execution shape

Attempt to reconstruct the exact Call 3 invocation using only safe sources:

- committed campaign evidence;
- current shell history if available and if it contains no secret values;
- Docker metadata still available locally/remotely if the disposable image/container still exists;
- temporary non-secret campaign artifacts if they survived;
- Codex execution notes if accessible locally.

Do **not** recover deleted secret content, inspect credential values, print environment secrets, or scrape shell history indiscriminately.

Record only sanitized facts such as:

```text
CALL3_NODE_ENV=<production|development|test|UNKNOWN>
CALL3_GEMINI_LIVE_RUNTIME=<node_bridge|other|UNKNOWN>
CALL3_AUTH_MODE=<developer_api_key|other|UNKNOWN>
CALL3_MODEL=<model-or-UNKNOWN>
CALL3_NODE_EXECUTABLE=<safe path/name or UNKNOWN>
CALL3_NODE_BRIDGE_SCRIPT=<safe path or UNKNOWN>
CALL3_SECRET_REFERENCE_SHAPE=<trusted-runtime-path|UNKNOWN>
CALL3_SERVICE_CONNECT_REACHED=<YES|NO|UNKNOWN>
CALL3_CHILD_SPAWN_REACHED=<YES|NO|UNKNOWN>
CALL3_CHILD_READY_REACHED=<YES|NO|UNKNOWN>
```

If exact original environment cannot be proven, say `UNKNOWN`; do not guess.

## 8. Stage D2 — deterministic full-adapter guard matrix

Build a provider-disabled test matrix around the exact Slate adapter.

Use synthetic dummy credentials and mock child runtimes. No real Gemini credential and no network/provider access.

At minimum cover:

### Matrix A — production guard

```text
NODE_ENV=production
GEMINI_LIVE_RUNTIME=node_bridge
GEMINI_AUTH_MODE=developer_api_key
GEMINI_DEVELOPER_API_KEY_ENABLED=true
GEMINI_LIVE_MODEL=gemini-3.1-flash-live-preview
```

Expected result under current policy:

```text
FAIL_CLOSED_CONFIGURATION
CHILD_SPAWN=NO
```

If this is not the result, investigate before changing anything.

### Matrix B — explicit non-production evaluation

Repeat with `NODE_ENV=test` or `development` and a safe synthetic credential file.

Use an actual spawned Node mock runtime that:

- accepts the exact JSONL open frame;
- emits a valid `ready` response;
- accepts synthetic `text`;
- emits a deterministic synthetic server message;
- emits a deterministic close.

Expected result:

```text
FULL_ADAPTER_CONNECT=PASS
TEXT_FRAME=PASS
SERVER_EVENT=PASS
CLOSE=PASS
PROVIDER_CALLS=0
```

### Matrix C — negative categories

Deterministically exercise at least:

- missing executable;
- missing bridge script;
- unreadable synthetic credential;
- unsafe credential path;
- protocol rejection;
- child exits before ready;
- child timeout before ready;
- provider-error mock after ready;
- unexpected close after ready.

The goal is to prove each safe category is distinguishable enough to make the next provider validation meaningful.

## 9. Stage D3 — exact ARM64 image integration proof

Build the exact current candidate image for `linux/arm64` without credentials in build context or image layers.

Inside the disposable image, with network disabled and synthetic secrets only, prove:

```text
BUN_BACKEND_RUNTIME=PASS
NODE_VERSION=EXPECTED_PINNED_VERSION
GOOGLE_GENAI_NODE_IMPORT=PASS
BRIDGE_SCRIPT_PRESENT=YES
BRIDGE_SCRIPT_RESOLVES_FROM_BACKEND_CWD=YES
BUN_CAN_SPAWN_NODE=YES
BUN_NODE_STDIO_ROUNDTRIP=PASS
SYNTHETIC_SECRET_PARENT_CHECK=PASS
SYNTHETIC_SECRET_CHILD_CHECK=PASS
NODE_BOUNDARY_PUBLIC_LISTENER=NO
PROVIDER_CALLS=0
```

Run both `NODE_ENV=production` and explicit non-production evaluation variants so the guard behavior is demonstrated rather than inferred.

The final production guard must remain closed.

## 10. Stage D4 — adjudicate root cause before source changes

Luna must classify the result into one of these buckets, or an equivalently precise category:

```text
A_CALL3_HARNESS_ENV_MISCONFIGURATION
B_PARENT_CONFIG_GUARD_BEHAVIOR_AS_DESIGNED
C_PARENT_CHILD_SPAWN_OR_PATH_DEFECT
D_PARENT_CHILD_STDIO_PROTOCOL_DEFECT
E_CREDENTIAL_REFERENCE_PERMISSION_DEFECT
F_SAFE_ERROR_OBSERVABILITY_DEFECT
G_MULTIPLE_DETERMINISTIC_DEFECTS
H_ROOT_CAUSE_STILL_NOT_ISOLATED
```

Rules:

- If Call 3 used `NODE_ENV=production` and the exact same adapter passes deterministically in explicit non-production mode, treat that as a harness/configuration issue unless independent evidence shows a product bug too.
- Do **not** weaken or remove the production guard to fix an evaluation harness mistake.
- If only the harness/documentation needs correction, avoid product-source churn.
- If product source has a genuine deterministic defect, proceed to Stage D5.
- If the root cause remains unisolated after the complete zero-provider matrix, do not authorize speculative source edits. Publish the unresolved differential and stop.

## 11. Stage D5 — bounded correction if and only if justified

If Luna identifies a real product-source defect, Sonnet 4.6 may perform only the bounded correction necessary for the proven issue.

Allowed correction areas are limited to:

- `GeminiConfig` validation or path handling, if demonstrably wrong while preserving the production guard;
- Node bridge executable/script resolution;
- Bun parent child-process lifecycle;
- JSONL protocol handling;
- typed sanitized error categorization;
- deterministic tests directly related to the defect;
- Docker packaging required for the already-selected private Node boundary.

Not authorized:

- changing model family;
- moving Gemini calls back into Bun SDK path;
- making NOTE4 call Gemini directly;
- exposing a network listener for the Node bridge;
- weakening credential path/permission checks;
- weakening the production-off guard for Developer API mode;
- adding service-account key JSON;
- exposing secrets to Git, firmware, client, logs, command arguments, or chat;
- changing Outlook isolation;
- changing Google Calendar confirmation semantics;
- unrelated refactoring.

Codex remains the sole repository writer.

## 12. Stage D6 — deterministic validation after any correction

Run all affected targeted tests first, then full gates.

Minimum full gates:

```text
bun run --cwd backend test
bun run --cwd shared test   # or repository-equivalent shared test command
bun run lint
bun run typecheck
bun run format:check
bun run --cwd frontend build
node --check backend/src/modules/assistant/gemini-live-node-bridge-runtime.mjs
node --check backend/src/modules/assistant/gemini-live-node-bridge-session.mjs
git diff --check
```

Also run:

- targeted real Bun -> spawned Node provider-disabled integration tests;
- exact production-guard test;
- exact non-production adapter mock-E2E test;
- secret scan over changed implementation/report files;
- Docker build check;
- `linux/arm64` candidate build;
- final image SDK import check;
- final image mock bridge stdio check.

No provider call is permitted as part of testing.

## 13. Stage D7 — independent review

If tracked product/runtime source changes, obtain a fresh exact-artifact GLM-5.3-Flash read-only high-effort review.

Give the reviewer only:

- exact implementation diff;
- relevant tests;
- non-secret deterministic evidence;
- the security invariants in this directive.

Do not give credentials or private data.

Reviewer must explicitly assess:

1. whether the root cause is supported by evidence;
2. whether the correction is narrower than the defect;
3. whether production Developer API mode remains fail-closed;
4. whether secret handling remains runtime-reference-only;
5. whether safe error categories leak raw provider or secret data;
6. whether child-process lifecycle is race-safe;
7. whether stale epoch/session behavior remains safe;
8. whether Outlook remains isolated;
9. whether Calendar remains proposal-only until physical confirmation;
10. whether no public Node bridge attack surface was introduced.

Luna adjudicates all findings.

P0 or persistent P1 is a hard stop.

For valid P2/P3 findings, Sonnet 4.6 may perform bounded correction, then Codex reruns affected and full validation and obtains follow-up review as appropriate.

If no product/runtime source changes at all, retain the existing exact-SHA GLM pass and record why a new review was not necessary; review of new campaign documentation alone is not required unless Luna considers it materially security-sensitive.

## 14. Stage D8 — final zero-provider exact-adapter proof

After correction/adjudication, run a final provider-disabled proof through the **actual full Slate adapter** in the exact final ARM64 image.

Use:

- Bun as the parent runtime;
- actual `GeminiConfig`;
- actual `GeminiLiveService`;
- actual `NodeGeminiLiveBridge`;
- actual `node` executable from the image;
- a deterministic mock Node bridge runtime or controlled provider-disabled child;
- synthetic dummy secret reference;
- no network;
- no real Gemini credential.

The proof must demonstrate:

```text
PRODUCTION_GUARD_FAIL_CLOSED=PASS
NONPROD_CONFIG_ACCEPTED=PASS
CHILD_SPAWN=PASS
OPEN_FRAME_ACCEPTED=PASS
READY_FRAME_RECEIVED=PASS
SYNTHETIC_TEXT_SENT=PASS
SERVER_EVENT_RECEIVED=PASS
CLEAN_CLOSE=PASS
SAFE_FAILURE_CLASSIFICATION_MATRIX=PASS
RESULT_CAPTURE_DURABLE=PASS
PROVIDER_CALLS=0
```

If the exact full-adapter provider-disabled proof cannot pass, stop. Do not seek another live provider-call budget.

## 15. Stage D9 — prepare, but do not execute, the next live validation

Only if the deterministic root cause is isolated and the final exact adapter proof passes, prepare a proposed follow-on provider validation.

Do not execute it.

The proposed follow-on should normally request **at most two new Live sessions**:

### Proposed future Call A

Exact full Slate adapter, explicit non-production evaluation mode, Search disabled, synthetic text only, durable result capture.

Success requires:

```text
MODEL_EVENT=YES
TURN_COMPLETE=YES
```

### Proposed future Call B

Only if Call A passes and additional evidence is genuinely needed: exact full adapter with the intended production-facing tool registry present but no tool invocation, synthetic input only.

No automatic budget is granted by this directive.

Human must explicitly authorize any future calls after reading this campaign report.

## 16. Security invariants

These remain absolute:

- real Gemini credential value never in Git, chat, logs, screenshots, firmware, frontend, NOTE4, image layers, build args, command args, or reports;
- runtime credential references only;
- no service-account key JSON;
- no copied Google tokens;
- no private NOTE4 content sent to Gemini;
- no Outlook data sent to Gemini;
- Outlook remains read-only;
- Google Calendar remains proposal-only;
- only physical NOTE4 Confirm may authorize a Calendar write in the eventual real flow;
- no billing enablement;
- no Vertex enablement;
- no production Gemini config change;
- no production deployment/restart;
- no firmware flash;
- no PR #2 merge;
- no Campaign 6D work;
- no PR #1 or PR #3 work;
- no unrelated storage/system cleanup.

## 17. Production health invariant

All work in this campaign is non-production.

Read-only health checks are allowed.

If production Slate/MySQL health degrades during this campaign for an unrelated reason, stop campaign experimentation and preserve evidence. Do not infer authorization to restart, redeploy, or repair production unless separately authorized.

## 18. Checkpoint discipline

Codex must publish durable checkpoints after meaningful stages, especially:

- after D1 reconstruction;
- after D2/D3 deterministic matrix;
- after Luna root-cause adjudication;
- after any source correction;
- after GLM review;
- after final D8 exact-adapter provider-disabled proof;
- at final human boundary.

Each checkpoint should include:

```text
CAMPAIGN=8D1K_D
STAGE=<...>
HEAD_SHA=<...>
REVIEWED_IMPLEMENTATION_BASE=90ab7cbbff39dfb4dda79cf1260611e5f26cf941
PROVIDER_CALLS_THIS_CAMPAIGN=0
8D1K_PRIOR_PROVIDER_CALLS_USED=3_OF_3
ROOT_CAUSE_CLASS=<...>
PRODUCT_SOURCE_CHANGED=<YES|NO>
FULL_TESTS=<PASS|FAIL|NOT_RUN>
GLM53_REVIEW=<PASS|REVISE|NOT_REQUIRED|BLOCKED>
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
```

Commit intended changes selectively, push, and verify the exact remote SHA after every durable stage that changes repository state.

Do not leave the only useful evidence in a tmux/Codex transcript.

## 19. Hard stops

Stop immediately on any of the following:

- credential value exposure or suspected exposure;
- need to print/read/copy/hash the real key for diagnosis;
- requirement to put a secret in image/Git/firmware/client-visible configuration;
- provider call needed before deterministic diagnosis is exhausted;
- production mutation required;
- billing required;
- Vertex enablement required;
- private data required;
- service-account key JSON proposed;
- public Node bridge listener proposed;
- production Developer API guard must be weakened to make tests pass;
- P0 review finding;
- persistent P1 after bounded correction;
- repository contamination requiring destructive recovery;
- firmware flash;
- PR merge;
- destructive storage/system action.

## 20. Successful final state

Preferred success state if a deterministic cause is isolated and all zero-provider validation passes:

```text
CAMPAIGN=8D1K_D
STATUS=DETERMINISTIC_ROOT_CAUSE_ISOLATED_READY_FOR_HUMAN_PROVIDER_REVALIDATION_DECISION
ROOT_CAUSE_CLASS=<precise-category>
ORIGINAL_CALL3_ENV_PROVEN=<YES|NO>
PRODUCTION_GUARD_PRESERVED=YES
EXACT_FULL_ADAPTER_PROVIDER_DISABLED_E2E=PASS
SAFE_ERROR_CLASSIFICATION=PASS
PRODUCT_SOURCE_CHANGED=<YES|NO>
FULL_TESTS=PASS
ARM64_BUILD=PASS
SECRET_SCAN=PASS
GLM53_REVIEW=<PASS|NOT_REQUIRED_NO_SOURCE_CHANGE>
PROVIDER_CALLS_THIS_CAMPAIGN=0
8D1K_PRIOR_PROVIDER_CALLS_USED=3_OF_3
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_ROOT_CAUSE_AND_AUTHORIZE_OR_REJECT_NEW_BOUNDED_PROVIDER_VALIDATION
```

If the root cause remains unresolved despite the full deterministic matrix:

```text
CAMPAIGN=8D1K_D
STATUS=DETERMINISTIC_DIAGNOSIS_EXHAUSTED_ROOT_CAUSE_NOT_ISOLATED
PROVIDER_CALLS_THIS_CAMPAIGN=0
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_UNRESOLVED_ADAPTER_DIFFERENTIAL
```

## 21. Controller liveness

This is a long-run campaign.

Luna/Codex should continue automatically through D0 -> D1 -> D2 -> D3 -> D4 and, where justified, D5 -> D6 -> D7 -> D8 -> D9.

Do not return control merely because one deterministic substage completed.

Automatically continue while:

- the next action is authorized by this directive;
- no provider call is required;
- no human-only credential action is required;
- no hard stop has occurred.

If a deterministic finding identifies a bounded source defect, adjudicate it, correct it, validate it, review it, checkpoint it, and continue.

Stop only at the final human provider-revalidation decision boundary or a genuine hard stop.
