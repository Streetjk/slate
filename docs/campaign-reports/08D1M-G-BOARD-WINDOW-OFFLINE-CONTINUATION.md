# Campaign 8D1M-G — NOTE4 Board Window and Offline Continuation

## Purpose

The NOTE4 ESP32-S3 board is connected now but must be physically disconnected tonight. Treat physical-device availability as a scarce execution window. Front-load every task that genuinely requires NOTE4 USB/serial/flash/button/microphone access, then continue all remaining software/read-only work after the board is offline.

Operate in `FRONTIER_DRIVEN_LONGRUN` and keep PR #2 open, draft, and unmerged.

## Live-state rule

Before execution, fetch origin and reconcile PR #2. Do not assume the checkpoint SHA in this document is still current. Live GitHub state is authoritative.

Current checkpoint at publication time: `d8c20c5c236d824fd1dcc3650b84b1db497e353f`.

## Accepted M4 failure state

Accept:

```text
M4_STATUS=FAIL_VOICE_SERVICE_UNAVAILABLE
```

Accepted zero-private-data evidence already establishes that the exact C3 backend is healthy, Slate/MySQL are healthy with stable restart counts, local/public health is HTTP 200, local/public WebSocket upgrade controls reach HTTP 101, unauthenticated voice-config correctly returns HTTP 401, no sanitized backend/serial error markers were observed, the no-vendor static control passed, the exact M3 app-only firmware remains qualified, and no source defect is yet proven.

Unresolved:

```text
M4_PROVIDER_SESSION_STARTED=UNKNOWN
M4_PROVIDER_CALL_COUNT=UNKNOWN
M4_MIC_AUDIO_REACHED_PROVIDER=UNKNOWN
M4_VOICE_CONFIG_AUTHENTICATED_RESULT=UNKNOWN
M4_VOICE_WEBSOCKET_AUTHENTICATED_RESULT=UNKNOWN
M4_PROVIDER_SESSION_CREATE_RESULT=UNKNOWN
```

Do not perform another blind physical retry with the current observability.

## Role routing

```text
CONTROLLER_INTEGRATOR=Codex
IMPLEMENTATION_WRITER=AGY gemini-3.8-flash
INDEPENDENT_REVIEWER=ZAI glm-5.3-flash
```

A fresh independent ZAI `glm-5.3-flash` review must bind to the exact frozen artifact SHA. Any byte change invalidates the prior verdict and requires a fresh review. Reviewer `REVISE` is not a human stop.

## Phase A — use the remaining board window efficiently

Immediately prioritize the minimum sanitized structural observability needed to distinguish the generic NOTE4 `Voice service unavailable` branches.

Never log credentials, bearer/auth tokens, API keys, raw audio, transcript text, provider payload contents, private user content, Calendar contents, or Outlook contents.

Firmware should expose stable sanitized markers equivalent to:

```text
VOICE_CONFIG_REQUEST_START
VOICE_CONFIG_RESULT=<2xx|4xx|5xx|transport_error>
VOICE_CONFIG_PARSE=<PASS|FAIL_ENUM>
VOICE_WS_CONNECT_START
VOICE_WS_CONNECT_RESULT=<OPEN|HTTP_FAIL|TLS_FAIL|TRANSPORT_FAIL>
VOICE_WS_CLOSE_CODE=<code_or_none>
VOICE_SESSION_INIT_SENT=YES|NO
VOICE_MIC_STREAM_STARTED=YES|NO
VOICE_GENERIC_FAILURE_BRANCH=<stable_enum>
```

Backend should expose structural markers equivalent to:

```text
VOICE_CONFIG_AUTH_ATTEMPT=YES
VOICE_CONFIG_AUTH_RESULT=<PASS|REJECT>
VOICE_CONFIG_RESPONSE_CLASS=<2xx|4xx|5xx>
VOICE_WS_UPGRADE_ATTEMPT=YES
VOICE_WS_AUTH_RESULT=<PASS|REJECT>
VOICE_WS_ACCEPTED=YES|NO
PROVIDER_SESSION_CREATE_START=YES|NO
PROVIDER_SESSION_CREATE_RESULT=<PASS|SANITIZED_FAILURE_ENUM>
PROVIDER_SESSION_STARTED=YES|NO
FIRST_MIC_FRAME_RECEIVED=YES|NO
```

