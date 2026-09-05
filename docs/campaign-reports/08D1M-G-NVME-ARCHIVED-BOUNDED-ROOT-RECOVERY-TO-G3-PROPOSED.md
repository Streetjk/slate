# Campaign 8D1M-G — PROPOSED NVMe-Archived Bounded Root Recovery to G3

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Resolve the only remaining blocker after corrected G2 PASS: insufficient free space in the production Docker root to load the exact already-qualified Gemini 2.5 native-audio candidate for G3. Use the existing NVMe as a safety/archive surface and reclaim only individually proven disposable or historical Docker/root data. Preserve the current production image because it is also the pinned rollback image.

This proposal intentionally bundles bounded storage recovery directly into the already-authorized remaining C3/G3 production session so a successful cleanup is not another handoff.

## Accepted state

```text
CORRECTED_G2=C1_PASS
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
ARM64_IMAGE_SHA=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
CURRENT_PRODUCTION_IMAGE_ID=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
CURRENT_PRODUCTION_IMAGE_SIZE_BYTES=311579600
CANDIDATE_IMAGE_SIZE_BYTES=1130800794
PRODUCTION_ROOT_AVAILABLE_BYTES=891781120
CURRENT_PRODUCTION_ARCHIVE=/mnt/ssd-tmp/slate-tools/g3-rollback-staging-20260905/slate-note4-current-rollback-before-campaign8.tar
CURRENT_PRODUCTION_ARCHIVE_SHA256=882f1ea9b44de7f7b0fa5859a634363f4f6f610bcb7eff0ae30b6f6009b6b4
CURRENT_PRODUCTION_ARCHIVE_READABLE=YES
NEW_PROVIDER_SESSIONS_USED=1_OF_2
G3_PROVIDER_SESSION_REMAINING=1_CONDITIONAL
PRODUCTION_CHANGED=NO
PRODUCTION_HEALTH=PASS
```

Corrected G2 passed EN / EN / Japanese turns, reconnect, model events, inline audio, transcription, generation completion and turn completion with no private data, Search or tool invocation.

## Status

```text
DIRECTIVE_STATE=PROPOSED_NOT_AUTHORIZED
HOST_STORAGE_DELETION_AUTHORIZED=NO
DOCKER_IMAGE_DELETION_AUTHORIZED=NO
PRODUCTION_MUTATION_AUTHORIZED_BY_THIS_FILE=NO
G3_PROVIDER_SESSION_AUTHORIZED_BY_THIS_FILE=NO_NEW_AUTHORITY
```

This proposal creates no deletion or production authority until explicit human activation. The existing corrected-G2 activation already retains one conditional G3 provider session; this file does not increase provider budget.

## Proposed single activation envelope

```text
BOUNDED_ROOT_RECOVERY=YES
TARGET_ROOT_FREE_BYTES_BEFORE_CANDIDATE_LOAD=2500000000
USE_NVME_FOR_SAFETY_ARCHIVES=YES
CURRENT_PRODUCTION_IMAGE_DELETE=NO
PINNED_ROLLBACK_IMAGE_DELETE=NO
MYSQL_IMAGE_OR_DATA_DELETE=NO
DOCKER_VOLUME_DELETE=NO
SLATE_PERSISTENT_DATA_DELETE=NO
DELUGE_PATH_OR_DATA_CHANGE=NO
NVME_REPARTITION_OR_FORMAT=NO
DOCKER_DATA_ROOT_MOVE=NO
BROAD_DOCKER_SYSTEM_PRUNE_A=NO
BROAD_DOCKER_IMAGE_PRUNE_A=NO
PRODUCTION_DOCKER_DAEMON_RECONFIGURE=NO
CONTINUE_DIRECTLY_TO_EXISTING_G3_IF_STORAGE_GATE_PASSES=YES
G3_PROVIDER_SESSION_MAX=1_EXISTING_CONDITIONAL_SESSION_ONLY
AUTO_ROLLBACK_ON_G3_FAILURE=YES
PRIVATE_DATA_OR_MICROPHONE=NO
BILLING_OR_VERTEX_CHANGE=NO
CREDENTIAL_REPLACEMENT=NO
FIRMWARE_FLASH=NO
PR2_MERGE=NO
```

