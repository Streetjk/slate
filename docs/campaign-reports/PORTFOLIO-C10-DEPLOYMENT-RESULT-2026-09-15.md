# C10 Exact Application Deployment Result — 2026-09-15

## Scope and lineage

This report records the operator-authorized Gate 2 application deployment only.
No firmware, NOTE4 serial/Voice/physical interaction, reset, Wi-Fi, provider,
OAuth, credential, billing, MySQL, merge, or release action was performed.

```text
PR4_HANDOFF_HEAD=6251317327b52cc08021e1fd6956955b300333c3
REVIEWED_PRODUCT_SOURCE=965f1a605ff47b64dee20b36c68597db5760b46f
REVIEWED_BUILD_SOURCE_HEAD=f858741dad5abb0712a1681b2eabd83f3adbd9f7
REVIEWED_SOURCE_TREE=f20077377060efdb3256c4c55804957cdf037bd3
REVIEWED_LOCAL_IMAGE=sha256:821de0092acd4aa121984a9a9f2f16a7fb26254580f2ed6b62a970dc4eb94dfb
REVIEWED_PLATFORM=linux/arm64
ROLLBACK_LOCAL_IMAGE=sha256:bc755aa2aa78017b327e1f12bf91bebd1f3446f36f8f0def5b328087288207ae
C10_ARTIFACT_REVIEW=PASS_P0_0_P1_0_P2_DOCUMENTED_LIMITATIONS_SECURITY_PASS
```

## Transfer and pre-mutation gates

The exact local images were transferred with the established streamed
Docker-save/Docker-load path. Docker assigned daemon-local transport IDs; the
artifact identity was bound by platform, complete RootFS layer-chain equality,
and canonical image-config equality rather than by treating transport IDs as
the local reviewed ID.

```text
CANDIDATE_REMOTE_TRANSPORT_IMAGE=sha256:77985df4945623379970f67cb62d04bd4854a86496064ac184e8273033cc9eaa
ROLLBACK_REMOTE_TRANSPORT_IMAGE=sha256:359c562815e101b37071dfa75155b0fa18171bde75bd4eca2e4ffdfa18b04e32
CANDIDATE_PLATFORM=linux/arm64
ROLLBACK_PLATFORM=linux/arm64
CANDIDATE_ROOTFS_CONFIG_EQUIVALENCE=PASS
ROLLBACK_ROOTFS_CONFIG_EQUIVALENCE=PASS
ROLLBACK_IMAGE_PRESENT=YES
IMAGE_TRANSFER_IDENTITY_RECHECK=PASS
COMPOSE_OVERRIDE_SCOPE=SLATE_IMAGE_ONLY
COMPOSE_FLAGS=NO_BUILD_PULL_NEVER_NO_DEPS_FORCE_RECREATE_SLATE
```

Before mutation, Slate and MySQL were running/healthy with restart counts of
zero. The MySQL container identity was captured, the existing persistent data
mounts and network identity were captured, the approved non-secret Compose
configuration was retained, and the existing Gemini secret mount was verified
read-only. No secret value was printed or inspected.

## Deployment and verification

Only the `slate` service in the existing `slate-note4-deploy` Compose project
was recreated. MySQL was not recreated or restarted.

```text
DEPLOYMENT_RESULT=PASS_EXACT_REVIEWED_C10_APPLICATION
SLATE_RUNNING_IMAGE_CONFIG=slate:c10-f858741-arm64
SLATE_RUNNING_TRANSPORT_IMAGE=sha256:77985df4945623379970f67cb62d04bd4854a86496064ac184e8273033cc9eaa
SLATE_RUNNING_PLATFORM=linux/arm64
RUNNING_ROOTFS_EQUIVALENCE=PASS
RUNNING_CANONICAL_CONFIG_EQUIVALENCE=PASS
SLATE_HEALTH=running_healthy
SLATE_RESTART_COUNT=0
MYSQL_HEALTH=running_healthy
MYSQL_CONTAINER_ID_PRESERVED=YES
MYSQL_RESTART_COUNT=0
DOCKER_ROOT_PRESERVED=YES
NETWORK_ID_PRESERVED=YES
PERSISTENT_DATA_MOUNTS_PRESERVED=YES
SECRET_MOUNT_READONLY=YES
LOCAL_HTTP_HEALTH=HTTP_200
PUBLIC_HTTP_HEALTH=HTTP_200
FATAL_MARKERS=0
```

The bounded non-private C10 smoke produced:

```text
C10_UI_SMOKE=HTTP_200
C10_API_SMOKE=HTTP_404_DOCUMENTED_BACKEND_ROUTE_NOT_EXPOSED
C10_API_SCHEMA=NOT_APPLICABLE
C10_PROVIDER_QUOTA_ACCOUNT_CALLS=0_OBSERVED
```

The API `404` is retained as a product/source limitation already present in
the reviewed C10 readiness evidence. It is not converted into a fabricated
quota pass, and no quota, subscription, session, account, or provider metric
was inferred. The UI and application health surface are available.

## Fresh exact deployment review

```text
FINAL_GROK_DEPLOYMENT_REVIEW=PASS
FINAL_GROK_P0=0
FINAL_GROK_P1=0
FINAL_GROK_P2=0
FINAL_GROK_SECURITY=0
FINAL_GROK_REVIEWED_SOURCE=965f1a605ff47b64dee20b36c68597db5760b46f
FINAL_GROK_REVIEWED_LOCAL_IMAGE=sha256:821de0092acd4aa121984a9a9f2f16a7fb26254580f2ed6b62a970dc4eb94dfb
FINAL_GROK_REVIEWED_REMOTE_TRANSPORT_IMAGE=sha256:77985df4945623379970f67cb62d04bd4854a86496064ac184e8273033cc9eaa
FINAL_GROK_DEPLOYMENT_RESULT=PASS_WITH_DOCUMENTED_LIMITATION
```

Grok confirmed that the transport ID difference is not artifact drift because
RootFS and canonical image config match, and that the C10 API `404` remains a
documented limitation. No rollback was indicated.

## Boundaries preserved

```text
NOTE4_SERIAL_VOICE_PHYSICAL=NOT_TOUCHED
FIRMWARE_FLASH=NO
PHYSICAL_REQUALIFICATION_CONSUMED=NO
REQUALIFICATION_WINDOW_ARMED=NO
OBSERVER_NONINTERFERENCE_PROVEN=NO
RESET_CAUSE_ATTRIBUTION=UNKNOWN
```

Next action is the separate existing core no-serial physical-acceptance
boundary. This deployment result does not consume, authorize, or broaden that
window.
