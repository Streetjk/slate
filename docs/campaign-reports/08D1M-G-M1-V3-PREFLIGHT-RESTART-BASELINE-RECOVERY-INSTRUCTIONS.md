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
