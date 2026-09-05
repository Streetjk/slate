# Campaign 8D1M-G — PROPOSED NVMe Production Docker Root Migration -> UX Deploy -> Physical Retest

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Why this proposal exists

The reviewed voice UX correction is ready, but the production Orange Pi root filesystem is again too small to load the exact candidate while preserving current production, rollback, and MySQL artifacts. The latest bounded cleanup is exhausted without touching protected state.

Accepted live blocker:

```text
ROOT_FREE_BYTES=833589248
ROOT_FREE_TARGET_BYTES=2500000000
NVME_FREE_BYTES=190120091648
CURRENT_PRODUCTION_IMAGE_PRESENT=YES_PROTECTED
PINNED_ROLLBACK_IMAGE_PRESENT=YES_PROTECTED
MYSQL_IMAGE_PRESENT=YES_PROTECTED
CANDIDATE_IMAGE_PRESENT=NO
PRODUCTION_SLATE=HEALTHY
PRODUCTION_MYSQL=HEALTHY
PRODUCTION_CHANGED=NO
FIRMWARE_FLASHED=NO
GEMINI_PROVIDER_CALLS=0
```

Repeated root-capacity failures show that continuing to archive/delete individual images is not a durable production arrangement. The preferred next strategy is to move only Docker's production data-root to a dedicated Slate-owned NVMe location while leaving Deluge paths and the NVMe partition layout unchanged.

## Reviewed UX candidate remains accepted

```text
SOURCE_SHA=aae1c1fefce5e6c4ca4dbc2cd4d50f44ed4863d3
ARM64_IMAGE_ID=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
REVIEW_PROVIDER=GROK
REVIEW_MODEL=grok-4.6
REVIEW_VERDICT=PASS
P0=0
P1=0
P2=0
P3=0
FIRMWARE_APP_SHA256=edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb
FIRMWARE_FLASH_OFFSET=0x10000
```

No product source change is authorized by this storage proposal.

## Status

