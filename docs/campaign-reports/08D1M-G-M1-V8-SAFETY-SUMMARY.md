# Campaign 8D1M-G — M1 V8 Safety Summary

Date: 2026-09-05 (Australia/Perth)
Branch: `feature/gemini-35-live-evaluation`
Controller: Codex
Writer: Gemini 3.8 Flash
Reviewer: Grok 4.6

## Purpose

This document summarizes the bounded safety modifications implemented in `scripts/slate-m1-rootstep-v8-content-authoritative-verify.sh`, advancing from `scripts/slate-m1-rootstep-v7-signal-safe-rollback-verify.sh` in accordance with the authoritative directive `docs/campaign-reports/08D1M-G-M1-SPARSE-DIAGNOSTIC-RESULT-AND-V8-CONTINUATION.md`. All prior versioned scripts (V2 through V7) remain preserved untouched.

## Background & Problem Solved

During the M1 root step V7 run, the stopped-Docker copy matched regular file count (22 vs 22), logical byte size (1,835,883 vs 1,835,883), relative file path hash, symlink count and targets, and hardlink count and topology. However, V7 failed closed in `stage=copy` with `class=COPY_SPARSE_FILE_COUNT_MISMATCH` because physical allocation derived from `stat %b` allocated blocks differed across distinct filesystems (4 sparse files on eMMC `/dev/mmcblk1p1` vs 5 sparse files on NVMe `/dev/nvme0n1p1`).

The subsequently executed read-only root diagnostic confirmed that sparse block accounting reflects ext4 physical extent allocation characteristics across different block devices rather than logical content corruption. V8 replaces this invalid physical allocation equality gate with authoritative, content-level stopped-Docker checksum verification while retaining all structural identity gates.

## Key Changes in V8

### 1. Sparse-File Count and Allocated-Block Metrics Made Diagnostic-Only
- **Change**: Removed the hard equality gate `[[ "$src_sparse_count" == "$dst_sparse_count" ]] || { failure_class=COPY_SPARSE_FILE_COUNT_MISMATCH; false; }`.
- **Diagnostic Retention**: Both sparse file counts (`SPARSE_FILE_COUNT`) and allocated 512-byte block totals (`ALLOCATED_BLOCKS`) are retained and emitted as diagnostic metrics under `manifest_metrics` for post-run telemetry, but a mismatch will never fail the copy or abort the root switch.

### 2. Stopped-Docker Authoritative Itemized Checksum Equivalence Gate
- **Specification**: Immediately following the stopped-Docker real copy (`rsync -aHAXS --numeric-ids --delete`), V8 executes the exact authoritative dry-run command:
  ```bash
  rsync -aHAXS --numeric-ids --checksum --delete --dry-run --omit-dir-times --itemize-changes "$SOURCE/" "$DEST/" >"$VERIFY_FILE" 2>"$rsync_stderr"
  ```
- **Strict Fail-Closed Logic**:
  - `rsync` command non-zero exit: fails closed with `failure_class=COPY_DETERMINISTIC_VERIFY_COMMAND_FAILED`.
  - Non-empty `stderr`: fails closed with `failure_class=COPY_DETERMINISTIC_VERIFY_COMMAND_FAILED`.
  - Non-empty stdout (`test -s "$VERIFY_FILE"`): fails closed with `failure_class=COPY_DETERMINISTIC_VERIFY_FAILED`.
  - Any error or non-empty diff immediately triggers `handle_failure`, disarms traps, performs a verified rollback restoring production to `/var/lib/docker`, and leaves both Docker trees intact.
  - Passes to `stage=switch` only when stdout and stderr are strictly 0 bytes with exit code 0.

### 3. Bounded Nested-Mount Guard & Filesystem Boundary Protection
- **Rationale**: Docker's data root must reside on a single filesystem; when Docker is stopped, overlay container mounts are unmounted and no active mounts should exist under `$SOURCE/` or `$DEST/`.
- **Implementation**: Right after confirming Docker is inactive (`systemctl is-active docker != active`) and prior to copying, `findmnt` output is captured alongside its exit code before evaluation. If enumeration fails, the guard fails closed immediately without leaking stderr or filesystem paths (`failure_class=NESTED_MOUNT_ENUMERATION_FAILED`). Only when enumeration succeeds is the mount target list matched against `$SOURCE/` or `$DEST/`:
  ```bash
  nested_mounts=
  nested_mounts_rc=0
  nested_mounts=$(findmnt -rn -o TARGET 2>/dev/null) || nested_mounts_rc=$?
  if (( nested_mounts_rc != 0 )); then
    failure_class=NESTED_MOUNT_ENUMERATION_FAILED
    false
  fi
  if printf '%s\n' "$nested_mounts" | grep -E -q "^($SOURCE/|$DEST/)"; then
    failure_class=NESTED_MOUNT_DETECTED
    false
  fi
  ```
