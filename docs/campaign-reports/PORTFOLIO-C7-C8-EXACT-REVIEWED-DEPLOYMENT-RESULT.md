# Portfolio C7+C8 exact reviewed deployment result

Date: 2026-09-11 (Australia/Perth)

## Live reconciliation and authority

The live repository was reconciled before deployment. PR #2 was at
`eeb6e75edffabd0fc4db24e8f7a709a7793403d3` and remained OPEN / DRAFT /
UNMERGED. PRs #1, #3 and #4 also remained OPEN / DRAFT / UNMERGED.

The authorized candidate was verified without rebuilding or changing product
bytes:

```text
SOURCE=bdfbcc86e7b7e4c7ae49b9ee10469658fc854885
ARM64_IMAGE=sha256:f1a33bc31e6c44a0a5d1bf803e453f5ea3ec903e9e9972247e61d84b3e0693ce
PLATFORM=linux/arm64
REVIEW_STATUS=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
REVIEWED_SOURCE_MATCH=YES
REVIEWED_ARM64_IMAGE_MATCH=YES
PRODUCT_BYTE_DRIFT=0
IMAGE_CONFIG_ROOTFS_EQUIVALENCE=PASS
```

## Pre-deployment gates

```text
SLATE_PREDEPLOY_HEALTH=running|healthy
SLATE_PREDEPLOY_RESTART_COUNT=0
MYSQL_PREDEPLOY_HEALTH=running|healthy
MYSQL_PREDEPLOY_RESTART_COUNT=0
NETWORK_IDENTITY_PRESERVED=YES
GEMINI_CONFIG_QUALIFICATION=PASS_EXISTING_APPROVED_RUNTIME_PRESENT
SECRET_MOUNT_READONLY=YES
```

The pre-deployment runtime used the previously approved Gemini 2.5
configuration and protected read-only key-file mount. No provider session,
firmware action, NOTE4 action, OAuth, billing, credential, MySQL, or private
data action was performed.

## Activation attempt and safe rollback

The exact ARM64 image was transferred to production. Local and remote
rootfs/config fingerprints matched. The first Slate-only recreation used an
insufficient Compose override and produced a healthy container without the
approved `GEMINI_*` environment fields. This was a configuration-continuity
failure, not a product-artifact substitution.

```text
ACTIVATION_ATTEMPT=FAIL_CONFIG_CONTINUITY_MISSING_APPROVED_GEMINI_ENV
CANDIDATE_CONTAINER_HEALTH=healthy
CANDIDATE_SECRET_MOUNT_READONLY=YES
CANDIDATE_RUNTIME_PROVIDER_CALL=0
ROLLBACK_SCOPE=SLATE_APPLICATION_ONLY
MYSQL_RECREATED=NO
NOTE4_MUTATED=NO
```

Slate was rolled back using the established approved configuration override to
the prior known-good image, with MySQL and its data preserved. No production
provider call occurred.

## Corrected exact activation and requalification

The same explicit deployment authority covered activation of the unchanged
candidate as required. A second Slate-only recreation used the established
approved Gemini environment and read-only secret-mount override.

```text
RUNNING_SOURCE_MATCH=YES
RUNNING_IMAGE_MATCH=YES_LOAD_EQUIVALENCE
RUNNING_BACKEND_TAG=slate:c7-c8-weather-fallback-p2-bdfbcc8
RUNNING_BACKEND_REMOTE_LOAD_ID=sha256:7ad686547477876e65d3fbba30340751dedc2d4f2df0e5674998d3192a988a6d
RUNNING_PLATFORM=linux/arm64
SLATE_HEALTH=running|healthy
SLATE_RESTART_COUNT=0
MYSQL_HEALTH=running|healthy
MYSQL_RESTART_COUNT=0_UNCHANGED
MYSQL_IDENTITY_PRESERVED=YES
LOCAL_HTTP_HEALTH=HTTP_200
PUBLIC_HTTP_HEALTH=HTTP_200
NETWORK_IDENTITY_PRESERVED=YES
GEMINI_CONFIG_QUALIFICATION=PASS_APPROVED_VALUES_PRESENT
SECRET_MOUNT_READONLY=YES
NOTE4_AUTHENTICATED_POLL=PASS_EXISTING_SANITIZED_MARKER
FATAL_MARKERS=0_IN_POSTACTIVATION_WINDOW
```

The verified non-secret Gemini configuration classes remained the approved
Developer API-key mode, Gemini 2.5 native-audio model, `node_bridge` runtime,
and existing bridge executable/script. Secret values and headers were never
printed or retained.

A bounded sanitized observer self-test passed. A short observer window
confirmed serial connectivity and backend health; the long-lived observer is
currently attached to the controller session and retains structural markers
only.

```text
OBSERVER_SELF_TEST=PASS
OBSERVER_STATE=ARMED_CONNECTED_SANITIZED
OBSERVER_RAW_CONTENT=NOT_RETAINED
```

## Current boundary

Deployment PASS does not claim physical acceptance. No firmware flash, NOTE4
reset, re-pair, Wi-Fi change, provider qualification call, or physical test
was performed under this authority. The next and only requested action is the
separate bounded combined C7+C8 NOTE4 physical acceptance already specified
by the deployment-boundary directive.

```text
PHYSICAL_ACCEPTANCE=NOT_STARTED
PHYSICAL_ACCEPTANCE_AUTHORITY=SEPARATE_NEXT_BOUNDARY
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=0
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=ONE_BOUNDED_COMBINED_C7_C8_NOTE4_PHYSICAL_ACCEPTANCE
NEXT_ACTION=AWAIT_ONE_BOUNDED_COMBINED_C7_C8_NOTE4_PHYSICAL_ACCEPTANCE
```

PRs #1, #2, #3 and #4 remain OPEN / DRAFT / UNMERGED. Campaign 9 remains
parked and Campaign 10 remains isolated and undeployed.
