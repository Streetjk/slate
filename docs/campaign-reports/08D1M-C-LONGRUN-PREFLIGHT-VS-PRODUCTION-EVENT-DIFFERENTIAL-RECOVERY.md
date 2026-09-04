# Campaign 8D1M-C — Long-Run Preflight-vs-Production Event Differential Recovery

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Authoritative base: `integration/note4-custom`
Starting remote checkpoint: `e7e04d36de48e8ef3464c8d21cf8b67b08348ef7`
Accepted corrected product source at start: `895e2d569d6ae0e8909c3e8958d64c189810f203`

## 1. Purpose

This directive starts from the retained 8D1M-B production synthetic hard stop after automatic rollback. It authorizes one long autonomous zero-provider/non-production recovery sequence focused on the exact differential between:

- the exact-image pre-deploy real-provider preflight, which passed with `MODEL_EVENT=YES` and `TURN_COMPLETE=YES`; and
- the deployed production synthetic validation, which returned `TURN_COMPLETE=YES`, `MODEL_EVENT=NO`, `ADAPTER_ERROR=NO`, while Slate/MySQL remained healthy.

The objective is to determine whether the failed production gate represents:

1. a product/runtime event-observation or callback-classification defect;
2. a disposable-runner acceptance/predicate defect;
3. a production-vs-preflight environment/configuration shape difference;
4. a timing/buffering/lifecycle race;
5. a legitimate Gemini Live response shape that was incorrectly classified as missing a model event;
6. or another precisely evidenced cause.

Do not assume a credential failure, provider outage, source defect, or production defect merely from `MODEL_EVENT=NO`. `TURN_COMPLETE=YES` proves that at least one valid provider-side server-content lifecycle signal traversed the active path in the failed production synthetic session.

This campaign authorizes **zero Gemini provider calls and zero production mutations**. It must not redeploy the candidate, restart production, remount the Gemini secret, or consume any new live session.

Codex should continue autonomously through all safe deterministic stages below. Do not return control for routine Docker inspection, local/ARM64 provider-disabled reproduction, bounded implementation/test correction, exact reviewer retries, report publication, commits, pushes, or remote verification.

Return control only at the final 8D1M-C human decision boundary or a genuine security/technical boundary that cannot be resolved inside this zero-provider scope.

---

## 2. Starting evidence — preserve exactly

The following 8D1M-B facts are authoritative and must not be rewritten:

```text
CORRECTED_SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
AUTHORIZED_CANDIDATE_IMAGE_SHA=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
TRANSPORT_IMAGE_SHA=sha256:f644fa6fa0bed63b3f248d33038e8595016fd453e78f6bb97565495a2268de5c
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
SDK_VERSION=2.20.0
MODEL=gemini-3.1-flash-live-preview
```

Exact-image pre-deploy provider preflight:

```text
PREFLIGHT_ATTEMPT_4=PASS
MODEL_EVENT=YES
TURN_COMPLETE=YES
PROVIDER_RESULT=PASS
SEARCH_EXECUTED=NO
TOOL_INVOCATIONS=0
PRIVATE_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
CREDENTIAL_EXPOSED=NO
INITIAL_VALIDATION_PROVIDER_SESSIONS_USED=4_OF_5
```

Production synthetic validation:

```text
PROVIDER_SESSION=5_OF_5
SYNTHETIC_PROMPT=Say exactly TEST.
MODEL_EVENT=NO
TURN_COMPLETE=YES
ADAPTER_ERROR=NO
PROVIDER_RESULT=FAIL
FAILURE_CLASS=MODEL_EVENT_MISSING_WITH_TURN_COMPLETE
PRODUCTION_HEALTH_DURING_CHECK=healthy
PRODUCTION_RESTARTS_DURING_CHECK=0
SEARCH_EXECUTED=NO
TOOL_INVOCATIONS=0
PRIVATE_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
CREDENTIAL_EXPOSED=NO
```

Rollback:

```text
ROLLBACK_EXECUTED=YES
ROLLBACK_SLATE=running_healthy
ROLLBACK_MYSQL=running_healthy
ROLLBACK_GEMINI_SECRET_MOUNT=ABSENT
PRODUCTION_DATA_CHANGED=NO
PRODUCTION_MYSQL_CHANGED=NO
PHYSICAL_NOTE4_E2E=NOT_RUN_SYNTHETIC_GATE_FAILED
INITIAL_VALIDATION_PROVIDER_SESSIONS_USED=5_OF_5
```

All 8D1M-B initial-validation sessions are exhausted. Do not reset, extend, reinterpret, or reuse that budget.

---

## 3. Authorization and prohibitions

This directive authorizes:

```text
CAMPAIGN=8D1M_C
PROVIDER_CALLS_AUTHORIZED=0
PRODUCTION_DEPLOYMENT_AUTHORIZED=NO
PRODUCTION_RESTART_AUTHORIZED=NO
PRODUCTION_ENV_MUTATION_AUTHORIZED=NO
PROTECTED_CREDENTIAL_VALUE_ACCESS_AUTHORIZED=NO
```

Still prohibited:

- any Gemini provider call;
- production deploy/restart/recreate/config mutation;
- production `.env` reading or loading into disposable tools;
- credential creation/replacement/migration/copy/move/print/hash;
- billing or Vertex changes;
- firmware flashing;
- PR #2 merge;
- Calendar write testing;
- Outlook payload transmission to Gemini;
- private NOTE4 payload use;
- microphone input;
- generated-audio retention;
- destructive host/storage/database work;
- Campaign 6D or PR #1/PR #3 expansion.

Current rollback production is the safety baseline and must remain untouched.

---

## 4. Routing

- Controller/stage authority: Luna.
- Bounded implementation/correction worker: Sonnet 4.6.
- Independent reviewer for tracked product/runtime behavior changes: exact `zai-glm53-reviewer` / `glm-5.3-flash`, read-only.
- Codex: sole repository writer, integrator, deterministic validator, report publisher, and remote-verification owner.

No silent reviewer substitution.

If exact GLM review times out, retry with a narrower exact-diff/read-only packet. Do not substitute another model/profile.

---

## 5. REPORT-PUSH-INVARIANT

`docs/campaign-reports/REPORT-PUSH-INVARIANT.md` remains binding.

At every meaningful stage completion, hard stop, reviewer block, or final boundary:

1. update the relevant report;
2. update `CAMPAIGN-STATE.md` when state changes;
3. run secret-safe report checks and `git diff --check`;
4. commit selectively;
5. push the active branch;
6. fetch/verify remote;
7. record pushed SHA;
8. verify PR #2 remains open/draft/unmerged;
9. only then return control at a legitimate boundary.

---

# C0 — Reconcile live state and freeze the rollback baseline

Fetch origin and verify:

- PR #2 open/draft/unmerged;
- branch head contains the 8D1M-B hard stop and rollback evidence;
- production currently runs the preserved rollback image;
- Slate/MySQL health remains green via read-only checks;
- candidate Gemini secret mount is absent from rollback production;
- no product/runtime source drift after `895e2d569d6ae0e8909c3e8958d64c189810f203` other than authorized campaign/report work;
- no provider budget remains from 8D1M-B.

Do not alter production while reconciling.

Read before work:

- `AGENTS.md` and repository-local instructions;
- `docs/campaign-reports/AUTONOMY-AND-HUMAN-GATE-POLICY.md` if present;
- `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`;
- `docs/campaign-reports/CAMPAIGN-STATE.md`;
- `docs/campaign-reports/08D1M-A-*` relevant requalification report/directive;
- `docs/campaign-reports/08D1M-B-EXACT-NEW-ARTIFACT-PRODUCTION-AUTHORIZATION.md`;
- this directive.

---

# C1 — Reconstruct the exact preflight vs production synthetic shapes

Without another provider call, reconstruct both validation shapes from durable runner files/history/report evidence and exact source/image metadata.

Produce a side-by-side matrix for at least:

