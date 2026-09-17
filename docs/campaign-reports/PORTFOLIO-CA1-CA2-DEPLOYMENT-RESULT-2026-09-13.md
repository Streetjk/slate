# CA-1 / CA-2 Exact Backend Deployment Result

Date: 2026-09-13 (Australia/Perth)

## Authority and lineage

```text
PR2_HANDOFF_HEAD=85f2d90f1e8c1e82b6825070f2c6a07eab0192f5
PR2_STATE=OPEN_DRAFT_UNMERGED
REVIEWED_SOURCE=1cb585a6d554e1eddd3b3ed8300a7e3252e3bc31
REVIEWED_BACKEND_IMAGE=sha256:1201ca661bc5a7e7e775f4bf0f67964852b77d31c23aa17156ba766df232ae8e
REVIEWED_PLATFORM=linux/arm64
REVIEWED_COLLECTOR=m4-sanitized-structural-v3|sha256:6140c29148d35a29fc95a1a77141323e4d3f1037669620b4353b8b7ed31a9f29
REVIEW=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
FIRMWARE_FLASH=NO
```

PRs #1–#4 were reconciled as OPEN / DRAFT / UNMERGED before activation.

## Exact image transfer and identity

The local reviewed image was not rebuilt. It was transferred with
`docker save | gzip | ssh | docker load`; Orange Pi assigned daemon-local
identity `sha256:c2bed4492ba5bd8d541ec44d8b805383349433a9bc61635611903a3ac434cb4c`.
The loaded image was tagged without changing bytes and used with Compose
`--no-build --pull never`.

```text
CANDIDATE_REMOTE_IMAGE_ID=sha256:c2bed4492ba5bd8d541ec44d8b805383349433a9bc61635611903a3ac434cb4c
CANDIDATE_ARCH=arm64
CANDIDATE_OS=linux
CANDIDATE_ROOTFS_SHA256=f2875c620a0e80d857826772b518810d8d2b300e937ce42b74c7f7bf4dd6cdbc
REVIEWED_LOCAL_ROOTFS_SHA256=f2875c620a0e80d857826772b518810d8d2b300e937ce42b74c7f7bf4dd6cdbc
CANDIDATE_CONFIG_SHA256=ef66648a2cd2e541bacc45a01bba496f2aad2f45cf04574919e9d62cb4ff98a0
REVIEWED_LOCAL_CONFIG_SHA256=ef66648a2cd2e541bacc45a01bba496f2aad2f45cf04574919e9d62cb4ff98a0
ROOTFS_AND_RUNTIME_CONFIG_EQUIVALENCE=PASS
```

The first attempted Compose invocation was stopped when the base file began an
unintended build. No production container changed in that attempt. The
successful invocation explicitly used `--no-build --pull never`.

## Deployment and rollback

The Slate application was recreated only with `--no-deps`; MySQL was not
recreated. The candidate passed its startup/stability checks, including image
identity, health, local/public HTTP, MySQL preservation, network preservation,
secret mount read-only state and zero fatal markers. A later post-deploy audit
found the candidate container absent and port 3001 unavailable. The exact
previous Slate container was restored through the application-only rollback.

```text
DEPLOYMENT_RESULT=FAIL_ROLLED_BACK_APPLICATION_ONLY
CANDIDATE_STARTUP_HEALTH=PASS
CANDIDATE_RUNNING_IMAGE_ID=sha256:c2bed4492ba5bd8d541ec44d8b805383349433a9bc61635611903a3ac434cb4c
CANDIDATE_SLATE_RESTART_COUNT=0
CANDIDATE_MYSQL_IDENTITY_PRESERVED=YES
CANDIDATE_MYSQL_RESTART_COUNT=0
CANDIDATE_NETWORK_IDENTITY_PRESERVED=YES
CANDIDATE_SECRET_MOUNT_READONLY=YES
CANDIDATE_FATAL_MARKERS=0
CANDIDATE_LOCAL_HTTP=HTTP_200
CANDIDATE_PUBLIC_HTTP=HTTP_200
FINAL_CANDIDATE_PRESENCE=NOT_PRESENT_AT_FINAL_POSTDEPLOY_AUDIT
DEPLOYMENT_FAILURE_BOUNDARY=RUNNING_CANDIDATE_CONTAINER_NOT_PRESENT_AT_FINAL_POSTDEPLOY_AUDIT
DEPLOYMENT_FAILURE_CAUSE=UNKNOWN
ROLLBACK_RESULT=PASS_APPLICATION_ONLY
ROLLBACK_IMAGE=sha256:359c562815e101b37071dfa75155b0fa18171bde75bd4eca2e4ffdfa18b04e32
ROLLBACK_SLATE=running_healthy
ROLLBACK_SLATE_RESTART_COUNT=0
ROLLBACK_MYSQL=running_healthy
ROLLBACK_MYSQL_CONTAINER_ID_PRESERVED=YES
ROLLBACK_MYSQL_RESTART_COUNT=0
ROLLBACK_LOCAL_HTTP=HTTP_200
ROLLBACK_PUBLIC_HTTP=HTTP_200
```

The Docker root remained `/mnt/ssd-tmp/slate-tools/docker-data`; containerd
and Docker remained active. Persistent Slate and MySQL data directories were
present, and Deluge/Tailscale services remained active. No firmware, NOTE4,
provider/model/auth, OAuth, billing, C9, C10, merge or release action occurred.

## NOTE4 and next boundary

```text
NOTE4_AUTHENTICATED_POLL=NOT_OBSERVED_POST_DEPLOYMENT_WINDOW
PHYSICAL_TEST=NOT_RUN
PHYSICAL_ACCEPTANCE=NOT_CONSUMED
NEXT_ACTION=STOP_AND_REQUIRE_ADJUDICATION_OF_CANDIDATE_CONTAINER_DISAPPEARANCE_BEFORE_ANY_RETRY
```

No physical NOTE4 action was performed. The exact candidate remains loaded on
Orange Pi but is not active. No retry or physical requalification is implied
by this report.
