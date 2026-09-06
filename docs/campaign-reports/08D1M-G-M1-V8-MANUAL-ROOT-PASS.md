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

## Codex M1 closure and M2 storage boundary

```text
M1_STATUS=PASS_NVME_DOCKER_ROOT_ACTIVE
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
DOCKER_DRIVER=overlayfs
DOCKER_DAEMON=active
SLATE=running/healthy/restarts=0
MYSQL=running/healthy/restarts=0
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
CURRENT_IMAGE_VISIBLE=YES
ROLLBACK_IMAGE_VISIBLE=YES
MYSQL_IMAGE_VISIBLE=YES
EXPECTED_NETWORK=YES
ORIGINAL_ROOT_PRESENT=YES
NVME_ROOT_PRESENT=YES
NVME_FREE_BYTES=190239313920
NVME_RESERVE_FLOOR=PASS
DELUGE_MUTATION=NOT_OBSERVED
PROVIDER_CALLS=0
PRODUCTION_CHANGED=NO
```

M2 then attempted to load the exact reviewed ARM64 candidate. The first
streaming load stalled without a registered candidate. The bounded compressed
recovery also failed to register the candidate. The durable NVMe-local tar was
independently transferred with matching SHA-256, but its separate load failed
before Slate recreation:

```text
M2_STATUS=HARD_STOP_CONTAINERD_ROOT_CAPACITY
M2_CANDIDATE_IMAGE=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
M2_TRANSFER_TAR=/mnt/ssd-tmp/slate-tools/m2-ux-candidate.tar
M2_TRANSFER_TAR_BYTES=1183010304
M2_TRANSFER_TAR_SHA256=cf47b8c4bb6aec65161d1c54e766bbf62f9a4ada1430fb5b86766231d7074865
M2_LOAD_RESULT=FAIL_NO_SPACE_IN_VAR_LIB_CONTAINERD
M2_CANDIDATE_REGISTERED=NO
M2_SLATE_RECREATED=NO
M2_PRODUCTION_ROLLBACK_REQUIRED=NO
PRODUCTION_ROOT_STILL=/mnt/ssd-tmp/slate-tools/docker-data
SLATE=running/healthy
MYSQL=running/healthy
LOCAL_PUBLIC_HEALTH=HTTP_200
```

The load error identifies `/var/lib/containerd` on the original root as a
separate capacity boundary. Root free space was subsequently measured at
`8065024` bytes, while NVMe free space remained `181218619392` bytes. No
Docker tree, daemon configuration, Deluge path, credential, provider, or
application container was modified by the failed M2 load. M3 and M4 remain
blocked until this storage boundary is separately authorized and resolved.
