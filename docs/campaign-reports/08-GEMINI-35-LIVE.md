# Stage Report

Stage: Campaign 8 — Gemini 3.5 Live evaluation / voice-stack upgrade
Date: 2026-09-02 (Australia/Perth)
Status: READY_FOR_SLATE_VOICE_FLASH — routing defect fixed; replacement candidate pending explicit human flash authorization

## Repository State

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
Base SHA: `2d4a2a9e9a380c591c2ac7f0f3120f1f7939b65d` (`origin/integration/note4-custom`)
Start SHA: `ad6ed1ec04ad7afffd9822be1632b456fa066d11`
Implementation SHA: `121622c3bd1d23587b4aadb3a079ec85d2052278` (Slate voice routing migration)
Head SHA: `121622c3bd1d23587b4aadb3a079ec85d2052278` before this report commit
Campaign 8 instruction SHA: `ad6ed1ec04ad7afffd9822be1632b456fa066d11`
Campaign 8A instruction SHA: `6b61af7` (newer precedence addendum)
PR: #2, draft, base `integration/note4-custom`

## Harness

Codex version: `codex-cli 0.152.0`
AGY version: `1.1.23`
AGY model: `gemini-3.7-flash-high` for architecture/security review
AGY authentication: official AGY OAuth; no API key used
Orchestration mode: Codex primary controller; AGY read-only reviewer

## Objective

Verify whether Gemini 3.5 Live can replace or safely augment Slate’s current NOTE4 conversational Live model through the approved OAuth/ADC/Vertex architecture, without losing English/Japanese voice, audio conversation, transcription, Search grounding, function calling, Google Calendar confirmation, Outlook isolation, or session lifecycle behavior.

## Decision

Selected outcome: **C — no migration yet**.

Keep the existing backend-controlled model:

```text
GEMINI_LIVE_MODEL=gemini-live-2.5-flash-native-audio
```

No firmware model string exists and no NOTE4 button mapping changes are needed. The candidate `gemini-3.1-flash-live-preview` is a capable full conversational Live model on the Gemini API documentation surface, but its availability through Slate’s current Vertex/ADC client path was not established by the current official Vertex/Agent Platform catalogue or a live authorized account probe. The 3.5 models reviewed are specialized transcription or translation models and cannot replace the general agent.

This is a deliberate no-change result, not an adoption of a candidate model.

## Official Capability Matrix

The following are documented facts from the linked official sources, not claims of live account acceptance.

| Model | Surface / exact ID | Role and documented capabilities | Full Slate requirement | Decision |
|---|---|---|---|---|
| Current Slate Live | Vertex/Google Cloud Live API: `gemini-live-2.5-flash-native-audio` | Current Vertex Live catalogue lists it as generally available, with native audio, audio transcription, VAD, tool use, multilingual conversation, and barge-in support. | Audio in/out, EN/JP, input/output transcript, Search/tools, Calendar proposal flow, lifecycle | Retain |
| Gemini 3.1 Flash Live | Gemini API: `gemini-3.1-flash-live-preview` | Preview audio-to-audio general dialogue model; text/image/audio/video input, text/audio output, Live API, audio generation, function calling, Search grounding, and thinking. Migration notes require current 3.1 event/input semantics and synchronous function responses. | Appears full-capability on Gemini API surface, but Vertex/ADC availability for Slate was not verified; current Vertex supported-model page lists only the existing 2.5 Live model. | Do not select |
| Gemini 3.5 Transcribe Live | Gemini API: `gemini-3.5-transcribe-live`; Agent Platform listing: `gemini-3.5-transcribe-live-preview` | Dedicated streaming speech-to-text pipeline. Official Gemini API guide documents text transcription, automatic language detection, Smart transcription, VAD strategies, and a ten-minute session limit. It is not a spoken conversational agent and has no model audio output. The Agent Platform page lists the preview globally and reports no function calling, grounding, or system instructions. | STT only; cannot provide reasoning, spoken response, Search, or Calendar proposal/tool flow by itself. A sidecar would duplicate audio transport and add privacy/latency/complexity. | Do not add sidecar |
| Gemini 3.5 Live Translate | Gemini API: `gemini-3.5-live-translate-preview` | Preview low-latency audio-to-audio translation; audio input and translated audio/text output. Official model page says function calling, Search grounding, system instructions, structured output, and thinking are unsupported. | Translation only; not a general Q&A/tool/Calendar agent. | Reject for general agent |
| Newer full Gemini 3.5 Live agent | Current official Gemini model catalogue | The current catalogue lists Gemini 3.5 Flash as a text model, Gemini 3.5 Transcribe/Transcribe Live as audio transcription, and Gemini 3.5 Live Translate as translation. No newer full conversational Gemini 3.5 Live agent model was published in the reviewed catalogue. | No verified full-capability 3.5 Live agent to adopt. | None |

Official sources rechecked on 2026-09-02:

- [Gemini model catalogue](https://ai.google.dev/gemini-api/docs/models)
- [Gemini 3.1 Flash Live](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview)
- [Gemini 3.5 Live Translate](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-live-translate-preview)
- [Gemini Live transcription](https://ai.google.dev/gemini-api/docs/live-api/live-transcribe)
- [Gemini deprecations and lifecycle](https://ai.google.dev/gemini-api/docs/deprecations)
- [Google Cloud / Vertex Live API supported models](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/live-api)
- [Google Cloud Gemini 3.5 Transcribe model availability](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-transcribe)
- [Vertex/ADC Gemini quickstart](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart)

## OAuth/ADC and Live Probe Evidence

The existing Slate adapter constructs `GoogleGenAI` with `vertexai: true`, `project`, and `location`; configuration fails closed when the project or location is absent. The existing environment schema has no Gemini API-key setting.

Local probe results:

- `gcloud` executable: unavailable on this development Mac.
- ADC access-token availability probe: `UNAVAILABLE`.
- `GOOGLE_CLOUD_PROJECT` process configuration: unset.
- `GOOGLE_CLOUD_LOCATION` process configuration: unset.
- Installed `@google/genai`: `2.20.0`.
- Live model discovery/probes: **not run**, because no approved local ADC identity/project is available and no API-key fallback is permitted.
- Current Slate model account acceptance: **not live-proven in this environment**; it is documented as supported by the current Vertex Live surface and is covered by existing mocked adapter tests.

No access token, credential file, `.env` value, API key, or production secret was read or copied.

## Existing Architecture and Button Path

No Gemini model migration was justified. Campaign 8A separately fixes the physical voice-routing defect while keeping the model backend-owned:

```text
NOTE4 ENTER double-click
  → firmware XiaozhiScene
  → ENTER short-click / XiaozhiService
  → authenticated Slate voice WebSocket
  → backend GeminiLiveService
  → GEMINI_LIVE_MODEL
```

The existing firmware path preserves double-tap ENTER entry/exit, short ENTER conversation control and Calendar confirmation, UP/DOWN cancellation or volume behavior, and long ENTER settings behavior. No model identifier appears in firmware, and this PR changes no firmware file, display path, audio driver, sync path, or flash artifact.

The existing backend continues to provide input/output transcription, English/Japanese language instruction, audio streaming, Search/tool configuration, proposal-only Google Calendar handling, strict tool validation, Outlook isolation, reconnect/timeout cleanup, and Opus/PCM conversion. No production behavior was changed by this evaluation.

## Implementation Changes

The Gemini model evaluation remains a no-op Outcome C. Campaign 8A adds the Slate-owned firmware voice bootstrap and narrow backend configuration endpoint described below. Existing audio, UI, protocol framing, button mapping, Calendar confirmation, and Outlook isolation were retained.

## Tests and Validation

- `bun run --cwd backend test` — PASS; **270 passed, 0 failed**, 845 assertions across 71 files.
- `bun run --cwd shared test` — PASS; **6 passed, 0 failed**, 27 assertions.
- `bun run format:check` — PASS.
- `bun run lint` — PASS; frontend and backend ESLint completed with zero warnings.
- `bun run typecheck` — PASS; frontend and backend TypeScript checks completed.
- `bun run --cwd frontend build` — PASS; Vite transformed 2,169 modules and produced the production bundle.
- `git diff --check` — PASS.
- Existing Gemini Live unit tests — PASS within the backend suite: model configuration, ADC fail-closed behavior, timeout, PCM lifecycle, transcription/event handling, reconnect, interruption, tools, and Calendar proposal flow.
- Firmware isolation — PASS; branch diff against `origin/integration/note4-custom` contains no `firmware/` files.
- Live Gemini probes — NOT RUN; blocked by unavailable local ADC/project, with no API-key substitution.
- Latency comparison — NOT MEASURED; no authorized Live account or physical microphone/speaker test was available. No quality or latency improvement is claimed.

## AGY Review

Reviewer model: `gemini-3.7-flash-high`
Effort level: high
Review scope: read-only review of the capability matrix, current Gemini Live adapter, auth boundaries, test evidence, and no-migration decision
Verdict: PASS

AGY review completed read-only on 2026-09-02. It independently accepted Outcome C and found no P0, P1, or P2 issues.

P0 findings: None.
P1 findings: None.
P2 findings: None.
P3 findings:

- Live ADC model discovery and latency probes were not executed because this development environment has no local `gcloud`/ADC project configuration. AGY classified this as informational and confirmed that the report handled the limitation without credential workarounds or static API keys.

Findings accepted:

- Adopt Outcome C and retain `gemini-live-2.5-flash-native-audio` with zero runtime code changes.
- Preserve the current OAuth/ADC, tool allowlist, Outlook isolation, Calendar confirmation gate, firmware button mapping, and Campaign 6D/PR #1 isolation.

Findings rejected or deferred:

- No false-positive findings were rejected.
- Future adoption of `gemini-3.1-flash-live-preview`, a `gemini-3.5-transcribe-live` sidecar, or `gemini-3.5-live-translate-preview` was deferred because current evidence does not establish a full-capability approved Vertex/ADC path and the specialized models would either reduce capability or add unnecessary audio/privacy/latency complexity.

AGY evidence summary:

- AGY verified that the current Vertex/ADC model remains the documented supported full-capability Live path for Slate.
- AGY verified the 3.5 models are specialized and the 3.1 full Live candidate is documented on the Gemini API surface but not established on the current Vertex/ADC surface.
- AGY verified the branch changes are documentation-only and contain no firmware, e-ink, PR #1, deployment, or production configuration changes.

Required review questions:

- Is retaining the current Vertex/ADC model justified by the official surface and capability evidence?
- Are the 3.1, Transcribe Live, and Live Translate roles distinguished correctly?
- Does the no-sidecar decision preserve privacy, latency, lifecycle, and full Slate capability?
- Are OAuth/ADC-only, Outlook isolation, Calendar confirmation, firmware ownership, and button mapping preserved?

## Security Checks

OAuth/ADC-only runtime: PRESERVED; no API-key path introduced.
`GEMINI_API_KEY` / `GOOGLE_API_KEY` introduced: NO.
OpenRouter/proxy introduced: NO.
NOTE4 direct Gemini access: NO; backend remains model authority.
Outlook exposed to Gemini: NO; existing isolation tests remain unchanged and passing.
Outlook write capability: NO.
Google Calendar confirmation gate: PRESERVED; no model change can bypass physical Confirm/Cancel.
Secrets in diff/reports/logs: NONE detected.
Production `.env`, Orange Pi, NOTE4 flash state: untouched.

## Known Issues

- Live model discovery and latency/transcription comparison remain unverified until a user-authorized Google Cloud ADC/Vertex project is available in a development environment.
- Gemini 3.1 Flash Live may become a future candidate if Google documents it on the approved Vertex/ADC surface or an explicitly approved OAuth-compatible product path is verified.
- Gemini 3.5 Transcribe Live remains an optional future STT experiment only; no duplicate microphone sidecar was added without measurable benefit and a documented privacy/latency design.
- Physical NOTE4 English/Japanese audio, barge-in, and reconnect validation remains a human hardware boundary.
- No deployment or merge was performed.

## Deviations

- The user requested bounded live tests and latency comparisons where authorized. They were not run because the local approved ADC identity/project was unavailable; no credential workaround was used.
- Claude Sonnet 5 was optional for bounded worker tasks and was not needed because no runtime implementation change was justified.

## Next Recommended Stage

Human review of PR #2. If live comparative testing is desired, provide an approved development ADC/Vertex project through the normal Google login flow; do not send credentials in chat. Re-run bounded probes for the current model and any officially Vertex/ADC-supported candidate. Do not deploy, merge, alter production `.env`, or flash NOTE4 automatically.

## Final Stage Verdict

READY_FOR_SLATE_VOICE_FLASH — OUTCOME C / ROUTING FIX COMPLETE; NOT FLASHED OR DEPLOYED

## Campaign 8A — Slate Voice Routing Defect and Flash Checkpoint

Instruction precedence: `08A-VOICE-ROUTING-TENCLASS-INSTRUCTIONS.md`, remote instruction commit `6b61af7`.

### Physical evidence

The real NOTE4 evidence is recorded without retaining the transient verification code:

```text
MIC_CAPTURE=PASS
VOICE_UI=PASS
LEGACY_XIAOZHI_ACTIVATION_DETECTED=YES
SLATE_GEMINI_VOICE_E2E=FAIL/BLOCKED
```

The old firmware reached Voice AI and captured/transcribed microphone input, then entered its external activation fallback. No Tenclass/Xiaozhi control-panel pairing was performed.

### Root cause

Before this fix, `XiaozhiService::ConfigTask()` called `ActivationClient::Fetch()` whenever no local protocol configuration existed. `ActivationClient::kConfigUrl` pointed at the Tenclass OTA/configuration service. An activation response was converted into `kAwaitingActivation`, and `XiaozhiScene` rendered the vendor activation message/code. The Slate WebSocket route was only reached after that external service returned protocol configuration.

### Current and intended routing

```text
BROKEN (old firmware)
ENTER double-click
  → XiaozhiScene / XiaozhiService
  → ActivationClient::Fetch()
  → external vendor activation/configuration
  → kAwaitingActivation + control-panel code
  → vendor protocol config (if returned)
  → voice transport

INTENDED (candidate firmware)
ENTER double-click
  → XiaozhiScene / XiaozhiService
  → authenticated Slate GET /api/v1/devices/current/voice/config
       Authorization: Bearer <existing device_secret>
  → Slate returns only { websocket.path, websocket.version }
  → firmware derives wss://<configured Slate server>/api/v1/voice/websocket
  → existing Slate device-secret WebSocket handshake
  → Slate Xiaozhi-compatible session bridge
  → backend GeminiLiveService / configured Gemini Live model
```

### Migration implemented

- Added authenticated `GET /api/v1/devices/current/voice/config` under `DeviceAuthGuard`; it returns only the fixed Slate WebSocket path and protocol version, never a vendor activation response or cloud credential.
- Added firmware `SlateVoiceConfigClient`, which uses the existing authenticated Slate API client and configured server address.
- Removed the production `ActivationClient`, its Tenclass endpoint, activation HMAC/challenge flow, and `kAwaitingActivation` UI/state.
- The WebSocket transport always reads the current Slate `device_secret` from the existing `slate.net` NVS namespace. It ignores any old persisted voice token, preventing stale vendor credentials from being reused.
- Existing protocol configuration is accepted only when it exactly matches the configured Slate server, `wss`/`ws` scheme, fixed `/api/v1/voice/websocket` path, and protocol version 1. Stale or foreign configuration is rejected and refreshed from Slate.
- Protocol selection is now Slate WebSocket-only; old MQTT/vendor configuration cannot silently become the production voice route.
- ENTER/UP/DOWN controls, audio capture/playback, and physical Calendar Confirm/Cancel behavior are unchanged.

### Changed files

- `backend/src/modules/devices/device-firmware.controller.ts` — authenticated Slate voice-config endpoint.
- `backend/src/modules/devices/device-firmware.controller.test.ts` — endpoint response contract test.
- `backend/src/common/nest/guards/device-auth.guard.test.ts` — missing/valid device-auth coverage.
- `firmware/main/sync/api_client.{h,cc}` — authenticated voice-config request/parser.
- `firmware/main/xiaozhi/config/slate_voice_config_client.{h,cc}` — Slate-owned URL/config persistence.
- `firmware/main/xiaozhi/protocol/websocket_protocol.cc` — current Slate secret for handshake.
- `firmware/main/xiaozhi/config/settings.cc` — reject stale/foreign protocol configuration.
- `firmware/main/xiaozhi/service/xiaozhi_service.{h,cc}` and `scenes/xiaozhi/xiaozhi_scene.cc` — remove activation state and fallback UI.
- `firmware/test/no_vendor_voice_dependency_test.sh` — production source regression scan.
- `firmware/README.md` — Slate voice bootstrap documentation.

### Deterministic validation

- `bun run --cwd backend test` — PASS; **273 passed, 0 failed**, 849 assertions across 72 files.
- `bun run --cwd shared test` — PASS; **6 passed, 0 failed**, 27 assertions.
- Targeted device/auth/voice tests — PASS; **7 passed, 0 failed**, 11 assertions.
- `bun run format:check` — PASS.
- `bun run lint` — PASS; zero errors/warnings.
- `bun run typecheck` — PASS.
- `bun run --cwd frontend build` — PASS; Vite transformed 2,169 modules.
- `bash firmware/test/no_vendor_voice_dependency_test.sh` — PASS.
- Production firmware source scan for `api.tenclass.net`, `ActivationClient`, `ActivationConfigResult`, `kAwaitingActivation`, and `activation_client` — PASS; no matches under `firmware/main`.
- Firmware scan for Gemini model identifiers/API-key names — PASS; no matches under `firmware/main`.
- `bash firmware/test/run_framebuffer_ops_host_test.sh` — PASS.
- `docker run ... espressif/idf:v5.5.2 idf.py -C firmware build` — PASS; target `esp32s3`, app size `0x262dd0`, 40% app partition free.
- Exact firmware merge command — PASS; merged image size `2,567,632` bytes.
- `git diff --check` — PASS.

### AGY routing review

- Reviewer: `gemini-3.7-flash-high`; effort: high; mode: read-only.
- Verdict: **PASS**. No P0, P1, or P2 findings; no production files were edited by the reviewer.
- Accepted: removal of the vendor activation state and endpoint, narrow Slate-owned config contract, reuse of the existing device secret, stale configuration rejection, and preservation of the existing audio/UI/button path.
- Deferred P3 observations: transient physical activation-code isolation and the already-documented live ADC probe boundary. Neither blocks the routing fix or authorizes a flash.

### Firmware artifacts and rollback

```text
FIRMWARE_SOURCE_SHA=121622c3bd1d23587b4aadb3a079ec85d2052278
ESP_IDF=5.5.2
TARGET=esp32s3
BOOTLOADER_SHA256=fdcbdeeb3ab93e7a58059ce4c18894ec5d3178b445dc4c4a00e05eff6fb54151
PARTITION_TABLE_SHA256=6f0657eb6b8007c0dbfed6f64cf7a0d59f8ee1752af898e2f66dd218846b1835
CUSTOM_FULL_IMAGE_PATH=firmware/build/slate-full.bin
CUSTOM_FULL_IMAGE_SHA256=eba9427558bf08eb387894bbba1feac2da5ec1d0b2ab8c8785285251d65afe33
CUSTOM_APP_IMAGE_PATH=firmware/build/slate-ota.bin
CUSTOM_APP_IMAGE_SHA256=95ddf7e41c3dbb3aafb7d983708ccf39c131d68a89eac7f000c48adb5e99c9d4
OPTIMIZED_OR_REPLACEMENT_FIRMWARE_FLASHED=NO
READY_FOR_SLATE_VOICE_FLASH=true
```

Rollback reference is the accepted Campaign 5 firmware source `bca05819e2cccc5cfdc128d82ffda052b3913412`, with previously accepted full-image SHA-256 `522f189bd36ea9b19cfe6767d70ea00c87c909d7e98ae4c8e1b7015430a1b41c` and app/OTA SHA-256 `e880386b0155780389469c2895177528959a81c46f2fe44b411668ac184062b9`, documented in `05-MVP-PRE-HARDWARE.md`. Do not erase or flash until explicit human authorization.

### Security and remaining boundary

```text
TENCLASS_URL_IN_PRODUCTION_FIRMWARE=NO
VENDOR_ACTIVATION_FLOW_IN_PRODUCTION_FIRMWARE=NO
FIRMWARE_GEMINI_CREDENTIALS=NO
FIRMWARE_GEMINI_MODEL_IDS=NO
SLATE_CONFIG_REQUIRES_DEVICE_SECRET=YES
SLATE_VOICE_WEBSOCKET_REQUIRES_DEVICE_SECRET=YES
OUTLOOK_EXPOSED_TO_GEMINI=NO
CALENDAR_WRITE_WITHOUT_CONFIRM=NO
CAMPAIGN6D_TOUCHED=NO
PR1_TOUCHED=NO
```

The candidate has not been flashed or physically re-tested. The next action is human authorization to flash exactly the artifact/hash above using the existing factory-backup and rollback procedure, followed by physical Slate voice E2E validation. No vendor account or activation code should be entered.

## Campaign 8B — Slate Voice Backend Deployment Checkpoint

Date: 2026-09-02 (Australia/Perth)
Status: BLOCKED_DOCKER_DAEMON_RECOVERY — no firmware flash authorized or performed

### Deployment evidence

- Target: `note4-orangepi` (`192.168.50.108`), deployment directory `/home/pi/slate-note4-deploy`.
- Current production source: `948934c9211709fc2bc29d0a8435181ae1ca2814`.
- Current production image: `slate-note4:campaign5-runtime-fix-948934c`.
- Preserved rollback tag: `slate-note4:rollback-before-campaign8-948934c`.
- Rollback image ID: `sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3`.
- Candidate backend source: `121622c3bd1d23587b4aadb3a079ec85d2052278`.
- Candidate runtime delta is limited to `backend/src/modules/devices/device-firmware.controller.ts`; firmware and production Gemini settings are unchanged.
- Candidate ARM64 image was built locally from the preserved production image: `sha256:f24a88f4b91766eba7d2e3a4843bb99226026e27eabda8460fa65f3e36dcf41f`.
- Candidate image was not loaded or started on Orange Pi. The remote compose file was restored to the known-good image.

### Deterministic and host checks

- Local candidate image architecture: `linux/arm64`; image size `1006537577` bytes.
- Candidate controller hash inside image: `bdac7b3a68f1e0e28100fdb54b9b8f9f37987952ac9146df4281a1583860e6ac`.
- `slate-note4` and `slate-note4-mysql` remain running and healthy.
- Current local `/healthz`: PASS (`{"status":"ok"}`).
- Persistent mounts and production `.env` were not changed; no firmware was flashed.
- Remote root filesystem: `/dev/mmcblk1p1`, 14G total, 14G used, 552M available, 97% used at final check.
- Public Funnel, authenticated device polling, and candidate voice-config endpoint were not revalidated because the candidate was not deployed; no candidate production result is claimed.

### Blocker and required recovery

The Orange Pi Docker daemon retained a stale BuildKit/legacy-builder snapshot after failed disposable candidate-build/load attempts. Remote image/build operations hang before modifying the running containers. Non-interactive sudo is unavailable, so safe daemon recovery requires the operator to run:

```text
ssh note4-orangepi
sudo systemctl restart docker
```

After Docker recovery, re-verify both containers, persistent mounts, the rollback tag, and disk space before deploying the candidate. Do not flash the NOTE4 until the candidate backend endpoint and WebSocket authentication checks pass.

### Current flash boundary

```text
FIRMWARE_SOURCE_SHA=121622c3bd1d23587b4aadb3a079ec85d2052278
CUSTOM_FULL_IMAGE_SHA256=eba9427558bf08eb387894bb1feac2da5ec1d0b2ab8c8785285251d65afe33
CUSTOM_APP_IMAGE_SHA256=95ddf7e41c3dbb3aafb7d983708ccf39c131d68a89eac7f000c48adb5e99c9d4
ROLLBACK_SOURCE_SHA=bca05819e2cccc5cfdc128d82ffda052b3913412
ROLLBACK_FULL_IMAGE_SHA256=522f189bd36ea9b19cfe6767d70ea00c87c909d7e98ae4c8e1b7015430a1b41c
ROLLBACK_APP_IMAGE_SHA256=e880386b0155780389469c2895177528959a81c46f2fe44b411668ac184062b9
FIRMWARE_FLASHED=NO
READY_FOR_SLATE_VOICE_FLASH=NO
NEXT_ACTION=HUMAN_DOCKER_RECOVERY_THEN_RESUME_BACKEND_DEPLOYMENT
```

## Campaign 8C — Candidate Backend Deployment PASS

Date: 2026-09-02 (Australia/Perth)
Status: PASS — backend deployed; stopped at the explicit NOTE4 firmware-flash authorization boundary

### Exact deployed candidate

- Source commit: `121622c3bd1d23587b4aadb3a079ec85d2052278`.
- Deployed tag: `slate-note4:campaign8-voice-routing-121622c`.
- Local authorized image ID: `sha256:f24a88f4b91766eba7d2e3a4843bb99226026e27eabda8460fa65f3e36dcf41f`.
- Orange Pi loaded image ID: `sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d` (`linux/arm64`, `1058736297` bytes). Docker save/load materialized a different local image ID; the deployed controller content was mechanically verified against hash `bdac7b3a68f1e0e28100fdb54b9b8f9f37987952ac9146df4281a1583860e6ac` and the image label revision is the exact source commit above.
- Runtime delta remains limited to `backend/src/modules/devices/device-firmware.controller.ts`; no production Gemini configuration was changed.

### Deployment and service verification

- `slate-note4`: PASS, running candidate tag, Docker health `healthy`.
- `slate-note4-mysql`: PASS, running `mysql:8`, Docker health `healthy`.
- Persistent mounts preserved: `/home/pi/slate-note4-deploy/slate-data -> /data` and `/home/pi/slate-note4-deploy/mysql-data -> /var/lib/mysql`.
- Local `/healthz`: HTTP 200, `{"status":"ok"}`.
- Public `https://orangepi5.tail6aabef.ts.net/healthz`: HTTP 200.
- Public Slate Web UI `/`: HTTP 200, 1451-byte HTML response.
- Tailscale backend: `Running`; Funnel remains `https://orangepi5.tail6aabef.ts.net/` -> `http://127.0.0.1:3001`.
- Root filesystem after deployment: `/dev/mmcblk1p1`, 14,985,895,936 bytes total, 801,562,624 bytes free, 95% used.
- Existing NOTE4 authenticated polling continued after replacement: HTTP 201 at `00:18:55`; group manifest returned HTTP 200 and content requests returned HTTP 200. No pairing reset or identity change occurred.

### Voice route and security verification

- Candidate startup registered `GET /api/v1/devices/current/voice/config`.
- Public unauthenticated GET to that endpoint: HTTP 401, `device authentication failed`.
- Public unauthenticated WebSocket to `/api/v1/voice/websocket`: closed with code 1008, `device authentication failed`.
- Positive authenticated device identity path: PASS through the existing live NOTE4 poll (HTTP 201) and deterministic `DeviceAuthGuard` positive test; the real device secret was not extracted or printed merely to replay the config GET.
- Voice-config response contract: PASS in deterministic controller test; returns only `{ websocket: { path: "/api/v1/voice/websocket", version: 1 } }`.
- Legacy vendor route `/api/v1/xiaozhi/ota/`: HTTP 404.
- Backend source vendor scan: PASS; no Tenclass URL, activation client, or vendor activation route.
- Gemini tool isolation, Outlook read-only boundary, and Calendar Confirm gate: preserved by the full deterministic suite.

### Deterministic validation

- `bun run --cwd backend test`: PASS, 273 tests / 0 failures / 849 assertions.
- `bun run --cwd shared test`: PASS, 6 tests / 0 failures / 27 assertions.
- Targeted controller/auth tests: PASS, 5 tests / 0 failures / 8 assertions.
- `bun run format:check`: PASS.
- `bun run lint`: PASS, zero errors/warnings.
- `bun run typecheck`: PASS.
- `bash firmware/test/no_vendor_voice_dependency_test.sh`: PASS.
- Existing reviewed exact ESP-IDF `5.5.2` / `esp32s3` firmware build and merged artifacts remain unchanged and verified in the preceding Campaign 8A gate.

### Rollback and firmware boundary

```text
CURRENT_DEPLOYED_BACKEND_SOURCE=121622c3bd1d23587b4aadb3a079ec85d2052278
CURRENT_DEPLOYED_BACKEND_IMAGE=slate-note4:campaign8-voice-routing-121622c
CURRENT_DEPLOYED_BACKEND_IMAGE_ID=sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d
ROLLBACK_IMAGE=slate-note4:rollback-before-campaign8-948934c
ROLLBACK_IMAGE_ID=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
FIRMWARE_SOURCE_SHA=121622c3bd1d23587b4aadb3a079ec85d2052278
CUSTOM_FULL_IMAGE_SHA256=eba9427558bf08eb387894bb1feac2da5ec1d0b2ab8c8785285251d65afe33
CUSTOM_APP_IMAGE_SHA256=95ddf7e41c3dbb3aafb7d983708ccf39c131d68a89eac7f000c48adb5e99c9d4
FIRMWARE_FLASHED=NO
READY_FOR_SLATE_VOICE_FLASH=true
NEXT_ACTION=HUMAN_AUTHORIZE_FLASH_THEN_PHYSICAL_SLATE_VOICE_E2E
```

No firmware flash, PR merge, Campaign 6D change, PR #1 change, PR #3 change, billing change, credential change, or production model change was performed.

## Campaign 8D0 — Pre-flash readiness checkpoint

Date: 2026-09-02 (Australia/Perth)
Status: HUMAN_VERTEX_ADC_SETUP_REQUIRED — pre-flash checks passed; firmware was not flashed

### Live backend checks

- Docker Server `29.1.3`, `overlayfs`: PASS.
- `slate-note4` candidate container: `healthy`.
- `slate-note4-mysql`: `healthy`.
- Persistent mounts remained `/home/pi/slate-note4-deploy/slate-data -> /data` and `/home/pi/slate-note4-deploy/mysql-data -> /var/lib/mysql`.
- Public `https://orangepi5.tail6aabef.ts.net/healthz`: HTTP 200.
- Public Slate Web UI `/`: HTTP 200.
- Tailscale backend: `Running`.
- Funnel: `https://orangepi5.tail6aabef.ts.net/` -> `http://127.0.0.1:3001`.
- Latest post-deployment authenticated NOTE4 poll observed: HTTP 201 at `00:18:55`; no new poll was observed during the final 20-minute idle observation window. No pairing reset or identity change was performed.
- Candidate voice-config route remains registered; unauthenticated GET returns HTTP 401.
- Unauthenticated voice WebSocket closes with code 1008, `device authentication failed`.
- Preserved rollback image remains present: `slate-note4:rollback-before-campaign8-948934c`, ID `sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3`.
- Root filesystem: 14,985,895,936 bytes total; 801,316,864 bytes available; 95% used. No broad cleanup was performed.

### Vertex/ADC readiness

The Orange Pi candidate container has `GOOGLE_CLOUD_PROJECT=UNSET`, `GOOGLE_CLOUD_LOCATION=UNSET`, and `GOOGLE_APPLICATION_CREDENTIALS=UNSET`. The host has no `gcloud` executable and no checked ADC file at the standard user locations. No token, credential file, key, or secret was printed or modified. No Gemini Live probe was attempted because approved ADC is unavailable.

`HUMAN_VERTEX_ADC_SETUP_REQUIRED=YES`.

Minimal operator action on the approved workstation/Orange Pi is to install the official Google Cloud CLI if absent, then complete its interactive browser flow:

```text
gcloud auth application-default login
```

The command creates local ADC for client libraries; the operator must configure the approved project/location through the normal deployment process without pasting credentials into chat, Git, logs, or reports. See the [official ADC command reference](https://docs.cloud.google.com/sdk/gcloud/reference/auth/application-default) and [official ADC setup guidance](https://docs.cloud.google.com/docs/authentication/provide-credentials-adc). Do not use a Gemini API key or service-account key file as a workaround.

### 8D0 state boundary

```text
SLATE_VOICE_ROUTING_PHYSICAL=NOT_RUN
TENCLASS_ACTIVATION_PHYSICAL=NOT_RUN
VERTEX_ADC_LIVE=BLOCKED_HUMAN_AUTH
EN_VOICE_E2E=NOT_RUN
JP_VOICE_E2E=NOT_RUN
SEARCH_E2E=NOT_RUN
CALENDAR_PROPOSAL_E2E=NOT_RUN
CALENDAR_CONFIRM_WRITE_E2E=NOT_RUN
FIRMWARE_ROLLBACK_REQUIRED=NO
FIRMWARE_FLASHED=NO
READY_FOR_SLATE_VOICE_FLASH=NO_PENDING_VERTEX_ADC
NEXT_ACTION=HUMAN_COMPLETE_APPROVED_VERTEX_ADC_SETUP_THEN_RESUME_8D0
```

## Campaign 8E0D — NordVPN post-removal verification

Date: 2026-09-02 (Australia/Perth)
Status: PASS_STORAGE_GATE_HUMAN_VERTEX_ADC_SETUP_REMAINS

This checkpoint was verification-only. `apt autoremove` was not run. Slate/MySQL
data was not moved, the NVMe was not changed, and no firmware, production Gemini
setting, credential, or Funnel configuration was changed.

### Verification evidence

```text
NORDVPN_REMOVED=PASS
NORDVPN_SERVICE_ACTIVE=NO
NORDVPN_SERVICE_ENABLED=NO
NORDVPN_PACKAGE_QUERY=NOT_INSTALLED
NORDVPN_COMMAND=ABSENT
NORDVPN_BYTES_RECLAIMED=APPROX_96_0_MB_AS_REPORTED_BY_APT
ROOT_FREE_BYTES=2040111104
ROOT_FILESYSTEM_BYTES=14985895936
ROOT_USED_PERCENT=87%
ORANGEPI_STORAGE_GATE=PASS
SLATE_HEALTH=PASS_HTTP_200_LOCAL
MYSQL_HEALTH=PASS_HEALTHY_CONTAINER
TAILSCALE=PASS_ACTIVE
PUBLIC_HEALTH=PASS_HTTP_200
FUNNEL=PASS_HTTPS_TO_127_0_0_1_3001
NOTE4_POLLING=PASS_HTTP_201_OBSERVED_03_00_01_THROUGH_03_04_20
APT_AUTOREMOVE_EXECUTED=NO
SLATE_DATA_MOVE_EXECUTED=NO
NVME_CHANGED=NO
FIRMWARE_FLASHED=NO
```

The measured root free-space increase from the pre-removal observation was
`96,419,840` bytes, while the human-reported APT reclaim was approximately
96.0 MB; the exact package-removal byte accounting was not claimed beyond that
evidence. The three APT-suggested packages remain installed and were only inspected:

```text
libglapi-mesa 433 KB; reverse dependencies include libglx-mesa0, libgl1-mesa-dri, libegl-mesa0
libllvm19 121821 KB; no installed reverse dependents reported
libxcb-dri2-0 83 KB; reverse dependencies include libegl-mesa0, libglx-mesa0
```

No automatic removal is recommended from this checkpoint. The existing bounded
NVMe recommendation remains unchanged: directory policy, 10 GB Slate cap, and 180 GB
Deluge free-space reserve. No implementation of that policy has occurred.

### Next human boundary

The storage gate now passes, so the next authorized path is the existing human-owned
Google Cloud/Vertex ADC setup. `gcloud` was not installed and no credentials were
read or changed. Resume 8D1 only after the operator chooses the approved project,
confirms billing/API authorization, and completes the official ADC login without
sharing credential material.

```text
READY_FOR_GCLOUD_INSTALL=YES
HUMAN_VERTEX_ADC_SETUP_REQUIRED=YES
NEXT_ACTION=HUMAN_COMPLETE_APPROVED_VERTEX_ADC_SETUP_THEN_RESUME_8D1
```

## Campaign 8E0C — NordVPN removal and bounded NVMe Slate assessment

Date: 2026-09-02 (Australia/Perth)
Status: NVME_ASSESSMENT_COMPLETE_NORDVPN_REMOVAL_BLOCKED_SUDO

This stage performed the authorized ownership check, a no-write NVMe/Deluge/Slate
assessment, and post-check health observation. Slate/MySQL data was not moved. The
NVMe was not repartitioned, formatted, remounted, or otherwise changed. Deluge,
Deluge Web, Tailscale, Funnel, Docker, MySQL, and persistent deployment data were
preserved.

### N0/N1 NordVPN evidence

Ownership is unambiguous: `nordvpnd.service` is supplied by the installed `nordvpn`
package (`4.0.0`, `93,741 KB` installed size). The reverse systemd dependency output
showed only the service/graphical-target relationship; no Slate or Tailscale unit
depends on NordVPN. NordVPN was active and enabled at inspection time, and
`/usr/bin/nordvpn` was present.

The narrow removal could not be executed because passwordless sudo is unavailable:

```text
PASSWORDLESS_SUDO=NO
NORDVPN_REMOVED=BLOCKED
NORDVPN_BYTES_RECLAIMED=0
```

No stop, disable, purge, or residual-file deletion was attempted. The human command
to execute locally on the Orange Pi, if removal is still desired, is:

```bash
sudo systemctl stop nordvpnd.service || true
sudo systemctl disable nordvpnd.service || true
sudo apt-get remove --purge -y nordvpn
```

The dry-run showed only `nordvpn*` would be removed; `apt autoremove` was not run and
no shared networking package was selected. A post-removal health check remains
pending the human sudo action.

### Post-check health before any mutation

```text
SLATE_LOCAL_HEALTH=HTTP_200
SLATE_PUBLIC_HEALTH=HTTP_200
SLATE_CONTAINER=healthy
MYSQL_CONTAINER=healthy
TAILSCALE=RUNNING
FUNNEL=https://orangepi5.tail6aabef.ts.net -> http://127.0.0.1:3001
NOTE4_AUTHENTICATED_POLL=previously healthy; no pairing or backend data changed
ROOT_FREE_BYTES_BEFORE_REMOVAL=1943691264
```

### V0 NVMe and Deluge evidence

```text
NVME_SOURCE=/dev/nvme0n1p1
NVME_PARENT=/dev/nvme0n1
NVME_FILESYSTEM=ext4
NVME_UUID=50ae719d-2641-4ea5-9d72-8795dbfd0ea3
NVME_MOUNT=/mnt/ssd-tmp
NVME_MOUNT_OPTIONS=rw,noatime,nodiratime,stripe=32
NVME_TOTAL_BYTES=250903556096
NVME_USED_BYTES=19356737536
NVME_FREE_BYTES=218727120896
NVME_USE_PERCENT=9%
HDD_ARCHIVE=/mnt/hdd-archive
HDD_ARCHIVE_FREE_BYTES=1695924580352
```

`/etc/fstab` mounts the NVMe and HDD by UUID with `nofail`; no repartition or
filesystem operation was performed. The NVMe is ext4. No quota/project-quota
mount option was present; `xfs_quota` and `zfs` were unavailable. The presence of
the `btrfs` utility does not change the ext4 filesystem type and no btrfs mechanism
was applicable.

Deluge's active configuration was read without printing credentials:

```text
DELUGE_SERVICE_USER=pi
DELUGE_CONFIG=/home/pi/.config/deluge
DELUGE_DOWNLOAD_PATH=/mnt/ssd-tmp/incomplete/
DELUGE_COMPLETED_PATH=/mnt/hdd-archive/Downloads/
DELUGE_TORRENT_FILES_PATH=/home/pi/Downloads
DELUGE_MAX_ACTIVE_DOWNLOADING=10
DELUGE_MAX_ACTIVE_SEEDING=4
DELUGE_MAX_CONNECTIONS_GLOBAL=200
DELUGE_DOWNLOAD_LIMIT=-1
DELUGE_UPLOAD_LIMIT=-1
DELUGE_WEB_PORT=8112
DELUGE_WEB_HTTPS=false
DELUGE_BUFFER_ROLE=CONFIRMED
DELUGE_BUFFER_CURRENT_USAGE_BYTES=20653214069
DELUGE_BUFFER_CURRENT_FILE_COUNT=12
```

The current NVMe footprint is concentrated in the Deluge incomplete buffer:
approximately 20.65 GB across 12 files. No torrent names or private torrent
metadata are included in this report. The top-level `lost+found` directory was
negligible.

### Slate/MySQL sizing evidence

The existing bind mounts remain on the root filesystem:

```text
SLATE_DATA=/home/pi/slate-note4-deploy/slate-data -> /data
SLATE_DATA_FILE_BYTES=0
SLATE_DATA_DIRECTORY_USAGE=116KB
MYSQL_DATA=/home/pi/slate-note4-deploy/mysql-data -> /var/lib/mysql
MYSQL_DATA_DIRECTORY_USAGE=239697920
SLATE_DATA_MOVE_EXECUTED=NO
```

The current data footprint is therefore approximately 229 MiB for MySQL plus
negligible Slate blob data. This does not justify moving Docker's entire data-root,
which remains explicitly out of scope.

### V1/V2 bounded allocation assessment

| Option | Root bytes potentially reclaimed | NVMe footprint | Deluge impact | Rollback/downtime | Assessment |
|---|---:|---:|---|---|---|
| 1. Dedicated `/mnt/ssd-tmp/slate-note4/` with an application cap and free-space guard | ~240 MB currently; more future growth headroom | Bounded, recommended cap 10 GB | Preserve current incomplete path and reserve at least 180 GB free | Planned bind-mount migration; downtime and verified backup required | Preferred future migration if root pressure warrants it |
| 2. Keep Slate/MySQL on root; use NVMe only for backups/staging | 0 MB | None for runtime data | No impact | Simplest; no downtime | Safest current choice because current Slate/MySQL footprint is small |
| 3. Enable filesystem-native quota/subvolume | Potentially similar to option 1 | Bounded if supported | No path change, but requires filesystem/config validation | Remount or service maintenance may be required | Not applicable now: filesystem is ext4 and quota is not enabled |

Recommendation is a future **directory-policy** model, not a partition or Docker
data-root migration:

```text
RECOMMENDED_SLATE_NVME_MODEL=directory_policy
RECOMMENDED_SLATE_NVME_CAP_GB=10
RECOMMENDED_DELUGE_RESERVED_FREE_GB=180
DELUGE_CURRENT_BUFFER_BYTES=20653214069
```

The 10 GB cap is an explicit future policy target derived from the observed
approximately 229 MiB MySQL footprint and negligible Slate blob footprint, with
substantial room for growth. The 180 GB Deluge reserve is well above the current
20.65 GB buffer and leaves a large safety margin on the 218.7 GB currently free
NVMe. These are recommendations only; no directory, quota, bind mount, monitor,
or application policy was created in this stage.

If later authorized, the smallest migration would be a verified MySQL logical
backup, clean service shutdown, migration of only the two Slate bind-mounted data
directories into the bounded Slate directory, bind-mount/config update, restore or
file validation, and rollback-tested restart. Moving only the MySQL directory could
reclaim about 229 MiB but introduces database downtime and recovery risk; option 2
is preferable until root pressure materially increases.

### V3 checkpoint

```text
NORDVPN_REMOVED=BLOCKED
NORDVPN_BYTES_RECLAIMED=0
TAILSCALE_AFTER_NORDVPN=NOT_RUN_REMOVAL_BLOCKED
SLATE_HEALTH_AFTER_NORDVPN=NOT_RUN_REMOVAL_BLOCKED
PUBLIC_HEALTH_AFTER_NORDVPN=NOT_RUN_REMOVAL_BLOCKED
ROOT_FREE_BYTES_AFTER_NORDVPN=NOT_APPLICABLE
NVME_SOURCE=/dev/nvme0n1p1
NVME_FILESYSTEM=ext4
NVME_TOTAL_BYTES=250903556096
NVME_USED_BYTES=19356737536
NVME_FREE_BYTES=218727120896
DELUGE_BUFFER_ROLE=CONFIRMED
DELUGE_BUFFER_CURRENT_USAGE_BYTES=20653214069
RECOMMENDED_SLATE_NVME_MODEL=directory_policy
RECOMMENDED_SLATE_NVME_CAP_GB=10
RECOMMENDED_DELUGE_RESERVED_FREE_GB=180
SLATE_DATA_MOVE_EXECUTED=NO
NVME_REPARTITIONED=NO
DOCKER_DATA_ROOT_MOVED=NO
GEMINI37_REVIEW_CALLS=0
GEMINI37_SHADOW_CALLS=0
FIRMWARE_FLASHED=NO
```

### Human boundary

This stage stops for the sudo action and review. Do not move Slate/MySQL data,
change Deluge paths, enable quotas, move Docker data-root, repartition/format the
NVMe, install gcloud, change production Gemini settings, or flash NOTE4 until a
separate explicit authorization is provided.

## Campaign 8E0B — Orange Pi service/package inventory

Date: 2026-09-02 (Australia/Perth)
Status: INVENTORY_COMPLETE_PENDING_HUMAN_REVIEW

This was a read-only inventory as required by
`08E0B-ORANGEPI-SERVICE-INVENTORY-INSTRUCTIONS.md`. No service, container, image,
package, Snap revision, filesystem, deployment file, secret, Tailscale state, or
persistent data was removed, disabled, stopped, resized, pruned, or otherwise changed.

### Host and storage evidence

```text
HOSTNAME=orangepi5
OS=Armbian 25.5.2 noble / Ubuntu 24.04 LTS
KERNEL=Linux 6.1.115-vendor-rk35xx
ARCHITECTURE=aarch64
ROOT_DEVICE=/dev/mmcblk1p1
ROOT_CAPACITY_BYTES=14985895936
ROOT_USED_BYTES=12842020864
ROOT_FREE_BYTES=1943932928
ROOT_USED_PERCENT=87%
PHYSICAL_SYSTEM_DISK=/dev/mmcblk1 15476981760 bytes (~14.4 GiB)
OTHER_MOUNTS=/mnt/ssd-tmp (238.5G NVMe), /mnt/hdd-archive (9.1T HDD)
SWAP=/dev/zram0 1.8G
PASSWORDLESS_SUDO=NO
```

The root filesystem is the final ext4 partition on the 16 GB-class eMMC/SD device;
the larger NVMe and HDD are separate mounted devices. The non-root `du` inventory
could not read protected directories such as `/var/lib/docker`, the MySQL data
directory, `/var/lib/tailscale`, and private system directories because sudo requires
an interactive password. Docker's own read-only accounting was available.

### Slate, MySQL, Docker, Funnel, and pairing health

```text
SLATE_CONTAINER=slate-note4 / slate-note4:campaign8-voice-routing-121622c / healthy
MYSQL_CONTAINER=slate-note4-mysql / mysql:8 / healthy
SLATE_IMAGE_ID=sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d
ROLLBACK_IMAGE=slate-note4:rollback-before-campaign8-948934c
ROLLBACK_IMAGE_ID=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
MYSQL_IMAGE_ID=sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb
SLATE_DATA=/home/pi/slate-note4-deploy/slate-data -> /data (read-write)
MYSQL_DATA=/home/pi/slate-note4-deploy/mysql-data -> /var/lib/mysql (read-write)
PUBLIC_HEALTH=HTTP_200
PUBLIC_WEB_UI=HTTP_200
TAILSCALE=RUNNING_VERSION_1.102.2
FUNNEL=https://orangepi5.tail6aabef.ts.net -> http://127.0.0.1:3001
NOTE4_AUTHENTICATED_POLL=HTTP_201 observed repeatedly through 02:39:01
```

Docker reported 0 B BuildKit cache, two running containers, the current image, the
preserved rollback image, MySQL, and one untagged 264.3 MB image. The untagged image
is recorded for human review only; it was not removed. The deployment directory
contains `.env` (265 bytes, contents not read), `compose.yml`, and two rollback/reference
compose files.

### Running/enabled service inventory

| Classification | Observed services/components | Evidence and exposure | Recommendation |
|---|---|---|---|
| REQUIRED_SLATE_RUNTIME | `docker.service`, `containerd.service`, healthy Slate and MySQL containers | Slate listens on `0.0.0.0:3001`; MySQL is container-internal | KEEP |
| REQUIRED_OS_NETWORKING | `NetworkManager.service`, `systemd-resolved.service`, `wpa_supplicant.service`, `chrony.service` | Network, DNS, Wi-Fi, and time synchronization | KEEP |
| REQUIRED_TAILSCALE_FUNNEL | `tailscaled.service` | Tailscale node online; Funnel maps public HTTPS to local Slate port | KEEP |
| LIKELY_OS_CORE | `systemd-journald`, `systemd-udevd`, `systemd-logind`, `dbus`, `polkit`, `rsyslog`, `cron`, Armbian hardware/zram/ramlog units, `getty`, `unattended-upgrades`, `apparmor` | OS lifecycle, logging, hardware, security, updates, and console | KEEP |
| OPTIONAL_ADMIN_TOOL | `ssh.service`, `ufw.service`, `vnstat.service`, `rpcbind.service` | SSH administration; firewall/accounting/RPC services; SSH is active but not enabled | CANDIDATE_FOR_HUMAN_REVIEW |
| OPTIONAL_APPLICATION | `deluged.service`, `deluge-web.service`, `smbd.service`, `nmbd.service`, `lightdm.service`, `cups` Snap services, `nordvpnd.service`, Bluetooth/OpenVPN units | Deluge ports 52511/58846/8112; Samba 139/445; VNC 5901; CUPS 631; NordVPN is active | CANDIDATE_FOR_HUMAN_REVIEW |
| UNKNOWN_NEEDS_HUMAN_REVIEW | `samba-ad-dc.service` enabled but not running, `openvpn.service` enabled but not observed running, remaining enabled desktop/peripheral units | Their necessity and ownership were not inferable from a read-only inventory | UNKNOWN_NEEDS_HUMAN_REVIEW |

The complete command output showed 33 running services and 51 enabled service unit
files. No removal recommendation is made automatically. Notable listening sockets
were SSH `22`, Slate `3001`, Tailscale Funnel/node sockets, Deluge `8112`/`58846`,
VNC `5901`, CUPS `631`, Samba `139`/`445`, and RPC bind `111`.

### Snap, Flatpak, package, and filesystem inventory

```text
SNAP=installed; 10 active revisions listed; no disabled revisions observed
FLATPAK=not installed (flatpak command unavailable)
DOCKER_BUILD_CACHE=0B
TOP_LEVEL_DU_NONROOT=/usr 3.2G; /var 2.4G; /home 215M; /boot 169M; total visible 6.0G
VAR_DU_NONROOT=/var/lib 2.3G; /var/cache 117M; /var/log.hdd 42M
USR_DU_NONROOT=/usr/lib 1.9G; /usr/share 421M; /usr/bin 446M
```

Largest installed Debian packages by `Installed-Size` (KB) were:

```text
armbian-firmware 283585
linux-image-vendor-rk35xx 272454
docker.io 127867
libllvm20 135750
libllvm19 121821
snapd 108956
containerd 96398
nordvpn 93741
libwebkitgtk-6.0-4 87196
linux-dtb-vendor-rk35xx 83230
linux-headers-vendor-rk35xx 75046
mesa-vulkan-drivers 71508
tailscale 69288
docker-compose-v2 62101
gcc-13-aarch64-linux-gnu 54363
unicode-data 39485
libicu74 36201
linux-u-boot-orangepi5-vendor 34854
runc 34734
mesa-libgallium 34110
```

These are inventory facts, not authorization to uninstall packages. The largest
visible filesystem consumers are `/var` and `/usr`; protected Docker, database,
Tailscale, and private system subtrees require human-authorized privileged inspection
if finer attribution is needed.

### Review and security status

```text
AGY_REVIEW=NOT_REQUESTED_READ_ONLY_INVENTORY
GROK_REVIEW=NOT_REQUESTED_READ_ONLY_INVENTORY
GEMINI37_REVIEW_CALLS=0
GEMINI37_SHADOW_CALLS=0
LUNA_WORKER=NOT_USED_READ_ONLY_INVENTORY
STATIC_CREDENTIALS_READ_OR_ADDED=NO
PRODUCTION_ENV_READ=NO_CONTENTS_NOT_READ
REMOVALS=NONE
DISABLEMENTS=NONE
PRODUCTION_DEPLOYMENT_CHANGED=NO
FIRMWARE_FLASHED=NO
```

### Human review boundary

The inventory is complete and intentionally stops here. Human review is required
before any optional service, package, untagged image, cache, or filesystem content
is considered for a later action. The running Slate/MySQL deployment, rollback image,
persistent data, Tailscale/Funnel state, SSH configuration, and Snap active revisions
must remain preserved.

```text
ORANGEPI_SERVICE_INVENTORY=COMPLETE
NO_REMOVAL_OR_DISABLE=YES
HUMAN_REVIEW_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_INVENTORY_THEN_AUTHORIZE_ANY_FUTURE_ACTION
```

## Campaign 8E0A — Orange Pi storage expansion diagnosis

Date: 2026-09-02 (Australia/Perth)
Status: AVAILABLE_NEEDS_HUMAN_AUTH — diagnostic only; no resize or partition write performed

### Exact physical layout

- Root source: `/dev/mmcblk1p1`, filesystem `ext4`, mounted read-write with `errors=remount-ro,commit=120`.
- Physical device: `/dev/mmcblk1`, 15,476,981,760 bytes, 30,228,480 sectors, 512-byte sectors.
- Partition table: GPT, first usable LBA 2048, last usable LBA 30,228,446.
- Root partition: start LBA 32,768, end LBA 29,917,183, 29,884,416 sectors, 15,300,820,992 bytes.
- No other partition follows root; `lsblk` reports only `mmcblk1p1` on this device.
- Contiguous GPT-usable space after root: 311,263 sectors, 159,366,656 bytes (~151.98 MiB). The remaining device tail is GPT-reserved space and is not usable partition capacity.
- Root filesystem is clean; `resize2fs -P` succeeded read-only and `resize2fs` is installed.

### Supported expansion path

Armbian’s `/usr/lib/armbian/armbian-resize-filesystem` and its systemd unit are installed. The utility is designed to expand the final partition and then run `resize2fs`; its source confirms that partition expansion uses a delete/recreate operation with the original start sector and may request a reboot. The current layout already appears to retain Armbian’s approximately 1% spare area. Extending into the remaining ~152 MiB would therefore require an explicit root-partition policy/partition-table rewrite and must not be inferred as a harmless online filesystem-only resize.

The exact supported utility to evaluate after separate authorization is:

```text
sudo /usr/lib/armbian/armbian-resize-filesystem start
```

That command was **not executed**. A later authorized operation must first re-check the partition end, confirm the desired target does not shrink the filesystem, preserve the current/rollback deployment and data, and plan any required reboot. No manual `fdisk`, `parted`, `sfdisk`, `resize2fs`, or Armbian resize command was run.

Current official Armbian documentation states that first-boot rootfs expansion grows the root partition to the media maximum subject to its spare-area policy, and documents the resize markers; this device’s installed utility is the local implementation evidence. See [Armbian partitioning and rootfs resize](https://docs.armbian.com/build-framework/user-configurations/).

### D2 preservation checks

- `slate-note4` candidate and `slate-note4-mysql`: healthy.
- Candidate image: present at `sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d`.
- Rollback image: present at `sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3`.
- Local/public `/healthz`: HTTP 200; public Web UI: HTTP 200.
- Tailscale: `Running`; Funnel remains mapped to `http://127.0.0.1:3001`.
- Latest naturally observed authenticated NOTE4 poll: HTTP 201 at `02:28:58`.
- Root free space at final check: 1,944,170,496 bytes; below the 2,000,000,000-byte Google CLI gate by 55,829,504 bytes. The change from the earlier E0 checkpoint is ordinary Docker/storage reclamation; the diagnostic itself performed no write.
- Production environment, persistent data, device identity, firmware, ADC, billing, and model settings were not changed.

### 8E0A boundary

```text
STORAGE_EXPANSION_PATH=AVAILABLE_NEEDS_HUMAN_AUTH
ROOT_DEVICE=/dev/mmcblk1
ROOT_PARTITION=/dev/mmcblk1p1
ROOT_FILESYSTEM=ext4
ROOT_PARTITION_IS_FINAL=YES
UNALLOCATED_USABLE_BYTES_AFTER_ROOT=159366656
RESIZE_EXECUTED=NO
ORANGEPI_STORAGE_GATE=FAIL_BELOW_2GB
READY_FOR_GCLOUD_INSTALL=NO
HUMAN_STORAGE_EXPANSION_REQUIRED=YES
GEMINI37_REVIEW_CALLS=0
GEMINI37_SHADOW_CALLS=0
GEMINI37_BLACKOUT_EXPIRES=2026-09-06T02:00:00+08:00
FIRMWARE_FLASHED=NO
NEXT_ACTION=HUMAN_AUTHORIZE_EXPLICIT_PARTITION_FILESYSTEM_EXPANSION_OR_PROVIDE_LARGER_STORAGE
```

## Campaign 8E0 — Orange Pi storage recovery checkpoint

Date: 2026-09-02 (Australia/Perth)
Status: HUMAN_STORAGE_EXPANSION_REQUIRED — safe cleanup exhausted; Google Cloud CLI installation not started

The newest 8E worker policy was followed. Codex remained controller and production writer. No Luna worker was needed for this bounded storage audit; no Gemini 3.7 Flash review/shadow call, Claude fallback, or Grok review was made.

### S0 audit

- Root filesystem before cleanup: `/dev/mmcblk1p1`, 14,985,895,936 bytes total, 798,515,200 bytes free, 95% used.
- Running required containers: `slate-note4` candidate and `slate-note4-mysql`; both healthy.
- Required current/rollback images were retained.
- Docker build cache: 0 bytes.
- Deployment archives under `/home/pi`, `/tmp`, and `/var/tmp`: none found.
- Journal usage: 16.9 MB.
- APT archive cache: 24 KB; the broader `/var/cache/apt` was 108 MB but contained no material package archive payload.
- One created staging container and two untagged failed-build layers were verified as disposable; no volumes were attached.

### S1/S2 exact cleanup

Removed only individually verified unreferenced objects:

- Container `2d8f657a886d086343f1d3463e435971ddb35d1de9a505923a2362a09b6d0204` (`slate-note4-campaign8-staging`, created/stopped, no mounts).
- Untagged image `sha256:9ee149710e71898cad37e65fad9d6a230980d5b6978f63059c72d89182699db6` (no tags, no container references).
- Untagged image `sha256:dfdd39f6c343d3c5b4706c4f1feea3e07f9309c0ae6c94595e1a60fe6cf7cb52` (no tags, no container references).
- Historical unreferenced image `slate-note4:campaign5-bca0581` (`sha256:52ee3c48f993e7e562665d79f8b0de495a22d2dc49ebc69a9a0fd7a3eb564398`), distinct from the preserved rollback image.
- Unreferenced image `oven/bun:1-slim` (`sha256:e0ee68d16ccb9927bf02aa7dd8fd4bf3369ee6d46da04faa72b05ce8bfd135f6`).

`sudo -n apt-get clean` was attempted but not run because sudo requires the operator password; the package archive payload was only 24 KB. No Docker broad prune, volume removal, system-file deletion, Snap change, journal vacuum, or unknown-file deletion was performed.

### S3 post-cleanup verification

- Root filesystem after cleanup: 14,985,895,936 bytes total, 1,697,796,096 bytes free, 89% used.
- Required gate: **FAIL**; free space is 302,203,904 bytes below the 2,000,000,000-byte minimum.
- `slate-note4:campaign8-voice-routing-121622c`: present, running, healthy.
- `slate-note4:rollback-before-campaign8-948934c`: present at `sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3`.
- `slate-note4-mysql`: running, healthy.
- Persistent mounts unchanged: Slate data -> `/data`; MySQL data -> `/var/lib/mysql`.
- Local and public `/healthz`: HTTP 200.
- Public Web UI: HTTP 200.
- Tailscale: `Running`; Funnel remains `https://orangepi5.tail6aabef.ts.net/` -> `http://127.0.0.1:3001`.
- NOTE4 authenticated polling: PASS; latest observed post-cleanup poll HTTP 201 at `02:16:41`.
- Production `.env`, Gemini settings, OAuth state, device pairing/server address/secret, firmware artifacts, and rollback evidence were not changed.

### 8E0 boundary

```text
ORANGEPI_STORAGE_GATE=FAIL_BELOW_2GB
READY_FOR_GCLOUD_INSTALL=NO
HUMAN_STORAGE_EXPANSION_REQUIRED=YES
FREE_SPACE_BYTES=1697796096
MINIMUM_FREE_SPACE_BYTES=2000000000
FREE_SPACE_DEFICIT_BYTES=302203904
GEMINI37_REVIEW_CALLS=0
GEMINI37_SHADOW_CALLS=0
GEMINI37_BLACKOUT_EXPIRES=2026-09-06T02:00:00+08:00
LUNA_WORKER=NOT_USED_TARGETED_STORAGE_AUDIT
FIRMWARE_FLASHED=NO
NEXT_ACTION=HUMAN_PROVIDE_STORAGE_EXPANSION_OR_APPROVED_SAFE_SPACE_THEN_RESUME_8E0
```

Do not install Google Cloud CLI or begin interactive ADC setup until at least 2.0 GB free space is available. Do not delete current/rollback images, MySQL/Slate data, Tailscale state, production environment, or unknown filesystem data to bridge the deficit.

## Campaign 8D1 — Vertex/ADC human setup boundary

Date: 2026-09-02 (Australia/Perth)
Status: BLOCKED_HUMAN_GOOGLE_CLOUD_SETUP — no firmware write

The 8D1 directive and the Claude Sonnet 5 worker policy were fetched and read. No Claude worker was needed for this human-owned setup gate. Codex performed only non-secret checks.

### Current verification

- Orange Pi: `aarch64`, Armbian `25.5.2 noble`.
- Slate candidate container: `healthy`; MySQL: `healthy`.
- Public `/healthz`: HTTP 200; public Web UI: HTTP 200.
- Candidate voice-config unauthenticated request: HTTP 401.
- Production backend image, persistent data, Tailscale/Funnel state, and production Gemini settings were not changed.
- Root filesystem: 14,985,895,936 bytes total, 800,813,056 bytes available, 95% used. No package installation or cleanup was attempted.

ADC remains unavailable:

```text
GOOGLE_CLOUD_PROJECT=UNSET
GOOGLE_CLOUD_LOCATION=UNSET
GOOGLE_APPLICATION_CREDENTIALS=UNSET
GCLOUD=UNAVAILABLE
ADC_FILE=ABSENT
VERTEX_ADC_AUTH=NOT_RUN_PENDING_HUMAN
VERTEX_API_ENABLED=NOT_VERIFIED
BILLING_PROJECT_READY=NOT_VERIFIED
PRODUCTION_VERTEX_ENV=HUMAN_AUTH_REQUIRED
VERTEX_LIVE_PROBE=NOT_RUN_PENDING_ENV
READY_FOR_SLATE_VOICE_FLASH=false
FIRMWARE_FLASHED=NO
```

### Human-owned next action

The operator must choose the long-term Google account and one Google Cloud project, confirm billing is enabled, enable `aiplatform.googleapis.com`, and install the official Google Cloud CLI if needed. On the approved Orange Pi account or workstation, complete:

```text
gcloud init
gcloud auth application-default login
```

If Google requests it, set the quota project with `gcloud auth application-default set-quota-project <PROJECT_ID>`. Do not create a service-account key file, API key, or paste any credential material into chat, Git, logs, or reports. After this interactive setup is complete, resume 8D1 for non-secret ADC/API/billing verification. Firmware remains unflashed.

## Campaign 8D0 Recheck — worker-policy continuation

Date: 2026-09-02 (Australia/Perth)
Status: HUMAN_VERTEX_ADC_SETUP_REQUIRED — repeated pre-flash check; no firmware write

This recheck was performed after fetching origin and reading `08D-CLAUDE-SONNET5-WORKER-POLICY.md`. No implementation worker was useful for this read-only readiness gate, so no Claude request was dispatched; Codex retained controller and production-write authority. No source, backend image, Gemini setting, credential, or physical device state was changed.

- Orange Pi Docker Server `29.1.3`; `slate-note4` and `slate-note4-mysql` remained healthy.
- Candidate image remained deployed; preserved rollback image remained present.
- Local and public `/healthz`: HTTP 200; public Web UI: HTTP 200.
- Tailscale remained `Running`; Funnel remained mapped to `http://127.0.0.1:3001`.
- Root filesystem: 14,985,895,936 bytes total, 801,296,384 bytes available, 95% used.
- Public unauthenticated voice-config: HTTP 401.
- Public unauthenticated voice WebSocket: close 1008, `device authentication failed`.
- Legacy `/api/v1/xiaozhi/ota/`: HTTP 404.
- Last recorded post-deployment authenticated NOTE4 poll remains HTTP 201 at `00:18:55`; no new poll appeared in the later 30-minute log window. This does not invalidate the previously verified pairing, but no newer poll is claimed.

ADC remains unavailable without exposing credential material:

```text
GOOGLE_CLOUD_PROJECT=UNSET
GOOGLE_CLOUD_LOCATION=UNSET
GOOGLE_APPLICATION_CREDENTIALS=UNSET
GCLOUD=UNAVAILABLE
ADC_FILE=ABSENT
VERTEX_ADC_LIVE=BLOCKED_HUMAN_AUTH
HUMAN_VERTEX_ADC_SETUP_REQUIRED=YES
FIRMWARE_FLASHED=NO
READY_FOR_SLATE_VOICE_FLASH=NO_PENDING_VERTEX_ADC
NEXT_ACTION=HUMAN_COMPLETE_APPROVED_VERTEX_ADC_SETUP_THEN_RESUME_8D0
```
