# Campaign 8D1M-G — M2 C2 switch failure: Slate restart-growth recovery

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Operator result

The operator executed the prepared fail-closed command that atomically archived the prior C2 backup and then ran the unchanged exact AGY-reviewed V2 migration artifact:

```text
ssh -t note4-orangepi 'sudo sh -c '\''test ! -e /mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-containerd-stop-20260906 && mv -- /mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup /mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-containerd-stop-20260906 && exec /home/pi/slate-m2-containerd-rootstep-v2-nvme-reversible.sh'\'''
```

Observed result:

```text
M2_ROOT_STEP_V1 stage=preflight status=PASS
M2_ROOT_STEP_V1 stage=copy status=PASS
M2_ROOT_STEP_V1 rollback=PASS containerd_root=/var/lib/containerd docker_root=/mnt/ssd-tmp/slate-tools/docker-data health=PASS
M2_ROOT_STEP_V1 stage=switch status=FAIL class=SLATE_RESTART_GROWTH
```

## Immediate adjudication

```text
C2_RUNTIME_RESULT=FAIL_CLOSED_AFTER_COPY_DURING_SWITCH_VALIDATION
C2_FAILURE_CLASS=SLATE_RESTART_GROWTH
C2_COPY=PASS
C2_SWITCH=FAIL
ROLLBACK=PASS
ACTIVE_CONTAINERD_ROOT_AFTER_SCRIPT=/var/lib/containerd
DOCKER_ROOT_AFTER_SCRIPT=/mnt/ssd-tmp/slate-tools/docker-data
PRODUCTION_HEALTH_AFTER_SCRIPT=PASS_BY_ROLLBACK_GATE
BLIND_RERUN=NO
DELETE_FAILED_DESTINATION=NO
DELETE_BACKUP=NO
```

The successful rollback is strong evidence that production returned to the original root and passed V2's own health gate. Codex must independently revalidate the live state before any new mutation.

## Why this needs attribution before repair

V2 captures Slate/MySQL `RestartCount` before the planned Docker/containerd maintenance stop. Its common health gate then requires the post-start counts to remain less than or equal to those pre-maintenance values:

```bash
(( slate_restarts <= slate_restart_limit )) || { failure_class=SLATE_RESTART_GROWTH; return 1; }
(( mysql_restarts <= mysql_restart_limit )) || { failure_class=MYSQL_RESTART_GROWTH; return 1; }
```

The candidate-root switch necessarily stops and starts containerd and Docker. A one-time restart-count increment caused by that deliberate daemon lifecycle may therefore be expected on this topology, but that is not yet proven. It is also possible that Slate genuinely restarted because of an application/container/runtime problem under the copied containerd root. The gate must not be weakened until the evidence distinguishes those cases.

## G0 — read-only runtime attribution

Codex must reconcile to the current remote head, ingest the operator result, and perform only non-secret/read-only checks first.

### G0.1 Independently verify healthy rollback

Verify at minimum:

- containerd and Docker active;
- active containerd root is `/var/lib/containerd` and state remains `/run/containerd`;
- the temporary containerd service drop-in is absent;
- Docker root remains `/mnt/ssd-tmp/slate-tools/docker-data` with `overlayfs`;
- Slate and MySQL are running/healthy;
- local and public health are HTTP 200;
- current and rollback application images, MySQL image, and expected network are visible;
- old roots remain present;
- NVMe free space remains at or above the activated 150 GB floor;
- Deluge services/paths are unchanged;
- provider calls remain zero.

### G0.2 Preserve and classify artifacts from this failed switch

The switch attempt completed `stage=copy status=PASS`, so the following paths may now exist and must not be removed blindly:

```text
FAILED_SWITCH_DEST=/mnt/ssd-tmp/slate-tools/containerd-root
FAILED_SWITCH_BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup
PRIOR_ARCHIVED_BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-containerd-stop-20260906
```

Record type/owner/mode/device/size/mtime metadata only. Do not print application payloads, credentials, private data, or arbitrary container contents.

Confirm rollback removed the temporary drop-in but intentionally preserved both the copied destination and current attempt backup. Do not delete, truncate, overwrite, or reuse either path until the next artifact strategy is proven.

### G0.3 Determine exactly why `SLATE_RESTART_GROWTH` occurred

Use only sanitized metadata/journals and current Docker inspection. Establish:

- Slate restart count immediately before the switch if recoverable from report/script evidence;
- Slate restart count observed under the candidate root if recoverable from Docker/systemd journal evidence;
- current post-rollback Slate restart count;
- the equivalent MySQL counts;
- `RestartPolicy.Name` and retry settings for Slate and MySQL;
- sanitized container state metadata (`Status`, `ExitCode`, `OOMKilled`, `Error`, `StartedAt`, `FinishedAt`, health status) without application/private payloads;
- sanitized `docker.service`, `containerd.service`, and relevant container-runtime journal ordering around the candidate-root start and rollback;
- whether Slate had exactly one controlled restart associated with the planned daemon transition, or repeated/unexpected restart growth;
- whether MySQL behaved differently and why;
- whether the systemd-only observer remained non-activating and captured the service transition without Docker API access.

Do not consume a provider session, microphone session, or firmware action during attribution.

## G1 — decision after evidence

### Case A — one controlled restart is proven and no instability is observed

If exact evidence proves that `SLATE_RESTART_GROWTH` was a single bounded restart caused by the intentional Docker/containerd lifecycle, while Slate became healthy and showed no subsequent restart growth, treat the current V2 restart gate as too strict for the planned maintenance transition.

Perform one bounded C1 revision to V3. Keep the migration/copy/root-switch behavior otherwise unchanged. The revised validation must:

1. still capture pre-maintenance restart counts;
2. allow only the minimum restart delta proven necessary by the live evidence for this planned daemon transition;
3. never accept an unbounded/repeated restart count;
4. after first healthy startup, capture a post-start restart baseline and require a bounded stability window with **zero further restart growth**;
5. retain healthy Slate/MySQL checks, local/public HTTP checks, exact Docker root/storage-driver checks, containerd-root checks, reserve checks, old-root preservation, rollback, and all no-delete/Deluge protections;
6. retain fail-closed rollback on any health/stability failure;
7. strongly consider explicitly quiescing `docker.socket` during the maintenance stop window if live systemd topology supports preserving/restoring its prior state safely, because the previous C2 incident proved socket activation can interfere. Do not add this merely by assumption; validate service topology and rollback semantics first.

