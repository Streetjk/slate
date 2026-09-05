# Campaign 8D1M-G — PROPOSED Corrected G2 -> Conditional G3 Continuation

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Resume the Gemini 2.5 native-audio quick path after the zero-provider network differential proved that the failed G2 `CONNECT_TIMEOUT` was caused by the disposable host-native Docker daemon inheriting the helper container's `--network none` namespace. The exact reviewed candidate now has a deterministic, zero-provider-proven network correction: launch the disposable daemon with explicit Orange Pi host network-namespace entry while keeping its Docker state isolated on NVMe.

This proposal deliberately bundles the corrected G2 provider run and the already-planned conditional G3 production run so there is no new handoff between them if G2 passes.

## Accepted evidence

```text
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
ARM64_IMAGE_SHA=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
GROK_4_6_REVIEW=PASS_P0_P1_P2_P3_ZERO
BASELINE_EQUIVALENCE=PASS
G1_NATIVE_AUDIO=PASS
HISTORICAL_G2_RESULT=FAIL_CONNECT_TIMEOUT
HISTORICAL_G2_PROVIDER_SESSIONS_USED=1
HISTORICAL_G_PROVIDER_POOL=3_OF_3_EXHAUSTED
G2_FAILURE_ROOT_CAUSE=DISPOSABLE_DAEMON_INHERITED_HELPER_NONE_NETNS
G2_NETWORK_CORRECTION=PASS_EXPLICIT_HOST_NETNS_ENTRY
G2_CORRECTED_DNS=PASS
G2_CORRECTED_TCP443=PASS
G2_CORRECTED_TLS=PASS
G2_CORRECTED_PROVIDER_DISABLED_ADAPTER=PASS_6_TESTS
PRODUCT_SOURCE_CHANGED=NO
PRODUCTION_MUTATION=NO
PRODUCTION_HEALTH=PASS
```

The corrected zero-provider runtime used explicit host network-namespace entry (`nsenter -t 1 -m -n`) for the disposable daemon, with `--ip6tables=false`, NVMe-only data/exec roots, separate Unix socket, bridge/iptables-disabled Docker configuration, and no production Docker socket/data-root mutation.

## Status

