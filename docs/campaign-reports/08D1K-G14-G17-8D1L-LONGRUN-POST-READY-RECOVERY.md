# Campaign 8D1K-G14 → G17 → 8D1L — Long-Run Post-Ready Recovery-to-Readiness Sequence

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Authoritative base: `integration/note4-custom`
Starting remote checkpoint: `733aec6a32e5ce63d20fe45d9b8f4c0c09f6bb37`
Accepted product/runtime source at start: `7a724488a9ed20093469caefc03addc764185be5`

## 1. Purpose

This directive replaces repeated short recovery fragments after the G13 hard stop with one long-running controller sequence that performs all safe zero-provider, non-production work autonomously before returning to the human.

The intended sequence is:

1. G14 — preserve and reconstruct the exact G13 post-ready timeout evidence;
2. G15 — exact SDK/protocol/turn-boundary conformance audit with zero provider calls;
3. G16 — bounded post-ready observability/turn-completion correction only if deterministic evidence justifies it, followed by full validation and exact review;
4. HUMAN PROVIDER-CALL AUTHORIZATION GATE;
5. G17 — one future exact full-Slate-adapter real-provider validation only if a separate explicit human checkpoint later authorizes it;
6. if and only if G17 passes, continue automatically into existing 8D1L non-production production-readiness audit;
7. stop at the final human production/API-key/data-policy/deployment decision before 8D1M.

This file authorizes all ordinary G14-G16 zero-provider/non-production work. It does **not** authorize a new Gemini provider call, production deployment/restart, billing/Vertex changes, firmware flashing, credential replacement/exposure, destructive host work, PR #2 merge, or 8D1M.

Codex must not return control for ordinary recoverable setup, Docker inspection, exact image probing, local/ARM64 mock runs, bounded source corrections justified by deterministic evidence, reviewer retries on the exact authorized route, report publication, commits, pushes, remote verification, or similar zero-provider work.

Return control only at a genuine security/technical boundary that remains unresolved after the authorized deterministic work, or at the explicit G17 provider-call human gate after G14-G16 close successfully.

---

## 2. Accepted G13 hard stop — preserve exactly

The starting evidence is authoritative:

```text
CAMPAIGN=8D1K_G13
STATUS=HARD_STOP_G13_EXACT_ADAPTER_PROVIDER_FAILURE
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=1_OF_1
PROVIDER_CALLS_REMAINING=0
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_F_PROVIDER_CALLS_USED=1_OF_1
8D1K_G_CORRECTED_PROVIDER_CALLS_USED=1_OF_1
MODEL=gemini-3.1-flash-live-preview
NODE_ENV=test
AUTH_MODE=developer_api_key
LIVE_RUNTIME=node_bridge
NODE_CHILD_SPAWN=YES
BRIDGE_READY=YES
MODEL_EVENT=NO
TURN_COMPLETE=NO
G13_FAILURE_CLASS=MODEL_EVENT_TIMEOUT_AFTER_BRIDGE_READY
G13_REPORTED_FAILURE_STAGE=UNKNOWN_SAFE_FAILURE
TOOL_INVOCATIONS=0
SEARCH_EXECUTED=NO
PRIVATE_DATA_SENT=NO
OUTLOOK_DATA_SENT=NO
CALENDAR_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
OOM=NO
RESULT_DURABLY_RECOVERABLE=YES
RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
WAIT_LAUNCHER_TIMEOUT=YES_RC_124
RAW_PROVIDER_ERROR_READ=NO
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
```

Do not rewrite G13 as a child-spawn failure, credential failure, or proven Gemini-provider outage. G13 proved that the child was created and the bridge reached `ready`. The unresolved boundary is post-ready: no provider callback/model event/turn completion was observed before the bounded result timer expired.

Do not infer that the provider definitely received the text until deterministic G14-G16 evidence proves the exact outgoing frame path sufficiently. Do not infer that the provider definitely did not receive it either.

Historical live-call accounting is immutable. Nothing in this directive resets, extends, retries, or reuses any prior budget.

```text
G14_PROVIDER_CALLS_AUTHORIZED=0
G15_PROVIDER_CALLS_AUTHORIZED=0
G16_PROVIDER_CALLS_AUTHORIZED=0
G17_PROVIDER_CALLS_AUTHORIZED=0_UNTIL_SEPARATE_HUMAN_CHECKPOINT
8D1L_PROVIDER_CALLS_AUTHORIZED=0
```

---

## 3. Routing and authority

- Controller/stage authority: Luna.
- Worker: Sonnet 4.6 for bounded implementation/correction when deterministic evidence identifies a concrete product/runtime/test/harness defect.
- Independent reviewer: exact `zai-glm53-reviewer` / `glm-5.3-flash`, read-only, for any tracked product/runtime source change and for final G16 closure if source behavior changes.
- Codex: sole repository writer, integrator, validator, report/checkpoint publisher, and remote-verification owner.