## S0 — read-only exact storage inventory

Before deleting anything, record:

- exact root free bytes;
- `docker system df -v`;
- every Docker image exact ID/tag/size and every container reference;
- Docker builder-cache usage;
- dangling image/layer usage;
- apt cache and journal usage;
- stale deployment transfer archives/temp files on the root filesystem;
- current production/rollback image identity;
- MySQL image/container identity;
- current production health and restart counts.

Classify each candidate as:

```text
REQUIRED_CURRENT_AND_ROLLBACK
REQUIRED_MYSQL
REQUIRED_OTHER_ACTIVE_ROLLBACK
UNREFERENCED_HISTORICAL_IMAGE_ARCHIVABLE
DANGLING_DISPOSABLE_LAYER
DISPOSABLE_BUILD_CACHE
DISPOSABLE_TRANSFER_TEMP
DISPOSABLE_PACKAGE_CACHE
DISPOSABLE_OLD_JOURNAL
UNKNOWN_DO_NOT_DELETE
```

Do not infer safety from age or name alone.

## S1 — bounded reclaim order

Reclaim only enough space to reach `>= 2,500,000,000` free bytes, then stop deleting.

Allowed order:

1. confirmed disposable failed-transfer/temp archives on root;
2. unused Docker builder cache only;
3. dangling/unreferenced image layers only;
4. `apt-get clean`;
5. conservative old journal vacuum only if materially useful, retaining at least 100–200 MB;
6. individually proven unreferenced historical Docker images.

For any historical Docker image in item 6:

- prove no running or stopped container references it;
- prove it is not the current/rollback image, MySQL image, exact G candidate, or sole artifact for another active rollback path;
- if it has plausible rollback/debug value, first `docker save` it to a uniquely named mode-600 archive under `/mnt/ssd-tmp/slate-tools/g3-storage-archives/`, compute SHA-256, verify archive readability, and record image ID/tag + archive hash;
- remove only that exact image ID/tag;
- re-check free bytes after each deletion;
- stop cleanup immediately once target headroom is reached.

Never use broad `docker system prune -a`, `docker image prune -a`, or `docker volume prune`.

If safe reclaimable items cannot reach the target, stop without production mutation and report the exact remaining deficit. Do not improvise Docker data-root migration or rollback deletion.

## S2 — exact candidate load and pre-G3 gate

Only after `ROOT_FREE_BYTES >= 2500000000`:

- verify the current/rollback image is still present;
- verify the already-created NVMe current-production archive and its recorded SHA-256;
- load only the exact candidate image;
- verify exact candidate digest `sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956`;
- verify Slate/MySQL/local/public health remains green before mutation;
- push/fetch-verify the checkpoint.

This checkpoint is not a handoff.

## S3 — continue directly to existing C3/G3

If S2 passes, immediately resume the already-authorized C3 production stage using the remaining single G3 provider session from the corrected-G2 activation:

1. deploy only the exact G2-qualified candidate using the reviewed production settings and existing protected credential read-only;
2. preserve MySQL/persistent data and rollback image;
3. verify local/public health before provider validation;
4. run the exact EN / EN / Japanese synthetic matrix once;
5. require model/native-audio output and turn completion for every turn.

On PASS: keep candidate deployed only while all health gates remain green, preserve rollback + NVMe archives until terminal dossier is durable, then stop at the separate physical NOTE4/private microphone/firmware/merge boundary.

On FAIL/AMBIGUOUS: immediately restore the pinned rollback image/config, verify Slate/MySQL/local/public health, remove candidate-only runtime/secret configuration if applicable, and do not retry the provider session.

## True stops

Stop only for:

- insufficient safely reclaimable root space after the bounded categories above;
- uncertainty whether an image/file is required;
- archive verification failure;
- current/rollback or candidate digest mismatch;
- production health degradation;
- credential/billing/Vertex/private-data/physical-device/firmware boundary;
- unresolved P0/P1/security/privacy/data-integrity issue;
- PR merge/release.