Routing remains:

```text
CONTROLLER=CODEX
WRITER=GEMINI_3_8_FLASH_WHERE_USEFUL
INDEPENDENT_REVIEWER=AGY_GEMINI_3_7_FLASH_HIGH
```

A changed root script must receive a new exact SHA, deterministic validation, secret scan, and a fresh exact independent read-only review. The V2 review verdict does not apply to changed bytes.

### Case B — genuine crash/restart instability is proven

If Slate restarted more than the bounded intentional transition, failed before becoming durably healthy, OOMed, crashed, or otherwise behaved differently under the copied containerd root, **do not weaken the restart gate**.

Instead isolate the exact runtime incompatibility read-only where possible. Preserve the failed destination as evidence. Any new production/storage mutation beyond a bounded correction already covered by the active campaign must stop at the appropriate authority boundary.

## G2 — prepare the next root boundary without deleting evidence

If Case A produces an exact reviewed V3 and the live state is healthy, prepare one combined fail-closed manual command only after proving exact unused archival destinations.

The current failed-switch artifacts should be preserved by same-filesystem atomic rename, not deletion. Preferred prefixes:

```text
/mnt/ssd-tmp/slate-tools/containerd-root.failed-slate-restart-growth-20260906
/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-slate-restart-growth-20260906
```

If either exists, choose a deterministic unique suffix and record it. Recheck the 150 GB NVMe reserve after accounting for a fresh copy. Do not archive by recursive copy.

Bundle the required same-filesystem renames and execution of the exact reviewed V3 into one `ssh -t ... sudo ...` operator command using `test ! -e ... && mv ... && ... && exec ...` fail-closed sequencing. Do not execute it automatically.

## Continuation after migration PASS

After a future migration PASS, independently verify the active containerd root, Docker root, old-root preservation, health, restart stability, reserve, Deluge non-mutation and observer result, then continue automatically through the already-authorized long-run chain:

```text
C3 exact candidate load/deploy
-> M3 exact app-only firmware flash
-> M4 bounded combined EN/JA physical UX retest
```

Reports/checkpoints are not stops. PR #2 remains open/draft/unmerged. No merge/release is authorized.

## G0 read-only attribution — genuine candidate-root restart instability

Reconciled remote head before G0:

```text
REMOTE_HEAD=ba2422ebeeef715c83a01a4f2414297ff91f4bb5
INSTRUCTION_SHA=ba2422ebeeef715c83a01a4f2414297ff91f4bb5
V2_RERUN=NO
PROVIDER_CALLS=0
```

The V2 operator result was ingested exactly as reported:

```text
M2_ROOT_STEP_V1 stage=preflight status=PASS
M2_ROOT_STEP_V1 stage=copy status=PASS
M2_ROOT_STEP_V1 rollback=PASS containerd_root=/var/lib/containerd docker_root=/mnt/ssd-tmp/slate-tools/docker-data health=PASS
M2_ROOT_STEP_V1 stage=switch status=FAIL class=SLATE_RESTART_GROWTH
```

Rollback and preservation checks pass. Both the failed candidate destination
and the current attempt backup remain present and root-owned; the prior backup
archive also remains present. No path was deleted or overwritten.

```text
FAILED_SWITCH_DEST=/mnt/ssd-tmp/slate-tools/containerd-root
FAILED_SWITCH_DEST_PRESENT=YES
FAILED_SWITCH_DEST_OWNER_MODE=0:0_700
FAILED_SWITCH_BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup
FAILED_SWITCH_BACKUP_PRESENT=YES
FAILED_SWITCH_BACKUP_OWNER_MODE=0:0_700
PRIOR_ARCHIVED_BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-containerd-stop-20260906
PRIOR_ARCHIVED_BACKUP_PRESENT=YES
DROPIN_ABSENT=YES
ACTIVE_CONTAINERD_ROOT=/var/lib/containerd
ACTIVE_CONTAINERD_STATE=/run/containerd
FAILED_ARTIFACTS_DELETED=NO
```

The live rollback is healthy and unchanged:

```text
CONTAINERD_ACTIVE=active
DOCKER_ACTIVE=active
DOCKER_SOCKET_ACTIVE=active
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
DOCKER_DRIVER=overlayfs
SLATE=running/healthy/restarts=0
MYSQL=running/healthy/restarts=0
LOCAL_HEALTH=200
PUBLIC_HEALTH=200
CURRENT_IMAGE_VISIBLE=YES
ROLLBACK_IMAGE_VISIBLE=YES
MYSQL_IMAGE_VISIBLE=YES
EXPECTED_NETWORK=YES
NVME_FREE_BYTES=164580646912
NVME_RESERVE_150GB=PASS
DELUGE_SERVICES=active/running/NRestarts=0
DELUGE_PATHS_PRESENT=YES
DELUGE_MUTATION=NOT_OBSERVED
PRODUCTION_MUTATION=NO
```

Both containers use `unless-stopped` with `MaximumRetryCount=0`; this is the
existing policy and was not changed. Current post-rollback state has no OOM,
error, or restart-count growth. The candidate-run Docker journal provides the
decisive historical evidence:

```text
CANDIDATE_DOCKER_START=2026-09-06T13:25:57+08:00
CANDIDATE_DOCKER_LOADING_CONTAINERS=13:25:57_to_13:26:00
SLATE_TASK_DELETE_EVENTS=13:26:02,13:26:05,13:26:08,13:26:10,13:26:13
SLATE_SHOULD_RESTART=2026-09-06T13:29:01+08:00
SLATE_DAEMON_SHUTTING_DOWN=TRUE
SLATE_RESTART_COUNT_OBSERVED=5
SLATE_EXEC_DURATION=2m45.99761459s
SLATE_RESTART_RESULT=RESTART_CANCELED_DURING_ROLLBACK
MYSQL_SHOULD_RESTART=2026-09-06T13:29:05+08:00
MYSQL_DAEMON_SHUTTING_DOWN=TRUE
MYSQL_RESTART_COUNT_OBSERVED=0
MYSQL_RESTART_RESULT=RESTART_CANCELED_DURING_ROLLBACK
```