No silent reviewer substitution. Do not substitute GLM-5.2, Grok, Hermes, Gemini, Claude, AGY, another ZAI model, or another profile for required exact GLM-5.3 review.

If the exact reviewer route experiences a bounded execution timeout, retry only in a narrower read-only scope using the exact relevant diff plus sanitized deterministic evidence. Do not silently replace the reviewer.

---

## 4. Permanent safety invariants

The following remain binding throughout G14-G16 and any later G17/8D1L transition:

- production Slate deploy/restart: NO;
- production `.env` load/mutation in disposable validation: NO;
- production Developer API enablement: NO;
- billing/tier change: NO;
- Vertex enablement: NO;
- firmware flash: NO;
- PR #2 merge: NO;
- Campaign 6D work: NO;
- PR #1 or PR #3 expansion: NO;
- destructive storage changes: NO;
- credential value read/print/hash/copy/move: NO;
- raw provider error-body inspection: NO unless a later explicit security-safe human authorization states otherwise;
- private NOTE4/Outlook/Calendar payloads in validation: NO;
- microphone input in synthetic provider validation: NO;
- generated audio retention: NO.

Outlook remains read-only and isolated. Google Calendar remains proposal-only until physical confirmation. NOTE4 must never store Gemini/Google credentials or call Gemini directly.

Established protected Gemini credential mechanism remains metadata-only for this campaign:

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

Codex may verify safe metadata only. Never `cat`, print, hash, copy, move, commit, screenshot, place in argv, place in a Docker layer, or expose the credential through logs/environment dumps.

---

## 5. REPORT-PUSH-INVARIANT

`docs/campaign-reports/REPORT-PUSH-INVARIANT.md` is binding.

At every meaningful checkpoint, stage completion, hard stop, reviewer block, technical boundary, human boundary, or final success:

1. update the relevant report;
2. update `docs/campaign-reports/CAMPAIGN-STATE.md` when stage/status/next action changed;
3. run secret-safe report checks and at minimum `git diff --check`;
4. selectively commit authorized files;
5. push the active branch;
6. fetch/verify the remote branch;
7. record exact pushed SHA;
8. verify PR #2 remains open/draft/unmerged unless a later explicit human action says otherwise;
9. only then return control if a legitimate return boundary exists.

Normal durable evidence:

```text
REPORT_UPDATED=YES
CAMPAIGN_STATE_UPDATED=<YES|NO_NOT_REQUIRED>
REPORT_COMMITTED=YES
REPORT_PUSHED=YES
REMOTE_SHA_VERIFIED=YES
PUSHED_SHA=<exact sha>
PR_STATE_VERIFIED=YES
PR_STATE=open_draft_unmerged
```

No local-only checkpoint counts as complete.

---

# G14 — Exact G13 post-ready forensic reconstruction

## G14-0 Reconcile exact state

Fetch/prune origin and verify:

- branch is `feature/gemini-35-live-evaluation`;
- PR #2 remains open/draft/unmerged;
- starting remote checkpoint contains the G13 hard stop;
- accepted source remains `7a724488a9ed20093469caefc03addc764185be5` unless later tracked source changes are made under this directive;
- historical call accounting is unchanged;
- G13 is exhausted `1_OF_1` and no retry is authorized;
- production health is read-only verified if safe;
- no unrelated work is overwritten.

Read before execution:

- `AGENTS.md` and repository-local instructions;
- `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`;
- `docs/campaign-reports/CAMPAIGN-STATE.md`;
- `docs/campaign-reports/08-GEMINI-35-LIVE.md`;
- `docs/campaign-reports/08D1K-G12-8D1L-LONG-MULTI-CAMPAIGN-SEQUENCE.md`;
- `docs/campaign-reports/08D1K-G13-HUMAN-PROVIDER-AUTHORIZATION.md`;
- this directive.

## G14-1 Reconstruct the exact G13 timeline without another provider call

Use only durable/sanitized existing evidence, disposable-container metadata still safely available, local command/session history where non-secret, existing runner scripts if preserved, Git history, and report evidence.

Determine and record, where recoverable:

```text
G13_CONTAINER_START_T0=<relative or sanitized timestamp>
G13_BUN_PARENT_START=<...>
G13_NODE_CHILD_SPAWN=<...>
G13_BRIDGE_READY=<...>
G13_TEXT_FRAME_CREATED=<YES|NO|UNKNOWN>
G13_TEXT_FRAME_WRITTEN_TO_CHILD_STDIN=<YES|NO|UNKNOWN>
G13_RUNTIME_TEXT_HANDLER_REACHED=<YES|NO|UNKNOWN>
G13_SDK_SEND_REALTIME_INPUT_CALLED=<YES|NO|UNKNOWN>
G13_FIRST_PROVIDER_CALLBACK=<none|message|error|close|unknown>
G13_MODEL_EVENT_DEADLINE_MS=<exact value if recoverable>
G13_READY_TO_DEADLINE_MS=<exact value if recoverable>
G13_CONTAINER_EXIT=<...>
```

