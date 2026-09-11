# Portfolio C7+C8 exact deployment and application-only flash result

Date: 2026-09-11 (Australia/Perth)

This report records the exact operator-authorized backend activation and
application-only NOTE4 firmware flash. No provider qualification call or
physical acceptance was performed under this authority.

## Authority and identity

```text
AUTHORITY_CONSUMED=EXACT_REVIEWED_C7_C8_BACKEND_DEPLOYMENT_AND_APP_ONLY_FLASH
SOURCE=6d6bd5ddd2d6c463d094f17b4e756cc820131474
BACKEND_TAG=slate:c7-c8-glyph-calendar-6d6bd5
ARM64_IMAGE=sha256:684849bb2bf8e0bc261b9dc973d7e5d23e69460772995bfd6be3426ff493b4e5
IMAGE_DIGEST_64_HEX=PASS
PRODUCT_BYTE_DRIFT=0
REVIEW=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
SOURCE_MATCH=YES
IMAGE_MATCH=YES_LOCAL_EXACT
IMAGE_PLATFORM=linux/arm64
IMAGE_TRANSFER_LOAD_EQUIVALENCE=PASS_ROOTFS_LAYER_FINGERPRINT
REMOTE_LOAD_ID=sha256:b115be615e013e10caede19b6fe0f94512bc1b83d81ffdc38ef2a0965f8f6b54

FIRMWARE_TARGET=ESP32S3
FIRMWARE_APP_SHA256=0b4c9f1c989cf3157ef54d9a904bc33c05e202f3c31d4d2661b16a18bc32619a
FIRMWARE_APP_SIZE=2535312
FIRMWARE_APP_PARTITION_BYTES=4194304
VOICE_FONT_SHA256=99c2673c97bd17c8a378e64236abe46cfcdd04933ecd5b5a6cda692ae46a8bb0
FIRMWARE_APP_SHA256_MATCH=YES
FIRMWARE_APP_SIZE_MATCH=YES
VOICE_FONT_SHA256_MATCH=YES
FIRMWARE_REVIEW_MATCH=YES
FIRMWARE_FLASH_SCOPE=APPLICATION_PARTITION_ONLY_0x10000
FIRMWARE_FLASH_RESULT=PASS_HASH_VERIFIED
FIRMWARE_BOOT_HANDOFF=PASS_HARD_RESET_TO_BOOT_VERIFICATION
FIRMWARE_VERSION_OR_APP_IDENTITY=APP_SHA256_MATCH
```

The backend image was transferred and loaded using a transport-specific Docker
image ID; the local and remote rootfs layer fingerprints matched. The remote
load ID is therefore recorded separately and is not substituted for the
reviewed local image identity.

## Deployment qualification

```text
DEPLOYMENT_SCOPE=SLATE_BACKEND_CONTAINER_ONLY
MYSQL_RECREATE=NO
NETWORK_IDENTITY_PRESERVED=YES
MYSQL_IDENTITY_PRESERVED=YES
SLATE_PREDEPLOY_HEALTH=running|healthy
SLATE_PREDEPLOY_RESTART_COUNT=0
MYSQL_PREDEPLOY_HEALTH=running|healthy
MYSQL_PREDEPLOY_RESTART_COUNT=0
RUNNING_SOURCE_MATCH=YES_BY_EXACT_REVIEWED_IMAGE
RUNNING_IMAGE_MATCH=YES_LOAD_EQUIVALENCE
SLATE_HEALTH=running|healthy
SLATE_RESTART_COUNT=0
MYSQL_HEALTH=running|healthy
MYSQL_RESTART_COUNT=0
LOCAL_HTTP_HEALTH=HTTP_200
PUBLIC_HTTP_HEALTH=HTTP_200
GEMINI_CONFIG_QUALIFICATION=PASS_APPROVED_VALUES_PRESENT
SECRET_MOUNT_READONLY=YES
NOTE4_AUTHENTICATED_POLL=PASS_SANITIZED_MARKERS_RESUMED
FATAL_MARKERS=0_IN_POSTACTIVATION_WINDOW
```

The approved Gemini provider/model/auth path and protected secret mount were
preserved. The only service recreated was Slate. MySQL, its data and the
application network were not recreated or changed.

## Firmware qualification

The exact app image was written to the established application offset on the
ESP32-S3. The bootloader, partition table, NVS, OTA metadata and unrelated
data partitions were not flashed or erased. The tool verified the written
application hash. A hard-reset handoff was used solely to boot and verify the
newly flashed app; it was not a second acceptance attempt.

```text
FIRMWARE_PORT=/dev/cu.usbmodem31201
FIRMWARE_APP_OFFSET=0x10000
BOOTLOADER_FLASHED=NO
PARTITION_TABLE_FLASHED=NO
NVS_FLASHED=NO
FILESYSTEM_FLASHED=NO
NOTE4_NETWORK_RECONNECT=PASS_AUTHENTICATED_POLL_RESUMED
UNEXPECTED_RESET_OR_SETTINGS_LOSS=UNKNOWN_NO_SANITIZED_SERIAL_BOOT_MARKER
NOTE4_SERIAL_OBSERVER=CONNECTED_NO_RAW_LINES_OBSERVED
```

The corrected sanitized observer passed self-test and is armed on
`/dev/cu.usbmodem31201`. It emits structural markers only; raw serial content
is not retained. Backend snapshots show Slate/MySQL health and resumed
authenticated poll markers. No raw serial, device identifier, network identity,
credential, transcript, audio or provider payload is retained here.

## Authority boundary and frontier

```text
PROVIDER_CALL=NONE
PHYSICAL_REQUALIFICATION=NOT_YET_CONSUMED
PHYSICAL_REQUALIFICATION_AUTHORITY=NEXT_SEPARATE_BOUNDARY
OUTLOOK_OAUTH=NOT_ATTEMPTED
MYSQL_MUTATION=NONE
FIRMWARE_FLASH_AUTHORITY=CONSUMED
```

The next and only useful C7+C8 node is one bounded combined physical
requalification covering the existing Weather and monthly-calendar paths,
Google News regression, the safe English Outlook error, and a short Voice
Japanese glyph regression. No provider qualification call is included.

```text
C9_STAGE=PARKED_RESEARCH_ONLY
C10_STAGE=ISOLATED_USAGE_TILES_REVIEWED_NOT_DEPLOYED
PR1_2_3_4=OPEN_DRAFT_UNMERGED
```
