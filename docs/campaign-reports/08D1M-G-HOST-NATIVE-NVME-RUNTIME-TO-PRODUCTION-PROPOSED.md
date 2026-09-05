# Campaign 8D1M-G — PROPOSED Host-Native NVMe Runtime Recovery to G2/G3

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Starting remote head: `f582b17b524efe6531b2a71899a330b7622720f6`

## Purpose

Keep using the Orange Pi NVMe as the spare workspace, but remove the failed Docker-in-Docker / nested-runc layer from the G2 path. The exact reviewed image already loaded successfully into NVMe-backed Docker storage; only process creation inside the nested runtime failed. This proposal uses a second **host-native** disposable `dockerd` directly on the Orange Pi with all of its data/exec state on NVMe and a separate Unix socket. The production Docker daemon, production Docker root, Slate/MySQL data, Deluge paths, and rollback image remain untouched during G2.

A later explicit human activation may authorize this bounded runtime mechanism and, if G2 passes, a narrow NVMe-backed production image swap for G3 so another short storage handoff is avoided.

## Accepted evidence

```text
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
ARM64_IMAGE_SHA=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
GROK_4_6_REVIEW=PASS_P0_P1_P2_P3_ZERO
BASELINE_EQUIVALENCE=PASS
G1_NATIVE_AUDIO=PASS
G_PROVIDER_SESSIONS_USED=2_OF_3
G_PROVIDER_SESSIONS_REMAINING=1
G2_PROVIDER_CALL=NOT_STARTED
G2_NESTED_NVME_IMAGE_LOAD=PASS
G2_NESTED_BASE_IMAGE_CONTROL=FAIL_RUNC_BOOTSTRAP_BROKEN_PIPE
G2_NESTED_CANDIDATE_PROCESS_STARTED=NO
G2_NESTED_FAILURE_CLASS=ISOLATED_CONTAINER_RUNTIME_RUNC_BOOTSTRAP_BROKEN_PIPE
PRODUCTION_CHANGED=NO
PRODUCTION_HEALTH=PASS
```

The nested result proves the NVMe can hold the exact image and that the current failure is below Slate/Gemini. No provider session was consumed.

## Status

```text
DIRECTIVE_STATE=PROPOSED_NOT_AUTHORIZED
HOST_NATIVE_SECOND_DOCKERD_AUTHORIZED=NO
SUDO_RUNTIME_PROCESS_AUTHORIZED=NO
G2_PROVIDER_CALL_AUTHORIZED_BY_THIS_FILE=NO
CURRENT_PRODUCTION_IMAGE_REMOVAL_AUTHORIZED=NO
PRODUCTION_MUTATION_AUTHORIZED_BY_THIS_FILE=NO
```

This file authorizes nothing until a later explicit human `proceed` / equivalent.

## Proposed single activation envelope

```text
HOST_NATIVE_NVME_DOCKERD=YES_TEMPORARY_ONLY
PRODUCTION_DOCKER_DAEMON_STOP_OR_RESTART=NO
PRODUCTION_DOCKER_SOCKET_TOUCH=NO
PRODUCTION_DOCKER_DATA_ROOT_TOUCH=NO
SECOND_DOCKERD_DATA_ROOT=NVME_ONLY
SECOND_DOCKERD_EXEC_ROOT=NVME_ONLY
SECOND_DOCKERD_SOCKET=SEPARATE_NVME_UNIX_SOCKET
SECOND_DOCKERD_DEFAULT_BRIDGE=OFF
SECOND_DOCKERD_IPTABLES_MUTATION=OFF
SECOND_DOCKERD_SYSTEMD_INSTALL=NO
SECOND_DOCKERD_REBOOT=NO
NVME_REPARTITION_OR_FORMAT=NO
DELUGE_PATH_OR_DATA_CHANGE=NO
SLATE_MYSQL_PERSISTENT_DATA_CHANGE=NO
BROAD_DOCKER_PRUNE=NO
ROLLBACK_IMAGE_DELETE=NO
BLIND_PROVIDER_RETRY=NO
CONTINUE_G2_IF_HOST_NATIVE_CONTROLS_PASS=YES
CONDITIONAL_G3_SWAP_AFTER_G2_PASS=YES
PR2_MERGE=NO
FIRMWARE_FLASH=NO
PRIVATE_DATA_OR_MICROPHONE=NO
```