Do not recover this by reading secret values, raw provider bodies, or private logs. If an exact fact cannot be proven, record `UNKNOWN`; do not fill gaps from assumption.

Explicitly separate these clocks:

1. provider connect timeout;
2. bridge ready time;
3. text-dispatch time;
4. first-provider-message timeout;
5. model-turn-complete timeout;
6. outer SSH/docker wait-launcher timeout.

A launcher timeout is not automatically a provider timeout. A provider callback absence is not automatically a text-send failure.

## G14-2 Audit current post-ready classification

Current protocol stages do not have a first-class post-ready model-event timeout code. The G13 runner classified the external result as `MODEL_EVENT_TIMEOUT_AFTER_BRIDGE_READY` while the bridge itself reported `UNKNOWN_SAFE_FAILURE`/no provider event.

Deterministically map all currently distinguishable outcomes:

- synchronous write failure after ready;
- child process error after ready;
- child exit/close after ready;
- provider callback `onerror` after ready;
- provider callback `onclose` after ready;
- first server message received;
- model turn content received;
- output transcription received;
- turnComplete received;
- no provider callback before an explicitly bounded turn deadline.

If source currently conflates distinguishable states, prepare a bounded sanitized observability correction for G16. Do not log raw provider payloads merely to improve classification.

## G14-3 Preserve exact G13 runner/harness behavior

If the G13 disposable runner is not in Git, reconstruct its behavior into a sanitized reproducible test specification before changing anything.

Required evidence:

- exact image lineage;
- exact executable selection semantics;
- exact user/workdir/read-only-root/tmpfs/network/mount shape;
- exact test `NODE_ENV`;
- exact model;
- Search state;
- function-declaration state;
- exact synthetic input;
- exact event predicates used for `MODEL_EVENT` and `TURN_COMPLETE`;
- exact timeout constants;
- durable result file format and atomic-write behavior;
- cleanup order.

If the original runner cannot be reconstructed exactly, say so and build a new G16 runner only after documenting the delta.

## G14-4 Terminal G14 checkpoint

G14 success target:

```text
CAMPAIGN=8D1K_G14
STATUS=G13_POST_READY_FORENSICS_RECONSTRUCTED_ZERO_PROVIDER
PROVIDER_CALLS_USED=0
G13_CHILD_SPAWN=PROVEN_YES
G13_BRIDGE_READY=PROVEN_YES
G13_TEXT_DISPATCH_STAGE=<PROVEN_OR_UNKNOWN>
G13_PROVIDER_CALLBACK_STAGE=<PROVEN_OR_UNKNOWN>
G13_TIMEOUT_BUDGET_RECONSTRUCTED=<YES|PARTIAL>
RAW_PROVIDER_BODY_READ=NO
CREDENTIAL_VALUE_READ=NO
PRODUCTION_CHANGED=NO
READY_FOR_G15=YES
HUMAN_ACTION_REQUIRED=NO
NEXT_ACTION=CONTINUE_G15_ZERO_PROVIDER_SDK_PROTOCOL_CONFORMANCE
```

Continue directly into G15. Do not return control merely because some non-critical historical subfield remains `UNKNOWN` if deterministic current-state testing can answer the operational question safely.

---

# G15 — Exact SDK, wire-shape, and turn-boundary conformance audit

## G15-0 Refresh current official contract

Use current official Google Gemini API / Google GenAI SDK documentation at execution time. Record publication/access date and distinguish model-specific guidance from generic SDK guidance.

At minimum re-check:

- exact availability/status of `gemini-3.1-flash-live-preview`;
- exact JavaScript/Node Live SDK support expectations;
- `sendRealtimeInput({ text })` contract for Gemini 3.1 Live;
- `sendClientContent` limitations for Gemini 3.1 Live, especially initial-history-only behavior if still documented;
- how realtime input determines end-of-turn/user activity;
- `activityStart` / `activityEnd` constraints and their relationship to automatic activity detection;
- audioStreamEnd semantics;
- server `modelTurn`, `outputTranscription`, `generationComplete`, `waitingForInput`, and `turnComplete` semantics;
- tool declaration/function-call behavior that could legitimately cause a turn to wait;
- current exact SDK version behavior versus documentation.

Do not change product behavior merely because generic SDK docs conflict with model-specific Gemini 3.1 guidance. Prefer the exact model-specific contract, exact installed SDK source/types, and deterministic serialization proof.

## G15-1 Prove exact installed SDK version and runtime

Without provider access, determine from lockfile/image/package metadata:

```text
SDK_PACKAGE=@google/genai
SDK_EXACT_VERSION=<exact>
NODE_EXECUTABLE=<resolved path>
NODE_VERSION=<exact>
SDK_NODE_IMPORT=PASS
```