```text
source_sha
image_rootfs/config identity
NODE_ENV
GEMINI_AUTH_MODE
GEMINI_DEVELOPER_API_KEY_ENABLED
GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED
GEMINI_LIVE_RUNTIME
GEMINI_LIVE_MODEL
GEMINI_API_KEY_FILE reference
node executable/path resolution
bridge script path
cwd/user/uid/gid
read-only root/tmpfs/mounts
network mode
system instruction
language
enableWebSearch
function declaration state
response modalities
input transcription/output transcription config
synthetic prompt bytes
text-send API path
connection timeout
first-event timeout
turn-complete timeout
outer launcher timeout
result writer location/atomicity
container lifetime after turnComplete
close/cleanup order
MODEL_EVENT predicate
TURN_COMPLETE predicate
server-message structural fields counted/ignored
```

Every difference must be classified as:

```text
IDENTICAL
EXPECTED_ENVIRONMENT_DIFFERENCE
HARNESS_ONLY_DIFFERENCE
PRODUCT_RUNTIME_DIFFERENCE
UNKNOWN_REQUIRES_DETERMINISTIC_TEST
```

Do not infer equivalence from similar labels. Prove exact values or record unknown.

---

# C2 — Define structural provider-event telemetry with zero content retention

The key failure is `TURN_COMPLETE=YES` with `MODEL_EVENT=NO`. Current evidence is insufficient to know whether this was:

- turnComplete-only server content;
- output transcription without modelTurn;
- audio modelTurn intentionally not retained and therefore not counted;
- generationComplete/waitingForInput without the existing MODEL_EVENT predicate;
- a predicate/timing race;
- or another safe structural shape.

Create or strengthen a **content-free structural event summary** that can be exercised provider-disabled and, only in a future separately authorized campaign, could summarize a live session without retaining payload content.

Allowed structural fields include booleans/counters/relative monotonic timestamps such as:

```text
server_message_count
setup_complete_seen
server_content_seen
model_turn_seen
model_turn_part_count
model_turn_text_part_seen
model_turn_inline_data_part_seen
input_transcription_seen
output_transcription_seen
generation_complete_seen
waiting_for_input_seen
turn_complete_seen
tool_call_seen
provider_error_seen
provider_close_seen
first_message_ms
first_model_signal_ms
turn_complete_ms
```

Do not record text, audio bytes, transcription strings, function arguments, provider raw bodies, credentials, or private payloads.

If the existing product already exposes enough safe structure, prefer a harness/report-only summary. If tracked runtime behavior must change to expose sanitized structural states, keep the correction minimal and backend-only.

---

# C3 — Audit the definition of `MODEL_EVENT`

Find the exact predicates used in:

1. the successful exact-image preflight; and
2. the failed production synthetic validation.

Prove whether the two predicates were byte-for-byte/equivalently identical.

A future synthetic gate must not require a response shape that Gemini Live does not guarantee.

Classify all structurally valid response outcomes for the exact synthetic text case under `responseModalities: [AUDIO]` and the accepted SDK version. In particular determine whether these should count as model activity:

- serverContent.modelTurn with text part;
- serverContent.modelTurn with inline audio data only;
- serverContent.outputTranscription;
- generationComplete;
- waitingForInput;
- turnComplete with no retained model payload;
- tool call (not authorized as PASS for the synthetic test, but must be classified truthfully).

Do not weaken the gate blindly. If `TURN_COMPLETE=YES` with no preceding model output is genuinely an unacceptable empty response, retain failure semantics. If the failure was only an observability/predicate mismatch caused by deliberately discarding audio payload, correct the predicate and prove it deterministically.

Use exact installed SDK source/types and current official Gemini Live documentation where needed. Record what is source-derived vs documentation-derived vs inference.

---

# C4 — Zero-provider dual-shape replay

Build deterministic provider-disabled fixtures that exercise both:

- the exact preflight harness shape; and
- the exact production synthetic runner/service shape.

Use synthetic credentials only and `network=none`.

Inject a matrix of sanitized mock server-message sequences including at minimum:

```text
A: modelTurn(text) -> generationComplete -> turnComplete
B: modelTurn(inlineData/audio) -> generationComplete -> turnComplete
C: outputTranscription -> generationComplete -> turnComplete
D: generationComplete -> turnComplete
E: turnComplete only
F: waitingForInput -> turnComplete
G: provider error after ready
H: provider close after ready
I: modelTurn then delayed turnComplete near deadline
J: turnComplete then child/process close
```

