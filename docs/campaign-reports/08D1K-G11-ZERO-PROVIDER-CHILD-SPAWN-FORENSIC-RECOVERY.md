# Campaign 8D1K-G11 — Zero-provider child-spawn forensic recovery

Date: 2026-09-03 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Resume from the corrected exact-adapter provider revalidation hard stop without making another Gemini provider call.

The latest durable provider-validation evidence is:

```text
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
STATUS=HARD_STOP_CORRECTED_EXACT_FULL_SLATE_ADAPTER_PROVIDER_FAILURE
FAILURE_CLASS=CHILD_SPAWN_FAILED
MODEL_EVENT=NO
TURN_COMPLETE=NO
PROVIDER_CALLS_USED=1_OF_1
PROVIDER_CALLS_REMAINING=0
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
```

The result is a pre-readiness failure. It does not prove a Gemini/provider failure and it does not prove a new product defect.

Current bridge code also makes `CHILD_SPAWN_FAILED` intentionally conservative: it can represent a synchronous spawn exception, process error before ready, stdin failure before ready, or a child that started and exited before a protocol `ready` frame. Therefore no additional provider call is justified until the exact G10 launch boundary is separated deterministically.

## Authorization

```text
CAMPAIGN=8D1K_G11
PROVIDER_CALLS_AUTHORIZED=0
PROVIDER_CALLS_USED=0
```

No Gemini provider call is authorized. Do not retry the corrected live call, run a direct SDK control, run a Node provider control, or execute Search/tools against Gemini.

Historical accounting remains immutable:

```text
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_F_PROVIDER_CALLS_USED=1_OF_1
8D1K_G_CORRECTED_PROVIDER_CALLS_USED=1_OF_1
```

## Routing

- controller/stage authority: Luna
- bounded implementation/correction worker: Sonnet 4.6
- independent reviewer for any product/runtime source change: exact `zai-glm53-reviewer` / `glm-5.3-flash`, read-only
- Codex: sole repository writer/integrator/validator/checkpoint publisher

No reviewer substitution.

## Non-negotiable invariants

- ZERO Gemini provider calls;
- do not read or print the protected Gemini credential value;
- do not read production `.env`;
- do not copy or move the protected credential;
- use synthetic credentials only for deterministic provider-disabled reproduction;
- production Slate/MySQL remain untouched and healthy;
- no production deploy/restart/config/env mutation;
- billing off;
- Vertex disabled;
- no firmware flash;
- no PR #2 merge;
- no Campaign 6D, PR #1, PR #3, Airtable, Immich or unrelated host/storage work;
- Outlook remains read-only and isolated;
- Calendar remains proposal-only;
- Search must not execute;
- no private NOTE4/Outlook/Calendar data;
- obey `REPORT-PUSH-INVARIANT.md` at every meaningful checkpoint/hard stop.

## G11-0 — Reconcile exact state

1. `git fetch origin --prune`.
2. Verify PR #2 is open, draft and unmerged.
3. Verify the current remote head and local relationship.
4. Read:
   - `AGENTS.md`;
   - `docs/campaign-reports/CAMPAIGN-INSTRUCTIONS.md`;
   - `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`;
   - `docs/campaign-reports/CAMPAIGN-STATE.md`;
   - `docs/campaign-reports/08-GEMINI-35-LIVE.md`;
   - `docs/campaign-reports/08D1K-G-ZERO-PROVIDER-GEMINI31-LIVE-TEXT-COMPATIBILITY-RECOVERY.md`;
   - this directive.
5. Preserve corrected source `7a724488a9ed20093469caefc03addc764185be5` unless deterministic evidence proves a source defect.
6. Confirm no further provider call is authorized.

## G11-1 — Reconstruct the exact G10 launch boundary

Recover from durable report/session evidence the exact G10 disposable-container launch shape without reading secrets:

- image ID/tag used;
- architecture;
- container user/UID/GID;
- working directory;
- Bun executable/version;
- Node executable/path/version;
- bridge script path;
- application mount path and read-only state;
- result mount path;
- credential destination `/run/secrets/gemini_api_key` and read-only state;
- `NODE_ENV=test`;
- relevant non-secret bridge env names/values;
- entry command/driver path;
- network mode;
- filesystem/read-only-root settings;
- container exit/OOM/status metadata.

Do not recover or print credential contents or raw provider bodies.

Record only sanitized operational metadata.