## R0 — zero-provider host-native capability preflight

Before any root process is started, record non-secret/read-only evidence:

- host `dockerd`, `docker`, `containerd`, and `runc` versions/paths;
- current production Docker daemon PID/socket/data-root and Slate/MySQL health;
- NVMe filesystem, mount options and free bytes;
- current root free bytes;
- exact candidate archive/image availability on NVMe;
- production and rollback image IDs/tags;
- confirm the NVMe Deluge reserve floor remains comfortably above the previously accepted 180 GB recommendation after allocating at most a few GB under `/mnt/ssd-tmp/slate-tools`.

Do not read credential values. Do not change production Docker or networking.

If the host does not have a usable native `dockerd`/`runc`, or a second daemon cannot be isolated without stopping/reconfiguring the production daemon, stop with no provider call.

## R1 — host-native isolated runtime proof

Launch the second daemon **directly on the Orange Pi host, not inside a container**. Use a disposable directory under `/mnt/ssd-tmp/slate-tools/g2-host-native/` for all candidate-specific state. It must have its own:

- `data-root`;
- `exec-root`;
- PID file;
- Unix socket;
- daemon/containerd runtime state where applicable.

Do not bind or reuse `/var/run/docker.sock` or `/var/lib/docker`. Disable the daemon's default bridge/iptables/ip-forward/ip-masq behavior so it cannot alter production Docker networking. Do not register a persistent systemd service.

Before any credential mount or provider network:

1. load/verify the exact reviewed image digest in the host-native NVMe daemon;
2. run a trivial `oven/bun:1-slim` control with `--network none`, no secret mounts and no production mounts;
3. run the exact candidate through the provider-disabled startup/bridge smoke path with `--network none`, no credential mount;
4. verify production Slate/MySQL/local/public health and production restart counts remain unchanged.

Both controls must start and exit normally. If either fails, stop the temporary daemon, remove only its disposable NVMe runtime state after evidence capture, preserve production, and consume zero provider sessions.

## R2 — resume G2 only after R1 PASS

If R1 passes, run the already-authorized G2 full-adapter non-production matrix from the exact host-native NVMe daemon. To avoid any second-daemon bridge/iptables changes, the disposable G2 harness may use host networking only if needed for outbound Gemini access; it must publish no listener, use no private application payload, invoke no tools/Search, and mount only the existing protected Gemini credential read-only at the approved secret path.

Run one provider session only:

```text
TURN_1_EN="Say exactly TEST."
TURN_2_EN="Say exactly SECOND."
TURN_3_JA="日本語で「テスト」とだけ言ってください。"
```

PASS requires native-audio/model-turn output plus turn completion for every executed turn. No raw provider payload, transcription text, or generated audio retention.

If G2 fails, do not mutate production or consume the G3 session. Exhaust safe zero-provider forensics and stop only at a true new boundary.

## R3 — conditional NVMe-backed production swap for G3 after G2 PASS

The production Docker root is still space-constrained, so G2 PASS alone must not trigger an unsafe image load. Before production mutation:

1. verify the pinned rollback image is present and healthy;
2. save the **current production image** to an NVMe archive under `/mnt/ssd-tmp/slate-tools/g3-rollback-staging/`, record its exact image ID and a cryptographic hash of the archive, and verify the archive is readable;
3. keep the pinned rollback image in the production Docker store; never delete it;
4. verify Slate/MySQL/local/public health and record current production container/image metadata;
5. calculate whether removing only the current production Slate container/image after stopping it would provide sufficient production Docker-root room for the exact candidate. Do not delete unrelated historical images in this proposal.