```text
DIRECTIVE_STATE=PROPOSED_NOT_AUTHORIZED
NEW_PROVIDER_SESSIONS_AUTHORIZED=0
PRODUCTION_DEPLOYMENT_AUTHORIZED=NO
PRODUCTION_RESTART_AUTHORIZED=NO
CURRENT_PRODUCTION_IMAGE_REMOVAL_AUTHORIZED=NO
PRIVATE_DATA_OR_MICROPHONE_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

This file creates no authority until a later explicit human `proceed` / equivalent.

## Proposed single activation envelope

A later explicit activation should authorize exactly this remaining software chain:

```text
LONGRUN_DEFAULT=YES
STOP_BETWEEN_CORRECTED_G2_AND_G3=NO
TOTAL_NEW_PROVIDER_SESSIONS_MAX=2
CORRECTED_G2_PROVIDER_SESSION_MAX=1
G3_PROVIDER_SESSION_MAX=1_CONDITIONAL_AFTER_G2_PASS
BLIND_PROVIDER_RETRY=NO
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
ARM64_IMAGE_SHA=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
HOST_NATIVE_NVME_DOCKERD=YES_TEMPORARY_ONLY
DISPOSABLE_DAEMON_HOST_NETNS_ENTRY=REQUIRED
PRODUCTION_DOCKER_DAEMON_STOP_OR_RESTART=NO_BEFORE_G3
PRODUCTION_DOCKER_SOCKET_TOUCH=NO_DURING_G2
PRODUCTION_DOCKER_DATA_ROOT_TOUCH=NO_DURING_G2
SECOND_DOCKERD_DATA_ROOT=NVME_ONLY
SECOND_DOCKERD_EXEC_ROOT=NVME_ONLY
SECOND_DOCKERD_SOCKET=SEPARATE_NVME_UNIX_SOCKET
SECOND_DOCKERD_DEFAULT_BRIDGE=OFF
SECOND_DOCKERD_IPTABLES_MUTATION=OFF
NVME_REPARTITION_OR_FORMAT=NO
DELUGE_PATH_OR_DATA_CHANGE=NO
SLATE_MYSQL_PERSISTENT_DATA_CHANGE=NO
BROAD_DOCKER_PRUNE=NO
ROLLBACK_IMAGE_DELETE=NO
PRODUCTION_DEPLOYMENT=CONDITIONAL_AFTER_CORRECTED_G2_PASS
PRODUCTION_RESTART=AUTHORIZED_WITHIN_G3_ONLY
AUTO_ROLLBACK_ON_G3_FAILURE=YES
LEAVE_CANDIDATE_DEPLOYED_ON_G3_PASS=YES_IF_HEALTH_GREEN
SEARCH_SYNTHETIC=OFF
TOOLS_SYNTHETIC=NO_INVOCATION
PRIVATE_DATA=NO
MICROPHONE=NO
RAW_AUDIO_RETENTION=NO
RAW_PROVIDER_PAYLOAD_RETENTION=NO
CREDENTIAL_VALUE_READ_OR_LOG=NO
BILLING_OR_VERTEX_CHANGE=NO
CREDENTIAL_REPLACEMENT=NO
PHYSICAL_NOTE4_TEST=NO
FIRMWARE_FLASH=NO
PR2_MERGE=NO
```

## C0 — corrected runtime preflight, zero provider

Before consuming the corrected G2 session:

1. reconcile exact source/image/rollback pins and PR #2 state;
2. verify production Slate/MySQL/local/public health and restart counts;
3. recreate the disposable host-native Docker daemon with explicit host network-namespace entry, NVMe-only data/exec roots, separate socket, bridge/iptables disabled, and no production Docker mutation;
4. load and verify the exact reviewed candidate image digest;
5. prove candidate DNS, TCP/443 and TLS egress again with no credential mounted and no Gemini API/Live request;
6. repeat the exact provider-disabled 6-test candidate matrix;
7. verify production health remains unchanged.

If any C0 check fails, consume zero provider sessions and exhaust safe zero-provider recovery. Do not weaken the network correction.

## C1 — corrected G2 full-adapter non-production session

Only after C0 PASS, mount the existing protected Gemini credential read-only at the approved secret path without printing or reading it outside the application runtime. Search remains off, tools are not invoked, no private data or microphone input is used, and no raw audio/provider payload is retained.

Use exactly one provider session with the existing broad matrix:

```text
TURN_1_EN="Say exactly TEST."
TURN_2_EN="Say exactly SECOND."
TURN_3_JA="日本語で「テスト」とだけ言ってください。"
```

PASS requires usable native-audio/model-turn output plus turn completion for every executed turn.

If corrected G2 FAILS or is ambiguous:

- do not deploy;
- do not consume the G3 session;
- preserve the exact durable sanitized result;
- exhaust zero-provider forensics;
- no provider retry under this activation.

If corrected G2 PASSES:

- push/fetch-verify the checkpoint;
- do not return control;
- continue directly to G3 preparation.

## C2 — narrow production storage preparation after G2 PASS

The production Docker root remains capacity-constrained. Before any production mutation:

1. verify the pinned rollback image is present and healthy;
2. save the current production Slate application image to an NVMe archive under the existing Slate tools area;
3. record its exact image ID and cryptographic archive hash and verify the archive is readable;
4. verify Slate/MySQL/local/public health and container restart counts;
5. calculate whether stopping/removing only the current Slate application container and, if necessary, only that just-snapshotted current application image yields enough production Docker-root room for the exact candidate.

Do not delete the pinned rollback image, MySQL image/data, volumes, unrelated historical images, Deluge data, or unknown files.

If the narrow current-application-image swap cannot create enough room, stop before production mutation. Do not broaden cleanup authority.

## C3 — conditional G3 exact-candidate production session

Only after corrected G2 PASS and C2 PASS:

- perform the narrow reviewed Slate application image swap within the authorized production restart window;
- load and verify the exact G2-qualified candidate digest;
- deploy with the already-approved Developer API / private Node-bridge production opt-ins and existing protected credential read-only;
- verify Slate/MySQL/local/public health before provider validation;
- consume exactly one G3 provider session using the same EN/EN/JA matrix and native-audio acceptance gate.

On G3 PASS:

- leave the candidate deployed only while all health gates remain green;
- retain the NVMe prior-production image archive until terminal software state is safely recorded;
- publish the terminal software dossier;
- stop at the separate physical NOTE4/private microphone/firmware/merge boundary.

On G3 FAIL/AMBIGUOUS:

- immediately restore the pinned rollback image/config or the verified prior-production NVMe archive as appropriate;
- verify Slate/MySQL/local/public health;
- remove candidate-only runtime/secret configuration if applicable;
- no production provider retry.

## Non-stopping events after activation

Do not return control for C0 success, report/checkpoint pushes, corrected G2 PASS, NVMe prior-image snapshot creation, pre-G3 health checks, narrow image swap mechanics, deterministic postchecks, or transition into G3 when all predeclared conditions pass.

## True stops

Stop only for:

- corrected G2 failure/ambiguity after zero-provider forensics;
- provider pool exhaustion;
- source/image digest change outside the exact reviewed pin;
- inability to create enough production Docker-root room using only the narrow current-application-image swap;
- rollback archive/image verification failure;
- production health degradation;
- credential creation/replacement, billing/Vertex change, or new privacy/data scope;
- physical NOTE4/microphone/firmware action;
- destructive persistent-data or broad host-storage action;
- unresolved P0/P1/security/privacy/data-integrity issue;
- PR merge/release.

`REPORT-PUSH-INVARIANT.md` remains binding. Push often; stop only at a true new authority boundary.