## G11-2 — Prove whether the child process actually starts

Using the exact candidate image/runtime and the same user/workdir/application mount shape as G10, but **with network disabled and a synthetic credential only**, prove the following separately:

```text
BUN_PARENT_STARTS=<YES|NO>
NODE_EXECUTABLE_FOUND=<YES|NO>
NODE_VERSION=<safe version>
BRIDGE_SCRIPT_EXISTS=<YES|NO>
BRIDGE_SCRIPT_REGULAR_FILE=<YES|NO>
BRIDGE_SCRIPT_READABLE_BY_RUNTIME_USER=<YES|NO>
NODE_CAN_IMPORT_GOOGLE_GENAI_NODE=<YES|NO>
BUN_CAN_SPAWN_NODE=<YES|NO>
CHILD_PROCESS_SPAWN_EVENT_OBSERVED=<YES|NO>
CHILD_PID_ASSIGNED=<YES|NO>
CHILD_CAN_EMIT_SANITIZED_JSONL=<YES|NO>
PARENT_CAN_PARSE_CHILD_JSONL=<YES|NO>
```

Do not use the real Gemini credential for this stage.

Use a minimal provider-disabled/mock child that exercises the same Bun parent `spawn(..., shell:false, stdio:pipes)` boundary. The mock must be temporary or test-only and must not weaken production behavior.

## G11-3 — Exact mount/user/permission matrix

Reproduce the exact G10 container user and mount semantics with no provider access.

Check metadata only for the historical real credential source and destination; never read its contents. Separately use a synthetic secret under a trusted secret root to prove runtime readability semantics.

Record:

```text
HOST_SOURCE_OWNER_UID=<safe numeric uid>
HOST_SOURCE_GROUP_GID=<safe numeric gid>
CONTAINER_RUNTIME_UID=<safe numeric uid>
CONTAINER_RUNTIME_GID=<safe numeric gid>
DESTINATION_MODE=<mode>
DESTINATION_OWNER_UID=<safe numeric uid>
DESTINATION_GROUP_GID=<safe numeric gid>
DESTINATION_READABLE_BY_RUNTIME_USER=<YES|NO_METADATA_OR_SYNTHETIC_PROOF>
DESTINATION_SYMLINK=NO
MOUNT_RW=false
```

If UID/GID mismatch or mount semantics explain the failure, classify it precisely without reading the real key.

## G11-4 — Disambiguate `CHILD_SPAWN_FAILED`

Before changing source, determine which of these is proven:

```text
A=SPAWN_THROWN_BEFORE_CHILD_CREATED
B=CHILD_PROCESS_ERROR_EVENT_BEFORE_READY
C=STDIN_WRITE_FAILURE_BEFORE_READY
D=CHILD_STARTED_THEN_EXITED_BEFORE_PROTOCOL_FRAME
E=CHILD_EMITTED_PROTOCOL_ERROR_THEN_EXITED
F=HARNESS_OR_MOUNT_PATH_FAILURE_OUTSIDE_PRODUCT
G=UNKNOWN_AFTER_ZERO_PROVIDER_FORENSICS
```

The current label `CHILD_SPAWN_FAILED` must not be treated as proof of A.

Inspect only sanitized stdout protocol frames and non-secret metadata. Raw stderr/provider payload remains unread.

## G11-5 — Bounded observability correction if needed

If G11-2/G11-4 proves that current source collapses materially different pre-ready events into `CHILD_SPAWN_FAILED`, Sonnet 4.6 may propose a bounded source correction and Codex may implement it.

Preferred sanitized stage vocabulary should distinguish at least:

```text
SPAWN_THROWN_BEFORE_CHILD
CHILD_PROCESS_ERROR_BEFORE_READY
STDIN_WRITE_FAILED_BEFORE_READY
CHILD_EXITED_BEFORE_PROTOCOL_FRAME
BRIDGE_CREDENTIAL_UNAVAILABLE
BRIDGE_PROTOCOL_REJECTED
PROVIDER_CONNECT_FAILED_BEFORE_READY
CONNECT_TIMEOUT
```

Do not expose raw child stderr, provider body, key material, filesystem secrets, command argv containing secrets, or private data.

Preserve the public/generic user-facing error surface where appropriate; stage data is diagnostic evidence only.

If no source change is required, do not edit product code merely for ceremony.

## G11-6 — Exact provider-disabled G10-shape replay

