# Campaign 8D1M-G — LONGRUN V5 runtime-defect recovery to physical closure

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose and precedence

This is the cumulative successor instruction for the current Campaign 8D1M-G runtime-defect frontier. It exists specifically to reduce routine human relay and prevent the controller from stopping every few minutes at reports, test results, reviewer results, bounded repair opportunities, recoverable infrastructure/tool failures, or ordinary milestone completion.

Where this directive conflicts with older C2/G0 node-local instructions, this directive controls. Existing safety, security, privacy, rollback, no-merge, Deluge, credential, provider, firmware-scope, and exact-artifact invariants remain in force unless explicitly changed below.

This directive does **not** authorize broad destructive cleanup, credential creation, billing changes, model/provider substitution outside the routes named here, raw private payload collection, unrestricted provider sessions, filesystem repartition/format, Deluge mutation, deletion of original rollback roots, or PR merge/release.

## Current accepted checkpoint

Accept the live G0 result at source head `34f0ec90816cbb055dd8b35316d64cfa1bcda8d7` unless a newer GitHub checkpoint supersedes it during startup reconciliation.

Current evidence:

```text
M2=FAIL_CLOSED_CANDIDATE_ROOT_SLATE_RESTART_LOOP
ROLLBACK=PASS
ACTIVE_CONTAINERD_ROOT=/var/lib/containerd
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
SLATE_POST_ROLLBACK=running/healthy/restarts=0
MYSQL_POST_ROLLBACK=running/healthy/restarts=0
LOCAL_PUBLIC_HEALTH=HTTP_200
G0_SLATE_RESTART_COUNT_UNDER_CANDIDATE_ROOT=5
G0_MYSQL_RESTART_COUNT_UNDER_CANDIDATE_ROOT=0
RESTART_GATE_WEAKENING=NO
FAILED_CANDIDATE_ROOT=/mnt/ssd-tmp/slate-tools/containerd-root
CURRENT_ATTEMPT_BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup
PRIOR_BACKUP_ARCHIVE=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-containerd-stop-20260906
PROVIDER_CALLS=0
PRODUCTION_HEALTH=PASS
```

The repeated Slate restarts are a genuine runtime defect under the copied candidate containerd root. Do not treat this as a reason to stop the overall campaign. Treat it as a blocked node with a large authorized diagnostic/repair frontier.

## Controller contract

```text
MODE=FRONTIER_DRIVEN_LONGRUN
CONTROLLER=CODEX
RUNNING_INTEGRATION_AUTHORITY=CODEX
PRIMARY_IMPLEMENTATION_WORKER=GEMINI_3_8_FLASH
INDEPENDENT_REVIEWER=AGY_GEMINI_3_7_FLASH_HIGH
REPORT_IS_CHECKPOINT_NOT_STOP=YES
NORMAL_PASS_AUTO_CONTINUES=YES
NORMAL_FAIL_ENTERS_REPAIR_LOOP=YES
REVISE_AUTO_REPAIRS=YES
NODE_BLOCK_DOES_NOT_IMPLY_SESSION_STOP=YES
CHECKPOINT_PUSH_DOES_NOT_REQUIRE_HUMAN_RELAY=YES
CHILD_TIMEOUT_DOES_NOT_TERMINATE_CAMPAIGN=YES
NO_ARTIFICIAL_RUNTIME_PADDING=YES
GIT_IS_DURABLE_MEMORY=YES
GITHUB_IS_ASYNC_CONTROL_BUS=YES
```

On startup or restart:

1. fetch origin;
2. verify repository, branch, PR and worktree state;
3. read `AGENTS.md`, current campaign state, latest reports, this directive, and any newer instruction committed after it;
4. reconcile GitHub and remote Orange Pi state;
5. record the exact instruction SHA consumed in campaign state;
6. recompute the full authorized frontier;
7. immediately execute the highest-priority READY or READONLY_READY node.

After **every** meaningful child result:

```text
PERSIST RESULT
-> UPDATE REPORT/STATE
-> PUSH
-> FETCH/RE-READ CONTROL PLANE
-> RECONCILE
-> RECOMPUTE FULL FRONTIER
-> CONTINUE HIGHEST-PRIORITY READY / READONLY_READY NODE
```

