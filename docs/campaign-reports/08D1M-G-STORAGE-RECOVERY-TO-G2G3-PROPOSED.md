# Campaign 8D1M-G — PROPOSED Bounded Docker-Root Recovery to Resume G2 -> G3

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Resolve the only current blocker: insufficient free space in the Orange Pi production Docker root to load the exact already-reviewed Gemini 2.5 native-audio ARM64 image. This proposal is designed to avoid another sequence of short handoffs: a later explicit human `proceed` may authorize the bounded cleanup below and, once the exact image is available, execution must continue directly into the already-authorized G2 -> conditional G3 chain without another stop.

## Current accepted state

```text
G_CONTINUATION_DIRECTIVE_STATE=AUTHORIZED_ACTIVE
G2_STATUS=BLOCKED_EXACT_IMAGE_CANNOT_BE_LOADED_SAFELY
G2_PROVIDER_CALL=NOT_STARTED
G_PROVIDER_SESSIONS_USED=2_OF_3
G_PROVIDER_SESSIONS_REMAINING=1
G3_PROVIDER_SESSION_MAX=1
G3_PRODUCTION_DEPLOYMENT=CONDITIONAL_AFTER_G2_PASS
SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
ARM64_IMAGE_SHA=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
GROK_4_6_REVIEW=PASS_P0_P1_P2_P3_ZERO
BASELINE_EQUIVALENCE=PASS
PRODUCTION_CHANGED=NO
PRODUCTION_HEALTH=PASS
REMOTE_ROOT_FREE_BYTES_APPROX=871000000
CANDIDATE_IMAGE_SIZE_BYTES_APPROX=1130704920
```

The failed transfer was cleaned only of disposable untagged partial layers. No credential was mounted/read and no provider call was consumed.

## Status

```text
DIRECTIVE_STATE=PROPOSED_NOT_AUTHORIZED
HOST_STORAGE_DELETION_AUTHORIZED=NO
DOCKER_IMAGE_DELETION_AUTHORIZED=NO
DOCKER_VOLUME_DELETION_AUTHORIZED=NO
PRODUCTION_MUTATION_AUTHORIZED_BY_THIS_FILE=NO
```

Until explicit human activation, perform read-only inventory only if needed; do not delete anything under this proposal.

## Recommended single activation envelope

A later explicit human `proceed` should authorize the following bounded recovery only:

```text
BOUNDED_DOCKER_ROOT_RECOVERY=YES
TARGET_ROOT_FREE_BYTES_BEFORE_IMAGE_LOAD=3000000000
BROAD_DOCKER_SYSTEM_PRUNE_A=NO
DOCKER_VOLUME_PRUNE=NO
CURRENT_PRODUCTION_IMAGE_DELETE=NO
ROLLBACK_IMAGE_DELETE=NO
RUNNING_CONTAINER_DELETE=NO
PERSISTENT_SLATE_DATA_DELETE=NO
PERSISTENT_MYSQL_DATA_DELETE=NO
PRODUCTION_ENV_DELETE_OR_EDIT=NO
TAILSCALE_OR_FUNNEL_CHANGE=NO
DELUGE_DATA_DELETE_OR_PATH_CHANGE=NO
NVME_REPARTITION_OR_FORMAT=NO
DOCKER_DATA_ROOT_MOVE=NO
FIRMWARE_CHANGE=NO
PR2_MERGE=NO
STOP_AFTER_SAFE_CLEANUP=NO_IF_EXACT_IMAGE_LOAD_SUCCEEDS
CONTINUE_G2_THEN_CONDITIONAL_G3=YES
```

## S0 — read-only storage and Docker inventory

Before deleting anything, record:

- exact root free bytes;
- `docker system df -v`;
- all images with exact IDs/tags/sizes and container references;
- builder-cache usage;
- dangling image/layer usage;
- Docker container log sizes;
- apt cache size;
- journal size;
- stale deployment-transfer archives under `/home/pi`, `/tmp`, `/var/tmp`;
- current production image ID/tag and rollback image ID/tag.

Classify each candidate as one of:

```text
REQUIRED_CURRENT_PRODUCTION
REQUIRED_ROLLBACK
REQUIRED_G_CANDIDATE
REFERENCED_OTHER_KEEP
UNREFERENCED_HISTORICAL_IMAGE
DANGLING_DISPOSABLE_LAYER
DISPOSABLE_BUILD_CACHE
DISPOSABLE_TRANSFER_ARCHIVE
DISPOSABLE_PACKAGE_CACHE
DISPOSABLE_OLD_JOURNAL
UNKNOWN_DO_NOT_DELETE
```

## S1 — bounded cleanup order after activation

Delete only enough to reach at least 3,000,000,000 free bytes, stopping cleanup immediately once the target is reached.

Allowed order:

1. confirmed disposable failed-transfer archives/temp files;
2. unused Docker builder cache only;
3. dangling/unreferenced image layers only;
4. `apt-get clean`;
5. conservative old-journal vacuum only if journal is materially large, retaining at least 100-200 MB;
6. exact historical Docker images only when all of the following are proven: no running/stopped container references them, they are not the current production image, not the preserved rollback image, not the exact G candidate, and they are not the sole artifact required for another active rollback path.

For item 6, remove individually by exact ID/tag and record each removal and reclaimed bytes. Do not use broad `docker image prune -a` or `docker system prune -a`.

Never delete unknown files/images merely to create space.

If the safe candidates cannot reach the 3 GB target, stop with:

```text
STORAGE_RECOVERY=INSUFFICIENT_SAFE_SPACE
HUMAN_LARGER_STORAGE_DECISION_REQUIRED=YES
```

and do not improvise a Docker data-root move, NVMe repartition, or persistent-data migration.

## S2 — exact image load and verification

Once root free bytes are >= 3,000,000,000:

- re-transfer/load only the exact reviewed ARM64 candidate;
- verify exact image digest equals `sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956`;
- verify current production and rollback images remain present;
- verify Slate/MySQL healthy, restart counts unchanged, local/public health green;
- do not mount/read the Gemini credential until the provider run actually begins;
- publish/fetch-verify the storage/image checkpoint.

Checkpoint publication is not a handoff.

## S3 — resume active G continuation without another human stop

If S2 passes, immediately continue under the already-active G continuation:

1. G2 uses the existing remaining G provider session for the EN/EN/JA full-adapter non-production matrix.
2. If G2 fails, do not deploy; exhaust zero-provider forensics and stop only at a true new boundary.
3. If G2 passes, continue directly to G3 without returning control.
4. G3 deploys only the exact G2-qualified image, verifies production health, and uses the already-authorized single additional production provider session.
5. G3 failure/ambiguity => immediate automatic rollback and health verification, no production retry.
6. G3 pass => keep candidate deployed only while all health gates remain green and publish terminal software dossier.

No new provider-session authority is created by this storage proposal; it only removes the infrastructure blocker to the already-authorized G2/G3 chain.

## True stop conditions

Stop only for:

- insufficient safe reclaimable space after the bounded cleanup categories above;
- any uncertainty that a candidate image/file is required for production or rollback;
- health degradation;
- source/image digest mismatch;
- credential/billing/Vertex/private-data/physical-device/firmware boundary;
- unresolved P0/P1/security/privacy/data-integrity issue;
- PR merge/release.

`REPORT-PUSH-INVARIANT.md` remains binding. Push often; do not treat successful cleanup, image load, G2 PASS, or pre-G3 checkpoints as handoffs.