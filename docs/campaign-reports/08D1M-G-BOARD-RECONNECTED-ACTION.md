# Campaign 8D1M-G — NOTE4 Board Reconnected Action Directive

## Mission

Resume Campaign 8D1M-G from the completed overnight nonphysical qualification checkpoint with the NOTE4 ESP32-S3 board now physically connected to the Mac again. Operate in `FRONTIER_DRIVEN_LONGRUN`. Live GitHub state is authoritative. Keep PR #2 open, draft, and unmerged. Preserve rollback roots/assets, Docker/containerd NVMe topology, MySQL identity/data, Deluge data, credentials, production Gemini model authority, and all existing provider/privacy boundaries.

Before execution, fetch/reconcile PR #2 and read:

- `docs/campaign-reports/CAMPAIGN-STATE.md`
- `docs/campaign-reports/08D1M-G-CURRENT-BOUNDARY-ACTION.md`
- `docs/campaign-reports/08D1M-G-POST-OVERNIGHT-RESUME-AND-BOUNDARY.md`
- `docs/campaign-reports/08D1M-G-OVERNIGHT-OFFLINE-CAMPAIGN.md`

Do not create documentation-only `CURRENT_HEAD` loops.

## New operator fact

The NOTE4 board is now physically connected to the Mac again.

Treat the device frontier as potentially available, but do not assume the USB path is unchanged. Re-enumerate safely and prove target identity before any write.

Set the initial state as:

```text
DEVICE_STATUS=CONNECTED_TO_MAC_PENDING_IDENTITY_VERIFICATION
WAITING_DEVICE_COUNT=RECOMPUTE_AFTER_ENUMERATION
```

The device returning does NOT bypass the mandatory exact ZAI review gate.

## Accepted overnight checkpoint

Accept unless live evidence disproves it:

```text
M4_STATUS=FAIL_VOICE_SERVICE_UNAVAILABLE
SOURCE_BUNDLE_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
BACKEND_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
FIRMWARE_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
NONPHYSICAL_REQUALIFICATION_STATUS=PASS_LOCAL_AND_ARM64_PROVIDER_DISABLED
PRODUCTION_BACKEND_STATUS=UNCHANGED_HEALTHY
```

Frozen backend:

```text
BACKEND_IMAGE_TAG=slate:overnight-observability-e0b89e0a
BACKEND_IMAGE_ID=sha256:5589dfe2ce9c539bfd82334e2c169a7cff962d62a00daca4456ddec6e1576199
BACKEND_IMAGE_PLATFORM=linux/arm64
BACKEND_IMAGE_TAR_SHA256=844800c09b0fb04898d6de8edfa565845f94f27b636d7b439733ef22a0998fc4
BACKEND_CONFIG_IDENTITY=fa200c812d62672db94715115eb50b5fa04ad87d47fa53a6e5d3b8723148fbf3
BACKEND_PROVIDER_DISABLED_IMAGE_TESTS=13_PASS_0_FAIL_NETWORK_NONE
BACKEND_SECRET_SCAN=PASS
```

Frozen firmware:

```text
ESP_IDF_VERSION=5.5.2
FIRMWARE_BUILD_STATUS=PASS
FIRMWARE_APP_PATH=firmware/build-overnight/slate.bin
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
FIRMWARE_APP_BYTES=2505008
FIRMWARE_BOOTLOADER_SHA256=c94bd23d5fdfab16eefc505efd714d800bbf4399d5a52e19515a6d362addb5c3
FIRMWARE_PARTITION_TABLE_SHA256=6f0657eb6b8007c0dbfed6f64cf7a0d59f8ee1752af898e2f66dd218846b1835
```

Do not rebuild unchanged artifacts merely because the device is back. Any byte change invalidates the frozen identity and requires deterministic requalification plus a fresh exact ZAI review target.

## Required routing

```text
CONTROLLER_INTEGRATOR=Codex
IMPLEMENTATION_WRITER=AGY gemini-3.8-flash
INDEPENDENT_REVIEWER=ZAI glm-5.3-flash
```

Do not silently substitute reviewer/provider/model. Do not waive review.

## Phase 1 — immediately enumerate and verify NOTE4 read-only

Because the board is connected now, perform safe non-mutating device discovery immediately.

At minimum:

1. enumerate `/dev/cu.*` and `/dev/tty.*` candidates;
2. identify the newly attached USB serial device without assuming the old path;
3. verify the target is the expected ESP32-S3 NOTE4 class;
4. if a non-writing esptool identity probe is needed, use only read-only chip/flash identification commands;
5. confirm expected chip family, flash size, and other stable identity evidence available without writing;
6. record the actual current serial path;
7. do not erase, flash, reset pairing, or alter NVS/LittleFS during identity verification.

Historical qualified device evidence for comparison:

```text
PRIOR_DEVICE_TARGET=ESP32-S3_REV_V0.2
PRIOR_DEVICE_FLASH_SIZE=16MB
PRIOR_DEVICE_FLASH_ID=46_4018
PRIOR_DEVICE_PORT=/dev/cu.usbmodem31201
```

The serial path itself may change and is not identity proof.

If the device identity is materially different or ambiguous, stop at the genuine device-identity human boundary and do not write firmware.

If the identity matches, set:

```text
DEVICE_STATUS=CONNECTED_IDENTITY_VERIFIED
```

Do not flash yet unless exact ZAI review PASS exists.

## Phase 2 — one bounded ZAI resource check now

The prepared exact review target remains:

```text
ZAI_REVIEW_PROFILE=zai-glm53-reviewer
ZAI_REVIEW_MODEL=glm-5.3-flash
ZAI_REVIEW_TARGET_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
```

The prior route returned insufficient balance/resource package.

Because a new controller session/frontier is active and the device is now back, perform exactly one bounded check of the same already-authorized ZAI route.

Do not hammer the endpoint.

Do not create or replace credentials.

Do not change billing or purchase/recharge resources automatically.

Do not switch to Gemini, Grok, Claude, OpenRouter, another provider, or another reviewer.

If the same ZAI resource is available, submit the already-prepared frozen review packet exactly once and require:

```text
REVIEWER=glm-5.3-flash
REVIEW_TARGET_SHA=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
VERDICT=PASS|REVISE
P0=<n>
P1=<n>
P2=<n>
P3=<n>
SECURITY_FINDINGS=<NONE or concise findings>
FINDINGS=<NONE or concise findings>
```

A partial/malformed result is not PASS.

If `REVISE`, continue automatically:

```text
ZAI findings
-> Codex adjudication
-> AGY gemini-3.8-flash minimal repair
-> Codex deterministic validation
-> rebuild only impacted artifacts
-> privacy/secret scan
-> freeze new exact identities
-> fresh ZAI glm-5.3-flash exact review
```

Reviewer REVISE is not a human stop.

## Phase 3A — if ZAI remains resource-blocked

If the exact reviewer route still returns the same resource/balance block:

- persist the external block;
- do not retry repeatedly;
- keep the verified device connected if convenient, but do not flash unreviewed observability bytes;
- do not consume another microphone/provider session;
- do not perform a blind M4 retry with the old production firmware just because the board is present;
- recompute the frontier.

Safe work that may still run after identity verification includes only genuinely useful READY/READONLY_READY work that does not invalidate the frozen review target.

If `READY_NODE_COUNT=0` and `READONLY_READY_NODE_COUNT=0`, a stop at the mandatory ZAI resource boundary is legitimate even though the board is connected.

Report the exact blocker clearly rather than asking for a meaningless physical action.

## Phase 3B — if exact ZAI PASS is obtained

Once a valid exact PASS exists for target SHA:

`390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6`

continue automatically. Do not ask for `proceed`.

### 3B.1 Deploy the exact reviewed observability backend

Deploy the exact frozen ARM64 backend using the already-authorized fail-closed C3 deployment pattern.

Verify after deployment:

- active image identity exactly matches the reviewed artifact;
- Slate running/healthy with restart count zero/stable;
- MySQL running/healthy with identity preserved and restart count zero/stable;
- local/public health HTTP 200;
- secret mount remains read-only;
- unauthenticated voice-config guard still rejects as expected;
- WebSocket route control remains reachable;
- no vendor/Tenclass fallback;
- no provider session created by validation;
- no production Gemini model change;
- no credential/billing change;
- rollback image remains available.

Rollback automatically on regression. Backend deployment PASS is not a controller stop.

### 3B.2 Flash the exact reviewed app-only firmware while NOTE4 is connected

