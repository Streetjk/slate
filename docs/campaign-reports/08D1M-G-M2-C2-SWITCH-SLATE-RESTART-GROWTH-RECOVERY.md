# Campaign 8D1M-G — M2 C2 switch failure: Slate restart-growth recovery

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Operator result

The operator executed the prepared fail-closed command that atomically archived the prior C2 backup and then ran the unchanged exact AGY-reviewed V2 migration artifact:

```text
ssh -t note4-orangepi 'sudo sh -c '\''test ! -e /mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-containerd-stop-20260906 && mv -- /mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup /mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-containerd-stop-20260906 && exec /home/pi/slate-m2-containerd-rootstep-v2-nvme-reversible.sh'\'''
```

Observed result:

```text
M2_ROOT_STEP_V1 stage=preflight status=PASS
M2_ROOT_STEP_V1 stage=copy status=PASS
M2_ROOT_STEP_V1 rollback=PASS containerd_root=/var/lib/containerd docker_root=/mnt/ssd-tmp/slate-tools/docker-data health=PASS
M2_ROOT_STEP_V1 stage=switch status=FAIL class=SLATE_RESTART_GROWTH
```

## Immediate adjudication

```text
C2_RUNTIME_RESULT=FAIL_CLOSED_AFTER_COPY_DURING_SWITCH_VALIDATION
C2_FAILURE_CLASS=SLATE_RESTART_GROWTH
C2_COPY=PASS
C2_SWITCH=FAIL
ROLLBACK=PASS
ACTIVE_CONTAINERD_ROOT_AFTER_SCRIPT=/var/lib/containerd
DOCKER_ROOT_AFTER_SCRIPT=/mnt/ssd-tmp/slate-tools/docker-data
PRODUCTION_HEALTH_AFTER_SCRIPT=PASS_BY_ROLLBACK_GATE
BLIND_RERUN=NO
DELETE_FAILED_DESTINATION=NO
DELETE_BACKUP=NO
```

The successful rollback is strong evidence that production returned to the original root and passed V2's own health gate. Codex must independently revalidate the live state before any new mutation.

## Why this needs attribution before repair

V2 captures Slate/MySQL `RestartCount` before the planned Docker/containerd maintenance stop. Its common health gate then requires the post-start counts to remain less than or equal to those pre-maintenance values:

```bash
(( slate_restarts <= slate_restart_limit )) || { failure_class=SLATE_RESTART_GROWTH; return 1; }
(( mysql_restarts <= mysql_restart_limit )) || { failure_class=MYSQL_RESTART_GROWTH; return 1; }
```

The candidate-root switch necessarily stops and starts containerd and Docker. A one-time restart-count increment caused by that deliberate daemon lifecycle may therefore be expected on this topology, but that is not yet proven. It is also possible that Slate genuinely restarted because of an application/container/runtime problem under the copied containerd root. The gate must not be weakened until the evidence distinguishes those cases.

## G0 — read-only runtime attribution

Codex must reconcile to the current remote head, ingest the operator result, and perform only non-secret/read-only checks first.

### G0.1 Independently verify healthy rollback

Verify at minimum:

- containerd and Docker active;
- active containerd root is `/var/lib/containerd` and state remains `/run/containerd`;
- the temporary containerd service drop-in is absent;
- Docker root remains `/mnt/ssd-tmp/slate-tools/docker-data` with `overlayfs`;
- Slate and MySQL are running/healthy;
- local and public health are HTTP 200;
- current and rollback application images, MySQL image, and expected network are visible;
- old roots remain present;
- NVMe free space remains at or above the activated 150 GB floor;
- Deluge services/paths are unchanged;
- provider calls remain zero.

### G0.2 Preserve and classify artifacts from this failed switch

The switch attempt completed `stage=copy status=PASS`, so the following paths may now exist and must not be removed blindly:

```text
FAILED_SWITCH_DEST=/mnt/ssd-tmp/slate-tools/containerd-root
FAILED_SWITCH_BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup
PRIOR_ARCHIVED_BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-containerd-stop-20260906
```

Record type/owner/mode/device/size/mtime metadata only. Do not print application payloads, credentials, private data, or arbitrary container contents.

Confirm rollback removed the temporary drop-in but intentionally preserved both the copied destination and current attempt backup. Do not delete, truncate, overwrite, or reuse either path until the next artifact strategy is proven.

### G0.3 Determine exactly why `SLATE_RESTART_GROWTH` occurred

