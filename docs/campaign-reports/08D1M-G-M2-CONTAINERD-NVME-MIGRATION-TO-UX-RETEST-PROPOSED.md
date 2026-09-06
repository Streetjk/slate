# Campaign 8D1M-G — M2 containerd NVMe migration to UX retest — PROPOSED

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
State: `PROPOSED_NOT_AUTHORIZED`

## Trigger and current accepted state

M1 is complete and the production Docker `data-root` is successfully active on NVMe:

```text
M1_STATUS=PASS_NVME_DOCKER_ROOT_ACTIVE
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
SLATE=running/healthy/restarts=0
MYSQL=running/healthy/restarts=0
LOCAL_PUBLIC_HEALTH=HTTP_200
ORIGINAL_DOCKER_ROOT_PRESENT=YES
NVME_DOCKER_ROOT_PRESENT=YES
```

M2 then failed before Slate recreation while loading the exact reviewed UX candidate because persistent containerd ingestion still used the root filesystem:

```text
M2_STATUS=HARD_STOP_CONTAINERD_ROOT_CAPACITY
CONTAINERD_ROOT=/var/lib/containerd
ROOT_FREE_BYTES=8065024
NVME_FREE_BYTES=181218619392
M2_CANDIDATE_IMAGE=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
M2_DURABLE_TAR=/mnt/ssd-tmp/slate-tools/m2-ux-candidate.tar
M2_DURABLE_TAR_SHA256=cf47b8c4bb6aec65161d1c54e766bbf62f9a4ada1430fb5b86766231d7074865
M2_CANDIDATE_REGISTERED=NO
SLATE_RECREATED=NO
PRODUCTION_CHANGED=NO
```

This proposal does not treat the failed image load as a product defect. It is a storage-layout boundary.

## Recommendation

Use a structural fix rather than another root-disk cleanup:

1. move containerd's persistent **root** from `/var/lib/containerd` to a dedicated Slate NVMe path, proposed `/mnt/ssd-tmp/slate-tools/containerd-root`;
2. keep containerd runtime **state** under its existing volatile `/run/...` location unless live inspection proves otherwise;
3. preserve `/var/lib/containerd` untouched as rollback until terminal M4 adjudication;
4. do not repartition the NVMe and do not alter Deluge paths/data;
5. after verified containerd migration, retry the exact already-transferred candidate tar and continue the existing M2 -> M3 -> M4 chain.

Do not symlink `/var/lib/containerd` blindly. Use the supported live containerd configuration/service topology proven on the Orange Pi.

## NVMe reserve amendment — proposed with this activation

The historical 180 GB free-space floor is a conservative Deluge/other-use reserve, not a Slate technical requirement. Current NVMe free space is only about 181.2 GB, so retaining a 180 GB floor leaves about 1.2 GB working margin and is likely to recreate the same artificial storage stop during containerd migration/image ingestion.

This proposal therefore recommends, but does not activate until human `proceed`:

```text
NVME_MIN_FREE_RESERVE_GB=150
OLD_RESERVE_GB=180
RESERVE_CHANGE_REASON=ALLOW_BOUNDED_SLATE_DOCKER_CONTAINERD_WORKING_MARGIN
DELUGE_PATH_CHANGE=NO
REPARTITION=NO
```

The 150 GB figure remains a **minimum free-space reserve**, not an allocation target for Slate. If projected post-migration free space would fall below 150 GB, fail closed before mutation.

## Long-run stages after activation

### C0 — live topology and feasibility

Codex must first prove, without secret access:

- exact `containerd` version and service ownership;
- whether dockerd uses the system containerd service/socket or another managed instance;
- current persistent containerd root and volatile state paths;
- configuration source (`/etc/containerd/config.toml`, service flags, or equivalent);
- size of current persistent containerd root;
- current Docker root remains the NVMe Slate path;
- Slate/MySQL/local/public health remain green;
- destination collision is absent;
- projected post-copy/post-load NVMe free space remains >= 150 GB;
- Deluge path/state remains untouched.

If live topology does not support the proposed migration safely, stop before mutation and publish the exact topology instead of guessing.

### C1 — versioned fail-closed root migration artifact

If C0 proves a supported reversible path, use current routing:

```text
CONTROLLER=CODEX
WRITER=GEMINI_3_8_FLASH
INDEPENDENT_REVIEWER=GROK_4_6
```

Prepare a new versioned root script. Preserve every previous M1 script. The script must:

- require root and fail closed on unexpected arguments/topology;
- recheck Docker root, containerd root/state, production health, filesystem identity and >=150 GB projected reserve before mutation;
- capture exact current containerd configuration/service state for rollback without printing secrets;
- stop Docker cleanly before persistent containerd migration;
- stop containerd only if the proven service topology requires it;
- copy `/var/lib/containerd` faithfully using reviewed preservation semantics (`-aHAXS --numeric-ids` or exact equivalent);
- verify file/path/logical-size/symlink/hardlink structure and a checksum/itemized dry-run before switching configuration;
- configure only the proven persistent containerd root to `/mnt/ssd-tmp/slate-tools/containerd-root`;
- preserve volatile state semantics rather than relocating `/run` state onto NVMe;
- start containerd/Docker in the required order;
- verify containerd root, Docker NVMe root, expected images/network/volumes/containers, Slate/MySQL health, local/public HTTP 200 and restart stability;
- automatically restore the exact old containerd configuration/root and healthy production if any post-stop/switch gate fails;
- never delete `/var/lib/containerd`, `/var/lib/docker`, the NVMe Docker root, or the new NVMe containerd copy;
- never touch Deluge paths/data;
- never print/read credential values or private application payload contents.