Reverify immediately before write:

```text
DEVICE_STATUS=CONNECTED_IDENTITY_VERIFIED
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
FLASH_OFFSET=0x10000
```

Use APP-ONLY flash only.

Preserve:

- bootloader;
- partition table;
- NVS;
- pairing;
- LittleFS/user data;
- device identity.

No full erase.

No partition-table write.

No bootloader write.

No NVS/LittleFS write.

After flash verify:

- write/hash verification PASS;
- normal boot;
- Wi-Fi reconnect;
- pairing preserved;
- authenticated polling resumes;
- no fatal markers;
- sanitized observability markers are present;
- backend remains healthy;
- Slate/MySQL restart counts remain stable.

If the firmware flash or post-flash verification fails, do not blindly reflash. Attribute the exact failure and recompute the frontier.

### 3B.3 Prepare one combined physical M4 session

After reviewed backend and reviewed app firmware are both active and healthy, arm the sanitized structural observer first.

Then request exactly ONE human physical session:

1. enter Voice AI;
2. one short non-sensitive English question;
3. if service works, one short Japanese question in the same session;
4. exit Voice AI;
5. if `VOICE_SERVICE_UNAVAILABLE` appears, do not retry blindly.

Capture only sanitized structural results:

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

Also capture sanitized stage timestamps needed for latency attribution.

If conversation succeeds, validate:

- one logical user turn = one user bubble;
- one logical assistant turn = one assistant bubble;
- no transcript-fragment-created extra assistant bubbles;
- no excessive e-ink redraw churn;
- normal audio;
- no unexpected vendor fallback;
- sanitized latency-stage deltas;
- successful Voice AI exit.

Never retain raw microphone audio, transcript text, provider payload contents, auth material, Calendar content, or Outlook data.

## Phase 4 — after the physical M4 result

If M4 succeeds cleanly:

- reconcile sanitized observer evidence;
- complete the final acceptance dossier;
- preserve rollback assets;
- keep PR #2 open/draft/unmerged;
- do not merge/release without separate authority.

If M4 again shows `VOICE_SERVICE_UNAVAILABLE`:

- do not ask for another blind retry;
- use the new stage markers to attribute the exact failing layer;
- classify config/auth/WebSocket/provider/firmware failure;
- continue automatic bounded repair where authorized;
- route implementation to AGY gemini-3.8-flash where bytes must change;
- Codex validates;
- freeze new exact identities;
- obtain fresh ZAI glm-5.3-flash exact review for changed bytes;
- redeploy/reflash only after PASS;
- return to the human only for the next genuinely necessary physical retest.

## No-repeat rule

Do not repeat already-passed overnight qualification unless:

- bytes changed;
- artifact identity cannot be verified;
- environment drift invalidates a result;
- reviewer findings require retest;
- new evidence contradicts the checkpoint.

Do not repeatedly rebuild identical artifacts, repeatedly hit the blocked ZAI endpoint, rerun provider-disabled tests merely to remain busy, or create documentation-only head-refresh loops.

## Exit contract

Before any exit report:

```text
CURRENT_HEAD=
CURRENT_STAGE=
DEVICE_STATUS=
DEVICE_PORT=
DEVICE_IDENTITY_VERIFIED=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
SOURCE_BUNDLE_SHA256=
BACKEND_IMAGE_ID=
BACKEND_IMAGE_TAR_SHA256=
FIRMWARE_APP_SHA256=
ZAI_REVIEW_STATUS=
ZAI_REVIEW_VERDICT=
PRODUCTION_BACKEND_STATUS=
BACKEND_OBSERVABILITY_DEPLOYED=
FIRMWARE_OBSERVABILITY_FLASHED=
NEXT_M4_PROTOCOL_READY=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Do not exit while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`.

The device being connected is not itself a reason to perform an unsafe or unreviewed write.

A legitimate stop is allowed when the board identity is verified, all other READY/READONLY_READY work is exhausted, and the sole remaining blocker is the mandatory same-reviewer ZAI resource/balance boundary.

Do not merge, release, delete preserved roots/backups, repartition NVMe, touch Deluge data, change the production Gemini model, create/replace credentials, or change billing without separate explicit human authority.

Keep PR #2 OPEN / DRAFT / UNMERGED.
