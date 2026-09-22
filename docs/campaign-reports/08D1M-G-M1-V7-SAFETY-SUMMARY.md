# Campaign 8D1M-G — M1 V7 Safety Corrections Summary

Date: 2026-09-05 (Australia/Perth)
Branch: `feature/gemini-35-live-evaluation`
Controller: Codex
Writer: Gemini 3.8 Flash
Reviewer: Grok 4.6

## Purpose

This document summarizes the safety corrections implemented in `scripts/slate-m1-rootstep-v7-signal-safe-rollback-verify.sh`, applying the latest Grok 4.6 review findings to `scripts/slate-m1-rootstep-v6-startup-rollback-verify.sh`. Prior versions V4, V5, and V6 remain preserved untouched.

## Proven Defects and Corrections

### 1. Fail-Closed Signal Traps (`INT`, `TERM`, `HUP`)
- **Defect**: V6 trapped only `ERR`. Asynchronous interruption (`SIGINT`, `SIGTERM`, `SIGHUP`) during active mutations (`stage=copy` or `stage=switch`) terminated bash immediately without invoking cleanup or executing rollback.
- **Correction in V7**:
  - Added explicit traps for `INT` (exit 130), `TERM` (exit 143), and `HUP` (exit 129). (As specified, `SIGKILL` cannot and need not be trapped).
  - Traps route through `handle_failure`, which disarms signal and error traps to prevent re-entrancy, suppresses `-e`, invokes `rollback` whenever `mutation_started=1`, logs failure status, and exits fail-closed with appropriate signal exit codes.
  - Signal failures use sanitized failure classes (`SIGNAL_INT`, `SIGNAL_TERM`, `SIGNAL_HUP`).

### 2. Switched-Root Restart Baselines & Guarded Health Fields in Rollback
- **Defect**: V6 `rollback()` checked container health using unguarded format queries (`{{.State.Health.Status}}`), which could fail template parsing if health checks were absent or nil. Additionally, rollback health verification did not establish a post-restart baseline or reject subsequent restart count growth, unlike `wait_for_switch_health`.
- **Correction in V7**:
  - Rollback health loop establishes stable restart count baselines (`slate_restart_baseline`, `mysql_restart_baseline`) once containers enter `running` state after the original root (`$SOURCE`) becomes visible.
  - Rejects subsequent restart growth (`slate_restarts > slate_restart_baseline` or `mysql_restarts > mysql_restart_baseline`), while preserving the full 180s timeout window and all container/healthz gates.
  - Standardized health inspection queries across `rollback()` and `assert_production_health` to use guarded templates: `{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}`.

### 3. Explicit Evidence Retention & Collision Cleanup
- **Defect**: In V6, `on_error` invoked `cleanup_temp` before `rollback`, deleting metric evidence before rollback outcome was determined. Furthermore, if copy dry-run failed, `$VERIFY_FILE` was left on disk after a successful rollback, triggering a false `VERIFY_FILE_COLLISION` on the next run. Finally, `rollback || true` ignored rollback return codes and masked rollback failures in the exit line.
- **Correction in V7**:
  - Neither Docker tree (`$SOURCE` or `$DEST`) is ever deleted.
  - If rollback fails, `cleanup_verification_artifacts` is bypassed, preserving `$tmpdir` and `$VERIFY_FILE` as forensic evidence on disk.
  - Rollback failures are never hidden: `failure_class` is classified as `ROLLBACK_FAILED_${failure_class}` and logged with stage and status `FAIL`.
  - Only upon successful rollback (or pre-mutation failure) are known temporary verification artifacts (`$tmpdir` and `$VERIFY_FILE`) removed, preventing stale collisions on retry.

### 4. Safe Source/Destination Identity Checks
- **Defect**: V6 verified that `$SOURCE` and `$DEST` existed as directories and matched their own realpaths, but did not guard against `$SOURCE` and `$DEST` resolving to the same path, having identical device/inode identities, or being nested inside each other.
- **Correction in V7**:
  - Added preflight checks verifying canonical path separation: `[[ "$(realpath "$SOURCE")" != "$(realpath "$DEST")" ]] || { failure_class=SOURCE_DEST_IDENTICAL; false; }`.
  - Added device/inode identity verification: `[[ "$(stat -c '%d:%i' "$SOURCE")" != "$(stat -c '%d:%i' "$DEST")" ]] || { failure_class=SOURCE_DEST_IDENTICAL; false; }`.
  - Added non-overlapping nesting check: `[[ "$DEST" != "$SOURCE"/* && "$SOURCE" != "$DEST"/* ]] || { failure_class=SOURCE_DEST_NESTED; false; }`.

### 5. Explicit Classification of Late Operations
- **Defect**: In V6, failure of several `jq`, `chmod`, `chown`, and file write commands in preflight backup or `stage=switch` left `failure_class` as `UNCLASSIFIED`.
- **Correction in V7**:
  - Preflight backup permissions classified: `DAEMON_BACKUP_CHMOD_FAILED`, `DAEMON_BACKUP_CHOWN_FAILED`.
  - Metrics temporary directory creation classified: `METRICS_TMPDIR_CREATE_FAILED`.
  - Switch configuration operations explicitly classified:
    - JQ update: `DAEMON_CONFIG_UPDATE_FAILED`
    - JQ validation: `DAEMON_CONFIG_VALIDATION_FAILED`
    - Tmp config permissions/move: `DAEMON_CONFIG_TMP_CHMOD_FAILED`, `DAEMON_CONFIG_TMP_CHOWN_FAILED`, `DAEMON_CONFIG_MOVE_FAILED`
    - New config creation/permissions: `DAEMON_CONFIG_CREATE_FAILED`, `DAEMON_CONFIG_CHMOD_FAILED`, `DAEMON_CONFIG_CHOWN_FAILED`.

## Invariant Preservation

- Preserved paths: `$SOURCE` (`/var/lib/docker`), `$DEST` (`/mnt/ssd-tmp/slate-tools/docker-data`), `$NVME` (`/mnt/ssd-tmp`), `$SLATE_TOOLS`, `$DAEMON_CONFIG`.
- Preserved image pins: `CURRENT_IMAGE`, `ROLLBACK_IMAGE`, `MYSQL_IMAGE`.
- Preserved network and reserve floor: `slate-note4-deploy_default`, `RESERVE_FLOOR=180000000000`.
- Preserved content verification: rsync flags `-aHAXS --numeric-ids --delete`, dry-run checksum verification, file counts, symlink targets, hardlink topology, and sparse file gates.
- Preserved safety: Neither Docker tree is ever removed; no credentials read or written; no Git delivery performed.
