# Campaign 8D1M-G — Exact Reviewed Image Identity Recovery

## Execution checkpoint — canonical identity equivalence PASS; deployment frontier active

The bounded exact-archive search found no file matching the historical reviewed
tar SHA in the authorized local or Orange Pi artifact locations:

```text
ORIGINAL_REVIEWED_TAR_FOUND=NO
ORIGINAL_REVIEWED_TAR_SHA256=844800c09b0fb04898d6de8edfa565845f94f27b636d7b439733ef22a0998fc4
```

Read-only Docker-save/load forensics established the portable identity mapping
without changing the reviewed source, image bytes, production services, or
firmware. The regenerated archive was transferred byte-for-byte to the unused
Orange Pi candidate tag. The local archive config digest was `5589...` and the
remote daemon loaded config/image digest was `63db...`, while the following
identity evidence matched exactly:

```text
IDENTITY_DRIFT_CLASS=LOCAL_CONTAINERD_STORE_ID_SEMANTICS_DIFFER_FROM_DOCKER_ARCHIVE_CONFIG_DIGEST
REGENERATED_ARCHIVE_SHA256=ff6331bfcfb9451eb6b59c1f5abce94ee42d273749cc7104126c2d4e8b5307c9
ARCHIVE_CONFIG_DIGEST=sha256:5589dfe2ce9c539bfd82334e2c169a7cff962d62a00daca4456ddec6e1576199
REMOTE_LOADED_CONFIG_DIGEST=sha256:63db9b2133af17d0a755a7149c0fb22e9cfa0fcaad19df31fbac2ebf344def17
PLATFORM=linux/arm64
ARCHIVE_CONFIG_CANONICAL_HASH=sha256:f15bea2d41cfc535edd42150fa3afbaedbb6910b3ff5166e7267e85a09455a4f
REMOTE_CONFIG_CANONICAL_HASH=sha256:f15bea2d41cfc535edd42150fa3afbaedbb6910b3ff5166e7267e85a09455a4f
RELEVANT_CONFIG_FIELD_SET_HASH=sha256:5b34d93f82c0d07546fa33a1efb06a224715c47788f56c48041246029420ba2d
ORDERED_ROOTFS_DIFF_ID_COUNT=26
ORDERED_ROOTFS_DIFF_ID_HASH=sha256:dbcdee9594159f482be677efb5ce5b0ae934855a6a17ebc4f7048f648b4702e1
LOCAL_IMAGE_HISTORY_COUNT=39
LOCAL_IMAGE_HISTORY_HASH=sha256:eb2111d437b77483f95500dfa025ac51f80510eb50f6632fdcee1edb47e7b7a6
IMAGE_REVIEWED_BACKEND_FILE_COUNT=6
IMAGE_REVIEWED_BACKEND_FILES_MATCH_SOURCE_COMMIT=YES
IMAGE_REVIEWED_BACKEND_FILE_HASH_MANIFEST_SHA256=sha256:768f39e520c16c7ca56e2deca49347dad7c43d8912176771858b8617512fca01
```

The six reviewed backend files extracted read-only from the exact local image
matched their corresponding files at source commit `e331...`. No credential,
environment value, private data, or provider payload was inspected or retained.

The first identity review correctly identified the missing source-provenance
binding (`REVISE`, P1=1). After adding the image-internal source-file hash
evidence, the same exact reviewer returned:

```text
REVIEWER=glm-5.3-flash
SOURCE_REVIEW_TARGET_SHA=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
IDENTITY_PROOF_TAR_SHA256=844800c09b0fb04898d6de8edfa565845f94f27b636d7b439733ef22a0998fc4
IDENTITY_EQUIVALENCE_VERDICT=PASS
P0=0
P1=0
P2=0
SECURITY_FINDINGS=NONE
FINDINGS=NONE
```

Accordingly, the remote `63db...` candidate is authorized only under this
exact canonical identity tuple; the daemon-local ID mismatch is not silently
waived. Backend deployment is now the sole ready action. The production image
and service/compose state remain unchanged, and firmware remains unflashed.

