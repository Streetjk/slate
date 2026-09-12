# Campaign 8D1M-G — M1 NVMe Switch Health Recovery Instructions

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Trigger

The operator manually ran the versioned V2 root-step script and reported:

```text
M1_ROOT_STEP_V2 stage=preflight status=PASS
M1_ROOT_STEP_V2 stage=copy status=PASS
M1_ROOT_STEP_V2 rollback=PASS data_root=/var/lib/docker
M1_ROOT_STEP_V2 stage=switch status=FAIL class=SLATE_NOT_HEALTHY
```

The copy/content gate therefore passed. The attempted Docker data-root switch did not reach the script's production-health gate, and the script restored the original Docker data-root successfully.

Do not rerun V2 blindly.

## Immediate zero-mutation verification

Codex must first verify live, without sudo/root mutation where possible:

```text
DOCKER_REPORTED_DATA_ROOT=/var/lib/docker_EXPECTED
DOCKER_DAEMON=ACTIVE_EXPECTED
SLATE_CONTAINER_STATUS
SLATE_CONTAINER_HEALTH
SLATE_RESTART_COUNT
MYSQL_CONTAINER_STATUS
MYSQL_CONTAINER_HEALTH
MYSQL_RESTART_COUNT
LOCAL_HEALTHZ
PUBLIC_HEALTHZ
NOTE4_AUTHENTICATED_POLLING_IF_AVAILABLE_SANITIZED
ORIGINAL_VAR_LIB_DOCKER_PRESENT=YES_EXPECTED
NVME_DOCKER_COPY_PRESENT=YES_EXPECTED
```

If rollback production is not healthy on the original root, stop at that safety boundary and publish exact sanitized evidence before any further migration attempt.

## Required differential

The V2 script must be audited against the observed failure timing. In the current V2 implementation, after `systemctl start docker`, the script waits for `DockerRootDir` to report the NVMe path but then calls `assert_production_health` without a bounded wait for `slate-note4` and `slate-note4-mysql` to transition through normal startup/healthcheck states.

Do not assume this explains the failure. Prove whether the observed `SLATE_NOT_HEALTHY` was:

- **A — startup timing gate too eager**: Slate was starting/health=starting and would have become healthy within the normal bounded startup window; or
- **B — genuine NVMe-root runtime regression**: container startup, mount/volume/network, permissions, storage-driver, health endpoint, database dependency, or application startup failed while Docker used the NVMe root.

Use sanitized evidence only. Inspect container state/health timestamps, restart counts, Docker daemon/journal events, container healthcheck status/reason, network/volume visibility, and non-secret application startup status. Do not dump environment variables, credentials, application secrets, raw provider payloads, private user content, or database data.

## If classification A is proven

Prepare a new **V3** fail-closed root-step script at a new versioned path. Do not overwrite V2 silently.

The V3 switch gate must:

1. preserve the exact already-passed copy/content verification from V2;
2. start Docker on the NVMe data-root;
3. wait up to a bounded, evidence-based startup window for both `slate-note4` and `slate-note4-mysql` to exist, run, and become healthy;
4. tolerate normal intermediate states such as `starting` but not crash loops/restart growth;
5. require local and public health HTTP PASS after container health becomes green;
6. verify expected current/rollback/MySQL images, network, volumes and NVMe data-root/storage driver;
7. verify NVMe reserve policy using the current approved floor unless superseded by a later explicit operator policy;
8. on timeout or any hard failure, automatically restore the original daemon configuration/data-root and then wait for Slate/MySQL/local/public health to recover before reporting rollback PASS;
9. never delete either Docker tree.

Static validation, script hash, remote mode/path and secret scan must be recorded and pushed before asking the operator to run one replacement `ssh -t ... sudo ...` command.

## If classification B is proven

Do not prepare or request another switch attempt until the exact runtime cause is identified. Exhaust zero-mutation/root-read-only forensics first. Any corrective change must remain bounded to the demonstrated infrastructure/runtime defect, preserve both Docker roots, Deluge paths, MySQL persistent data, credentials, provider configuration and PR merge state, and be revalidated before another manual root command.

## Continuation after M1 PASS

Once a corrected manual M1 root step succeeds and Codex independently verifies:

```text
DOCKER_DATA_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
SLATE_HEALTH=PASS
MYSQL_HEALTH=PASS
LOCAL_PUBLIC_HEALTH=PASS
OLD_ROOT_DOCKER_PRESERVED=YES
DELUGE_UNCHANGED=YES
```

