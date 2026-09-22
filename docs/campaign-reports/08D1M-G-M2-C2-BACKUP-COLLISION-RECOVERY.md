# Campaign 8D1M-G — M2 C2 backup-collision recovery

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Operator result

After D0 proved the original stop failure was caused by the old Docker-API observer and D1 armed the systemd-only observer, the operator reran the exact AGY-reviewed V2 artifact:

```text
ssh -t note4-orangepi 'sudo /home/pi/slate-m2-containerd-rootstep-v2-nvme-reversible.sh'
```

Observed result:

```text
M2_ROOT_STEP_V1 stage=preflight status=FAIL class=BACKUP_COLLISION
```

## Adjudication

This is a fail-closed preflight stop. V2 checks that the fixed backup directory does not already exist before creating it:

```text
BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup
...
test ! -e "$BACKUP" || { failure_class=BACKUP_COLLISION; false; }
mkdir "$BACKUP" || { failure_class=BACKUP_CREATE_FAILED; false; }
```

The prior `CONTAINERD_STOP_FAILED` execution had already created that backup directory during preflight and captured service-state evidence before entering the mutation phase. V2 intentionally preserves it on failure/rollback and intentionally refuses to overwrite it on a later run.

Therefore:

```text
C2_SECOND_ATTEMPT=FAIL_CLOSED_PREFLIGHT
C2_SECOND_FAILURE_CLASS=BACKUP_COLLISION
SECOND_ATTEMPT_MUTATION_STARTED=NO
V2_SOURCE_DEFECT=NO_NEW_EVIDENCE
V2_REVIEWED_SHA=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
V2_BLIND_RERUN=NO
BACKUP_DELETE=NO
```

Do not delete the existing backup directory and do not rerun V2 until the recovery below is completed.

## E0 — read-only backup attribution and live-state revalidation

Codex must first perform bounded read-only checks on Orange Pi and persist the result:

1. Verify exact reviewed V2 still has SHA-256 `09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd` remotely.
2. Inspect only metadata and expected non-secret file names under:
   `/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup`.
3. Confirm the directory is attributable to the first failed C2 run and contains only expected migration evidence/artifacts such as `containerd-service-state.txt` and any deterministic verification files created before failure. Do not print credentials or application/private payload data.
4. Confirm there is no active migration dependency on that directory after the successful rollback.
5. Confirm the migration destination `/mnt/ssd-tmp/slate-tools/containerd-root` is absent, unless exact evidence says otherwise. If it exists unexpectedly, stop and investigate; do not rename or remove it blindly.
6. Confirm the systemd drop-in `/etc/systemd/system/containerd.service.d/99-slate-m2-nvme-root.conf` is absent and the active containerd root remains `/var/lib/containerd`.
7. Revalidate Docker root `/mnt/ssd-tmp/slate-tools/docker-data`, Docker/containerd active, Slate/MySQL healthy with restart stability, local/public health HTTP 200, NVMe reserve >=150 GB, old roots present, and Deluge unchanged.
8. Confirm the D1 systemd-only observer is either still safely armed or re-arm the same non-Docker-API observer. Do not reintroduce Docker CLI/curl/socket access during the stop window.

No provider call, candidate load, firmware flash, credential read, destructive cleanup, or PR merge is authorized in E0.

## E1 — preserve prior backup, do not delete it

If and only if E0 proves the existing backup is solely the preserved evidence from the first failed C2 attempt and no active rollback operation depends on its fixed pathname, preserve it by one atomic rename on the same filesystem to a unique archival name under `/mnt/ssd-tmp/slate-tools/`.

Preferred archival prefix:

```text
/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-containerd-stop-20260906
```

Codex must first prove the chosen destination does not exist. If that name exists, choose a deterministic unique suffix and record it. Do not delete, truncate, overwrite, or recursively copy the prior backup merely to clear the collision.

Because the directory is root-owned migration evidence, the rename is a root mutation and must remain part of the single explicit manual operator boundary. Do not perform it automatically with hidden sudo.

## E2 — one combined manual recovery command

After E0 is PASS, the archive destination is proven absent, the D1 observer is safely armed, and a checkpoint is pushed/fetch-verified, Codex should give the operator exactly one `ssh -t ... sudo ...` command that:

1. atomically renames the old fixed backup directory to the pre-proved archival path; and
2. only if that rename succeeds, immediately executes the unchanged exact reviewed V2 script.

Use shell `&&` fail-closed sequencing so V2 cannot run if preservation fails. Do not use `rm`, `rm -rf`, broad cleanup, or overwrite flags.

Conceptual form only — Codex must substitute the exact pre-proved archive path before presenting the operator command:

```text
ssh -t note4-orangepi 'sudo sh -c '\''mv -- /mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup <EXACT_ARCHIVE_PATH> && exec /home/pi/slate-m2-containerd-rootstep-v2-nvme-reversible.sh'\'''
```

Do not ask the operator to run a separate cleanup command followed by a separate migration command if they can be safely bundled into the one root boundary.

## E3 — outcomes

### PASS

If V2 completes with:

```text
stage=copy status=PASS
stage=switch status=PASS ...
stage=complete status=PASS
```