For every sequence, prove that preflight and production classifiers produce the same sanitized structural result and the intended PASS/FAIL decision.

If they differ, identify whether the defect is in the runner, product callback handling, timing/lifecycle, or acceptance predicate.

---

# C5 — Timing and lifecycle differential

Deterministically test the race surfaces most relevant to the observed result:

- message callback and `turnComplete` in the same server message;
- model output callback immediately before turnComplete;
- generated audio deliberately not retained;
- result writer snapshot taken immediately at turnComplete;
- connection close immediately after turnComplete;
- parent closing child/session after success predicate;
- outer launcher timeout vs inner turn deadline;
- event callback scheduled on a later microtask/tick;
- final sanitized result written before all already-received callback bookkeeping completes.

A likely class to explicitly prove/disprove is:

```text
TURN_COMPLETE_RESULT_COMMITTED_BEFORE_MODEL_EVENT_CLASSIFICATION_SETTLED
```

Do not claim it unless reproduced deterministically.

---

# C6 — Bounded correction only if proven

Possible correction classes:

```text
NO_PRODUCT_CHANGE_HARNESS_PREDICATE_FIX
NO_PRODUCT_CHANGE_RESULT_FINALIZATION_FIX
PRODUCT_SANITIZED_EVENT_CLASSIFICATION_FIX
PRODUCT_CALLBACK_LIFECYCLE_FIX
PRODUCTION_CONFIG_SHAPE_FIX
OTHER_PRECISELY_PROVEN_CLASS
```

Rules:

- correct only what deterministic evidence proves;
- do not change model/auth path merely to chase the failed gate;
- do not weaken credential or production opt-in guards;
- do not enable Search;
- do not expose provider content;
- do not change production in this campaign.

If product/runtime source changes, the new source/image is **not** authorized for production by 8D1M-B. It requires separate future human authorization.

---

# C7 — Full deterministic and ARM64 qualification

If tracked product/runtime source changes, run:

- complete backend tests;
- shared tests;
- lint;
- typecheck;
- format check;
- frontend build;
- Node syntax/runtime checks;
- exact ARM64 build;
- exact Node/Bun/@google/genai version proof;
- production-shape provider-disabled full-adapter E2E;
- dual-shape structural event matrix;
- image history/build-context secret scan;
- report secret scan;
- `git diff --check`;
- read-only rollback-production health verification.

If product/runtime source does not change, still run all targeted dual-shape/event/timing tests and an exact provider-disabled production-shape ARM64 replay sufficient to prove the future validation harness.

---

# C8 — Exact GLM-5.3 review

Required for any tracked product/runtime behavior change.

Review exact final source SHA with:

```text
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_MODEL=glm-5.3-flash
REVIEW_MODE=READ_ONLY
```

Scope:

- preflight/production differential finding;
- model-event predicate correctness;
- sanitized structural telemetry privacy;
- event ordering/lifecycle correctness;
- production guard preservation;
- Gemini 3.1 Live contract assumptions;
- exact SDK version assumptions;
- regression coverage;
- ARM64 production-shape evidence;
- no credential/private-data exposure.

Luna adjudicates all P0-P3. P0/P1 must be zero before closure. Correct/revalidate/re-review as required.

---

# C9 — Terminal dossier and human boundary

Success target if a source correction is proven:

```text
CAMPAIGN=8D1M_C
STATUS=ZERO_PROVIDER_DIFFERENTIAL_CLOSED_NEW_ARTIFACT_READY_FOR_HUMAN_AUTHORIZATION
ROOT_CAUSE_CLASS=<exact>
PRODUCT_SOURCE_CHANGED=YES
FINAL_SOURCE_SHA=<exact>
FINAL_ARM64_IMAGE_SHA=<exact>
DUAL_SHAPE_EVENT_MATRIX=PASS
PRODUCTION_SHAPE_PROVIDER_DISABLED_E2E=PASS
FULL_TESTS=PASS
GLM53_REVIEW=PASS
PROVIDER_CALLS_USED=0
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
ROLLBACK_PRODUCTION_HEALTH=PASS
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=YES
READY_FOR_PRODUCTION_DEPLOYMENT_AUTHORIZATION=NO_UNTIL_HUMAN_DECISION
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_NEW_ARTIFACT_AND_AUTHORIZE_OR_REJECT_BOUNDED_PROVIDER_REVALIDATION_AND_DEPLOYMENT
```