The systemd ordering was one planned stop/start lifecycle with no repeated
daemon start failures: Docker and containerd stopped cleanly at 13:29:05,
containerd started at 13:29:06, and Docker started at 13:29:06. The repeated
Slate task-delete/restart evidence occurred while the candidate containerd
root was active, before rollback. MySQL did not exhibit the loop.

The systemd-only observer is statically non-activating: its exact SHA remains
`c8cc1be296b18383af4a85550cf84310f47da7a0e3c1fcc330ae5f09ab99d59a`, and it
contains no Docker CLI, HTTP client, Docker socket path, or `DOCKER_HOST`
reference. Its prior foreground run ended with a sanitized timeout and did not
touch the Docker API. It was not reintroduced as a Docker-API observer.

Adjudication:

```text
G0_CASE=CASE_B_GENUINE_CRASH_RESTART_INSTABILITY
G0_SLATE_RESTART_PATTERN=REPEATED_UNEXPECTED_RESTARTS
G0_SLATE_RESTART_COUNT=5
G0_MYSQL_RESTART_COUNT=0
G0_RESTART_GATE_WEAKENING=NO
V3_CREATED=NO
V3_REVIEW=NOT_APPLICABLE
C2_RUNTIME_DEFECT=SLATE_TASK_RESTART_LOOP_UNDER_CANDIDATE_CONTAINERD_ROOT
C2_FAILURE_CLASS=SLATE_RESTART_GROWTH
ROLLBACK=PASS
READY_FOR_V3=NO
HUMAN_ACTION_REQUIRED=YES_RUNTIME_DEFECT_DECISION
```

The exact lower-level application exit cause is not exposed by the sanitized
daemon evidence and is not inferred from private application logs. The failed
candidate destination and both backups are preserved as forensic artifacts.
No further root attempt, candidate load, firmware action, provider session,
or production mutation is authorized by this result.

## V5 runtime-defect repair and reviewed root-boundary preparation

Campaign V5 accepted the G0 evidence as a genuine Slate-only restart loop
under the copied containerd root: the candidate reused persistent state with
the live ephemeral runtime state. The repair remains fail-closed and does not
weaken the restart gate. It isolates candidate state at `/run/containerd-v5`,
quiesces `docker.socket` before the stop window, switches both containerd and
Docker to the candidate endpoint, recreates Slate exactly once after the
existing MySQL container is observable and healthy, and requires a continuous
60-second healthy window with Slate restart count zero. MySQL recreation and
restart growth remain hard failures. The checksum/itemized rsync dry-run is a
hard pre-switch gate and rollback removes only the newly-created service
drop-ins and exact candidate runtime state.

```text
V5_SCRIPT=scripts/slate-m2-containerd-rootstep-v5-isolated-state-slate-recreate.sh
V5_LOCAL_SHA256=5deee30cb8c9c8cd7605a430e5717d1f9358ac5e3f9519b53f89bb4c8b608acd
V5_LOCAL_BASH_N=PASS
V5_STATIC_SAFETY=PASS
V5_SECRET_SCAN=PASS_NO_SECRET_PATTERN
V2_REVIEWED_SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
V2_UNCHANGED=YES
V5_EXACT_REVIEWER=AGY_GEMINI_3_7_FLASH_HIGH
V5_EXACT_REVIEW_JOB=review-mtpf7j3rd
V5_INITIAL_REVIEW=REQUEST_CHANGES_TRANSIENT_INSPECT_POLLING
V5_CORRECTION_WRITER=GEMINI_3_8_FLASH
V5_CORRECTION=TRANSIENT_MYSQL_AND_SLATE_INSPECT_OUTPUT_POLLS_WITHIN_TIMEOUT
V5_REVIEW_REVALIDATION_JOB=review-mtpfhwdw0
V5_REVIEW_VERDICT=PASS
V5_REVIEW_P0=0
V5_REVIEW_P1=0
V5_REVIEW_P2=0
V5_REVIEW_P3=0
V5_REVIEW_FINDINGS=NONE_NIT_ONLY
V5_REMOTE_PATH=/home/pi/slate-m2-containerd-rootstep-v5-isolated-state-slate-recreate.sh
V5_REMOTE_SHA256=5deee30cb8c9c8cd7605a430e5717d1f9358ac5e3f9519b53f89bb4c8b608acd
V5_REMOTE_TYPE=regular_file
V5_REMOTE_MODE=700
V5_REMOTE_BASH_N=PASS
V5_LIVE_PREFLIGHT=PASS_READONLY
ACTIVE_CONTAINERD_ROOT=/var/lib/containerd
ACTIVE_CONTAINERD_STATE=/run/containerd
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
DOCKER_DRIVER=overlayfs
SLATE=running/healthy/restarts=0
MYSQL=running/healthy/restarts=0
LOCAL_PUBLIC_HEALTH=HTTP_200
EXPECTED_IMAGES_NETWORK=YES
ORIGINAL_ROOTS_PRESENT=YES
FAILED_DERIVED_ROOT_PRESENT=YES
FAILED_BACKUP_PRESENT=YES
V5_DROPINS_ABSENT=YES
V5_CANDIDATE_STATE_ABSENT=YES
NVME_FREE_BYTES=170550177792
NVME_RESERVE_150GB=PASS
DELUGE_ACTIVE_RUNNING_RESTARTS_ZERO=YES
DELUGE_PATHS_PRESENT=YES
PROTECTED_SECRET_MOUNT_DESTINATION=/run/secrets/gemini_api_key
PROTECTED_SECRET_MOUNT_RW=false
PRODUCTION_MUTATION=NO
PROVIDER_CALLS=0
```

The exact same-filesystem archival destinations were read-only verified
absent and are ready for the single manual root transaction:

```text
ARCHIVE_ROOT=/mnt/ssd-tmp/slate-tools/containerd-root.failed-slate-restart-growth-20260906
ARCHIVE_BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-slate-restart-growth-20260906
V5_BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v5-backup
CANDIDATE_STATE=/run/containerd-v5
ARCHIVE_DESTINATIONS=ABSENT
```

The first non-root reserve calculation could not read the root-owned
`/var/lib/containerd` byte count without sudo; this is intentionally left to
the reviewed V5 preflight, which fails closed if its exact reserve calculation
does not pass. The NVMe free-space snapshot was independently
`170550177792` bytes before the handoff. No credential value, production
`.env`, provider payload, audio or private data was read.

The systemd-only observer was re-armed at
`/tmp/slate-m2-v5-systemd-observer.fyrlGx` in foreground control session
`22262`; its exact SHA is
`c8cc1be296b18383af4a85550cf84310f47da7a0e3c1fcc330ae5f09ab99d59a`. It uses
only systemd state queries and cannot access the Docker API, HTTP endpoints or
Docker socket. It will persist a sanitized transition result independently.

```text
R4_STATUS=PASS_REVIEWED_V5_ROOT_BOUNDARY_READY
R4_PROVIDER_CALLS=0
R4_PRODUCTION_MUTATION=NO
R4_READY_NODE_COUNT=0
R4_READONLY_READY_NODE_COUNT=0
R4_WAITING_HUMAN_COUNT=1
R4_HUMAN_ACTION_REQUIRED=YES
R4_HUMAN_ACTION_REASON=ONE_MANUAL_SUDO_ROOT_TRANSACTION
R4_TERMINAL_REASON=MANUAL_SUDO_BOUNDARY
R4_NEXT_ACTION=INGEST_V5_ROOT_RESULT_THEN_CONTINUE_R5_TO_R10
```

## V5 execution packet reissued from the latest remote checkpoint

Origin was fetched and fast-forward reconciled to
`d8f5f7d0c4936a6abd382723ddc5f737efa16e7b`. The authoritative execution
packet confirms that the single password-bearing command below is the only
current human boundary. It verifies the exact remote V5 SHA before preserving
both failed derived artifacts by same-filesystem atomic rename and executing
V5. No separate cleanup, root, Docker, provider, firmware or production
command is authorized. The systemd-only observer remains active in its
foreground control session and production remains healthy and untouched.

```text
EXECUTION_DIRECTIVE_SHA=d8f5f7d0c4936a6abd382723ddc5f737efa16e7b
EXECUTION_COMMAND=EXACT_DIRECTIVE_COMMAND_WITH_SHA_GUARD
V5_SHA256=5deee30cb8c9c8cd7605a430e5717d1f9358ac5e3f9519b53f89bb4c8b608acd
PROVIDER_CALLS=0
PRODUCTION_MUTATION=NO
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=ONE_PASSWORD_BEARING_SUDO_ROOT_TRANSACTION
TERMINAL_REASON=MANUAL_SUDO_BOUNDARY
NEXT_ACTION=INGEST_PASTED_V5_OUTPUT_AND_AUTO_RESUME_R5_TO_R10
```

## Quoting-failure reconciliation — corrected handoff ready

Origin was fetched and reconciled to
`d8f5f7d0c4936a6abd382723ddc5f737efa16e7b`. The operator-reported
`sh: 1: 1: parameter not set` occurred in the wrapper SHA guard before either
archive rename or V5 execution. The required short read-only reconciliation
passed:

```text
V5_EXECUTED=NO_FROM_PRIOR_WRAPPER
ACTIVE_CONTAINERD_ROOT=/var/lib/containerd
ACTIVE_CONTAINERD_STATE=/run/containerd
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
SLATE=running/healthy/restarts=0
MYSQL=running/healthy/restarts=0
LOCAL_HEALTH=200
PUBLIC_HEALTH=200
ROOT_PRESENT=YES
BAK_PRESENT=YES
ROOT_ARCHIVE_ABSENT=YES
BAK_ARCHIVE_ABSENT=YES
V5_BACKUP_ABSENT=YES
CANDIDATE_STATE_ABSENT=YES
V5_REMOTE_SHA256=5deee30cb8c9c8cd7605a430e5717d1f9358ac5e3f9519b53f89bb4c8b608acd
NVME_FREE_BYTES=170018529280
NVME_RESERVE_150GB=PASS
DELUGE_SERVICES=active/running/NRestarts=0
DELUGE_PATHS_PRESENT=YES
PRODUCTION_MUTATION=NO
PROVIDER_CALLS=0
```

The corrected handoff changes only the wrapper SHA guard to
`sha256sum | grep -q` and removes the nested `awk`/`$1` expansion. V5 bytes,
its exact review, and all protection gates remain unchanged.

```text
CORRECTION_INSTRUCTION_SHA=f927c50d9edbb95dec96f05680dd6cfe9977d0f8
CORRECTED_COMMAND_READY=YES
NEXT_ACTION=INGEST_PASTED_CORRECTED_V5_OUTPUT_AND_AUTO_RESUME_R5_TO_R10
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=ONE_PASSWORD_BEARING_SUDO_ROOT_TRANSACTION
TERMINAL_REASON=MANUAL_SUDO_BOUNDARY
```

## Final R8 reconciliation before the single root transaction

The live remote state was fetched and reconciled again at the current PR
head. PR #2 remains open, draft, and unmerged. The exact V6 remote artifact
still matches the reviewed SHA, is a regular mode-700 file, and passes
`bash -n`. Read-only production checks remain green: active containerd uses
`/var/lib/containerd` with state `/run/containerd`, Docker uses the NVMe
data-root and overlayfs, Slate and `slate-note4-mysql` are healthy with zero
restarts, local and public health are HTTP 200, both V6 drop-ins and
`/run/containerd-v5` are absent, both V5 failure artifacts remain present,
both selected archive destinations remain absent, Deluge is active with zero
restarts, and the NVMe reserve remains above 150 GiB.

