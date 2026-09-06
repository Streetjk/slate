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
