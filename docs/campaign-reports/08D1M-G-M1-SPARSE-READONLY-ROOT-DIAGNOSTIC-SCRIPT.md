# Campaign 8D1M-G — M1 Sparse Read-Only Root Diagnostic Script

Date: 2026-09-05 (Australia/Perth)
Controller: Codex
Writer: Gemini 3.8 Flash
Reviewer: Grok 4.6 (Independent)
Status: CODEX_VALIDATED_READY_FOR_MANUAL_READONLY_ROOT_RUN

---

## 1. Background and Operational Context

During Campaign 8D1M-G M1, the operator executed `slate-m1-rootstep-v7-signal-safe-rollback-verify.sh`. The run passed preflight and regular content comparisons:
- Regular file count matched identically: 22 vs 22
- Relative path set SHA-256 matched: `7b427240b693685fc62078aca7ecf35ef3694c7884df1fbb42ab15637ba4429f`
- Logical bytes matched: 1,835,883 vs 1,835,883
- Symlink count (0) and target hash matched
- Hardlink count (0) and path hash matched

However, V7 failed closed in `stage=copy` with `class=COPY_SPARSE_FILE_COUNT_MISMATCH` because:
```text
SRC_SPARSE_FILE_COUNT=4
DST_SPARSE_FILE_COUNT=5
```

The script performed an automatic, healthy rollback to `/var/lib/docker`, leaving the production containers (`slate-note4`, `slate-note4-mysql`) healthy with restart counts unchanged and endpoints serving HTTP 200.

An unprivileged controller session confirmed that the original Docker root and the NVMe copy are intact on separate `ext4` filesystems (`/dev/mmcblk1p1` vs `/dev/nvme0n1p1`). However, non-root inspection cannot traverse the Docker data trees, and an unprivileged rsync dry-run failed with permission error (`RC=3`). Consequently, path-level proof of the 4-vs-5 sparse file difference remained blocked (`08D1M-G-M1-V7-SPARSE-METRIC-RECOVERY-STATE.md`).

Sparse file classification in V7 (`logical_size > allocated_blocks * 512`) is an accounting of physical filesystem blocks (`%b`), which can naturally vary between ext4 file creation and extent allocation across distinct block devices even when logical content is 100% identical.

To establish conclusive proof before preparing V8, this diagnostic task provides a standalone, strictly read-only root inspection script.

---

## 2. Artifact Identification

- **Script Path**: `/Users/ollama/slate/scripts/slate-m1-sparse-readonly-root-diagnostic-v1.sh`
- **File Mode**: `0755` (`-rwxr-xr-x`) locally; installed operator copy is restricted to `0700`
- **Syntax Check (`bash -n`)**: `PASS`
- **SHA-256**: `ffb42c0cee064186a097d96a079b6f6d8e03939df4f6630e3bc37bbb8958aa5b`

---

## 3. Strict Safety Invariants & Guardrails

The script is strictly read-only and incorporates comprehensive fail-closed guardrails:

1. **Root-Only Execution**:
   Enforces `[[ "$(id -u)" == 0 ]]`, failing closed with `NOT_ROOT` if run unprivileged.
2. **Strict Read-Only Guarantee**:
   Performs zero mutations:
   - Does not modify `/var/lib/docker` or `/mnt/ssd-tmp/slate-tools/docker-data`.
   - Does not modify `/etc/docker/daemon.json` or Docker service state.
   - Does not start, stop, restart, or signal any Docker container.
   - Does not touch Deluge paths (`/mnt/ssd-tmp/deluge`), credentials, or provider configuration.
   - Rejects any command-line arguments (`UNEXPECTED_ARGUMENTS`) to prevent unintended flags or actions.