```text
CURRENT_HEAD=4cd8a55eda44cb27d2239567e0142cda3f893887
R8_FINAL_LIVE_RECONCILIATION=PASS
R8_REMOTE_SHA256=c2e08d435d5509b6081013cf9780f983476876b36e1ad68b9b40abd7ac0b879a
R8_OBSERVER_NONACTIVATING=YES
R8_OBSERVER_RESULT=ARMED_NOT_TERMINAL
R8_PROVIDER_CALLS=0
R8_PRODUCTION_MUTATION=NO
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=0
CURRENT_BLOCKED_NODE=NONE
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=ONE_GUARDED_PASSWORD_BEARING_SUDO_ROOT_TRANSACTION
TERMINAL_REASON=MANUAL_SUDO_BOUNDARY
NEXT_ACTION=INGEST_COMPLETE_V6_OPERATOR_RESULT_AND_CONTINUE_R9
```

## R9 post-root verification and C3 frontier

The pasted V6 child result was ingested as a terminal PASS. Independent
read-only verification confirmed the exact systemd process topology:

```text
R9_STATUS=PASS_CONTAINERD_NVME_CANDIDATE_ACTIVE
CONTAINERD_EXEC=/usr/bin/containerd --root /mnt/ssd-tmp/slate-tools/containerd-root --state /run/containerd-v5 --address /run/containerd-v5/containerd.sock
CONTAINERD_ACTIVE=YES
CANDIDATE_SOCKET_LISTENING=YES
DOCKER_EXEC=/usr/bin/dockerd -H fd:// --containerd=/run/containerd-v5/containerd.sock
DOCKER_ACTIVE=YES
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
DOCKER_DRIVER=overlayfs
SLATE=running/healthy/restarts_0
MYSQL=running/healthy/restarts_0
MYSQL_IDENTITY=slate-note4-mysql
LOCAL_PUBLIC_HEALTH=HTTP_200
EXPECTED_IMAGES_NETWORK=PASS
ORIGINAL_ROOTS_PRESERVED=YES
ROLLBACK_ARCHIVES_PRESERVED=YES
NVME_RESERVE_BYTES=175311822848
NVME_RESERVE=PASS
DELUGE_UNCHANGED=YES
R9_STABILITY_WINDOW=PASS_60S_SCRIPT_PLUS_14M_LIVE
```

The first armed observer ended with `TIMEOUT_NO_TERMINAL_RESULT` because its
non-root `systemctl show` path did not expose ExecStart arguments. This was an
observer observability limitation, not a Docker/containerd failure. A fresh
one-shot observer using only `systemctl is-active`, process arguments and
`ss -xl` passed without Docker CLI, Docker socket access, HTTP calls, or
mutation:

```text
R9_SYSTEMD_PROCESS_SOCKET_OBSERVER=PASS
OBSERVER_NONACTIVATING=YES
CONTAINERD_ROOT=NVME_CANDIDATE
CONTAINERD_STATE=/run/containerd-v5
CANDIDATE_SOCKET=LISTENING
DOCKER_ENDPOINT=/run/containerd-v5/containerd.sock
```

The containerd configuration-file dump still shows its baseline file values;
the authoritative active CLI override is the systemd ExecStart above. Docker
is demonstrably connected to that candidate endpoint and both containers are
healthy. No provider call occurred. C3 may now load the already-qualified
exact ARM64 image from the preserved local tar:

```text
C3_STATUS=READY_EXACT_IMAGE_LOAD_PENDING
C3_SOURCE_SHA=aae1c1fefce5e6c4ca4dbc2cd4d50f44ed4863d3
C3_ARM64_IMAGE=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
C3_IMAGE_TAR=.m2-image-transfer.Fsbu9H/slate-ux-candidate.tar
C3_IMAGE_TAR_SHA256=cf47b8c4bb6aec65161d1c54e766bbf62f9a4ada1430fb5b86766231d7074865
C3_ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
```

## C3 first bounded deployment attempt — safe rollback and controller-gate defect

The exact image was loaded into the active NVMe-backed Docker store and
validated as ARM64 with the expected pinned OCI config digest. The first
Slate-only compose recreation was attempted with `--no-deps`; MySQL was not
recreated. The candidate gate returned failure, and the automatic rollback
restored the pre-UX production image. Read-only verification after rollback
passed: Slate and MySQL are healthy with zero restarts, local/public health
are HTTP 200, Docker/containerd are active, and the rollback image is
`sha256:5ef126ff...` as expected.

The exact failure class was a controller command defect, not a product/image
failure: the shell-embedded Docker Go-template secret-mount predicate was
quoted incorrectly and returned `template parsing error: unexpected "/" in
operand`. The same invalid predicate was used by the rollback gate, producing
a false rollback failure despite the rollback being healthy. No credential
value was read; the existing mount metadata independently shows RW=false.

```text
C3_FIRST_ATTEMPT=FAIL_SAFE_ROLLBACK
C3_FAILURE_CLASS=DEPLOYMENT_HEALTH_GATE_TEMPLATE_QUOTING
C3_ROLLBACK=PASS_PRODUCTION_HEALTH_RESTORED
C3_CANDIDATE_MANIFEST_ID=sha256:e2a116a21624043ccf3a2b1578de060637bb1e91206b2989eeef95bd98309871
C3_PINNED_CONFIG_SHA=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
C3_PROVIDER_DISABLED_ARTIFACT_CONTROL=PASS
C3_SOURCE_OR_IMAGE_CHANGED=NO
C3_MYSQL_RECREATED=NO
C3_PRODUCTION_HEALTH_AFTER_ROLLBACK=PASS
C3_NEXT_ACTION=SAME_ARTIFACT_CORRECTED_GATE_RETRY
```

The bounded correction replaces the fragile Go-template predicate with a
sanitized JSON mount metadata predicate. It does not alter V6, product
source, the exact image, the model, credentials, or reviewer evidence.

## V5 `DOCKER_START_FAILED` attribution and V6 repair basis

The operator result was ingested as a safe fail-closed child result:

```text
M2_ROOT_STEP_V5 stage=preflight status=PASS
M2_ROOT_STEP_V5 stage=copy status=PASS
M2_ROOT_STEP_V5 rollback=PASS containerd_root=/var/lib/containerd docker_root=/mnt/ssd-tmp/slate-tools/docker-data health=PASS
M2_ROOT_STEP_V5 stage=switch status=FAIL class=DOCKER_START_FAILED
```