Exact Grok 4.6 review is mandatory before manual sudo execution. Bounded Gemini 3.8 writer -> Codex validation -> Grok review -> bounded repair -> re-review is non-stopping.

### C2 — one manual sudo boundary

After one exact reviewed artifact is installed, remote SHA/type/mode/bash syntax are verified and a sanitized observer is armed, give the operator exactly one `ssh -t ... sudo ...` command.

If the root step fails, require healthy rollback evidence and do not tell the operator to rerun blindly.

### C3 — M2 resume without another stop

On verified containerd-NVMe PASS:

1. retry only the exact durable tar:
   `/mnt/ssd-tmp/slate-tools/m2-ux-candidate.tar`;
2. verify tar SHA-256 before load;
3. require registered image ID exactly
   `sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4`;
4. perform the already-authorized exact reviewed UX backend deployment;
5. verify Slate/MySQL health, local/public health, authenticated device polling and rollback availability;
6. publish M2 PASS and continue automatically.

### C4 — continue M3 -> M4

After M2 PASS continue under the existing authorization without intermediate human stops:

```text
M3 exact app-only NOTE4 firmware flash
-> M4 bounded combined EN/JA physical UX retest
```

The existing firmware/source/model pins and bounded Free Tier physical retest authority remain unchanged. No merge is authorized.

## Hard stops

Stop only for:

- live C0 topology contradicting the migration design;
- projected NVMe free space <150 GB;
- inability to preserve/restore exact containerd configuration;
- checksum/metadata mismatch;
- failed healthy rollback;
- new credential/billing/model/private-data scope;
- unresolved P0/P1/security finding;
- destructive cleanup or merge requirement;
- a new physical action outside the already-authorized M3/M4 scope.

Checkpoint/report pushes are not stops.

## Explicit non-authority while proposed

Until the human says `proceed`, this file authorizes **no** containerd stop, migration, configuration change, 180->150 GB reserve change, image retry, firmware flash, provider call, destructive cleanup or merge.

## Activated C0/C1 checkpoint

The human `proceed` activation was received. C0 was performed read-only and
confirmed the live topology supports the proposed reversible path:

```text
C0_STATUS=TOPOLOGY_COMPATIBLE
CONTAINERD_VERSION=2.2.1
CONTAINERD_SERVICE=containerd.service:active:enabled
CONTAINERD_EXECSTART=/usr/bin/containerd
CONTAINERD_ROOT=/var/lib/containerd
CONTAINERD_STATE=/run/containerd
DOCKER_CONTAINERD_SOCKET=/run/containerd/containerd.sock
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
DESTINATION_COLLISION=NONE
NVME_FILESYSTEM=ext4
NVME_FREE_BYTES=179743141888
TRANSFER_TAR_BYTES=1183010304
PROJECTED_FREE_AFTER_CONTAINERD_COPY_AND_TAR=178560131584
PROJECTED_RESERVE_150GB=PASS
SLATE=running/healthy/restarts=0
MYSQL=running/healthy/restarts=0
LOCAL_HEALTHZ=HTTP_200
PUBLIC_HEALTHZ=HTTP_200
DELUGE_SERVICE=active
DELUGE_WEB_SERVICE=active
DELUGE_PATHS_PRESENT=YES
PROVIDER_CALLS=0
PRODUCTION_MUTATION_BY_C0=NO
```

`/var/lib/containerd` is mode 700 and its exact byte size was not readable by
the unprivileged C0 probe. V1 therefore treats the size as an explicit
root-only preflight gate and fails closed before stopping either service if
root accounting is unavailable. No privileged command was run by Codex.

The bounded C1 artifact is present locally and passes deterministic syntax,
diff, and secret checks:

```text
C1_SCRIPT=scripts/slate-m2-containerd-rootstep-v1-nvme-reversible.sh
C1_SCRIPT_SHA256=84ab71aa5f126eb58ff70f34dd89d92c3d72cc3ea0335c9f3f9f07a522a757cd
C1_LOCAL_BASH_N=PASS
C1_LOCAL_DIFF_CHECK=PASS
C1_LOCAL_SECRET_SCAN=PASS
C1_GROK_REVIEW=REQUIRED_BEFORE_INSTALL
C1_MANUAL_SUDO=NOT_YET_READY
```

The script uses a systemd drop-in with only `--root
/mnt/ssd-tmp/slate-tools/containerd-root` and `--state /run/containerd`, keeps
the original persistent root as rollback, verifies the stopped trees with
structure metrics and checksum/itemized rsync dry-run, preserves the Docker
NVMe root, and leaves the candidate image load for C3. No provider call,
credential access, Docker-tree deletion, or production mutation occurred.
