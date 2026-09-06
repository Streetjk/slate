# Campaign 8D1M-G — M2 containerd root-capacity hard stop

```text
CAMPAIGN=8D1M_G_UX_FIX_DEPLOY_AND_PHYSICAL_RETEST
STATUS=M2_HARD_STOP_CONTAINERD_ROOT_CAPACITY
M1_STATUS=PASS_NVME_DOCKER_ROOT_ACTIVE
M2_STATUS=BLOCKED_BEFORE_SLATE_RECREATION
M2_CANDIDATE_IMAGE=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
M2_CANDIDATE_REGISTERED=NO
M2_LOAD_FAILURE=NO_SPACE_IN_VAR_LIB_CONTAINERD
M2_DURABLE_TAR=/mnt/ssd-tmp/slate-tools/m2-ux-candidate.tar
M2_DURABLE_TAR_BYTES=1183010304
M2_DURABLE_TAR_SHA256=cf47b8c4bb6aec65161d1c54e766bbf62f9a4ada1430fb5b86766231d7074865
CONTAINERD_ROOT=/var/lib/containerd
ROOT_FREE_BYTES=8065024
NVME_FREE_BYTES=181218619392
NVME_RESERVE_FLOOR=PASS
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
DOCKER_DAEMON=active
SLATE=running/healthy/restarts=0
MYSQL=running/healthy/restarts=0
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
CURRENT_IMAGE_VISIBLE=YES
ROLLBACK_IMAGE_VISIBLE=YES
MYSQL_IMAGE_VISIBLE=YES
EXPECTED_NETWORK=YES
ORIGINAL_ROOT_PRESENT=YES
NVME_ROOT_PRESENT=YES
DELUGE_MUTATION=NOT_OBSERVED
SLATE_RECREATED=NO
PRODUCTION_CHANGED=NO
PRODUCTION_ROLLBACK_REQUIRED=NO
PROVIDER_CALLS=0
M3_STATUS=BLOCKED_M2_NOT_PASS
M4_STATUS=BLOCKED_M2_NOT_PASS
NEXT_ACTION=HUMAN_DECISION_ON_CONTAINERD_STORAGE_BOUNDARY
```

The exact candidate tar was transferred to the NVMe Slate tools path and
loaded independently. The load failed with a sanitized Docker/containerd
capacity error under `/var/lib/containerd`; the candidate did not register and
the running Slate/MySQL stack was not recreated. An earlier direct stream and
one compressed same-artifact recovery both stalled before registration. No
Docker-tree deletion or cleanup was performed, and the durable tar remains
available for a separately authorized recovery decision.

This is a new infrastructure boundary: Docker reports its data-root on NVMe,
but containerd content ingestion still requires free space on the original
root. Moving or reclaiming containerd state would be a separate storage and
production mutation and is not assumed here.