Do not stop because a report was published, a stage passed, a stage failed in a repairable way, a reviewer returned REVISE, one diagnostic strategy was exhausted, one model/tool timed out, or one child task completed.

## Standing authority — no additional human approval required

Within this campaign scope, Codex may continue autonomously through all of the following without asking the human again.

### A. Deep read-only runtime forensics

Perform any bounded non-secret read-only diagnostics needed to isolate the Slate-only restart loop, including:

- systemd/Docker/containerd unit topology and sanitized journals;
- Docker/container metadata: status, timestamps, exit codes, OOM state, health state, restart policy/count, mount *paths/types* and network identity without printing secret values;
- containerd persistent-root metadata, filesystem metadata, ownership, permissions, xattrs, hardlink/symlink structure, hashes and deterministic comparisons;
- comparisons between `/var/lib/containerd` and the failed copied root;
- namespace/task/shim/runtime metadata sufficient to determine whether persistent and ephemeral runtime state became inconsistent;
- network namespace, bind-mount, device, cgroup, runtime, healthcheck and dependency timing analysis;
- exact service journal ordering around the failed candidate-root run;
- official Docker/containerd/systemd documentation where useful;
- repository/deployment-manifest inspection;
- sanitized application stderr/error diagnostics **only when needed to identify the crash**, with strict filtering/redaction so no request bodies, authorization headers, credentials, raw audio, transcript content, provider payloads, calendar/email/private data, or secret values are persisted or pushed.

A lack of one convenient log source is not terminal. Climb the evidence ladder: metadata -> targeted sanitized diagnostics -> deterministic reproduction -> repair hypothesis -> proof test.

### B. Non-production deterministic reproduction

Codex may build and run bounded disposable/local/offline reproductions that do not replace production services, including:

- provider-disabled Slate containers;
- disposable Docker/containerd/systemd test harnesses;
- synthetic network/mount/runtime tests;
- script state-machine harnesses;
- exact-image startup tests using non-private inputs;
- controlled tests of restart policy, task/shim lifecycle, healthcheck timing and container recreation semantics.

Do not consume Gemini/provider sessions for these tests. Do not mount/read the production Gemini key merely to prove mechanics. Do not use private microphone/audio/transcript content.

### C. Bounded implementation and repair loop

Once evidence identifies a credible defect, continue automatically through implementation, test and review. Up to **three materially distinct repair hypotheses** may be pursued in one controller session before classifying that node as locally exhausted. For each hypothesis:

1. write the smallest repair using Gemini 3.8 Flash where useful;
2. Codex independently validates and integrates;
3. run deterministic tests/static checks/secret scan;
4. run exact independent AGY `gemini-3.7-flash-high` review on the exact candidate SHA/artifact;
5. PASS -> continue;
6. REVISE -> repair -> retest -> exact rereview without human relay;
7. provider/tool/permission failure -> bounded recovery/retry using the same approved reviewer route, then continue other READY work while unavailable.

Do not silently substitute Grok, GLM, OpenRouter, Luna, Sonnet or another reviewer/provider. The already-proven AGY Gemini 3.7 high route is the standing independent reviewer for this bounded runtime/storage repair chain.

### D. Allowed repair shapes if evidence supports them

The repair is not predetermined. Codex may choose the smallest proven-safe design, including one or a combination of:

- correcting containerd persistent-root migration/copy/switch semantics;
- explicitly quiescing/restoring `docker.socket` during the maintenance window if systemd topology proves that is required and rollback is exact;
- separating persistent-root migration from ephemeral `/run/containerd` task/shim state correctly;
- adding bounded wait/stability checks;
- handling stale task/shim/runtime metadata safely;
- recreating **Slate only** after the root switch using the exact already-approved current image/config/compose definition if evidence proves the existing Slate task/container identity cannot survive the root transition, while preserving MySQL and all data;
- preserving or re-establishing the exact existing network/mount/device configuration without printing secret values;
- using the existing failed copied root as a verified/preseeded derived artifact if a refresh strategy is proven correct;
- refreshing or replacing only a **derived candidate copy** after durable forensic evidence has been captured, provided the authoritative original `/var/lib/containerd` remains intact and rollback remains available.

Do not recreate MySQL unless a new explicit human instruction authorizes it. Do not change application product behavior merely to make migration pass. Do not weaken health/restart gates to conceal real instability.