```text
CANONICAL_IDENTITY_PROOF_STATUS=PASS
ZAI_IDENTITY_EQUIVALENCE_STATUS=PASS
BACKEND_DEPLOYMENT_STATUS=READY_CANONICAL_IDENTITY_PROVEN
FIRMWARE_FLASH_STATUS=PENDING_BACKEND_DEPLOYMENT_PASS
M4_STATUS=PENDING_BACKEND_AND_FIRMWARE
PRODUCTION_CHANGED=NO_AT_CHECKPOINT
FIRMWARE_FLASHED=NO_AT_CHECKPOINT
GEMINI_PROVIDER_CALLS_THIS_ACTION=0
READY_NODE_COUNT=1
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=0
EXTERNALLY_BLOCKED_COUNT=0
HUMAN_ACTION_REQUIRED=NO
NEXT_ACTION=DEPLOY_PROVEN_REMOTE_CANDIDATE_THEN_VERIFY
```

## Execution checkpoint — exact canonical backend deployment PASS

The proven candidate was deployed by recreating Slate only with `--no-deps`;
MySQL was not recreated. The first launcher lost SSH during Compose progress,
so deployment was not accepted from launcher output. Independent read-only
verification then established the final state, including a second check after
a bounded stability interval:

```text
BACKEND_DEPLOYMENT_STATUS=PASS_CANONICAL_IDENTITY_CANDIDATE_ACTIVE
ACTIVE_BACKEND_IMAGE_ID=sha256:63db9b2133af17d0a755a7149c0fb22e9cfa0fcaad19df31fbac2ebf344def17
ACTIVE_BACKEND_IDENTITY_PROOF=PASS
SLATE_STATUS=running
SLATE_HEALTH=PASS
SLATE_RESTART_COUNT=0_STABLE
MYSQL_STATUS=running
MYSQL_HEALTH=PASS
MYSQL_IDENTITY_PRESERVED=YES
MYSQL_RESTART_COUNT=0_STABLE
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
SECRET_MOUNT_READ_ONLY=YES
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
PRODUCTION_MODEL_CHANGED=NO
CREDENTIALS_CHANGED=NO
BILLING_CHANGED=NO
PROVIDER_SESSION_CREATED_BY_VALIDATION=NO
BACKEND_DEPLOYMENT_ROLLBACK=NOT_REQUIRED
```

The exact app-only firmware remains the next authorized action. No full erase,
partition-table, bootloader, NVS, LittleFS, pairing, or identity write has
occurred.

```text
READY_NODE_COUNT=1
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=0
EXTERNALLY_BLOCKED_COUNT=0
HUMAN_ACTION_REQUIRED=NO
NEXT_ACTION=VERIFY_DEVICE_THEN_APP_ONLY_FLASH_EXACT_FROZEN_FIRMWARE
```

## Mission

Resume Campaign 8D1M-G from the live exact-ZAI-PASS checkpoint without repeating completed qualification and without treating the current backend image-transfer identity drift as a human-authority boundary before technical recovery is exhausted.

Operate in `FRONTIER_DRIVEN_LONGRUN`. Live GitHub state is authoritative. Keep PR #2 open, draft, and unmerged.

Before execution, fetch/reconcile PR #2 and read:

- `docs/campaign-reports/CAMPAIGN-STATE.md`
- `docs/campaign-reports/08D1M-G-ZAI-TIMEOUT-RECOVERY-AND-PHYSICAL-CONTINUATION.md`
- `docs/campaign-reports/08D1M-G-BOARD-RECONNECTED-ACTION.md`

Do not create documentation-only `CURRENT_HEAD` loops.

## Accepted live checkpoint

Accept unless fresh evidence disproves it:

```text
DEVICE_STATUS=CONNECTED_IDENTITY_VERIFIED
DEVICE_PORT=/dev/cu.usbmodem31201
DEVICE_TARGET=ESP32-S3_REV_V0.2
DEVICE_FLASH_SIZE=16MB
DEVICE_FLASH_ID=46_4018
SOURCE_BUNDLE_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
BACKEND_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
FIRMWARE_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
ZAI_REVIEW_MODEL=glm-5.3-flash
ZAI_REVIEW_TARGET_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
ZAI_REVIEW_STATUS=PASS_EXACT_SHA
ZAI_REVIEW_VERDICT=PASS
ZAI_REVIEW_P0=0
ZAI_REVIEW_P1=0
ZAI_REVIEW_P2=2
ZAI_REVIEW_P3=2
PRODUCTION_IMAGE=sha256:e2a116a21624043ccf3a2b1578de060637bb1e91206b2989eeef95bd98309871
PRODUCTION_HEALTH=PASS_LOCAL_200_PUBLIC_200
PRODUCTION_RESTARTS=SLATE_0_MYSQL_0
SLATE_RECREATED=NO
MYSQL_RECREATED=NO
FIRMWARE_FLASHED_THIS_ACTION=NO
PRODUCTION_SERVICE_OR_COMPOSE_MUTATION=NO
```