Do not use semver range alone as evidence. Record the exact resolved package version used by the accepted candidate image.

If the package version differs between local, ARM64 candidate, and G13 image, treat that as artifact drift and resolve deterministically before any future provider authorization.

## G15-2 Inspect exact SDK source/types for outgoing realtime text

Provider-disabled/read-only inspection of installed `@google/genai` must answer:

- what `Session.sendRealtimeInput({ text })` serializes onto the WebSocket;
- whether the method is synchronous or schedules work asynchronously;
- whether text alone sets or implies any user activity/turn boundary;
- whether any explicit activity signal is required for text under the exact current implementation;
- whether automatic activity detection affects text input;
- whether callback delivery can occur before/after `sendRealtimeInput` returns;
- whether errors can surface synchronously, asynchronously, or only through callbacks;
- whether the exact model path uses API-version/model-specific transformations.

Do not modify node_modules. Record source locations/version and sanitized conclusions only.

## G15-3 Build a zero-provider SDK wire-capture fixture

Create a deterministic provider-disabled test harness around the exact installed SDK transport or a minimal compatible fake WebSocket/factory that captures outbound messages without contacting Google.

Required assertions:

```text
SDK_CONNECT_SETUP_SERIALIZATION=PASS
SDK_MODEL_ID=gemini-3.1-flash-live-preview
SDK_RESPONSE_MODALITY=AUDIO
SDK_SEARCH_DECLARED=NO
SDK_FUNCTION_DECLARATIONS=<actual documented state>
SDK_REALTIME_TEXT_SERIALIZED=YES
SDK_REALTIME_TEXT_VALUE=synthetic fixture only
SDK_CREDENTIAL_NOT_CAPTURED=YES
SDK_PROVIDER_NETWORK=NO
```

The fixture must not contain the real API key. Use synthetic credential material or a fully provider-disabled client seam.

If exact SDK architecture prevents a stable fake-WebSocket fixture, use source-level serialization tests at the narrowest trustworthy boundary and document the limitation.

## G15-4 Turn-boundary matrix

Build a deterministic matrix for candidate ways to express a complete synthetic text turn **without a real provider call**. Examples to examine, not automatically adopt:

A. current `sendRealtimeInput({ text })` only;
B. realtime text plus explicit activity signals, only if exact official/model-specific contract and SDK permit that combination;
C. initial-history/client-content mechanisms, only where exact Gemini 3.1 model guidance permits them;
D. a synthetic audio-turn fixture using generated local PCM, only as a future validation design option and not as a provider call under G15.

For each candidate record:

```text
OFFICIALLY_SUPPORTED=<YES|NO|AMBIGUOUS>
EXACT_SDK_SUPPORT=<YES|NO>
PRESERVES_REAL_PRODUCT_AUDIO_PATH=<YES|NO>
REQUIRES_CONFIG_CHANGE=<YES|NO>
PROVIDER_CALL_REQUIRED_TO_PROVE_BEHAVIOR=YES_FOR_FINAL_LIVE_EFFECT
```

Do not introduce activityEnd while automatic activity detection remains enabled if the exact current API contract prohibits that combination.

## G15-5 Audit tool/function declaration effect

Current accepted Node runtime validates custom Calendar/BTC function declarations even when Search is off. G13 had zero tool invocations, but the declarations existed if that was the accepted contract.

Provider-disabled audit must determine whether the synthetic prompt could legally produce a function call or wait-for-input state under the current tool/config contract. Add mock fixtures for:

- ordinary model response;
- function call response;
- provider `waitingForInput` message;
- generationComplete without turnComplete;
- output transcription before modelTurn;
- turnComplete with no modelTurn;
- provider error after ready;
- close after ready.

Future provider validation must not incorrectly treat every valid first server message as a successful semantic model response. Define exact PASS predicates.

## G15-6 Audit timeout design

Recover current G13 turn deadline and compare it to the product connect timeout. Separate:

```text
CONNECT_TIMEOUT_MS
FIRST_SERVER_MESSAGE_TIMEOUT_MS
MODEL_RESPONSE_TIMEOUT_MS
TURN_COMPLETE_TIMEOUT_MS
OUTER_LAUNCHER_TIMEOUT_MS
```

A future G17 call must use a documented bounded wait that is long enough to avoid a false negative while still terminating deterministically. The outer launcher timeout must exceed the full inner result budget plus cleanup margin.

Do not simply multiply timeouts without evidence. Use current Google guidance, historical successful call timing if sanitized values exist, and deterministic mock timing tests.

## G15-7 G15 adjudication

Luna must classify the G13 leading hypothesis from deterministic evidence, choosing one or more only when supported:

```text
A_TEXT_TURN_BOUNDARY_NOT_PROVEN
B_SDK_SERIALIZATION_OR_VERSION_MISMATCH
C_RUNNER_TIMEOUT_FALSE_NEGATIVE_RISK
D_CALLBACK_EVENT_PREDICATE_TOO_NARROW
E_TOOL_OR_WAITING_FOR_INPUT_STATE_NOT_ACCOUNTED
F_PRODUCT_RUNTIME_POST_READY_DEFECT
G_PROVIDER_SIDE_BEHAVIOR_REQUIRES_ONE_FUTURE_LIVE_CALL_TO_RESOLVE
H_OTHER_SANITIZED_CLASS
```

If deterministic evidence fully proves a source/harness defect, continue into G16 correction automatically.

If no product defect is proven but future live validation can be made substantially more diagnostic through harness-only improvements, implement those in G16 without changing product behavior unnecessarily.

Continue directly to G16.

---

# G16 — Bounded correction, observability hardening, and final zero-provider closure

## G16-0 Correction policy

Make the minimum correction justified by G14-G15 evidence.

Priority order:

1. harness-only timing/result-predicate correction;
2. test-only SDK/wire-shape regression coverage;
3. sanitized bridge observability improvement;
4. product/runtime turn-boundary correction only if the exact official contract + exact SDK behavior + deterministic tests justify it.

Do not redesign the voice architecture merely to make the synthetic provider test pass.

Do not weaken production guards, credential-reference roots, read-only secret handling, backend model authority, Outlook isolation, Calendar proposal semantics, or no-public-bridge-listener invariant.

## G16-1 Required sanitized post-ready observability

Where technically feasible, make future durable evidence distinguish at least:

```text
BRIDGE_READY=YES
TEXT_FRAME_ACCEPTED_BY_BUN_PARENT=<YES|NO>
TEXT_FRAME_WRITTEN_TO_CHILD=<YES|NO>
RUNTIME_TEXT_HANDLER_REACHED=<YES|NO>
SDK_REALTIME_TEXT_DISPATCH_ATTEMPTED=<YES|NO>
SDK_REALTIME_TEXT_RETURNED=<YES|NO>
FIRST_PROVIDER_MESSAGE_OBSERVED=<YES|NO>
PROVIDER_ERROR_CALLBACK_OBSERVED=<YES|NO>
PROVIDER_CLOSE_CALLBACK_OBSERVED=<YES|NO>
MODEL_TURN_OBSERVED=<YES|NO>
OUTPUT_TRANSCRIPTION_OBSERVED=<YES|NO>
WAITING_FOR_INPUT_OBSERVED=<YES|NO>
GENERATION_COMPLETE_OBSERVED=<YES|NO>
TURN_COMPLETE_OBSERVED=<YES|NO>
POST_READY_TIMEOUT_STAGE=<specific safe enum>
```

Do not persist raw server-message bodies in campaign evidence. Sanitized booleans/event categories/timestamps are sufficient.

If this requires tracked protocol changes, version or validate the internal bridge response shape carefully and update both sides/tests together.

## G16-2 Future G17 harness design

Prepare but do not execute a new real-provider harness.

Requirements:

- exact accepted source/image lineage;
- exact resolved SDK version recorded;
- exact PATH/executable semantics proven;
- synthetic text only by default;
- Search disabled;
- custom function declaration state truthfully recorded;
- no private data;
- no microphone;
- no retained generated audio;
- protected credential read-only mount only after a future human call authorization;
- separate inner turn deadline and outer launcher timeout;
- durable atomic result capture;
- independent recovery after launcher disconnect/timeout;
- no raw provider body capture;
- exact cleanup after result verification;
- only one provider session per future authorization unless the future human checkpoint explicitly says otherwise.

The harness must record a stage timeline with monotonic relative durations, not wall-clock secrets.

## G16-3 Deterministic test matrix

Run/extend zero-provider tests for:

- child spawn/ready;
- exact realtime-text serialization path;
- first-provider-message callback;
- modelTurn event;
- output transcription event;
- waitingForInput event;
- function call event;
- generationComplete;
- turnComplete;
- provider error after ready;
- provider close after ready;
- text-send synchronous exception;
- child stdin failure;
- child exit after ready;
- first-event timeout;
- turn-complete timeout;
- launcher disconnect before result;
- durable result recovery;
- stale-epoch message rejection;
- reconnect path;
- production guard fail-closed;
- credential reference outside trusted roots rejected;
- real credential value never required for deterministic tests.

## G16-4 Full validation

If tracked product/runtime source changes, run the complete relevant suite, including:

- full backend tests;
- shared tests;
- lint;
- typecheck;
- format check;
- frontend build;
- Node syntax/runtime checks;
- exact ARM64 build;
- exact final-image `@google/genai/node` import proof;
- provider-disabled full Slate adapter E2E;
- image history/build-context secret scan;
- report secret scan;
- `git diff --check`;
- read-only production health verification if safe.

If only disposable harness/report files changed, still run all targeted deterministic tests plus exact ARM64 provider-disabled replay sufficient to prove the future G17 harness shape.

## G16-5 Exact GLM-5.3 review

Required if any tracked product/runtime behavior changes.