### E. Storage-aware evidence and derived-artifact handling

The 150 GiB NVMe reserve remains mandatory.

Because free space is close to the floor and a failed derived candidate root already exists, do not blindly create another full copy. First measure exact space and choose the least-space repair strategy.

Standing authority is granted to preserve compact durable forensic evidence and then **refresh, overwrite, or remove only the specifically classified derived candidate containerd-root copy** if and only if all of the following are true:

1. exact path is `/mnt/ssd-tmp/slate-tools/containerd-root` or a clearly recorded failed-candidate derivative;
2. it is proven to be a derived copy, not the authoritative active root;
3. active production is verified on `/var/lib/containerd` before mutation;
4. the original `/var/lib/containerd`, old Docker root, current NVMe Docker root, rollback images, MySQL data, Deluge data, and audit backups remain preserved;
5. relevant forensic hashes/metadata/journal evidence are durably recorded first;
6. the action is required to maintain the 150 GiB reserve or construct the next exact candidate;
7. the action is narrow and path-guarded, with no wildcard/broad prune.

This authority is intentionally limited to disposable/derived candidate-root artifacts. It does **not** authorize deleting `/var/lib/containerd`, `/var/lib/docker`, `/mnt/ssd-tmp/slate-tools/docker-data`, Deluge trees, MySQL data, rollback images, or the preserved audit backup directories.

If root privilege is required for such candidate-artifact handling, bundle it into the next single reviewed/manual root boundary rather than stopping separately for cleanup.

## Runtime-defect campaign frontier

Execute this as one continuous campaign, not as separate human-gated mini-campaigns.

### R1 — forensic root-cause closure

Determine why Slate restarted five times while MySQL remained stable under the candidate containerd root. Do not stop after producing a hypothesis. Obtain enough deterministic evidence to distinguish at minimum:

- application crash vs healthcheck/restart-policy behavior;
- stale task/shim/ephemeral runtime state vs persistent-root corruption;
- container-specific mount/device/network dependency vs generic containerd failure;
- copied-root metadata inconsistency vs Docker recreation semantics;
- service/socket race vs post-start runtime defect.

Publish a compact root-cause matrix and continue immediately to R2/R3.

### R2 — repair proof

Build the minimum safe correction and prove it outside the final production root switch as far as practical. Use provider-disabled/synthetic tests and exact configuration-shape checks.

If the best repair is Slate-only recreation after root migration, prove the recreation command/compose path deterministically and prove MySQL is untouched. If the repair changes the root migration script, produce a new exact script SHA and state machine proof.

### R3 — exact independent review

AGY Gemini 3.7 Flash High reviews the exact repair artifact(s), migration script and any Slate recreation/deployment sequence that will execute at the root boundary.

Review must cover rollback, failure handling, socket activation, task/shim state, data preservation, secret handling, Deluge isolation, reserve handling, Slate/MySQL boundaries and command quoting.

PASS advances automatically. REVISE loops automatically.

### R4 — prepare one compressed root boundary

Only after diagnosis, deterministic proof, exact review and live preflight all pass, prepare **one** operator root command for everything requiring sudo. Bundle, where applicable:

- exact path-guarded preservation/refresh of derived failed candidate artifacts;
- exact reviewed root migration/switch;
- docker.socket handling if the reviewed repair requires it;
- any reviewed Slate-only post-switch recreation step that must run in the same fail-closed transaction;
- final root-level verification hooks.

Use `&&`/fail-closed sequencing and exact paths. No `sudo -S`, no password capture, no broad `rm -rf`, no wildcard deletion.

Do not ask the human to run separate cleanup, migration, verification and restart commands when they can safely be bundled into one reviewed transaction.

Until that single root boundary is genuinely required, keep working through all READY/READONLY_READY diagnosis, implementation, validation and review nodes.

### R5 — post-root automatic verification

After the operator returns the root-command result, ingest it and continue automatically if PASS. Independently verify:

- active containerd root and state;
- Docker NVMe root and overlayfs;
- Slate/MySQL running and healthy;
- restart stability window with zero unbounded growth;
- local/public health;
- current/rollback/MySQL images and expected network;
- old authoritative roots preserved;
- 150 GiB reserve;
- Deluge unchanged;
- no provider calls/private-session use.

A PASS report is not a stop.

