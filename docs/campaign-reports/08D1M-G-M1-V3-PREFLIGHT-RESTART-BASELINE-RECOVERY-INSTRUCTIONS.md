# Campaign 8D1M-G — M1 V3 Preflight Restart-Baseline Recovery Instructions

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Trigger

The operator manually ran the prepared V3 root-step script and reported:

```text
M1_ROOT_STEP_V3 stage=preflight status=FAIL class=SLATE_RESTART_COUNT_CHANGED
```

This failure occurred in preflight before `mutation_started=1`, so V3 did not stop Docker, recopy the tree, switch the daemon data-root, call Gemini, flash firmware, or otherwise mutate production state.

Do **not** rerun V3.

## Likely defect to prove

The current V3 script initializes:

```text
slate_restart_expected=0
mysql_restart_expected=0
```

It then captures the live preflight values into `slate_restart_before` / `mysql_restart_before`, but calls `assert_production_health` before assigning the expected restart baselines from those live values.

The accepted post-V2 rollback state already had:

```text
SLATE_RESTARTS=2
MYSQL_RESTARTS=0
```

Therefore a healthy Slate container at restart count 2 can mechanically fail V3 preflight against stale expected value 0 even though no new restart occurred.

Codex must verify this exact control-flow defect against the live V3 source and current Orange Pi state before preparing a replacement.

## Required zero-mutation verification

Verify, without sudo/root mutation where possible:

```text
DOCKER_ROOT=/var/lib/docker
DOCKER_DAEMON=active
SLATE=running/healthy
MYSQL=running/healthy
SLATE_RESTART_COUNT=current live value
MYSQL_RESTART_COUNT=current live value
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
ORIGINAL_ROOT_PRESENT=YES
NVME_COPY_PRESENT=YES
PROVIDER_CALLS=0
FIRMWARE_FLASHED=NO
```

If production is not healthy on the original root, stop and publish the exact sanitized state before any further M1 attempt.

## V4 correction if the defect is confirmed

Prepare a new versioned fail-closed script, e.g.:

```text
/home/pi/slate-m1-rootstep-v4-restart-baseline.sh
```

Do not overwrite V3 silently.

The V4 preflight must:

1. capture the current live restart counts from Slate and MySQL;
2. set the preflight expected restart baselines from those captured live values **before** calling any health assertion that checks restart counts;
3. require running + healthy + local/public HTTP PASS at those baselines;
4. distinguish "non-zero historical restart count" from "restart count grew during this attempt";
5. after switching to the NVMe root, capture the switched-root restart baseline only after the containers become visible there, then reject any growth from that switched-root baseline during the bounded 180-second startup window;
6. preserve the V3 bounded startup wait and rollback-health wait;
7. preserve V2/V3 content verification and all no-delete/no-credential/no-provider/no-firmware/no-merge invariants;
8. automatically restore `/var/lib/docker` and wait for healthy rollback if any post-stop/post-switch gate fails.

Do not weaken the restart-growth protection. Correct only the baseline initialization/control-flow bug.

## Qualification and handoff

Codex must:

- validate V4 with `bash -n` locally and on Orange Pi;
- run its non-root fail-closed preflight where possible;
- record V3 and V4 SHA-256 values, remote mode/path and secret scan;
- update this report and `CAMPAIGN-STATE.md`;
- commit/push/fetch-verify the checkpoint;
- confirm PR #2 remains open/draft/unmerged;
- then give the operator exactly one replacement `ssh -t ... sudo ...` command.

No provider call, firmware flash, Docker-tree deletion, Deluge change, credential access, billing/Vertex/model change, or PR merge is authorized by this recovery step.

After a V4 PASS, independently verify the NVMe Docker root and production health, publish M1 PASS, then continue the already-authorized M2 -> M3 -> M4 chain without another intermediate stop unless a genuinely new authority/safety boundary appears.

## Recovery checkpoint — V4 restart-baseline correction ready

Date: 2026-09-05 (Australia/Perth)

The live original-root state was verified before correction:

```text
DOCKER_ROOT=/var/lib/docker
DOCKER_DAEMON=active
SLATE=running/healthy/restarts=2
MYSQL=running/healthy/restarts=0
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
ORIGINAL_ROOT_PRESENT=YES
NVME_COPY_PRESENT=YES
DISPOSABLE_CONTAINERS=0
PROVIDER_CALLS=0
FIRMWARE_FLASHED=NO
```

The exact V3 control-flow defect is confirmed in the installed source:

```text
26: slate_restart_expected=0
27: mysql_restart_expected=0
151: slate_restart_before=$(docker inspect slate-note4 --format '{{.RestartCount}}')
152: mysql_restart_before=$(docker inspect slate-note4-mysql --format '{{.RestartCount}}')
155: assert_production_health
```

V3 did not initialize the expected values from the captured live values before
that assertion. A healthy Slate restart count of 2 therefore failed against
the stale expected value 0. The observed failure was preflight-only; V3 did
not stop Docker or switch roots.

V4 is the only new script prepared for this correction:

```text
V3_SCRIPT=/home/pi/slate-m1-rootstep-v3-startup-wait.sh
V3_SCRIPT_SHA256=ab130ebbd16fa2e4f028ffc5eb1e315b524dbf4c12f42449c44c3a1a0cbb801a
V4_SCRIPT=/home/pi/slate-m1-rootstep-v4-restart-baseline.sh
V4_SCRIPT_SHA256=5b2d7c23244d34fea0ed248d33516e15c34d3f7a8d4f4ed4f1faec6ea433bfb3
V4_LOCAL_BASH_N=PASS
V4_LOCAL_NONROOT_FAIL_CLOSED=PASS class=NOT_ROOT
V4_REMOTE_MODE=700
V4_REMOTE_BASH_N=PASS
V4_SECRET_SCAN=PASS
```

V4 sets `slate_restart_expected` and `mysql_restart_expected` from the live
preflight captures before `assert_production_health`. It retains separate
switched-root baselines captured after the NVMe daemon exposes the copied
containers, rejects restart growth during the 180-second startup wait,
preserves the V2/V3 content verification, and retains the 180-second
rollback-health wait. No safety gate was weakened and no Docker tree is
deleted.

No provider call, firmware flash, Deluge change, credential/model/billing
change or production deployment was performed. M1 remains pending the single
manual V4 root-step execution.

## Routing adoption checkpoint — Campaign 8E

Date: 2026-09-05 (Australia/Perth)

The Campaign 8E Gemini 3.8 Flash writer / Grok 4.6 reviewer override was read
from checkpoint `0ea99789171d4632a59d82a08fb043e804ea172a`. Origin contained a
newer descendant, `866771056873556ab60193a4786f91a5ec7886b7`, which was
reconciled without rewriting history. The V4 implementation remains the
reviewed artifact; no source correction was required.

The V4 file SHA-256 was rechecked locally and against the installed remote
file as `5b2d7c23244d34fea0ed248d33516e15c34d3f7a8d4f4ed4f1faec6ea433bfb3`.
The live read-only verification remains:

```text
DOCKER_ROOT=/var/lib/docker
ORIGINAL_ROOT_PRESENT=YES
NVME_COPY_PRESENT=YES
SLATE=running/healthy/restarts=2
MYSQL=running/healthy/restarts=0
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
DISPOSABLE_CONTAINERS=0
PROVIDER_CALLS=0
PRODUCTION_CHANGED=NO
```

Gemini 3.8 Flash is now the bounded implementation writer for future
in-scope implementation work; Codex remains controller, sole repository
writer/integrator and validator, and Grok 4.6 remains the independent
reviewer. M1 is still at the manual root-authority boundary. No provider call,
credential access, production mutation or PR merge occurred.

## V5–V7 correction and final safety-review checkpoint

Date: 2026-09-05 (Australia/Perth)

The exact V4 safety review found a guaranteed undefined `manifest_metrics`
failure plus eager switch checks, late `jq` validation, unchecked rollback
operations and stale restart handling. Gemini 3.8 Flash produced V5, V6 and
V7 as bounded, new versioned artifacts. Codex independently ran syntax and
non-root fail-closed checks after each version and confirmed V4, V5 and V6
were preserved whenever a later version was created.

```text
V5_SCRIPT=scripts/slate-m1-rootstep-v5-startup-rollback-verify.sh
V5_SHA256=aff16ce069aa9affd97af17b10b18230bf3ec6cbe4cddf45e982f9e4a2086b2c
V5_BASH_N=PASS
V5_NONROOT_FAIL_CLOSED=PASS class=NOT_ROOT
V6_SCRIPT=scripts/slate-m1-rootstep-v6-startup-rollback-verify.sh
V6_SHA256=8524eb43f0944e290d5ac5743cfe3bfd08b0e4932a34aa6346099c94ee2abc98
V6_BASH_N=PASS
V6_NONROOT_FAIL_CLOSED=PASS class=NOT_ROOT
V7_SCRIPT=scripts/slate-m1-rootstep-v7-signal-safe-rollback-verify.sh
V7_SHA256=f0c8daaa030e9b04fde60d713a5da2a849114f9ebee442892644f1626d02c49e
V7_BASH_N=PASS
V7_NONROOT_FAIL_CLOSED=PASS class=NOT_ROOT
V4_V5_V6_PRESERVED=YES
GROK_V4_REVIEW=FAIL_BOUNDED_DEFECTS_FOUND
GROK_V5_REVIEW=PASS_NO_P0_P1_WITH_P2_P3_HARDENING_REQUIRED
GROK_V6_REVIEW=PASS_NO_P0_P1_WITH_P2_P3_HARDENING_REQUIRED
GROK_V7_REVIEW=PASS_NO_P0_P1_NO_P2
GROK_V7_REVIEWER=GROK_4_6
```

V7 closes the reviewed V6 interruption/rollback, restart-stability, cleanup,
identity and late-operation-classification findings while retaining all V4
mutation, copy, reserve, daemon-config, health, rollback, no-delete and
no-secret gates. Grok’s remaining V7 observations are P3 only: no
`--one-file-system` on rsync, no nested-mount check under the destination,
successful rollback leaves its backup for fail-closed retry collision, and
signal traps are cleared during rollback. None permits a wrong-root PASS or
Docker-tree deletion; V7 is the clean reviewed artifact for the next manual
root step.

No provider call, firmware flash, credential access, production mutation or
PR merge occurred. V7 has not yet been executed on the Orange Pi.
