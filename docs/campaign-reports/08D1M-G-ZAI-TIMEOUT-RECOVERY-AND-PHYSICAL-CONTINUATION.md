# Campaign 8D1M-G — ZAI Timeout Recovery and Physical Continuation

## Execution checkpoint — exact ZAI review PASS; deployment/flash frontier active

Reconciled PR #2 at remote head `4e52a48c0955f9afb7d8a45fbd2bb83a420fd648`.
The prior reviewer process was confirmed dead with no final output. One
longer bounded recovery attempt then returned the following valid exact-SHA
verdict:

```text
REVIEWER=glm-5.3-flash
REVIEW_TARGET_SHA=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
VERDICT=PASS
P0=0
P1=0
P2=2
P3=2
SECURITY_FINDINGS=P2_HARDENING_ONLY_AUTHENTICATED_HTTP_BASE_URLS_AND_REDIRECTS_MUST_REMAIN_HTTPS_FAIL_CLOSED_AND_AUTH_SAFE
FINDINGS=P2_UNSYNCHRONIZED_MIC_STREAM_MARKER_FLAG; P3_BROAD_VOICE_CONFIG_MATCH; P3_PROTOCOL_MISMATCH_TRANSPORT_LOG_STRING
```

The P2/P3 findings are recorded as nonblocking observations under the
reviewer's explicit PASS. They do not authorize unrelated source changes and
the frozen bytes remain unchanged. The qualified ARM64 image and ESP-IDF
5.5.2 app binary still match their recorded identities. The exact backend is
now authorized for the bounded deployment sequence; the exact app-only
firmware remains pending backend deployment verification.

```text
ZAI_REVIEW_ATTEMPTS_TOTAL_FOR_TIMEOUT_RECOVERY=2
ZAI_REVIEW_STATUS=PASS_EXACT_SHA
ZAI_REVIEW_VERDICT=PASS
BACKEND_DEPLOYMENT_STATUS=PENDING_EXACT_IMAGE_RECONCILIATION
FIRMWARE_FLASH_STATUS=PENDING_BACKEND_PASS
M4_STATUS=PENDING_BACKEND_AND_FIRMWARE
PRODUCTION_CHANGED=NO_AT_CHECKPOINT
FIRMWARE_FLASHED=NO_AT_CHECKPOINT
NEXT_ACTION=VERIFY_EXACT_ARM64_IMAGE_AND_EXISTING_DEPLOYMENT_TOPOLOGY_THEN_DEPLOY
```

## Mission

Resume Campaign 8D1M-G from the latest live checkpoint without repeating exhausted work. Operate in `FRONTIER_DRIVEN_LONGRUN`. Keep PR #2 open, draft, and unmerged. Live GitHub state is authoritative.

Before execution, fetch/reconcile PR #2 and read:

- `docs/campaign-reports/CAMPAIGN-STATE.md`
- `docs/campaign-reports/08D1M-G-BOARD-RECONNECTED-ACTION.md`
- `docs/campaign-reports/08D1M-G-CURRENT-BOUNDARY-ACTION.md`

Do not create documentation-only `CURRENT_HEAD` loops.

## Accepted latest checkpoint

Accept unless live evidence disproves it:

```text
DEVICE_STATUS=CONNECTED_IDENTITY_VERIFIED
DEVICE_PORT=/dev/cu.usbmodem31201
DEVICE_TARGET=ESP32-S3_REV_V0.2
DEVICE_FLASH_SIZE=16MB
DEVICE_FLASH_ID=46_4018
DEVICE_WRITE=NO
SOURCE_BUNDLE_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
BACKEND_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
FIRMWARE_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
BACKEND_IMAGE_ID=sha256:5589dfe2ce9c539bfd82334e2c169a7cff962d62a00daca4456ddec6e1576199
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
ZAI_REVIEW_PROFILE=zai-glm53-reviewer
ZAI_REVIEW_MODEL=glm-5.3-flash
ZAI_REVIEW_TARGET_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
ZAI_REVIEW_STATUS=EXTERNALLY_BLOCKED_TIMEOUT_NO_VALID_FINAL_VERDICT
ZAI_REVIEW_VERDICT=NOT_OBTAINED
BACKEND_DEPLOYED_THIS_ACTION=NO
FIRMWARE_FLASHED_THIS_ACTION=NO
PRODUCTION_CHANGED=NO
```

The board identity is now verified and no longer a blocker. Do not repeat board identity probing unless the port/device changes or disappears.

## Important reinterpretation of the reviewer failure

The latest exact ZAI attempt is materially different from the earlier insufficient-balance result.

The corrected launcher successfully started `zai-glm53-reviewer` using `glm-5.3-flash`, the reviewer reached read-only artifact inspection, and the controller then hit its bounded timeout before a final message/verdict was persisted.

Therefore classify the current failure first as:

```text
SAME_REVIEWER_TIMEOUT_OR_RESULT_RETURN_FAILURE
```

not automatically as a billing/resource failure.

Do not request reviewer substitution, billing change, credentials, or provider authority until bounded same-reviewer recovery is genuinely exhausted.

## Immediate action — recover the same reviewer route

Perform the following in order.

### R1 — inspect the prior attempt read-only