Review exact final source SHA with:

```text
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_PROVIDER=ZAI
REVIEW_MODEL=glm-5.3-flash
REVIEW_MODE=READ_ONLY
```

Review scope must include:

- Gemini 3.1 Live text/turn-boundary correctness;
- SDK-version assumptions;
- callback/event classification;
- post-ready timeout semantics;
- no secret exposure;
- production guard preservation;
- tool/Search behavior;
- reconnect/epoch correctness;
- regression tests;
- candidate ARM64 behavior.

Luna adjudicates every P0-P3 finding. P0/P1 must be zero. P2 normally requires correction before closure unless Luna has a precise, evidence-backed non-blocking adjudication. Any correction triggers revalidation and re-review of the final relevant diff.

## G16-6 G16 terminal dossier

Success target:

```text
CAMPAIGN=8D1K_G16
STATUS=ZERO_PROVIDER_POST_READY_BOUNDARY_CLOSED_READY_FOR_HUMAN_G17_DECISION
G13_FAILURE_PRESERVED=YES
G14_FORENSICS=PASS
G15_SDK_PROTOCOL_AUDIT=PASS
EXACT_SDK_VERSION=<exact>
G13_LEADING_ROOT_CAUSE_CLASS=<sanitized class>
PRODUCT_SOURCE_CHANGED=<YES|NO>
FINAL_SOURCE_SHA=<exact>
FULL_TESTS=PASS
ARM64_BUILD=PASS
EXACT_FULL_ADAPTER_PROVIDER_DISABLED_E2E=PASS
FUTURE_G17_HARNESS=READY
POST_READY_OBSERVABILITY=PASS
DURABLE_RESULT_RECOVERY=PASS
GLM53_REVIEW=<PASS|NOT_REQUIRED>
PROVIDER_CALLS_G14_G16=0
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_G17_AUTHORIZATION=YES
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_AUTHORIZE_OR_REJECT_FUTURE_G17_PROVIDER_VALIDATION
```

## G17 exact provider execution checkpoint

The separately authorized G17 session was consumed exactly once using the
accepted source/image/SDK lineage. The durable sanitized result passed the
full Slate adapter and was recovered after the launcher control connection
was deliberately disconnected. No additional provider call is authorized;
the flow now continues into the zero-provider 8D1L audit.

```text
CAMPAIGN=8D1K_G17
STATUS=PASS_EXACT_FULL_ADAPTER_REAL_PROVIDER_VALIDATION
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=1_OF_1
PROVIDER_CALLS_REMAINING=0
MODEL=gemini-3.1-flash-live-preview
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
SDK_VERSION=2.20.0
NODE_CHILD_SPAWN=YES
BRIDGE_READY=YES
TEXT_DISPATCH_PROVEN=YES
FIRST_PROVIDER_MESSAGE=YES
MODEL_EVENT=YES
TURN_COMPLETE=YES
TOOL_INVOCATIONS=0
SEARCH_EXECUTED=NO
PRIVATE_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
RESULT_DURABLY_RECOVERABLE=YES
RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
PRODUCTION_CHANGED=NO
READY_FOR_8D1L=YES
READY_FOR_8D1M=NO
NEXT_ACTION=CONTINUE_8D1L_ZERO_PROVIDER_PRODUCTION_READINESS_AUDIT
```

## G16 report-push invariant checkpoint

```text
REPORT_UPDATED=YES
CAMPAIGN_STATE_UPDATED=YES
REPORT_COMMITTED=YES
REPORT_PUSHED=YES
REMOTE_SHA_VERIFIED=YES
PUSHED_SHA=588584f6f504b268ebc35b0bd682437588a98b09
PR_STATE_VERIFIED=YES
PR_STATE=open_draft_unmerged
```

At successful G16 closure, publish/push/verify and return control exactly once for the G17 provider decision.

Do not create a G17 live budget automatically.

---

# HUMAN G17 PROVIDER-CALL AUTHORIZATION GATE

This directive does **not** authorize G17.

A future live call requires a separate durable human authorization checkpoint after G16 is complete.

The future checkpoint must state at minimum:

```text
CAMPAIGN=8D1K_G17
PROVIDER_CALLS_AUTHORIZED=<explicit integer, normally 1>
PROVIDER_CALLS_USED=0_OF_<n>
MODEL=gemini-3.1-flash-live-preview
SOURCE_SHA=<exact G16 accepted source>
IMAGE_ID=<exact accepted ARM64 candidate>
SDK_VERSION=<exact>
SYNTHETIC_INPUT_ONLY=YES
SEARCH_ENABLED=NO
PRIVATE_DATA_AUTHORIZED=NO
MICROPHONE_AUTHORIZED=NO
GENERATED_AUDIO_RETAINED=NO
PRODUCTION_MUTATION_AUTHORIZED=NO
```

A request to read/advise, a report read, or this directive itself is not provider authorization.