### R6 — C3 exact UX candidate deployment

Continue immediately into the already-approved M2/C3 candidate path:

- verify durable tar exact SHA `cf47b8c4bb6aec65161d1c54e766bbf62f9a4ada1430fb5b86766231d7074865`;
- load/register exact image `sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4`;
- recreate **Slate backend only** as required by the existing deployment plan;
- preserve MySQL, public routing, rollback image and protected credential source;
- provider-disabled deterministic validation first;
- no provider call merely to prove deployment;
- deterministic failure -> automatic bounded rollback/repair/retest without human relay where already authorized.

### R7 — M3 app-only firmware

After M2/C3 PASS, continue automatically through the already-authorized exact app-only firmware step:

```text
FIRMWARE_APP_SHA256=edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb
TARGET=ESP32-S3
FLASH_SIZE=16MB
APP_OFFSET=0x10000
```

No full erase, partition/NVS/LittleFS rewrite, pairing reset or unrelated firmware change. Verify exact device identity before writing. If identity/pin changed, that is a genuine human/safety boundary; otherwise do not stop just because M3 is a milestone.

### R8 — M4 one combined EN/JA physical UX session

After M3 PASS, arm sanitized observers and ask for **one combined human action only** for the already-approved private-mic test:

- one short English question;
- one short Japanese question;
- maximum one provider session;
- Search/tools/calendar writes/Outlook data OFF unless already explicitly required by the existing M4 contract;
- retain no raw audio, raw provider payload or transcript content;
- capture sanitized latency/state/UI/audio markers only.

Do not ask the human for separate EN and JA sessions. Do not consume a blind second provider session if the first is ambiguous; analyze available evidence first.

### R9 — bounded UX repair and rereview loop

If M4 reveals a deterministic product defect that remains within the already-authorized UX scope, continue automatically:

repair -> deterministic regression -> exact reviewer pass -> backend/firmware requalification -> one next authorized physical boundary only if another private provider/mic session is actually necessary.

Do not stop merely because a reviewer says REVISE or a deterministic test fails.

### R10 — closure dossier

At objective completion, publish one durable dossier covering:

- root cause and repair;
- exact artifact SHAs;
- migration/rollback evidence;
- backend image/deploy evidence;
- firmware evidence;
- EN/JA physical UX result;
- reviewer evidence;
- privacy/security/provider accounting;
- remaining P2/P3 debt separately from blockers.

Keep PR #2 open/draft/unmerged. Merge/release remains a human boundary.

## What is explicitly NOT a reason to stop

Do not terminalize the controller for:

- report/checkpoint publication;
- Git push success;
- one stage PASS;
- one test failure with a bounded repair path;
- compiler/linter/test failure;
- reviewer REVISE;
- reviewer/tool transient failure with bounded recovery available;
- completion of R1, R2, R3, R5, R6, R7 or another intermediate milestone;
- a provider-disabled reproduction failure;
- discovery of a P2/P3 issue;
- one repair hypothesis being disproven;
- one child task timeout;
- one unavailable read-only evidence source when another safe evidence path exists.

## Genuine stop conditions

Stop only when **all** authorized READY and READONLY_READY work is exhausted and one of these is true:

1. one manual sudo/root transaction is required because credentials cannot be safely relayed;
2. changed device identity/pin makes the exact firmware target uncertain;
3. a new credential/login/billing/private-data trust boundary is required;
4. a new provider/model/reviewer outside the named standing routes is required;
5. an irreversible/destructive action outside the narrowly authorized derived-candidate handling above is required;
6. unresolved P0/P1 or security contradiction makes continuation unsafe;
7. the single M4 human physical/microphone action is required;
8. objective complete and merge/release decision remains;
9. authorized frontier genuinely exhausted with no safe work left.

Before any exit, persist:

```text
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
INSTRUCTION_SHA_CONSUMED=
```

Terminal exit is forbidden while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0` unless continuing would violate safety/authority.

If a human action is finally required, provide **one compressed decision/action packet**, not a chain of incremental questions.

## End-state principle

The controller is expected to remain work-conserving for hours if useful authorized work exists. Time elapsed is not a success metric. Human interventions per completed stage should be minimized. Routine engineering continuation belongs to Codex; the human is reserved for true authority, credential, physical-device, private-session, irreversible-action and release boundaries.
