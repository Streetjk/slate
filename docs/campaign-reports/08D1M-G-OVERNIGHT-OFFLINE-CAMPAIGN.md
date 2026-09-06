# Campaign 8D1M-G — Overnight Offline Continuation

## Mission

Run the Slate campaign unattended overnight under `FRONTIER_DRIVEN_LONGRUN` and exhaust every authorized nonphysical task while NOTE4 is offline or unavailable. Do not idle merely because the board is disconnected or because the exact ZAI reviewer is temporarily resource-blocked.

Keep PR #2 open, draft, and unmerged. Do not merge, release, delete rollback roots/backups, repartition NVMe, or touch Deluge data.

## Live-state rule

Before execution, fetch origin and reconcile the actual live PR #2 head, `CAMPAIGN-STATE.md`, the board-window directive, latest campaign reports, and recent commits. Live GitHub state is authoritative.

Checkpoint at publication time:

```text
PR=2
HEAD=e3319313c65bc300a45b07570957ff22f05952ce
STATE=OPEN_DRAFT_UNMERGED
```

## Accepted current state

The sanitized observability implementation is now tracked in source.

```text
CURRENT_STAGE=BOARD_WINDOW_OBSERVABILITY_CANDIDATE_REVIEW_BLOCKED
M4_STATUS=FAIL_VOICE_SERVICE_UNAVAILABLE
DEVICE_STATUS=OFFLINE_OR_NOT_ENUMERATED
OBSERVABILITY_BACKEND_READY=LOCAL_QUALIFIED_UNREVIEWED
OBSERVABILITY_FIRMWARE_READY=SOURCE_QUALIFIED_BUILD_UNAVAILABLE
SOURCE_BUNDLE_SHA256=e0b89e0a26edf9e4cd9c05f8835684993d3f6fe8d7a3146578ad786418650de0
BACKEND_TYPECHECK=PASS
BACKEND_LINT=PASS
BACKEND_FORMAT=PASS
BACKEND_TARGETED_TESTS=13_PASS_0_FAIL
BACKEND_ASSISTANT_SUITE=83_PASS_5_SKIP_1_EXISTING_BUN_NEST_HARNESS_ERROR
FIRMWARE_NO_VENDOR_TEST=PASS
FIRMWARE_BUILD=BLOCKED_LOCAL_IDF_TOOLCHAIN_UNAVAILABLE
SECRET_SCAN=PASS
ZAI_REVIEW_MODEL=glm-5.3-flash
ZAI_REVIEW_STATUS=BLOCKED_INSUFFICIENT_BALANCE_OR_RESOURCE_PACKAGE
PRODUCTION_CHANGED=NO
FIRMWARE_FLASHED_THIS_STAGE=NO
```

The unrelated existing Bun/Nest decorator harness error is not evidence of failure in the changed voice files. Do not spend the night rewriting unrelated framework code merely to turn that known harness problem green unless new evidence proves the observability patch caused it.

## Role routing

```text
CONTROLLER_INTEGRATOR=Codex
IMPLEMENTATION_WRITER=AGY gemini-3.8-flash
INDEPENDENT_REVIEWER=ZAI glm-5.3-flash
```

Use AGY only for bounded implementation work. Codex owns diagnosis, architecture, integration, deterministic validation, artifact freezing, deployment decisions, and frontier control.

ZAI `glm-5.3-flash` remains the mandatory independent reviewer. No silent substitution, review waiver, OpenRouter fallback, Grok fallback, Claude fallback, or Gemini-as-reviewer fallback.

## Overnight objective

By morning, drive toward the strongest possible state without NOTE4:

```text
OBSERVABILITY_SOURCE_FINAL=YES
BACKEND_NONPHYSICAL_QUALIFICATION=PASS
FIRMWARE_NONPHYSICAL_QUALIFICATION=PASS_OR_MAXIMALLY_PROVEN
FIRMWARE_BUILD=PASS_IF_ANY_EXISTING_OR_EPHEMERAL_USERSPACE_PATH_IS_AVAILABLE
BACKEND_ARTIFACT_FROZEN=YES
FIRMWARE_ARTIFACT_FROZEN=YES_IF_BUILDABLE
ZAI_REVIEW_PACKET_READY=YES
ZAI_REVIEW=PASS_IF_EXISTING_RESOURCE_ROUTE_RECOVERS
BACKEND_DEPLOYED=YES_IF_EXACT_REVIEW_PASS_AND_ALREADY_AUTHORIZED
NEXT_APP_ONLY_FLASH_READY=YES
NEXT_M4_DIAGNOSTIC_PROTOCOL_READY=YES
WAITING_DEVICE_ONLY=IDEAL_END_STATE
```

Do not fabricate PASS states. If a gate cannot be completed, preserve exact evidence and continue every other independent node.

## O1 — Reconcile and protect the current candidate

First inspect the exact diff introduced since the prior board-window directive. Confirm the intended observability scope only:

- authenticated voice-config structural markers;
- WebSocket auth/acceptance structural markers;
- provider-session create/start/failure structural markers;
- first microphone-frame structural marker;
- firmware config request/result/parser markers;
- firmware WebSocket connection/session-init markers;
- firmware first-mic-stream marker;
- stable generic failure branch classification.

Confirm no credential, token, raw audio, transcript, provider payload, Calendar, Outlook, or private-content logging was introduced.

If the tracked source already satisfies the intended bounded design, avoid gratuitous rewrites. If a deterministic defect is found, route only the minimal correction through AGY `gemini-3.8-flash`, then Codex retest and freeze a new exact source bundle.

## O2 — Exhaust deterministic backend qualification

Run all non-provider backend qualification that can execute overnight, including as applicable:

- typecheck;
- lint;
- format check;
- targeted observability tests;
- assistant/voice regression tests;
- auth guard tests;
- voice-config result-class tests;
- WebSocket guard/acceptance tests;
- provider-failure classification tests using synthetic errors only;
- first-microphone-frame marker tests using synthetic bytes only;
- one-turn/one-bubble regression tests;
- provider-disabled bridge/control tests;
- no-vendor/Tenclass fallback tests;
- secret-pattern scan;
- privacy/log-content scan.

Add tests where a changed branch lacks deterministic coverage, but do not create unnecessary product changes simply to increase test count.

Prove that structural log output contains enums/status classes/timestamps only and cannot expose raw exception strings where those strings may contain sensitive provider or credential details.

## O3 — Recover an ESP-IDF build path without waiting for the board

The missing local IDF toolchain is an offline build-environment problem, not a device dependency.

Search the repository and currently available controller environment for existing supported build paths before declaring the firmware blocked. Check, in order:

1. repo-pinned ESP-IDF scripts/version files;
2. already-installed local ESP-IDF environments;
3. existing container images/toolchains already present locally;
4. existing repository CI/workflow build paths;
5. existing remote development/build hosts already authorized by the project;
6. an ephemeral non-root user-space/containerized official ESP-IDF environment matching the repository-pinned version.

A user-space or containerized build environment may be created for deterministic development/build purposes if it requires no sudo/root, no credential creation, no billing change, no production-host mutation, no NVMe repartition, and no Deluge change. Prefer pinned official tooling and record exact toolchain versions.

Do not install arbitrary third-party binary bundles merely to force a build.

If a valid build path is recovered:

- build the exact app firmware;
- run size/partition-fit checks;
- run all available firmware tests/static checks;
- record exact app binary SHA256 and byte size;
- verify intended app-only flash offset;
- prepare, but do not execute while the device is offline, the exact guarded app-only flash command.

If no valid build path can be recovered, produce a reproducible build packet with exact source SHA/bundle SHA, required ESP-IDF version, exact build command, expected output location, partition/offset requirements, and every already-passed source-level check. Then continue other nodes.

## O4 — Deepen offline firmware validation

Even if binary build remains blocked, maximize source-level proof:

- compile/static checks available without full IDF;
- no-vendor test;
- config parser branch tests;
- WebSocket state-machine tests;
- stable failure-enum tests;
- tests proving close-code `unknown` is not replaced by guessed transport integers;
- tests proving mic-stream marker fires once and no raw audio is logged;
- tests proving secrets/auth tokens never enter structural markers;
- tests proving instrumentation cannot alter the existing device URL/auth/model authority;
- tests proving one-turn/one-bubble behavior is untouched.

If production firmware bytes change during repair, invalidate any earlier frozen firmware identity.

## O5 — Build and freeze backend deployment artifact offline

If backend source becomes fully deterministic-green, build the exact ARM64 backend artifact/image using the existing authorized build path without touching production first.

Record:

```text
BACKEND_SOURCE_SHA=
BACKEND_IMAGE_ID=
BACKEND_IMAGE_TAR_SHA256=
BACKEND_CONFIG_IDENTITY=
BACKEND_SECRET_SCAN=
BACKEND_PROVIDER_DISABLED_TESTS=
```

Preserve the currently working production and rollback images. Do not deploy changed backend bytes until exact independent ZAI review passes for the frozen reviewed artifact/source package required by the campaign.

## O6 — Reviewer resource recovery without billing change

The existing `zai-glm53-reviewer` route reached ZAI but returned the sanitized result `Insufficient balance or no resource package`.

Do not hammer the endpoint repeatedly overnight and do not waste reviewer tokens on unfrozen candidates.

Perform one bounded non-secret discovery of already-existing authorized ZAI resources/configuration that may support the same `glm-5.3-flash` reviewer without creating credentials or changing billing. This may include already-present profiles, endpoints, or resource packages belonging to the existing project authority.

If an already-existing valid ZAI `glm-5.3-flash` route is found, submit the exact frozen artifact once with the normal exact-SHA verdict contract.

If no such existing resource is available, classify the reviewer as `EXTERNALLY_BLOCKED_RESOURCE` and continue all other offline nodes. Do not substitute another reviewer.

Prepare a complete durable review packet so that review can run immediately when the same authorized ZAI resource becomes available. Include exact artifact SHA, complete changed bytes/content, bounded purpose, privacy invariants, test evidence, known residuals, and required verdict schema:

```text
REVIEWER=glm-5.3-flash
REVIEW_TARGET_SHA=<exact SHA256>
VERDICT=PASS|REVISE
P0=<n>
P1=<n>
P2=<n>
P3=<n>
SECURITY_FINDINGS=<NONE or concise findings>
FINDINGS=<NONE or concise findings>
```

Reviewer `REVISE` automatically routes to AGY repair -> Codex validation -> new SHA -> fresh ZAI review.

## O7 — Deploy backend automatically only if review becomes valid

If, during the overnight run, the exact frozen backend/observability artifact obtains a valid ZAI `glm-5.3-flash` PASS and all deterministic gates are green, continue within existing authority to the backend-only deployment even though NOTE4 is offline.

Use the existing fail-closed C3 deployment/rollback pattern. Verify after deployment:

- exact image identity;
- Slate healthy;
- MySQL healthy and same identity;
- restart counts zero/stable;
- local/public health HTTP 200;
- secret mount remains read-only;
- voice-config unauthenticated guard remains 401;
- WebSocket route control remains reachable;
- no vendor fallback;
- no provider session created by validation;
- no production Gemini model change;
- no credential or billing change.

Do not deploy if review remains invalid/blocked.

## O8 — Prepare the next physical transaction completely

Whether or not review/build completes, prepare the next board-session packet as far as evidence permits.

If firmware binary is frozen and review is valid, prepare an exact app-only flash handoff with:

- expected ESP32-S3 identity;
- expected serial-port selection rule;
- exact binary path;
- exact SHA256;
- exact flash offset;
- no full erase;
- NVS/LittleFS/pairing preservation checks;
- post-flash boot/polling/marker checks.

Prepare one combined diagnostic/acceptance M4 protocol:

1. enter Voice AI;
2. one short non-sensitive English turn;
3. if service works, one short Japanese turn;
4. exit Voice AI;
5. if service fails, do not retry blindly.

