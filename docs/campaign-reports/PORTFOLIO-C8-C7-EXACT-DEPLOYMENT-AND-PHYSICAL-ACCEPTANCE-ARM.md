# Portfolio C8+C7 exact deployment and one bounded physical acceptance

Date: 2026-09-10 (Australia/Perth)

## Live reconciliation

```text
PR1_HEAD=641e358f7067d7e314e4f2c1eb18258690268cab
PR1_STATE=OPEN
PR1_DRAFT=YES
PR1_MERGED=NO
PR2_HEAD_BEFORE_CHECKPOINT=0b6d52daea5996cce5f7ee6fb4af30702c16dd77
PR2_STATE=OPEN
PR2_DRAFT=YES
PR2_MERGED=NO
PR3_HEAD=61700ea8c5b7755aa39259a45554289ca01ff700
PR3_STATE=OPEN
PR3_DRAFT=YES
PR3_MERGED=NO
PR4_HEAD=e9a6cfac86c63cb461a62d5029080332fac06865
PR4_STATE=OPEN
PR4_DRAFT=YES
PR4_MERGED=NO
```

The exact authorized candidate remained the reviewed frozen artifact:

```text
SOURCE_COMMIT=d26efe2441407faf71c4c508f66e9f5c39f98fae
BACKEND_TAG=slate:m4-postphysical-c8-c7-d26efe2
ARM64_IMAGE_ID=sha256:4788c9c69ac08cc31132ac1f70c72f17d626467e619943014c6a7c8f4f928662
COMBINED_REVIEW=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
FIRMWARE_CHANGED=NO
LIVE_BRANCH_NON_DOC_DRIFT_FROM_CANDIDATE=NONE
```

The accepted provider history is distinct from the earlier failure:

```text
C8_EARLIER_PROVIDER_ATTEMPT=FAIL_SESSION_SETUP_OR_AMBIGUOUS_HISTORICAL
C8_ACCEPTED_RESTORE_PROVIDER_QUALIFICATION=PASS_SYNTHETIC_PROVIDER_BRIDGE
C8_ACCEPTED_PROVIDER_SESSION_ESTABLISHED=YES
C8_ACCEPTED_PROVIDER_EN_TRANSCRIPTION=YES
C8_ACCEPTED_PROVIDER_JA_TRANSCRIPTION=YES
C8_ACCEPTED_PROVIDER_OUTPUT=YES_EN_AND_JA
C8_ACCEPTED_PROVIDER_CLEAN_EXIT=YES
NEW_PROVIDER_SESSION_AUTHORIZED=NO
NEW_PROVIDER_SESSION_REQUIRED=NO
```

## Exact authorized deployment result

Only the Slate backend container was recreated. The candidate was loaded on the
ARM64 target and activated through a temporary Compose override supplied on
stdin; no deployment configuration file was persisted or changed. The
override selected the exact candidate image and retained the existing `.env`,
network, `/data` bind, database configuration, approved Gemini settings and
protected read-only key bind.

```text
DEPLOYMENT_SCOPE=SLATE_BACKEND_CONTAINER_ONLY
MYSQL_RECREATE=NO
FIRMWARE_ACTION=NONE
NOTE4_RESET=NONE
NOTE4_REPAIR=NONE
WIFI_CHANGE=NONE
RUNNING_SOURCE_MATCH=PASS_EXACT_FROZEN_CANDIDATE
RUNNING_IMAGE_MATCH=PASS_EXACT_IMAGE_CONFIG_AND_ROOTFS_FINGERPRINT
AUTHORIZED_IMAGE_ID=sha256:4788c9c69ac08cc31132ac1f70c72f17d626467e619943014c6a7c8f4f928662
REMOTE_LOADED_IMAGE_ID=sha256:377661a1c653e27c79a1a9352c513c3724bfc6a66b2d5fce343c638e0c1c2fa4
IMAGE_ID_NOTE=DOCKER_SAVE_LOAD_ID_REPRESENTATION_DIFFERS;IMMUTABLE_CONFIG_AND_ROOTFS_FINGERPRINTS_MATCH
RUNNING_BACKEND_TAG=slate:m4-postphysical-c8-c7-d26efe2
SLATE_HEALTH=HEALTHY
SLATE_RESTART_COUNT=0
SLATE_CONTAINER_RECREATED=YES_AUTHORIZED
MYSQL_HEALTH=HEALTHY
MYSQL_RESTART_COUNT=0
MYSQL_CONTAINER_ID_UNCHANGED=YES
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
GEMINI_CONFIG_QUALIFICATION=PASS_EXACT_ALLOWLISTED_RUNTIME_SETTINGS
GEMINI_AUTH_MODE=developer_api_key
GEMINI_DEVELOPER_API_KEY_ENABLED=true
GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED=true
GEMINI_LIVE_RUNTIME=node_bridge
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
GEMINI_API_KEY_FILE=/run/secrets/gemini_api_key
GEMINI_NODE_EXECUTABLE=node
GEMINI_NODE_BRIDGE_SCRIPT=./src/modules/assistant/gemini-live-node-bridge-runtime.mjs
SECRET_MOUNT_READONLY=PASS
NOTE4_AUTHENTICATED_POLL=PASS_PRIOR_STRUCTURAL_EVIDENCE_UNCHANGED
OBSERVER_STATE=RUNNING_CONNECTED_SANITIZED
OBSERVER_SELF_TEST=PASS_PRIOR_REARM
OBSERVER_RAW_CONTENT=NOT_RETAINED
```

