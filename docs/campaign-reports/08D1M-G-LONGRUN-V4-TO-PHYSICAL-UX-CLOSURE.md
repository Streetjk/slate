# Campaign 8D1M-G — LONG-RUN V4 -> NVMe Docker Root -> UX Deploy -> Firmware -> Physical UX Closure

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

This directive consolidates the already-activated Campaign 8D1M-G storage/deployment/physical-retest envelope into one reduced-stop execution plan from the current M1 V4 checkpoint through physical UX closure.

It adds **no new product, credential, billing, model, privacy, merge, or destructive authority**. It exists to reduce unnecessary handoffs and to make the current authorization executable as one long-running campaign.

The prior NVMe migration -> exact UX backend -> app-only firmware -> bounded physical EN/JA retest proposal was explicitly activated by the operator's earlier `proceed`. That activation remains the authority basis for M1-M4. Checkpoint pushes are not stops.

## Current accepted live state

Reconcile before execution to the exact current remote head and re-read the newest state. At publication time the accepted state is:

```text
PR2_STATE=open
PR2_DRAFT=true
PR2_MERGED=false
CURRENT_PRODUCT_SOURCE_SHA=aae1c1fefce5e6c4ca4dbc2cd4d50f44ed4863d3
EXACT_UX_ARM64_IMAGE=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
CURRENT_PRODUCTION_IMAGE=sha256:5ef126ff62ccf466c0795c1c76b4bdf0a7b9657184eab1f09b7435deeedbab6d
PINNED_APPLICATION_ROLLBACK=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
MYSQL_IMAGE=sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb
FIRMWARE_APP_SHA256=edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb
FIRMWARE_FLASH_OFFSET=0x10000
DOCKER_CURRENT_ROOT=/var/lib/docker
DOCKER_TARGET_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
NVME_FILESYSTEM=ext4
CURRENT_NVME_RESERVE_FLOOR_BYTES=180000000000
SLATE_HEALTH=PASS
MYSQL_HEALTH=PASS
LOCAL_PUBLIC_HEALTH=HTTP_200
SLATE_RESTARTS=2
MYSQL_RESTARTS=0
V1_RERUN=NO
V2_RERUN=NO
V3_RERUN=NO
V4_SCRIPT=/home/pi/slate-m1-rootstep-v4-restart-baseline.sh
V4_SCRIPT_SHA256=5b2d7c23244d34fea0ed248d33516e15c34d3f7a8d4f4ed4f1faec6ea433bfb3
V4_MODE=700
V4_BASH_N=PASS
V4_NONROOT_FAIL_CLOSED=PASS
V4_STARTUP_WAIT_SECONDS=180
V4_ROLLBACK_WAIT_SECONDS=180
```

The previous failures are understood and must remain historical evidence rather than being retried:

```text
V1_FAILURE=INVALID_RAW_DU_BYTE_EQUALITY_GATE
V2_FAILURE=STARTUP_HEALTH_GATE_TOO_EAGER
V3_FAILURE=STALE_RESTART_EXPECTED_BASELINE_ZERO
```

V4 is intended to correct only the V3 baseline defect while retaining the V2/V3 content verification, startup wait, restart-growth detection and rollback behavior.

## Routing — newest explicit policy

Use the newest routing override throughout this campaign:

```text
CONTROLLER=CODEX
SOLE_REPOSITORY_AND_PRODUCTION_INTEGRATOR=CODEX
WRITER=GEMINI_3_8_FLASH
WRITER_MODEL=gemini-3.8-flash
WRITER_ROLE=BOUNDED_IMPLEMENTATION_WRITER_WORKER
INDEPENDENT_REVIEWER=GROK_4_6
REVIEW_TRANSPORT=GROK_CLI_EXISTING_AUTH_SESSION
```

Rules:

- Gemini 3.8 Flash may propose scripts, patches, tests, diagnostics and documentation, preferably with high reasoning/thinking where supported.
- Codex must validate all Gemini 3.8 output deterministically before integration.
- Gemini 3.8 Flash must not use the protected Orange Pi production Gemini API key for orchestration.
- Do not use OpenRouter unless a newer explicit user policy authorizes it.
- Do not silently substitute Luna, Sonnet, Gemini 3.7, Grok, GLM or another writer if Gemini 3.8 is unavailable; record `GEMINI38_WRITER=UNAVAILABLE` and continue with Codex alone where safe.
- Grok 4.6 remains read-only independent reviewer and must not edit production or repository files.
- Gemini 3.8 Flash must not review its own authored work as the independent reviewer.
- Do not call Gemini 3.7 Flash family during the existing blackout before `2026-09-06T02:00:00+08:00`.

## Long-run operating contract

```text
LONGRUN_DEFAULT=YES
CHECKPOINT_PUSH_IS_NOT_A_STOP=YES
INTERMEDIATE_STAGE_SUCCESS_IS_NOT_A_STOP=YES
CONTINUE_AFTER_REPORT_PUSH=YES
CONTINUE_AFTER_REVIEW_PASS=YES
CONTINUE_AFTER_BOUNDED_REPAIR=YES
CONTINUE_AFTER_RECOVERABLE_INFRA_FIX=YES
BUNDLE_PREAUTHORIZED_REVERSIBLE_ACTIONS=YES
PUSH_OFTEN=YES
STOP_RARELY=YES
STOP_ONLY_FOR_TRUE_NEW_AUTHORITY_OR_UNAVOIDABLE_HUMAN_ACTION=YES
```

Do not stop merely because:

- a deterministic test stage passes;
- a report/state checkpoint was pushed;
- an exact review passes;
- a recoverable script/control-flow defect is found before mutation;
- a bounded correction can be made without expanding authority;
- a transient startup state is within the defined bounded wait;
- a local artifact must be rehashed/reinstalled without changing its intended content or authority.

Every meaningful success, rollback, hard stop, reviewer finding, physical boundary or provider use must still be published and pushed before continuing.

## Global invariants

The following remain fixed unless a newer explicit operator instruction changes them:

```text
PRODUCTION_GEMINI_LIVE_MODEL_CHANGE=NO
BILLING_CHANGE=NO
VERTEX_CHANGE=NO
PRODUCTION_CREDENTIAL_REPLACEMENT=NO
CALENDAR_WRITES=NO
OUTLOOK_DATA_USE=NO
SEARCH=OFF_DURING_PHYSICAL_RETEST
TOOL_INVOCATION=NO_DURING_PHYSICAL_RETEST
RAW_AUDIO_RETENTION=NO
RAW_PROVIDER_PAYLOAD_RETENTION=NO
TRANSCRIPT_CONTENT_RETENTION=NO
NVME_REPARTITION=NO
NVME_FORMAT=NO
DELUGE_PATH_CHANGE=NO
DELUGE_DATA_DELETE=NO
OLD_ROOT_DOCKER_DELETE=NO_UNTIL_LATER_SEPARATE_MAINTENANCE_DECISION
MYSQL_VOLUME_DELETE=NO
DOCKER_VOLUME_DELETE=NO
BROAD_DOCKER_PRUNE=NO
FULL_FIRMWARE_ERASE=NO
PARTITION_TABLE_WRITE=NO
NVS_WRITE=NO
LITTLEFS_WRITE=NO
PAIRING_RESET=NO
SERVER_ADDRESS_RESET=NO
PR2_MERGE=NO
```

Do not reinterpret the current 180 GB reserve floor as expected Slate/Docker consumption. It is only the currently approved coexistence guardrail for this migration. Do not delete data to satisfy it. If the floor itself becomes the only blocker, publish exact numbers and stop at that policy boundary rather than changing it implicitly.

---

# Stage L0 — one final exact V4 safety review before another sudo attempt

Because V1, V2 and V3 each exposed a different script-control defect, do one final independent review of the exact V4 artifact **before** asking the operator to execute it.

