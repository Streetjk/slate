# Campaign 8D1M-G — Post-Overnight Resume and Boundary Directive

## Mission

Resume Campaign 8D1M-G from the completed overnight offline qualification checkpoint without repeating exhausted work. Operate in `FRONTIER_DRIVEN_LONGRUN`, keep PR #2 open/draft/unmerged, preserve all rollback roots/assets, and continue automatically whenever a genuine READY or READONLY_READY node exists.

Live GitHub state is authoritative. Before execution, fetch origin and reconcile PR #2, `CAMPAIGN-STATE.md`, `08D1M-G-OVERNIGHT-OFFLINE-CAMPAIGN.md`, the board-window directive, and the latest reports/commits. Do not create a self-referential documentation loop merely to refresh `CURRENT_HEAD`.

## Accepted overnight checkpoint

Accept the completed nonphysical qualification unless live evidence disproves it.

```text
M4_STATUS=FAIL_VOICE_SERVICE_UNAVAILABLE
DEVICE_STATUS=OFFLINE_OR_NOT_ENUMERATED
BACKEND_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
SOURCE_BUNDLE_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
BACKEND_TYPECHECK=PASS
BACKEND_LINT=PASS
BACKEND_FORMAT=PASS
BACKEND_TARGETED_TESTS=13_PASS_0_FAIL
BACKEND_ASSISTANT_SUITE=83_PASS_5_SKIP_1_EXISTING_BUN_NEST_HARNESS_ERROR_UNRELATED
FIRMWARE_NO_VENDOR_TEST=PASS
SECRET_SCAN=PASS
NONPHYSICAL_REQUALIFICATION_STATUS=PASS_LOCAL_AND_ARM64_PROVIDER_DISABLED
GEMINI_PROVIDER_CALLS_THIS_STAGE=0
```

The existing Bun/Nest decorator harness error remains an unrelated baseline issue. Do not spend campaign time rewriting unrelated framework code unless new evidence proves the changed voice files caused it.

## Frozen firmware artifact

The pinned official ESP-IDF 5.5.2 build path succeeded offline using the recorded official image and no provider access.

```text
FIRMWARE_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
ESP_IDF_VERSION=5.5.2
FIRMWARE_BUILD_STATUS=PASS
FIRMWARE_APP_PATH=firmware/build-overnight/slate.bin
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
FIRMWARE_APP_BYTES=2505008
FIRMWARE_BOOTLOADER_SHA256=c94bd23d5fdfab16eefc505efd714d800bbf4399d5a52e19515a6d362addb5c3
FIRMWARE_PARTITION_TABLE_SHA256=6f0657eb6b8007c0dbfed6f64cf7a0d59f8ee1752af898e2f66dd218846b1835
FIRMWARE_NETWORK=NONE
FIRMWARE_FLASHED=NO
```

Do not rebuild or change the firmware merely for ceremony. Any production-byte change invalidates this frozen identity and requires deterministic requalification and a new exact review target.

## Frozen backend artifact

Accept the completed ARM64 image build unless live artifact verification fails.

```text
BACKEND_IMAGE_TAG=slate:overnight-observability-e0b89e0a
BACKEND_IMAGE_ID=sha256:5589dfe2ce9c539bfd82334e2c169a7cff962d62a00daca4456ddec6e1576199
BACKEND_IMAGE_PLATFORM=linux/arm64
BACKEND_IMAGE_SIZE_BYTES=1130650409
BACKEND_IMAGE_TAR_SHA256=844800c09b0fb04898d6de8edfa565845f94f27b636d7b439733ef22a0998fc4
BACKEND_CONFIG_IDENTITY=fa200c812d62672db94715115eb50b5fa04ad87d47fa53a6e5d3b8723148fbf3
BACKEND_IMAGE_SECRET_SCAN=PASS
```

Preserve the current working production and rollback images. Do not deploy the changed backend artifact before exact ZAI review PASS.

## Current production/platform baseline

Accept the final overnight read-only production verification unless a fresh bounded health check disproves it.