No historical call budget may be reused or reset.

---

# G17 — Future exact provider validation, conditional only

G17 executes only after the separate human authorization exists.

## G17-0 Preflight

Before spending any authorized call:

- verify exact authorization checkpoint;
- verify exact final G16 source/image/SDK lineage;
- verify no drift in product/runtime or harness;
- verify current official model availability and any breaking API change;
- verify protected credential metadata only;
- verify production health read-only;
- verify Search off and custom function declaration state recorded truthfully;
- verify synthetic payload only;
- verify inner timeout and outer launcher timeout relationship;
- verify durable result directory/writer/recovery mechanism;
- verify call counter `0_OF_n`.

If any prerequisite fails before provider connection, do not consume a call unless the provider session was actually attempted. Publish the sanitized boundary and stop only if it cannot be safely recovered automatically.

## G17-1 Exact full-adapter call

Use the full path only:

```text
Slate service
→ Bun parent
→ Node bridge
→ exact @google/genai Node runtime
→ Gemini Live
```

Do not substitute a direct SDK control for the full-adapter validation unless a future human checkpoint explicitly budgets and authorizes that distinct call.

Default synthetic text remains:

```text
Say exactly TEST.
```

unless G16 proves a different synthetic turn construction is required and the future G17 human authorization explicitly records that exact construction.

## G17-2 PASS criteria

Require at minimum:

```text
NODE_CHILD_SPAWN=YES
BRIDGE_READY=YES
TEXT_DISPATCH_PROVEN=YES
FIRST_PROVIDER_MESSAGE=YES
MODEL_EVENT=YES
TURN_COMPLETE=YES
TOOL_INVOCATIONS=0
SEARCH_EXECUTED=NO
PRIVATE_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
RESULT_DURABLY_RECOVERABLE=YES
OOM=NO
```

If the model legitimately returns a tool call or waiting-for-input state, classify according to the exact G16/G17 acceptance matrix; do not silently call that a PASS unless the future human authorization defines it as acceptable for the synthetic test.

## G17-3 Failure rule

If a future authorized G17 call fails:

- no retry beyond the explicit G17 budget;
- no ad-hoc direct Node control;
- no raw provider body inspection;
- publish exact sanitized event timeline and consumed accounting;
- keep 8D1L closed;
- stop for human review.

## G17-4 PASS continuation

If G17 passes:

1. publish/commit/push/fetch/verify G17 PASS;
2. set `READY_FOR_8D1L=YES`;
3. make no further provider calls;
4. continue automatically into existing `docs/campaign-reports/08D1L-PRODUCTION-READINESS-AUDIT.md`;
5. do not return control for routine 8D1L zero-provider/non-production work.

---

# 8D1L — Automatic non-production readiness after G17 PASS only

The existing 8D1L directive remains authoritative, with this file adding controller-liveness requirements.

8D1L may start only after a durable G17 exact full-adapter PASS on the artifact being audited.

8D1L authorizes zero provider calls and zero production mutations.

Codex/Luna should complete in one autonomous run where possible:

- current Google model/API-key/data-use policy refresh from official sources;
- production architecture audit;
- exact candidate ARM64 build and image identity;
- exact Node executable/SDK import/version proof;
- no credential in image/history/build context/repo/report/frontend/firmware;
- read-only secret-injection design audit;
- no public Node bridge listener;
- full failure/rollback matrix;
- full deterministic regression;
- exact GLM-5.3 final readiness review;
- deployment matrix with exact proposed env/model/image/secret mount/health/rollback values;
- read-only current production health and rollback-image verification;
- durable report publication.

Success terminal state remains:

```text
CAMPAIGN=8D1L
STATUS=READY_FOR_HUMAN_PRODUCTION_DECISION
READY_FOR_PRODUCTION_DEPLOYMENT_REVIEW=YES
READY_FOR_HUMAN_PRODUCTION_API_KEY_AND_DATA_POLICY_DECISION=YES
READY_FOR_8D1M=NO_UNTIL_EXPLICIT_HUMAN_AUTHORIZATION
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_ACCEPT_OR_REJECT_CURRENT_GEMINI_DATA_POLICY_AND_AUTHORIZE_OR_REJECT_8D1M_DEPLOYMENT
```

Stop there. Do not execute 8D1M automatically.

---

## 6. Controller liveness / anti-micro-stop rule

During G14-G16, and during 8D1L after a future G17 PASS, Codex must continue autonomously through routine recoverable work.

Do **not** return control for:

- ordinary Docker metadata inspection;
- local/ARM64 provider-disabled reproductions;
- exact SDK source/type inspection;
- deterministic fake-WebSocket/wire-capture tests;
- timeout-matrix tests;
- bounded harness corrections;
- bounded source corrections justified by evidence;
- test failures that can be safely corrected within scope;
- exact GLM-5.3 read-only review retries after bounded timeout;
- Luna adjudication;
- report updates;
- selective commits;
- branch pushes;
- remote verification;
- safe cleanup of disposable artifacts after evidence verification.