Required sanitized evidence after that one session:

```text
VOICE_CONFIG_AUTHENTICATED_RESULT=
VOICE_CONFIG_PARSE_RESULT=
VOICE_WEBSOCKET_AUTHENTICATED_RESULT=
VOICE_WEBSOCKET_OPEN_RESULT=
VOICE_WEBSOCKET_CLOSE_CODE=
PROVIDER_SESSION_CREATE_START=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
MIC_AUDIO_REACHED_PROVIDER=
FIRMWARE_GENERIC_FAILURE_BRANCH=
```

Also preserve sanitized stage timestamps for latency analysis and the one-user-bubble/one-assistant-bubble acceptance assertions if conversation succeeds.

## O9 — Continue useful platform verification while physical nodes are blocked

If implementation/build/review work is temporarily blocked, use remaining read-only frontier productively:

- verify current containerd root/state remain on NVMe;
- verify Docker data-root remains on NVMe;
- verify Slate/MySQL health and restart stability;
- verify original `/var/lib/containerd` and `/var/lib/docker` rollback roots remain preserved;
- verify rollback images/assets remain present;
- verify NVMe reserve remains healthy;
- verify Deluge services/data remain untouched;
- verify no accidental provider/model/credential/billing mutation;
- audit obsolete campaign-state sections so the current top frontier remains unambiguous without deleting forensic history;
- prepare final closure/security/privacy/latency dossier sections that do not depend on physical acceptance.

Do not create self-referential `CURRENT_HEAD` commit loops merely to refresh a SHA in documentation.

## O10 — Long-run frontier semantics

The following are not stop reasons overnight:

- NOTE4 offline;
- firmware flash unavailable;
- physical M4 unavailable;
- local IDF initially missing;
- one build-path failure if alternatives remain;
- reviewer resource block while other work remains;
- AGY completion;
- deterministic PASS;
- deterministic repairable FAIL;
- reviewer REVISE;
- backend artifact build;
- report/commit/push;
- infrastructure read-only verification.

For every blocked node:

```text
persist evidence
-> classify WAITING_DEVICE / EXTERNALLY_BLOCKED / WAITING_HUMAN only if accurate
-> recompute frontier
-> execute another READY or READONLY_READY node
```

Do not stop while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`.

## O11 — Human boundaries

A human stop is valid only when no READY/READONLY_READY work remains and progress requires one of:

- physical NOTE4 reconnect/flash/button/microphone action;
- ZAI billing/resource purchase or new credential/provider authority;
- reviewer substitution/waiver;
- unresolved P0/P1/security finding;
- destructive protected-data action;
- merge/release.

Do not ask the human merely to acknowledge a checkpoint.

## O12 — Morning checkpoint

Before final overnight exit publish one durable morning checkpoint containing:

```text
CURRENT_HEAD=
CURRENT_STAGE=
DEVICE_STATUS=
DEVICE_REQUIRED_NODE_COUNT=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
SOURCE_BUNDLE_SHA256=
BACKEND_SOURCE_SHA=
BACKEND_IMAGE_ID=
BACKEND_IMAGE_TAR_SHA256=
FIRMWARE_SOURCE_SHA=
FIRMWARE_APP_SHA256=
FIRMWARE_BUILD_STATUS=
ESP_IDF_VERSION=
ZAI_REVIEW_STATUS=
ZAI_REVIEW_TARGET_SHA=
NONPHYSICAL_REQUALIFICATION_STATUS=
PRODUCTION_BACKEND_STATUS=
SLATE_HEALTH=
MYSQL_HEALTH=
NVME_CONTAINERD_STATUS=
NVME_DOCKER_STATUS=
DELUGE_STATUS=
NEXT_APP_ONLY_FLASH_READY=
NEXT_M4_PROTOCOL_READY=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

The ideal terminal overnight state is not `campaign complete`; it is `all nonphysical work exhausted, exact artifacts/review/deployment maximally advanced, only true device or ZAI-resource human boundaries remaining`.

Keep PR #2 open, draft, and unmerged.