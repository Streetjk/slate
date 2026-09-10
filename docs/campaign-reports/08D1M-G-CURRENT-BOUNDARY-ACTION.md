# Campaign 8D1M-G — Current Boundary Action Directive

## Mission

Resume from the completed overnight nonphysical qualification checkpoint without repeating exhausted work. Operate in `FRONTIER_DRIVEN_LONGRUN`. Live GitHub state is authoritative. Keep PR #2 open, draft, and unmerged. Preserve rollback roots/assets, Docker/containerd NVMe topology, MySQL identity/data, Deluge data, credentials, model authority, and existing provider/privacy boundaries.

Before execution, fetch/reconcile PR #2 and read:

- `docs/campaign-reports/CAMPAIGN-STATE.md`
- `docs/campaign-reports/08D1M-G-POST-OVERNIGHT-RESUME-AND-BOUNDARY.md`
- `docs/campaign-reports/08D1M-G-OVERNIGHT-OFFLINE-CAMPAIGN.md`

Do not create documentation-only `CURRENT_HEAD` loops.

## Accepted checkpoint

Accept unless live evidence disproves it:

```text
M4_STATUS=FAIL_VOICE_SERVICE_UNAVAILABLE
DEVICE_STATUS=OFFLINE_OR_NOT_ENUMERATED
SOURCE_BUNDLE_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
BACKEND_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
FIRMWARE_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
NONPHYSICAL_REQUALIFICATION_STATUS=PASS_LOCAL_AND_ARM64_PROVIDER_DISABLED
PRODUCTION_BACKEND_STATUS=UNCHANGED_HEALTHY
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_DEVICE_COUNT=2
EXTERNALLY_BLOCKED_COUNT=1
CURRENT_BLOCKED_NODE=EXACT_ZAI_REVIEW_AND_NOTE4_PHYSICAL_FLASH_RETEST
```

Do not repeat completed qualification merely to remain busy.

## Frozen firmware

```text
ESP_IDF_VERSION=5.5.2
FIRMWARE_BUILD_STATUS=PASS
FIRMWARE_APP_PATH=firmware/build-overnight/slate.bin
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
FIRMWARE_APP_BYTES=2505008
FIRMWARE_BOOTLOADER_SHA256=c94bd23d5fdfab16eefc505efd714d800bbf4399d5a52e19515a6d362addb5c3
FIRMWARE_PARTITION_TABLE_SHA256=6f0657eb6b8007c0dbfed6f64cf7a0d59f8ee1752af898e2f66dd218846b1835
```

Do not rebuild unchanged firmware for ceremony. Any byte change requires fresh deterministic qualification and a new exact review target.

## Frozen backend

```text
BACKEND_IMAGE_TAG=slate:overnight-observability-e0b89e0a
BACKEND_IMAGE_ID=sha256:5589dfe2ce9c539bfd82334e2c169a7cff962d62a00daca4456ddec6e1576199
BACKEND_IMAGE_PLATFORM=linux/arm64
BACKEND_IMAGE_TAR_SHA256=844800c09b0fb04898d6de8edfa565845f94f27b636d7b439733ef22a0998fc4
BACKEND_CONFIG_IDENTITY=fa200c812d62672db94715115eb50b5fa04ad87d47fa53a6e5d3b8723148fbf3
BACKEND_PROVIDER_DISABLED_IMAGE_TESTS=13_PASS_0_FAIL_NETWORK_NONE
BACKEND_SECRET_SCAN=PASS
```

Do not deploy changed backend bytes before exact ZAI review PASS.

## Role routing

```text
CONTROLLER_INTEGRATOR=Codex
IMPLEMENTATION_WRITER=AGY gemini-3.8-flash
INDEPENDENT_REVIEWER=ZAI glm-5.3-flash
```

Do not silently substitute reviewer/provider/model. Do not waive review.

## Immediate action — exact ZAI resource gate

Prepared exact review target:

```text
ZAI_REVIEW_PROFILE=zai-glm53-reviewer
ZAI_REVIEW_MODEL=glm-5.3-flash
ZAI_REVIEW_TARGET_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
```

The prior route returned insufficient balance/resource package.