Read-only reconciliation after rollback passed. Production is healthy on the
original containerd root and the active Docker data-root remains NVMe. The
fresh V5 candidate and V5 backup remain preserved; the earlier archived root
and backup remain preserved; no cleanup or rerun occurred.

The candidate-switch journal mechanically proves the endpoint mismatch:

```text
CANDIDATE_START=2026-09-06T15:43:28+08:00
CANDIDATE_CONTAINERD_MAINPID=3237671
CANDIDATE_CONTAINERD_ACTIVE=YES
CANDIDATE_ROOT=/mnt/ssd-tmp/slate-tools/containerd-root
CANDIDATE_STATE=/run/containerd-v5
CANDIDATE_CRI_STATE_DIR=/run/containerd-v5/io.containerd.grpc.v1.cri
CANDIDATE_SERVING_SOCKET=/run/containerd/containerd.sock
CANDIDATE_EXPECTED_DOCKER_SOCKET=/run/containerd-v5/containerd.sock
CANDIDATE_SOCKET_ENDPOINT_MATCH=NO
DOCKER_SOCKET_START=2026-09-06T15:43:30+08:00
DOCKER_START=2026-09-06T15:43:30+08:00
DOCKER_CANDIDATE_CLIENT_ADDRESS=/run/containerd-v5/containerd.sock
DOCKER_ERROR=failed_to_get_containerd_plugins_transport_dial_timeout
DOCKER_EXECMAINSTATUS=1
DOCKER_RESULT=exit-code
DOCKER_START_FAILURE=2026-09-06T15:43:34+08:00
ROLLBACK_CONTAINERD_START=2026-09-06T15:43:34+08:00
ROLLBACK_CONTAINERD_SOCKET=/run/containerd/containerd.sock
ROLLBACK_DOCKER_START=2026-09-06T15:43:35+08:00
ROLLBACK_HEALTH=PASS
```

The V5 drop-in contains `containerd --root "$DEST" --state "$STATE"`, but
not `--address "$CONTAINERD_SOCKET"`. The installed containerd binary exposes
an explicit `--address` flag, and the non-mutating `ctr --address
/run/containerd/containerd.sock version` control succeeds on the healthy
rollback endpoint. The candidate journal shows normal plugin initialization,
snapshotter initialization and `Started containerd.service`; the candidate
failure is therefore not a containerd service crash, plugin initialization
failure, root ownership failure, or a Docker socket activation race. The
primary hypothesis is `CASE_B/CANDIDATE_ENDPOINT_CONFIGURATION`, with a
readiness gate still required to prevent Docker from starting before the
correct candidate socket/API is usable.

The systemd dependency topology remains unchanged and expected:

```text
CONTAINERD_BEFORE=docker.service
DOCKER_AFTER=containerd.service,docker.socket
DOCKER_REQUIRES=docker.socket
DOCKER_WANTS=containerd.service
DOCKER_SOCKET_NON_ACTIVATING_OBSERVER=YES
```

```text
R1_STATUS=PASS_DOCKER_ENDPOINT_MISMATCH_PROVEN
R1_PRIMARY_CASE=CASE_B_CANDIDATE_CONTAINERD_ADDRESS_CONFIGURATION
R1_READINESS_ONLY=DISPROVEN_AS_PRIMARY_CAUSE
R1_ROLLBACK=PASS
R1_PRODUCTION_HEALTH=PASS
R1_PROVIDER_CALLS=0
R1_PRODUCTION_MUTATION=NO
R2_STATUS=IN_PROGRESS_V6_BOUNDED_REPAIR
R2_REPAIR=ADD_CONTAINERD_ADDRESS_AND_NONMUTATING_CTR_READINESS_GATE
R2_RESTART_GATE_WEAKENING=NO
R2_HEALTH_GATE_WEAKENING=NO
```

## V6 exact candidate frozen; ZAI review in progress

The evidence-backed correction is versioned as:

```text
V6_SCRIPT=scripts/slate-m2-containerd-rootstep-v6-isolated-state-slate-recreate.sh
V6_SHA256=c2e08d435d5509b6081013cf9780f983476876b36e1ad68b9b40abd7ac0b879a
V5_SHA256=5deee30cb8c9c8cd7605a430e5717d1f9358ac5e3f9519b53f89bb4c8b608acd
V5_UNCHANGED=YES
V6_SOURCE_DELTA=ADD_CONTAINERD_ADDRESS_AND_NONMUTATING_CTR_READINESS_GATE
V6_BASH_N=PASS
V6_STATIC_SCOPE=PASS
V6_SECRET_SCAN=PASS
V6_READINESS_STATE_MACHINE=PASS
V6_PROVIDER_CALLS=0
V6_PRODUCTION_MUTATION=NO
R6_STATUS=PASS_V6_EXACT_SHA_FROZEN
R7_STATUS=IN_PROGRESS_ZAI_GLM53_EXACT_REVIEW
R7_REVIEW_PROFILE=zai-glm53-reviewer
R7_REVIEW_PROVIDER=ZAI
R7_REVIEW_MODEL=glm-5.3-flash
R7_REVIEW_TARGET_SHA=c2e08d435d5509b6081013cf9780f983476876b36e1ad68b9b40abd7ac0b879a
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=0
HUMAN_ACTION_REQUIRED=NO
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
```

The V5 artifact remains byte-identical. The V6 readiness state-machine
controls cover service inactive, absent socket, non-ready API, eventual API
readiness, and successful readiness without using a provider or production
mutation. The exact whole-artifact ZAI review then returned a valid exact
verdict:

```text
REVIEWER=glm-5.3-flash
REVIEW_TARGET_SHA=c2e08d435d5509b6081013cf9780f983476876b36e1ad68b9b40abd7ac0b879a
VERDICT=PASS
P0=0
P1=0
P2=0
P3=3
SECURITY_FINDINGS=NONE
FINDINGS=P3_NONBLOCKING_ONLY
REVIEW_EXIT=0
```

