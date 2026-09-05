# Campaign 8D1M-G — PROPOSED Physical NOTE4 E2E Reconciliation

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Reconcile the stale Campaign 8D physical-device directive with the terminal 8D1M-G software result. The Gemini 2.5 Developer API candidate has now passed corrected non-production G2 and production G3 validation and remains deployed healthy. The old 8D text still assumes the historical Campaign 8C backend and Vertex/ADC; those assumptions no longer govern where they conflict with this proposal and the latest terminal software checkpoint.

This file is a proposal only. It authorizes no firmware write, no real microphone/private voice submission, no billing change, and no PR merge.

## Accepted terminal software state

```text
SOFTWARE_STAGE=S3_G3_PRODUCTION_PASS_READY_FOR_PHYSICAL_HUMAN_BOUNDARY
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
AUTHORIZED_ARM64_IMAGE=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
PRODUCTION_TRANSPORT_IMAGE=sha256:5ef126ff62ccf466c0795c1c76b4bdf0a7b9657184eab1f09b7435deeedbab6d
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
G3_PROVIDER_SESSION=PASS
EN_EN_JA=PASS_3_OF_3
RECONNECT=PASS
INLINE_AUDIO=PASS
LOCAL_HEALTH_HTTP=200
PUBLIC_HEALTH_HTTP=200
PRODUCTION_SLATE=HEALTHY
PRODUCTION_MYSQL=HEALTHY
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
PR2_MERGED=NO
```

The production backend now uses the already-protected Developer API credential and private Node stdio bridge. Do not reintroduce the old Vertex/ADC gate unless a later explicit strategy change authorizes it.

## Current Google data-use policy checkpoint

Before any real microphone/private voice test, refresh the official Gemini Developer API policy again. As of this reconciliation, Google's current official pricing/billing documentation states that Free Tier content is used to improve Google products, while Paid Tier content is not used to improve Google products.

Therefore:

```text
FREE_TIER_REAL_PRIVATE_MICROPHONE_AUTHORIZED=NO
PAID_TIER_CHANGE_AUTHORIZED=NO
REAL_PRIVATE_VOICE_REQUIRES_EXPLICIT_HUMAN_ACKNOWLEDGEMENT=YES
```

Synthetic provider validation already completed under the accepted scope; this new privacy gate applies to real user/device microphone content.

## P0 — zero-provider physical readiness reconciliation

Without flashing or sending microphone audio to Gemini:

1. verify PR #2 remains open/draft/unmerged and exact production software pins above remain current;
2. verify Slate/MySQL/local/public health and rollback/NVMe archives;
3. verify NOTE4 authenticated polling still succeeds against the deployed backend;
4. verify voice-config and authenticated Slate voice WebSocket routes remain present and unauthenticated access is rejected;
5. resolve the exact reviewed firmware candidate from existing Campaign 8 artifacts/reports and current branch history;
6. independently verify the firmware source pin, ESP-IDF version/target, partition compatibility, full image hash, app/OTA hash, and rollback artifact;
7. do not trust or reuse a stale firmware hash if repository evidence conflicts; stop and reconcile the artifact instead;
8. verify the least-destructive app-only/OTA path can preserve NVS/LittleFS, pairing, server address and device secret;
9. identify the physical NOTE4 serial port/device deterministically, but do not write.

P0 may update documentation/checkpoints and run deterministic firmware verification/builds. It must not flash, erase, reset pairing, send microphone audio to Gemini, change billing, or merge PR #2.

## P1 — firmware flash is a separate explicit human gate

A later explicit human authorization may permit flashing only the exact P0-reconciled firmware artifact.

Required invariants:

```text
ERASE_FLASH=NO
PRESERVE_NVS=YES
PRESERVE_LITTLEFS=YES_IF_PRESENT
PRESERVE_PAIRING=YES
PRESERVE_SERVER_ADDRESS=YES
PRESERVE_DEVICE_SECRET=YES
APP_ONLY_OR_OTA_PREFERRED=YES_IF_COMPATIBILITY_PROVEN
FULL_ERASE_OR_PARTITION_REWRITE=NO_UNLESS_SEPARATELY_AUTHORIZED
```

Immediately after flash, test only boot, pairing, polling, controls, Slate route selection, and absence of Tenclass/Xiaozhi activation fallback before any Gemini microphone test.

## P2 — physical routing checks before private provider audio

After an authorized flash, but before real microphone content is sent to Gemini:

- device boots normally;
- existing pairing/server address/device identity survive;
- authenticated polling resumes;
- double-tap ENTER opens Voice AI;
- short ENTER starts/toggles the local voice flow;
- microphone hardware/capture can be checked locally without forwarding retained real speech to Gemini;
- no Tenclass/Xiaozhi activation code/control-panel request appears;
- backend observes NOTE4 fetching Slate voice config and connecting to the authenticated Slate voice WebSocket;
- no fallback to `api.tenclass.net` or other old vendor route occurs.

Failure in boot/pairing/routing stops before private provider audio and uses the preserved firmware/backend rollback path.

## P3 — real microphone/private Gemini E2E is another explicit human gate

Do not send real user speech to Gemini merely because firmware flashing is authorized.

Before P3, present the current Free Tier data-use fact to the human. The human must explicitly choose one of:

```text
A=AUTHORIZE_BOUNDED_REAL_MICROPHONE_TEST_ON_CURRENT_FREE_TIER_WITH_DATA_USE_ACKNOWLEDGED
B=DO_NOT_SEND_PRIVATE_MICROPHONE_AUDIO_AND_STOP_AFTER_ROUTING_VALIDATION
C=AUTHORIZE_SEPARATE_PAID_TIER/BILLING_MIGRATION_DECISION_BEFORE_PRIVATE_VOICE
```

Option C does not itself authorize billing changes; it opens a separate billing decision. Never enable billing automatically.

If Option A is explicitly selected, run only a bounded physical matrix first:

- one simple English voice turn;
- one simple Japanese voice turn;
- one interruption/barge-in check;
- one controlled reconnect;
- no Outlook payload;
- Search off unless separately re-authorized for the physical test;
- no external-state-writing tools or Calendar writes in the first private voice pass;
- do not retain generated audio or raw provider payloads.

Broader Search/tool/Calendar physical validation can follow only after the core private voice path passes and the relevant OAuth/write gates are separately satisfied.

## P4 — terminal physical adjudication

Publish exact outcomes for:

```text
PHYSICAL_FIRMWARE_FLASH=PASS|FAIL|NOT_RUN
PAIRING_PRESERVED=YES|NO|NOT_RUN
SLATE_VOICE_ROUTING_PHYSICAL=PASS|FAIL|NOT_RUN
TENCLASS_ACTIVATION_PHYSICAL=ABSENT|PRESENT|NOT_RUN
PRIVATE_MICROPHONE_PROVIDER_TEST=PASS|FAIL|NOT_RUN
EN_VOICE_E2E=PASS|FAIL|NOT_RUN
JP_VOICE_E2E=PASS|FAIL|NOT_RUN
RECONNECT_PHYSICAL=PASS|FAIL|NOT_RUN
FIRMWARE_ROLLBACK_REQUIRED=YES|NO
PRODUCTION_BACKEND_ROLLBACK_REQUIRED=YES|NO
```

Any substantive source correction requires focused regression, exact ARM64/firmware requalification as applicable, and the currently required independent reviewer before another deployment/flash.

## Boundaries

No firmware write, no real/private microphone provider content, no billing/Vertex change, no credential replacement, no destructive device erase, no Calendar write, and no PR #2 merge are authorized by this proposal.

`REPORT-PUSH-INVARIANT.md` remains binding. P0 zero-provider reconciliation/checkpoint pushes are not handoffs once a later activation authorizes P0; P1 and P3 remain separate explicit human decisions because they are physical-write and private-data boundaries.

## Campaign 8D physical authorization — P0 reconciliation PASS

The human instruction for this checkpoint explicitly activates P0 -> app-only
firmware flash -> P2 routing validation. P3 remains closed: no real
microphone content is authorized for Gemini.