At session start perform only one bounded same-route resource check. Do not hammer the endpoint.

If the already-authorized ZAI resource is available, submit the existing exact frozen review packet once and require:

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

A partial or malformed result is not PASS.

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

If the same authorized ZAI resource remains blocked, persist the external block and do not retry repeatedly. Do not create/replace credentials. Do not change billing. Do not purchase/recharge resources automatically. Do not switch to Gemini, Grok, Claude, OpenRouter, or another reviewer.

Recompute the frontier. If `READY_NODE_COUNT=0` and `READONLY_READY_NODE_COUNT=0`, a stop at this external-resource boundary is legitimate.

## Device semantics

NOTE4 offline is `WAITING_DEVICE`, not a campaign-wide failure.

If NOTE4 reconnects before exact ZAI PASS, perform only non-mutating identity/enumeration checks if useful. Verify it is the same qualified ESP32-S3 target. Do not flash changed observability firmware and do not consume another microphone/provider session before exact review PASS.

If NOTE4 remains offline, do not ask for reconnection merely for already-exhausted diagnostics.

## Sequence after exact ZAI PASS

When a valid exact PASS exists, continue automatically.

### 1. Deploy reviewed backend while NOTE4 may remain offline

Deploy the exact frozen ARM64 observability backend using the already-authorized fail-closed C3 pattern.

Verify:

- exact active image identity;
- Slate running/healthy, restart count zero/stable;
- MySQL running/healthy, identity preserved, restart count zero/stable;
- local/public health HTTP 200;
- secret mount remains read-only;
- unauthenticated voice-config guard rejects as expected;
- WebSocket route control remains reachable;
- no vendor/Tenclass fallback;
- no provider session created by validation;
- no production Gemini model change;
- no credential/billing change;
- rollback image remains available.

Rollback automatically on regression. Backend deployment PASS is not a stop.

### 2. Prepare exact app-only NOTE4 firmware handoff

After review PASS and backend deployment/requalification PASS, mark the frozen firmware ready for next connection.

Use APP-ONLY flash only. Preserve bootloader, partition table, NVS, pairing, LittleFS/user data, and device identity. No full erase.

Before flash verify exact board identity and exact binary SHA256:

`8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a`

After flash verify write/hash success, normal boot, Wi-Fi, pairing preservation, authenticated polling, no fatal markers, and presence of the sanitized stage markers.

### 3. One combined M4 diagnostic/acceptance session

After exact reviewed backend and firmware are active, request ONE physical session only:

1. enter Voice AI;
2. one short non-sensitive English turn;
3. if service works, one short Japanese turn;
4. exit Voice AI;
5. if `VOICE_SERVICE_UNAVAILABLE` appears, do not blindly retry.

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

If conversation succeeds also validate one-user-turn/one-user-bubble, one-assistant-turn/one-assistant-bubble, no fragment-created bubbles, no excessive e-ink redraw churn, normal audio, sanitized latency-stage deltas, and no unexpected vendor fallback.

Never retain raw mic audio, transcript text, provider payload contents, auth material, Calendar contents, or Outlook data.

## No-repeat rule

Do not rerun already-passed overnight work unless bytes changed, artifact identity cannot be verified, environment drift invalidates it, reviewer findings require retest, or new evidence contradicts the checkpoint.

Do not repeatedly rebuild identical artifacts, repeatedly hit the blocked ZAI endpoint, rerun provider-disabled tests merely to remain busy, or create documentation-only head-refresh loops.

## Exit contract

Before any exit report:

```text
CURRENT_HEAD=
CURRENT_STAGE=
DEVICE_STATUS=
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
NEXT_APP_ONLY_FLASH_READY=
NEXT_M4_PROTOCOL_READY=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Do not exit while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`.

A legitimate stop is allowed only when all nonphysical work is exhausted and the only remaining blockers are the mandatory same-reviewer ZAI resource/balance boundary and/or the NOTE4 physical-device boundary.

Do not merge, release, delete preserved roots/backups, repartition NVMe, touch Deluge data, change the production Gemini model, create/replace credentials, or change billing without separate explicit human authority.

Keep PR #2 OPEN / DRAFT / UNMERGED.