`REPORT-PUSH-INVARIANT.md` remains binding. Cleanup, exact-image load, checkpoint publication, and transition into the already-authorized G3 session are not handoffs once this proposal is activated.

## S0 activated inventory — PASS

The human `proceed` instruction activated this bounded recovery proposal
after remote checkpoint `c186b3c0cc7506486468f584078ef39af5a06d4e`.

```text
CAMPAIGN=8D1M-G
STATUS=S0_PASS_READY_FOR_BOUNDED_S1
ACTIVATION=EXPLICIT_HUMAN_PROCEED
ROOT_FREE_BYTES=891244544
NVME_FREE_BYTES=195590225920
BUILDER_CACHE=0
APT_ARCHIVE_BYTES=24576
JOURNAL_BYTES=0
ROOT_TRANSFER_ARCHIVES_OR_LARGE_TEMP=NONE_FOUND
CURRENT_SLATE_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
CURRENT_SLATE_IMAGE_REFERENCES=slate-note4_running_healthy
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
MYSQL_IMAGE=sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb
MYSQL_REFERENCES=slate-note4-mysql_running_healthy
DANGLING_LAYER=sha256:c47aea44b7fe4335a1aa50331bd5b0a17f68e6e4fd29c72a8fc23852256f8f4d
DANGLING_LAYER_REFERENCES=NONE
HISTORICAL_G16_IMAGE=sha256:d2af1d0dc48f40d4b53324e4a31531b26ce611c5851d33df93c23956b0209e48
HISTORICAL_G16_IMAGE_REFERENCES=NONE
HISTORICAL_PRIOR_PRODUCTION_IMAGE=sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d
HISTORICAL_PRIOR_PRODUCTION_IMAGE_REFERENCES=NONE
OLDER_CANDIDATE_F644=REFERENCED_BY_FOUR_STOPPED_VALIDATION_CONTAINERS_DO_NOT_DELETE_IN_S1
CURRENT_ROLLBACK_DELETE=NO
MYSQL_DELETE=NO
VOLUME_DELETE=NO
SLATE_DATA_DELETE=NO
DELUGE_CHANGE=NO
PRODUCTION_DOCKER_DAEMON_RECONFIGURE=NO
PRODUCTION_HEALTH=PASS
PRODUCTION_CHANGED=NO
NEW_PROVIDER_SESSIONS_USED=1_OF_2
G3_PROVIDER_SESSION=1_CONDITIONAL_REMAINING
NEXT_ACTION=ARCHIVE_AND_EXACTLY_RECLAIM_DANGLING_AND_UNREFERENCED_HISTORICAL_IMAGES
```

The two historical image candidates are not current, rollback, MySQL, exact
G candidate, or active-container artifacts. They will be individually saved
to mode-600 NVMe archives and removed only by exact image ID, with a free-space
check after each operation. Cleanup stops once the 2.5 GB target is reached.

## S1 bounded reclaim — PASS

Only individually classified disposable or historical Docker artifacts were
reclaimed. The current Slate/rollback image, MySQL image/data, persistent
mounts, Deluge paths, production Docker data-root, and unrelated retained
runtime images were not touched.

