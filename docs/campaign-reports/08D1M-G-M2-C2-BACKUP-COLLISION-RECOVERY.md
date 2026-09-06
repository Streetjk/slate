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
