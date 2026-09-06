# Campaign 8D1M-G — M2 C2 containerd stop failure recovery

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Operator result

The operator executed the exact AGY-reviewed V2 artifact:

```text
ssh -t note4-orangepi 'sudo /home/pi/slate-m2-containerd-rootstep-v2-nvme-reversible.sh'
```

Observed result:

```text
M2_ROOT_STEP_V1 stage=preflight status=PASS
M2_ROOT_STEP_V1 rollback=PASS containerd_root=/var/lib/containerd docker_root=/mnt/ssd-tmp/slate-tools/docker-data health=PASS
M2_ROOT_STEP_V1 stage=copy status=FAIL class=CONTAINERD_STOP_FAILED
```

Adjudication:

```text
C2_RUNTIME_RESULT=FAIL_CLOSED
C2_FAILURE_CLASS=CONTAINERD_STOP_FAILED
ROLLBACK=PASS
CONTAINERD_ROOT=/var/lib/containerd
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
PRODUCTION_HEALTH_AFTER_ROLLBACK=PASS
CONTAINERD_MIGRATION_COMPLETED=NO
V2_BLIND_RERUN=NO
```

Production is therefore treated as healthy and restored. Do not rerun V2 until the stop failure is explained.

## Leading bounded hypothesis — prove, do not assume

V2 stops `docker.service` and then `containerd.service`. At the same time, C2 observer V3 was deliberately running in a separate foreground control session and was described as sampling service/root/health state.

A plausible race is that the observer touches the Docker API/socket after `docker.service` stops. If `docker.socket` remains active, a Docker CLI/API probe can socket-activate Docker again; Docker depends on containerd, which can race or cancel the subsequent `systemctl stop containerd` job. This is a hypothesis only. The fact that rollback later successfully stopped/restarted the same services makes a transient race/interference more likely than a permanently un-stoppable containerd service.

## D0 — read-only failure attribution

Before any new sudo execution, Codex must reconcile to the current remote head and inspect only non-secret evidence:

1. Ingest the operator result above and the latest observer samples/result.
2. Inspect the exact local observer script `/tmp/slate-m2-c2-observer-v2.sh` and determine whether it invokes `docker`, curls the Docker socket, or otherwise can trigger `docker.socket` while Docker is down.
3. Record non-secret unit state/dependency metadata, including at minimum:
   - `systemctl is-active docker docker.socket containerd`;
   - `systemctl show docker.service docker.socket containerd.service` for `Requires`, `Wants`, `After`, `Before`, `BindsTo`, `PartOf`, `TriggeringBy`, `TriggeredBy`, `Restart`, `ActiveState`, `SubState`;
   - reverse dependency view for `containerd.service`;
   - relevant sanitized service journal lines around the failed stop, if available without exposing payload/credential data.
4. Determine whether Docker/containerd restarted or a start job appeared between V2's successful Docker stop and failed containerd stop.
5. Revalidate Slate/MySQL/local/public health read-only after the rollback.

No provider call, credential read, candidate load, firmware flash, destructive cleanup, or production mutation is allowed in D0.

## D1 — preferred recovery if observer/socket activation is proven

If evidence proves or strongly pins the failure to observer-triggered Docker socket activation:

- do not modify V2;
- preserve the exact reviewed V2 SHA `09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd`;
- terminate/disarm the interfering observer cleanly;
- replace it with a non-activating observer that does not invoke Docker or touch `/var/run/docker.sock` while Docker is inactive; use systemd/process state only during the stop window and defer Docker API health checks until Docker is active again;
- syntax-check and prove the observer cannot socket-activate Docker;
- push/fetch-verify the recovery checkpoint;
- then present exactly one new manual command using the same reviewed V2.

The manual command remains:

```text
ssh -t note4-orangepi 'sudo /home/pi/slate-m2-containerd-rootstep-v2-nvme-reversible.sh'
```

Do not execute it automatically.

## D2 — bounded source correction only if D0 disproves observer interference

If the observer is not the cause and exact evidence identifies a V2 service-stop defect, perform one bounded C1 repair only. Likely repair areas may include deterministic handling of `docker.socket`, explicit service quiescence ordering, or fail-closed bounded wait/state verification; do not guess a fix before D0 evidence.

Use the existing campaign roles:

```text
CONTROLLER=CODEX
WRITER=GEMINI_3_8_FLASH_WHERE_USEFUL
REVIEWER=AGY_GEMINI_3_7_FLASH_HIGH_FOR_BOUNDED_C1_CORRECTION_REVIEW
```

Any changed root script receives a new exact SHA, deterministic tests, and a fresh exact independent read-only review before installation or execution. Do not reuse the V2 review verdict for changed bytes.

If a changed artifact cannot be reviewed under the already-activated bounded correction/re-review scope, stop at that exact reviewer-scope boundary rather than waiving review.

## Continuation

After a future containerd migration PASS, continue automatically through the already-authorized chain:

```text
C3 exact candidate load/deploy
-> M3 exact app-only firmware flash
-> M4 bounded combined EN/JA physical UX retest
```

