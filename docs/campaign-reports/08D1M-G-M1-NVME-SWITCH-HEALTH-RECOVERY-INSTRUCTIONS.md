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