```text
CAMPAIGN=8D
PHYSICAL_SCOPE=P0_FLASH_P2
REMOTE_CHECKPOINT=54920d22cb7e731676b4619d1ce684bb3bc0b4b0
PR2=OPEN_DRAFT_UNMERGED
SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
SOFTWARE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
PRODUCTION_IMAGE=sha256:5ef126ff62ccf466c0795c1c76b4bdf0a7b9657184eab1f09b7435deeedbab6d
PRODUCTION_SLATE=HEALTHY_RESTARTS_0
PRODUCTION_MYSQL=HEALTHY_RESTARTS_0
PRODUCTION_LOCAL_HEALTH_HTTP=200
PRODUCTION_PUBLIC_HEALTH_HTTP=200
NOTE4_POLL_EVIDENCE=SANITIZED_RECENT_LOG_MATCHES_25
VOICE_CONFIG_UNAUTH_HTTP=401
VOICE_WEBSOCKET_UNAUTH=REJECTED_HTTP_400
LEGACY_XIAOZHI_OTA_HTTP=404
PRODUCTION_LEGACY_ACTIVATION_LOG_MATCHES=0
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
PRIVATE_MICROPHONE_TO_GEMINI=NO
REAL_VOICE_GEMINI_E2E=NO

FIRMWARE_SOURCE_SHA=121622c3bd1d23587b4aadb3a079ec85d2052278
FIRMWARE_SOURCE_AT_REVIEWED_SHA=PASS
ESP_IDF=v5.5.2
FIRMWARE_TARGET=esp32s3
FIRMWARE_FLASH_SIZE=16MB
FIRMWARE_BOOTLOADER_SHA256=fdcbdeeb3ab93e7a58059ce4c18894ec5d3178b445dc4c4a00e05eff6fb54151
FIRMWARE_PARTITION_TABLE_SHA256=6f0657eb6b8007c0dbfed6f64cf7a0d59f8ee1752af898e2f66dd218846b1835
CANDIDATE_FULL_IMAGE_SHA256=eba9427558bf08eb387894bb1feac2da5ec1d0b2ab8c8785285251d65afe33
CANDIDATE_APP_IMAGE_SHA256=95ddf7e41c3dbb3aafb7d983708ccf39c131d68a89eac7f000c48adb5e99c9d4
CANDIDATE_APP_IMAGE_VALID=YES
CANDIDATE_APP_FLASH_OFFSET=0x10000
CANDIDATE_APP_ONLY_PRESERVES_NVS=YES
CANDIDATE_APP_ONLY_PRESERVES_LITTLEFS_STORAGE=YES
FULL_FLASH_ERASE=NO
PARTITION_REWRITE=NO

ROLLBACK_SOURCE_SHA=bca05819e2cccc5cfdc128d82ffda052b3913412
ROLLBACK_DOCUMENTED_APP_SHA256=e880386b0155780389469c2895177528959a81c46f2fe44b411668ac184062b9
ROLLBACK_DOCUMENTED_FULL_SHA256=522f189bd36ea9b19cfe6767d70ea00c87c909d7e98ae4c8e1b7015430a1b41c
ROLLBACK_REBUILT_FROM_EXACT_SOURCE=YES
ROLLBACK_REBUILT_APP_SHA256=61baf54af122f8188e75d30d07068d95679be21d378ba9740d4d33487983fbfa
ROLLBACK_REBUILT_FULL_SHA256=59af51186b30b4e0a22eb8e2d21bbedae3ddd57e02d284ec6937fd6cc76e2cfa
ROLLBACK_REBUILT_APP_SIZE=2518224
ROLLBACK_REBUILT_FULL_SIZE=2583760
ROLLBACK_REBUILT_IDF_IMAGE=espressif/idf:v5.5.2@sha256:05cbfc42ed2e987b8026722c15bf1d8523d3e4fd1b4ac04d2e4056f5e0918b99
ROLLBACK_REBUILT_IMAGE_VALID=YES
ROLLBACK_DURABLE_LOCAL_PATH=/Users/ollama/NOTE4-backups/campaign8-physical-20260905/rollback-bca05819-app.bin
ROLLBACK_DURABLE_LOCAL_MODE=0600
ROLLBACK_READY_FOR_AUTOMATIC_APP_ONLY_RESTORE=YES

DEVICE_SERIAL_PORT=/dev/cu.usbmodem31201
DEVICE_CHIP=ESP32-S3_REV_V0.2
DEVICE_FLASH_ID=MANUFACTURER_46_DEVICE_4018
DEVICE_FLASH_SIZE=16MB
DEVICE_FLASH_TYPE=QUAD
DEVICE_IDENTITY_READONLY_CHECK=PASS
DEVICE_SECURITY_INFO_READONLY_CHECK=PASS
NO_NVS_READ=YES
NO_LITTLEFS_READ=YES
NO_DEVICE_SECRET_READ=YES
NO_FIRMWARE_WRITE_YET=YES

NO_VENDOR_ACTIVATION_SOURCE_TEST=PASS
NO_VENDOR_ACTIVATION_TOKENS_IN_FIRMWARE_MAIN=PASS
P0_STATUS=PASS
READY_FOR_APP_ONLY_FLASH=YES
READY_FOR_P2_ROUTING_VALIDATION=YES
```