## L0.1 Reconcile exact artifact

Fetch origin and prove:

```text
REMOTE_V4_PATH=/home/pi/slate-m1-rootstep-v4-restart-baseline.sh
REMOTE_V4_SHA256=5b2d7c23244d34fea0ed248d33516e15c34d3f7a8d4f4ed4f1faec6ea433bfb3
REMOTE_V4_MODE=700
LOCAL_REPO_V4_CONTENT_MATCH=YES
BASH_N_LOCAL=PASS
BASH_N_REMOTE=PASS
NONROOT_FAIL_CLOSED=PASS class=NOT_ROOT
```

If the remote hash does not match, do not execute it. Reconcile and republish the correct exact hash first.

## L0.2 Deterministic state-machine audit

Codex must trace the exact V4 control flow and verify at minimum:

1. preflight reads current restart counts and initializes expected preflight baselines **before** health assertion;
2. historical non-zero restart counts are accepted when stable;
3. `mutation_started` remains false through all preflight-only failures;
4. Docker is stopped before reconciliation copy;
5. copy verification is based on file/content metadata and deterministic rsync verification, not raw cross-filesystem `du` equality;
6. both source and destination Docker trees remain preserved;
7. daemon configuration backup/restore behavior is correct for both pre-existing and absent `/etc/docker/daemon.json`;
8. switch waits long enough for normal `starting -> healthy` transitions;
9. switched-root restart baseline is established from the switched-root container state and restart growth, not historical count, is what causes failure;
10. success requires DockerRootDir = target, storage driver expected, current/rollback/MySQL images visible, network/volumes intact, Slate/MySQL healthy, local/public HTTP pass, reserve pass;
11. any post-mutation error triggers rollback to the original daemon configuration and `/var/lib/docker`;
12. rollback waits for original-root Slate/MySQL/local/public health before declaring rollback PASS;
13. neither normal success nor rollback removes `/var/lib/docker` or the NVMe copy;
14. no secret/environment/provider payload is printed or copied.

Gemini 3.8 Flash may provide a bounded implementation audit or correction proposal. Codex must independently verify it.

## L0.3 Grok 4.6 exact review

Submit the exact V4 script plus the V1-V3 failure history and current recovery report to Grok 4.6 through the existing authenticated Grok CLI/session.

Required reviewer focus:

```text
ROOT_MUTATION_SAFETY
ROLLBACK_CORRECTNESS
RESTART_BASELINE_CORRECTNESS
STARTUP_WAIT_CORRECTNESS
DAEMON_CONFIG_PRESERVATION
COPY_VERIFICATION_CORRECTNESS
PATH_AND_DELETE_SAFETY
SECRET_HANDLING
RESERVE_GUARD
FAIL_CLOSED_BEHAVIOR
```

Require severity-tagged findings P0-P3 with evidence.

If review is PASS with no P0/P1 and no unresolved safety issue, continue.

If a bounded script defect is found, correct it under the existing M1 scope using Gemini 3.8 Flash as writer where useful, create a **new versioned script**, validate it, re-run Grok exact review, push the corrected report/hash, and continue without asking the operator until a clean exact script is ready.

Do not silently overwrite V4 if its content changes; use V5 or later and record all hashes.

L0 ends only when exactly one clean, reviewed, installed root-step script is ready.

---

# Stage L1 — arm observer and make the single unavoidable sudo handoff

Before printing the manual command, Codex must arm a non-secret observer that can detect the migration result without needing the operator to paste credentials or repeat state manually.

Observe only sanitized state such as:

```text
DOCKER_DAEMON_STATE
DOCKER_REPORTED_DATA_ROOT
SLATE_STATUS_HEALTH_RESTARTCOUNT
MYSQL_STATUS_HEALTH_RESTARTCOUNT
LOCAL_PUBLIC_HEALTH
NVME_FREE_BYTES
EXPECTED_IMAGES_NETWORKS_VOLUMES_VISIBLE
```

