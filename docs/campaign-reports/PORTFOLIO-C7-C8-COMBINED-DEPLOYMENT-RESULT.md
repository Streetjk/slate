# Portfolio C7+C8 combined deployment result and physical acceptance arm

Date: 2026-09-10 (Australia/Perth)

The explicitly authorized exact combined backend boundary was consumed. Only
the Slate backend container was recreated. No provider session, firmware
flash, NOTE4 reset, re-pair, Wi-Fi change, MySQL recreation, credential change,
OAuth action, billing action or private-data expansion occurred.

```text
AUTHORIZATION_PROVENANCE=EXPLICIT_OPERATOR_INSTRUCTION_AVAILABLE
AUTHORITY_TYPE=EXACT_COMBINED_C7_C8_BACKEND_DEPLOYMENT_AND_ONE_BOUNDED_NOTE4_PHYSICAL_ACCEPTANCE
SOURCE_COMMIT=20c4c3eed2e2d87fd4570039b29e5e5fa64e89d4
BACKEND_TAG=slate:m4-c7-c8-combined-8fcf7c6
AUTHORIZED_ARM64_IMAGE_ID=sha256:9c3e557d8a2df7a1ffd8d15292e7ccc8134be4893c69ad2740691866eb35768f
RUNNING_REMOTE_IMAGE_ID=sha256:f84fcde837a113ea940f43eb0f828df18f72726f4e9db8432794eaf9a8926bf3
IMAGE_CONFIG_ROOTFS_COMPARISON=PASS
```

The remote Docker image ID is a load representation difference. The
architecture, OS, user/workdir, entrypoint/cmd, environment-array and rootfs
layer-list structural hash matched the local frozen artifact.

## Post-deployment gates

```text
RUNNING_BACKEND_IDENTITY=slate:m4-c7-c8-combined-8fcf7c6|sha256:f84fcde837a113ea940f43eb0f828df18f72726f4e9db8432794eaf9a8926bf3|arm64
SLATE_HEALTH=running|healthy
SLATE_RESTART_COUNT=0_POST_RECREATE
MYSQL_HEALTH=running|healthy
MYSQL_RESTART_COUNT=0_UNCHANGED
PUBLIC_HEALTH=HTTP_200
LOCAL_HEALTH=HTTP_200
GEMINI_CONFIG_QUALIFICATION=PASS
SECRET_MOUNT_READONLY=PASS
NOTE4_AUTHENTICATED_POLL=PASS_POST_DEPLOYMENT_STRUCTURAL_LOG
OBSERVER_SELF_TEST=PASS
OBSERVER_STATE=ARMED_CONNECTED_SANITIZED
OBSERVER_RAW_CONTENT=NOT_RETAINED
FIRMWARE_CHANGED=NO
FIRMWARE_FLASHED=NO
```

The approved Gemini provider, Gemini 2.5 native-audio model, Developer API-key
auth mode, protected credential path, read-only mount, database and network
were preserved. No unsupported Gemini 2.5 `languageCodes` field was added.

## Physical acceptance arm

All pre-acceptance gates pass. Exactly one operator package is now armed. It
contains ordinary NOTE4 navigation plus one continuous Voice AI session of up
to six short, non-sensitive turns. No reset or power cycle is part of it.

During the package, only sanitized structural evidence may be retained. The
operator-visible result must be ingested once; no blind retry is authorized.

```text
PHYSICAL_ACCEPTANCE_ARMED=YES
PHYSICAL_ACCEPTANCE_COUNT=1
PHYSICAL_RESET=NO
PHYSICAL_POWER_CYCLE=NO
PROVIDER_SESSION_ADDITIONAL=NO
NEXT_ACTION=ONE_COMBINED_C7_C8_NOTE4_PHYSICAL_ACCEPTANCE
```