continue automatically through the already-activated M2 exact UX backend deployment -> M3 exact app-only firmware flash -> M4 bounded EN/JA physical UX retest. Checkpoint pushes are not handoffs.

Do not change the Gemini model, billing/Vertex, credentials, Calendar/Outlook scope, Deluge paths, NVMe partitioning, or merge PR #2.

`REPORT-PUSH-INVARIANT.md` and `AUTONOMY-AND-HUMAN-GATE-POLICY.md` remain binding.

## Recovery checkpoint — V2 switch-health differential and V3 handoff

Date: 2026-09-05 (Australia/Perth)

The rollback state was verified without root mutation or provider activity:

```text
DOCKER_ROOT=/var/lib/docker
DOCKER_DRIVER=overlayfs
DOCKER_DAEMON=active
SLATE=running/healthy/restarts=2
MYSQL=running/healthy/restarts=0
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
ORIGINAL_ROOT=/var/lib/docker PRESENT
NVME_COPY=/mnt/ssd-tmp/slate-tools/docker-data PRESENT
EXPECTED_NETWORK=slate-note4-deploy_default PRESENT
DISPOSABLE_CONTAINERS=0
PROVIDER_CALLS=0
PRODUCTION_MUTATION=NO
```

The two Slate restarts are the expected consequence of the attempted Docker
stop/start and fail-closed rollback sequence; the container is currently
healthy with `FailingStreak=0`, empty state error and continuously passing
healthchecks. MySQL is healthy with zero restarts. The source and NVMe trees
were both preserved.

Classification is **A — V2 checked too early during normal startup**. The
sanitized daemon journal gives this sequence:

```text
19:01:37  original Docker stop began
19:01:45  original Docker daemon stopped
19:01:51  first switched-root daemon began startup
19:01:54  first daemon reported Loading containers: done / service started
19:01:56  second Docker stop began (V2 fail-closed rollback)
19:02:07  first switched-root daemon stopped
19:02:08  rollback daemon began startup on /var/lib/docker
19:02:11  rollback daemon reported Loading containers: done / service started
```

V2 waits only for `DockerRootDir` and then calls its immediate health
assertion. That places `SLATE_NOT_HEALTHY` within roughly two seconds of the
first daemon becoming available. The current healthcheck contracts are
Slate: interval `30s`, timeout `5s`, retries `3`; MySQL: interval `5s`,
timeout `3s`, retries `12`. After rollback, both containers are running and
healthy and the retained health events are exit 0. The Docker daemon journal
contains no NVMe storage, mount, permission, network, or application startup
failure. The only warnings are the known container-mount detection and absent
`nft` helper messages, present during both normal daemon starts. Historical
Docker event records for the stopped daemon are not retained, so no missing
event is treated as evidence of a runtime defect.

The source/destination health and network checks therefore show a normal
startup timing gate, not a genuine NVMe-root runtime regression. No production
container, Docker tree, credential, provider, firmware, billing or network
configuration was changed by the recovery investigation.

## Versioned V3 correction

V2 was not rerun. A new fail-closed script was prepared and installed:

```text
LOCAL_SCRIPT=scripts/slate-m1-rootstep-v3-startup-wait.sh
REMOTE_SCRIPT=/home/pi/slate-m1-rootstep-v3-startup-wait.sh
V2_SCRIPT_SHA256=be8e05166ac38d04eeaf2059906218ea7e434de17f1114f2404b4530fe86bf74
V3_SCRIPT_SHA256=ab130ebbd16fa2e4f028ffc5eb1e315b524dbf4c12f42449c44c3a1a0cbb801a
V3_LOCAL_BASH_N=PASS
V3_LOCAL_NONROOT_FAIL_CLOSED=PASS class=NOT_ROOT
V3_REMOTE_MODE=700
V3_REMOTE_BASH_N=PASS
```

V3 preserves V2’s already-passed copy/content gate and all source, destination,
image, network, reserve, no-credential and no-whole-tree-deletion invariants.
It waits up to `180s` for both containers to exist, run and become healthy,
captures the copied NVMe container restart counts immediately after the
switched daemon exposes them, rejects growth from those baselines, then
requires local and public HTTP health. (It records the original-root counts
separately for rollback context, avoiding comparison with the later source
rollback count.) Its
rollback path waits up to `180s` for the original Docker root, Slate/MySQL
health and local/public health to recover before declaring rollback PASS.
Transient `starting` states are tolerated; timeout, crash/restart growth or
health failure remains fail-closed.

M1 is not yet proven PASS. The operator must run the single versioned V3 root
step manually. No provider call, firmware flash, production deployment or
credential access occurred during this recovery.