```text
CAMPAIGN=8D1M-G
STATUS=S1_PASS_ROOT_HEADROOM_REACHED
DANGLING_LAYER_REMOVED=sha256:c47aea44b7fe4335a1aa50331bd5b0a17f68e6e4fd29c72a8fc23852256f8f4d
G16_IMAGE_REMOVED=sha256:d2af1d0dc48f40d4b53324e4a31531b26ce611c5851d33df93c23956b0209e48
G16_ARCHIVE=/mnt/ssd-tmp/slate-tools/g3-storage-archives-20260905/g16-campaign-8d1kg-7a72448.tar
G16_ARCHIVE_SHA256=d7a2095d8fe1ce9814a24fa9252e454cf973b3519ab2619c5a7a9995407f0485
G16_ARCHIVE_READABLE=YES
PRIOR_PRODUCTION_IMAGE_REMOVED=sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d
PRIOR_PRODUCTION_ARCHIVE=/mnt/ssd-tmp/slate-tools/g3-storage-archives-20260905/prior-production-campaign8-voice-routing.tar
PRIOR_PRODUCTION_ARCHIVE_SHA256=328b628a005d45c531e2ac80c08b5411a1cc094e13a1e1f007b91e2f39da0981
PRIOR_PRODUCTION_ARCHIVE_READABLE=YES
F644_STOPPED_VALIDATION_CONTAINERS_REMOVED=4_EXACT
F644_IMAGE_REMOVED=sha256:f644fa6fa0bed63b3f248d33038e8595016fd453e78f6bb97565495a2268de5c
F644_TAGS_REMOVED=2_EXACT
F644_ARCHIVE=/mnt/ssd-tmp/slate-tools/g3-storage-archives-20260905/older-8d1m-validation-candidate-f644.tar
F644_ARCHIVE_SHA256=00485e81cce01779230c8eb80155d1b878caad6bf2dbb32d24a0b784b6575666
F644_ARCHIVE_READABLE=YES
ROOT_FREE_BYTES_AFTER_S1=3263156224
ROOT_FREE_TARGET_BYTES=2500000000
ROOT_FREE_TARGET=PASS
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
MYSQL_IMAGE=sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb
PRODUCTION_SLATE=HEALTHY_RESTARTS_0
PRODUCTION_MYSQL=HEALTHY_RESTARTS_0
PRODUCTION_HEALTH_HTTP=200
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
NEW_PROVIDER_SESSIONS_USED=1_OF_2
G3_PROVIDER_SESSION=1_CONDITIONAL_REMAINING
NEXT_ACTION=RUN_S2_EXACT_CANDIDATE_LOAD_AND_PRE_G3_GATE
```

Cleanup stopped at the target; no broad prune, volume deletion, root/data-root
migration, package-cache deletion, journal deletion, or production image
deletion was performed.

## S2 exact candidate load and pre-G3 gate — PASS

The first uninstrumented image stream returned without an observable tag and
left two exact load pipelines running after their launcher sessions ended.
Those recorded stream PIDs were terminated without touching the production
daemon. A single instrumented exact-image stream then completed; the loaded
transport image was verified against the local reviewed candidate by ARM64/OS
metadata and matching rootfs-layer and image-config fingerprints.

```text
CAMPAIGN=8D1M-G
STATUS=S2_PASS_READY_FOR_EXISTING_CONDITIONAL_G3
SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
AUTHORIZED_CANDIDATE_IMAGE_ID=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
PRODUCTION_TRANSPORT_IMAGE_ID=sha256:5ef126ff62ccf466c0795c1c76b4bdf0a7b9657184eab1f09b7435deeedbab6d
IMAGE_ARCH=arm64
IMAGE_OS=linux
IMAGE_ROOTFS_LAYER_FINGERPRINT=e96f58948c4487b17af31dac139c88fea7deb16c53efcdd841c1952e0ec43367
IMAGE_CONFIG_FINGERPRINT=784da5f9a9a4e23ce5c60be77de566138b95d02721b3467c172309b8ce178c55
IMAGE_FINGERPRINT_MATCH=YES
INITIAL_STREAM=INCOMPLETE_TAG_UNOBSERVED
INSTRUMENTED_STREAM=PASS
LOAD_STREAM_CLEANUP=PASS
PRODUCTION_ROOT_FREE_AFTER_LOAD_BYTES=1428484096
ROLLBACK_IMAGE_PRESENT=YES
CURRENT_PRODUCTION_IMAGE_UNCHANGED=YES
PRODUCTION_SLATE=HEALTHY_RESTARTS_0
PRODUCTION_MYSQL=HEALTHY_RESTARTS_0
PRODUCTION_HEALTH_HTTP=200
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
NEW_PROVIDER_SESSIONS_USED=1_OF_2
G3_PROVIDER_SESSION=1_CONDITIONAL_REMAINING
PROTECTED_SECRET_METADATA=PASS_NO_VALUE_READ
SECRET_DESTINATION=/run/secrets/gemini_api_key
NEXT_ACTION=CONTINUE_DIRECTLY_TO_NARROW_C3_PRODUCTION_SWAP_AND_G3
```

