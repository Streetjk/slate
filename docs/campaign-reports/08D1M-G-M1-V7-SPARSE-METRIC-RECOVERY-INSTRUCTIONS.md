# Campaign 8D1M-G — M1 V7 Sparse-Metric Recovery Instructions

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Trigger

The operator executed the exact reviewed V7 root-step script and reported:

```text
M1_ROOT_STEP_V7 stage=preflight status=PASS
SRC_FILE_COUNT=22
SRC_FILE_PATH_SHA256=7b427240b693685fc62078aca7ecf35ef3694c7884df1fbb42ab15637ba4429f
SRC_LOGICAL_BYTES=1835883
SRC_SYMLINK_COUNT=0
SRC_SYMLINK_TARGET_SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
SRC_HARDLINK_FILE_COUNT=0
SRC_HARDLINK_PATH_SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
SRC_SPARSE_FILE_COUNT=4
DST_FILE_COUNT=22
DST_FILE_PATH_SHA256=7b427240b693685fc62078aca7ecf35ef3694c7884df1fbb42ab15637ba4429f
DST_LOGICAL_BYTES=1835883
DST_SYMLINK_COUNT=0
DST_SYMLINK_TARGET_SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
DST_HARDLINK_FILE_COUNT=0
DST_HARDLINK_PATH_SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
DST_SPARSE_FILE_COUNT=5
M1_ROOT_STEP_V7 rollback=PASS data_root=/var/lib/docker health=PASS
M1_ROOT_STEP_V7 stage=copy status=FAIL class=COPY_SPARSE_FILE_COUNT_MISMATCH
```

Do not rerun V7.

The V7 failure was fail-closed and the script reported a healthy rollback to `/var/lib/docker`. This report must still independently verify the live post-rollback state before any new root step.

## Exact control-flow issue to prove

V7 currently computes sparse-file counts with:

```text
stat -c '%s %b'
logical_size > allocated_blocks*512
```

and requires source and destination sparse-file counts to be numerically identical before it reaches the stronger checksum/itemized rsync dry-run verification.

`%b` is allocated-block accounting, not file-content identity. A faithful copy can have different block allocation / hole representation across filesystems or copy reconstruction while preserving the same logical contents, paths and metadata relevant to Docker. Therefore sparse-count equality must not be treated as an integrity gate unless evidence proves Docker requires identical physical allocation representation.

The observed V7 output already shows exact agreement for:

```text
FILE_COUNT
FILE_PATH_SHA256
LOGICAL_BYTES
SYMLINK_COUNT
SYMLINK_TARGET_SHA256
HARDLINK_FILE_COUNT
HARDLINK_PATH_SHA256
```

Only the allocation-derived sparse-file count differs 4 vs 5.

Codex must verify this interpretation against the exact V7 source and bounded filesystem evidence; do not merely assume it.

## Required zero-mutation recovery verification

Before preparing V8, verify:

```text
DOCKER_ROOT=/var/lib/docker
DOCKER_DAEMON=active
SLATE=running/healthy
MYSQL=running/healthy
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
ORIGINAL_ROOT_PRESENT=YES
NVME_COPY_PRESENT=YES
EXPECTED_IMAGES=YES
EXPECTED_NETWORK=YES
PROVIDER_CALLS=0
FIRMWARE_FLASHED=NO
```

Also inspect the source/destination sparse classification using metadata only. Identify which relative paths differ in sparse classification and compare only non-content metadata needed to explain the allocation difference: logical size, allocated blocks, filesystem/device identity and extent/allocation evidence where safely available. Do not print Docker payload contents, secrets or private application data.

If any evidence indicates a real content, path, ownership, mode, ACL, xattr, hardlink or symlink mismatch, stop and publish the exact sanitized mismatch instead of weakening the gate.

## V8 bounded correction if sparse-count equality is proven invalid

Create a new versioned script, e.g.:

```text
scripts/slate-m1-rootstep-v8-content-authoritative-verify.sh
/home/pi/slate-m1-rootstep-v8-content-authoritative-verify.sh
```

Preserve V7. Do not overwrite V7 in place.

V8 requirements:

1. preserve the V7 preflight, daemon-config backup, reserve, copy, restart-stability, signal handling, rollback, no-delete and health gates;
2. preserve sparse-file metrics as diagnostic evidence;
3. do **not** fail solely because source and destination sparse-file counts differ if the allocation difference is proven representation-only;
4. make the existing post-copy `rsync -aHAXS --numeric-ids --checksum --delete --dry-run --omit-dir-times --itemize-changes` empty-result gate authoritative for regular-file content and transferable metadata equivalence;
5. preserve exact file-count, logical-size, path, symlink and hardlink gates;
6. if appropriate after evidence/review, add a bounded nested-mount / one-filesystem guard so unexpected mounted content cannot be traversed during the stopped-Docker copy; do not make this change blindly;
7. retain full automatic healthy rollback to `/var/lib/docker` on any post-mutation failure;
8. never delete either Docker tree;
9. never expose credential values or application payload content;
10. keep Deluge paths/data untouched.

Do not weaken the checksum/itemized dry-run gate.

## Routing and review

Current routing remains:

```text
CONTROLLER=CODEX
WRITER=GEMINI_3_8_FLASH
INDEPENDENT_REVIEWER=GROK_4_6
```

Use Gemini 3.8 Flash for the bounded V8 implementation if available through the existing authorized orchestration transport. Codex remains sole repository/production integrator and deterministic validator.

Before installing V8 on the Orange Pi, Grok 4.6 must review the exact V8 script, with explicit attention to:

- whether sparse-count equality is correctly removed only as a physical-allocation gate;
- whether checksum/itemized rsync verification remains fail-closed and authoritative;
- whether ACL/xattr/mode/owner/hardlink/symlink semantics remain protected;
- signal/interruption rollback behavior;
- daemon-config rollback correctness;
- startup and restart-growth handling;
- unexpected mount traversal;
- no-delete guarantees.

Bounded writer -> validate -> Grok review -> bounded repair -> re-review is non-stopping. Do not return to the human for routine P2/P3 corrections.

## Long-run continuation

Once one exact V8 artifact passes review:

1. install it under `/home/pi/` without exposing secrets;
2. verify remote SHA-256, regular-file type, mode 700 and `bash -n`;
3. arm the sanitized observer;
4. push the checkpoint;
5. give the operator exactly one `ssh -t ... sudo ...` command.

If the manual V8 root step passes, verify M1 from the live NVMe Docker root and continue automatically under the already-authorized long-run chain through:

```text
M2 exact reviewed UX backend deployment
-> M3 exact app-only NOTE4 firmware flash
-> M4 bounded combined EN/JA physical UX retest
```

Do not stop at successful checkpoints.

If V8 fails after mutation, require healthy rollback evidence and stop only if the failure requires a genuinely new root/operator action or safety authority.

No model change, billing/Vertex change, credential replacement, Calendar write, Outlook payload use, Search/tool invocation, destructive Docker-tree cleanup or PR #2 merge is authorized by this recovery.

`REPORT-PUSH-INVARIANT.md`, the reduced-stop autonomy policy, the current Gemini 3.8 Flash writer override and the existing M1->M4 activation remain binding.