Return control only when:

1. G16 is durably complete and the new G17 live-call human decision is required;
2. a true credential/security boundary requires human action;
3. production mutation/restart would be required;
4. billing/Vertex/key replacement would be required;
5. firmware flash/PR merge/destructive host work would be required;
6. an unresolved P0/P1 or genuine technical ambiguity remains after the authorized deterministic campaign;
7. or, after a future G17 PASS + completed 8D1L, the final production/data-policy/deployment decision is reached.

---

## 7. Stale-state cleanup requirement

`CAMPAIGN-STATE.md` contains historical descriptive lines that can become stale while later checkpoint blocks are correct. During G14, reconcile the top-level current stage/status/next action and the active feature-branch summary so they no longer claim old F/G authorization states that have already been consumed.

Do not delete historical checkpoint blocks. Correct only stale summary prose while preserving immutable accounting/evidence.

---

## 8. Initial next action

Immediately after fetching this directive, Codex should:

1. reconcile remote head and G13 evidence;
2. update current campaign state to G14 zero-provider post-ready forensic reconstruction;
3. execute G14 → G15 → G16 autonomously;
4. make zero Gemini provider calls;
5. durably publish every meaningful checkpoint under REPORT-PUSH-INVARIANT;
6. return control only at the completed G16 human G17 authorization boundary or a genuine hard/security boundary.

Initial target:

```text
CURRENT_STAGE=8D1K_G14
PROVIDER_CALLS_AUTHORIZED=0
PROVIDER_CALLS_USED=0
NEXT_AUTOMATIC_ACTION=RECONSTRUCT_G13_POST_READY_TIMELINE_THEN_CONTINUE_G15_AND_G16
```

---

# Execution record

## G14 preflight

```text
CAMPAIGN=8D1K_G14
STATUS=G14_IN_PROGRESS_ZERO_PROVIDER
START_REMOTE_CHECKPOINT=0fd83949fe818013c6f509ddbbcc39e081584d6e
ACCEPTED_SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
G13_FAILURE_PRESERVED=YES
G13_PROVIDER_CALLS_USED=1_OF_1
G14_PROVIDER_CALLS_AUTHORIZED=0
G15_PROVIDER_CALLS_AUTHORIZED=0
G16_PROVIDER_CALLS_AUTHORIZED=0
G17_PROVIDER_CALLS_AUTHORIZED=0_UNTIL_SEPARATE_HUMAN_CHECKPOINT
8D1L_PROVIDER_CALLS_AUTHORIZED=0
PRODUCT_SOURCE_CHANGED=NO_AT_START
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
READY_FOR_G17_AUTHORIZATION=NO_UNTIL_G16_CLOSES
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=NO_DURING_G14_G16
NEXT_ACTION=RECONSTRUCT_G13_POST_READY_TIMELINE_THEN_RUN_G15_AND_G16_ZERO_PROVIDER_VALIDATION
```

## G14 → G16 durable execution checkpoint

The zero-provider G14 forensic reconstruction, G15 SDK/protocol audit, and
G16 provider-disabled closure are recorded in
`docs/campaign-reports/08-GEMINI-35-LIVE.md` and
`docs/campaign-reports/CAMPAIGN-STATE.md`. The accepted product source stayed
at `7a724488a9ed20093469caefc03addc764185be5`; no tracked runtime behavior
changed and no GLM review was required for this report-only checkpoint.

```text
CAMPAIGN=8D1K_G16
STATUS=ZERO_PROVIDER_POST_READY_BOUNDARY_CLOSED_READY_FOR_HUMAN_G17_DECISION
G13_FAILURE_PRESERVED=YES
G14_FORENSICS=PASS
G15_SDK_PROTOCOL_AUDIT=PASS
EXACT_SDK_VERSION=2.20.0
G13_LEADING_ROOT_CAUSE_CLASS=G_RUNNER_OBSERVABILITY_AND_TIMEOUT_CLASSIFICATION_GAP
PRODUCT_SOURCE_CHANGED=NO
FINAL_SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
FULL_TESTS=PASS_331_BACKEND
ARM64_BUILD=PASS_EXISTING_EXACT_SOURCE_CANDIDATE
EXACT_FULL_ADAPTER_PROVIDER_DISABLED_E2E=PASS
FUTURE_G17_HARNESS=READY
POST_READY_OBSERVABILITY=PASS_PROVIDER_DISABLED_SANITIZED_TIMELINE
DURABLE_RESULT_RECOVERY=PASS
GLM53_REVIEW=NOT_REQUIRED_NO_TRACKED_PRODUCT_RUNTIME_CHANGE
PROVIDER_CALLS_G14_G16=0
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_G17_AUTHORIZATION=YES
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_AUTHORIZE_OR_REJECT_FUTURE_G17_PROVIDER_VALIDATION
```