Success target if no product/runtime correction is needed:

```text
CAMPAIGN=8D1M_C
STATUS=ZERO_PROVIDER_DIFFERENTIAL_CLOSED_EXISTING_ARTIFACT_READY_FOR_HUMAN_REVALIDATION_DECISION
ROOT_CAUSE_CLASS=<exact harness/acceptance/timing class>
PRODUCT_SOURCE_CHANGED=NO
FINAL_SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
DUAL_SHAPE_EVENT_MATRIX=PASS
PRODUCTION_SHAPE_PROVIDER_DISABLED_E2E=PASS
PROVIDER_CALLS_USED=0
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
ROLLBACK_PRODUCTION_HEALTH=PASS
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_AUTHORIZE_OR_REJECT_NEW_BOUNDED_LIVE_VALIDATION_POOL
```

If the root cause cannot be narrowed safely after the deterministic work:

```text
STATUS=HARD_STOP_UNRESOLVED_PREFLIGHT_PRODUCTION_EVENT_DIFFERENTIAL
PROVIDER_CALLS_USED=0
PRODUCTION_CHANGED=NO
HUMAN_ACTION_REQUIRED=YES
```

In every terminal case, publish/commit/push/fetch/verify under REPORT-PUSH-INVARIANT and post a concise PR checkpoint.

---

## Anti-micro-stop rule

Do not return control for:

- inspecting source/tests/reports;
- reconstructing runner differences;
- building provider-disabled fixtures;
- running mock matrices;
- correcting harness scripts;
- bounded product fixes supported by deterministic evidence;
- exact ARM64 builds;
- GLM reviewer timeout/retry in narrower scope;
- Luna adjudication;
- report/state maintenance;
- commit/push/remote verification;
- disposable cleanup after evidence capture.

Return control only when:

1. C9 is durably complete and a new live/deployment authorization is required;
2. credential replacement/migration is genuinely required;
3. production mutation would be required before C9;
4. a P0/P1 or unresolved security issue remains;
5. or a genuine technical ambiguity cannot be resolved with the authorized zero-provider methods.

Initial action:

```text
FETCH_ORIGIN=YES
RECONCILE_HEAD=e7e04d36de48e8ef3464c8d21cf8b67b08348ef7
CURRENT_CAMPAIGN=8D1M_C
PROVIDER_CALLS_AUTHORIZED=0
PRODUCTION_MUTATION_AUTHORIZED=0
NEXT_ACTION=RECONSTRUCT_PREFLIGHT_VS_PRODUCTION_EVENT_AND_TIMING_DIFFERENTIAL_THEN_CONTINUE_AUTONOMOUSLY_TO_C9
```

## C0 — live reconciliation PASS

The branch was fetched and fast-forwarded to the directive checkpoint
`3c848bb849bb7b6b47bd8f6172503da520f68b5c`. PR #2 is open, draft, and
unmerged. The B rollback baseline is still active on `note4-orangepi`; no
candidate Gemini secret mount is present. The exact source lineage remains
`895e2d569d6ae0e8909c3e8958d64c189810f203`, and the product/runtime file
diff from that source to the current branch is empty; only campaign/report
material has advanced.

```text
C0=PASS
HEAD=3c848bb849bb7b6b47bd8f6172503da520f68b5c
PR2=open_draft_unmerged
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
PRODUCTION_SLATE=running_healthy
PRODUCTION_MYSQL=running_healthy
PRODUCTION_RESTARTS_SLATE=0
PRODUCTION_RESTARTS_MYSQL=0
PRODUCTION_HEALTHZ_LOCAL=HTTP_200
PRODUCTION_HEALTHZ_PUBLIC=HTTP_200
ROLLBACK_GEMINI_SECRET_MOUNT=ABSENT
PROVIDER_CALLS_AUTHORIZED=0
PRODUCTION_MUTATION_AUTHORIZED=0
PRODUCT_RUNTIME_DRIFT_AFTER_895E2D5=NONE
```

