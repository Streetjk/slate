# Campaign 8D1M-G — M1 V8 manual root PASS

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Operator-reported V8 result

The operator executed the exact reviewed V8 root-step script and reported terminal PASS:

```text
M1_ROOT_STEP_V8 stage=preflight status=PASS
SRC_FILE_COUNT=22
SRC_FILE_PATH_SHA256=8412e44f669df378660b07487ebfd8aabc1f56c17b197e039dbc1bbc7915a77c
SRC_LOGICAL_BYTES=1942296
SRC_SYMLINK_COUNT=0
SRC_SYMLINK_TARGET_SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
SRC_HARDLINK_FILE_COUNT=0
SRC_HARDLINK_PATH_SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
SRC_SPARSE_FILE_COUNT=4
SRC_ALLOCATED_BLOCKS=2888
DST_FILE_COUNT=22
DST_FILE_PATH_SHA256=8412e44f669df378660b07487ebfd8aabc1f56c17b197e039dbc1bbc7915a77c
DST_LOGICAL_BYTES=1942296
DST_SYMLINK_COUNT=0
DST_SYMLINK_TARGET_SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
DST_HARDLINK_FILE_COUNT=0
DST_HARDLINK_PATH_SHA256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
DST_SPARSE_FILE_COUNT=5
DST_ALLOCATED_BLOCKS=2840
M1_ROOT_STEP_V8 stage=copy status=PASS
M1_ROOT_STEP_V8 stage=switch status=PASS data_root=/mnt/ssd-tmp/slate-tools/docker-data old_root_preserved=YES
M1_ROOT_STEP_V8 stage=complete status=PASS
```

## Immediate interpretation

- stopped-Docker structural/content verification passed;
- source and destination file count, path hash, logical bytes, symlink and hardlink evidence matched;
- sparse/allocation differences remained diagnostic-only as designed;
- Docker switched to `/mnt/ssd-tmp/slate-tools/docker-data`;
- original `/var/lib/docker` was preserved;
- the V8 script reached terminal PASS without reporting rollback.

## Required live verification before declaring M1 closed

Codex must ingest the observer result and independently verify live state:

```text
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
DOCKER_DAEMON=active
SLATE=running/healthy
MYSQL=running/healthy
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
EXPECTED_IMAGES=YES
EXPECTED_NETWORK=YES
ORIGINAL_ROOT_PRESENT=YES
NVME_ROOT_PRESENT=YES
DELUGE_UNCHANGED=YES
NVME_RESERVE_FLOOR=PASS
```

If these checks pass, publish `M1_STATUS=PASS_NVME_DOCKER_ROOT_ACTIVE` and continue automatically under the already-authorized long-run chain:

```text
M2 exact reviewed UX backend deployment
-> M3 exact app-only NOTE4 firmware flash
-> M4 bounded combined EN/JA physical UX retest
```

Checkpoint pushes are not stops. Keep PR #2 open/draft/unmerged. Do not delete either Docker tree. No new model, billing, credential, Search/tool, Calendar, Outlook or merge authority is granted by this report.