- **Fail-Closed & Semantics Preservation**: While an enumeration failure aborts migration safely with rollback, a successful no-match cleanly proceeds to the copy step. This check does not modify `rsync` invocation flags, ensuring full Docker root tree copy semantics without introducing risk of silent subtree exclusions. Existing `find -xdev` flags are preserved across metric aggregations to ensure deterministic single-filesystem traversal.

### 4. Versioned Telemetry & State Artifacts
- Script identification updated to `M1_ROOT_STEP_V8` across all stage and rollback log outputs.
- Pre-migration daemon configuration backup isolated to `/mnt/ssd-tmp/slate-tools/m1-daemon-pre-migration-v8.json`.
- Deterministic verification output captured in `/mnt/ssd-tmp/slate-tools/m1-root-copy-v8-verify.txt`.
- Temporary metrics working directory isolated to `/mnt/ssd-tmp/slate-tools/m1-root-copy-v8-metrics.XXXXXX`.

## Invariant & Protection Preservation

V8 preserves 100% of the verified safety infrastructure from V7:
- **Root-Only Preflight**: Enforces UID 0, binary availability, canonical path checks, realpath assertions, Deluge isolation (`/mnt/ssd-tmp/deluge`), and NVMe `ext4` read-write status.
- **Capacity Floor**: Reserves 180 GB floor plus candidate container footprint (`RESERVE_FLOOR=180000000000`, `CANDIDATE_BYTES=1130645824`).
- **Stopped-Docker Hard Equality Gates**:
  - Regular file count: `src_file_count == dst_file_count`
  - Total logical bytes: `src_logical_bytes == dst_logical_bytes`
  - Hashed relative regular-file path set: `src_path_sha == dst_path_sha`
  - Symlink count and target hash set: `src_link_sha == dst_link_sha`
  - Hardlink file count and topology hash set: `src_hardlink_sha == dst_hardlink_sha`
- **Signal-Safe Traps**: Disarmed traps prevent re-entrancy on `ERR`, `INT` (130), `TERM` (143), and `HUP` (129), executing verified rollbacks on abort.
- **Rollback Robustness**: Verifies daemon config restoration (including SHA-256 validation), service restart, and waits up to 180 seconds with container restart baseline tracking (`slate_restarts <= slate_restart_baseline`) and endpoint health checks (`/healthz`).
- **No Deletion Guarantee**: Neither the source Docker tree (`/var/lib/docker`) nor the destination Docker tree (`/mnt/ssd-tmp/slate-tools/docker-data`) is ever deleted.
- **Data Privacy**: No credentials, private tokens, audio files, or database payloads are read, printed, or inspected.

## Exact Grok review and installation checkpoint

The first exact Grok review identified one P2 fail-open condition in the
nested-mount enumeration. Gemini 3.8 made only the bounded correction to
capture `findmnt`'s exit status and fail closed on enumeration failure. Fresh
exact Grok 4.6 review of the corrected artifact returned:

```text
REVIEW_PROVIDER=GROK
REVIEW_MODEL=grok-4.6
V8_SHA256=52819f0829ffbf68df5d1af37297e3c223310a2f8d44d65191a1e3f9de2326d2
VERDICT=PASS
P0=0
P1=0
P2=0
FINDINGS=NONE
SAFE_FOR_MANUAL_INSTALL=YES
```

The exact reviewed artifact was installed without sudo and not executed:

```text
REMOTE_PATH=/home/pi/slate-m1-rootstep-v8-content-authoritative-verify.sh
REMOTE_TYPE=regular_file
REMOTE_MODE=700
REMOTE_SHA256=52819f0829ffbf68df5d1af37297e3c223310a2f8d44d65191a1e3f9de2326d2
REMOTE_BASH_N=PASS
M1_OBSERVER=ARMED
```

The observer emits only sanitized root/container/health state and is waiting
for the operator’s single V8 sudo execution. No provider call or production
mutation has occurred.

## Verification

1. **Static Syntax Validation**:
   - `bash -n scripts/slate-m1-rootstep-v8-content-authoritative-verify.sh` returned exit code 0.
2. **Local Non-Root Fail-Closed Test**:
   - Executed `./scripts/slate-m1-rootstep-v8-content-authoritative-verify.sh` as non-root user.
   - Result: Exited with code 1 emitting `M1_ROOT_STEP_V8 stage=preflight status=FAIL class=NOT_ROOT`.
3. **Nested-Mount Guard Logic Verification**:
   - Verified fail-closed abort with `class=NESTED_MOUNT_ENUMERATION_FAILED` when findmnt enumeration exits non-zero.
   - Verified fail-closed abort with `class=NESTED_MOUNT_DETECTED` when a nested mount under `$SOURCE/` or `$DEST/` is present.
   - Verified safe pass-through when enumeration succeeds with no nested mounts.
4. **Workspace Invariants**:
   - `scripts/slate-m1-rootstep-v7-signal-safe-rollback-verify.sh` remains completely unmodified.
   - No Git commits, branches, or pushes were executed before Codex publication
     of this checkpoint.
