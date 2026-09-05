# Campaign 8D1M-D — PROPOSED Long-Run Structural Live Revalidation

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Starting checkpoint: `850eb1a3ef3a11f795dbb8f975705e8a4ad7bca8`
Accepted source: `895e2d569d6ae0e8909c3e8958d64c189810f203`
Accepted ARM64 candidate image: `sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400`
Rollback image: `sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3`
Model: `gemini-3.1-flash-live-preview`

## Status

```text
DIRECTIVE_STATE=AUTHORIZED_ACTIVE
PROVIDER_CALLS_AUTHORIZED=2_MAX_ONE_D1_ONE_D2
PRODUCTION_DEPLOYMENT_AUTHORIZED=CONDITIONAL_D2
PRODUCTION_RESTART_AUTHORIZED=CONDITIONAL_D2
PHYSICAL_NOTE4_TEST_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

This document defines the preferred next long-running sequence after 8D1M-C, but **does not authorize execution beyond zero-provider reconciliation**. A separate explicit human authorization checkpoint is required before any Gemini call or production mutation.

## Starting evidence

8D1M-C closed the zero-provider differential with no product/runtime source correction:

```text
STATUS=ZERO_PROVIDER_DIFFERENTIAL_CLOSED_EXISTING_ARTIFACT_READY_FOR_HUMAN_REVALIDATION_DECISION
ROOT_CAUSE_CLASS=PROVIDER_RESPONSE_SHAPE_NOT_OBSERVABLE_AFTER_PAYLOAD_FREE_RUN
PRODUCT_SOURCE_CHANGED=NO
FINAL_SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
FINAL_ARM64_IMAGE_SHA=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
DUAL_SHAPE_EVENT_MATRIX=PASS
PRODUCTION_SHAPE_PROVIDER_DISABLED_E2E=PASS
FULL_TESTS=PASS
PROVIDER_CALLS_USED=0
PRODUCTION_CHANGED=NO
ROLLBACK_PRODUCTION_HEALTH=PASS
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=YES
```

The existing AUDIO-output acceptance predicate remains binding. Content-free structural telemetry is diagnostic evidence only and must not silently weaken the gate.

## Proposed long-run activation scope

If and only if a later human authorization explicitly activates 8D1M-D, run the following sequence autonomously.

### D0 — zero-provider reconcile

Before any live call:

- fetch/verify remote branch and PR state;
- prove source SHA and exact candidate image identity;
- prove rollback production healthy and unchanged;
- prove protected credential source/mount metadata without reading or printing its value;
- prove content-free structural telemetry runner is available and payload-free;
- prove exact preflight and production synthetic acceptance predicates remain unchanged;
- run the targeted provider-disabled structural matrix and production-shape replay;
- stop if any deterministic gate regresses.

No provider call or production mutation is permitted in D0.

### D1 — proposed exact-image non-production provider session

Only after explicit human activation:

- use the exact candidate image and exact source above;
- use the existing protected credential as a read-only runtime mount;
- explicit non-production mode;
- prompt exactly `Say exactly TEST.`;
- Search off;
- no Calendar writes;
- no Outlook payload;
- no private NOTE4 data;
- no microphone input;
- generated audio not retained;
- content-free structural event summary enabled;
- preserve only counters/booleans/relative timings, never model text/audio/transcriptions/raw provider bodies;
- PASS still requires the existing accepted model-output event plus turn completion semantics.

Proposed accounting:

```text
D1_PROVIDER_SESSION_MAX=1
NO_RETRY_IF_D1_FAILS=YES
```

If D1 fails, publish durable structural evidence and stop. Do not consume a production session.

### D2 — proposed production deployment + one synthetic production validation

D2 is also **not authorized by this proposal**. It should be included in the same future human activation only if the human explicitly authorizes production deployment/restart as part of 8D1M-D.

If D1 passes and D2 has been explicitly authorized:

- preserve and verify rollback image first;
- deploy only the exact candidate image/source above;
- enable only the already reviewed production Node-bridge/Developer-API opt-ins;
- mount the existing protected Gemini credential read-only;
- keep the bridge private;
- verify Slate/MySQL/local/public health before the session;
- run exactly one synthetic production session with prompt `Say exactly TEST.`;
- use the same acceptance predicate as D1;
- collect the same content-free structural event summary;
- Search off, no tool invocation, no private data, no microphone, no retained generated audio;
- if the synthetic production gate fails or health degrades, rollback automatically and publish evidence;
- no retry.

Proposed accounting:

```text
D2_PROVIDER_SESSION_MAX=1
D1_PLUS_D2_PROVIDER_POOL_MAX=2
NO_RETRY_AFTER_D2=YES
```

If D2 passes and health remains green, leave the candidate deployed only if that behavior was explicitly included in the human activation. Otherwise restore rollback after evidence capture.

### D3 — terminal dossier

After D1/D2, publish exact structural results and state clearly:

```text
D1_RESULT=
D2_RESULT=
MODEL_TURN_SEEN=
MODEL_TURN_PART_COUNT=
MODEL_TURN_TEXT_PART_SEEN=
MODEL_TURN_INLINE_DATA_PART_SEEN=
OUTPUT_TRANSCRIPTION_SEEN=
GENERATION_COMPLETE_SEEN=
TURN_COMPLETE_SEEN=
PROVIDER_ERROR_SEEN=
PROVIDER_CLOSE_SEEN=
ACCEPTANCE_PREDICATE_RESULT=
PRODUCTION_HEALTH=
ROLLBACK_EXECUTED=
PROVIDER_SESSIONS_USED=
```

Do not retain provider payload content.

## Hard prohibitions

Until a later explicit human authorization checkpoint:

- no Gemini provider call;
- no production deploy/restart/recreate/config mutation;
- no production `.env` read;
- no credential value read/print/hash/copy/move;
- no billing or Vertex change;
- no firmware flash;
- no physical NOTE4 EN/JP/reconnect test;
- no Calendar writes;
- no Outlook/private payload to Gemini;
- no PR #2 merge;
- no Campaign 6D or PR #1/PR #3 expansion.

Even after 8D1M-D activation, physical NOTE4 testing and PR merge remain separate human gates unless explicitly authorized in a later checkpoint.

## Routing and publication

- Controller: Luna.
- Worker: Sonnet 4.6 for bounded implementation only if deterministic evidence requires it.
- Reviewer: exact `zai-glm53-reviewer` / `glm-5.3-flash` if tracked product/runtime source changes.
- Codex: sole repository writer/integrator/validator/checkpoint publisher.
- `REPORT-PUSH-INVARIANT.md` remains binding.

Do not return control for routine recoverable work after activation. Stop only on D1/D2 failure, a genuine security/credential boundary, or the terminal human decision boundary.

## D0 — zero-provider reconciliation checkpoint

D0 was executed under the proposal's permitted zero-provider scope before the
activation recorded below. Its evidence remains the unchanged D0 baseline.

```text
D0_STATUS=PASS
DIRECTIVE_STATE=PROPOSED_NOT_AUTHORIZED
PROVIDER_CALLS_USED=0
PRODUCTION_DEPLOYMENT=NO
PRODUCTION_RESTART=NO
PHYSICAL_NOTE4_TEST=NO
PR2_MERGE=NO
SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
ARM64_IMAGE_ID=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
ARM64_IMAGE_PLATFORM=linux/arm64
ARM64_IMAGE_RUNTIME=Node_v22.22.2_Bun_1.4.0_GenAI_2.20.0
PROTECTED_SOURCE_HOST=note4-orangepi
PROTECTED_SOURCE_PATH=/mnt/ssd-tmp/slate-tools/gemini-api-key/gemini_api_key
PROTECTED_SOURCE_METADATA=regular_non_symlink_nonempty_owner_pi_mode_600
CREDENTIAL_VALUE_READ=NO
CREDENTIAL_MOUNT_DESTINATION=/run/secrets/gemini_api_key
CREDENTIAL_MOUNT_READONLY=REQUIRED
STRUCTURAL_MATRIX=PASS_A_TO_J
STRUCTURAL_TELEMETRY=PAYLOAD_FREE_EPHEMERAL_SUMMARY
PREFLIGHT_PRODUCTION_CLASSIFIERS=IDENTICAL
ARM64_PROVIDER_DISABLED_ADAPTER_REPLAY=PASS_6_TESTS
ARM64_REPLAY_NETWORK=none
ARM64_REPLAY_ROOTFS=read_only
ARM64_REPLAY_SYNTHETIC_SECRET=READONLY_MOUNT_ONLY
ROLLBACK_IMAGE_ID=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
ROLLBACK_PRODUCTION_HEALTH=PASS
SLATE_RESTARTS=0
MYSQL_RESTARTS=0
PRODUCTION_HEALTHZ=200
PRODUCTION_GEMINI_MOUNT=ABSENT
REMOTE_BRANCH_SHA=4fa7cda9f86a648e45bf160725cd4685e8a8320e
PR_STATE=open_draft_unmerged
```

The local exact-image replay retained its sanitized test result and container
metadata before cleanup. It exercised the Bun parent, Node mock child, trusted
synthetic mount boundary, and existing production guard without network or
provider access. No tracked product/runtime source changed. The C9 human
boundary was in force during D0; the subsequent activation below now authorizes
the bounded D1 and conditional D2 chain.

## D1 plus conditional D2 — human activation checkpoint

The human explicitly authorized D1 and conditional D2 in the controller
session after the D0 checkpoint. This activates the bounded two-session chain;
it does not authorize physical NOTE4 testing, firmware, private-data expansion,
billing/Vertex changes, or PR merge.

```text
CAMPAIGN=8D1M_D
ACTIVATION=HUMAN_AUTHORIZED
D1_PROVIDER_SESSION_MAX=1
D2_PROVIDER_SESSION_MAX=1
D1_PLUS_D2_PROVIDER_POOL_MAX=2
NO_RETRY_IF_D1_FAILS=YES
NO_RETRY_AFTER_D2=YES
AUTO_ROLLBACK_ON_D2_FAILURE=YES
STOP_BETWEEN_D1_AND_D2=NO_IF_D2_WAS_PREAUTHORIZED
PROVIDER_MODEL=gemini-3.1-flash-live-preview
SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
ARM64_IMAGE=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
PRIVATE_DATA_SENT=NO
SEARCH_ENABLED=NO
MICROPHONE_INPUT=NO
GENERATED_AUDIO_RETAINED=NO
```

Execution must proceed D1 → conditional D2 → D3 without a human handoff
between already-authorized stages. The provider-session ceiling and rollback
conditions remain hard limits.

## D1 — exact-image broad session result and zero-provider recovery

The single authorized D1 session was executed once against the exact candidate
lineage. The durable result was retrieved independently after the container
had exited; Docker status, result, and logs were retrieved separately. The
session stopped after the first turn failed the binding acceptance predicate,
so no second provider session and no D2 production mutation was started.

```text
D1_RESULT=FAIL
D1_DRIVER_RESULT=ACCEPTANCE_PREDICATE_FAILED
D1_FAILURE_CLASS=MODEL_EVENT_MISSING_WITH_TURN_COMPLETE
D1_CONTAINER=slate-d1-1788522852-58747
D1_REMOTE_IMAGE_ID=sha256:f644fa6fa0bed63b3f248d33038e8595016fd453e78f6bb97565495a2268de5c
D1_MODEL=gemini-3.1-flash-live-preview
D1_TURN_1=TURN_1_EN
D1_MODEL_TURN_SEEN=NO
D1_MODEL_TURN_PART_COUNT=0
D1_MODEL_TURN_TEXT_PART_SEEN=NO
D1_MODEL_TURN_INLINE_DATA_PART_SEEN=NO
D1_OUTPUT_TRANSCRIPTION_SEEN=YES
D1_GENERATION_COMPLETE_SEEN=YES
D1_TURN_COMPLETE_SEEN=YES
D1_TOOL_INVOCATIONS=0
D1_PROVIDER_ERROR_SEEN=NO
D1_PROVIDER_CLOSE_SEEN=NO
D1_FIRST_MESSAGE_MS=2493
D1_TURN_COMPLETE_MS=2499
D1_ACCEPTANCE_PREDICATE=FAIL
D1_RESULT_DURABLY_RECOVERED=YES
D1_RESULT_RECOVERED_AFTER_LAUNCHER_LIFETIME=YES
D1_RAW_PROVIDER_PAYLOAD_RETAINED=NO
D1_GENERATED_AUDIO_RETAINED=NO
D1_CREDENTIAL_VALUE_CAPTURED=NO
D1_PRIVATE_DATA_SENT=NO
D1_SEARCH_ENABLED=NO
D1_MICROPHONE_SENT=NO
D1_PROVIDER_SESSIONS_USED=1_OF_2
D2_PROVIDER_SESSION=NOT_RUN_D1_FAILED
D2_PRODUCTION_MUTATION=NO
```

The observed shape is structurally consistent with the prior retained
`MODEL_EVENT_MISSING_WITH_TURN_COMPLETE` class. It does not by itself prove a
credential, provider, SDK, harness, or product-source defect. The second
provider session is therefore reserved and will not be spent unless the
required zero-provider work proves a harness-only failure with the exact pins
unchanged.

## D1 zero-provider forensic closure

The authorized zero-provider recovery and requalification work is complete.
The exact source and ARM64 candidate pins remain unchanged, the durable
provider-disabled replay passed, and no tracked product/runtime source defect
or harness-only defect was proven. The live failure therefore remains a
provider-observation compatibility boundary, not a basis for a blind retry or
conditional D2 deployment.

```text
D1_ZERO_PROVIDER_FORENSICS=PASS
FOCUSED_ASSISTANT_SHARED_REGRESSION=PASS_85_TESTS_5_EXPECTED_SYNTHETIC_SKIPS
EXACT_ARM64_PROVIDER_DISABLED_REPLAY=PASS_6_TESTS
NODE_BRIDGE_SYNTAX=PASS
LINT=PASS
TYPECHECK=PASS
FORMAT_CHECK=PASS
FRONTEND_BUILD=PASS
FULL_REPO_TESTS=BASELINE_BUN_NEST_CONTROLLER_LOADER_LIMITATION_4_FAILURES_5_ERRORS
SOURCE_DIFF_FROM_PIN=REPORT_ONLY
PRODUCT_SOURCE_CHANGED=NO
HARNESS_ONLY_DEFECT_PROVEN=NO
GLM53_REVIEW=NOT_REQUIRED_NO_TRACKED_PRODUCT_RUNTIME_CHANGE
D1_PROVIDER_SESSIONS_USED=1_OF_2
SECOND_PROVIDER_SESSION=NOT_USED
D2_RESULT=NOT_RUN_D1_FAILED
D2_PRODUCTION_MUTATION=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
ROLLBACK_PRODUCTION_HEALTH=PASS
READY_FOR_NEW_PROVIDER_AUTHORIZATION=YES
```

The remaining provider session is retained, not automatically consumed. A new
provider strategy or equivalent human authorization is required before any
further live validation; production remains on the rollback image.