The three P3 notes are non-blocking: preserved V5 path identifiers require
the planned atomic archival rename before a rerun; an inert temporary drop-in
file is a rare failure residue; and the single timeout class is less granular
than the readiness predicates. No source change is required by the review.

The independent read-only live preflight also passed without production
mutation: containerd and Docker are active on the original containerd root,
Docker remains on the NVMe data-root with overlayfs, Slate and MySQL are
healthy with zero observed restarts, local and public health return HTTP 200,
V5 drop-ins and `/run/containerd-v5` are absent, all preserved failed
artifacts remain present, Deluge is active with zero restarts, and the NVMe
reserve remains above the 150 GiB floor. The MySQL container identity is
`slate-note4-mysql`.

```text
R7_STATUS=PASS_EXACT_ZAI_GLM53_REVIEW
R8_STATUS=LIVE_PREFLIGHT_PASS_EXACT_REMOTE_INSTALL_PENDING
R8_REMOTE_PATH=/home/pi/slate-m2-containerd-rootstep-v6-isolated-state-slate-recreate.sh
R8_REMOTE_SHA256_REQUIRED=c2e08d435d5509b6081013cf9780f983476876b36e1ad68b9b40abd7ac0b879a
R8_PROVIDER_CALLS=0
R8_PRODUCTION_MUTATION=NO
```

## V6 remote installation and single root handoff

The reviewed V6 artifact was installed at the new remote path and verified
without root mutation beyond setting the script mode:

```text
REMOTE_PATH=/home/pi/slate-m2-containerd-rootstep-v6-isolated-state-slate-recreate.sh
REMOTE_TYPE=regular_file
REMOTE_MODE=700
REMOTE_OWNER=1000:1000
REMOTE_SHA256=c2e08d435d5509b6081013cf9780f983476876b36e1ad68b9b40abd7ac0b879a
REMOTE_BASH_N=PASS
```

The strictly systemd-only observer is armed at
`/tmp/slate-m2-v6-systemd-observer.OVpOjU`; its exact SHA is
`c8cc1be296b18383af4a85550cf84310f47da7a0e3c1fcc330ae5f09ab99d59a`. It
uses only `systemctl show`, `systemctl is-active`, SSH, and sanitized state
files; it does not call Docker, access the Docker socket, or use Docker HTTP.

The two existing V5 failure artifacts are preserved by same-filesystem
atomic rename in the one guarded root transaction. The selected unused
destinations were read-only verified absent:

```text
ARCHIVE_ROOT=/mnt/ssd-tmp/slate-tools/containerd-root.failed-docker-start-endpoint-20260906
ARCHIVE_BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v5-backup.failed-docker-start-endpoint-20260906
```

The transaction also guards the exact V6 SHA, required source paths, both
archive destinations, the fresh V6 destination, V6 backup destination, and
candidate runtime state before executing V6. No provider call or production
mutation has occurred. The only remaining frontier node is the operator's
one password-bearing root transaction; after its complete output is pasted,
R9 must ingest it and continue automatically.

```text
R8_STATUS=PASS_REMOTE_INSTALL_PREFLIGHT_OBSERVER_ARMED
R8_ROOT_COMMAND=ATOMIC_ARCHIVE_RENAME_THEN_EXEC_EXACT_V6
R8_PROVIDER_CALLS=0
R8_PRODUCTION_MUTATION=NO
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
HUMAN_ACTION_REQUIRED=YES
TERMINAL_REASON=MANUAL_SUDO_BOUNDARY
```

## R8 live reconciliation after remote-head refresh

Origin and PR #2 were fetched again. The authoritative remote head is
`002af80bfa38d016f669e35f8f8974122221ff5a`; PR #2 remains open, draft, and
unmerged. The exact remote V6 file still passes regular-file, non-symlink,
SHA, mode-700, and `bash -n` checks. Read-only host checks again pass for
the original containerd root/state, NVMe Docker root, active Docker and
docker.socket, healthy Slate and `slate-note4-mysql` with zero restarts,
local/public HTTP 200, absent V6 drop-ins and `/run/containerd-v5`, preserved
V5 artifacts, absent archive destinations, Deluge active, and the 150 GiB
reserve. The observer remains the exact non-activating systemd-only observer
and has no terminal result yet.

```text
CURRENT_HEAD=002af80bfa38d016f669e35f8f8974122221ff5a
R8_FINAL_LIVE_RECONCILIATION=PASS
R8_OBSERVER_NONACTIVATING=YES
R8_OBSERVER_RESULT=ARMED_NOT_TERMINAL
R8_PROVIDER_CALLS=0
R8_PRODUCTION_MUTATION=NO
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=0
CURRENT_BLOCKED_NODE=NONE
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=ONE_GUARDED_PASSWORD_BEARING_SUDO_ROOT_TRANSACTION
TERMINAL_REASON=MANUAL_SUDO_BOUNDARY
NEXT_ACTION=INGEST_COMPLETE_V6_OPERATOR_RESULT_AND_CONTINUE_R9
```

## C3 corrected deployment PASS and M3 exact firmware preflight

The operator completed the single guarded V6 root transaction. The exact
reviewed V6 script passed, with the NVMe containerd root active and the
previous V5 candidate and backup preserved under their recorded archival
names. The full result was ingested as a child result; no second root attempt
was made.

The first C3 deployment attempt had already failed safely and rolled back
because a controller-side Docker template used for the secret-mount health
gate was incorrectly quoted. This was not a product or image defect. The
same frozen, already-qualified ARM64 artifact was redeployed once with the
gate expressed through sanitized `docker inspect --format` JSON piped to
`jq`; no source or image bytes changed.