If the architecture already has equivalent markers, reuse them rather than adding redundant instrumentation.

## Phase B — implementation and qualification

AGY `gemini-3.8-flash` may implement the bounded observability change. Codex must independently integrate and validate it.

Run all applicable targeted backend/firmware tests, provider-disabled route tests, config-schema tests, WebSocket construction tests, privacy/logging tests, secret scans, and ESP-IDF build checks. Prove no transcript/audio/provider-payload retention.

Freeze exact backend/firmware artifact SHAs and run fresh independent ZAI `glm-5.3-flash` exact review for every changed production artifact.

Automatic loop:

```text
GLM findings
-> Codex adjudication
-> AGY gemini-3.8-flash repair
-> Codex retest
-> new SHA
-> fresh GLM review
```

Continue until PASS or a genuine P0/P1/security/authority boundary.

## Phase C — flash while the board is still connected

As soon as the exact reviewed firmware is ready, perform the already-authorized app-only NOTE4 firmware update. Do not delay the device operation merely to publish another routine report first.

Preserve bootloader, partition table, NVS, pairing, LittleFS/user data, and device identity. No full erase.

Before flash verify that the target remains the already-qualified ESP32-S3 NOTE4 device. After flash immediately verify hash/write verification, normal boot, Wi-Fi, pairing preservation, authenticated polling, no fatal markers, and presence of the sanitized observability markers.

## Phase D — one high-value diagnostic physical attempt before disconnect

Once stage observability is active, perform ONE physical Voice AI attempt before board disconnection.

Start with one short non-sensitive English question. If Voice AI is healthy, continue the same session with one short Japanese turn and then exit Voice AI to complete normal M4 acceptance.

If `VOICE_SERVICE_UNAVAILABLE` appears again, do not repeatedly retry. Preserve only sanitized structural evidence and determine:

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

Also retain sanitized stage timestamps sufficient for latency attribution. Do not retain raw audio/transcripts/provider payloads.

## Phase E — board-disconnection handoff

When the operator says the NOTE4 board must be disconnected, set:

```text
DEVICE_STATUS=OFFLINE_BY_OPERATOR_SCHEDULE
```

This is NOT a controller-session termination.

Persist all exact device evidence and artifact identities first. Classify only genuinely physical nodes as `WAITING_DEVICE`, such as firmware flash, serial capture, physical button/microphone testing, and final EN/JA M4 acceptance.

Do not classify the whole campaign as `WAITING_HUMAN` merely because NOTE4 is offline. Recompute the frontier immediately.

## Phase F — continue after board disconnection

After NOTE4 is offline, continue every authorized task that does not require the physical device, including where applicable:

- exact attribution from captured sanitized stage evidence;
- root-cause matrix resolution;
- AGY backend/firmware implementation;
- Codex integration;
- deterministic backend/firmware tests;
- ESP-IDF builds;
- provider-disabled protocol tests;
- schema/config/WebSocket/auth simulations;
- privacy/logging tests;
- latency instrumentation validation;
- secret scans and regression suites;
- exact artifact freezing;
- ZAI `glm-5.3-flash` exact reviews and automatic REVISE loops;
- production backend deployment when already authorized and independent of NOTE4;
- backend health/stability and rollback verification;
- preparation of the exact next app-only firmware artifact;
- preparation of exact next flash/retest instructions;
- campaign-state/report/closure-dossier preparation;
- storage/containerd/Docker/Deluge read-only verification where useful.

Preferred offline outcome:

```text
BACKEND_REPAIR_READY_OR_DEPLOYED=YES
FIRMWARE_REPAIR_BUILT=YES
FIRMWARE_EXACT_SHA_FROZEN=YES
GLM_REVIEW=PASS
ALL_NONPHYSICAL_TESTS=PASS
NEXT_APP_ONLY_FLASH_READY=YES
NEXT_M4_PHYSICAL_PROTOCOL_READY=YES
```

Only physical flash/retest nodes should remain for the next board connection.

## Offline frontier rule

Board disconnected is non-terminal while software/read-only work remains. Reports, checkpoints, implementation completion, test PASS/repairable FAIL, reviewer REVISE/PASS, backend deploy PASS, firmware build PASS, and physical-test deferral are all non-terminal.

Persist blocked physical nodes and continue another READY/READONLY_READY node.