After root-cause classification and any bounded correction, run an exact ARM64 provider-disabled replay matching G10's container/user/workdir/mount/entrypoint shape as closely as possible, using:

- corrected candidate source lineage;
- actual Bun parent;
- actual Node executable;
- actual bridge script;
- synthetic trusted secret;
- provider-disabled/mock child/provider boundary;
- network disabled;
- same read-only application/root constraints where applicable;
- durable result capture.

Required proof:

```text
EXACT_G10_SHAPE_BUN_PARENT=PASS
EXACT_G10_SHAPE_NODE_CHILD_SPAWN=PASS
EXACT_G10_SHAPE_JSONL_OPEN_READY=PASS
EXACT_G10_SHAPE_TEXT_FRAME_PATH=PASS
EXACT_G10_SHAPE_DURABLE_RESULT=PASS
PROVIDER_CALLS=0
```

If this cannot pass, continue deterministic diagnosis within this zero-provider scope until either a precise root cause is proven or a genuine human/security boundary is reached.

## G11-7 — Validation

If product/runtime source changed:

- full backend tests;
- shared tests;
- lint;
- typecheck;
- format check;
- frontend build;
- Node syntax/runtime checks;
- `git diff --check`;
- secret scan;
- linux/arm64 build;
- exact G10-shape provider-disabled proof;
- exact GLM-5.3-Flash read-only review of the final source SHA;
- Luna adjudication of all findings.

No P0/P1 may remain. P2 must be resolved or explicitly block progression.

If source did not change, still run the bounded exact G10-shape deterministic proof and report consistency/secret checks.

## G11-8 — Root-cause dossier

Publish one precise conclusion, selecting only what evidence supports. Examples:

```text
ROOT_CAUSE=G10_HARNESS_PATH_OR_MOUNT_MISMATCH
ROOT_CAUSE=RUNTIME_UID_PERMISSION_MISMATCH
ROOT_CAUSE=NODE_EXECUTABLE_OR_SCRIPT_PATH_FAILURE
ROOT_CAUSE=CHILD_STARTED_AND_EXITED_BEFORE_PROTOCOL_FRAME
ROOT_CAUSE=PRODUCT_PRE_READY_CLASSIFICATION_DEFECT_ONLY
ROOT_CAUSE=UNRESOLVED_AFTER_ZERO_PROVIDER_FORENSICS
```

Do not claim the provider rejected the call unless a sanitized provider-connect stage is actually proven.

Do not claim the corrected Gemini 3.1 text transport failed; G10 did not reach model event/turn completion and the current failure is pre-readiness.

## G11-9 — Terminal states

### Success: deterministic boundary closed

```text
CAMPAIGN=8D1K_G11
STATUS=ZERO_PROVIDER_CHILD_SPAWN_BOUNDARY_CLOSED_READY_FOR_HUMAN_DECISION
FINAL_SOURCE_SHA=<exact sha>
ROOT_CAUSE=<precise supported class>
EXACT_G10_SHAPE_PROVIDER_DISABLED_E2E=PASS
PROVIDER_CALLS_THIS_CAMPAIGN=0
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_F_PROVIDER_CALLS_USED=1_OF_1
8D1K_G_CORRECTED_PROVIDER_CALLS_USED=1_OF_1
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_DECIDE_FUTURE_PROVIDER_REVALIDATION_ONLY_AFTER_REVIEWING_G11_ROOT_CAUSE
```

### Hard stop

```text
STATUS=HARD_STOP_G11_UNRESOLVED_OR_SECURITY_BOUNDARY
PROVIDER_CALLS_THIS_CAMPAIGN=0
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=YES
```

## G11-10 — Publication

Obey `REPORT-PUSH-INVARIANT.md`.

At every meaningful checkpoint or terminal state:

1. update `08-GEMINI-35-LIVE.md`;
2. update this G11 report;
3. update `CAMPAIGN-STATE.md` when status changes;
4. secret-check report content;
5. `git diff --check`;
6. selectively commit;
7. push active branch;
8. fetch and verify remote SHA;
9. verify PR #2 remains open/draft/unmerged;
10. record exact pushed SHA before returning control.

No local-only checkpoint counts as durable.

## Controller liveness

Continue autonomously through G11-0 → G11-10 while actions remain zero-provider, non-production and non-destructive.

Do not return control for routine recoverable setup, Docker metadata inspection, provider-disabled reproductions, bounded tests, or report publication.

