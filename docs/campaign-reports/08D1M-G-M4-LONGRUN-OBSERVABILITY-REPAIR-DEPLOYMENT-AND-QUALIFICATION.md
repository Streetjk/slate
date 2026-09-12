# Campaign 8D1M-G M4 — long-run observability repair, deployment and qualification

## Checkpoint

The live PR was reconciled at `40f0bf2a3dc986b914b92afecf50e6131c7ee771` and remained OPEN / DRAFT / UNMERGED. The long-run directive selected a minimum-footprint software repair before requesting the pending non-Voice network boundary.

```text
MODE=FRONTIER_DRIVEN_LONGRUN
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
OBSERVABILITY_REPAIR=BACKEND_ONLY_AUTHENTICATED_POLL_SUCCESS_MARKER
RUNTIME_SOURCE_COMMIT=07248b6830dd0c66ffcfb09229486d3516896a76
RUNTIME_FILES_CHANGED=3
FIRMWARE_BYTES_CHANGED=NO
FIRMWARE_FLASH=NOT_REQUIRED
```

## Codex adjudication and AGY implementation

Codex adjudicated that the existing authenticated poll controller is the narrowest safe boundary: Nest runs `DeviceAuthGuard` before the handler, and the fixed marker is logged only after `await DeviceFirmwareService.poll(...)` resolves. No marker is emitted when the guard rejects or the poll service throws. The single registered-device condition remains a separate qualification gate so the marker cannot be accepted as NOTE4 proof if unrelated device rows exist.

The designated AGY implementation worker `gemini-3.8-flash-high` changed only:

- `backend/src/modules/devices/device-firmware.controller.ts`;
- `backend/src/modules/devices/device-firmware.controller.test.ts`;
- `scripts/slate-m4-sanitized-observer-v2.py`.

The production log value is the fixed literal `DEVICE_AUTHENTICATED_POLL_RESULT=PASS`; it contains no identity, credential, payload, transcript, audio, provider, Calendar or Outlook data. The observer’s backend grep and Python extractor allow only that exact key/value and reject malformed values. Existing last-seen and poll behavior is unchanged.

## Deterministic validation and review

```text
OBSERVER_SELF_TEST=PASS
CONTROLLER_TESTS=6_PASS_0_FAIL
DEVICE_MODULE_TESTS=23_PASS_0_FAIL
BACKEND_TYPECHECK=PASS
BACKEND_LINT=PASS
IMPACTED_TYPESCRIPT_FORMAT=PASS
```

The repository-wide format check also inspected preserved pre-existing untracked build artifacts and reported their unrelated JSON formatting; the impacted TypeScript files passed the focused format check. The only custom secret-pattern hit was synthetic test-fixture text used to prove observer redaction; production code emits only the fixed marker and no secret assignment.

Fresh independent review used only the canonical direct Grok route `grok -m grok-4.6` against the exact source commit above. Grok returned PASS with P0=0, P1=0, P2=0, security-blocking=0, and one non-blocking P3 test-import hygiene note. No ZAI retry or reviewer fallback occurred. Grok confirmed that unauthenticated probes, health checks, TCP traffic, unrelated routes and failed poll calls cannot emit the marker.

## Exact build and backend-only deployment

```text
BACKEND_TAG=slate:m4-observability-07248b6
BACKEND_PLATFORM=linux/arm64
BACKEND_SOURCE_COMMIT=07248b6830dd0c66ffcfb09229486d3516896a76
BACKEND_LOCAL_IMAGE_ID=sha256:8f886de7c1c369ff1ea3055ee838ebc5d242306fa6f22df624eb176723ea97be
BACKEND_IMAGE_SIZE_BYTES=1130782673
BACKEND_ARCHIVE_SHA256_LOCAL=2b9dcab1a1378aed84ba7c365534094939ccd3aad912c116390570420512aeb8
BACKEND_ARCHIVE_SIZE_BYTES=1183150592
BACKEND_CONFIG_DIGEST_MATCH=YES
BACKEND_ORDERED_LAYER_IDENTITY_MATCH=YES
BACKEND_REMOTE_IMAGE_ID=sha256:e87a8c37bbc43455f40b37220a93ad8760c870ad82f90f965d7b340040a3791b
BACKEND_REMOTE_IMAGE_ID_NOTE=DOCKER_LOAD_REPRESENTATION_DIFFERS;CONFIG_AND_LAYERS_MATCH
```

The exact archive was loaded on `orangepi5` and config digest plus all 26 ordered layers matched the local image. The remote image ID/virtual size is a Docker load representation difference; it is not used as a content mismatch. A remote full-file hash command timed out under host I/O pressure before returning, so no remote archive SHA is claimed beyond exact size plus config/layer identity.

Only the Slate container was recreated with the existing approved Gemini settings and read-only secret mount. MySQL, its data, rollback image, and network authority were untouched.

```text
BACKEND_DEPLOYMENT=PASS_SLATE_ONLY
SLATE=RUNNING_HEALTHY_RESTART_0_OOMKILLED_FALSE
MYSQL=RUNNING_HEALTHY_RESTART_0
GEMINI_CONFIG_QUALIFICATION=PASS_EXACT_8_KEYS
GEMINI_SECRET_MOUNT_READONLY=PRESENT_VALID
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
VOICE_CONFIG_UNAUTH=HTTP_401
FIRMWARE_FLASH=NONE
```

## Post-deploy qualification

The durable observer was explicitly rearmed after the prior finite window expired. It is running on `/dev/cu.usbmodem31101` with the updated allow-list and no raw retention. Its post-rearm snapshots show the new backend tag, healthy Slate/MySQL, and zero observer fatal markers. The new marker and backend record remain absent:

```text
OBSERVER_RUNNING=YES
OBSERVER_REARM=PASS
DEVICE_AUTHENTICATED_POLL_MARKER_COUNT_30M=0
DEVICE_ROW_COUNT=1
RECENT_AUTH_ACTIVITY_COUNT_30M=0
RECENT_TELEMETRY_COUNT_30M=0
LATEST_AUTH_ACTIVITY=STALE
WIFI_MARKER_CAPTURED=NO
DEVICE_NETWORK_ACTIVITY_PROVEN=NO
```

This is an observed lack of NOTE4 network activity, not proof that the product’s Wi‑Fi stack failed. HTTP health and host TCP connections were not accepted as substitutes. No physical or Voice interaction was requested.

## Current frontier

```text
CURRENT_STAGE=M4_LONGRUN_OBSERVABILITY_MARKER_DEPLOYED_WIFI_STILL_UNPROVEN
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=1
WAITING_DEVICE_COUNT=1
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=0
CURRENT_BLOCKED_NODE=ONE_BOUNDED_NONVOICE_IDENTITY_PRESERVING_NETWORK_QUALIFICATION
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=ONE_BOUNDED_NONVOICE_IDENTITY_PRESERVING_NETWORK_QUALIFICATION
PHYSICAL_TEST_REQUESTED=NO
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
NEXT_ACTION=WAIT_FOR_ONE_IDENTITY_PRESERVING_AUTHENTICATED_NOTE4_POLL_MARKER;THEN_SET_READONLY_READY_ZERO_REARM_OBSERVER_AND_REQUEST_EXACTLY_ONE_COMBINED_EN_JA_MULTI_TURN_SOAK
```