then ingest the systemd-only observer result, independently verify active containerd root is `/mnt/ssd-tmp/slate-tools/containerd-root`, Docker root remains `/mnt/ssd-tmp/slate-tools/docker-data`, old containerd root is preserved, Slate/MySQL/local/public health pass, reserve passes, Deluge is unchanged, and then continue automatically through existing C3 -> M3 -> M4 authority.

### FAIL with healthy rollback

Persist the exact failure and observer evidence, revalidate production health, and do not blind-rerun.

### Failed archival rename

Do not execute V2. Preserve both paths unchanged and report the exact failure.

## Long-run contract

Report/checkpoint pushes are not stops. Continue all authorized READY/READONLY_READY work after each checkpoint. Stop only at the one explicit root command, a failed healthy rollback, an unexpected destination/config collision, a new credential/provider/billing/private-data boundary, destructive cleanup, new physical scope, or merge/release.

PR #2 remains open/draft/unmerged.

## E0 read-only attribution and E1 archival preparation

Reconciled remote head before E0:

```text
REMOTE_HEAD=432b4425385f5639ecc5af352851f4a59c75a774
INSTRUCTION_SHA=432b4425385f5639ecc5af352851f4a59c75a774
```

The exact remote V2 artifact remains unchanged and independently verified:

```text
V2_REMOTE_SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
V2_REMOTE_TYPE=regular_file
V2_REMOTE_MODE=700
V2_REMOTE_BASH_N=PASS
```

The fixed backup path is attributable to the prior failed/rolled-back C2
attempt. Its root-only metadata is:

```text
BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup
BACKUP_TYPE=directory
BACKUP_OWNER=0:0
BACKUP_MODE=700
BACKUP_SYMLINK=NO
BACKUP_MTIME=2026-09-06 12:45:27.790520097 +0800
```

That timestamp is the prior V2 preflight/stop-window start recorded in the
sanitized service journal. V2's deterministic preflight creates this directory
and writes only its service-state evidence before reporting preflight PASS; the
observed `CONTAINERD_STOP_FAILED` then occurred during the subsequent stop
stage, and rollback preserved the directory. No later migration depends on its
fixed pathname because the destination and containerd drop-in are both absent
and the active root is the original root. Direct enumeration of the contents
was not attempted as the SSH account cannot traverse a root-owned `0700`
directory; non-interactive `sudo -n` correctly reported that a password would be
required. No password was requested, and no file contents were read.

```text
BACKUP_CONTENT_ATTRIBUTION=DETERMINISTIC_V2_PREFLIGHT_EVIDENCE
BACKUP_EXPECTED_PRESTOP_EVIDENCE=containerd-service-state.txt
BACKUP_DELETE=NO
BACKUP_OVERWRITE=NO
BACKUP_ACTIVE_DEPENDENCY=NO
```

The complete live rollback revalidation passed:

```text
DEST=/mnt/ssd-tmp/slate-tools/containerd-root
DEST_ABSENT=YES
DROPIN=/etc/systemd/system/containerd.service.d/99-slate-m2-nvme-root.conf
DROPIN_ABSENT=YES
CONTAINERD_CONFIG_ROOT='/var/lib/containerd'
CONTAINERD_ACTIVE=active
DOCKER_ACTIVE=active
DOCKER_SOCKET_ACTIVE=active
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
SLATE=running/healthy/restarts=0
MYSQL=running/healthy/restarts=0
LOCAL_HEALTH=200
PUBLIC_HEALTH=200
NVME_FREE_BYTES=174205734912
NVME_RESERVE_150GB=PASS
DELUGE_SERVICES=active/running/NRestarts=0
DELUGE_PATHS_PRESENT=YES
DELUGE_MUTATION=NOT_OBSERVED
PRODUCTION_MUTATION=NO
```

The D1 systemd-only observer remains safely armed in its foreground control
session, with systemd-only baseline samples and no Docker API/curl/socket
access during the stop window:

```text
OBSERVER=scripts/slate-m2-c2-systemd-observer-v1.sh
OBSERVER_SHA256=c8cc1be296b18383af4a85550cf84310f47da7a0e3c1fcc330ae5f09ab99d59a
OBSERVER_DIR=/tmp/slate-m2-c2-systemd-observer-v1.OZBjh9
OBSERVER_CONTROL_SESSION=35315
OBSERVER_RESULT=WAITING
OBSERVER_ARMED=YES
OBSERVER_SOCKET_SAFETY=PASS_NO_DOCKER_API_CURL_OR_SOCKET_REFERENCE
```

E0 is PASS. The selected archival path is proven absent and shares the
`slate-tools` parent filesystem device with the fixed backup:

```text
ARCHIVE=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-containerd-stop-20260906
ARCHIVE_ABSENT=YES
BACKUP_PARENT_DEVICE=66305
ARCHIVE_PARENT_DEVICE=66305
ARCHIVE_RENAME=ATOMIC_SAME_FILESYSTEM_REQUIRED
```

The one fail-closed manual root boundary is prepared. It checks that the
archive path is still unused, atomically renames the preserved backup, and
executes the unchanged reviewed V2 only if the rename succeeds:

```text
ssh -t note4-orangepi 'sudo sh -c '\''test ! -e /mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-containerd-stop-20260906 && mv -- /mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup /mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-containerd-stop-20260906 && exec /home/pi/slate-m2-containerd-rootstep-v2-nvme-reversible.sh'\'''
```