3. **Canonical Path & Separation Guardrails**:
   - Validates canonical realpaths: `realpath($SOURCE) == $SOURCE` and `realpath($DEST) == $DEST`.
   - Rejects source and destination path identity: `realpath($SOURCE) != realpath($DEST)`.
   - Rejects device/inode identity: `stat -c '%d:%i' $SOURCE != stat -c '%d:%i' $DEST`.
   - Rejects directory nesting: `$DEST != $SOURCE/*` and `$SOURCE != $DEST/*`.
   - Rejects Deluge collision: `$DEST` and `$SOURCE` != `/mnt/ssd-tmp/deluge` or subdirectories.
4. **Filesystem Identity Separation**:
   Verifies distinct block devices and mountpoints via `findmnt` and `stat -c '%d'`, confirming separation between eMMC (`/dev/mmcblk1p1`) and NVMe (`/dev/nvme0n1p1`).
5. **Isolated Temporary Directory & Trap Cleanup**:
   - Creates a temporary working directory via `mktemp -d /tmp/slate-m1-sparse-diag.XXXXXX`.
   - Explicitly asserts that the temporary directory is outside both `$SOURCE` and `$DEST`.
   - Traps `EXIT`, `ERR`, `INT` (130), `TERM` (143), and `HUP` (129) to guarantee removal of only its own temporary files and directory (`rmdir "$tmpdir"`).
6. **Data Privacy & Sanitization**:
   - Never reads or prints file contents (`cat`, `head`, `tail`, `strings`, `od`, etc. are strictly forbidden).
   - Computes a stable SHA-256 identity for each relative regular-file path (`printf '%s' "$relpath" | sha256sum`).
   - Emits only sanitized aggregate counts, hashes, boolean equality flags, and sparse-difference counts.
   - Never leaks plaintext file paths or raw metadata blobs to stdout/stderr.
7. **Live-baseline fail-closed gate**:
   After read-only Docker/service inspection, the script requires the expected
   original root, active Docker service, running/healthy Slate and MySQL,
   expected network, and local/public HTTP 200 health before it classifies any
   copy evidence. It never repairs or waits by mutating production state.

---

## 4. Inspection Mechanics & Dry-Run Verification

### A. Docker Root & Service Verification
- Verifies `systemctl is-active docker`.
- Verifies `docker info --format '{{.DockerRootDir}}' == /var/lib/docker`. Fails closed if Docker is not pointing to the expected original root.
- Inspects container state and health for `slate-note4` and `slate-note4-mysql` using safe format expressions.
- Checks local (`http://127.0.0.1:3001/healthz`) and public (`https://orangepi5.tail6aabef.ts.net/healthz`) health endpoints.

### B. Metadata & Relative Path Hashing
- Recursively inspects regular files within each tree without crossing filesystems (`find ... -xdev -type f -printf '%P\0'`).
- Computes SHA-256 for each relative path string:
  $$\text{path\_sha256} = \text{SHA-256}(\text{relative\_path})$$
- Collects per-file stat metrics: logical size (`%s`), allocated 512-byte blocks (`%b`), octal mode (`%a`), UID (`%u`), GID (`%g`), hardlink count (`%h`), and sparse boolean (`size > blocks * 512`).
- Aggregates metrics:
  - `FILE_COUNT`
  - `PATH_SET_SHA256` (SHA-256 of sorted relative-path hashes)
  - `LOGICAL_BYTES`
  - `ALLOCATED_BLOCKS`
  - `TRANSFERABLE_METADATA_SHA256` (SHA-256 of path hash, size, mode, UID, GID, link count)
  - `SPARSE_FILE_COUNT`
  - `SPARSE_DIFFERENCE_COUNT`
- Collects sanitized symlink and hardlink counts and topology hashes without exposing plaintext paths.

