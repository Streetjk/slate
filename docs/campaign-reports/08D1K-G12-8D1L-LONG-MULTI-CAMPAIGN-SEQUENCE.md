# Campaign 8D1K-G12 → G13 → 8D1L — Long Multi-Campaign Recovery-to-Readiness Sequence

Date: 2026-09-03 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Authoritative base: `integration/note4-custom`

## 1. Purpose

This directive replaces short, repeatedly interrupted campaign fragments with one long-running autonomous sequence from the completed G11 forensic checkpoint through the next genuine human boundaries.

The intended execution model is:

1. G12 — zero-provider harness/runtime normalization and final deterministic closure;
2. HUMAN PROVIDER-CALL AUTHORIZATION GATE;
3. G13 — exactly one corrected full-Slate-adapter real-provider revalidation, but only after a later explicit human authorization checkpoint exists;
4. if and only if G13 passes, continue automatically into 8D1L non-production production-readiness audit;
5. stop at the final human production/data-policy/deployment decision boundary before 8D1M.

This directive is deliberately long-lived. Codex must not return control for routine recoverable setup, ordinary Docker inspection, local/ARM64 deterministic validation, report publication, bounded source correction, reviewer retries within the defined safe review route, or other zero-provider/non-production work.

## 2. Current accepted checkpoint

G11 proved that the most recent corrected-provider hard stop was a harness error, not evidence of a Slate or Gemini provider defect.

Accepted G11 root cause:

```text
G10_FAILURE_CLASS=SPAWN_THROWN_BEFORE_CHILD
G10_FAILURE_DETAIL=HARNESS_NODE_EXECUTABLE_PATH_MISMATCH
G10_CHILD_CREATED=NO
ROOT_CAUSE=G10_HARNESS_NODE_EXECUTABLE_PATH_MISMATCH
```

The failed G10 harness hard-coded:

```text
GEMINI_NODE_EXECUTABLE=/usr/local/bin/node
```

but that path is absent from the exact ARM64 image. The image resolves the working Node-compatible executable through:

```text
/usr/local/bun-node-fallback-bin/node
```

which reports Node-compatible version `26.3.0` and can import `@google/genai/node`.

With the correct executable, G11 provider-disabled replay of the exact G10 shape passed:

```text
EXACT_G10_SHAPE_PROVIDER_DISABLED_E2E=PASS
EXACT_G10_SHAPE_BUN_PARENT=PASS
EXACT_G10_SHAPE_NODE_CHILD_SPAWN=PASS
EXACT_G10_SHAPE_JSONL_OPEN_READY=PASS
EXACT_G10_SHAPE_TEXT_FRAME_PATH=PASS
EXACT_G10_SHAPE_DURABLE_RESULT=PASS
NODE_EXECUTABLE_FOUND=YES
NODE_CAN_IMPORT_GOOGLE_GENAI_NODE=YES
CHILD_PROCESS_SPAWN_EVENT_OBSERVED=YES
CHILD_PID_ASSIGNED=YES
CHILD_CAN_EMIT_SANITIZED_JSONL=YES
PARENT_CAN_PARSE_CHILD_JSONL=YES
PROVIDER_CALLS_THIS_CAMPAIGN=0
```

The accepted corrected product/runtime source remains:

```text
7a724488a9ed20093469caefc03addc764185be5
```

Do not attribute the prior corrected-provider failure to the Gemini API. The exact child never started.

## 3. Historical provider-call accounting — immutable

Preserve all prior accounting exactly:

```text
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_F_PROVIDER_CALLS_USED=1_OF_1
8D1K_G_CORRECTED_PROVIDER_CALLS_USED=1_OF_1
```

Nothing in G12 resets, extends, retries, or reuses those budgets.

This directive itself authorizes:

```text
G12_PROVIDER_CALLS_AUTHORIZED=0
G13_PROVIDER_CALLS_AUTHORIZED=0_UNTIL_SEPARATE_HUMAN_CHECKPOINT
8D1L_PROVIDER_CALLS_AUTHORIZED=0
```

A future human may later authorize exactly one new G13 call by publishing an explicit authorization checkpoint. Until then, G13 must not execute.

## 4. Routing and responsibilities