```text
C3_FIRST_ATTEMPT=FAIL_SAFE_ROLLBACK
C3_FIRST_FAILURE_CLASS=DEPLOYMENT_HEALTH_GATE_TEMPLATE_QUOTING
C3_FIRST_ROLLBACK=PASS_PRODUCTION_HEALTH_RESTORED
C3_CORRECTED_DEPLOYMENT=PASS_SAME_REVIEWED_ARTIFACT
C3_SOURCE_SHA=aae1c1fefce5e6c4ca4dbc2cd4d50f44ed4863d3
C3_IMAGE_TAR_SHA256=cf47b8c4bb6aec65161d1c54e766bbf62f9a4ada1430fb5b86766231d7074865
C3_PINNED_CONFIG_SHA=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
C3_ACTIVE_DOCKER_IMAGE=sha256:e2a116a21624043ccf3a2b1578de060637bb1e91206b2989eeef95bd98309871
C3_PROVIDER_DISABLED_ARTIFACT_CONTROL=PASS
C3_MYSQL_RECREATED=NO
C3_MYSQL_IDENTITY=57daa908973e7e2ea8db4ab209738ae27310cae4f3c6a8c71dc7f205a5c26ea5
C3_SECRET_MOUNT_DESTINATION=/run/secrets/gemini_api_key
C3_SECRET_MOUNT_RW=false
C3_LOCAL_PUBLIC_HEALTH=HTTP_200
C3_SLATE=running/healthy/restarts_0
C3_MYSQL=running/healthy/restarts_0
C3_STABILITY=PASS_15S
C3_ROLLBACK_IMAGE_PRESERVED=YES
C3_PROVIDER_CALLS=0
C3_MODEL_CHANGED=NO
C3_BILLING_CHANGED=NO
M3_STATUS=READY_EXACT_APP_ONLY_FIRMWARE_PREFLIGHT
M3_FIRMWARE_APP_SHA256=edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb
M3_FLASH_OFFSET=0x10000
M3_FULL_ERASE=NO
M3_NVS_LITTLEFS_PARTITION_WRITE=NO
M3_PAIRING_RESET=NO
M3_PROVIDER_CALLS=0
READY_NODE_COUNT=1
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=0
EXTERNALLY_BLOCKED_COUNT=0
HUMAN_ACTION_REQUIRED=NO
HUMAN_ACTION_REASON=NONE
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
NEXT_ACTION=RECONCILE_EXACT_NOTE4_DEVICE_AND_APP_ONLY_FIRMWARE_PREFLIGHT
```

The corrected deployment read-only verification passed: Slate and MySQL are
running and healthy with restart count zero; the MySQL identity is unchanged;
local and public health are HTTP 200; the expected network and NVMe Docker
root remain active; the candidate image is the exact loaded ARM64 image; and
the Gemini credential destination is a read-only bind mount. The provider,
model, billing, and production credential configuration were not changed.

## M3 exact app-only NOTE4 firmware PASS; M4 preparation

After C3 PASS, the exact prequalified app artifact was reconciled locally:
`firmware/build/slate.bin` is a regular 2,502,640-byte file with the pinned
SHA below. The protected app-only rollback artifact also remained present and
matched its recorded SHA.

The attached serial device was read-only reconciled before writing. Sanitized
esptool output identified ESP32-S3 revision v0.2, 16 MB flash, and flash ID
`46/4018`, matching the qualified NOTE4 target. No MAC address or other
device-secret value was persisted.

The single authorized write used esptool 5.2.0 at app offset `0x10000` with
`--flash-mode dio --flash-freq 80m --flash-size 16MB`. It did not invoke full
erase, partition-table, NVS, LittleFS, pairing, or server-address operations.
Esptool completed its post-write data hash verification successfully.

```text
M3_STATUS=PASS_EXACT_APP_ONLY_FIRMWARE_FLASH
M3_DEVICE_PORT=/dev/cu.usbmodem31201
M3_DEVICE_TARGET=ESP32-S3_REV_V0.2
M3_DEVICE_FLASH_SIZE=16MB
M3_DEVICE_FLASH_ID=46_4018
M3_FIRMWARE_APP=firmware/build/slate.bin
M3_FIRMWARE_BYTES=2502640
M3_FIRMWARE_APP_SHA256=edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb
M3_FLASH_OFFSET=0x10000
M3_FLASH_TOOL=esptool_v5.2.0
M3_FLASH_VERIFY=PASS_HASH_OF_DATA_VERIFIED
M3_FULL_ERASE=NO
M3_PARTITION_TABLE_WRITE=NO
M3_NVS_WRITE=NO
M3_LITTLEFS_WRITE=NO
M3_PAIRING_RESET=NO
M3_SERVER_ADDRESS_RESET=NO
M3_ROLLBACK_APP=/Users/ollama/NOTE4-backups/campaign8-physical-20260905/rollback-bca05819-app.bin
M3_ROLLBACK_APP_SHA256=61baf54af122f8188e75d30d07068d95679be21d378ba9740d4d33487983fbfa
M3_SERIAL_CAPTURE=SANITIZED_COUNTS_ONLY
M3_SERIAL_WIFI_CONNECTION_MARKERS=4
M3_SERIAL_SYNC_POLL_MARKERS=4
M3_SERIAL_FATAL_MARKERS=0
M3_BACKEND_LOCAL_HEALTH=HTTP_200
M3_BACKEND_PUBLIC_HEALTH=HTTP_200
M3_SLATE=running/healthy/restart=0
M3_MYSQL=running/healthy/restart=0
M3_PROVIDER_CALLS=0
M3_MODEL_CHANGED=NO
M3_BILLING_CHANGED=NO
M3_PRODUCTION_CONTAINER_MUTATION=NO
READY_NODE_COUNT=1
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=0
EXTERNALLY_BLOCKED_COUNT=0
HUMAN_ACTION_REQUIRED=NO
HUMAN_ACTION_REASON=NONE
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
NEXT_ACTION=PREPARE_ONE_COMBINED_M4_EN_JA_PHYSICAL_UX_SESSION
```

Post-flash sanitized serial capture observed four Wi-Fi/connection markers,
four sync/poll markers, and zero fatal markers. Backend verification after the
write showed Slate and MySQL healthy with zero restarts, local and public
`/healthz` HTTP 200, the exact C3 image active, the read-only Gemini mount
intact, and no provider call. M4 remains the single combined physical UX
acceptance session: English and Japanese turns, exit/re-entry or reconnect as
applicable, button behavior, one-turn/one-bubble coalescing, and sanitized
latency observations only.
