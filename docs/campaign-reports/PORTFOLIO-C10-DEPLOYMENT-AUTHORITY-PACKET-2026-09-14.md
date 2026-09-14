# C10 Deployment Authority Packet — 2026-09-14

Preparation only. This packet does not authorize or perform deployment.

## Exact lineage

```text
C10_PR=4
C10_PR_HEAD=6251317327b52cc08021e1fd6956955b300333c3
REVIEWED_PRODUCT_SOURCE=965f1a605ff47b64dee20b36c68597db5760b46f
BUILD_SOURCE_HEAD=f858741dad5abb0712a1681b2eabd83f3adbd9f7
SOURCE_TREE=f20077377060efdb3256c4c55804957cdf037bd3
IMAGE_TAG=slate:c10-f858741-arm64
EXACT_IMAGE_ID=sha256:821de0092acd4aa121984a9a9f2f16a7fb26254580f2ed6b62a970dc4eb94dfb
PLATFORM=linux/arm64
TRANSPORT_DIGEST=NOT_AVAILABLE_LOCAL_LOAD_ONLY
ROLLBACK_IMAGE_ID=sha256:bc755aa2aa78017b327e1f12bf91bebd1f3446f36f8f0def5b328087288207ae
ROLLBACK_PLATFORM=linux/arm64
C10_ARTIFACT_REVIEW=PASS_P0_0_P1_0_P2_DOCUMENTED_LIMITATIONS_SECURITY_PASS
C10_DEPLOYMENT_AUTHORIZED=NO
C10_DEPLOYED=NO
C10_RUNTIME_HEALTH=UNKNOWN_UNTESTED
```

The exact candidate was built from the established Dockerfile for
`linux/arm64`. It is a local Docker load, not a registry publication; no
transport or registry digest is claimed. A deployment host must therefore
verify the exact image ID after an approved, controlled image transfer or
pre-load. The rollback image is pinned by immutable image ID, not by its
historical tag or base-image OCI revision label.

Required provider scope in the candidate is Codex, AGY/Gemini, and Claude.
Grok is additive and does not replace Claude. The implementation uses only
bounded local `--version` capability probes, has no supported machine-readable
subscription-quota source, and does not fabricate quota or session metrics.

## Preconditions for a future separate deployment request

Before any mutation, the authorized operator and controller must verify:

```text
SOURCE_LINEAGE_MATCH=YES
IMAGE_ID_MATCH=YES
IMAGE_PLATFORM_MATCH=YES
ROLLBACK_IMAGE_ID_PRESENT=YES
IMAGE_TRANSFER_IDENTITY_RECHECK=PASS
DEPLOYMENT_CONFIGURATION_NONSECRET_VALUES_MATCH_APPROVED_CONFIG=YES
SECRET_MOUNT_READONLY=YES
MYSQL_IDENTITY_AND_DATA_SNAPSHOT_VERIFIED=YES
NETWORK_IDENTITY_SNAPSHOT_VERIFIED=YES
CURRENT_SLATE_RESTART_BASELINE_CAPTURED=YES
CURRENT_MYSQL_RESTART_BASELINE_CAPTURED=YES
```

No credential values, account identifiers, private provider payloads, or
private connected-application content belong in this packet.

## Allowed deployment-scope checks

Only under a new explicit deployment authority may the controller replace the
Slate application container with the exact image above and verify:

```text
RUNNING_IMAGE_ID_MATCH=YES
RUNNING_ROOTFS_EQUIVALENCE=YES
SLATE_HEALTH=RUNNING_HEALTHY
SLATE_RESTART_COUNT=ZERO_OR_NO_UNEXPECTED_INCREASE
MYSQL_HEALTH=RUNNING_HEALTHY
MYSQL_IDENTITY_PRESERVED=YES
MYSQL_DATA_PRESERVED=YES
LOCAL_HTTP_HEALTH=HTTP_200
PUBLIC_HTTP_HEALTH=HTTP_200
NETWORK_IDENTITY_PRESERVED=YES
SECRET_MOUNT_READONLY=YES
FATAL_MARKERS=0
```

Any already-authorized authenticated NOTE4 poll may be recorded as a
sanitized structural result, but this C10 packet does not authorize serial
access, Voice, a physical test, or a new device interaction. The current
post-activation NOTE4 poll remains:

```text
NOTE4_AUTHENTICATED_POLL=UNKNOWN_POST_ACTIVATION_NO_FRESH_SANITIZED_MARKER
```

## Rollback triggers and recovery

Fail closed and restore only the application to the pinned rollback image if
any exact identity, platform, rootfs, health, restart, HTTP, MySQL/data,
network, secret-mount, or fatal-marker check fails. Preserve MySQL, persistent
data, network/device identity, pairing, provider/auth configuration, and the
rollback image. Do not use database recreation or broad cleanup to force a
pass. Record the rollback result and stop for technical adjudication.

## Explicit exclusions

This packet does not authorize:

- firmware flash, reset, serial access, or physical NOTE4 acceptance;
- provider/model/auth changes, usage/quota calls, OAuth, credentials, or
  billing changes;
- C7 Outlook consent or private calendar access;
- C9 activation or research-lane unpark;
- C10 production data mutation beyond the application deployment itself;
- MySQL recreation, network/Wi-Fi changes, merge, or release.

The C10 implementation and exact local artifact are reviewed and ready for a
separate deployment decision. Production runtime and database health are
intentionally `UNKNOWN_UNTESTED` until that authority exists.

## Current portfolio relationship

The current core boundary remains the prepared no-serial physical acceptance:

```text
CORE_BOUNDARY=NO_SERIAL_PHYSICAL_ACCEPTANCE_PREPARED_HUMAN_BOUNDARY
PHYSICAL_REQUALIFICATION_CONSUMED=NO
REQUALIFICATION_WINDOW_ARMED=NO
OBSERVER_NONINTERFERENCE_PROVEN=NO
RESET_CAUSE_ATTRIBUTION=UNKNOWN
```

C10 deployment is a separate human gate and does not consume or replace the
core physical window.
