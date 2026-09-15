# Slate / NOTE4 Campaign Handoff — 2026-09-07

## Purpose

This file is a full handoff for a new ChatGPT session taking over the live Slate NOTE4 campaign. Live GitHub state is always authoritative over this handoff if the branch has advanced.

## Repository and control plane

- Repository: `Streetjk/slate`
- Active PR: `#2`
- PR branch: `feature/gemini-35-live-evaluation`
- Base: `integration/note4-custom`
- PR must remain `OPEN / DRAFT / UNMERGED` until explicit merge/release authority is given.
- At handoff preparation the live PR head was `31dd0b2d94db7bf64601cfc33cd391a6bd386393` before this handoff documentation commit. Treat the resulting handoff commit itself as documentation-only.

Every time the user says `read report and advise` or similar, first fetch the LIVE PR #2 head with GitHub, then read `docs/campaign-reports/CAMPAIGN-STATE.md` at that exact live SHA and inspect the newest relevant campaign report/commit. Do not advise from an older checkpoint when GitHub has advanced asynchronously.

## User workflow preference

The user wants the controller instructions stored durably in GitHub, with only a short prompt shown in chat.

Pattern:

1. Read live GitHub state.
2. Decide the next campaign instruction.
3. Push the full detailed instruction into `docs/campaign-reports/...` on the PR branch.
4. Give the user a short one-click-copy Codex prompt that points to that file.

Do not dump the whole long instruction into chat unless the user explicitly asks for it. This handoff is an exception because the user explicitly requested the full handoff for a new chat.

## Controller/model routing

- CONTROLLER / INTEGRATOR: Codex CLI
- IMPLEMENTATION WRITER: AGY `gemini-3.8-flash`
- INDEPENDENT REVIEWER: ZAI `glm-5.3-flash`

Reviewer rules:

- Reviewer must be independent/fresh.
- Reviewer inspects the exact frozen artifact/bundle.
- Verdict must bind to exact SHA256.
- Any production-byte change after review invalidates that verdict and requires a fresh ZAI `glm-5.3-flash` exact review.
- `REVISE` is not a human stop. Loop automatically: findings -> Codex adjudication -> AGY repair -> deterministic tests -> new exact freeze -> fresh ZAI review.
- Do not silently substitute reviewer/model/provider if ZAI transport fails.
- Bounded same-reviewer recovery is allowed before escalating.
- Reviewer/provider substitution, new credentials, new billing, or new provider authority requires explicit user authority.

## Long-run operating mode

Use `FRONTIER_DRIVEN_LONGRUN`.

Reports/checkpoints, test PASS, test FAIL with bounded repair, reviewer PASS/REVISE, implementation completion, deployment completion, flash completion, provider/tool transient failures, and milestone completion are NOT terminal while useful frontier work remains.

Before any Codex exit, require explicit counts:

```text
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
```

Do not exit if `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0` unless an explicit safety/authority conflict applies.

A blocked node does not block the whole campaign. Continue another READY/READONLY_READY node.

Legitimate human boundaries include only things such as:

- physical NOTE4 button/mic interaction;
- sudo/root password entry where required;
- irreversible merge/release;
- changed device identity;
- new credentials/provider/billing/private-data authority;
- unresolved P0/P1/security boundary.

Routine continuation must not require the human every 10–30 minutes.

## Safety / authority invariants

- Do NOT merge or release PR #2 without explicit authority.
- Do NOT rerun containerd migration V6.
- Do NOT repartition NVMe.
- Do NOT touch Deluge data.
- Do NOT delete preserved rollback roots/images/backups.
- Do NOT change the production Gemini model unless separately authorized.
- Do NOT change credentials, billing, provider authority, OAuth/ADC authority, private-data authority, Calendar authority, or Outlook authority without explicit authorization.
- Outlook remains read-only and isolated from Gemini.
- Google Calendar remains proposal-only until physical NOTE4 confirmation where applicable.
- Never expose secrets in reports or chat.
- The user has asked to be reminded to unset `ZAI_API_KEY` from the parent shell only when Slate is genuinely at full project closure with no READY/READONLY_READY/WAITING_HUMAN work remaining. Do not remind early and never expose its value.

## Production/storage platform state

The storage migration work is already complete and accepted.

Current intended platform topology:

```text
CONTAINERD_ROOT=/mnt/ssd-tmp/slate-tools/containerd-root
CONTAINERD_STATE=/run/containerd-v5
CONTAINERD_SOCKET=/run/containerd-v5/containerd.sock
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
DOCKER_DRIVER=overlayfs
```

Historical original roots and rollback archives are preserved. Deluge is unchanged. NVMe reserve has passed the campaign checks.

Containerd/Docker migration history included a sequence of V2/V5 failures and safe rollbacks. The final successful migration script was the V6 artifact derived from V5, with internal `M2_ROOT_STEP_V5` log labels retained. V6 succeeded and must NOT be rerun.

The important accepted migration result was:

- containerd root moved to NVMe;
- isolated runtime state under `/run/containerd-v5`;
- Docker endpoint bound to that containerd socket;
- Docker data root on NVMe;
- Slate and MySQL healthy with zero restarts;
- original roots preserved;
- Deluge unchanged.

## Backend/firmware observability campaign

The main UX objective was to validate/fix NOTE4 voice behavior so that:

- one logical user turn -> one user bubble;
- one logical assistant turn -> one assistant bubble;
- partial transcript fragments do not create extra bubbles/e-ink churn;
- audio is normal;
- latency is measurable with sanitized stage timing;
- no unexpected vendor/Tenclass fallback occurs.

A privacy-preserving structural observability change was implemented for backend and firmware. It logs stage markers/status classes/counters/close codes/timestamps only. It must not log raw microphone audio, transcript text, provider payload contents, credentials, auth headers, Calendar data, Outlook data, or private content.

Expected structural markers include firmware-side states such as:

```text
VOICE_CONFIG_REQUEST_START
VOICE_CONFIG_RESULT=<2xx|4xx|5xx|transport_error>
VOICE_CONFIG_PARSE=<PASS|FAIL_ENUM>
VOICE_WS_CONNECT_START
VOICE_WS_CONNECT_RESULT=<OPEN|HTTP_FAIL|TLS_FAIL|TRANSPORT_FAIL>
VOICE_WS_CLOSE_CODE=<...>
VOICE_SESSION_INIT_SENT=YES|NO
VOICE_MIC_STREAM_STARTED=YES|NO
VOICE_GENERIC_FAILURE_BRANCH=<stable_enum>
```

and backend-side states such as:

```text
VOICE_CONFIG_AUTH_ATTEMPT
VOICE_CONFIG_AUTH_RESULT
VOICE_CONFIG_RESPONSE_CLASS
VOICE_WS_UPGRADE_ATTEMPT
VOICE_WS_AUTH_RESULT
VOICE_WS_ACCEPTED
PROVIDER_SESSION_CREATE_START
PROVIDER_SESSION_CREATE_RESULT
PROVIDER_SESSION_STARTED
FIRST_MIC_FRAME_RECEIVED
```

## Qualified exact artifacts

The exact reviewed source bundle for the observability candidate was:

```text
SOURCE_BUNDLE_SHA256=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
BACKEND_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
FIRMWARE_SOURCE_SHA=e3319313c65bc300a45b07570957ff22f05952ce
```

Backend artifact history:

```text
LOCAL_EXPECTED_IMAGE_ID=sha256:5589dfe2ce9c539bfd82334e2c169a7cff962d62a00daca4456ddec6e1576199
REMOTE_CANONICAL_ACTIVE_IMAGE_ID=sha256:63db9b2133af17d0a755a7149c0fb22e9cfa0fcaad19df31fbac2ebf344def17
HISTORICAL_BACKEND_TAR_SHA256=844800c09b0fb04898d6de8edfa565845f94f27b636d7b439733ef22a0998fc4
REGENERATED_TRANSFER_TAR_SHA256=ff6331bfcfb9451eb6b59c1f5abce94ee42d273749cc7104126c2d4e8b5307c9
```

There was an apparent cross-daemon image-ID mismatch after Docker load. Technical recovery proved this was image-store/config-ID semantics rather than changed reviewed source/layers. ZAI performed an additional identity-equivalence review and returned PASS with no P0/P1/P2/security findings. The canonical remote image `sha256:63db9b...` was therefore accepted and deployed.

Current qualified firmware app:

```text
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
FIRMWARE_APP_BYTES=2505008
FIRMWARE_FLASH_OFFSET=0x10000
FIRMWARE_FLASH_SCOPE=APP_ONLY
ESP_IDF_VERSION=5.5.2
```