Use only sanitized metadata/journals and current Docker inspection. Establish:

- Slate restart count immediately before the switch if recoverable from report/script evidence;
- Slate restart count observed under the candidate root if recoverable from Docker/systemd journal evidence;
- current post-rollback Slate restart count;
- the equivalent MySQL counts;
- `RestartPolicy.Name` and retry settings for Slate and MySQL;
- sanitized container state metadata (`Status`, `ExitCode`, `OOMKilled`, `Error`, `StartedAt`, `FinishedAt`, health status) without application/private payloads;
- sanitized `docker.service`, `containerd.service`, and relevant container-runtime journal ordering around the candidate-root start and rollback;
- whether Slate had exactly one controlled restart associated with the planned daemon transition, or repeated/unexpected restart growth;
- whether MySQL behaved differently and why;
- whether the systemd-only observer remained non-activating and captured the service transition without Docker API access.

Do not consume a provider session, microphone session, or firmware action during attribution.

## G1 — decision after evidence

### Case A — one controlled restart is proven and no instability is observed

If exact evidence proves that `SLATE_RESTART_GROWTH` was a single bounded restart caused by the intentional Docker/containerd lifecycle, while Slate became healthy and showed no subsequent restart growth, treat the current V2 restart gate as too strict for the planned maintenance transition.

Perform one bounded C1 revision to V3. Keep the migration/copy/root-switch behavior otherwise unchanged. The revised validation must:

1. still capture pre-maintenance restart counts;
2. allow only the minimum restart delta proven necessary by the live evidence for this planned daemon transition;
3. never accept an unbounded/repeated restart count;
4. after first healthy startup, capture a post-start restart baseline and require a bounded stability window with **zero further restart growth**;
5. retain healthy Slate/MySQL checks, local/public HTTP checks, exact Docker root/storage-driver checks, containerd-root checks, reserve checks, old-root preservation, rollback, and all no-delete/Deluge protections;
6. retain fail-closed rollback on any health/stability failure;
7. strongly consider explicitly quiescing `docker.socket` during the maintenance stop window if live systemd topology supports preserving/restoring its prior state safely, because the previous C2 incident proved socket activation can interfere. Do not add this merely by assumption; validate service topology and rollback semantics first.

Routing remains:

```text
CONTROLLER=CODEX
WRITER=GEMINI_3_8_FLASH_WHERE_USEFUL
INDEPENDENT_REVIEWER=AGY_GEMINI_3_7_FLASH_HIGH
```

A changed root script must receive a new exact SHA, deterministic validation, secret scan, and a fresh exact independent read-only review. The V2 review verdict does not apply to changed bytes.

### Case B — genuine crash/restart instability is proven

If Slate restarted more than the bounded intentional transition, failed before becoming durably healthy, OOMed, crashed, or otherwise behaved differently under the copied containerd root, **do not weaken the restart gate**.

Instead isolate the exact runtime incompatibility read-only where possible. Preserve the failed destination as evidence. Any new production/storage mutation beyond a bounded correction already covered by the active campaign must stop at the appropriate authority boundary.

## G2 — prepare the next root boundary without deleting evidence

If Case A produces an exact reviewed V3 and the live state is healthy, prepare one combined fail-closed manual command only after proving exact unused archival destinations.

The current failed-switch artifacts should be preserved by same-filesystem atomic rename, not deletion. Preferred prefixes:

```text
/mnt/ssd-tmp/slate-tools/containerd-root.failed-slate-restart-growth-20260906
/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-slate-restart-growth-20260906
```

If either exists, choose a deterministic unique suffix and record it. Recheck the 150 GB NVMe reserve after accounting for a fresh copy. Do not archive by recursive copy.

Bundle the required same-filesystem renames and execution of the exact reviewed V3 into one `ssh -t ... sudo ...` operator command using `test ! -e ... && mv ... && ... && exec ...` fail-closed sequencing. Do not execute it automatically.

## Continuation after migration PASS

After a future migration PASS, independently verify the active containerd root, Docker root, old-root preservation, health, restart stability, reserve, Deluge non-mutation and observer result, then continue automatically through the already-authorized long-run chain:

```text
C3 exact candidate load/deploy
-> M3 exact app-only firmware flash
-> M4 bounded combined EN/JA physical UX retest
```

Reports/checkpoints are not stops. PR #2 remains open/draft/unmerged. No merge/release is authorized.