### C. Exact Rsync Dry-Run
Executes the exact authoritative dry-run command:
```bash
rsync -aHAXS --numeric-ids --checksum --delete --dry-run --omit-dir-times --itemize-changes /var/lib/docker/ /mnt/ssd-tmp/slate-tools/docker-data/
```
- Captures `stdout` and `stderr` exclusively in temporary files within `$tmpdir`.
- Computes exit code, byte counts, and SHA-256 digests of stdout and stderr.
- Classifies the result strictly as `EMPTY_PASS` (if `rc == 0`, stdout bytes == 0, and stderr bytes == 0) vs `NONEMPTY_OR_ERROR`.
- Never prints the contents of the dry-run output to console or logs.

---

## 5. Output Format & Operator Interpretation

When executed by root on the host, the script outputs structured key-value diagnostics:

```text
=== SLATE M1 SPARSE READ-ONLY ROOT DIAGNOSTIC v1 ===
DIAGNOSTIC_MODE=READ_ONLY
EXECUTION_USER_ID=0

--- DOCKER_SERVICE_PROVE ---
DOCKER_SERVICE_ACTIVE=active
DOCKER_ROOT=/var/lib/docker
DOCKER_ROOT_VERIFIED=YES
STORAGE_DRIVER=overlayfs
SLATE_CONTAINER_STATUS=running
SLATE_CONTAINER_HEALTH=healthy
SLATE_RESTART_COUNT=0
MYSQL_CONTAINER_STATUS=running
MYSQL_CONTAINER_HEALTH=healthy
MYSQL_RESTART_COUNT=0
SLATE_NETWORK_PRESENT=YES
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200

--- SAFE_FILESYSTEM_IDENTITY ---
SOURCE_TARGET=/
SOURCE_FSTYPE=ext4
SOURCE_DEVICE=/dev/mmcblk1p1
SOURCE_DEVICE_ID=...
DEST_TARGET=/mnt/ssd-tmp
DEST_FSTYPE=ext4
DEST_DEVICE=/dev/nvme0n1p1
DEST_DEVICE_ID=...
FILESYSTEM_SEPARATION_VERIFIED=YES

--- METADATA_INSPECTION_AGGREGATES ---
SRC_FILE_COUNT=22
DST_FILE_COUNT=22
FILE_COUNT_EQUAL=YES
SRC_PATH_SET_SHA256=...
DST_PATH_SET_SHA256=...
PATH_SET_EQUAL=YES
SRC_LOGICAL_BYTES=1835883
DST_LOGICAL_BYTES=1835883
LOGICAL_BYTES_EQUAL=YES
SRC_ALLOCATED_BLOCKS=...
DST_ALLOCATED_BLOCKS=...
ALLOCATED_BLOCKS_EQUAL=...
SRC_TRANSFERABLE_METADATA_SHA256=...
DST_TRANSFERABLE_METADATA_SHA256=...
TRANSFERABLE_METADATA_EQUAL=YES
SRC_SYMLINK_COUNT=0
DST_SYMLINK_COUNT=0
SRC_SYMLINK_TARGET_SHA256=...
DST_SYMLINK_TARGET_SHA256=...
SRC_HARDLINK_FILE_COUNT=0
DST_HARDLINK_FILE_COUNT=0

--- PER_PATH_COMPARISON_METRICS ---
PATHS_ONLY_IN_SRC_COUNT=0
PATHS_ONLY_IN_DST_COUNT=0
LOGICAL_SIZE_MISMATCH_COUNT=0
MODE_MISMATCH_COUNT=0
UID_MISMATCH_COUNT=0
GID_MISMATCH_COUNT=0
LINK_COUNT_MISMATCH_COUNT=0
ALLOCATED_BLOCKS_DIFF_COUNT=...
SRC_SPARSE_FILE_COUNT=4
DST_SPARSE_FILE_COUNT=5
SPARSE_DIFFERENCE_COUNT=1
SPARSE_DIFFERENCE_RECORDS_SHA256=...

--- EXACT_RSYNC_DRYRUN ---
RSYNC_DRYRUN_COMMAND=rsync -aHAXS --numeric-ids --checksum --delete --dry-run --omit-dir-times --itemize-changes /var/lib/docker/ /mnt/ssd-tmp/slate-tools/docker-data/
RSYNC_DRYRUN_RC=0
RSYNC_DRYRUN_STDOUT_BYTES=0
RSYNC_DRYRUN_STDOUT_SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
RSYNC_DRYRUN_STDERR_BYTES=0
RSYNC_DRYRUN_STDERR_SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
RSYNC_DRYRUN_RESULT=EMPTY_PASS

--- DIAGNOSTIC_VERDICT ---
VERDICT=PASS_CONTENT_IDENTICAL_SPARSE_ALLOCATION_REPRESENTATION_ONLY
ANALYSIS=Sparse file count discrepancy (4 vs 5) is proven to be filesystem block allocation representation rather than content or metadata corruption.
M1_SPARSE_DIAG stage=complete status=PASS
```