No credential was mounted or read during S2. The production image swap and
the one remaining G3 provider session remain the already-authorized next
stage; no additional provider budget was created.

## S3/C3 production deployment and G3 provider session — PASS

After S2 passed, the exact candidate was deployed through the existing Compose
project with only the approved Slate service override. MySQL was not recreated
or restarted. The protected credential was mounted read-only at the approved
destination; the durable harness ran detached inside the deployed Slate
container and its sanitized mode-600 result was recovered independently from
the NVMe result directory.

```text
CAMPAIGN=8D1M-G
STATUS=S3_G3_PRODUCTION_PASS_READY_FOR_PHYSICAL_HUMAN_BOUNDARY
SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
AUTHORIZED_CANDIDATE_IMAGE_ID=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
PRODUCTION_TRANSPORT_IMAGE_ID=sha256:5ef126ff62ccf466c0795c1c76b4bdf0a7b9657184eab1f09b7435deeedbab6d
ROLLBACK_IMAGE_ID=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
PRODUCTION_SWAP=PASS
PRODUCTION_CONTAINER=slate-note4
PRODUCTION_CONTAINER_RECREATED=YES_AUTHORIZED
PRODUCTION_NODE_BRIDGE=PRIVATE_STDIO
PUBLICLY_PUBLISHED_PORTS=3001_ONLY
PROTECTED_SECRET_DESTINATION=/run/secrets/gemini_api_key
PROTECTED_SECRET_READ_ONLY=YES
CREDENTIAL_VALUE_READ_OR_LOGGED=NO
G3_PROVIDER_SESSION=PASS
NEW_PROVIDER_SESSIONS_USED=2_OF_2
HISTORICAL_PROVIDER_CALLS=3_OF_3_UNCHANGED
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
NODE_CHILD_SPAWN=YES
BRIDGE_READY=YES
RECONNECT=PASS
EN_TEST_MODEL_EVENT=YES
EN_TEST_TURN_COMPLETE=YES
EN_SECOND_MODEL_EVENT=YES
EN_SECOND_TURN_COMPLETE=YES
JA_TEST_MODEL_EVENT=YES
JA_TEST_TURN_COMPLETE=YES
INLINE_AUDIO_OBSERVED=YES
OUTPUT_TRANSCRIPTION_OBSERVED=YES
GENERATION_COMPLETE_OBSERVED=YES
TOOL_INVOCATIONS=0
SEARCH_EXECUTED=NO
PRIVATE_DATA_SENT=NO
OUTLOOK_DATA_SENT=NO
CALENDAR_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
RAW_PROVIDER_PAYLOAD_RETAINED=NO
RESULT_DURABLY_PERSISTED=YES
RESULT_RECOVERED_AFTER_DETACHED_LAUNCH=YES
PRODUCTION_SLATE=HEALTHY_RESTARTS_0
PRODUCTION_MYSQL=HEALTHY_RESTARTS_0
PRODUCTION_HEALTH_HTTP_LOCAL=200
PRODUCTION_HEALTH_HTTP_PUBLIC=200
PRODUCTION_CHANGED=YES_AUTHORIZED
PRODUCTION_CONTAINER_RESTART_COUNT=0_AFTER_AUTHORIZED_RECREATE
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
```

The only retrieved application-log lines were sanitized unrelated route
conversion warnings; no Gemini provider failure was observed. The candidate
remains deployed while health is green, and the pinned rollback image plus
NVMe archives remain preserved. No further provider session is authorized in
this activation.

## Terminal software boundary

```text
READY_FOR_PHYSICAL_NOTE4_E2E=YES
READY_FOR_MICROPHONE_DATA=NO
READY_FOR_FIRMWARE_FLASH=NO
READY_FOR_PR_MERGE=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_DECIDE_PHYSICAL_NOTE4_PRIVATE_MICROPHONE_FIRMWARE_AND_MERGE_ACTIONS
```