```text
PRODUCTION_BACKEND_STATUS=UNCHANGED_HEALTHY
SLATE_HEALTH=PASS_RESTART_0
MYSQL_HEALTH=PASS_RESTART_0
NVME_CONTAINERD_STATUS=PASS
NVME_DOCKER_STATUS=PASS
DELUGE_STATUS=ACTIVE_UNCHANGED
NVME_RESERVE_BYTES=173189738496
PRODUCTION_CHANGED=NO
```

No NVMe repartition, no Deluge mutation, no rollback-root deletion, no broad Docker/containerd prune.

## Required role routing

```text
CONTROLLER_INTEGRATOR=Codex
IMPLEMENTATION_WRITER=AGY gemini-3.8-flash
INDEPENDENT_REVIEWER=ZAI glm-5.3-flash
```

ZAI `glm-5.3-flash` remains mandatory. Do not silently substitute Gemini, Grok, Claude, OpenRouter, another provider, or another reviewer. Do not waive review.

## Primary current blocker — exact ZAI review resource

The exact existing reviewer route reached ZAI and returned insufficient balance/resource package.

```text
ZAI_REVIEW_PROFILE=zai-glm53-reviewer
ZAI_REVIEW_MODEL=glm-5.3-flash
ZAI_REVIEW_TARGET_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
ZAI_REVIEW_STATUS=EXTERNALLY_BLOCKED_INSUFFICIENT_BALANCE_OR_RESOURCE_PACKAGE
ZAI_REVIEW_VERDICT=NOT_OBTAINED
ZAI_REVIEW_RESOURCE_DISCOVERY=NO_NEW_AUTHORIZED_PROFILE_OR_RESOURCE
```

Do not hammer the blocked endpoint. Do not create or replace credentials. Do not change billing or purchase resources automatically.

If the same already-authorized ZAI resource becomes available, submit the exact already-prepared frozen review packet once. The final verdict must bind to the exact target SHA and include:

```text
REVIEWER=glm-5.3-flash
REVIEW_TARGET_SHA=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
VERDICT=PASS|REVISE
P0=<n>
P1=<n>
P2=<n>
P3=<n>
SECURITY_FINDINGS=<NONE or concise findings>
FINDINGS=<NONE or concise findings>
```

A malformed/partial result is not PASS.

### If ZAI returns REVISE

Automatically continue:

```text
ZAI findings
-> Codex adjudication
-> AGY gemini-3.8-flash minimal repair
-> Codex deterministic validation
-> rebuild every impacted backend/firmware artifact
-> secret/privacy scan
-> freeze new exact source/artifact identities
-> fresh ZAI glm-5.3-flash exact review
```

Reviewer REVISE is not a human stop.

### If ZAI remains resource-blocked

Persist the external block and do not repeat already-completed qualification. Recompute the frontier. If `READY_NODE_COUNT=0` and `READONLY_READY_NODE_COUNT=0`, a stop is legitimate until the same reviewer resource or another genuine authorized frontier becomes available.

## Device-offline semantics

The NOTE4 board being offline is `WAITING_DEVICE`, not a reason to classify the entire campaign as waiting on the human.

If NOTE4 reconnects before exact review PASS, Codex may perform only non-mutating identity/enumeration checks needed to prove it is the same qualified ESP32-S3 device. Do not flash changed firmware and do not consume another microphone/provider session before exact review PASS.

If NOTE4 remains offline, do not ask the operator to reconnect merely for diagnostics that are already exhausted.

## Sequence after exact ZAI PASS

When a valid exact ZAI PASS exists, continue automatically.

### 1. Backend deployment while NOTE4 may still be offline

If the reviewed bundle/artifact identities remain exact and deterministic gates remain green, deploy the frozen ARM64 observability backend within the already-authorized fail-closed C3 pattern.

Verify after deployment:

- exact active image identity;
- Slate running/healthy with restart count stable at zero;
- MySQL running/healthy with identity preserved and restart count stable;
- local/public health HTTP 200;
- secret mount remains read-only;
- unauthenticated voice-config guard still rejects as expected;
- WebSocket route control remains reachable;
- no vendor/Tenclass fallback;
- no provider session created by validation;
- no production Gemini model change;
- no credential/billing change;
- rollback image remains available.

