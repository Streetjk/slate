# Campaign 8D1M-G — M1 Copy Mismatch Recovery Instructions

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Trigger

The operator executed the already-prepared fail-closed M1 root step manually:

```text
M1_ROOT_STEP stage=preflight status=PASS
M1_ROOT_STEP stage=copy status=FAIL class=COPY_BYTE_COUNT_MISMATCH
```

The command exited non-zero. No second root execution is authorized by this file itself; this file defines the safe recovery/diagnostic path under the already-activated M1 scope.

## Immediate safety rule

Do not blindly rerun `/home/pi/slate-m1-rootstep.sh`.

First verify, without root mutation where possible:

```text
DOCKER_DAEMON_STATE
DOCKER_REPORTED_DATA_ROOT
SLATE_CONTAINER_HEALTH
MYSQL_CONTAINER_HEALTH
LOCAL_HEALTHZ
PUBLIC_HEALTHZ
PRODUCTION_RESTART_COUNTS
ORIGINAL_VAR_LIB_DOCKER_PRESENT
NVME_COPY_PRESENT
```

Expected fail-closed recovery state is Docker using the original `/var/lib/docker`, with production healthy. If that is not true, stop and report the exact state before any further migration attempt.

## Zero-mutation copy differential

Preserve both the original `/var/lib/docker` and the failed/incomplete NVMe destination for diagnosis. Do not delete either copy.

Determine exactly how `COPY_BYTE_COUNT_MISMATCH` was computed in `/home/pi/slate-m1-rootstep.sh` and whether the check is mechanically valid across different filesystems/directories.

Important: do not treat raw directory `du` byte totals as sufficient proof of file-content inequality. Directory inode/entry accounting and sparse/hardlink allocation can differ between filesystems even when regular-file payloads are equivalent.

Use bounded read-only comparison appropriate to the source/destination, including at minimum:

- exact regular-file count;
- symlink count and targets;
- hardlink-preservation evidence where applicable;
- regular-file logical-size totals, excluding directory inode sizes;
- `rsync` dry-run/itemized comparison with the same preservation flags used for the copy;
- if needed, checksum only the remaining/differing regular files rather than hashing the entire Docker tree blindly;
- xattr/ACL preservation checks on representative/changed paths where the copy command claimed to preserve them;
- sparse-file semantics where applicable.

If the destination is genuinely incomplete, identify the exact bounded reason and prepare a corrected/resumable copy step. If the destination is content-equivalent and the mismatch came only from an invalid byte-count gate, correct only that verification gate.

## Script correction/requalification

Any corrected root-step script must retain all prior safety invariants:

```text
SOURCE=/var/lib/docker
DESTINATION=/mnt/ssd-tmp/slate-tools/docker-data
OLD_ROOT_DOCKER_DELETE=NO
NVME_REPARTITION=NO
NVME_FORMAT=NO
DELUGE_PATH_CHANGE=NO
DELUGE_DATA_CHANGE=NO
MYSQL_VOLUME_DELETE=NO
DOCKER_VOLUME_DELETE=NO
BROAD_DOCKER_PRUNE=NO
CREDENTIAL_READ_OR_COPY=NO
PROVIDER_CALL=NO
FIRMWARE_FLASH=NO
PR2_MERGE=NO
```

It must be fail-closed, preserve/restore the prior daemon configuration automatically on any post-stop/post-switch failure, and exit success only after Docker reports the intended NVMe data-root and Slate/MySQL/health checks pass.

Codex should statically validate the corrected script, install it at a new versioned path (do not silently overwrite the failed script without recording both hashes), record old/new SHA-256 values, publish/push/fetch-verify the checkpoint, and then provide the operator exactly one replacement `ssh -t ... sudo ...` command.

No sudo password may be requested, stored, printed, transmitted, or committed.

## Continuation

After the corrected manual root command succeeds, Codex must live-verify M1 and continue automatically through the already-activated M2 exact UX backend deployment -> M3 app-only firmware flash -> M4 bounded EN/JA physical retest, stopping only at a genuine new safety/authority boundary.

`REPORT-PUSH-INVARIANT.md` and `AUTONOMY-AND-HUMAN-GATE-POLICY.md` remain binding. PR #2 stays open/draft/unmerged.