If all M4-associated nonphysical work is exhausted while NOTE4 remains offline, continue useful closure preparation: audit backend/image identities and rollback assets, containerd/Docker NVMe topology, preserved old roots, NVMe reserve, Deluge non-mutation, tests/reviews/security/privacy accounting, latency-analysis structure, residual risks, closure dossier, and restart/session recovery from GitHub.

Do not merge or release. Do not delete preserved roots/backups.

## Exit contract

Before any exit report:

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
OBSERVABILITY_BACKEND_READY=
OBSERVABILITY_FIRMWARE_READY=
LATEST_FIRMWARE_SHA=
LATEST_BACKEND_SHA=
GLM_REVIEW_STATUS=
NONPHYSICAL_REQUALIFICATION_STATUS=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Do not exit if `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`.

A disconnected NOTE4 board may leave `WAITING_DEVICE_COUNT > 0` while Codex continues all other frontier work.

Only return to the human when an actual physical-board action is the sole remaining useful node, or a genuine credential/provider/private-data/security/P0/P1/merge/release authority boundary is reached.

Keep PR #2 open, draft, and unmerged.

## Execution checkpoint — sanitized observability candidate

The board-window continuation was reconciled against live PR head
`061fdb6f60781daeb6fca070239cf93ea525680e`. The board was not enumerated on
the controller host (`/dev/cu.usb*` absent), so no flash, serial capture,
button action, microphone action, or provider session was attempted.

AGY produced a bounded candidate and Codex integrated only evidence-backed
corrections. The candidate emits structural markers for authenticated config,
WebSocket auth/acceptance, provider-session creation/start/result, first
backend microphone frame, firmware config request/status/parser outcomes,
WebSocket connect/init/close status, first firmware microphone stream, and
stable generic failure branches. It does not log credentials, tokens, raw
audio, transcript text, provider payloads, Calendar/Outlook data, or private
content. WebSocket close codes remain `unknown` because the current firmware
transport API does not expose a stable close-code callback; the candidate does
not infer a code from transport error integers.

```text
SOURCE_BUNDLE_SHA256=e0b89e0a26edf9e4cd9c05f8835684993d3f6fe8d7a3146578ad786418650de0
BACKEND_TYPECHECK=PASS
BACKEND_LINT=PASS
BACKEND_FORMAT=PASS
BACKEND_TARGETED_TESTS=13_PASS_0_FAIL
BACKEND_ASSISTANT_SUITE=83_PASS_5_SKIP_1_EXISTING_BUN_NEST_HARNESS_ERROR
FIRMWARE_NO_VENDOR_TEST=PASS
FIRMWARE_BUILD=BLOCKED_LOCAL_IDF_TOOLCHAIN_UNAVAILABLE
SECRET_SCAN=PASS
ZAI_REVIEW_PROFILE=zai-glm53-reviewer
ZAI_REVIEW_MODEL=glm-5.3-flash
ZAI_REVIEW_ATTEMPTED_TARGET_SHA256=815aa1a31244f26c1eb805a179dad906103b8df6bab537579933405edbec013a
ZAI_REVIEW_STATUS=BLOCKED_INSUFFICIENT_BALANCE_OR_RESOURCE_PACKAGE
ZAI_REVIEW_VERDICT=NOT_OBTAINED
GEMINI_PROVIDER_CALLS_THIS_STAGE=0
PRODUCTION_CHANGED=NO
FIRMWARE_FLASHED_THIS_STAGE=NO
DEVICE_STATUS=OFFLINE_OR_NOT_ENUMERATED
OBSERVABILITY_BACKEND_READY=LOCAL_QUALIFIED_UNREVIEWED
OBSERVABILITY_FIRMWARE_READY=SOURCE_QUALIFIED_BUILD_UNAVAILABLE
NEXT_PHYSICAL_ACTION=EXACT_REVIEW_THEN_APP_ONLY_FLASH_THEN_ONE_COMBINED_M4_DIAGNOSTIC_SESSION
```

The exact ZAI route was reachable but rejected the review request with the
sanitized result `Insufficient balance or no resource package. Please
recharge.` No billing change, reviewer substitution, or retry was performed.
The existing Bun/Nest controller decorator harness error remains unrelated to
the changed voice files; changed voice typecheck/lint/tests are green.