Do not poll credentials, `.env`, raw logs containing secrets, database contents, or provider payloads.

Then present exactly one root command using the exact reviewed versioned script. For the current V4 artifact that command is:

```bash
ssh -t pi@orangepi5 'sudo /home/pi/slate-m1-rootstep-v4-restart-baseline.sh'
```

The operator enters the SSH/sudo password only in their own terminal. Codex must never ask them to paste the password.

If the observer can determine success after the command, continue automatically without asking the operator to restate `PASS`.

If the script exits non-zero:

- do not ask for blind rerun;
- determine whether failure was pre-mutation or post-mutation;
- verify rollback/original-root production health;
- use the sanitized failure class and observer evidence;
- if it is another bounded script/control-flow bug and production is healthy, use Gemini 3.8 + Codex + Grok to prepare/review a new versioned script and return only when the next exact manual command is ready;
- if rollback failed, data integrity is uncertain, Deluge is implicated, storage/permissions reveal a genuinely new infrastructure design issue, or a protected artifact/pin changed, stop at that true boundary.

---

# Stage M1 — verify NVMe Docker-root migration PASS

After the root step reports/demonstrates success, independently verify:

```text
DOCKER_DATA_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
DOCKER_STORAGE_DRIVER=overlayfs
DOCKER_DAEMON=active
SLATE=running/healthy
MYSQL=running/healthy
SLATE_RESTART_GROWTH=NO_AFTER_SWITCH_BASELINE
MYSQL_RESTART_GROWTH=NO_AFTER_SWITCH_BASELINE
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
AUTHENTICATED_NOTE4_POLLING=PASS_IF_AVAILABLE_SANITIZED
CURRENT_PRODUCTION_IMAGE_VISIBLE=YES
PINNED_ROLLBACK_IMAGE_VISIBLE=YES
MYSQL_IMAGE_VISIBLE=YES
EXPECTED_NETWORK_VISIBLE=YES
EXPECTED_VOLUMES_VISIBLE=YES
ORIGINAL_VAR_LIB_DOCKER_PRESERVED=YES
NVME_DOCKER_COPY_ACTIVE=YES
DELUGE_PATH_UNCHANGED=YES
DELUGE_DATA_MUTATION=NO
NVME_RESERVE_FLOOR=PASS
```

Do not delete the original Docker root after success. It remains the immediate infrastructure rollback through M4 closure.

Publish M1 PASS, fetch-verify the exact remote SHA and continue immediately to M2.

---

# Stage M2 — exact reviewed UX backend deployment

Only after M1 PASS, deploy **only** the already reviewed UX backend artifact:

```text
SOURCE_SHA=aae1c1fefce5e6c4ca4dbc2cd4d50f44ed4863d3
ARM64_IMAGE_ID=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
```

Requirements:

1. transfer/load into the now-NVMe-backed production Docker store;
2. verify exact artifact identity after load;
3. preserve current production image and pinned rollback;
4. recreate only the Slate backend as required;
5. preserve MySQL, volumes, network and public routing;
6. preserve the existing protected Gemini credential read-only and do not inspect its value;
7. preserve the existing Gemini 2.5 production Live model and private Node stdio bridge;
8. run provider-disabled/local deterministic checks first;
9. require Slate/MySQL healthy and local/public HTTP 200;
10. require NOTE4 authenticated polling/routing evidence where available;
11. no Gemini provider call merely to prove deployment.

On deterministic deployment failure, rollback the application layer immediately to the pre-UX production image and verify health. A single bounded same-artifact recovery for a proven transport/tag/health-window mechanic is allowed if artifact identity and authority remain unchanged; do not retry blindly. Any source/artifact change requires requalification/review and, before a new production deployment of that changed artifact, a new exact deployment boundary unless already explicitly covered by a newer directive.

Publish M2 PASS and continue immediately to M3.

---

# Stage M3 — exact app-only NOTE4 firmware flash