- Controller/stage authority: Luna.
- Worker: Sonnet 4.6 for bounded implementation/correction only when deterministic evidence identifies a real source/test/harness defect.
- Independent reviewer: exact `zai-glm53-reviewer` / `glm-5.3-flash`, read-only, when tracked product/runtime source changes or when explicitly required by a stage.
- Codex: sole repository writer, integrator, deterministic validator, report/checkpoint publisher, and remote-verification owner.

No silent reviewer substitution. Do not substitute GLM-5.2, Grok, Gemini, Claude, AGY, or another ZAI model/profile for the required exact GLM-5.3 route.

## 5. Permanent safety invariants

The following remain prohibited unless a later explicit human boundary grants them:

- production Slate deployment or restart;
- production `.env` mutation or loading into disposable harnesses;
- production Developer API enablement;
- billing enablement or account-tier change;
- Vertex enablement;
- firmware flashing;
- PR #2 merge;
- Campaign 6D work;
- PR #1 or PR #3 expansion;
- destructive storage changes;
- credential movement/copying/exposure;
- reading or printing credential values;
- broad environment dumps containing secrets;
- private NOTE4/Outlook/Calendar payloads in provider validation;
- microphone input in synthetic provider validation;
- generated audio retention.

Outlook remains read-only and isolated. Google Calendar remains proposal-only until a later physical confirmation flow. NOTE4 must never store Gemini/Google credentials or call Gemini directly.

## 6. Credential handling contract

The established protected host source is:

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

Codex may verify only safe metadata required for the existing runtime mechanism: existence, regular-file status, non-symlink status, owner/group/mode, non-empty size, readable-by-intended-runtime status, and read-only Docker mount metadata.

Never `cat` the file, print it, hash its contents, copy it, move it, commit it, put it in argv, put it into a build layer, inspect it through raw Docker logs, or load the production `.env` to recover it.

## 7. REPORT-PUSH-INVARIANT

At every meaningful checkpoint, stage completion, hard stop, human boundary, reviewer block, validation failure, or success:

1. update the relevant campaign report;
2. update `docs/campaign-reports/CAMPAIGN-STATE.md` when status changed;
3. run secret-safe report checks and `git diff --check`;
4. commit selectively;
5. push the active branch;
6. fetch/verify remote;
7. record the exact pushed SHA;
8. verify PR #2 remains in the intended state;
9. only then return control if a true return boundary has been reached.

Expected durable evidence:

```text
REPORT_UPDATED=YES
CAMPAIGN_STATE_UPDATED=<YES|NO_NOT_REQUIRED>
REPORT_COMMITTED=YES
REPORT_PUSHED=YES
REMOTE_SHA_VERIFIED=YES
PUSHED_SHA=<exact sha>
PR_STATE_VERIFIED=YES
```

No local-only report counts as durable.

---

# G12 — Harness/runtime normalization and deterministic closure

## G12-0 Reconcile exact current state

Fetch origin, verify branch/remote head, confirm G11 report and campaign state, and preserve the G11 root-cause attribution exactly.

Do not redo G11 forensic work unless fresh evidence contradicts it.

## G12-1 Normalize the executable-selection contract

Determine how the real Slate adapter and disposable validation harness should resolve the Node executable in the exact candidate image.

Required outcome: future validation must not hard-code a nonexistent image path.

Preferred order:

1. use the same executable-selection semantics as the product configuration if already safe and deterministic;
2. otherwise resolve `node` through the image PATH after verifying the resolved executable and version;
3. otherwise use the exact proven path `/usr/local/bun-node-fallback-bin/node` only if the image contract makes that path durable;
4. do not introduce a production-only path solely to satisfy a test harness.

If the defect exists only in disposable harness construction, fix/document the harness contract and tests without unnecessary product-runtime changes.

If tracked product source changes, obtain exact GLM-5.3 review after deterministic validation.

## G12-2 Add deterministic regression coverage

Create or strengthen provider-disabled tests that prove, without Gemini:

- executable resolution does not select `/usr/local/bin/node` when absent;
- child process actually starts;
- child PID is assigned;
- `@google/genai/node` import works in the exact ARM64 image;
- Bun parent ↔ Node child JSONL open/ready path passes;
- corrected realtime text path passes;
- secret path remains under trusted `/run/secrets/` or `/var/run/secrets/` roots;
- production guard remains fail-closed;
- safe failure-stage observability distinguishes at minimum synchronous spawn failure from child-started-then-exited-before-ready where technically feasible;
- raw stderr/provider detail remains suppressed or sanitized.

Do not weaken credential or production guards for test convenience.

## G12-3 Exact G10-shaped provider-disabled ARM64 replay

Re-run the exact G10 container shape, but provider-disabled and with synthetic secret material:

- same ARM64 candidate lineage;
- same Bun parent;
- same corrected source;
- same workdir;
- same user override where applicable;
- same read-only root/tmpfs constraints;
- same source/runner/result mount shape;
- same runtime env except provider access disabled;
- correct proven Node executable resolution;
- `network=none`;
- durable result capture;
- independent wait/status/result recovery;
- cleanup only after evidence verification.

Success requires:

```text
G12_EXACT_SHAPE_PROVIDER_DISABLED_E2E=PASS
BUN_PARENT=PASS
NODE_CHILD_SPAWN=PASS
JSONL_READY=PASS
TEXT_PATH=PASS
DURABLE_RESULT=PASS
PROVIDER_CALLS=0
```

## G12-4 Full deterministic gates

Run the complete relevant backend/shared tests, lint, typecheck, format check, frontend build, Node syntax/runtime checks, secret scan, `git diff --check`, and ARM64 image validation.

If product/runtime source changed, obtain exact GLM-5.3 review of the exact accepted source SHA and have Luna adjudicate all findings. P0/P1 must be zero before G12 can close. P2 requires explicit adjudication and normally correction before closure.

## G12-5 Publish durable G12 checkpoint

Success target:

```text
CAMPAIGN=8D1K_G12
STATUS=ZERO_PROVIDER_HARNESS_RUNTIME_CLOSED_READY_FOR_G13_HUMAN_PROVIDER_AUTHORIZATION
G11_ROOT_CAUSE_PRESERVED=YES
G12_PROVIDER_CALLS_USED=0
FULL_TESTS=PASS
ARM64_BUILD=PASS
EXACT_SHAPE_PROVIDER_DISABLED_E2E=PASS
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_G13_AUTHORIZATION=YES
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_AUTHORIZE_OR_REJECT_EXACTLY_ONE_NEW_G13_PROVIDER_CALL
```

### G12 return-control rule

Do not return control before G12 completes unless a genuine security/technical boundary appears.

At successful G12 completion, return control exactly once for the G13 provider-call authorization decision.

---

# HUMAN G13 PROVIDER-CALL AUTHORIZATION GATE

This file does **not** authorize G13.

G13 may run only if a later durable human authorization checkpoint explicitly states all of the following:

```text
CAMPAIGN=8D1K_G13
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=0_OF_1
MODEL=gemini-3.1-flash-live-preview
SOURCE_SHA=<exact G12 accepted source>
SYNTHETIC_INPUT_ONLY=YES
PRIVATE_DATA_AUTHORIZED=NO
MICROPHONE_AUTHORIZED=NO
SEARCH_ENABLED=NO
PRODUCTION_MUTATION_AUTHORIZED=NO
```

A chat request to read/advise is not authorization. A report read is not authorization. Historical provider budgets must remain immutable.

Once that explicit authorization checkpoint exists, Codex should resume this same directive at G13 without requiring another large campaign document.

---

# G13 — One corrected exact full-Slate-adapter real-provider revalidation

## G13-0 Reconcile authorization and exact artifact

Before the call:

- verify exact G13 authorization checkpoint exists;
- verify `PROVIDER_CALLS_USED=0_OF_1` for G13;
- verify exact accepted source/image lineage;
- verify correct Node executable resolution from G12;
- verify protected credential metadata only;
- verify production remains healthy/untouched;
- verify Search disabled;
- record that custom function declarations may remain present if that is the actual Slate contract, but no tool invocation is authorized;
- verify no private NOTE4/Outlook/Calendar data and no microphone input.

## G13-1 Exact single provider call

Use exactly one Live session through the full path:

```text
Slate service
→ Bun parent
→ Node bridge
→ Gemini Live
```

Model:

```text
gemini-3.1-flash-live-preview
```

