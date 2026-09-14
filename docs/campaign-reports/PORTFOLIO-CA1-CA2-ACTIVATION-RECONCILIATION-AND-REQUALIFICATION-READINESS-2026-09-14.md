# CA-1 / CA-2 Activation Reconciliation and Physical Requalification Readiness

Date: 2026-09-14 (Australia/Perth)

## Durable identity and GitHub reconciliation

```text
LIVE_PR2_HEAD_BEFORE_CHECKPOINT=1878077d589c935d5464cbc7f784275f0f346fcb
CURRENT_CONTROL_CHECKPOINT=a1bfe7c56649031dddfc7e02580742f313285b9f
PR1=OPEN_DRAFT_UNMERGED
PR2=OPEN_DRAFT_UNMERGED
PR3=OPEN_DRAFT_UNMERGED
PR4=OPEN_DRAFT_UNMERGED
```

The state checkpoint and this report are documentation-only. No reviewed
product bytes were rebuilt or changed.

## Externally completed firmware activation

The operator supplied the following mechanical activation evidence. It is
bound as evidence; no flash or device reset was performed by this run.

```text
AUTHORIZED_FIRMWARE_SHA256=cfa15233f037d8cce3721f3d70539f3395b69d85a61f3279b6ac9d3a8616b13c
AUTHORIZED_FIRMWARE_BYTES=2537984
AUTHORIZED_FIRMWARE_ELF_SHA256=1956207c3fb6f7893c77e3f7a316292593a782d24812d8f59eb9d123bfeb765c
FLASH_TARGET=ESP32-S3_REV_V0.2_16MB
FLASH_SCOPE=APPLICATION_PARTITION_ONLY
FLASH_OFFSET=0x10000
BOOTLOADER_FLASHED=NO
PARTITION_TABLE_FLASHED=NO
NVS_FLASHED=NO
FILESYSTEM_FLASHED=NO
FIRMWARE_IDENTITY_MATCH=YES_OPERATOR_MECHANICAL_EVIDENCE
```

## Read-only backend and preservation checks

```text
REVIEWED_SOURCE=1cb585a6d554e1eddd3b3ed8300a7e3252e3bc31
REVIEWED_BACKEND_IMAGE=sha256:1201ca661bc5a7e7e775f4bf0f67964852b77d31c23aa17156ba766df232ae8e
RUNNING_BACKEND_IMAGE=sha256:c2bed4492ba5bd8d541ec44d8b805383349433a9bc61635611903a3ac434cb4c
RUNNING_IMAGE_PLATFORM=linux_arm64
ROOTFS_AND_RUNTIME_CONFIG_EQUIVALENCE=PASS_PRIOR_EXACT_TRANSFER_EVIDENCE
SLATE_HEALTH=running_healthy
SLATE_RESTART_COUNT=0
MYSQL_HEALTH=running_healthy
MYSQL_RESTART_COUNT=0
MYSQL_IDENTITY_PRESERVED=YES
LOCAL_HTTP_HEALTH=HTTP_200
PUBLIC_HTTP_HEALTH=HTTP_200
NETWORK_IDENTITY_PRESERVED=YES
DOCKER_ROOT_PRESERVED=/mnt/ssd-tmp/slate-tools/docker-data
GEMINI_CONFIG_QUALIFICATION=PASS_APPROVED_VALUES_PRESENT
SECRET_MOUNT_READONLY=YES
FATAL_MARKERS=0
```

The current post-activation log window contained no fresh
`DEVICE_AUTHENTICATED_POLL_RESULT=PASS` marker. This is recorded as unknown,
not as a failure; prior sanitized authenticated-poll evidence remains
historical evidence and no poll was induced by this run.

```text
NOTE4_AUTHENTICATED_POLL=UNKNOWN_POST_ACTIVATION_NO_FRESH_SANITIZED_MARKER
```

## Observer readiness