Only after M2 PASS and exact device reconciliation:

```text
EXPECTED_TARGET=ESP32-S3
EXPECTED_FLASH_SIZE=16MB
APP_SHA256=edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb
APP_OFFSET=0x10000
FULL_ERASE=NO
PARTITION_TABLE_WRITE=NO
NVS_WRITE=NO
LITTLEFS_WRITE=NO
PAIRING_RESET=NO
SERVER_ADDRESS_RESET=NO
```

Before writing, verify the attached physical device is still the expected NOTE4 target and exact app binary hash remains unchanged. If the device identity/port/flash geometry or artifact pin changed, stop rather than guessing.

Perform one app-only flash, verify write/digest, normal boot, app synchronization and authenticated polling. Preserve the existing exact app-only rollback artifact.

If the new firmware regresses boot/routing before private voice testing, perform the already-prepared app-only rollback and verify recovery. Do not full-erase the device.

Publish M3 PASS and continue directly to M4 setup.

---

# Stage M4 — one bounded physical EN/JA UX session

The prior activated migration/deploy/retest envelope already authorized one bounded private microphone test under the acknowledged current Free Tier data-use policy. This directive does not expand that scope.

Before asking the operator to touch the device, arm sanitized serial/backend/timing monitoring and prove:

```text
PRODUCTION_HEALTH=PASS
DEVICE_NORMAL_BOOT=PASS
AUTHENTICATED_POLLING=PASS
TENCLASS_VENDOR_FALLBACK=ABSENT_EXPECTED
SEARCH=OFF
TOOLS=OFF
CALENDAR_WRITES=OFF
OUTLOOK_DATA=NO
MAX_PROVIDER_SESSIONS=1
RAW_AUDIO_RETENTION=NO
RAW_PROVIDER_PAYLOAD_RETENTION=NO
TRANSCRIPT_CONTENT_RETENTION=NO
```

Then make one combined human request, not separate repeated stops:

1. enter Voice AI normally;
2. ask one short, non-sensitive English question;
3. after the reply completes, ask one short, non-sensitive Japanese question;
4. do not invoke Calendar, Search, Outlook, external tools or sensitive/private subject matter;
5. exit Voice AI after the two turns.

Codex should observe and analyze the session without requiring the operator to paste transcript content.

Required UX assertions:

```text
ONE_EN_USER_TURN=ONE_USER_BUBBLE
ONE_EN_ASSISTANT_TURN=ONE_ASSISTANT_BUBBLE
ONE_JA_USER_TURN=ONE_USER_BUBBLE
ONE_JA_ASSISTANT_TURN=ONE_ASSISTANT_BUBBLE
PARTIAL_TRANSCRIPT_NEW_BUBBLES=NO
FRAGMENT_DRIVEN_EINK_REFRESH_CHURN=NO
AUDIO_STREAMING=NORMAL
TENCLASS_VENDOR_FALLBACK=NO
PROVIDER_SESSION_COUNT<=1
```

Use sanitized timestamps only to build the physical latency budget:

```text
DEVICE_LISTEN_START
FIRST_DEVICE_AUDIO_SENT
BACKEND_FIRST_AUDIO_RECEIVED
PROVIDER_FIRST_OUTPUT_EVENT
PROVIDER_FIRST_AUDIO_EVENT
BACKEND_FIRST_AUDIO_TO_DEVICE
DEVICE_FIRST_AUDIO_PLAYBACK
TRANSCRIPT_FINALIZED
UI_RENDER_REQUEST
EPD_REFRESH_COMPLETE_IF_AVAILABLE
```

Report stage deltas, not transcript/audio content.

Compare the result to the previous user observation of severe lag and multi-bubble rendering. The bubble defect is considered physically closed only if each logical turn renders as one persistent bubble.

