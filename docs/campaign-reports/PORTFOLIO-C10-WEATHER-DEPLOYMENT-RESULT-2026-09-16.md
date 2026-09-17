# C10 Weather application deployment result — 2026-09-16

This report records the separately authorized Weather application activation
only. NOTE4 serial/Voice/physical state, firmware, MySQL, provider/auth
configuration, OAuth, credentials, billing, and unrelated services were not
changed.

## Exact lineage and transfer

```text
REVIEWED_SOURCE=8a5008f0c6d8b37f125b7d868fdebdbf526be9cc
REVIEWED_LOCAL_IMAGE=sha256:4af8ff25c3ca3ba8a7de7a48d72d3340b7a43837c2cb2efc219be7ed5f33d33
REVIEWED_PLATFORM=linux/arm64
ROLLBACK_LOCAL_IMAGE=sha256:821de0092acd4aa121984a9a9f2f16a7fb26254580f2ed6b62a970dc4eb94dfb
REMOTE_CANDIDATE_TRANSPORT_ID=sha256:404c5a730b576191e647ca48ddd6ec9f8d7bfb702538890e4ee533ba957c0977
REMOTE_ROLLBACK_TRANSPORT_ID=sha256:77985df4945623379970f67cb62d04bd4854a86496064ac184e8273033cc9eaa
CANDIDATE_PLATFORM=linux/arm64
ROLLBACK_PLATFORM=linux/arm64
ROOTFS_EQUIVALENCE=PASS
SEMANTIC_NONSECRET_IMAGE_CONFIG_EQUIVALENCE=PASS
ROLLBACK_IMAGE_PRESENT=YES
```

The candidate and rollback were transferred through the established streamed
Docker save/load path. Docker assigned daemon-local transport IDs; those IDs
are not claimed to be the local image IDs. RootFS and semantic non-secret
image configuration matched before activation.

## Preconditions and activation

```text
COMPOSE_PROJECT=slate-note4-deploy
COMPOSE_SCOPE=SLATE_SERVICE_ONLY
COMPOSE_IMAGE_OVERRIDE=slate:c10-weather-wmo-8a5008f
COMPOSE_FLAGS=--no-build --pull never --no-deps --force-recreate slate
PRE_SLATE=running_healthy
PRE_SLATE_RESTART_COUNT=0
PRE_MYSQL_ID=57daa908973e7e2ea8db4ab209738ae27310cae4f3c6a8c71dc7f205a5c26ea5
PRE_MYSQL_RESTART_COUNT=0
SECRET_MOUNT_PRECONDITION=READ_ONLY
DATA_MOUNT_PRECONDITION=READ_WRITE
```

Two controller-wrapper checks stopped before container mutation: a POSIX-shell
syntax guard and an over-strict check that misclassified the inert Compose
`build:` stanza. The final portable invocation used `--no-build --pull never`
and recreated only the Slate service. MySQL was not recreated or restarted.

## Post-deployment verification

```text
RUNNING_REMOTE_IMAGE_ID=sha256:404c5a730b576191e647ca48ddd6ec9f8d7bfb702538890e4ee533ba957c0977
RUNNING_IMAGE_LOAD_EQUIVALENCE=PASS
RUNNING_ROOTFS_EQUIVALENCE=PASS
RUNNING_SEMANTIC_CONFIG_EQUIVALENCE=PASS
SLATE=running_healthy
SLATE_RESTART_COUNT=0
MYSQL_ID=57daa908973e7e2ea8db4ab209738ae27310cae4f3c6a8c71dc7f205a5c26ea5
MYSQL_IDENTITY_PRESERVED=YES
MYSQL=running_healthy
MYSQL_RESTART_COUNT=0
NETWORK_IDENTITY_PRESERVED=YES
SLATE_MOUNTS_PRESERVED=YES
MYSQL_MOUNTS_PRESERVED=YES
SECRET_MOUNT_READONLY=YES
DATA_MOUNT_RW=YES
APPROVED_RUNTIME_CONFIG_PRESERVED=YES
LOCAL_HTTP_HEALTH=HTTP_200
PUBLIC_HTTP_HEALTH=HTTP_200
FATAL_MARKERS=0
WEATHER_RUNTIME_SMOKE=PASS_RUNNING_ROOTFS_REPRESENTATIVE_REVIEWED_ASSETS_PRESENT
```

The runtime smoke checked representative reviewed Weather assets in the
running rootfs. It is not a new provider fetch or a device-display result.
`NOTE4_AUTHENTICATED_POLL` remains unknown because NOTE4 was intentionally not
touched:

```text
NOTE4_SERIAL_VOICE_PHYSICAL=NOT_TOUCHED
NOTE4_AUTHENTICATED_POLL=UNKNOWN_POST_ACTIVATION_NO_FRESH_SANITIZED_MARKER
```

## Fresh deployment review

```text
REVIEWER=grok -m grok-4.6
VERDICT=PASS
P0=none
P1=NOTE4_AUTHENTICATED_POLL_UNKNOWN_OUT_OF_SCOPE
P2=WEATHER_SMOKE_IS_ROOTFS_ASSET_PRESENCE_NOT_LIVE_PROVIDER_FETCH
SECURITY=none
REVIEWED_SOURCE=8a5008f0c6d8b37f125b7d868fdebdbf526be9cc
REVIEWED_LOCAL_IMAGE=sha256:4af8ff25c3ca3ba8a7de7a48d72d3340b7a43837c2cb2efc219be7ed5f33d33
REVIEWED_REMOTE_TRANSPORT_ID=sha256:404c5a730b576191e647ca48ddd6ec9f8d7bfb702538890e4ee533ba957c0977
DEPLOYMENT_RESULT=PASS_WITH_LIMITATION
ROLLBACK_REQUIRED=NO
```

The review found no deployment defect and no rollback trigger. The P1/P2
entries are explicit scope limitations, not claims about NOTE4 or a live
Weather provider response.

## Remaining boundaries

```text
WEATHER_DEPLOYED=YES_APPLICATION_ONLY
U6CA2_FIRMWARE_FLASH=SEPARATE_AUTHORITY_REQUIRED
PHYSICAL_REQUALIFICATION=UNCHANGED_NOT_AUTHORIZED_BY_THIS_DEPLOYMENT
OBSERVER_NONINTERFERENCE_PROVEN=NO
RESET_CAUSE_ATTRIBUTION=UNKNOWN
```
