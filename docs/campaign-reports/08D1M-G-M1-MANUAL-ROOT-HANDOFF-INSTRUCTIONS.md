# Campaign 8D1M-G — M1 Manual Root Handoff Instructions

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Bridge the only remaining M1 blocker safely: Codex has no root/sudo authority on the Orange Pi, while the already-activated NVMe Docker data-root migration requires root to stop Docker, copy `/var/lib/docker` faithfully, and switch the daemon data-root.

This checkpoint does **not** ask the operator to disclose a sudo password and does not authorize Codex to obtain, store, print, or transmit one.

## Accepted live M0 state

```text
MIGRATION_DIRECTIVE=ALREADY_ACTIVATED_BY_PRIOR_HUMAN_PROCEED
M0_STATUS=PASS_STORAGE_FEASIBILITY_ROOT_AUTHORITY_BLOCKED
REMOTE_HEAD_BEFORE_THIS_CHECKPOINT=170cce9d3f25ee1045a9ac9b83d96a1d9c0ba288
SOURCE_SHA=aae1c1fefce5e6c4ca4dbc2cd4d50f44ed4863d3
ARM64_IMAGE_ID=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
FIRMWARE_APP_SHA256=edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb
DOCKER_ROOT=/var/lib/docker
DOCKER_ROOT_BYTES=3245587064
NVME_FILESYSTEM=ext4
NVME_FREE_BYTES=188982398976
PROJECTED_RESERVE_AFTER_ROOT_COPY_AND_CANDIDATE_BYTES=184606166088
NVME_RESERVE_FLOOR_BYTES=180000000000
NVME_RESERVE_FLOOR=PASS
PRODUCTION_SLATE=healthy
PRODUCTION_MYSQL=healthy
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
ROOT_SSH=UNAVAILABLE
SUDO_NONINTERACTIVE=UNAVAILABLE
```

## Authorized preparation scope

Codex may, without any root privilege and without another human stop:

1. reconcile current remote head and confirm no product/source/artifact pin drift;
2. re-run read-only M0 health/storage checks;
3. prepare a single local Orange Pi root-step script at a non-secret operator-readable path such as `/home/pi/slate-m1-rootstep.sh`;
4. validate the script statically and with non-root/read-only preflight logic where possible;
5. record the script SHA-256, mode, path, exact expected source/destination, and rollback logic in the campaign report;
6. publish/push/verify that preparation checkpoint;
7. present the operator exactly one manual command to execute with `sudo`.

Codex must **not** run the root step itself unless a future execution environment actually provides already-authorized root authority without requesting or exposing a password.

## Required root-step behavior

The prepared script must be fail-closed and narrowly scoped to M1. It must:

```text
ROOT_STEP_SCOPE=DOCKER_DATA_ROOT_MIGRATION_ONLY
SOURCE=/var/lib/docker
DESTINATION=/mnt/ssd-tmp/slate-tools/docker-data
NVME_REPARTITION=NO
NVME_FORMAT=NO
DELUGE_PATH_CHANGE=NO
DELUGE_DATA_CHANGE=NO
OLD_ROOT_DOCKER_DELETE=NO
MYSQL_VOLUME_DELETE=NO
DOCKER_VOLUME_DELETE=NO
BROAD_DOCKER_PRUNE=NO
CREDENTIAL_READ_OR_COPY=NO
PROVIDER_CALL=NO
FIRMWARE_FLASH=NO
PR2_MERGE=NO
```

Before mutation it must verify:

- it is running as root;
- `/var/lib/docker` is the current Docker root;
- the destination resolves under `/mnt/ssd-tmp/slate-tools/` and is not a Deluge path;
- NVMe is mounted read-write as the expected ext4 filesystem;
- the conservative 180 GB reserve still passes using current measurements;
- current Docker daemon configuration is captured for rollback;
- production Docker is currently healthy enough to enter the planned maintenance window.

The root step must then:

1. stop Docker cleanly;
2. faithfully copy `/var/lib/docker/` to the dedicated NVMe destination preserving numeric IDs, ownership, permissions, hardlinks, symlinks, xattrs/ACLs and sparse-file semantics required by Docker;
3. leave the original `/var/lib/docker` untouched;
4. verify the copy before daemon reconfiguration using deterministic metadata/copy verification suitable for the filesystem;
5. configure Docker to use the new NVMe data-root while preserving any pre-existing daemon configuration;
6. start Docker;
7. require Docker to report the expected new data-root and the expected storage driver;
8. require the expected Slate/MySQL containers/images/volumes/networks to remain visible;
9. verify the NVMe reserve remains above the declared floor;
10. exit success only if these checks pass.

## Mandatory automatic rollback

If any post-stop or post-switch check fails, the script must automatically:

1. stop Docker;
2. restore the previous daemon configuration exactly;
3. restart Docker against the untouched original `/var/lib/docker`;
4. verify Docker reports the original data-root;
5. preserve the failed NVMe copy for forensic inspection rather than deleting either copy;
6. exit non-zero with sanitized stage/error information only.

The script must never contain, print, copy, or inspect Gemini/API credentials or application secrets.

## Operator handoff

After Codex prepares and validates the root-step script, it must stop at exactly this one true technical boundary and print one command of the form:

```bash
ssh pi@orangepi5 'sudo /home/pi/slate-m1-rootstep.sh'
```

The operator should enter the sudo password only into their own terminal. Do not paste the sudo password into ChatGPT, Codex, GitHub, logs, or the report.

After the command completes, the operator only needs to tell Codex that the root step completed and whether it exited successfully. Codex must then live-verify the resulting daemon/data-root/health state and, on M1 PASS, continue automatically through the already-activated M2 exact UX backend deployment -> M3 app-only firmware flash -> M4 bounded EN/JA physical retest without another handoff unless a genuinely new safety/authority boundary appears.

`REPORT-PUSH-INVARIANT.md` and `AUTONOMY-AND-HUMAN-GATE-POLICY.md` remain binding. PR #2 remains open/draft/unmerged.

## M1 preparation — fail-closed root-step handoff ready

The single root-step script was prepared, installed on the Orange Pi, and
validated without invoking sudo or reading/requesting a sudo password.

```text
REMOTE_SCRIPT=/home/pi/slate-m1-rootstep.sh
REMOTE_SCRIPT_MODE=700
REMOTE_SCRIPT_SHA256=f93d4c1f6c509a986a1742cdc81f4cd5c4795cca432d97e15d8f89c2441ebdf8
LOCAL_SCRIPT_BASH_N=PASS
REMOTE_SCRIPT_BASH_N=PASS
NONROOT_FAIL_CLOSED_PREFLIGHT=PASS
NONROOT_FAILURE_CLASS=NOT_ROOT
REMOTE_SCRIPT_STDERR=NONE
SCRIPT_SECRET_SCAN=PASS
SUDO_INVOKED_BY_CODEX=NO
SUDO_PASSWORD_REQUESTED_BY_CODEX=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
GEMINI_PROVIDER_CALLS=0
```

The script is limited to the activated M1 Docker data-root migration. It
contains exact source/destination and image pins, NVMe reserve checks,
faithful rsync/copy verification, Docker visibility/health gates, and
automatic restoration of the original daemon configuration and data-root on
post-stop failure. It does not read or handle application credentials.

STATUS=M1_ROOT_STEP_READY_FOR_MANUAL_SUDO
HUMAN_ACTION_REQUIRED=RUN_EXACT_COMMAND_BELOW_ON_OPERATOR_TERMINAL