The historical rollback hashes remain the documented Campaign 5 references.
The original ignored rollback binaries were not present locally, so a durable
app and full-image fallback was rebuilt from the exact rollback source using
the documented ESP-IDF image. The rebuilt app has the documented historical
size and independently passes ESP32-S3 image validation; its digest is
recorded above for the automatic app-only fallback. No NVS, LittleFS, pairing,
server address, identity, or device secret was read or modified during P0.

P0 backend, firmware, partition, device, no-vendor, and rollback gates pass.
The next authorized action is the exact candidate app-only write at `0x10000`.

## Campaign 8D P1 flash and P2 routing checkpoint

The explicitly authorized physical write was performed with the exact
reconciled candidate app image. No full-flash erase, partition-table write,
NVS write, LittleFS/storage write, pairing reset, credential read, or Gemini
provider session occurred.

```text
CAMPAIGN=8D
P1_STATUS=PASS
FLASH_TOOL=esptool_v5.2.0
FLASH_PORT=/dev/cu.usbmodem31201
FLASH_TARGET=ESP32-S3_REV_V0.2
FLASH_OFFSET=0x10000
FLASH_APP_BYTES=2502096
FLASH_APP_SHA256=95ddf7e41c3dbb3aafb7d983708ccf39c131d68a89eac7f000c48adb5e99c9d4
FLASH_SOURCE_SHA=121622c3bd1d23587b4aadb3a079ec85d2052278
FLASH_RESULT=PASS
FLASH_DIGEST_VERIFY=PASS
FULL_FLASH_ERASE=NO
PARTITION_TABLE_WRITE=NO
APP_REGION_SECTOR_ERASE_BY_WRITE=YES
NVS_WRITE=NO
LITTLEFS_WRITE=NO
PAIRING_RESET=NO
DEVICE_SECRET_READ=NO

P2_DEVICE_BOOT=PASS_OBSERVED_APP_SYNC
P2_SERIAL_EVIDENCE=SANITIZED_SYNC_START_AND_SYNC_DONE_OK_1
P2_AUTHENTICATED_POLLING=PASS_SANITIZED_BACKEND_LOG_MATCHES_12
P2_PAIRING_PRESERVED=YES_INFERRED_FROM_AUTHENTICATED_POLLING
P2_SERVER_ADDRESS_PRESERVED=YES_INFERRED_FROM_AUTHENTICATED_POLLING
P2_DEVICE_IDENTITY_PRESERVED=YES_NO_IDENTITY_RESET
P2_SLATE_HEALTH=HEALTHY_RESTARTS_0
P2_MYSQL_HEALTH=HEALTHY_RESTARTS_0
P2_LOCAL_HEALTH_HTTP=200
P2_PUBLIC_HEALTH_HTTP=200
P2_VOICE_CONFIG_UNAUTH_HTTP=401
P2_VOICE_WEBSOCKET_UNAUTH=REJECTED_HTTP_400
P2_LEGACY_OTA_HTTP=404
P2_LEGACY_ACTIVATION_LOG_MATCHES=0
P2_FIRMWARE_SOURCE_VENDOR_TEST=PASS
P2_PRIVATE_MICROPHONE_TO_GEMINI=NO
P2_PROVIDER_SESSIONS=0

P2_PHYSICAL_DOUBLE_TAP_ENTER=NOT_OBSERVED_NO_SAFE_HARDWARE_ACTUATOR
P2_PHYSICAL_SHORT_ENTER=NOT_OBSERVED_NO_SAFE_HARDWARE_ACTUATOR
P2_VOICE_CONFIG_FETCH=NOT_OBSERVED_BUTTON_GATE
P2_AUTHENTICATED_VOICE_WEBSOCKET=NOT_OBSERVED_BUTTON_GATE
P2_LOCAL_MIC_CAPTURE=NOT_RUN
TENCLASS_ACTIVATION_PHYSICAL=NOT_OBSERVED
FIRMWARE_ROLLBACK_REQUIRED=NO
PRODUCTION_BACKEND_ROLLBACK_REQUIRED=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
PR2_MERGED=NO
```

The app-only write and digest verification succeeded. The device subsequently
produced normal Slate synchronization with `ok=1`; authenticated polling
continued, so the existing pairing, server address, and device identity were
not reset. Backend route and log checks found no vendor activation fallback.
The connected USB serial/JTAG interface provides no safe actuator for the
physical ENTER button, and no button event was observed spontaneously. Thus
the literal double-tap/short-press and resulting authenticated voice-session
checks remain a genuine physical-observation boundary. No private microphone
or provider test was attempted.