Check whether the prior reviewer process/session is still alive and whether any final output, transcript-free result file, exit status, or persisted message exists.

Do not expose credentials or private auth material.

If an already-produced final verdict exists, accept it only if it explicitly binds to:

```text
REVIEWER=glm-5.3-flash
REVIEW_TARGET_SHA=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
VERDICT=PASS|REVISE
P0=<n>
P1=<n>
P2=<n>
P3=<n>
SECURITY_FINDINGS=<...>
FINDINGS=<...>
```

A partial/malformed result is not PASS.

### R2 — one controlled longer same-reviewer retry if needed

If the prior process is dead and no valid final verdict exists, perform exactly ONE additional recovery attempt using:

```text
PROFILE=zai-glm53-reviewer
MODEL=glm-5.3-flash
TARGET_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
PACKET=THE_EXISTING_FROZEN_EXACT_REVIEW_PACKET
```

Do not change reviewer, model, credentials, endpoint, billing, packet contents, source bytes, backend image bytes, or firmware bytes.

Use a longer but still bounded controller timeout appropriate for a reviewer that already reached artifact inspection. Prefer up to 30 minutes maximum for this one recovery attempt. Do not repeatedly restart the reviewer inside that window.

Capture only sanitized structural execution evidence and the final reviewer result.

If the reviewer returns `REVISE`, continue automatically:

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

Reviewer `REVISE` is not a human stop.

If the second same-reviewer attempt also produces no valid final verdict, or returns an explicit resource/balance/auth failure, classify the same-reviewer route as genuinely exhausted for this campaign state. Do not hammer it further.

## Sequence after exact ZAI PASS

If exact ZAI PASS is obtained and all frozen identities still match, continue automatically without another routine approval.

### 1. Deploy reviewed backend

Deploy the exact frozen ARM64 observability backend using the already-authorized fail-closed deployment pattern.

Verify:

- exact active image identity;
- Slate running/healthy and restart count stable at zero;
- MySQL running/healthy, identity preserved, restart count stable;
- local/public health HTTP 200;
- secret mount remains read-only;
- unauthenticated voice-config guard behaves as expected;
- WebSocket route control is reachable;
- no vendor/Tenclass fallback;
- no provider session is created by validation;
- no production Gemini model change;
- no credential/billing change;
- rollback image remains available.

Rollback automatically on regression. Backend deployment PASS is not a stop.

### 2. App-only NOTE4 flash

Because the device is already verified as the historical qualified NOTE4 at `/dev/cu.usbmodem31201`, proceed with the exact reviewed app-only firmware when review/deployment gates are green.

Before write, recheck only that the same port still resolves to the same ESP32-S3 identity and verify binary SHA256:

```text
8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
```

Write APP partition only at the already-qualified application offset. Preserve:

- bootloader;
- partition table;
- NVS;
- pairing;
- LittleFS/user data;
- device identity.

No full erase.

After flash verify:

- write/hash success;
- normal boot;
- Wi-Fi;
- pairing preserved;
- authenticated polling;
- no fatal markers;
- sanitized stage observability markers present.

Flash PASS is not a stop.

### 3. Prepare one combined M4 session

After reviewed backend + reviewed app firmware are active and stable, arm the sanitized backend/serial observers and stop only at the genuine physical microphone/button boundary.

Request ONE combined physical session:

1. enter Voice AI;
2. one short non-sensitive English question;
3. if service works, one short Japanese question;
4. exit Voice AI;
5. if `VOICE_SERVICE_UNAVAILABLE` occurs, do not blindly retry.

Mechanically capture sanitized stage results:

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

If conversation succeeds, also validate:

- one logical user turn = one user bubble;
- one logical assistant turn = one assistant bubble;
- no transcript-fragment-created extra assistant bubbles;
- no excessive e-ink redraw churn;
- normal audio;
- sanitized latency-stage deltas;
- no unexpected vendor fallback.

Never retain raw microphone audio, transcript text, provider payload contents, auth material, Calendar contents, or Outlook data.

## If same-reviewer recovery is genuinely exhausted

If the additional same-reviewer recovery attempt fails to produce a valid exact verdict and no READY/READONLY_READY work remains, stop at the genuine reviewer-authority/resource boundary.

Do not flash or deploy unreviewed changed bytes.

Report a compressed decision packet stating that the remaining choices require human authority, such as restoring the same ZAI resource or explicitly authorizing a reviewer/provider substitution. Do not choose either automatically.

## Exit contract

Before any exit report:

```text
CURRENT_HEAD=
CURRENT_STAGE=
DEVICE_STATUS=
DEVICE_PORT=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
ZAI_REVIEW_ATTEMPTS_TOTAL_FOR_TIMEOUT_RECOVERY=
ZAI_REVIEW_STATUS=
ZAI_REVIEW_VERDICT=
BACKEND_DEPLOYMENT_STATUS=
FIRMWARE_FLASH_STATUS=
M4_STATUS=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Do not exit while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`.

Do not merge/release, delete preserved roots/backups, repartition NVMe, touch Deluge data, change production Gemini model, create/replace credentials, or change billing without separate explicit authority.

Keep PR #2 OPEN / DRAFT / UNMERGED.
