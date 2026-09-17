# Campaign 8D1M-G — Frontier-Driven Continuation While C1 Review Is Blocked

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Apply the Slate long-session operating method to the current M2/C1 state so that exhaustion of the Grok 4.6 review transport blocks only the affected review/mutation node and does not prematurely terminate the entire controller session while other authorized READY or READONLY_READY work remains.

This directive is an operating-method/control-flow instruction only. It grants no new product, reviewer, credential, provider, billing, destructive, production, firmware, private-data, or merge authority.

## Current accepted state

```text
M1_STATUS=PASS_NVME_DOCKER_ROOT_ACTIVE
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
M2_STATUS=CONTAINERD_RECOVERY_C1_REVIEW_TRANSPORT_HARD_STOP
C0_STATUS=TOPOLOGY_COMPATIBLE
C1_SCRIPT=scripts/slate-m2-containerd-rootstep-v1-nvme-reversible.sh
C1_SCRIPT_SHA256=84ab71aa5f126eb58ff70f34dd89d92c3d72cc3ea0335c9f3f9f07a522a757cd
C1_LOCAL_BASH_N=PASS
C1_LOCAL_DIFF_CHECK=PASS
C1_LOCAL_SECRET_SCAN=PASS
C1_GROK_MODEL=grok-4.6
C1_GROK_AUTH=PASS
C1_GROK_EXACT_REVIEW=NO_FINAL_VERDICT
C1_REVIEW_TRANSPORT=EXHAUSTED
C1_SAFE_FOR_MANUAL_SUDO=NO
C1_REMOTE_INSTALL=NOT_PERFORMED
PRODUCTION_MUTATION=NO
M2_CANDIDATE_REGISTERED=NO
M3_STATUS=BLOCKED_M2_NOT_PASS
M4_STATUS=BLOCKED_M2_NOT_PASS
```

The final plain-stdin Grok attempt also returned no final verdict. Do not retry Grok again under the exhausted transport policy unless a newer explicit instruction authorizes a genuinely new transport condition.

## Operating contract

```text
FRONTIER_DRIVEN_LONGRUN=YES
REPORT_IS_CHECKPOINT_NOT_STOP=YES
NORMAL_PASS_AUTO_CONTINUES=YES
NODE_BLOCK_DOES_NOT_IMPLY_SESSION_STOP=YES
HUMAN_RELAY_FOR_ROUTINE_ENGINEERING=NO
ARTIFICIAL_RUNTIME_PADDING=NO
GIT_IS_DURABLE_MEMORY=YES
GITHUB_IS_ASYNC_CONTROL_BUS=YES
CODEX_IS_RUNNING_INTEGRATION_AUTHORITY=YES
```

The blocked C1 independent-review node must be classified as `WAITING_EXTERNAL` / `WAITING_HUMAN`, not as a global campaign terminal state.

Before any exit, Codex must perform a complete frontier scan and record:

```text
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
HUMAN_ACTION_REQUIRED=
TERMINAL_REASON=
```