Only if the calculation is sufficient may G3 continue without another handoff. Then, within the already-authorized G3 production restart window:

- stop/remove only the current `slate-note4` application container as required by the reviewed deployment procedure; keep MySQL/persistent data intact;
- remove only the just-snapshotted current production application image if needed for space;
- load and verify the exact candidate image digest;
- if candidate load/start fails before the production smoke test, immediately restore the prior production image from the verified NVMe archive or the pinned rollback image and re-establish health;
- deploy only the exact reviewed G2-qualified candidate with the already-approved Developer API/Node-bridge production opt-ins and existing protected credential read-only;
- run the single authorized G3 EN/EN/JA synthetic provider session;
- on G3 FAIL/AMBIGUOUS, immediately restore the pinned rollback image/config and verify health;
- on G3 PASS, leave the candidate deployed only while all health gates are green and retain the NVMe prior-image archive until the terminal dossier/next physical-device decision is safely recorded.

If removing only the snapshotted current production application image is not sufficient to load the candidate, stop before production mutation. Do not delete rollback, volumes, persistent data, Deluge data, or unrelated historical images under this proposal.

## Cleanup

After G2/G3 evidence is durable:

- stop the host-native temporary G2 daemon;
- remove only its disposable NVMe daemon/runtime state after verifying no required artifact is stored only there;
- preserve the candidate/prior-production image archive on NVMe until the terminal production/rollback state is confirmed;
- preserve the Deluge reserve floor;
- do not alter production Docker data-root.

## True stop conditions

Stop only for:

1. host-native second `dockerd` cannot coexist safely with production Docker;
2. base-image or provider-disabled candidate control still fails before G2;
3. G2 provider failure after safe zero-provider forensics;
4. G2 PASS but the narrow current-image swap cannot create enough production Docker-root space;
5. rollback archive/image verification failure;
6. health degradation, source/image digest mismatch, credential/billing/Vertex/private-data/physical-device/firmware boundary;
7. unresolved P0/P1/security/privacy/data-integrity issue;
8. PR merge/release.

`REPORT-PUSH-INVARIANT.md` remains binding. Successful R0/R1, G2 PASS, NVMe snapshot creation, or pre-G3 checkpoints are not handoffs once a future activation authorizes this proposal.

## Execution addendum — host-native R1 and G2 result

Under the explicit NVMe-isolated runtime instruction, R0/R1 completed with a
host-native disposable Docker 29.1.3 daemon on `overlay2`, separate from the
production daemon. The base-image control exited 0 and the exact candidate's
provider-disabled Bun-parent/Node-child integration matrix passed 6/6 with
synthetic-only secret material and no network. No tracked product source
changed.

The one remaining G2 provider session then ran in the exact candidate image
with the existing protected host source mounted read-only at
`/run/secrets/gemini_api_key`. The durable result was captured independently
of the detached launcher and recovered after daemon shutdown. It contained
only structural fields and reported:

```text
G2_PROVIDER_SESSION=1_OF_1
G2_STATUS=FAIL
G2_FAILURE_CLASS=CONNECT_TIMEOUT
G2_READY=NO
G2_TURNS=0
G2_RECONNECT=NOT_RUN
G2_RAW_AUDIO_RETAINED=NO
G2_RAW_PROVIDER_PAYLOAD_RETAINED=NO
G2_RESULT_RECOVERED_AFTER_LAUNCHER_DISCONNECT=YES
G3_RUN=NO
G_PROVIDER_SESSIONS_USED=3_OF_3
```

No provider retry or G3 production mutation followed. The production Slate
rollback image and MySQL remained healthy with restart counts at zero, the
local health endpoint returned HTTP 200, the credential value was never read
or logged, and historical Docker images were not cleaned. This is the G2
provider-failure human boundary; a new authorization is required before any
additional provider or production action.