The firmware build was qualified with pinned ESP-IDF 5.5.2. It was flashed app-only to NOTE4 with no full erase and no bootloader/partition/NVS/LittleFS/pairing/data reset. Post-flash boot/Wi-Fi checks passed and there were no fatal markers.

## ZAI exact review status

ZAI `glm-5.3-flash` eventually returned a valid exact-SHA PASS for the frozen observability bundle:

```text
REVIEWER=glm-5.3-flash
REVIEW_TARGET_SHA=390f831e9e43588d4d9670ffea40fc2b0094cbe0aab3832d6c97509db8c54ca6
VERDICT=PASS
P0=0
P1=0
P2=2
P3=2
```

The P2/P3 items were explicitly nonblocking under PASS. No further source changes were made on their basis before deployment.

## Device

Historical verified NOTE4 device:

```text
DEVICE_PORT=/dev/cu.usbmodem31201
DEVICE_TARGET=ESP32-S3_REV_V0.2
DEVICE_FLASH_SIZE=16MB
DEVICE_FLASH_ID=46_4018
```

The board was reconnected to the Mac and verified before the latest flash/test sequence. A new chat must not blindly assume the port still exists if time has passed; verify read-only if the next action actually needs the device.

## M4 failure history

### Earlier unattributed failure

An earlier physical attempt showed `Voice service unavailable`, but observability was not sufficient to attribute the exact stage. This triggered the privacy-preserving observability work described above.

### First failure with new backend/firmware observability

After the reviewed backend was deployed and exact app-only firmware flashed, the user performed M4 and again saw:

```text
VOICE_SERVICE_UNAVAILABLE=YES
```

Backend structural evidence at the failed attempt showed:

```text
2026-09-07T08:50:28.577544028Z VOICE_WS_UPGRADE_ATTEMPT=YES
2026-09-07T08:50:28.656143838Z VOICE_WS_AUTH_RESULT=PASS
2026-09-07T08:50:28.656317669Z VOICE_WS_ACCEPTED=YES
2026-09-07T08:50:46.638671281Z FIRST_MIC_FRAME_RECEIVED=NO
```

Therefore:

```text
VOICE_WEBSOCKET_AUTHENTICATED_RESULT=PASS
VOICE_WEBSOCKET_OPEN_RESULT=ACCEPTED
BACKEND_FIRST_MIC_FRAME=NO
MIC_AUDIO_REACHED_PROVIDER=NO
PROVIDER_SESSION_CREATE_START=NOT_OBSERVED
PROVIDER_SESSION_CREATE_RESULT=NOT_OBSERVED
PROVIDER_SESSION_STARTED=UNKNOWN
SLATE_RESTART_COUNT=0
MYSQL_RESTART_COUNT=0
BACKEND_HEALTH=PASS_LOCAL_200_PUBLIC_200
SANITIZED_STAGE_LATENCY_DELTAS=WS_ACCEPT_TO_BACKEND_CLOSE_18.0S_APPROX
FAILURE_STAGE=FIRMWARE_POST_AUTHENTICATED_WEBSOCKET_BEFORE_FIRST_MIC_FRAME
ROOT_CAUSE_CLASS=CASE_B_OR_CASE_E_PRE_MIC_FAILURE_WITH_OBSERVER_CAPTURE_GAP
SOURCE_DEFECT=NOT_PROVEN
```

Important: the serial observer used for that attempt had expired, so firmware-side branch markers were missing. Do not infer the exact firmware branch from the backend evidence alone.

No provider-session marker was observed and no first microphone frame reached the backend/provider path. The failure did NOT establish any need to change model/provider/credentials/billing.

Backend targeted voice tests remained `13/13 PASS`; firmware no-vendor test remained PASS; production stayed healthy.

A new sanitized live PTY serial observer was then armed for the next attempt.

### Second physical M4 failure — CURRENT EVENT

The user then performed the next authorized physical attempt while the live sanitized PTY observer was armed and reported again:

```text
VOICE_SERVICE_UNAVAILABLE=YES
SECOND_OBSERVED_M4_FAILURE=YES
MANUAL_RETRY_AFTER_THIS_RESULT=NO
```

This second result is the current event. It satisfies/supersedes the previous `WAITING_HUMAN=1` retest boundary.

Do NOT ask the user for another blind Voice AI retry now.

The live PR head before this handoff doc was:

```text
31dd0b2d94db7bf64601cfc33cd391a6bd386393
```

Latest commit message:

```text
campaign: ingest second M4 failure with live observer
```

Latest dedicated report/instruction:

```text
docs/campaign-reports/08D1M-G-M4-SECOND-FAILURE-LIVE-OBSERVER-ATTRIBUTION.md
```

That report explicitly says the next action is technical attribution from the live observer, not another human retry.

## IMPORTANT stale-state warning

At the moment of handoff, `CAMPAIGN-STATE.md` still had the previous top checkpoint showing:

```text
CURRENT_STAGE=M4_FAIL_ATTRIBUTED_POST_AUTH_WS_PRE_MIC_OBSERVER_GAP
WAITING_HUMAN_COUNT=1
NEXT_ACTION=HUMAN_ENTER_VOICE_AI...
```

That is stale relative to the second operator result and the newest `31dd0b...` instruction.

The newest second-failure report explicitly supersedes that old human boundary.

A correct controller reconciliation should move the frontier back to technical attribution/repair, approximately:

```text
CURRENT_STAGE=M4_SECOND_FAIL_ATTRIBUTION_OR_REPAIR
READY_NODE_COUNT=>=1
WAITING_HUMAN_COUNT=0
```

unless the second observer evidence itself discovers a real security/authority boundary.

## Immediate next action for the new chat/controller

On takeover:

1. Fetch live PR #2 head first. Do not assume `31dd0b...` is still current.
2. Read `CAMPAIGN-STATE.md` at that exact live SHA.
3. Read the newest relevant commit/report, especially `08D1M-G-M4-SECOND-FAILURE-LIVE-OBSERVER-ATTRIBUTION.md` if still current.
4. Determine whether Codex has already ingested the live PTY evidence from the second attempt.
5. If not, push/execute an instruction to ingest and correlate the exact second-attempt time window from:
   - live PTY serial sanitized markers;
   - backend structural markers;
   - backend health/restarts;
   - device port continuity;
   - exact backend/firmware identities.
6. Extract where available:

```text
VOICE_CONFIG_REQUEST_START=
VOICE_CONFIG_RESULT=
VOICE_CONFIG_PARSE=
VOICE_WS_CONNECT_START=
VOICE_WS_CONNECT_RESULT=
VOICE_WS_CLOSE_CODE=
VOICE_SESSION_INIT_SENT=
VOICE_MIC_STREAM_STARTED=
VOICE_GENERIC_FAILURE_BRANCH=
VOICE_CONFIG_AUTH_ATTEMPT=
VOICE_CONFIG_AUTH_RESULT=
VOICE_CONFIG_RESPONSE_CLASS=
VOICE_WS_UPGRADE_ATTEMPT=
VOICE_WS_AUTH_RESULT=
VOICE_WS_ACCEPTED=
PROVIDER_SESSION_CREATE_START=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
FIRST_MIC_FRAME_RECEIVED=
```

7. Classify the failure to the narrowest supported branch, e.g.:

```text
A = authenticated voice-config request/response failure
B = firmware config parse / protocol construction failure
C = WebSocket authentication / upgrade failure
D = WebSocket accepted then firmware-side session-init/send failure
E = WebSocket accepted then pre-mic close / transport / protocol failure
F = provider-session creation failure before mic
G = first mic frame path failure
H = another exact sanitized branch
```

Do not guess beyond evidence.

## Recovery path after second-attempt attribution

If the live observer captured the exact firmware branch:

```text
sanitized exact attribution
-> root-cause proof
-> AGY gemini-3.8-flash minimal repair if product bytes need change
-> Codex deterministic validation
-> privacy/secret scan
-> impacted backend/firmware rebuild only
-> freeze exact identities
-> fresh ZAI glm-5.3-flash exact review for every changed production byte
-> reviewer REVISE repair/retest/rereview loop until PASS
-> reviewed backend redeploy if required
-> exact app-only NOTE4 reflash if required
-> post-deploy/post-flash zero-private-data requalification
-> arm fresh sanitized observers
-> return to human only when one final physical M4 retest is genuinely the sole remaining useful node
```

Do not stop on intermediate checkpoints while READY/READONLY_READY work exists.

If exact attribution proves an operational/config/protocol issue that can be fixed without production-byte changes, perform only the minimum authorized deterministic correction and requalification. Do not change model/provider/credentials/billing/private-data authority.