```text
DIRECTIVE_STATE=PROPOSED_NOT_AUTHORIZED
DOCKER_DATA_ROOT_MIGRATION_AUTHORIZED=NO
PRODUCTION_RESTART_AUTHORIZED=NO
UX_BACKEND_DEPLOY_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PRIVATE_MICROPHONE_RETEST_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

## Proposed single activation envelope

A later explicit human `proceed` authorizes one bounded long-running chain:

```text
LONGRUN_DEFAULT=YES
STOP_BETWEEN_SUCCESSFUL_STAGES=NO
PRIMARY_STORAGE_FIX=MIGRATE_PRODUCTION_DOCKER_DATA_ROOT_TO_DEDICATED_NVME_SLATE_PATH
NVME_REPARTITION=NO
DELUGE_PATH_CHANGE=NO
DELUGE_DATA_DELETE=NO
OLD_ROOT_DOCKER_DELETE_BEFORE_VALIDATION=NO
PRODUCTION_RESTART_FOR_MIGRATION=YES
EXACT_UX_BACKEND_DEPLOY=YES_AFTER_MIGRATION_PASS
EXACT_APP_ONLY_FIRMWARE_FLASH=YES_AFTER_BACKEND_PASS
BOUNDED_PHYSICAL_RETEST=YES
PRIVATE_MICROPHONE_TEST=YES_BOUNDED_EXISTING_FREE_TIER_ACCEPTANCE
MODEL_CHANGE=NO
BILLING_OR_VERTEX_CHANGE=NO
CREDENTIAL_REPLACEMENT=NO
CALENDAR_WRITES=NO
OUTLOOK_DATA=NO
SEARCH=OFF
TOOLS=NO_INVOCATION
RAW_AUDIO_RETENTION=NO
RAW_PROVIDER_PAYLOAD_RETENTION=NO
PR2_MERGE=NO
```

## M0 — read-only migration feasibility gate

Before stopping Docker:

1. live-reconcile PR/report/state and exact reviewed source/image/firmware pins;
2. verify Slate/MySQL/local/public health;
3. measure exact `/var/lib/docker` bytes and NVMe free bytes;
4. inspect NVMe filesystem type/options and prove it supports the production Docker storage driver requirements;
5. use a dedicated Slate path under `/mnt/ssd-tmp/slate-tools/`, for example `/mnt/ssd-tmp/slate-tools/docker-data`;
6. require the projected migrated Docker root plus candidate headroom to leave a conservative Deluge/NVMe reserve floor of at least 180 GB free; if the exact measured projection cannot satisfy that reserve, stop before mutation;
7. verify no path collision with Deluge or other NVMe consumers;
8. preserve the current Docker daemon configuration and a reversible rollback procedure;
9. verify existing NVMe rollback archives are readable and mode-restricted without exposing their contents.

Do not repartition, resize, format, or alter Deluge paths.

## M1 — reversible production Docker data-root migration

Only after M0 PASS:

1. publish a pre-mutation checkpoint;
2. stop the production Docker daemon cleanly, thereby stopping Slate/MySQL only for the bounded maintenance window;
3. copy `/var/lib/docker` to the dedicated NVMe Docker data-root preserving ownership, modes, hardlinks, xattrs, ACLs, symlinks, sparse files and numeric IDs as required by Docker;
4. do not delete or modify the original `/var/lib/docker` tree;
5. configure Docker to use only the new dedicated NVMe data-root;
6. start Docker and verify the expected images, networks, volumes and containers are visible;
7. start/verify Slate and MySQL, restart counts, local/public health, authenticated NOTE4 polling and existing public routing;
8. verify Docker reports the intended new data-root and storage driver;
9. verify Deluge state/path is unchanged;
10. verify the NVMe reserve floor still passes.

If any migration validation fails, stop Docker, restore the previous daemon configuration, restart using the untouched original `/var/lib/docker`, verify Slate/MySQL/local/public health, publish rollback evidence, and stop. Do not delete either copy during failure recovery.

The original root Docker tree remains the immediate infrastructure rollback until the UX deployment/retest terminal checkpoint passes. Reclaiming it is a later separate maintenance decision unless already mechanically necessary and explicitly safe after full validation.

## M2 — exact reviewed UX backend deployment

Only after M1 PASS:

- load/verify exact ARM64 image `sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4` into the NVMe-backed production Docker store;
- preserve the pre-UX production image as immediate application rollback;
- recreate only the Slate backend with existing production settings, protected read-only Gemini credential, Gemini 2.5 model and private Node stdio bridge;
- preserve MySQL/persistent data/public routing;
- require Slate/MySQL/local/public health PASS before continuing;
- automatic application rollback on failure.

## M3 — exact app-only NOTE4 firmware flash

Only after M2 PASS:

```text
APP_SHA256=edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb
OFFSET=0x10000
```

No full erase, partition-table write, NVS write, LittleFS write, pairing reset or server-address reset. Verify digest, normal boot and authenticated polling. Automatic app-only firmware rollback on regression.

## M4 — bounded physical UX retest

Continue directly after M3 PASS with one short physical Gemini session under the already acknowledged current Free Tier data-use policy:

```text
TURN_1=SHORT_ENGLISH_QUESTION
TURN_2=SHORT_JAPANESE_QUESTION
MAX_PROVIDER_SESSIONS=1_PHYSICAL_SESSION
```

Verify:

- one logical user turn -> one bubble;
- one logical assistant turn -> one bubble;
- no fragment-by-fragment e-ink refresh churn;
- audio streaming remains normal;
- no Tenclass/vendor fallback;
- sanitized latency markers only;
- Slate/MySQL/local/public health remain green.

Do not retain transcript text, raw audio, provider payloads or credentials in timing evidence. If latency remains materially poor, publish the measured stage boundaries and stop for a separate evidence-based latency optimization; do not change the Gemini model by guesswork.

## Terminal conditions

PASS:

```text
NVME_DOCKER_DATA_ROOT_MIGRATION=PASS
OLD_ROOT_DOCKER_COPY_PRESERVED=YES
DELUGE_UNCHANGED=YES
NVME_RESERVE_FLOOR=PASS
UX_BACKEND_DEPLOY=PASS
UX_FIRMWARE_FLASH=PASS
ONE_USER_TURN_ONE_BUBBLE=PASS
ONE_ASSISTANT_TURN_ONE_BUBBLE=PASS
PHYSICAL_LATENCY=IMPROVED|UNCHANGED|WORSE_WITH_EVIDENCE
PRODUCTION_HEALTH=PASS
DEVICE_HEALTH=PASS
PR2_MERGED=NO
```

FAIL at any layer:

- rollback the affected layer immediately;
- restore old Docker daemon/data-root configuration if migration is implicated;
- preserve both Docker-root copies until recovery is verified;
- verify Slate/MySQL/local/public health and NOTE4 polling;
- no blind provider/private-voice retry;
- publish exact sanitized evidence.

`REPORT-PUSH-INVARIANT.md` and `AUTONOMY-AND-HUMAN-GATE-POLICY.md` remain binding. Checkpoint pushes are not handoffs. This proposal authorizes nothing until explicit human activation.