Reports/checkpoints are not stops. PR #2 remains open/draft/unmerged.

## D0 attribution and D1 observer recovery

Reconciled remote head before attribution:

```text
REMOTE_HEAD=6f5d2da9712044f9e8c0121393124c493b3c0bf3
INSTRUCTION_SHA=6f5d2da9712044f9e8c0121393124c493b3c0bf3
V2_REVIEWED_SHA=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
V2_SOURCE_CHANGED=NO
```

The foreground V3 observer did not produce a terminal migration result. Its
durable result was `C2_OBSERVER=TIMEOUT_NO_TERMINAL_RESULT`; its samples
continued to show the restored original root and healthy production after the
operator's fail-closed rollback. The observer process/control session is no
longer running and was disarmed before the replacement was armed.

```text
C2_OBSERVER_V3_RESULT=TIMEOUT_NO_TERMINAL_RESULT
C2_OBSERVER_V3_SAMPLES=BASELINE_ONLY_AFTER_ROLLBACK
C2_OBSERVER_V3_DISARMED=YES
```

The exact observer source was inspected. Every sample executed the Docker CLI
(`docker info` plus two `docker inspect` calls) and two HTTP probes. It did not
open the socket by pathname, but those Docker API calls use Docker's configured
socket and can activate `docker.socket`. This was unsafe during the V2 stop
window.

The Orange Pi systemd evidence pins the race:

```text
DOCKER_SERVICE=Requires=docker.socket; TriggeredBy=docker.socket; Restart=always
DOCKER_SOCKET=Listen=/run/docker.sock; ActiveState=active; SubState=running
CONTAINERD_REVERSE_DEPENDENCY=docker.service
```

The sanitized journal window shows the relevant ordering:

```text
2026-09-06T12:45:27+08:00 systemd[1]: Stopping docker.service
2026-09-06T12:45:42+08:00 systemd[1]: docker.service: Deactivated successfully
2026-09-06T12:45:42+08:00 systemd[1]: Stopped docker.service
2026-09-06T12:45:42+08:00 systemd[1]: Starting docker.service
2026-09-06T12:45:42+08:00 systemd[1]: Stopping containerd.service
2026-09-06T12:45:51+08:00 systemd[1]: docker.service: Main process exited, status=1/FAILURE
2026-09-06T12:45:53+08:00 systemd[1]: docker.service: Scheduled restart job, restart counter is at 1
2026-09-06T12:46:47+08:00 systemd[1]: containerd.service: Deactivated successfully
2026-09-06T12:46:47+08:00 systemd[1]: Stopped containerd.service
```

Therefore:

```text
D0_ATTRIBUTION=OBSERVER_DOCKER_API_SOCKET_ACTIVATION_PROVEN
D0_START_JOB_BETWEEN_STOP_OPERATIONS=YES
D0_CONTAINERD_STOP_FAILURE_CAUSED_BY_OBSERVER_RACE=STRONGLY_PINNED
D0_SOURCE_DEFECT=NO
V2_BLIND_RERUN=NO
```

The post-rollback read-only health check passed: Docker root remained
`/mnt/ssd-tmp/slate-tools/docker-data`, Slate and MySQL were running/healthy
with restart count zero, and local/public health returned HTTP 200. No
production mutation occurred.

## D1 non-activating observer

The replacement is the tracked, executable observer
`scripts/slate-m2-c2-systemd-observer-v1.sh`. Its remote sampling command uses
only `systemctl is-active`, `systemctl show`, and SSH. It has no Docker CLI,
HTTP client, Docker socket path, or `DOCKER_HOST` reference. Docker/API health
checks are intentionally not part of the stop-window observer; the observer
reports only systemd state and defers application health verification until
after the operator's command completes.

```text
D1_OBSERVER=scripts/slate-m2-c2-systemd-observer-v1.sh
D1_OBSERVER_SHA256=c8cc1be296b18383af4a85550cf84310f47da7a0e3c1fcc330ae5f09ab99d59a
D1_OBSERVER_MODE=755
D1_OBSERVER_BASH_N=PASS
D1_OBSERVER_SOCKET_SAFETY=PASS_NO_DOCKER_API_CURL_OR_SOCKET_REFERENCE
D1_OBSERVER_REMOTE_MUTATION=NO
D1_OBSERVER_CREDENTIAL_ACCESS=NO
D1_OBSERVER_DIR=/tmp/slate-m2-c2-systemd-observer-v1.OZBjh9
D1_OBSERVER_CONTROL_SESSION=35315
D1_OBSERVER_SAMPLE=SYSTEMD_ONLY_BASELINE
D1_OBSERVER_ARMED=YES
D1_OBSERVER_RESULT=WAITING
```

Static inspection is the relevant safety proof: while Docker is inactive the
replacement can issue no Docker API request and cannot touch
`/run/docker.sock`; its only remote executable is `systemctl`. The exact
reviewed V2 remains unchanged at SHA
`09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd`.

The next and only operator command is:

```text
ssh -t note4-orangepi 'sudo /home/pi/slate-m2-containerd-rootstep-v2-nvme-reversible.sh'
```