The rollback production state is frozen as the safety baseline for the
remaining zero-provider work.

## C1 — exact validation-shape differential

The retained B runner files were reconstructed and compared. The preflight
and production synthetic runners use the same exact source imports, service
construction, production configuration values, model, language (`en`),
system-instruction generation, `enableWebSearch=false`, empty tool registry,
`responseModalities: [AUDIO]`, input/output transcription configuration,
synthetic prompt bytes (`Say exactly TEST.`), Node executable, bridge script,
30-second connect timeout, 45-second turn wait, synchronous callback
bookkeeping, and `MODEL_EVENT`/`TURN_COMPLETE` predicates. The predicates are
byte-for-byte identical:

```text
MODEL_EVENT = message.serverContent?.modelTurn !== undefined
TURN_COMPLETE = message.serverContent?.turnComplete === true
PASS = !adapterError && modelEvent && turnComplete && toolInvocations === 0
```

The differences are classified as follows:

| Field/behavior | Preflight | Production synthetic | Classification |
|---|---|---|---|
| source/image/config identity | exact candidate | exact candidate | IDENTICAL |
| cwd/user | `/app`, image `bun` user | `/app`, image `bun` user | IDENTICAL |
| auth/model/runtime/path | reviewed exact values | reviewed exact values | IDENTICAL |
| system/language/text-send path | service-generated, `en`, bridge text frame | same | IDENTICAL |
| Search/tools/transcription/modalities | Search off, empty tools, AUDIO plus transcriptions | same | IDENTICAL |
| connect/turn deadlines | 30s / 45s | 30s / 45s | IDENTICAL |
| root filesystem/network | disposable read-only image runner / Docker network | Compose production container / project network | EXPECTED_ENVIRONMENT_DIFFERENCE |
| mounts | script RO, credential RO, host result RW, tmpfs `/tmp` | production `/data`, credential RO, temporary script in `/tmp` | HARNESS_ONLY_DIFFERENCE |
| result location/lifetime | host-bound atomic JSON; container exits after result | container `/tmp` atomic JSON copied while service remains alive | HARNESS_ONLY_DIFFERENCE |
| outer launcher | detached `docker run` | detached `docker exec` | HARNESS_ONLY_DIFFERENCE |
| provider event predicate | `modelTurn` presence | `modelTurn` presence | IDENTICAL |

No `PRODUCT_RUNTIME_DIFFERENCE` or `UNKNOWN_REQUIRES_DETERMINISTIC_TEST` was
found in the reconstructed shapes. The production result is therefore not
explained by a changed acceptance predicate.

## C2 — content-free structural telemetry design

The existing bridge forwards typed server messages without logging or
retaining their contents, so no tracked runtime telemetry change is required
for this zero-provider campaign. The future harness summary is defined only
over booleans, counters, and monotonic relative times:

```text
server_message_count
setup_complete_seen
server_content_seen
model_turn_seen
model_turn_part_count
model_turn_text_part_seen
model_turn_inline_data_part_seen
input_transcription_seen
output_transcription_seen
generation_complete_seen
waiting_for_input_seen
turn_complete_seen
tool_call_seen
provider_error_seen
provider_close_seen
first_message_ms
first_model_signal_ms
turn_complete_ms
```

Text, audio bytes, transcription strings, function arguments, provider error
bodies, credentials, and private NOTE4 data are excluded. This design is
harness/report-only; `PRODUCT_SOURCE_CHANGED=NO`.

## C3 — `MODEL_EVENT` audit and response semantics

Source-derived evidence is the identical predicate recorded in C1 and the
bridge's lossless `server_message` forwarding. Installed `@google/genai`
source/types at version `2.20.0` define `LiveServerContent.modelTurn` as the
content generated by the model, `generationComplete` as completion of model
generation, `turnComplete` as the end-of-turn signal, and `waitingForInput` as
not-generating state. The SDK types define input and output transcription as
independent of model-turn ordering.