Stop only if:

- a secret value would need to be exposed/read outside the established runtime mechanism;
- production mutation/restart would be required;
- a new Gemini provider call would be required;
- billing/Vertex/firmware/merge/destructive host action would be required;
- or a genuine unresolved security/technical boundary remains after the authorized deterministic work.

No provider call, 8D1L, or 8D1M is authorized by this directive.

## G11 final forensic dossier and terminal checkpoint

The exact G10 run used the existing ARM64 image
`slate-note4:campaign8-voice-routing-121622c` (image ID
`sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d`),
with inherited `/app` workdir and image user overridden to `0:0`. The runner
overrode the image entrypoint with `/usr/local/bin/bun /work/runner.ts` and
used a read-only root with a 32 MiB `/tmp` tmpfs. The corrected assistant
source was mounted read-only at `/app/backend/src/modules/assistant`, the
runner at `/work/runner.ts`, results at writable `/results`, and the approved
credential at `/run/secrets/gemini_api_key` read-only. G10 used `network=bridge`
with no published ports, `NODE_ENV=test`, model
`gemini-3.1-flash-live-preview`, and the bridge script
`/app/backend/src/modules/assistant/gemini-live-node-bridge-runtime.mjs`.

The exact G10 runner configured `GEMINI_NODE_EXECUTABLE=/usr/local/bin/node`.
That path is absent from the image. The image instead resolves `node` through
`/usr/local/bun-node-fallback-bin/node`, which runs Node-compatible version
`26.3.0` and can import `@google/genai/node`. Therefore the observed
`CHILD_SPAWN_FAILED` was precisely:

```text
G10_FAILURE_CLASS=SPAWN_THROWN_BEFORE_CHILD
G10_FAILURE_DETAIL=HARNESS_NODE_EXECUTABLE_PATH_MISMATCH
G10_CHILD_CREATED=NO
G10_CHILD_PROCESS_ERROR_EVENT=NO
G10_STDIN_WRITE_FAILURE=NO
G10_CHILD_PROTOCOL_FRAME=NO
```

The initial G11 diagnostic runner’s missing-executable probe had an
independent wait-on-`exit` hang; it was corrected with explicit `error` and
`close` handling and is not product evidence. The final provider-disabled
replay used synthetic secret material, `network=none`, the same `0:0` user,
`/app` workdir, read-only root, Bun parent, and read-only source/runner/
credential mounts. Its independent wait/status/copy verification passed:

```text
CAMPAIGN=8D1K_G11
STATUS=ZERO_PROVIDER_CHILD_SPAWN_BOUNDARY_CLOSED_READY_FOR_HUMAN_DECISION
FINAL_SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
ROOT_CAUSE=G10_HARNESS_NODE_EXECUTABLE_PATH_MISMATCH
EXACT_G10_SHAPE_PROVIDER_DISABLED_E2E=PASS
EXACT_G10_SHAPE_BUN_PARENT=PASS
EXACT_G10_SHAPE_NODE_CHILD_SPAWN=PASS
EXACT_G10_SHAPE_JSONL_OPEN_READY=PASS
EXACT_G10_SHAPE_TEXT_FRAME_PATH=PASS
EXACT_G10_SHAPE_DURABLE_RESULT=PASS
NODE_EXECUTABLE_FOUND=YES
NODE_VERSION=26.3.0
NODE_CAN_IMPORT_GOOGLE_GENAI_NODE=YES
CHILD_PROCESS_SPAWN_EVENT_OBSERVED=YES
CHILD_PID_ASSIGNED=YES
CHILD_CAN_EMIT_SANITIZED_JSONL=YES
PARENT_CAN_PARSE_CHILD_JSONL=YES
MODEL_EVENT=YES
TURN_COMPLETE=YES
SLATE_ADAPTER_ERROR=NO
PROVIDER_CALLS_THIS_CAMPAIGN=0
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_F_PROVIDER_CALLS_USED=1_OF_1
8D1K_G_CORRECTED_PROVIDER_CALLS_USED=1_OF_1
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_DECIDE_FUTURE_PROVIDER_REVALIDATION_ONLY_AFTER_REVIEWING_G11_ROOT_CAUSE
```

No tracked product/runtime source changed in G11, so no new GLM review was
required. Production Slate and MySQL remained healthy and untouched; no
credential value, production `.env`, raw provider body, private payload, or
generated audio was read or retained.