Terminal exit is not allowed while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`, unless continuing would violate an explicit safety/authority invariant.

## Startup / reconciliation boundary

At receipt of this directive:

1. `git fetch origin`;
2. verify repository, branch, HEAD, working tree and active worktrees;
3. read `AGENTS.md`, current campaign instructions, `CAMPAIGN-STATE.md`, the M2 containerd proposal/recovery reports, and this directive;
4. reconcile against actual repository/live read-only evidence;
5. record the exact instruction SHA consumed in campaign state (add or update an equivalent `instruction_sha` / `last_instruction_sha_seen_by_controller` field where practical);
6. recompute the full authorized frontier.

Repository/durable state wins over stale conversation memory.

## Current blocked node — do not bypass

The following remains blocked:

```text
NODE=C1_INDEPENDENT_REVIEW
STATE=WAITING_HUMAN_OR_EXTERNAL
REVIEWER_REQUIRED=GROK_4_6_UNDER_CURRENT_POLICY
GROK_TRANSPORT_EXHAUSTED=YES
UNREVIEWED_ROOT_SCRIPT_INSTALL=NO
MANUAL_SUDO=NO
CONTAINERD_MUTATION=NO
```

Do not silently:

- substitute another reviewer;
- waive independent review;
- install or execute the unreviewed root script;
- mutate Docker/containerd roots;
- retry the candidate image load;
- flash firmware;
- run the private microphone/provider session;
- change credentials/billing/model/provider;
- delete old Docker/containerd trees or Deluge data;
- merge PR #2.

## Frontier scan — execute all authorized useful work that is not blocked

Treat the following as candidate `READONLY_READY` or non-production engineering nodes. Reconcile each against live state before executing; skip only if already durably proven or if execution would cross a blocked authority boundary.

### F1 — exact C1 artifact deterministic proof package

Without modifying the exact C1 script:

- re-prove SHA-256 `84ab71aa5f126eb58ff70f34dd89d92c3d72cc3ea0335c9f3f9f07a522a757cd`;
- rerun `bash -n` and existing diff/secret checks;
- perform Codex static state-machine audit of preflight, stop order, copy, checksum/itemized verification, systemd drop-in handling, restart ordering, health verification, signal handling and rollback;
- if available without new installs/privilege, run relevant shell/static diagnostics (for example existing shellcheck tooling); absence of optional tooling is not itself a stop;
- build or run a **separate non-production deterministic test harness** for fail-closed branches where practical, without changing the reviewed-target script or requiring privileged production mutation;
- verify that any test harness cannot alter live Docker/containerd state;
- publish a compact proof matrix. This does not replace independent review.

If deterministic proof discovers a real defect, the C1 artifact may be revised only within the already-approved bounded engineering scope using Gemini 3.8 Flash as writer and Codex as integrator. Any revised artifact gets a new SHA and remains blocked from installation until an authorized independent reviewer can review that exact new SHA.

### F2 — live read-only infrastructure revalidation

Using non-secret, read-only probes only:

- Docker root still `/mnt/ssd-tmp/slate-tools/docker-data`;
- containerd root/state/socket topology unchanged;
- Slate/MySQL healthy and restart-stable;
- local/public health 200;
- current/rollback/MySQL images and expected network visible;
- old `/var/lib/docker` and `/var/lib/containerd` preserved;
- target containerd NVMe path collision state;
- root and NVMe free space;
- 150 GB reserve projection;
- Deluge services/paths unchanged;
- no provider calls and no firmware mutation.

A read-only revalidation PASS is a checkpoint, not a terminal state.

### F3 — M2 exact-candidate offline readiness

Without loading the image into production containerd:

- re-hash `/mnt/ssd-tmp/slate-tools/m2-ux-candidate.tar` read-only and require `cf47b8c4bb6aec65161d1c54e766bbf62f9a4ada1430fb5b86766231d7074865`;
- reconcile expected image identity `sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4` against existing durable artifact metadata/manifests where this can be done without importing into containerd;
- prepare the exact post-migration C3 load/deploy command sequence and health/rollback gates in a report or script that is **not executed**;
- verify current application rollback identity remains available;
- do not create another candidate or change exact source/image pins.

### F4 — M3 firmware preflight readiness only

Without flashing or changing device state:

- reconcile exact firmware app artifact SHA-256 `edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb`;
- reconcile app-only offset `0x10000`, target ESP32-S3 and expected 16 MB geometry from durable evidence;
- validate the exact app-only flash command/rollback command syntactically and document them;
- if device identity can be read non-destructively from the already-connected device without new human action, revalidate it; otherwise classify that subnode `WAITING_HUMAN` and continue scanning;
- do not flash.

### F5 — M4 physical UX observability preparation only

Without starting a provider/private microphone session:

- prepare sanitized observer/timing collection for the already-authorized later combined EN/JA session;
- validate marker capture logic for `DEVICE_LISTEN_START`, `FIRST_DEVICE_AUDIO_SENT`, `BACKEND_FIRST_AUDIO_RECEIVED`, `PROVIDER_FIRST_OUTPUT_EVENT`, `PROVIDER_FIRST_AUDIO_EVENT`, `BACKEND_FIRST_AUDIO_TO_DEVICE`, `DEVICE_FIRST_AUDIO_PLAYBACK`, `TRANSCRIPT_FINALIZED`, `UI_RENDER_REQUEST`, and `EPD_REFRESH_COMPLETE_IF_AVAILABLE` using deterministic/local evidence only;
- prepare the one combined EN/JA operator instruction but do not ask the user to perform it until M2 and M3 pass;
- do not make provider calls, record raw audio, retain raw provider payloads, invoke tools/search/calendar/outlook, or consume the authorized physical session early.

### F6 — control-plane cleanup / observability

Update campaign state so the asynchronous control plane is explicit:

```text
instruction_sha=<this directive commit SHA after fetch>
last_instruction_sha_seen_by_controller=<same once consumed>
controller=codex
status=<RUNNING or WAITING_HUMAN only after frontier exhaustion>
current_campaign=8D1M_G_UX_FIX_DEPLOY_AND_PHYSICAL_RETEST
current_stage=<actual frontier node>
ready_node_count=<int>
readonly_ready_node_count=<int>
waiting_human_count=<int>
externally_blocked_count=<int>
next_action=<exact next action>
human_action_required=<true|false>
human_action_reason=<reason-or-null>
```

Do not rewrite historical state destructively; append/current-active checkpoint format is acceptable.

## Reviewer-decision packet — only after frontier exhaustion

If and only if all authorized READY/READONLY_READY work above is complete and the independent-review node is the sole mandatory blocker, prepare one compressed human decision packet and then stop under terminal condition T2/T3/T4 as appropriate.

The packet must contain:

```text
DECISION_REQUIRED=INDEPENDENT_REVIEW_POLICY_FOR_C1
EXACT_ARTIFACT=scripts/slate-m2-containerd-rootstep-v1-nvme-reversible.sh
EXACT_SHA256=84ab71aa5f126eb58ff70f34dd89d92c3d72cc3ea0335c9f3f9f07a522a757cd
GROK46_AUTH=PASS
GROK46_TRANSPORTS_EXHAUSTED=YES
PRODUCTION_MUTATION=NO
RECOMMENDED_OPTION=<specific reviewer substitution proposal using an already-existing authorized transport/profile if one is demonstrably available>
ALTERNATIVE_1=EXPLICIT_INDEPENDENT_REVIEW_WAIVER_WITH_CODEX_DETERMINISTIC_PROOF_PACKAGE
ALTERNATIVE_2=WAIT_FOR_GROK46_TRANSPORT_RECOVERY
CONSEQUENCES=<brief exact consequences>
APPROVAL_TEXT=<exact minimal text user can send>
REJECTION_TEXT=<exact minimal text user can send>
```

Preferred recommendation if still demonstrably available from existing repo/orchestration state: propose the historically used independent `GLM-5.3-Flash` reviewer through the existing `zai-glm53-reviewer` profile **as a human-approved substitution**, not as an automatic fallback. Before recommending it, verify only availability/auth state without exposing credentials and confirm it can receive the exact artifact. Do not invoke the substitute review until human approval.

Do not recommend waiver as the first choice for a root-level containerd migration when an independent reviewer substitution is safely available.

## Controller loop

After every child result:

```text
PERSIST
-> UPDATE STATE
-> FETCH/RE-READ CONTROL PLANE
-> RECONCILE
-> RECOMPUTE FRONTIER
-> CONTINUE HIGHEST-PRIORITY READY / READONLY_READY NODE
```

Normal PASS, ordinary test failure, bounded repair, report publication, push, read-only revalidation, or completion of F1-F6 is non-terminal while another authorized node is READY.

Do not ask `Should I continue?` at an ordinary checkpoint.

## Terminal-exit contract

Codex may exit only when one of these is actually true:

1. approved objective complete and no READY/READONLY_READY work remains;
2. genuine human decision gate reached **after** full frontier exhaustion and the compressed packet is ready;
3. authorized frontier exhausted;
4. all mandatory remaining work depends on unavailable external condition/provider after bounded recovery and no alternate READY work remains;
5. continuing would violate explicit safety/security/authority rules.

Before exit, persist and push the frontier counts and exact terminal reason.

PR #2 remains open/draft/unmerged. Reports are checkpoints, not stops.

## Frontier execution checkpoint — F1 deterministic proof and bounded correction

The exact V1 artifact was revalidated without modification before the static
audit. The independent Grok node remains externally blocked and was not
retried. A separate temporary harness used synthetic source/destination trees
only; it did not invoke Docker, containerd, systemd, SSH, production health
endpoints, credentials, or provider sessions.

```text
INSTRUCTION_SHA=56d641167120ebbb814344bf57c8b9a54c15328d9
F1_V1_SHA256=84ab71aa5f126eb58ff70f34dd89d92c3d72cc3ea0335c9f3f9f07a522a757cd
F1_V1_BASH_N=PASS
F1_V1_DIFF_CHECK=PASS
F1_V1_SECRET_SCAN=PASS
F1_STATIC_AUDIT=COMPLETE
F1_OPTIONAL_SHELLCHECK=NOT_INSTALLED
F1_HARNESS_LIVE_STATE_TOUCHED=NO
F1_HARNESS_PREFIX_BUG=REPRODUCED
F1_HARNESS_CORRECTED_COMPARISON=PASS
```

Static audit confirmed the V1 preflight, stop order, faithful copy,
checksum/itemized dry-run, drop-in, startup, health/restart, reserve,
signal, and rollback gates. It also found one real bounded defect: the
source metrics were emitted with `SRC_` labels and destination metrics with
`DST_` labels before a byte-for-byte diff, making every equivalent copy fail.

The bounded V2 correction keeps V1 intact and changes only both metric call
sites to use the same `TREE` label. The temporary Gemini 3.8 writer request
returned no patch output; Codex applied only this mechanically proven,
two-line correction as integrator. V2 receives a new identity and remains
blocked from installation pending exact independent review.

```text
F1_V2_SCRIPT=scripts/slate-m2-containerd-rootstep-v2-nvme-reversible.sh
F1_V2_SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
F1_V2_SCOPE=METRIC_LABEL_NORMALIZATION_ONLY
F1_V2_GROK_REVIEW=REQUIRED
F1_SAFE_FOR_MANUAL_SUDO=NO
PRODUCTION_MUTATION=NO
PROVIDER_CALLS=0
```

## Frontier execution checkpoint — F2 live read-only revalidation

The Orange Pi was queried through the existing SSH alias using non-secret
read-only commands only. No sudo, service restart, Docker/containerd command,
image load, credential access, provider call, or firmware operation occurred.

```text
F2_STATUS=PASS_READONLY
HOST=orangepi5
DOCKER_SERVICE=active
CONTAINERD_SERVICE=active
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
DOCKER_DRIVER=overlayfs
SLATE=running/healthy/restarts=0
MYSQL=running/healthy/restarts=0
LOCAL_HEALTH_HTTP=200
PUBLIC_HEALTH_HTTP=200
CURRENT_IMAGE=sha256:5ef126ff62ccf466c0795c1c76b4bdf0a7b9657184eab1f09b7435deeedbab6d
MYSQL_IMAGE=sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb
ROLLBACK_IMAGE_VISIBLE=YES
EXPECTED_NETWORK_VISIBLE=YES
ORIGINAL_DOCKER_ROOT_PRESENT=YES
ORIGINAL_CONTAINERD_ROOT_PRESENT=YES
CONTAINERD_DESTINATION_COLLISION=NO
CONTAINERD_STATE_SOCKET=/run/containerd/containerd.sock
CONTAINERD_ROOT_CONFIG=/var/lib/containerd
CONTAINERD_STATE_CONFIG=/run/containerd
NVME_FS=ext4
NVME_MOUNT=rw
ROOT_FREE_BYTES=276844544
NVME_FREE_BYTES=177880481792
NVME_RESERVE_150GB=PASS
DELUGED=active
DELUGE_WEB=active
DELUGE_PATHS_PRESENT=YES
PRODUCTION_MUTATION=NO
```

## Frontier execution checkpoint — F3 exact-candidate offline readiness

The exact durable tar and image identity were verified on the Orange Pi with
read-only commands. The candidate was not imported into production containerd
or Docker. The post-containerd C3 sequence is prepared below and was not
executed:

```text
F3_STATUS=PASS_OFFLINE_READY
F3_TAR=/mnt/ssd-tmp/slate-tools/m2-ux-candidate.tar
F3_TAR_BYTES=1183010304
F3_TAR_SHA256=cf47b8c4bb6aec65161d1c54e766bbf62f9a4ada1430fb5b86766231d7074865
F3_EXPECTED_IMAGE=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
F3_CANDIDATE_REGISTERED=NO
F3_ROLLBACK_IMAGE_VISIBLE=YES
F3_LOAD_EXECUTED=NO
F3_PRODUCTION_MUTATION=NO
```

Deferred exact C3 sequence, to run only after a reviewed root migration PASS:

```text
1. sha256sum /mnt/ssd-tmp/slate-tools/m2-ux-candidate.tar and require the pinned SHA above.
2. docker load --input /mnt/ssd-tmp/slate-tools/m2-ux-candidate.tar.
3. docker image inspect the resulting image and require the pinned image ID above.
4. preserve/tag the current production image as the immediate application rollback.
5. run the existing production compose/deployment operation for Slate only, with MySQL, volumes, network, public routing, protected read-only credential mount, Gemini 2.5 configuration, and private Node bridge unchanged.
6. run provider-disabled deterministic checks before any provider-dependent action.
7. require Slate/MySQL running and healthy, restart stability, local/public HTTP 200, expected network, and authenticated device polling/routing.
8. on any failure, restore the pinned application rollback image and re-prove all health gates; do not load another candidate.
```

No command in this sequence was executed during F3.

## Frontier execution checkpoint — F4 firmware preflight readiness

The firmware and device checks were read-only. `esptool chip-id` and
`esptool flash-id` confirmed the already-connected target; neither command
writes firmware. The write command was syntax-checked through the CLI help
path only and was not executed.

```text
F4_STATUS=PASS_PREFLIGHT_READY_FLASH_NOT_RUN
F4_APP=firmware/build/slate.bin
F4_APP_BYTES=2502640
F4_APP_SHA256=edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb
F4_TARGET=ESP32-S3_REV_V0.2
F4_FLASH_SIZE=16MB
F4_FLASH_ID=MANUFACTURER_46_DEVICE_4018_QUAD
F4_SERIAL_PORT=/dev/cu.usbmodem31201
F4_APP_OFFSET=0x10000
F4_ROLLBACK_APP=/Users/ollama/NOTE4-backups/campaign8-physical-20260905/rollback-bca05819-app.bin
F4_ROLLBACK_APP_SHA256=61baf54af122f8188e75d30d07068d95679be21d378ba9740d4d33487983fbfa
F4_ROLLBACK_APP_MODE=600
F4_WRITE_COMMAND_SYNTAX=PASS
F4_ROLLBACK_COMMAND_SYNTAX=PASS
F4_FULL_ERASE=NO
F4_PARTITION_TABLE_WRITE=NO
F4_NVS_LITTLEFS_WRITE=NO
F4_PAIRING_SERVER_IDENTITY_RESET=NO
F4_DEVICE_WRITE=NO
F4_PROVIDER_CALLS=0
F4_WAITING_HUMAN=NO_FOR_PREFLIGHT;FLASH_REMAINS_GATED_BY_M2
```

Documented deferred commands (not executed):

```text
esptool --chip esp32s3 --port /dev/cu.usbmodem31201 --baud 115200 --before usb-reset --after no-reset write-flash --flash-mode dio --flash-freq 80m --flash-size 16MB 0x10000 firmware/build/slate.bin
esptool --chip esp32s3 --port /dev/cu.usbmodem31201 --baud 115200 --before usb-reset --after no-reset write-flash --flash-mode dio --flash-freq 80m --flash-size 16MB 0x10000 /Users/ollama/NOTE4-backups/campaign8-physical-20260905/rollback-bca05819-app.bin
```

## Frontier execution checkpoint — F5 M4 observability preparation

The timing observer was validated locally with synthetic sanitized events only.
The source and firmware marker coverage was checked without provider access,
microphone capture, device writes, SSH, or production mutation. The backend
trace emits one line per stage per voice session using only a stage name and
timestamp; no transcript, audio, provider payload, credential, or user data is
included.

```text
F5_STATUS=PASS_READONLY_OBSERVER_READY
F5_MARKER_SOURCE_COVERAGE=PASS
F5_SYNTHETIC_MARKER_CAPTURE=PASS
F5_DEDUPLICATION=PASS
F5_TIMING_PAYLOAD_SANITIZED=PASS
F5_RAW_AUDIO_RETAINED=NO
F5_RAW_TRANSCRIPT_RETAINED=NO
F5_PROVIDER_CALLS=0
F5_MICROPHONE_SESSION=NOT_STARTED
F5_PHYSICAL_ACTION=NOT_STARTED
```

Deferred combined operator instruction, not yet issued:

```text
After M2 and M3 PASS, run one bounded session: one short English turn, wait
for completion, then one short Japanese turn. Capture only the listed stage
markers and pass/fail UX observations. Do not retain audio or transcript text;
do not invoke Search, tools, Calendar, Outlook, or any additional provider
session. Verify one user bubble and one assistant bubble per logical turn,
normal audio, no vendor activation fallback, and green Slate/MySQL/local/public
health.
```

## Frontier execution checkpoint — F6 exhausted frontier and decision packet

The control plane was refreshed from the exact directive commit
`56d641167120ebbb814344bf57c8b9a54c15328d9`. F1 through F5 are complete or
durably staged. The V2 correction is the only artifact eligible for the next
review gate; it is not installed or executable in the production path.

The historically validated `zai-glm53-reviewer` route remains the preferred
human-approved substitution candidate, with historical `ZAI_AUTH=PASS`,
provider `ZAI`, and model `glm-5.3-flash`. No substitute review was invoked.
The local executable was not present in this controller environment, so this
is a proposal for human-approved orchestration recovery, not an availability
claim beyond the preserved authenticated evidence.

```text
F6_STATUS=FRONTIER_EXHAUSTED
INSTRUCTION_SHA=56d641167120ebbb814344bf57c8b9a54c15328d9
CURRENT_C1_ARTIFACT=scripts/slate-m2-containerd-rootstep-v2-nvme-reversible.sh
CURRENT_C1_ARTIFACT_SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=1
HUMAN_ACTION_REQUIRED=YES
TERMINAL_REASON=SOLE_C1_EXACT_INDEPENDENT_REVIEW_BLOCKED_AFTER_FRONTIER_EXHAUSTION
PRODUCTION_MUTATION=NO
PROVIDER_CALLS=0
PR2_OPEN_DRAFT_UNMERGED=YES
```

Compressed reviewer-policy decision packet:

```text
DECISION_REQUIRED=INDEPENDENT_REVIEW_POLICY_FOR_C1
EXACT_ARTIFACT=scripts/slate-m2-containerd-rootstep-v2-nvme-reversible.sh
EXACT_SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
PRIOR_V1_SHA256=84ab71aa5f126eb58ff70f34dd89d92c3d72cc3ea0335c9f3f9f07a522a757cd
GROK46_AUTH=PASS
GROK46_TRANSPORTS_EXHAUSTED=YES
PRODUCTION_MUTATION=NO
RECOMMENDED_OPTION=HUMAN_APPROVE_EXISTING_ZAI_GLM53_REVIEWER_IF_REESTABLISHED
RECOMMENDED_PROVIDER=ZAI
RECOMMENDED_MODEL=glm-5.3-flash
ALTERNATIVE_1=EXPLICIT_INDEPENDENT_REVIEW_WAIVER_WITH_CODEX_PROOF_PACKAGE
ALTERNATIVE_2=WAIT_FOR_GROK46_TRANSPORT_RECOVERY
CONSEQUENCES=No root-script install, sudo execution, containerd migration, C3 load, firmware flash, or M4 physical session until V2 receives an authorized exact independent review or explicit waiver.
APPROVAL_TEXT=Authorize one exact read-only zai-glm53-reviewer GLM-5.3-Flash review of scripts/slate-m2-containerd-rootstep-v2-nvme-reversible.sh at SHA 09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd; no reviewer substitution beyond this profile and no production/containerd/firmware/provider mutation.
REJECTION_TEXT=Keep C1 blocked; do not install or execute the unreviewed root script.
```

## Human-approved substitution attempt — exact profile unavailable

The human supplied `proceed`, which authorizes only the narrow substitution
defined above. The required non-secret availability check was completed
without reading any credential value or production environment:

```text
SUBSTITUTE_REVIEWER_PROFILE=zai-glm53-reviewer
SUBSTITUTE_PROVIDER=ZAI
SUBSTITUTE_MODEL=glm-5.3-flash
ZAI_REVIEWER_EXECUTABLE=NOT_FOUND
ZAI_AUTH_CHECK=NOT_PERFORMED_PROFILE_UNAVAILABLE
UNRELATED_LOCAL_GLM_WRAPPER=FOUND_NVIDIA_NIM_GLM52
UNRELATED_REVIEWER_INVOKED=NO
REVIEW_REQUEST_SENT=NO
NEW_CREDENTIAL=NO
PRODUCTION_MUTATION=NO
```

The local `glm` wrapper is explicitly not the authorized ZAI profile: it uses
an NVIDIA NIM endpoint and GLM-5.2. It was not invoked. No exact ZAI review
transport or approved orchestration endpoint is available in this controller
environment, so the narrow substitution cannot proceed without a new human
decision or re-establishment of the existing protected route. V2 remains
unreviewed, uninstalled, and unexecuted.

```text
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=1
HUMAN_ACTION_REQUIRED=YES
TERMINAL_REASON=AUTHORIZED_ZAI_GLM53_REVIEWER_PROFILE_UNAVAILABLE_NO_REVIEW_REQUEST_SENT
```