The ZAI PASS is valid and remains bound to the frozen exact source bundle. Do not re-review unchanged source merely because a transfer/daemon identity question arose.

The reviewer findings remain nonblocking under the explicit PASS. Do not make unrelated source changes merely to address P2/P3 observations during this recovery.

## Current technical discrepancy

The overnight qualification recorded:

```text
BACKEND_IMAGE_EXPECTED_ID=sha256:5589dfe2ce9c539bfd82334e2c169a7cff962d62a00daca4456ddec6e1576199
BACKEND_IMAGE_TAR_SHA256=844800c09b0fb04898d6de8edfa565845f94f27b636d7b439733ef22a0998fc4
```

The later transfer did not use that recorded archive. It used a locally regenerated Docker-save archive:

```text
IMAGE_TRANSFER_LOCAL_TAR_SHA256=ff6331bfcfb9451eb6b59c1f5abce94ee42d273749cc7104126c2d4e8b5307c9
IMAGE_TRANSFER_REMOTE_TAR_SHA256=ff6331bfcfb9451eb6b59c1f5abce94ee42d273749cc7104126c2d4e8b5307c9
IMAGE_REMOTE_LOADED_ID=sha256:63db9b2133af17d0a755a7149c0fb22e9cfa0fcaad19df31fbac2ebf344def17
IMAGE_LAYER_SET=IDENTICAL
```

This is not sufficient evidence of source-byte drift, but it is also not sufficient evidence of exact reviewed deploy identity.

Do not deploy the candidate yet.

## Correct the frontier classification

The current `WAITING_HUMAN` / `EXTERNALLY_BLOCKED` classification is premature while exact reviewed image recovery and read-only identity forensics remain technically executable.

Recompute the frontier as follows until the recovery steps below are exhausted:

```text
READONLY_READY_NODE_COUNT>=1
CURRENT_BLOCKED_NODE=NONE_OR_EXACT_IMAGE_IDENTITY_RECOVERY_IN_PROGRESS
HUMAN_ACTION_REQUIRED=NO
```

A human decision is needed only if deterministic technical recovery cannot establish an exact or reviewer-approved canonical identity mapping.

## R1 — locate the original reviewed backend archive

Search the existing authorized campaign workspace, build-artifact locations, Docker/BuildKit export directories, temporary transfer directories, and retained campaign artifacts for a file whose SHA256 is exactly:

```text
844800c09b0fb04898d6de8edfa565845f94f27b636d7b439733ef22a0998fc4
```

This is read-only discovery.

Do not delete, rewrite, recompress, retar, or normalize candidate archives during discovery.

Do not assume a filename is authoritative; only the exact SHA qualifies.

If found, record:

```text
ORIGINAL_REVIEWED_TAR_FOUND=YES
ORIGINAL_REVIEWED_TAR_PATH=<path>
ORIGINAL_REVIEWED_TAR_SHA256=844800c09b0fb04898d6de8edfa565845f94f27b636d7b439733ef22a0998fc4
```

Then proceed to R3.

If not found, proceed to R2.

## R2 — determine why local image ID and regenerated archive identity diverge

Perform bounded, read-only forensic comparison between:

1. the qualified local ARM64 image currently reported as:
   `sha256:5589dfe2ce9c539bfd82334e2c169a7cff962d62a00daca4456ddec6e1576199`;
2. the regenerated archive SHA `ff6331bfcfb9451eb6b59c1f5abce94ee42d273749cc7104126c2d4e8b5307c9`;
3. the Orange Pi loaded non-production candidate ID:
   `sha256:63db9b2133af17d0a755a7149c0fb22e9cfa0fcaad19df31fbac2ebf344def17`.

Inspect without exposing secrets:

- Docker-save `manifest.json`;
- config JSON filename and raw config digest;
- architecture and OS;
- ordered layer filenames/digests;
- `rootfs.diff_ids`;
- image history digests/structure;
- entrypoint/CMD/working-dir/labels/config structure using sanitized or hashed comparison where necessary;
- local Docker Desktop/containerd image-store metadata sufficient to determine whether `.Id` denotes config digest, manifest digest, or a daemon-specific representation;
- remote Docker daemon image metadata for the unused candidate;
- whether the regenerated archive contains config digest `63db...`, `5589...`, or another digest;
- whether the complete config JSON bytes are identical to the qualified local image config bytes when extracted canonically.

