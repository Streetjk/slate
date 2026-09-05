# Campaign 8D1M-G — PROPOSED UX Fix Deployment + Physical Retest

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Deploy and physically retest the already-qualified narrow voice UX repair that fixes transcript-fragment bubble splitting and removes partial-transcription e-ink refresh churn. This proposal creates no authority until explicit human activation.

## Accepted reviewed UX candidate

```text
SOURCE_SHA=aae1c1fefce5e6c4ca4dbc2cd4d50f44ed4863d3
ARM64_IMAGE_ID=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
REVIEW_PROVIDER=GROK
REVIEW_MODEL=grok-4.6
REVIEW_VERDICT=PASS
P0_FINDINGS=0
P1_FINDINGS=0
P2_FINDINGS=0
P3_FINDINGS=0
ONE_LOGICAL_USER_TURN_ONE_BUBBLE=PASS
ONE_LOGICAL_ASSISTANT_TURN_ONE_BUBBLE=PASS
PARTIAL_TRANSCRIPTION_NEW_BUBBLE=NO
EPD_FRAGMENT_REFRESH_CHURN=REMOVED
PROVIDER_BEHAVIOR_CHANGED=NO
```

The backend-only whitespace correction at `aae1c1f...` did not change the firmware tree. The already-qualified firmware artifact remains valid:

```text
ESP_IDF=5.5.2
ESP_TARGET=esp32s3
FIRMWARE_APP_SHA256=edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb
FIRMWARE_MERGED_SHA256=7bf1f37b3c79bb7a01220cb8e168b74413db82f38e942687b3c9be7b94be7a65
APP_FLASH_OFFSET=0x10000
```

Current accepted production/rollback references before this UX deployment remain:

```text
CURRENT_PRODUCTION_TRANSPORT_IMAGE=sha256:5ef126ff62ccf466c0795c1c76b4bdf0a7b9657184eab1f09b7435deeedbab6d
PINNED_OLDER_ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
CURRENT_DEVICE_PRE_UX_APP_SHA256=95ddf7e41c3dbb3aafb7d983708ccf39c131d68a89eac7f000c48adb5e99c9d4
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
```

## Status

