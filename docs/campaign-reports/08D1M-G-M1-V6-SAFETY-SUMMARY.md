# Campaign 8D1M-G — M1 V6 Safety Corrections Summary

Date: 2026-09-05 (Australia/Perth)
Branch: `feature/gemini-35-live-evaluation`
Controller: Codex
Writer: Gemini 3.8 Flash
Reviewer: Grok 4.6

## Purpose

This document summarizes the safety corrections implemented in `scripts/slate-m1-rootstep-v6-startup-rollback-verify.sh`, applying the latest Grok 4.6 P2/P3 review findings to `scripts/slate-m1-rootstep-v5-startup-rollback-verify.sh`. Prior versions V4 and V5 are preserved untouched.

## Proven Defects and Corrections

### 1. Best-Effort Cleanup in `on_error` & Guaranteed Rollback
- **Defect**: In V5, `cleanup_temp` ran in `on_error` under `set -e` without error suppression. A failure during temp directory cleanup could abort the error trap before `rollback` was attempted.
- **Correction in V6**:
  - Set `set +e` at the start of `on_error` and execute `cleanup_temp || true` so temporary file cleanup is best-effort.
  - Retain `if (( mutation_started )); then rollback || true; fi` so rollback is unconditionally attempted whenever mutations have begun.

### 2. Deadline & Final-Probe Health Acceptance in `wait_for_switch_health`
- **Defect**: In V5, `wait_for_switch_health` failed with `HEALTH_STARTUP_TIMEOUT` at the deadline even if the final healthz probe succeeded.
- **Correction in V6**:
  - Re-structured the wait loop with bounded 180s deadline checks.
  - At the deadline, a final probe evaluates root status, container status, container health, restart bounds, and local/public health endpoints. If all gates pass at the final probe, the function returns 0 (healthy) instead of falsely timing out.

### 3. Eliminated Post-Wait Restart Recapture (TOCTOU Prevention)
- **Defect**: In V5, `stage=switch` re-queried `RestartCount` after `wait_for_switch_health` had already established the post-switch baseline, which could absorb a TOCTOU container restart occurring between the wait loop and final assertions.
- **Correction in V6**:
  - Removed the post-wait re-reading of `slate_restart_expected` and `mysql_restart_expected`.
  - Retains the switched-root baseline established inside `wait_for_switch_health` and verifies it directly via `assert_production_health`.

### 4. Deferred Daemon Backup Creation Past Preflight Collision Checks
- **Defect**: In V5, `DAEMON_BACKUP` was created before checking NVMe reserve space and verify file collisions. A preflight failure on either check left an orphaned backup file, causing subsequent runs to fail with `DAEMON_BACKUP_COLLISION`.
- **Correction in V6**:
  - Moved backup creation after `NVME_RESERVE_PRECHECK_FAILED` and `VERIFY_FILE_COLLISION` checks.
  - Kept `jq` validation preflighted before any mutations.

### 5. Extended Preflight Command Validation
- **Defect**: Several utility commands used throughout the script (`seq`, `grep`, `sleep`, `rmdir`, `cp`, `mv`, `chmod`, `chown`, `rm`) were not verified in preflight.
- **Correction in V6**:
  - Added `seq grep sleep rmdir cp mv chmod chown rm` to the preflight command verification loop alongside existing tools.

### 6. Deterministic Symlink Path-Target Records
- **Defect**: V5 formatted symlinks with `%P\0%l\0` and sorted with `sort -z`. Because NUL delimited each field independently, paths and targets were sorted separately rather than as paired records.
- **Correction in V6**:
  - Reformatted symlink discovery to produce deterministic paired path-target records: `find "$root" -xdev -type l -printf '%P -> %l\n' | LC_ALL=C sort >"$links"`.

### 7. Explicit Sparse-File Gate
- **Defect**: V5 collected `SPARSE_FILE_COUNT` in `manifest_metrics` but never compared or gated sparse files in `stage=copy`.
- **Correction in V6**:
  - Added explicit gate `[[ "$src_sparse_count" == "$dst_sparse_count" ]] || { failure_class=COPY_SPARSE_FILE_COUNT_MISMATCH; false; }` comparing source and destination sparse file counts.

### 8. Hardlink Evidence Strengthened with Inode Identity
- **Defect**: V5 only recorded file paths with link count > 1 (`find -links +1 -printf '%P\n'`), which only verified path names rather than verifying that the hardlink peer equivalence classes were preserved.
- **Correction in V6**:
  - Hardlink extraction captures inode identity and link counts (`find -links +1 -printf '%i %n %P\n'`), grouping entries in `awk` to map each file to its cluster's canonical peer path (`target=min_path`) and link count.
  - Hardlink hash comparison now verifies identical hardlink group topology between source and destination.

## Invariant Preservation

- Preserved paths: `$SOURCE` (`/var/lib/docker`), `$DEST` (`/mnt/ssd-tmp/slate-tools/docker-data`), `$NVME` (`/mnt/ssd-tmp`), `$SLATE_TOOLS`, `$DAEMON_CONFIG`.
- Preserved image pins: `CURRENT_IMAGE`, `ROLLBACK_IMAGE`, `MYSQL_IMAGE`.
- Preserved network and reserve floor: `slate-note4-deploy_default`, `RESERVE_FLOOR=180000000000`.
- Preserved content verification: rsync flags `-aHAXS --numeric-ids --delete`, dry-run checksum verification, file counts, and logical size gates.
- Preserved safety: Neither Docker tree is ever removed; no credentials read or written; no Git delivery performed.
