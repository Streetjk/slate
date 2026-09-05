# Campaign 8D1M-G — M1 sparse diagnostic result and V8 continuation

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Operator diagnostic result

The operator executed the installed read-only root diagnostic:

```text
/home/pi/slate-m1-sparse-readonly-root-diagnostic-v1.sh
SHA256=ffb42c0cee064186a097d96a079b6f6d8e03939df4f6630e3bc37bbb8958aa5b
```

The diagnostic completed read-only and reported:

```text
DIAGNOSTIC_MODE=READ_ONLY
DOCKER_SERVICE_ACTIVE=active
DOCKER_ROOT=/var/lib/docker
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
FILESYSTEM_SEPARATION_VERIFIED=YES

SRC_FILE_COUNT=22
DST_FILE_COUNT=22
FILE_COUNT_EQUAL=YES
SRC_PATH_SET_SHA256=c70a3051e5d3bfbf498bec9175404d7660e8dc433c02d732d3c6386d5ac8a839
DST_PATH_SET_SHA256=c70a3051e5d3bfbf498bec9175404d7660e8dc433c02d732d3c6386d5ac8a839
PATH_SET_EQUAL=YES
SRC_LOGICAL_BYTES=1869623
DST_LOGICAL_BYTES=1835883
LOGICAL_BYTES_EQUAL=NO
SRC_TRANSFERABLE_METADATA_SHA256=2b68bfd99d59120a87e0ddb9a5ca2b51425dadea6ba29fd7a08985e95dc9d86c
DST_TRANSFERABLE_METADATA_SHA256=a19a6a8b584eeb34e7ec56bd3fb1c15892796aab6625bd05cc018a6155b2d831
TRANSFERABLE_METADATA_EQUAL=NO
LOGICAL_SIZE_MISMATCH_COUNT=6
MODE_MISMATCH_COUNT=0
UID_MISMATCH_COUNT=0
GID_MISMATCH_COUNT=0
LINK_COUNT_MISMATCH_COUNT=0
ALLOCATED_BLOCKS_DIFF_COUNT=6
SRC_SPARSE_FILE_COUNT=4
DST_SPARSE_FILE_COUNT=5
SPARSE_DIFFERENCE_COUNT=1
RSYNC_DRYRUN_RC=0
RSYNC_DRYRUN_STDOUT_BYTES=21070890
RSYNC_DRYRUN_STDERR_BYTES=0
RSYNC_DRYRUN_RESULT=NONEMPTY_OR_ERROR
VERDICT=FAIL_CONTENT_OR_METADATA_MISMATCH
M1_SPARSE_DIAG stage=complete status=PASS
```

## Adjudication

The diagnostic did **not** mutate either Docker tree, stop/restart Docker, change daemon configuration, invoke Gemini, flash firmware, or touch Deluge. Production remained healthy on the original root.

Its `FAIL_CONTENT_OR_METADATA_MISMATCH` verdict is **not attributable to the V7 copy** because the diagnostic compared the preserved NVMe snapshot against the *live* original Docker root after Docker had resumed. Six regular files had already changed logical size in the live source. A non-empty checksum rsync dry-run is therefore expected and cannot be used as a post-hoc verdict on the frozen V7 copy.

The stronger evidence at the actual V7 copy point remains the stopped-Docker post-copy output:

```text
SRC_FILE_COUNT=22
DST_FILE_COUNT=22
SRC_FILE_PATH_SHA256=7b427240b693685fc62078aca7ecf35ef3694c7884df1fbb42ab15637ba4429f
DST_FILE_PATH_SHA256=7b427240b693685fc62078aca7ecf35ef3694c7884df1fbb42ab15637ba4429f
SRC_LOGICAL_BYTES=1835883
DST_LOGICAL_BYTES=1835883
SRC_SYMLINK_COUNT=0
DST_SYMLINK_COUNT=0
SRC_HARDLINK_FILE_COUNT=0
DST_HARDLINK_FILE_COUNT=0
SRC_SPARSE_FILE_COUNT=4
DST_SPARSE_FILE_COUNT=5
```

The only failed V7 equality gate was physical allocation-derived sparse-file count. V7 calculated sparse status from `stat %b` allocated blocks. This is not a logical-content identity criterion and need not be identical after `rsync -S` recreates files on a different ext4 filesystem. The diagnostic also confirms the source and destination are distinct ext4 filesystems on `/dev/mmcblk1p1` and `/dev/nvme0n1p1`.

Therefore no further live-source read-only diagnostic is required before preparing V8. The correct authoritative proof must occur **inside the stopped-Docker V8 copy window**, immediately after the real copy and before switching Docker roots.

## V8 implementation directive

Proceed continuously with a new versioned V8 artifact. Preserve V7 unchanged.

Required V8 behavior:

1. Preserve V7 preflight, path separation, ext4/rw checks, reserve floor, daemon-config backup/restore, no-delete guarantees, startup/restart-stability checks, signal handling, rollback health verification and Deluge isolation.
2. Preserve the real stopped-Docker copy using `rsync -aHAXS --numeric-ids --delete` (or the exact reviewed equivalent).
3. Preserve file-count, logical-size, relative-path, symlink and hardlink equality gates while Docker is stopped.
4. Preserve sparse-file count and allocated-block metrics as **diagnostic-only** evidence. A sparse-count mismatch must not by itself fail the copy.
5. Make the stopped-Docker post-copy command
   `rsync -aHAXS --numeric-ids --checksum --delete --dry-run --omit-dir-times --itemize-changes`
   the authoritative content/transferable-metadata equivalence gate. It must return success with an empty sanitized change set before any Docker data-root switch.
6. If that authoritative stopped-Docker dry-run is non-empty, fail closed and restore healthy production on `/var/lib/docker`; do not switch roots.
7. Keep ownership/mode/ACL/xattr/hardlink/symlink protections fail-closed.
8. Add a bounded nested-mount / one-filesystem guard if it can be done without weakening the intended Docker-root copy semantics; otherwise document and retain current `find -xdev` verification behavior.
9. Never delete either Docker tree.
10. Never read/print credential values, database/application payload contents, transcript/audio contents, or private files.

## Routing and review

```text
CONTROLLER=CODEX
WRITER=GEMINI_3_8_FLASH
INDEPENDENT_REVIEWER=GROK_4_6
```

Use Gemini 3.8 Flash for the bounded V8 implementation. Codex remains sole repo/production integrator and deterministic validator. Grok 4.6 must review the exact V8 artifact before installation, with special attention to removal of only the invalid sparse-allocation equality gate and preservation of the stronger checksum/itemized verification and rollback semantics.

Bounded writer -> validate -> Grok review -> bounded repair -> re-review is non-stopping.

## Handoff and long-run continuation

After one exact V8 artifact passes review:

1. install it under `/home/pi/`;
2. verify remote SHA-256, regular-file type, mode 700 and `bash -n`;
3. arm sanitized observer;
4. push/fetch-verify the checkpoint;
5. give the operator exactly one new `ssh -t ... sudo ...` command.

If V8 PASS proves the NVMe Docker root healthy, publish M1 PASS and continue automatically through the already-authorized chain:

```text
M2 exact reviewed UX backend deployment
-> M3 exact app-only NOTE4 firmware flash
-> M4 bounded combined EN/JA physical UX retest
```

Do not stop at successful checkpoints. Stop only for a genuinely new authority/safety boundary or a fail-closed result requiring another root/operator action.

No model change, billing/Vertex change, credential replacement, Search/tool invocation, Calendar write, Outlook payload use, destructive Docker-tree cleanup, Deluge change or PR #2 merge is authorized by this directive.