A safe rollback is required for any deployment regression.

Backend deployment PASS is not a controller stop.

### 2. Prepare exact app-only firmware handoff

Once review PASS and backend deployment/requalification are complete, mark the frozen firmware ready for the next NOTE4 connection.

Use only APP-ONLY flash at the already-qualified application offset recorded by the campaign. Preserve:

- bootloader;
- partition table;
- NVS;
- pairing;
- LittleFS/user data;
- device identity.

No full erase.

Before flash, verify exact board identity and exact binary SHA256 `8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a`.

After flash verify hash/write success, normal boot, Wi-Fi, pairing preservation, authenticated polling, no fatal markers, and presence of the new sanitized stage markers.

### 3. One combined diagnostic/acceptance M4 session

After exact reviewed backend + exact reviewed app firmware are active, ask for ONE physical session only.

Protocol:

1. enter Voice AI;
2. one short non-sensitive English turn;
3. if service works, one short Japanese turn;
4. exit Voice AI;
5. if `VOICE_SERVICE_UNAVAILABLE` occurs, do not retry blindly.

Required sanitized structural result:

```text
VOICE_CONFIG_AUTHENTICATED_RESULT=
VOICE_CONFIG_PARSE_RESULT=
VOICE_WEBSOCKET_AUTHENTICATED_RESULT=
VOICE_WEBSOCKET_OPEN_RESULT=
VOICE_WEBSOCKET_CLOSE_CODE=
PROVIDER_SESSION_CREATE_START=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
MIC_AUDIO_REACHED_PROVIDER=
FIRMWARE_GENERIC_FAILURE_BRANCH=
```

If conversation succeeds, also validate:

- one logical user turn = one user bubble;
- one logical assistant turn = one assistant bubble;
- no transcript-fragment-created extra assistant bubbles;
- no excessive e-ink redraw churn;
- normal audio;
- sanitized latency-stage deltas;
- no unexpected vendor fallback.

Never retain raw microphone audio, transcript text, provider payload contents, auth material, Calendar contents, or Outlook data.

## If the board returns before ZAI resource

Do not waste the physical window on a blind retry using unreviewed observability bytes. Verify only the board identity/port if useful, then preserve `WAITING_DEVICE` until exact review PASS. The mandatory independent review gate comes before changed-byte deployment/flash.

## If ZAI resource returns before the board

Run the exact review immediately. If PASS, deploy and requalify the backend while NOTE4 remains offline, prepare the exact app-only flash packet, and reduce the remaining frontier to the physical NOTE4 flash + combined M4 session.

## No-repeat rule

Do not rerun already-passed overnight work unless one of these is true:

- bytes changed;
- artifact identity cannot be verified;
- environment drift invalidates the result;
- a reviewer finding specifically requires retest;
- new evidence contradicts the checkpoint.

In particular, do not repeatedly rebuild identical artifacts, repeatedly hit the blocked ZAI endpoint, rerun provider-disabled tests merely to remain busy, or create documentation-only `CURRENT_HEAD` loops.

## Exit contract

Before any exit report:

```text
CURRENT_HEAD=
CURRENT_STAGE=
DEVICE_STATUS=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
SOURCE_BUNDLE_SHA256=
BACKEND_IMAGE_ID=
BACKEND_IMAGE_TAR_SHA256=
FIRMWARE_APP_SHA256=
ZAI_REVIEW_STATUS=
ZAI_REVIEW_VERDICT=
PRODUCTION_BACKEND_STATUS=
NEXT_APP_ONLY_FLASH_READY=
NEXT_M4_PROTOCOL_READY=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Do not exit while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`.

A legitimate current stop is allowed when all nonphysical work remains exhausted and the only blockers are:

- the mandatory same ZAI reviewer resource/balance boundary; and/or
- the NOTE4 physical device boundary.

Do not merge, release, delete preserved roots/backups, repartition NVMe, touch Deluge data, change production Gemini model, create/replace credentials, or change billing without separate explicit human authority.

Keep PR #2 OPEN / DRAFT / UNMERGED.