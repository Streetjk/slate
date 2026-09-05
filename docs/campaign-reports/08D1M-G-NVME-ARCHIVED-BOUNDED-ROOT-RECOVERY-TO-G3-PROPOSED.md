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