If latency remains materially poor but bubble behavior is fixed, do **not** change the Gemini model by guesswork. Publish the measured latency split and proceed with zero-provider/local evidence analysis. Gemini 3.8 Flash may propose a bounded source-side optimization and Grok 4.6 must review it. Continue through deterministic tests/build/review without stopping. Stop only before deploying/flashing a **new changed artifact** unless a newer directive explicitly preauthorizes that new exact artifact deployment.

If the physical session fails because of an existing exact deployment/flash/runtime mechanic rather than a source change, rollback the implicated affected layer, verify health, publish evidence and exhaust safe zero-provider diagnosis before asking for another provider/private-mic session. No blind private voice retry.

---

# Stage M5 — terminal dossier / closure state

When M1-M4 pass, publish a terminal report containing at minimum:

```text
NVME_DOCKER_DATA_ROOT_MIGRATION=PASS
ACTIVE_DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
OLD_ROOT_DOCKER_COPY_PRESERVED=YES
DELUGE_UNCHANGED=YES
NVME_RESERVE_FLOOR=PASS
UX_BACKEND_EXACT_ARTIFACT=PASS
UX_FIRMWARE_APP_ONLY=PASS
ONE_USER_TURN_ONE_BUBBLE=PASS_EN_JA
ONE_ASSISTANT_TURN_ONE_BUBBLE=PASS_EN_JA
PARTIAL_TRANSCRIPT_BUBBLE_CHURN=REMOVED_PHYSICAL_PASS
PHYSICAL_LATENCY=IMPROVED|UNCHANGED|WORSE_WITH_SANITIZED_EVIDENCE
PRODUCTION_SLATE=HEALTHY
PRODUCTION_MYSQL=HEALTHY
LOCAL_PUBLIC_HEALTH=HTTP_200
DEVICE_HEALTH=PASS
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
PRODUCTION_MODEL_CHANGED=NO
CREDENTIAL_CHANGED=NO
SEARCH_USED=NO
TOOLS_INVOKED=NO
RAW_AUDIO_RETAINED=NO
RAW_PROVIDER_PAYLOAD_RETAINED=NO
PR2_STATE=open
PR2_DRAFT=true
PR2_MERGED=false
```

Then perform a final Grok 4.6 read-only review of the **actual terminal evidence and exact deployed source/artifact pins** if substantive code changed since the last accepted Grok review. If no source changed and the previously reviewed exact source/artifact is what was deployed, do not manufacture a redundant source review; review the closure evidence only if useful.

Do not merge PR #2. Merge remains a separate explicit human authorization.

Do not delete `/var/lib/docker` or old rollback archives as part of closure. Storage cleanup after successful migration is separate maintenance work.

---

# Hard-stop conditions

Stop only when one of these is true:

1. root-step rollback fails or Docker root/production health cannot be restored;
2. source/destination Docker integrity becomes uncertain;
3. Deluge path/data is unexpectedly implicated;
4. the exact reviewed source/image/firmware pin changes before deployment/flash;
5. a new production credential, billing, Vertex, API-key, model or external-data scope is required;
6. the physical target no longer matches the pinned NOTE4 device/artifact assumptions;
7. a P0/P1 or unresolved security finding remains after bounded correction;
8. another private-microphone/provider session beyond the already authorized one would be required;
9. a changed source/artifact needs a new production deployment or firmware write outside the current exact pins;
10. PR #2 merge/release is requested;
11. the current 180 GB reserve policy itself becomes the sole blocker and changing it would be required.

Do **not** stop for report publication, reviewer PASS, deterministic PASS, known transient health states within bounded waits, exact-hash reconciliation, or safe bounded source/script corrections.

## Report-push invariant

At every meaningful checkpoint:

1. update the active report and `CAMPAIGN-STATE.md`;
2. run diff/secret-safety checks;
3. selectively commit only intended files;
4. push the active branch;
5. fetch and verify the exact remote SHA;
6. confirm PR #2 remains open/draft/unmerged;
7. continue automatically if still within this activated envelope.

The operator should not be asked to re-authorize intermediate successful stages already covered by the activated M1-M4 chain.
