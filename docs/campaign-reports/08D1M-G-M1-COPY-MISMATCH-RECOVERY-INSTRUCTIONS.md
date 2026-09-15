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

## Recovery checkpoint — M1 copy differential and versioned root-step replacement

Date: 2026-09-05 (Australia/Perth)

The requested live preflight was completed before any root migration attempt:

```text
DOCKER_ROOT=/var/lib/docker
STORAGE_DRIVER=overlayfs
SLATE=running/healthy/restarts=0
MYSQL=running/healthy/restarts=0
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
ORIGINAL_SOURCE=/var/lib/docker PRESENT
NVME_DESTINATION=/mnt/ssd-tmp/slate-tools/docker-data PRESENT
DISPOSABLE_VALIDATION_CONTAINERS=0 AFTER_CLEANUP
PRODUCTION_CHANGED=NO
```

The exact old verification was confirmed as `du -sb "$SOURCE"` versus
`du -sb "$DEST"`, followed by an rsync dry-run. The old script is preserved
unchanged at `/home/pi/slate-m1-rootstep.sh`; it was not rerun.

The differential is classified as **B — invalid raw byte-count verification
across live overlay and ext4 filesystems**, with a resumable-copy refinement.
The source was live while inspected, so its `rootfs/overlayfs/*` entries
included mounted production container roots and transient disposable helper
roots. The destination contained the copied regular contents on ext4. Raw
directory `du` therefore included filesystem-specific allocation and live
mount state rather than being a payload-equality test.

Stable Docker metadata, excluding the runtime `rootfs/overlayfs` and container
metadata directories, matched:

```text
FILE_COUNT=8/8
FILE_PATH_SHA256=21052014bc77f6055a8cb75dd20839061db2dd45b075cf65ec36c31fe163401e
LOGICAL_BYTES=1540157/1540157
SYMLINK_COUNT=0/0
HARDLINK_FILE_COUNT=0/0
SPARSE_FILE_COUNT=4/5 (allocation-only difference)
```

The two production container root views also matched in logical content:

```text
SLATE_ROOTFS_FILE_COUNT=54578/54578
SLATE_ROOTFS_PATH_SHA256=4b6f6e4558fa0910325c4892c2e33256ae91f6a7586f54f3c5adc03aaa1500de
SLATE_ROOTFS_LOGICAL_BYTES=1794655656/1794655656
SLATE_ROOTFS_SYMLINK_COUNT=2189/2189
SLATE_ROOTFS_HARDLINK_FILE_COUNT=53350/53350

MYSQL_ROOTFS_FILE_COUNT=23180/23180
MYSQL_ROOTFS_PATH_SHA256=0a8aab6f321fc4b25d332f2f0f7bad52000f82bf818e20bfb876c31308cf37b2
MYSQL_ROOTFS_LOGICAL_BYTES=784765057/784765057
MYSQL_ROOTFS_SYMLINK_COUNT=1244/1244
MYSQL_ROOTFS_HARDLINK_FILE_COUNT=1263/1263
```

An exact checksum rsync dry-run of the Slate root returned no itemized
changes. A root-level dry-run with the live-only runtime roots excluded
returned exit 0 and only directory timestamp entries plus
`network/files/local-kv.db`; the latter has different source/destination
checksums because it is live Docker state and changed after the copy. The
stable rsync stderr was empty. The MySQL checksum dry-run was not allowed to
become an unbounded live-database operation; its file-set, logical-size,
symlink and hardlink comparisons were exact, and no MySQL copy-failure
classification was made from the interrupted checksum walk.

The source/destination sparse counts differed (`0/264` for Slate and `0/543`
for MySQL in the live overlay-versus-ext4 view), which is direct evidence that
raw allocation counts are not a valid cross-filesystem content gate. ACL and
xattr command-line tools are not installed on the host; the rsync command
itself supports `-A -X`, and representative mode/owner/size checks were
performed without reading credential material.

The bounded correction is a new fail-closed, resumable root step:

```text
LOCAL_SCRIPT=scripts/slate-m1-rootstep-v2-content-verify.sh
REMOTE_SCRIPT=/home/pi/slate-m1-rootstep-v2-content-verify.sh
OLD_SCRIPT_SHA256=f93d4c1f6c509a986a1742cdc81f4cd5c4795cca432d97e15d8f89c2441ebdf8
NEW_SCRIPT_SHA256=be8e05166ac38d04eeaf2059906218ea7e434de17f1114f2404b4530fe86bf74
LOCAL_BASH_N=PASS
REMOTE_MODE=700
REMOTE_BASH_N=PASS
```

The replacement retains the original source/destination, image, network,
reserve, rollback and no-credential invariants. It does not remove either
Docker tree. It stops Docker before reconciling the existing destination,
uses `rsync -aHAXS --numeric-ids --delete` as an in-place resumable
reconciliation (never a whole-tree deletion), then validates regular-file
count/path/logical-size, symlink target, hardlink and checksum-rsync equality.
Raw directory `du` is used only for the conservative free-space precheck, not
as a content-equality gate. Any post-stop or post-switch error restores the
original daemon configuration and verifies `/var/lib/docker` before returning
failure.

No provider call, firmware action, credential access, production deployment or
production restart was performed by Codex. The operator must run the new
versioned root command once; M1 is not yet proven PASS.