```text
DIRECTIVE_STATE=PROPOSED_NOT_AUTHORIZED
PRODUCTION_DEPLOYMENT_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PRIVATE_MICROPHONE_RETEST_AUTHORIZED=NO
BILLING_CHANGE_AUTHORIZED=NO
CREDENTIAL_CHANGE_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

## Proposed single activation envelope

A later explicit human `proceed` authorizes the following bounded chain without intermediate handoffs:

```text
LONGRUN_DEFAULT=YES
STOP_BETWEEN_SUCCESSFUL_STAGES=NO
DEPLOY_EXACT_REVIEWED_BACKEND=YES
FLASH_EXACT_REVIEWED_APP_ONLY_FIRMWARE=YES
PHYSICAL_RETEST=YES_BOUNDED
PRIVATE_MICROPHONE_TEST=YES_BOUNDED_WITH_FREE_TIER_DATA_USE_ACKNOWLEDGED
MODEL_CHANGE=NO
BILLING_OR_VERTEX_CHANGE=NO
CREDENTIAL_REPLACEMENT=NO
SEARCH=OFF
TOOLS=NO_INVOCATION
CALENDAR_WRITES=NO
OUTLOOK_DATA=NO
RAW_AUDIO_RETENTION=NO
RAW_PROVIDER_PAYLOAD_RETENTION=NO
FULL_FLASH_ERASE=NO
PARTITION_TABLE_WRITE=NO
NVS_WRITE=NO
LITTLEFS_WRITE=NO
PAIRING_RESET=NO
PR2_MERGE=NO
```

The human has previously been informed that current Gemini Developer API Free Tier content may be used to improve Google products. Activation of this proposal must be treated as explicit acknowledgement of that fact for this bounded physical retest only. Do not broaden private-data scope beyond the operator's short test utterances.

## D0 — preflight and rollback preservation

Before any mutation:

1. verify PR #2 is still open/draft/unmerged;
2. verify no product source commit newer than `aae1c1f...` invalidates the exact Grok review;
3. verify exact backend image and firmware hashes above;
4. verify current Slate/MySQL/local/public health green;
5. verify the currently running production image and current device app rollback path are durably recoverable;
6. preserve/tag/archive the current production image as the immediate UX rollback before replacement;
7. verify root Docker storage headroom; if insufficient, use only the previously approved bounded NVMe archive/reclaim method, never broad prune, volume deletion, rollback deletion, Deluge changes, repartitioning, or Docker data-root migration;
8. verify the device serial port and app-only flash compatibility at `0x10000`.

## D1 — exact backend deployment

Deploy only:

```text
SOURCE_SHA=aae1c1fefce5e6c4ca4dbc2cd4d50f44ed4863d3
ARM64_IMAGE_ID=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
```

Preserve the existing Gemini 2.5 model, Developer API protected credential, private Node stdio bridge, MySQL, persistent data, and public routing. Do not enable Search or tools.

After recreation require Slate/MySQL/local/public health PASS. If health fails, immediately restore the pre-UX production image and stop without firmware flash.

## D2 — exact app-only firmware flash

Only after D1 PASS, flash exactly:

```text
FIRMWARE_APP_SHA256=edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb
OFFSET=0x10000
```

Do not erase full flash or rewrite partition table/NVS/LittleFS. Preserve pairing, server address, device identity and secret. Verify flash digest and normal boot/authenticated polling.

If boot/pairing/polling/routing regresses, restore the pre-UX app-only firmware and verify recovery; do not continue to private voice.

## D3 — bounded physical UX retest

If D1 and D2 pass, continue directly into one short physical voice session. The operator may use real microphone speech only for this bounded retest.

Retest matrix:

```text
TURN_1=SHORT_ENGLISH_QUESTION
TURN_2=SHORT_JAPANESE_QUESTION
MAX_PROVIDER_SESSIONS=1_PHYSICAL_SESSION
SEARCH=OFF
TOOLS=NO_INVOCATION
CALENDAR_WRITES=NO
OUTLOOK_DATA=NO
```

Required observations:

- one logical user turn renders as one bubble;
- one logical assistant turn renders as one bubble;
- no fragment-by-fragment bubble creation;
- audio still streams normally;
- barge-in/reconnect behavior is not regressed if naturally exercised;
- no Tenclass/vendor activation fallback;
- Slate/MySQL/local/public health remain green;
- capture sanitized timing stage markers only; never transcript text, raw audio, credentials or raw provider payloads;
- record perceived response latency and any mechanically available timing deltas.

Do not claim numeric latency improvement where clocks/markers cannot support it. If latency remains materially poor after bubble/refresh churn is removed, publish the measured stage evidence and stop ready for a separate narrow latency optimization; do not guess and do not churn the Gemini model.

## Pass / rollback semantics

On full PASS:

```text
UX_BACKEND_DEPLOY=PASS
UX_FIRMWARE_FLASH=PASS
ONE_USER_TURN_ONE_BUBBLE=PASS
ONE_ASSISTANT_TURN_ONE_BUBBLE=PASS
PHYSICAL_LATENCY=IMPROVED|UNCHANGED|WORSE_WITH_EVIDENCE
PRODUCTION_HEALTH=PASS
DEVICE_HEALTH=PASS
PR2_MERGED=NO
```

Leave the UX candidate deployed/flashed only while health remains green. Preserve immediate rollback artifacts through terminal adjudication.

On backend, firmware, or physical regression:

- rollback the affected layer immediately;
- verify Slate/MySQL/local/public health and device polling;
- do not retry provider/private voice blindly;
- publish exact failure layer and evidence.

`REPORT-PUSH-INVARIANT.md` remains binding. Checkpoint publication, successful D0/D1/D2 transitions, and D1->D2->D3 continuation are not handoffs once explicitly activated.