### If live PTY capture failed again

Do NOT request a third blind physical retry.

Treat a second observer-capture failure as an instrumentation reliability defect. Create a software READY node to make sanitized capture durable, for example:

- bounded persistent sanitized ring buffer/file;
- automatic timestamped marker flush;
- observer-alive heartbeat;
- capture tied to Voice AI session lifecycle;
- fixed post-failure structural snapshot.

No private/audio/transcript/provider-payload/auth content may be retained.

If production bytes change for durable capture, use AGY -> deterministic tests -> exact freeze -> fresh ZAI review -> deploy/reflash -> requalify. Only then can a new physical M4 attempt become the sole human boundary.

## Files that matter most

Always prefer the live branch versions of these:

```text
docs/campaign-reports/CAMPAIGN-STATE.md
docs/campaign-reports/08D1M-G-M4-SECOND-FAILURE-LIVE-OBSERVER-ATTRIBUTION.md
docs/campaign-reports/08D1M-G-M4-FAIL-VOICE-SERVICE-UNAVAILABLE-ATTRIBUTION.md
docs/campaign-reports/08D1M-G-M4-EXECUTE-NOW-AND-INGEST.md
docs/campaign-reports/08D1M-G-EXACT-IMAGE-IDENTITY-RECOVERY.md
docs/campaign-reports/08D1M-G-ZAI-TIMEOUT-RECOVERY-AND-PHYSICAL-CONTINUATION.md
docs/campaign-reports/08D1M-G-OVERNIGHT-OFFLINE-CAMPAIGN.md
```

The newest live state always overrides older report sections. `CAMPAIGN-STATE.md` contains historical/superseded blocks; do not mistake an older block for current truth.

## Key historical milestones

Useful checkpoints, in rough order:

```text
cd45fbbd82cdf41ac153bcd525d25304ddf1e21a  Docker V8 manual migration PASS
ba2422ebeeef715c83a01a4f2414297ff91f4bb5  V2 restart-growth failure/rollback
f927c50d9edbb95dec96f05680dd6cfe9977d0f8  V5 quote correction
6b06d5c5f1a1537deb1263010112e70837cced7a  exact V6 review pass recorded
6a35b48ff4779ebb615710862c6ff4c9ad3cb686  M4 physical checkpoint armed
d8c20c5c236d824fd1dcc3650b84b1db497e353f  original voice-service-unavailable failure retained
061fdb6f60781daeb6fca070239cf93ea525680e  board-window observability candidate
35e49473e9ccee4d84300c6fbd48a2023f77f95b  overnight offline directive
4e52a48c0955f9afb7d8a45fbd2bb83a420fd648  exact ZAI PASS frontier
bc3fed0b397c129eb5025ae7e44f194be1369a6a  exact image identity recovery instruction
752a1f1bf947c17de98d81bdcf6c8d9bc22b63e8  exact app-only firmware PASS / M4 ready
5bf40eb4cc0d71f2c732eebfb405871238bdb701  first new M4 failure instruction
d8d2d35b10b5ae1cc9ed728ec518fa0bd06b59b8  first failure attributed post-auth WS pre-mic
31dd0b2d94db7bf64601cfc33cd391a6bd386393  second physical M4 failure recorded with live observer
```

Do not assume any of these is still the live head; always re-fetch.

## How to respond to the user in the new chat

When the user says `read report and advise`:

- do the live GitHub reconciliation silently first;
- tell the user the exact current stage in plain language;
- distinguish a genuine human boundary from a premature stop;
- push the full next instruction to GitHub;
- give only a short one-click-copy Codex prompt in chat;
- do not ask unnecessary clarification;
- do not manually mutate unrelated repo state;
- do not merge/release.

Preferred short-prompt style:

```text
Reconcile PR #2 and read:

<new instruction file path>

Execute it under FRONTIER_DRIVEN_LONGRUN.

<one or two key constraints>

Keep PR #2 OPEN / DRAFT / UNMERGED.
```

## Current recommendation at handoff

Do not ask the user to retry Voice AI again now.

The immediate campaign job is to ingest the second failed attempt's live PTY + backend sanitized evidence, classify the exact pre-mic failure branch, and continue automatically through repair/requalification. Only return to the user for another physical M4 test after all nonphysical work is exhausted and the next physical test is genuinely the sole remaining useful node.
