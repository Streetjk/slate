# C7+C8 physical requalification readiness

Date: 2026-09-11 (Australia/Perth)

The exact activated C7+C8 backend and application-only firmware identities were
reconciled against live production. The single bounded physical
requalification is armed; it has not been consumed.

```text
LIVE_PR2_HEAD=695240de31e68767c47e41d4b067e22914f11ba5
PR2_STATE=OPEN
PR2_DRAFT=YES
PR2_MERGED=NO

BACKEND_SOURCE=6d6bd5ddd2d6c463d094f17b4e756cc820131474
BACKEND_REVIEWED_IMAGE=sha256:684849bb2bf8e0bc261b9dc973d7e5d23e69460772995bfd6be3426ff493b4e5
RUNNING_IMAGE_ID=sha256:b115be615e013e10caede19b6fe0f94512bc1b83d81ffdc38ef2a0965f8f6b54
RUNNING_IMAGE_LOAD_EQUIVALENCE=YES_ROOTFS_LAYER_FINGERPRINT
PRODUCT_BYTE_DRIFT=0

FIRMWARE_APP_SHA256=0b4c9f1c989cf3157ef54d9a904bc33c05e202f3c31d4d2661b16a18bc32619a
FIRMWARE_APP_BYTES=2535312
FIRMWARE_APP_PARTITION_BYTES=4194304
VOICE_FONT_SHA256=99c2673c97bd17c8a378e64236abe46cfcdd04933ecd5b5a6cda692ae46a8bb0
FIRMWARE_IDENTITY=EXACT_REVIEWED_APP_ARTIFACT_ALREADY_FLASHED

SLATE_HEALTH=running|healthy
SLATE_RESTART_COUNT=0
MYSQL_HEALTH=running|healthy
MYSQL_RESTART_COUNT=0
MYSQL_IDENTITY_PRESERVED=YES
LOCAL_HTTP_HEALTH=HTTP_200
PUBLIC_HTTP_HEALTH=HTTP_200
NETWORK_IDENTITY_PRESERVED=YES
GEMINI_CONFIG_QUALIFICATION=PASS_APPROVED_VALUES_PRESENT
SECRET_MOUNT_READONLY=YES
NOTE4_AUTHENTICATED_POLL=PASS_SANITIZED_MARKERS_CONTINUING
OBSERVER_STATE=ARMED_CONNECTED_SANITIZED
OBSERVER_PORT=/dev/cu.usbmodem31201

PHYSICAL_REQUALIFICATION_AUTHORIZED=YES
PHYSICAL_REQUALIFICATION_MAX_ATTEMPTS=1
PHYSICAL_REQUALIFICATION_CONSUMED=NO
AUTO_REPEAT_AUTHORIZED=NO
PROVIDER_CALL=NONE
```

The observer remains structural-only. No firmware, backend, Wi-Fi, pairing,
MySQL or provider state was changed during readiness qualification.

## Single physical package

Use the existing Perth Weather card, then the Monthly calendar, then a quick
Google News regression. Click Outlook Connect at most once and accept only a
visible concise English error; do not continue to Microsoft sign-in or consent.
Run one short normal Voice session with a small Japanese sample and inspect
normal Voice operation plus U+66C7 (`曇`) if it occurs naturally. Do not repeat,
reset, power-cycle, re-pair, reflash, redeploy, recreate cards, or run a
separate provider qualification session.

Capture only the fields defined by the after-activation directive. Preserve
UNKNOWN for any unobserved item and retain no raw audio, full transcript,
provider payload, credential, private Outlook/Calendar content or private
device identifier.