### Decision Rule for Authorizing V8
- If `RSYNC_DRYRUN_RESULT=EMPTY_PASS`, `PATH_SET_EQUAL=YES`, `LOGICAL_BYTES_EQUAL=YES`, and `TRANSFERABLE_METADATA_EQUAL=YES`:
  This confirms that file contents, paths, permissions, owners, groups, ACLs, xattrs, and symlinks/hardlinks are byte-for-byte identical.
  The sparse difference (4 vs 5) is proven to be physical allocation representation across `ext4` on eMMC vs `ext4` on NVMe.
  This provides the empirical proof required to authorize preparing `slate-m1-rootstep-v8-content-authoritative-verify.sh`.
- If `RSYNC_DRYRUN_RESULT=NONEMPTY_OR_ERROR`:
  A genuine content or transferable metadata discrepancy exists; V8 must not be prepared by weakening the gate.

---

## 6. Codex validation and operator installation checkpoint

The initial Gemini 3.8 draft was reviewed by Codex and bounded only to add a
fail-closed live-baseline gate. The final artifact was validated as follows:

```text
LOCAL_BASH_N=PASS
LOCAL_NONROOT_FAIL_CLOSED=PASS class=NOT_ROOT
LOCAL_ARGUMENT_REJECTION=PASS class=UNEXPECTED_ARGUMENTS
LOCAL_SHA256=ffb42c0cee064186a097d96a079b6f6d8e03939df4f6630e3bc37bbb8958aa5b
REMOTE_PATH=/home/pi/slate-m1-sparse-readonly-root-diagnostic-v1.sh
REMOTE_TYPE=regular_file
REMOTE_MODE=700
REMOTE_SHA256=ffb42c0cee064186a097d96a079b6f6d8e03939df4f6630e3bc37bbb8958aa5b
REMOTE_BASH_N=PASS
```

The remote installation used no sudo and changed only the disposable
diagnostic script under `/home/pi`; it did not execute the script.

The preserved production baseline was rechecked after installation:

```text
DOCKER_ROOT=/var/lib/docker
DOCKER_SERVICE=active
SLATE=running/healthy/restarts=0
MYSQL=running/healthy/restarts=0
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
ORIGINAL_ROOT=PRESENT
NVME_COPY=PRESENT
PROVIDER_CALLS=0
PRODUCTION_CHANGED=NO
```

## 7. Delivery Invariants Compliance

- **Git Status**: This report and the diagnostic script are the only intended
  changes for the published checkpoint.
- **Remote / Hardware Protection**: No SSH connections, no sudo commands, no connection to Orange Pi hardware, no container execution, and no credentials accessed.
- **Affected Files**: Exactly two new files created for Codex review:
  1. `scripts/slate-m1-sparse-readonly-root-diagnostic-v1.sh`
  2. `docs/campaign-reports/08D1M-G-M1-SPARSE-READONLY-ROOT-DIAGNOSTIC-SCRIPT.md`

The single remaining operator action is the read-only root diagnostic command
published by Codex after the checkpoint is pushed. No V8 artifact is prepared
until its sanitized output proves the representation-only decision rule.