Do not print environment values, credentials, tokens, secrets, private data, or sensitive labels. Hash/compare them without displaying values if necessary.

Produce a deterministic classification:

```text
IDENTITY_DRIFT_CLASS=
  REGENERATED_ARCHIVE_NOT_IDENTICAL_TO_REVIEWED_ARCHIVE
  | LOCAL_CONTAINERD_STORE_ID_SEMANTICS_DIFFER_FROM_DOCKER_ARCHIVE_CONFIG_DIGEST
  | ACTUAL_CONFIG_BYTE_DRIFT
  | OTHER_PROVEN_CLASS
```

Do not use `UNKNOWN_TRANSIENT` or similar hand-waving classifications.

## R3 — preferred exact archive transfer

If the original recorded archive SHA `844800...` is found:

1. verify the SHA locally immediately before transfer;
2. transfer that exact file byte-for-byte to a unique non-production path on the Orange Pi;
3. verify the remote SHA is still exactly `844800...` before load;
4. load/import only under a unique non-production candidate tag/reference;
5. do not modify Compose/service definitions yet;
6. do not stop/recreate Slate or MySQL yet;
7. do not delete the previous unused candidate.

Then record:

```text
EXACT_TAR_TRANSFER_LOCAL_SHA256=
EXACT_TAR_TRANSFER_REMOTE_SHA256=
EXACT_TAR_REMOTE_LOAD_ID=
EXACT_TAR_REMOTE_CONFIG_DIGEST=
EXACT_TAR_REMOTE_LAYER_SET=
```

If the remote loaded identity now equals the expected reviewed identity `sha256:5589...`, exact recovery PASS is proven and proceed to R5.

If the exact original tar still loads to a daemon-reported image ID different from `5589...`, proceed to R4. Do not classify this automatically as source drift.

## R4 — canonical cross-daemon identity proof

If exact archive bytes are proven identical but daemon-local image IDs differ, establish whether the mismatch is purely representation semantics.

The canonical proof packet must bind, at minimum:

```text
SOURCE_BUNDLE_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
REVIEWED_BACKEND_TAR_SHA256=844800c09b0fb04898d6de8edfa565845f94f27b636d7b439733ef22a0998fc4
PLATFORM=linux/arm64
ARCHIVE_CONFIG_DIGEST=<digest>
REMOTE_LOADED_CONFIG_DIGEST=<digest>
ORDERED_LAYER_DIGEST_SET=<exact ordered digests>
ROOTFS_DIFF_ID_SET=<exact ordered digests>
RELEVANT_CONFIG_STRUCTURAL_HASH=<hash>
```

Require exact equality of the archive config digest and the remote loaded config digest, exact ordered layer identity, exact platform identity, and exact relevant configuration structure.

If this proof shows that the previously recorded `BACKEND_IMAGE_EXPECTED_ID=5589...` was a local Docker Desktop/containerd-store representation rather than the portable config digest preserved by Docker-save/load, do not silently weaken the deployment gate.

Instead ask the same mandatory reviewer `ZAI glm-5.3-flash` for a short independent **identity-equivalence review** of this sanitized proof packet. This is not a new source review and does not authorize source changes.

Require a result equivalent to:

```text
REVIEWER=glm-5.3-flash
SOURCE_REVIEW_TARGET_SHA=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
IDENTITY_PROOF_TAR_SHA256=844800c09b0fb04898d6de8edfa565845f94f27b636d7b439733ef22a0998fc4
IDENTITY_EQUIVALENCE_VERDICT=PASS|REVISE
P0=<n>
P1=<n>
SECURITY_FINDINGS=<...>
FINDINGS=<...>
```

If `PASS`, the portable canonical identity tuple may replace the daemon-local ID as the deployment proof for this exact reviewed artifact only.

If `REVISE`, address only the proof gap or artifact-recovery issue; do not alter production source bytes unless the finding demonstrates actual source/config byte drift.

If ZAI is temporarily unavailable, continue all remaining read-only identity forensics and evidence preparation. Do not deploy until equivalence PASS or exact expected identity is recovered.

## R5 — backend deployment after identity recovery PASS