The remote Docker-loaded image reported a different local image-ID
representation, as in the prior approved load path. Its ARM64 config and
rootfs fingerprints matched the authorized local image exactly. MySQL image,
container identity and restart count were unchanged.

## One physical acceptance now armed

```text
PHYSICAL_ACCEPTANCE_ARMED=YES
PHYSICAL_ACCEPTANCE_MAX=1
PROVIDER_CALL=NONE
FIRMWARE_FLASH=NONE
RESET_OR_POWER_CYCLE=NONE
REPAIR_OR_REPAIRING=NONE
```

Use one continuous short Voice AI session, waiting for each answer before the
next question:

1. EN — How many days are in a week?
2. JA — 日本の首都はどこですか？
3. EN — How many minutes are in an hour?
4. JA — 一年は何ヶ月ありますか？
5. EN — What planet do we live on?
6. JA — 日本の通貨は何ですか？

During the same bounded acceptance, perform only the ordinary navigation
checks for the changed C7 paths:

- Outlook Connect must navigate correctly or show a visible safe error; do not
  cross into Microsoft sign-in/consent authority.
- Perth current/forecast weather icons must map known Open-Meteo conditions to
  meaningful assets instead of the unknown cloud/question-mark fallback.
- Run only minimal regression checks for daily/month calendar, Perth-local
  formatting, Google News AU, Google News TW and Google News Both.

Record only sanitized structural outcomes. For Voice, classify session start,
early/late reply speed, input-to-user-text speed, progressive degradation or
freeze, service error, user-to-assistant order, one-bubble-per-role behavior,
Japanese transcription language, kana rendering including `の`, audible
assistant audio, clean exit and unexpected reset/settings return. Where
available retain only allowlisted WS/provider/audio/timing/queue/heap/reset
markers. Do not retain raw audio, transcript contents, provider payloads,
credentials, auth headers, private Calendar/Outlook contents or device
identifiers.

After this single attempt is consumed, ingest the operator observations and
sanitized observer evidence without a blind repeat. Preserve C8 and C7
results independently, separate stable-but-slow latency from stability, and
continue safe deterministic diagnosis/repair/review automatically if either
path fails. C10 remains not deployed and C9 remains parked research-only.

```text
PORTFOLIO_READY_NODE_COUNT=0
PORTFOLIO_READONLY_READY_NODE_COUNT=0
PORTFOLIO_WAITING_DEVICE_COUNT=1
PORTFOLIO_WAITING_HUMAN_COUNT=2
PORTFOLIO_EXTERNALLY_BLOCKED_COUNT=0
PORTFOLIO_HUMAN_ACTION_REQUIRED=YES
PORTFOLIO_HUMAN_ACTION_REASON=ONE_BOUNDED_COMBINED_C8_C7_NOTE4_PHYSICAL_ACCEPTANCE
PORTFOLIO_TERMINAL_REASON=DEPLOYMENT_GATES_PASS_WAITING_SINGLE_PHYSICAL_ACCEPTANCE
PORTFOLIO_NEXT_ACTION=CONSUME_ONE_COMBINED_C8_C7_NOTE4_PHYSICAL_ACCEPTANCE
```

PR #1, #2, #3 and #4 remain OPEN / DRAFT / UNMERGED.