Synthetic text only:

```text
Say exactly TEST.
```

Use explicit non-production mode and the exact validated runtime/harness shape from G12.

No second call is permitted by this stage.

## G13-2 PASS criteria

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
```

Durable sanitized result must survive launcher disconnect/timeout and be independently recoverable.

## G13-3 Failure rule

If the single call fails:

- do not retry;
- do not make a Node control call unless separately authorized later;
- capture only sanitized failure stage and safe operational metadata;
- do not read raw provider bodies or secret values;
- publish/push/verify a hard stop;
- stop for human review.

## G13-4 Success rule

If G13 passes:

- publish/push/verify the G13 PASS checkpoint;
- set `READY_FOR_8D1L=YES`;
- make no additional Gemini provider calls;
- continue automatically into 8D1L under this same directive without returning control.

---

# 8D1L — Non-production production-readiness audit

8D1L authorizes zero new provider calls and zero production mutations.

## L0 Reconcile exact G13 PASS artifact

Confirm G13 passed on the exact artifact that will be audited. Reject artifact drift.

## L1 Current Google/API contract refresh

Using official current Google documentation, refresh and record only the policy/runtime facts necessary for production readiness, including:

- exact model availability/status for `gemini-3.1-flash-live-preview`;
- supported Live API transport and SDK/runtime expectations;
- current API-key/authorization-key migration requirements;
- current Free Tier vs Paid Tier data-use treatment;
- any current deprecation or deadline relevant to September 2026 production use.

Do not enable billing, create credentials, or mutate provider configuration.

## L2 Production architecture audit

Verify without mutation:

- backend remains model authority;
- NOTE4 contains no Gemini/Google credentials;
- production Developer API mode remains fail-closed unless later explicitly authorized;
- current production model/runtime remains unchanged;
- Outlook remains isolated/read-only;
- Google Calendar remains proposal-only until physical confirmation;
- Search/tool boundaries remain as documented;
- no public Node bridge listener exists;
- secret references remain runtime-only/backend-only;
- no secret appears in image history, build context, repository, report, logs, or frontend/firmware artifacts.

## L3 Exact ARM64 candidate/rollback audit

Build/verify the exact ARM64 candidate from the accepted G13 source and record:

- image ID/digest;
- architecture;
- Bun version;
- Node-compatible executable/version/path;
- `@google/genai/node` import proof;
- image environment/history secret scan;
- healthcheck expectations;
- rollback image/tag availability;
- production-current image identity;
- zero production mutation.

## L4 Failure/rollback matrix

Document and deterministically validate safe handling for:

- missing credential reference;
- unreadable credential;
- missing Node executable;
- child spawn error;
- child exits before ready;
- provider connect failure;
- connect timeout;
- provider error after ready;
- text-send failure;
- unexpected session close;
- reconnect path;
- production guard rejection;
- rollback trigger conditions.

No real provider call is authorized for these tests.

## L5 Full deterministic regression

Run full backend/shared tests, lint, typecheck, format, frontend build, secret scan, ARM64 validation, diff check, and any relevant firmware compile-only regression if the audited source touches shared firmware-facing contracts. Do not flash firmware.

If tracked product/runtime source changes during L, obtain fresh exact GLM-5.3 review and Luna adjudication before closing L.

## L6 Production-readiness dossier

If every audit item passes, publish:

```text
CAMPAIGN=8D1L
STATUS=NONPROD_PRODUCTION_READINESS_AUDIT_PASS_READY_FOR_HUMAN_PRODUCTION_DECISION
G13_REAL_PROVIDER_E2E=PASS
PROVIDER_CALLS_IN_8D1L=0
FULL_TESTS=PASS
ARM64_BUILD=PASS
SECRET_SCAN=PASS
ROLLBACK_READY=YES
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1M=NO
READY_FOR_HUMAN_PRODUCTION_DECISION=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_DECIDE_PRODUCTION_KEY_DATA_POLICY_BILLING_DEPLOYMENT_AND_PHYSICAL_E2E_AUTHORIZATION
```

Stop here.

Do not begin 8D1M merely because 8D1L passed.

---

# Final controller liveness rules

Codex should behave as a long-running controller, not a sequence of micro-campaigns.

Do **not** return control for:

- Git fetch/network escalation that is already covered by the current execution mode;
- routine Docker metadata reads;
- safe filesystem metadata checks;
- rebuilding disposable provider-disabled images;
- deterministic test failures that can be fixed within the bounded source scope;
- ordinary lint/typecheck/format/test repair;
- report updates;
- report commits/push/remote verification;
- scope-limited GLM reviewer retry after a bounded reviewer timeout, provided the exact reviewer route remains the same and no secret is exposed;
- cleanup of disposable non-production containers/images created by these stages, provided cleanup is non-destructive outside their exact identifiers.

Return control only for a true boundary:

1. G12 completed and a new Gemini provider call requires explicit human authorization;
2. G13 failed after the single authorized call;
3. a secret value must be newly supplied/read/exposed outside the established protected mechanism;
4. production deploy/restart/environment mutation is required;
5. billing/Vertex/account-tier change is required;
6. firmware flash is required;
7. PR merge is required;
8. destructive host/storage action is required;
9. an unresolved P0/P1 security issue remains;
10. 8D1L passes and the next action is the final human production/data-policy/deployment decision.

The goal is hours of autonomous safe execution with only genuine human boundaries interrupting the controller.

---

# G12 execution record

## G12-0 preflight

```text
CAMPAIGN=8D1K_G12
STATUS=G12_PREFLIGHT_EXECUTING_ZERO_PROVIDER
REMOTE_CHECKPOINT=26bf1409648fc36c37569330760f12bb1685b76a
G11_ROOT_CAUSE_PRESERVED=YES
ROOT_CAUSE=G10_HARNESS_NODE_EXECUTABLE_PATH_MISMATCH
ACCEPTED_SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
G12_PROVIDER_CALLS_AUTHORIZED=0
G12_PROVIDER_CALLS_USED=0
G13_PROVIDER_CALLS_AUTHORIZED=0_UNTIL_SEPARATE_HUMAN_CHECKPOINT
8D1L_PROVIDER_CALLS_AUTHORIZED=0
NODE_EXECUTABLE_CONTRACT=PATH_NODE
G10_HARNESS_PATH=/usr/local/bin/node
G10_HARNESS_PATH_PRESENT=NO
ARM64_NODE_PATH=/usr/local/bun-node-fallback-bin/node
ARM64_NODE_VERSION=26.3.0
NODE_CAN_IMPORT_GOOGLE_GENAI_NODE=YES_FROM_G11_EVIDENCE
PRODUCT_SOURCE_CHANGED=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
READY_FOR_G13_AUTHORIZATION=NO_UNTIL_G12_CLOSES
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=NO_DURING_G12
NEXT_ACTION=RUN_G12_ZERO_PROVIDER_EXACT_SHAPE_ARM64_REPLAY_AND_DETERMINISTIC_GATES
```

The working tree was clean after fetching origin. Existing tracked bridge and
adapter tests already cover PATH-preserving executable selection, child
startup/JSONL exchange, production fail-closed configuration, synthetic text,
and sanitized failure handling. No product/runtime source correction is
indicated by the accepted G11 evidence, so this stage continues with a
provider-disabled harness-only replay.

## G12 execution closure

The first replay failure was preserved above and corrected only in the
disposable runner: the image-compatible version probe is
`node --input-type=module -e 'console.log(process.versions.node)'`, not
`node --version`. The corrected replay used the exact ARM64 image boundary,
PATH-based `node`, synthetic credential material only, `network=none`,
read-only root/tmpfs constraints, independent result capture, separate
status/wait/result/log retrieval, and cleanup after evidence.

```text
CAMPAIGN=8D1K_G12
STATUS=ZERO_PROVIDER_HARNESS_RUNTIME_CLOSED_READY_FOR_G13_HUMAN_PROVIDER_AUTHORIZATION
G11_ROOT_CAUSE_PRESERVED=YES
ROOT_CAUSE=G10_HARNESS_NODE_EXECUTABLE_PATH_MISMATCH
ACCEPTED_SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
G12_HARNESS_CORRECTION=PROCESS_VERSIONS_NODE_PROBE
G12_PROVIDER_CALLS_AUTHORIZED=0
G12_PROVIDER_CALLS_USED=0
G13_PROVIDER_CALLS_AUTHORIZED=0_UNTIL_SEPARATE_HUMAN_CHECKPOINT
8D1L_PROVIDER_CALLS_AUTHORIZED=0
EXACT_SHAPE_PROVIDER_DISABLED_E2E=PASS
BUN_PARENT=PASS
NODE_CHILD_SPAWN=PASS
CHILD_PID_ASSIGNED=YES
JSONL_READY=PASS
TEXT_PATH=PASS
MODEL_EVENT=YES_MOCK_ONLY
TURN_COMPLETE=YES_MOCK_ONLY
TOOL_INVOCATIONS=0
SEARCH_EXECUTED=NO
PRIVATE_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
DURABLE_RESULT=PASS
RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
WAIT_LAUNCHER_TIMEOUT=YES_RC_124
FULL_BACKEND_TESTS=PASS_327_4_EXPECTED_SYNTHETIC_SKIPS
SHARED_TESTS=PASS_6
LINT=PASS
TYPECHECK=PASS
FORMAT=PASS
FRONTEND_BUILD=PASS
NODE_SYNTAX=PASS
ARM64_BUILD=PASS
ARM64_CANDIDATE_IMAGE=sha256:fa280ce50cc707f4c442834b3759638ca73851494ce4893a70208a96d2c1807d
ARM64_CANDIDATE_ARCH=linux_arm64
ARM64_CANDIDATE_BUN_VERSION=1.4.0
ARM64_CANDIDATE_NODE_PATH=/usr/local/bin/node
ARM64_CANDIDATE_NODE_VERSION=26.3.0
ARM64_CANDIDATE_GENAI_NODE_IMPORT=PASS
IMAGE_HISTORY_SECRET_SCAN=PASS
BUILD_CONTEXT_SECRET_BOUNDARY=PASS
PRODUCTION_HEALTH=PASS
PRODUCTION_CURRENT_IMAGE=sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
ROLLBACK_TAGS_AVAILABLE=YES
PRODUCT_SOURCE_CHANGED=NO
GLM53_REVIEW=NOT_REQUIRED_NO_TRACKED_PRODUCT_SOURCE_CHANGE
LUNA_ADJUDICATION=PASS_NO_SOURCE_CORRECTION_REQUIRED
READY_FOR_G13_AUTHORIZATION=YES
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_AUTHORIZE_OR_REJECT_EXACTLY_ONE_NEW_G13_PROVIDER_CALL
```

G12 is closed successfully with zero Gemini provider calls. No tracked
product/runtime source changed, so no new GLM review was required. G13,
8D1L, and 8D1M remain outside this authorization and are not started.

## G12 first replay failure and bounded harness correction

```text
CAMPAIGN=8D1K_G12
STATUS=G12_HARNESS_CORRECTION_IN_PROGRESS_ZERO_PROVIDER
G12_PROVIDER_CALLS_USED=0
G12_EXACT_SHAPE_PROVIDER_DISABLED_E2E=FAIL_HARNESS_ONLY
RESULT_DURABLY_RECOVERABLE=YES
RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
WAIT_LAUNCHER_TIMEOUT=YES_RC_124
CONTAINER_EXIT=1
OOM=NO
NODE_CONFIGURED=node
NODE_EXECUTABLE_PATH_USED=/usr/local/bun-node-fallback-bin/node
NODE_EXECUTABLE_FOUND=YES
NODE_VERSION_PROBE=node_--version_UNSUPPORTED_BY_IMAGE_WRAPPER
NODE_VERSION_PROBE_EXIT=1
NODE_IMPORT_PROBE=NOT_REACHED_IN_RUNNER
FAILURE_CLASS=HARNESS_NODE_VERSION_FLAG_INCOMPATIBLE
PRODUCT_SOURCE_CHANGED=NO
PROVIDER_CALLS=0
PRODUCTION_CHANGED=NO
```

The first replay used the correct PATH-based executable, but the disposable
runner used `node --version`, which the image’s Node-compatible wrapper rejects.
An independent provider-disabled image probe confirmed the supported
`process.versions.node` version check. This is a bounded harness-only defect;
the reviewed Slate source remains unchanged. The failed container was removed
after independent status/result evidence was captured.