Only after one of the following is true:

- exact remote loaded identity equals the expected reviewed identity; or
- the same ZAI reviewer explicitly PASSes the canonical exact-archive identity-equivalence proof,

continue automatically with the reviewed backend deployment.

Use the already-authorized fail-closed deployment pattern.

Before mutation reverify:

- production current image identity;
- rollback image available;
- MySQL identity;
- Slate/MySQL restart counts;
- exact candidate canonical identity tuple;
- secret mount read-only expectation;
- Docker/containerd NVMe topology healthy;
- NVMe reserve;
- Deluge unchanged.

Deploy only the proven reviewed candidate.

After deployment verify:

```text
ACTIVE_BACKEND_IDENTITY_PROOF=PASS
SLATE_HEALTH=PASS
SLATE_RESTART_COUNT=0_STABLE
MYSQL_HEALTH=PASS
MYSQL_IDENTITY_PRESERVED=YES
MYSQL_RESTART_COUNT=0_STABLE
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
SECRET_MOUNT_READ_ONLY=YES
VOICE_CONFIG_UNAUTH_CONTROL=EXPECTED_REJECT
VOICE_WS_ROUTE_CONTROL=PASS
NO_VENDOR_FALLBACK=PASS
PROVIDER_SESSION_CREATED_BY_VALIDATION=NO
PRODUCTION_GEMINI_MODEL_CHANGED=NO
CREDENTIALS_CHANGED=NO
BILLING_CHANGED=NO
ROLLBACK_IMAGE_PRESERVED=YES
```

Rollback automatically if any deployment safety gate fails.

Backend deployment PASS is not a stop.

## R6 — exact app-only NOTE4 flash

After reviewed backend deployment/requalification PASS, proceed automatically with the already-reviewed firmware:

```text
DEVICE_PORT=/dev/cu.usbmodem31201
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
FLASH_SCOPE=APP_ONLY
```

Immediately before write, reverify that the same device/port remains the historical qualified NOTE4.

Preserve:

- bootloader;
- partition table;
- NVS;
- pairing;
- LittleFS/user data;
- device identity.

No full erase.

After flash verify write/hash success, normal boot, Wi-Fi, pairing preservation, authenticated polling, no fatal markers, and presence of the sanitized observability markers.

Firmware flash PASS is not a stop.

## R7 — physical M4 boundary

After exact reviewed backend and firmware are active and stable, arm sanitized backend + serial observers and stop only at the genuine physical microphone/button boundary.

Request ONE combined physical session:

1. enter Voice AI;
2. one short non-sensitive English turn;
3. if service works, one short Japanese turn;
4. exit Voice AI;
5. if `VOICE_SERVICE_UNAVAILABLE` occurs, do not blindly retry.

Capture only sanitized structural results and latency stages. Never retain raw audio, transcript text, provider payloads, auth material, Calendar contents, or Outlook contents.

## No-repeat and no-destruction rules

Do not:

- rerun the completed source ZAI review;
- rebuild unchanged backend/firmware merely for ceremony;
- regenerate archives repeatedly instead of recovering/comparing exact artifacts;
- deploy the current `63db...` candidate merely because layers match;
- flash firmware before backend identity/deployment PASS;
- delete either unused candidate image during forensics;
- prune Docker/containerd;
- delete preserved rollback roots/images;
- repartition NVMe;
- modify Deluge;
- change production Gemini model;
- change credentials/billing;
- merge/release PR #2.

## Exit contract

Before any exit report:

```text
CURRENT_HEAD=
CURRENT_STAGE=
DEVICE_STATUS=
DEVICE_PORT=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
ORIGINAL_REVIEWED_TAR_FOUND=
ORIGINAL_REVIEWED_TAR_SHA256=
IDENTITY_DRIFT_CLASS=
EXACT_TAR_REMOTE_LOAD_ID=
CANONICAL_IDENTITY_PROOF_STATUS=
ZAI_IDENTITY_EQUIVALENCE_STATUS=
BACKEND_DEPLOYMENT_STATUS=
FIRMWARE_FLASH_STATUS=
M4_STATUS=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Do not exit while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`.

A legitimate human stop exists only if technical artifact recovery/identity proof is exhausted and continuation requires a new reviewer/provider/credential/billing authority, destructive action, or another genuine safety boundary.

Keep PR #2 OPEN / DRAFT / UNMERGED.