Documentation-derived evidence is the current official SDK/API guidance:
the JavaScript Live example reads generated AUDIO from
`serverContent.modelTurn.parts[].inlineData`; output transcription is a
separate optional signal and is useful when text is needed from an audio
response. Therefore:

```text
modelTurn with text part       = model activity, PASS candidate if turn complete
modelTurn with inline audio    = model activity, PASS candidate if turn complete
outputTranscription only       = structural output signal, not proof of audio payload
generationComplete only        = lifecycle completion, not model activity
waitingForInput only           = no model activity
turnComplete only              = empty/unobserved model output, FAIL
tool call                      = activity, but FAIL for this no-tools gate
provider error/close           = FAIL
```

The last two classifications preserve the strict synthetic acceptance gate;
no blind weakening was made. This is an inference for the acceptance rule,
grounded in the source predicate and the documented AUDIO response shape.
References: [LiveServerContent SDK types](https://googleapis.github.io/js-genai/release_docs/interfaces/types.LiveServerContent.html),
[Live API JavaScript guide](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk),
and [Live API capabilities](https://ai.google.dev/gemini-api/docs/live-api/capabilities).

## C4 — zero-provider dual-shape matrix PASS

A syntax-checked provider-disabled structural fixture exercised both the
preflight and production classifier functions against all required sanitized
sequences. No network, credential, provider, audio, or private payload was
used. Both classifiers produced the same result for every sequence:

| Sequence | Structural shape | Old `MODEL_EVENT` | `TURN_COMPLETE` | Gate |
|---|---|---:|---:|---:|
| A | modelTurn(text) → generationComplete → turnComplete | YES | YES | PASS |
| B | modelTurn(inlineData) → generationComplete → turnComplete | YES | YES | PASS |
| C | outputTranscription → generationComplete → turnComplete | NO | YES | FAIL |
| D | generationComplete → turnComplete | NO | YES | FAIL |
| E | turnComplete only | NO | YES | FAIL |
| F | waitingForInput → turnComplete | NO | YES | FAIL |
| G | provider error after ready | NO | NO | FAIL |
| H | provider close after ready | NO | NO | FAIL |
| I | modelTurn → delayed turnComplete | YES | YES | PASS |
| J | modelTurn → turnComplete → close | YES | YES | PASS |

```text
C4=PASS
PREFLIGHT_PRODUCTION_CLASSIFIERS_IDENTICAL=YES
DUAL_SHAPE_EVENT_MATRIX=PASS_A_TO_J
NETWORK=NONE_IN_FIXTURE
PROVIDER_CALLS=0
```

## C5 — timing/lifecycle differential PASS

The deterministic lifecycle replay covered same-message model/turn signals,
model-before-turn callbacks, discarded generated audio, immediate close after
turn completion, parent close after success, provider error/close after ready,
and artificial microtask deferral. The current runner's synchronous callback
handles all fields in a received message before the 50-ms turn flag poll can
resume the result writer. Immediate close after a completed model turn remains
a PASS; close/error without model activity remains a FAIL.

The artificial case that commits before a deferred callback classified as
FAIL, while finalization after the microtask flush classified as PASS. That
ordering is not used by the current runner and was not reproduced in the B
shape. Therefore:

```text
C5=PASS
TURN_COMPLETE_RESULT_COMMITTED_BEFORE_MODEL_EVENT_CLASSIFICATION_SETTLED=NOT_REPRODUCED
CURRENT_RUNNER_CALLBACK_BOOKKEEPING=SETTLED_BEFORE_RESULT_FINALIZATION
PROVIDER_RESULT_SHAPE_FROM_B=NOT_RECOVERABLE_CONTENT_FREE_ONLY
ROOT_CAUSE_NARROWED=LEGITIMATE_OR_UNOBSERVED_PROVIDER_RESPONSE_SHAPE_OR_RUN_VARIANCE
PRODUCT_DEFECT_PROVEN=NO
```