```text
COLLECTOR_ID=m4-sanitized-structural-v3|sha256:6140c29148d35a29fc95a1a77141323e4d3f1037669620b4353b8b7ed31a9f29
COLLECTOR_SELF_TEST=PASS
OBSERVER_STATE=ARMED_CONNECTED_SANITIZED
OBSERVER_PORT=/dev/cu.usbmodem31201
OBSERVER_RAW_CONTENT_RETAINED=NO
OBSERVER_PRIVATE_CONTENT_RETAINED=NO
OBSERVER_FATAL_MARKERS=0
OBSERVER_REQUIRED_PHYSICAL_EVENTS=NOT_YET_EXPECTED_BEFORE_DEVICE_WINDOW
```

The pre-window observer probe saw only sanitized boot/Wi-Fi/heap and
duplicate-event markers, with no fatal marker and no physical Voice turn.
The bounded capture correctly remained `MISSING_EVIDENCE` for physical
producer classes before a device interaction; that is not a physical result.
The observer was then re-armed and is connected for the operator window.

## Grok 4.6 readiness adjudication

The first invocation reached its six-turn limit while reading local files and
returned no decision. A single bounded corrected invocation used a complete
self-contained packet and returned:

```text
DECISION_STATUS=READY_FOR_PHYSICAL_BOUNDARY
APPLICATION_READY=YES
FIRMWARE_READY=YES
OBSERVER_READY=YES
REQUALIFICATION_WINDOW_ARMED=YES
PORTFOLIO_DECISION=CONTINUE
RUNNABLE_SAFE_WORK_COUNT=0
NEXT_SAFE_ACTION=Begin physical window now: Japanese glyph; EN/JA/Traditional Chinese current-turn matching; Chinese latency attribution; bounded multi-turn stability; clean Voice exit only
STOP_REASON=none
BLOCKERS=none
```

Grok's `CONTINUE` is a continuation into the explicitly authorized human
device boundary, not permission to simulate or consume it from the controller.

## Readiness fields

```text
OBSERVER_READY=YES
COLLECTOR_SELF_TEST=PASS
BACKEND_HEALTH_READY=YES
NOTE4_AUTHENTICATED_POLL=UNKNOWN_POST_ACTIVATION_NO_FRESH_SANITIZED_MARKER
EXACT_BACKEND_IDENTITY_MATCH=YES
EXACT_FIRMWARE_IDENTITY_MATCH=YES
REQUALIFICATION_WINDOW_ARMED=YES
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=ONE_BOUNDED_NOTE4_VOICE_GLYPH_LANGUAGE_LATENCY_REQUALIFICATION;NO_REPEAT_OR_RESET_OR_REFLASH
NEXT_ACTION=OPERATOR_PERFORM_ONE_BOUNDED_NOTE4_VOICE_WINDOW_USING_THE_CHECKLIST_BELOW
```

## Exact bounded operator checklist

Use the already activated Slate and NOTE4. Do not redeploy, reflash, reset,
power-cycle, re-pair, change Wi-Fi, or start a provider qualification
session. The observer remains structural-only.

Complete at most these four ordinary Voice turns, waiting for each answer:

1. English: `How many days are in a week?`
2. Japanese: `日本の首都はどこですか？`
3. Traditional Chinese: `一週有幾天？`
4. Japanese: `日本の通貨は何ですか？`

Record only sanitized structural results:

- Japanese glyph/placeholder result, including `楽`/`楽曲` if naturally
  rendered and any missing-square or wrong-glyph marker actually observed;
- current-turn language class and response-language match for English,
  Japanese and Traditional Chinese;
- the available turn timing stages and dominant Chinese delay boundary;
- multi-turn ordering/one-bubble-per-role, progressive lag, freeze, reboot,
  audio-audibility structural marker, and clean Voice exit.

Do not retain raw audio, transcript text, provider payloads, credentials,
private connected-app contents, or private device identifiers. Preserve
`UNKNOWN` for any stage or behavior not directly observed.

```text
CA1_CA2_PHYSICAL_REQUALIFICATION_CONSUMED=NO
AUTO_REPEAT_AUTHORIZED=NO
PHYSICAL_TEST_RUN_BY_CONTROLLER=NO
```

No production application, firmware, database, provider configuration,
integration, merge, or release action was performed by this checkpoint.
