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

## Campaign 8D1B — O4/O5 Gemini Developer API OAuth verification

Date: 2026-09-02 (Australia/Perth)
Status: HUMAN_OAUTH_SCOPE_OR_LIVE_PATH_REVIEW_REQUIRED — billing and Vertex remained disabled; no production change and no firmware flash

The operator completed the O3 browser consent and ADC was saved on the Orange Pi.
O4 non-secret verification and the authorized model-catalogue checks completed.
O5 reached a Google authorization boundary while attempting the bounded synthetic
Live probe. No NOTE4 audio, calendar data, Outlook data, names, search requests,
tool calls, or generated audio were sent or retained.

### O4 evidence

```text
GCLOUD=/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud
GCLOUD_VERSION=583.0.0
PROJECT=slate-note4
ACTIVE_GCLOUD_ACCOUNT=streetjk@gmail.com
ADC_TOKEN_PROBE=PASS
ADC_FILE_METADATA=pi:pi mode_600 size_361_bytes
ADC_TOKENINFO=PASS
ADC_SCOPES_EXPECTED_PRESENT=YES
ADC_SCOPE_COUNT=2
GENERATIVE_LANGUAGE_API=ENABLED
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
```

The ADC scope names were checked without printing any token or credential file:
`cloud-platform` and `generative-language.retriever`. The ADC access token itself
was never printed, persisted by this probe, or placed in the repository.

OAuth model listing was performed in memory over the official Generative Language
REST API with the access token and quota-project header; response bodies were not
written to disk:

```text
V1_OAUTH=PASS
V1_MODEL_COUNT=19
V1_GEMINI31_LIVE=ABSENT
V1BETA_OAUTH=PASS
V1BETA_MODEL_COUNT=52
V1BETA_GEMINI31_LIVE=PRESENT
V1BETA_GEMINI31_LIVE_METHOD=bidiGenerateContent
```

This version difference is material: the exact `gemini-3.1-flash-live-preview`
resource is visible in `v1beta` and advertises `bidiGenerateContent`, but is not
present in the stable `v1` catalogue. This is model visibility evidence only, not
proof of a successful Live session or free-tier quota.

### O5 bounded Live probe evidence

The disposable official `google-genai` Python package (`2.21.0`) was installed in
`/mnt/ssd-tmp/slate-tools/gemini-oauth/probe-venv`; no system package or Slate
production dependency was changed. The SDK default constructor rejected the
Developer API path without an API key. Supplying the ADC credential explicitly
with `vertexai=False` produced the same no-API-key requirement, so no API key was
provided and no Vertex client was used.

A raw WebSocket attempt using the ADC bearer token was rejected by the Live
service (`ConnectionClosedError`). The official documented OAuth-compatible Live
route requires an ephemeral token for the constrained endpoint. A single-use,
short-lived synthetic-token request was then attempted using the same ADC OAuth
credential, with model/configuration constraints and no user data. Google
returned:

```text
EPHEMERAL_TOKEN_OAUTH=FAIL_HTTP 403
ERROR_STATUS=PERMISSION_DENIED
ERROR_REASON=ACCESS_TOKEN_SCOPE_INSUFFICIENT
```

Therefore:

```text
GEMINI31_LIVE_MODEL_VISIBLE=YES_V1BETA_ONLY
GEMINI31_LIVE_OAUTH=UNPROVEN_SCOPE_LIMITATION
GEMINI31_LIVE_FREE_TIER=NOT_PROVEN
EPHEMERAL_TOKEN_CREATED=NO
SYNTHETIC_LIVE_SESSION=NOT_ESTABLISHED
GOOGLE_SEARCH_LIVE_PROBE=NOT_RUN
CALENDAR_LIVE_PROBE=NOT_RUN
```

The exact current official references used for this decision are:

- [Google OAuth quickstart](https://ai.google.dev/gemini-api/docs/oauth) — ADC and Generative Language API OAuth setup.
- [Live WebSocket reference](https://ai.google.dev/api/live) — Live endpoint, OAuth-compatible ephemeral-token route, and `bidiGenerateContent`.
- [Live ephemeral tokens](https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens) — short-lived constrained-token flow.
- [Python Gen AI SDK](https://googleapis.github.io/python-genai/) — current SDK authentication behavior.

### Safety and non-mutation evidence

```text
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
PRODUCTION_RESTARTED_FOR_GEMINI=NO
NOTE4_PRIVATE_DATA_SENT_TO_FREE_TIER=NO
OUTLOOK_DATA_SENT_TO_GEMINI=NO
BILLING_CHANGED=NO
VERTEX_API_ENABLED=NO
VERTEX_MODEL_CALLS=0
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
APT_AUTOREMOVE_EXECUTED=NO
NVME_DATA_MIGRATION=NO
```

### Human boundary and next action

The next action requires human Google-authentication/product-policy review:
determine whether an additional officially supported OAuth scope or another
approved OAuth/ADC Live provisioning path may be consented to, while keeping
billing off and `aiplatform.googleapis.com` disabled. Do not re-authenticate,
enable billing/API, create an API key, call Vertex, send private NOTE4 data, or
change production settings until that decision is made.

```text
READY_FOR_GEMINI31_LIVE_FREE_TIER=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_ADDITIONAL_OAUTH_SCOPE_OR_APPROVED_LIVE_PROVISIONING_PATH
```

### Final stage verdict

NOT READY — Developer API OAuth model visibility is proven, but Live OAuth
transport authorization and free-tier acceptance remain unproven.

## Campaign 8D1C — Gemini 3.1 Live OAuth path reconciliation

Date: 2026-09-02 (Australia/Perth)
Starting checkpoint: `40b30b180265414bb8954f0cad79f404f762d082`
Ending checkpoint: `dc71a68` plus this report/state commit
Status: NOT_VIABLE_OAUTH_ONLY_LIVE_CURRENT_GOOGLE_SURFACE

The directive was fetched from origin and executed without product, production,
firmware, billing, or Vertex changes. The existing ADC was verified non-secretly;
the credential contents and tokens were never printed, copied, or committed.

### R0 machine-state evidence

```text
GCLOUD=/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud
GCLOUD_VERSION=583.0.0
PROJECT=slate-note4
ADC_TOKEN_PROBE=PASS
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
SLATE_HEALTH=PASS_HTTP_200
MYSQL_HEALTH=PASS_HEALTHY
TAILSCALE=Running
FUNNEL=ACTIVE
PUBLIC_HEALTH=PASS_HTTP_200
PUBLIC_WEB_UI=PASS_HTTP_200
NOTE4_POLLING=PASS; 11 HTTP-201 log matches in the last 10 minutes
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
```

### R1 authoritative metadata reconciliation

The public Generative Language discovery documents were retrieved for `v1`,
`v1beta`, and `v1alpha`. All exposed `auth_tokens.create` as
`POST v1beta/auth_tokens` but did not advertise method-specific OAuth scopes;
the discovery root advertised only `https://www.googleapis.com/auth/devstorage.read_only`.
The WebSocket `BidiGenerateContent` methods are not represented in that REST
discovery document. No authoritative current metadata supported adding a new
scope to the existing ADC consent, so no re-consent was attempted.

The current official OAuth guide documents ADC and bearer-authenticated REST model
listing with the already-consented `cloud-platform` and
`generative-language.retriever` scopes. The current official Live server SDK guide
initializes Developer API Live with an API key; the Live overview describes
server-to-server and client-to-server separately and recommends ephemeral tokens
for the latter. The WebSocket reference documents the constrained endpoint with
an ephemeral token, not a normal ADC bearer token.

### R2/R3 probe classification

```text
GEMINI31_LIVE_MODEL_VISIBLE=YES_V1BETA_ONLY
V1_MODEL_COUNT=19
V1BETA_MODEL_COUNT=52
V1BETA_GEMINI31_LIVE_METHOD=bidiGenerateContent
SERVER_TO_SERVER_OAUTH_PATH=NOT_DOCUMENTED_FOR_DEVELOPER_API_WEBSOCKET
SERVER_TO_SERVER_OAUTH_PROBE=FAIL_CONNECTION_CLOSED
EPHEMERAL_TOKEN_OAUTH_PATH=DOCUMENTED_CONSTRAINED_LIVE_ROUTE
EPHEMERAL_TOKEN_OAUTH_PROBE=FAIL_HTTP_403_ACCESS_TOKEN_SCOPE_INSUFFICIENT
FREE_TIER_ACCEPTANCE=NOT_PROVEN
SDK_LIMITATION=PYTHON_2.21.0_DEVELOPER_CLIENT_REQUIRES_API_KEY; ADC_CREDENTIALS_BRANCH_IS_VERTEX
API_AUTH_LIMITATION=OAUTH_MODEL_LISTING_WORKS_BUT_LIVE_AUTHORIZATION_NOT_ESTABLISHED
```

The one corrected non-private server-to-server attempt used the official
`v1beta` WebSocket service name, an in-memory ADC bearer token, the
`x-goog-user-project` header, the exact model resource, and a synthetic text
prompt. The connection closed before a Live session was established. The
ephemeral-token attempt used a single-use short-lived constrained request and
returned `PERMISSION_DENIED / ACCESS_TOKEN_SCOPE_INSUFFICIENT`. No API key or
Vertex endpoint was used.

### R4/R5 decision

No current official source or discovery metadata identified a specific additional
OAuth scope that could be safely requested. The current official Developer API
Live server guide requires an API key in its runnable path, while the approved ADC
path has proven REST model listing but not Live authorization. Under the hard
policy, the project must not guess a scope, add a static key, enable billing, or
enable Vertex merely to continue the probe.

```text
GEMINI31_DEVELOPER_API_OAUTH_LIVE=NOT_CURRENTLY_SUPPORTED_FOR_REQUIRED_PATH
FREE_TIER_LIVE_OAUTH=NOT_VIABLE_UNDER_CURRENT_POLICY
READY_FOR_GEMINI_RUNTIME_DEPLOY=NO
```

### Safety and scope

```text
GEMINI_API_KEY_USED=NO
GOOGLE_API_KEY_USED=NO
VERTEX_API_ENABLEMENT=NO
BILLING_ATTACHMENT=NO
PRODUCTION_GEMINI_CONFIG_CHANGE=NO
PRODUCTION_RESTART_FOR_GEMINI=NO
PRIVATE_NOTE4_DATA_TO_PROBE=NO
OUTLOOK_DATA_TO_GEMINI=NO
CALENDAR_WRITE=NO
APT_AUTOREMOVE=NO
NVME_DATA_MIGRATION=NO
```

### Final stage verdict

NOT_VIABLE_OAUTH_ONLY_LIVE_CURRENT_GOOGLE_SURFACE. The existing Slate Vertex/ADC
runtime remains unchanged and no production migration is authorized. Future work
requires a new, explicitly approved Google authentication/product-policy decision;
it must not begin by creating an API key or enabling billing/Vertex.

## Campaign 8D1D — Gemini 3.1 Live API-key free-tier probe

Date: 2026-09-02 (Australia/Perth)
Starting checkpoint: `ad31e548010ddeeeff3b8121bb12b365aa8b988b`
Status: PASS_GEMINI31_LIVE_API_KEY_FREE_TIER_OBSERVED — bounded probe only; no production migration

This stage followed the explicit temporary exception in
`08D1D-GEMINI31-LIVE-API-KEY-FREE-TIER-PROBE.md`. The key was read from the
protected Orange Pi file into process memory only. It was not printed, passed as
a process argument, exported into a shell environment, written to a temporary
file, included in an error dump, committed, or placed in a report/PR comment.

### D0/D1 safety evidence

```text
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
API_KEY_FILE_PRESENT=YES
API_KEY_FILE_OWNER=pi:pi
API_KEY_FILE_MODE=600
API_KEY_FILE_NONZERO=YES; metadata size 53 bytes
API_KEY_DIRECTORY_MODE=700
GENERATIVE_LANGUAGE_API=ENABLED
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
SLATE_HEALTH=PASS_HTTP_200
MYSQL_HEALTH=PASS_HEALTHY
TAILSCALE=Running
FUNNEL=ACTIVE
PUBLIC_HEALTH=PASS_HTTP_200
PUBLIC_WEB_UI=PASS_HTTP_200
NOTE4_POLLING=PASS; 12 HTTP-201 log matches in the final 10-minute check
```

### D2 official model/auth evidence

The current official model page still identifies the exact target
`gemini-3.1-flash-live-preview` as a preview audio-to-audio model with Live API,
audio generation, function calling, and Search grounding support. The current
official server SDK guide shows Developer API Live initialization with an API
key and the same exact model. References:

- [Gemini 3.1 Flash Live model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview)
- [Gemini Live SDK server guide](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk)

### D3/D4 bounded probe evidence

Exactly two Developer API calls were permitted and made: one minimal model
metadata authentication check and one Live session. The key was loaded from the
protected file in memory and supplied directly to the disposable official
`google-genai` Python client; no Slate production dependency or setting changed.
The Live input was the synthetic text `Say exactly TEST.`. Search grounding,
function calling, Calendar data, Outlook data, NOTE4 data, and audio input were
not used. Generated audio was not retained.

```text
GOOGLE_GENAI_PYTHON_SDK=2.21.0_DISPOSABLE_VENV
API_KEY_AUTH=PASS
GEMINI31_LIVE_MODEL_VISIBLE=PASS
GEMINI31_LIVE_SESSION=CONNECTED
GEMINI31_LIVE_RESPONSE_EVENT=PASS
GEMINI31_LIVE_TURN_COMPLETE=PASS
```

### D5 classification

The project/key accepted the single synthetic Live session while billing was
unattached at probe time. This is an observation of current free-tier acceptance,
not a guarantee of future quota or authorization, and it does not authorize use
of the key in Slate production.

```text
GEMINI31_LIVE_API_KEY=PASS
GEMINI31_LIVE_SESSION=PASS
GEMINI31_LIVE_FREE_TIER=PROVEN_FOR_THIS_PROJECT_AT_PROBE_TIME
BILLING_CHANGED=NO
VERTEX_API_ENABLED=NO
READY_FOR_PRODUCTION_API_KEY_MIGRATION=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_SECURE_PRODUCTION_KEY_INTEGRATION_AND_DATA_POLICY
```

### D6 security and regression evidence

Post-probe checks confirmed the protected key metadata remained unchanged; Slate,
MySQL, Tailscale/Funnel, public health, Web UI, ADC, billing, Vertex state, and
NOTE4 polling remained healthy. No production restart, runtime model change,
firmware flash, PR merge, or credential rotation occurred.

```text
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
PRODUCTION_RESTARTED_FOR_GEMINI=NO
PRIVATE_NOTE4_DATA_SENT=NO
OUTLOOK_DATA_SENT=NO
CALENDAR_DATA_SENT=NO
SEARCH_GROUNDING_USED=NO
TOOL_CALLS_USED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
CREDENTIAL_EXPOSURE_HARD_STOP=NO
```

### Final stage verdict

PASS_GEMINI31_LIVE_API_KEY_FREE_TIER_OBSERVED. Stop at the production boundary:
do not move the key, alter production Gemini settings, deploy, flash, or merge
until a human explicitly reviews secure production key integration and data policy.

## Campaign 8D1A — gcloud absolute-path Vertex ADC readiness recheck

Date: 2026-09-02 (Australia/Perth)
Status: HUMAN_API_ENABLEMENT_AND_BILLING_DECISION_REQUIRED

The readiness matrix was executed read-only as user `pi` with the absolute binary
`/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud`. No re-authentication, API
enablement, billing change, IAM change, model call, production configuration change,
firmware flash, or NVMe/data operation was performed.

### Readiness evidence

```text
GCLOUD_ABSOLUTE_PATH=PASS
GCLOUD=PASS
GCLOUD_VERSION=583.0.0
GOOGLE_CLOUD_PROJECT=slate-note4
ACTIVE_GCLOUD_ACCOUNT=streetjk@gmail.com
ADC=PASS
ADC_QUOTA_PROJECT=slate-note4_HUMAN_CONFIRMED
ADC_FILE_METADATA=pi:pi mode_600 size_354_bytes
VERTEX_API_ENABLED=NO
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_IAM=SUFFICIENT_roles/owner
ROOT_FREE_BYTES=2159788032
NVME_FREE_BYTES=228056555520
SLATE_HEALTH=PASS_HTTP_200_LOCAL
MYSQL_HEALTH=PASS_HEALTHY_CONTAINER
TAILSCALE=PASS_ACTIVE_ENABLED
PUBLIC_HEALTH=PASS_HTTP_200
FUNNEL=PASS_HTTPS_TO_127_0_0_1_3001
NOTE4_POLLING=PASS_HTTP_201_OBSERVED_06_24_39
VERTEX_MODEL_CALLS=0
BILLING_CHANGED=NO
API_ENABLEMENT_CHANGED=NO
IAM_CHANGED=NO
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
FIRMWARE_FLASHED=NO
NVME_CHANGED=NO
APT_AUTOREMOVE_EXECUTED=NO
```

The enabled-service listing contained no `aiplatform.googleapis.com` match, so the
Vertex AI API is recorded as disabled. The read-only billing query returned
`billingEnabled: false` and an empty `billingAccountName`. The IAM query returned
`roles/owner` for the active account. The API `services describe` subcommand was
not available in this gcloud version; the enabled-service name query was used as
the non-mutating API-state evidence.

### Decision gate and human boundary

```text
VERTEX_READINESS=READY_FOR_API_ENABLEMENT_DECISION
STATUS=HUMAN_API_ENABLEMENT_AND_BILLING_DECISION_REQUIRED
READY_FOR_BOUNDED_VERTEX_PROBE=NO
```

The project and ADC are ready for a separately authorized human decision, but this
checkpoint does not authorize enabling `aiplatform.googleapis.com`, attaching billing,
or making a Vertex/Gemini request. No Gemini 3.7 review/shadow call was made.

## Campaign 8E0F — libllvm19 post-removal verification

Date: 2026-09-02 (Australia/Perth)
Status: PASS_STORAGE_GATE_HUMAN_VERTEX_ADC_SETUP_REMAINS

This was a verification-only checkpoint. No `apt autoremove` was run, no NVMe
operation was performed, Slate/MySQL data was not moved, and no production,
firmware, credential, or Gemini setting was changed.

### Verification evidence

```text
LIBLLVM19_REMOVED=PASS
LIBLLVM19_PACKAGE=NOT_INSTALLED
LIBLLVM20=INSTALLED
LIBLLVM20_VERSION=1:20.1.2-0ubuntu1~24.04.2
LIBLLVM20_INSTALLED_SIZE_KB=135750
ROOT_FREE_BYTES=2164400128
ROOT_TOTAL_BYTES=14985895936
ROOT_USED_PERCENT=86%
ORANGEPI_STORAGE_GATE=PASS
NVME_MOVE_REQUIRED_FOR_IMMEDIATE_GCLOUD=NO
SLATE_HEALTH=PASS_HTTP_200_LOCAL
MYSQL_HEALTH=PASS_HEALTHY_CONTAINER
TAILSCALE=PASS_ACTIVE_ENABLED
PUBLIC_HEALTH=PASS_HTTP_200
FUNNEL=PASS_HTTPS_TO_127_0_0_1_3001
NOTE4_POLLING=PASS_HTTP_201_OBSERVED_03_21_15_THROUGH_03_23_28
APT_AUTOREMOVE_EXECUTED=NO
SLATE_DATA_MOVE_EXECUTED=NO
NVME_CHANGED=NO_BY_THIS_STAGE
FIRMWARE_FLASHED=NO
```

The measured root headroom above the 2,000,000,000-byte gate is 164,400,128
bytes. Slate and MySQL containers remained healthy. The protected packages
`mesa-vulkan-drivers`, `mesa-libgallium`, `tigervnc-standalone-server`,
`libwebkitgtk-6.0-4`, `ffmpeg`, and `xserver-xorg-core` all remained installed,
so no graphics/desktop/WebKit/FFmpeg collateral removal was observed.

Tailscale remained active and enabled, and Funnel continued to map
`https://orangepi5.tail6aabef.ts.net` to `http://127.0.0.1:3001`. Deluge and
Deluge Web remained active. The NVMe was only observed read-only at
`/dev/nvme0n1p1`, ext4, with `228558487552` bytes available; the utilization
difference from earlier observations is not attributed to this verification
stage and no NVMe command changed it. Deluge paths remained
`/mnt/ssd-tmp/incomplete/` and `/mnt/hdd-archive/Downloads/`.

The APT orphan suggestions `libglapi-mesa` and `libxcb-dri2-0` were not removed
or otherwise changed. OpenVPN remains `KEEP_UNCERTAIN` from 8E0E.

### Human boundary

The storage gate now passes and immediate NVMe migration is not required for the
Google CLI gate. This does not authorize gcloud installation or Vertex setup;
the next action remains the separate human-owned Google Cloud project, billing,
API enablement, and ADC login boundary. No Gemini 3.7 review/shadow call was made
for this read-only verification.

```text
LIBLLVM19_REMOVAL=PASS
ORANGEPI_STORAGE_GATE=PASS
READY_FOR_GCLOUD_INSTALL=YES
HUMAN_VERTEX_ADC_SETUP_REQUIRED=YES
NEXT_ACTION=HUMAN_COMPLETE_APPROVED_VERTEX_ADC_SETUP_THEN_RESUME_8D1
```

## Campaign 8D1 — Vertex ADC readiness check

Date: 2026-09-02 (Australia/Perth)
Status: BLOCKED_GCLOUD_UNAVAILABLE

This was a read-only readiness check. No API was enabled, billing was changed,
IAM was changed, model call was made, credential content was read, production
environment was changed, firmware was flashed, or NVMe/Slate/MySQL data was moved.

### gcloud/ADC evidence

The `gcloud` executable was not found in the non-interactive SSH PATH, login-shell
PATH, or the checked standard install locations. The ADC file was present at the
default location, but its contents were not read and no token was printed.

```text
GCLOUD=FAIL
GCLOUD_VERSION=UNAVAILABLE_COMMAND_NOT_FOUND
GOOGLE_CLOUD_PROJECT=UNKNOWN_NOT_VERIFIABLE_WITHOUT_GCLOUD
ACTIVE_GCLOUD_ACCOUNT=UNKNOWN
ADC=FAIL_TOKEN_PROBE_NOT_RUN_GCLOUD_UNAVAILABLE
ADC_QUOTA_PROJECT=UNKNOWN
VERTEX_API_ENABLED=UNKNOWN
BILLING_ENABLED=UNKNOWN
BILLING_ACCOUNT_ATTACHED=UNKNOWN
VERTEX_IAM=UNKNOWN
ADC_FILE=PRESENT_CONTENTS_NOT_READ
VERTEX_MODEL_CALLS=0
BILLING_CHANGED=NO
API_ENABLEMENT_CHANGED=NO
IAM_CHANGED=NO
```

No gcloud installation or configuration was attempted. No browser login, token,
credential JSON, project secret, or authorization material was requested or exposed.

### Orange Pi health evidence

```text
ROOT_FREE_BYTES=2161053696
NVME_FREE_BYTES=228058820608
SLATE_HEALTH=PASS_HTTP_200_LOCAL
MYSQL_HEALTH=PASS_HEALTHY_CONTAINER
TAILSCALE=PASS_ACTIVE_ENABLED
PUBLIC_HEALTH=PASS_HTTP_200
FUNNEL=PASS_HTTPS_TO_127_0_0_1_3001
NOTE4_POLLING=PASS_HTTP_201_OBSERVED_05_29_11_THROUGH_05_31_24
DELUGE=PASS_ACTIVE
NVME_CHANGED=NO
APT_AUTOREMOVE_EXECUTED=NO
SLATE_DATA_MOVE_EXECUTED=NO
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
FIRMWARE_FLASHED=NO
```

### Decision gate

```text
VERTEX_READINESS=BLOCKED_GCLOUD_UNAVAILABLE
READY_FOR_BOUNDED_VERTEX_PROBE=NO
NEXT_ACTION=HUMAN_RESTORE_OFFICIAL_GCLOUD_COMMAND_PATH_THEN_RESUME_READINESS_CHECK
```

The next human action is to restore or verify the official Google Cloud CLI on the
Orange Pi (without sharing credentials), then rerun this read-only check. Do not
enable `aiplatform.googleapis.com`, change billing/IAM, or make a Vertex model call
until the readiness gate returns a valid project, ADC probe, billing, and IAM result.

## Campaign 8D1 — Vertex ADC readiness recheck

Date: 2026-09-02 (Australia/Perth)
Status: BLOCKED_GCLOUD_UNAVAILABLE_RECHECK

The 8D1 read-only matrix was rerun after fetching origin. `gcloud` remains
unavailable to the Orange Pi SSH user, so no ADC token probe, project/account
verification, API-state query, billing query, or IAM query was attempted through
that CLI. No Vertex/Gemini model call was made.

```text
CAMPAIGN=8D1
GCLOUD=FAIL
GCLOUD_VERSION=UNAVAILABLE_COMMAND_NOT_FOUND
GOOGLE_CLOUD_PROJECT=UNKNOWN_NOT_VERIFIABLE_WITHOUT_GCLOUD
ACTIVE_GCLOUD_ACCOUNT=UNKNOWN
ADC=FAIL_TOKEN_PROBE_NOT_RUN_GCLOUD_UNAVAILABLE
ADC_QUOTA_PROJECT=UNKNOWN
VERTEX_API_ENABLED=UNKNOWN
BILLING_ENABLED=UNKNOWN
BILLING_ACCOUNT_ATTACHED=UNKNOWN
VERTEX_IAM=UNKNOWN
ROOT_FREE_BYTES=2160336896
NVME_FREE_BYTES=228057837568
SLATE_HEALTH=PASS_HTTP_200_LOCAL
MYSQL_HEALTH=PASS_HEALTHY_CONTAINER
TAILSCALE=PASS_ACTIVE_ENABLED
PUBLIC_HEALTH=PASS_HTTP_200
FUNNEL=PASS_HTTPS_TO_127_0_0_1_3001
NOTE4_POLLING=PASS_HTTP_201_OBSERVED_05_58_04_THROUGH_06_00_23
VERTEX_MODEL_CALLS=0
BILLING_CHANGED=NO
API_ENABLEMENT_CHANGED=NO
IAM_CHANGED=NO
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
FIRMWARE_FLASHED=NO
NVME_CHANGED=NO
APT_AUTOREMOVE_EXECUTED=NO
VERTEX_READINESS=BLOCKED_GCLOUD_UNAVAILABLE
```

The next action remains human restoration/verification of the official gcloud
command path, followed by another read-only readiness check. Do not enable billing
or APIs, configure IAM, make a Vertex call, install packages, or alter NVMe/data.

## Campaign 8D1B — Gemini 3.1 Flash Live OAuth / free-tier setup

Date: 2026-09-02 (Australia/Perth)
Status: HUMAN_OAUTH_DESKTOP_CLIENT_REQUIRED

O0 completed with the absolute gcloud installation. O1 enabled only the authorized
Google Generative Language API. O2 created the private OAuth-client directory and
reached the required human Google Console boundary. No Vertex API, billing, model,
production, firmware, or Slate/MySQL data operation was performed.

### O0/O1 evidence

```text
GCLOUD=/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud
GCLOUD_VERSION=583.0.0
PROJECT=slate-note4
ACTIVE_GCLOUD_ACCOUNT=streetjk@gmail.com
ADC_EXISTING=PASS
ADC_TOKEN_PROBE=ADC_OK
ADC_FILE_METADATA=pi:pi mode_600 size_354_bytes
GENERATIVE_LANGUAGE_API=ENABLED
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
SLATE_HEALTH=PASS_HTTP_200
MYSQL_HEALTH=PASS_HEALTHY_CONTAINER
TAILSCALE=PASS
FUNNEL=PASS
NOTE4_POLLING=PASS_HTTP_201
ROOT_FREE_BYTES=3742515200
NVME_FREE_BYTES=216502263808
```

The Generative Language API enable operation completed successfully and the
read-only enabled-service query returned `generativelanguage.googleapis.com`.
The read-only Vertex query returned no `aiplatform.googleapis.com` match. Billing
returned `billingEnabled: false` with no billing account name. No other API was
intentionally enabled, and no Vertex/Gemini model request was made.

### O2 human OAuth boundary

```text
OAUTH_DESKTOP_CLIENT=HUMAN_REQUIRED
CLIENT_SECRET_PATH=/mnt/ssd-tmp/slate-tools/gemini-oauth/client_secret.json
CLIENT_SECRET_JSON=ABSENT
OAUTH_CLIENT_DIRECTORY=CREATED_MODE_700
GEMINI_ADC=PENDING_HUMAN
GENERATIVE_LANGUAGE_REST_OAUTH=NOT_RUN
GEMINI31_LIVE_MODEL_VISIBLE=NOT_RUN
GEMINI31_LIVE_OAUTH=NOT_RUN
GEMINI31_LIVE_FREE_TIER=NOT_PROVEN
```

## Campaign 8D1B — O3 Gemini-scoped ADC browser-consent boundary

Date: 2026-09-02 (Australia/Perth)
Status: HUMAN_BROWSER_OAUTH_CONSENT_REQUIRED

The Desktop OAuth client is now present at the required private path. Metadata was
verified only; the JSON contents were not read or printed. O0/O1 safety conditions
remain intact: billing is off and Vertex API is disabled.

```text
OAUTH_DESKTOP_CLIENT=READY
CLIENT_SECRET_PATH=/mnt/ssd-tmp/slate-tools/gemini-oauth/client_secret.json
CLIENT_SECRET_METADATA=pi:pi mode_600 size_348_bytes
OAUTH_CLIENT_DIRECTORY=pi:pi mode_700
GEMINI_ADC=PENDING_HUMAN
GENERATIVE_LANGUAGE_API=ENABLED
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
ROOT_FREE_BYTES=3742515200
NVME_FREE_BYTES=216502263808
SLATE_HEALTH=PASS
MYSQL_HEALTH=PASS
TAILSCALE=PASS
FUNNEL=PASS
NOTE4_POLLING=PASS_HTTP_201
GEMINI31_LIVE_MODEL_VISIBLE=NOT_RUN
GEMINI31_LIVE_OAUTH=NOT_RUN
GEMINI31_LIVE_FREE_TIER=NOT_PROVEN
GENERATIVE_LANGUAGE_REST_OAUTH=NOT_RUN
VERTEX_MODEL_CALLS=0
BILLING_CHANGED=NO
API_ENABLEMENT_CHANGED=YES_GENERATIVE_LANGUAGE_ONLY
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
APT_AUTOREMOVE_EXECUTED=NO
NVME_DATA_MIGRATION=NO
```

### O3 human action

On the Orange Pi terminal, the operator must run the official no-browser ADC login
and complete the browser consent on a trusted device. The verification result must
remain in the Orange Pi terminal; do not paste URLs, codes, client JSON, or tokens
into chat, Git, reports, or logs.

```bash
GCLOUD=/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud

"$GCLOUD" auth application-default login \
  --no-browser \
  --client-id-file=/mnt/ssd-tmp/slate-tools/gemini-oauth/client_secret.json \
  --scopes='https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/generative-language.retriever'
```

After successful consent, resume O4 for non-secret ADC/REST/model-visibility
verification. Do not run a Live probe yet and do not enable billing or Vertex.

The required client JSON is absent. The operator must create a Desktop OAuth client
for project `slate-note4` in Google Auth Platform, add the operator as a test user
if required, download the JSON, and transfer it directly to the exact path above.
Do not paste the JSON, client secret, authorization URL, verification code, or
tokens into chat, Git, or reports. After transfer, set mode 600 in the Orange Pi
terminal and return for the O3 browser-consent boundary. No OAuth client material
was read or added to the repository.

### Safety and scope

```text
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
PRODUCTION_RESTARTED_FOR_GEMINI=NO
NOTE4_PRIVATE_DATA_SENT_TO_FREE_TIER=NO
GOOGLE_SEARCH_LIVE_PROBE=NOT_RUN
CALENDAR_LIVE_PROBE=NOT_RUN
OUTLOOK_DATA_SENT_TO_GEMINI=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
APT_AUTOREMOVE_EXECUTED=NO
NVME_DATA_MIGRATION=NO
NVME_CHANGE=EMPTY_OAUTH_DIRECTORY_ONLY
GEMINI37_REVIEW_CALLS=0
GEMINI37_SHADOW_CALLS=0
NEXT_ACTION=HUMAN_PROVIDE_DESKTOP_OAUTH_CLIENT_JSON_THEN_RESUME_8D1B_O3
```

## Campaign 8E0E — OpenVPN and LLVM audit / conditional removal

Date: 2026-09-02 (Australia/Perth)
Status: AUDIT_COMPLETE_LIBLLVM19_SAFE_PENDING_SUDO_OPENVPN_KEPT

This stage was limited to the OpenVPN/LLVM audit and conditional package-removal
decision. No NVMe operation, Slate/MySQL data move, Docker data-root change, service
disablement, firmware flash, gcloud installation, or production configuration change
was performed.

### A0 baseline

```text
ROOT_FREE_BYTES=2039873536
ROOT_TOTAL_BYTES=14985895936
SLATE_CONTAINER=healthy
MYSQL_CONTAINER=healthy
SLATE_LOCAL_HEALTH=HTTP_200
SLATE_PUBLIC_HEALTH=HTTP_200
TAILSCALE=active
FUNNEL=active_https_to_127_0_0_1_3001
NOTE4_POLLING=HTTP_201 observed at 03:11:09, 03:12:20, and 03:13:23
NVME_CHANGED=NO
```

### A1 OpenVPN audit

OpenVPN ownership and usage evidence:

```text
OPENVPN_PACKAGE=openvpn 2.6.14-0ubuntu0.24.04.1 / 1844 KB
NETWORK_MANAGER_OPENVPN=installed 1.10.2-4build2 / 320 KB
OPENVPN_SERVICE=active exited target; enabled
OPENVPN_CLIENT_SERVER_UNITS=none active or loaded
OPENVPN_PROCESSES=none
OPENVPN_PROFILES=/etc/openvpn/update-resolv-conf only (package helper; no user profile)
NETWORK_MANAGER_VPN_CONNECTIONS=none reported
OPENVPN_SOCKETS=none
SLATE_OR_TAILSCALE_DEPENDENCY=none observed
```

The strict standalone removal simulation was:

```text
apt-get -s remove --purge openvpn
would remove: network-manager-openvpn*, openvpn*
```

Because the simulation selects the additional installed `network-manager-openvpn`
package, the exact 8E0E safe-removal gate does not pass for standalone OpenVPN.
OpenVPN is therefore retained rather than broadening the removal scope:

```text
OPENVPN=KEEP_UNCERTAIN
OPENVPN_REMOVED=NO
```

No OpenVPN or NetworkManager package was changed. No `apt autoremove` was run.

### A2 LLVM audit

`libllvm19` and `libllvm20` were evaluated independently. Both are marked automatic,
but only `libllvm19` is orphaned under the strict simulation:

```text
LIBLLVM19=SAFE_TO_REMOVE
LIBLLVM19_INSTALLED_SIZE_KB=121821
LIBLLVM19_REVERSE_DEPENDENTS=none reported
LIBLLVM19_REMOVE_SIMULATION=only libllvm19
LIBLLVM19_ACTIVE_PROCESS_MAPPING=none observed
LIBLLVM19_DIRECT_INSTALLED_DEPENDENTS=none reported

LIBLLVM20=KEEP_REQUIRED
LIBLLVM20_INSTALLED_SIZE_KB=135750
LIBLLVM20_REVERSE_DEPENDENTS=mesa-vulkan-drivers, mesa-libgallium
LIBLLVM20_REMOVE_SIMULATION=removes Mesa, X/desktop/VNC, WebKit, FFmpeg and other installed packages
LIBLLVM20_ACTIVE_PROCESS_MAPPING=none observed, but dependency gate fails
LIBLLVM20_DIRECT_INSTALLED_DEPENDENTS=mesa-libgallium, mesa-vulkan-drivers
```

`apt-get -s autoremove` proposed `libglapi-mesa`, `libllvm19`, and
`libxcb-dri2-0`; that broader operation was not executed. `libglapi-mesa` and
`libxcb-dri2-0` were not independently authorized targets in this stage and remain
installed. `libllvm20` was not removed because its simulation would damage protected
graphics/desktop dependencies.

`libllvm19` passes the narrow removal gate, but `sudo -n true` is unavailable. The
minimal human command is:

```bash
sudo apt-get remove --purge -y libllvm19
```

It must be followed by a fresh health check; do not append `apt autoremove`.
Until that human sudo action occurs:

```text
LIBLLVM19_REMOVAL_EXECUTED=NO_SUDO_REQUIRED
LIBLLVM20_REMOVED=NO
```

### A3/A4 checkpoint

```text
OPENVPN=KEEP_UNCERTAIN
LIBLLVM19=SAFE_TO_REMOVE
LIBLLVM20=KEEP_REQUIRED
ROOT_FREE_BYTES=2039873536
SLATE_HEALTH=PASS
MYSQL_HEALTH=PASS
TAILSCALE=PASS
FUNNEL=PASS
NOTE4_POLLING=PASS
NVME_CHANGED=NO
SLATE_DATA_MOVE_EXECUTED=NO
DOCKER_DATA_ROOT_MOVED=NO
APT_AUTOREMOVE_EXECUTED=NO
FIRMWARE_FLASHED=NO
```

The root storage gate remains above 2 GB but with limited headroom. After the
separate `libllvm19` human action and recheck, reassess whether the remaining headroom
is sufficient. Do not begin NVMe migration automatically from this stage; preserve
the existing bounded directory-policy recommendation if future growth requires it.

### Human boundary

This audit stops for the minimal `libllvm19` sudo action and review. OpenVPN remains
installed because its standalone removal simulation failed the strict gate. No NVMe,
Slate/MySQL data, Deluge paths, Tailscale state, or protected graphics packages were
changed.

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

## Campaign 8D1E — Gemini 3.1 Live secure backend integration

Date: 2026-09-02 (Australia/Perth)
Status: IMPLEMENTED_AND_DETERMINISTICALLY_VALIDATED — blocked at the required
independent GLM 5.3 Flash review boundary; no production deployment or setting
change was performed.

### E0/E1 reconciliation

- The branch was fetched and fast-forwarded from `6d30656` to the latest
  directive-only remote head `dc3d70e` before implementation.
- PR #2 remains open, draft, unmerged, and based on
  `integration/note4-custom`.
- Campaign 8D1D remains the latest prior accepted proof: one bounded
  `gemini-3.1-flash-live-preview` API-key Live session succeeded with billing
  unattached; this report does not claim that OAuth/ADC Live is supported.
- Existing architecture was preserved: `GeminiConfig` selects runtime
  authentication, `GeminiAssistantService` and `GeminiLiveService` remain the
  only Gemini service callers, `XiaozhiVoiceGateway` remains the authenticated
  device bridge, and the existing tool, Calendar confirmation, Outlook
  isolation, audio codec, reconnect, and cleanup paths were not replaced.

### E2 current official documentation

The current official pages were checked on 2026-09-02:

- [Gemini 3.1 Flash Live Preview model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview)
  identifies the exact model ID `gemini-3.1-flash-live-preview`, Live API,
  audio generation, Search grounding, and function calling; it also documents
  synchronous-only function calling and current Live event semantics.
- [Live API server SDK guide](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk)
  documents server WebSocket sessions, 16 kHz PCM input, 24 kHz audio output,
  transcription events, and function-call responses. Its JavaScript example
  uses a runtime API-key client.
- [OAuth quickstart](https://ai.google.dev/gemini-api/docs/oauth) documents
  OAuth/ADC setup and REST model-list access. The prior project probes found
  OAuth model visibility but insufficient authorization for the required Live
  transport, so this implementation keeps Vertex ADC as the default and adds
  Developer API mode only as an explicit, human-gated alternative.

### E3 implementation

Implementation source commit: `0899d295fa4d35e3922dad9bac2c6e1b21431e19`

The backend now supports:

- `GEMINI_AUTH_MODE=vertex_adc` (default), preserving the existing
  `GOOGLE_CLOUD_PROJECT`/`GOOGLE_CLOUD_LOCATION` client construction.
- Explicit `GEMINI_AUTH_MODE=developer_api_key`, which accepts only a
  `GEMINI_API_KEY_FILE` runtime file reference. The credential value is read
  inside the backend factory and passed to the Google SDK only in process
  memory; it is never part of configuration objects, client responses,
  firmware, image build input, logs, tests, or reports.
- A narrow `GeminiClientOptions` union that does not permit callers to pass a
  raw API-key value directly to the factory.
- Fail-closed handling for missing, empty, whitespace-only, directory, and
  unreadable runtime credential sources with generic non-secret errors.
- Generic Gemini request/Live error logging without provider error-message
  contents, preserving existing user-safe error contracts.
- Placeholder-only `.env.example` documentation for runtime secret mounting;
  no production environment, image, or secret was changed.

### Files changed

- `.env.example`, `backend/.env.example` — placeholder runtime auth-mode and
  secret-file configuration only.
- `backend/src/infra/config/env.schema.ts` and its test — explicit auth-mode
  schema/defaults and file-reference validation.
- `backend/src/modules/assistant/gemini.client.ts` — runtime credential-file
  loader and narrow client factory.
- `backend/src/modules/assistant/gemini.config.ts` — mode selection,
  configuration diagnostics, and provider-specific client options.
- `backend/src/modules/assistant/gemini-live.service.ts` and
  `gemini-assistant.service.ts` — use the selected factory path and redact
  provider error contents.
- Corresponding service tests plus
  `gemini.client.test.ts` and `gemini.config.test.ts` — mode, lifecycle,
  credential, and fail-closed coverage.

### Deterministic validation

All commands ran against source commit `0899d295fa4d35e3922dad9bac2c6e1b21431e19`:

```text
bun run --cwd backend test
PASS — 286 tests across 74 files; 0 failed; 879 expect() calls

bun run --cwd shared test
PASS — 6 tests; 0 failed; 27 expect() calls

bun run lint
PASS — frontend and backend ESLint, 0 warnings

bun run typecheck
PASS — frontend and backend TypeScript checks

bun run format:check
PASS — all checked files formatted

bun run --cwd frontend build
PASS — Vite production build

git diff --check
PASS
```

Tests specifically cover default Vertex/ADC preservation, explicit Developer
API mode selection, exact file-reference passing, valid synthetic loading,
missing/empty/whitespace/unreadable sources, non-secret errors, Live model and
session mapping, audio/tool lifecycle, Calendar proposal-only behavior,
Outlook isolation, and unauthenticated device-voice rejection.

### E7 bounded adapter probe

The deterministic adapter construction tests passed using synthetic
credentials. One non-production attempt was made using the protected runtime
credential through a read-only mount and synthetic text only. The Orange Pi
host has no Bun/node runtime; the preserved production image lacks the SDK
dependency, and the disposable official Bun dependency setup stalled with no
active temporary process. It was stopped; the disposable checkout, temporary
script, and temporary image were removed. No production container, environment,
persistent data, key, or model setting changed.

```text
GEMINI31_LIVE_ADAPTER_SYNTHETIC_PROBE=NOT_RUN_SAFE_RUNTIME_UNAVAILABLE
PROTECTED_CREDENTIAL_VALUE_PRINTED=NO
PRIVATE_NOTE4_DATA_SENT=NO
PRODUCTION_DEPLOYED=NO
```

### E8 independent review gate

The current user-selected reviewer is GLM 5.3 Flash. No exact authenticated
GLM 5.3 Flash reviewer transport is available in this environment. The local
`glm` helper identifies itself as GLM 5.2 through an NVIDIA NIM API-key
transport, so it was not invoked as a model or authentication substitute.
The bounded Sonnet 4.6 worker attempt was read-only, did not inspect
credentials, made no file changes, and returned no result before it was
stopped; it is not treated as an independent review.

```text
INDEPENDENT_REVIEWER=GLM_5_3_FLASH
REVIEW_TRANSPORT=NOT_AVAILABLE_EXACT_MODEL
GLM53_REVIEW=BLOCKED_EXTERNAL_REVIEW
GEMINI37_REVIEW_CALLS=0
GEMINI37_SHADOW_CALLS=0
```

There are no accepted or rejected reviewer findings because the required
independent review did not run. Luna/Codex self-review is not an independent
gate.

### E9 security and deployment boundary

```text
CAMPAIGN=8D1E
STATUS=IMPLEMENTED_TESTED_BLOCKED_EXTERNAL_REVIEW
START_SHA=dc3d70e29e2cf8dbcd0fe3434889959e3f2da224
IMPLEMENTATION_SHA=0899d295fa4d35e3922dad9bac2c6e1b21431e19
DEVELOPER_API_BACKEND_AUTH_MODE_IMPLEMENTED=YES
CREDENTIAL_SOURCE=RUNTIME_SECRET_BACKEND_ONLY
CREDENTIAL_COMMITTED=NO
CREDENTIAL_LOGGED=NO
CREDENTIAL_IN_IMAGE=NO
CREDENTIAL_TO_NOTE4=NO
PRODUCTION_DEFAULT_CHANGED=NO
PRODUCTION_DEPLOYED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
OUTLOOK_DATA_SENT_TO_GEMINI=NO
CALENDAR_WRITE=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
SECRET_SCAN=PASS_NO_CREDENTIAL_MATERIAL_IN_CHANGED_FILES
READY_FOR_PRODUCTION_DEPLOYMENT_REVIEW=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=PROVIDE_OR_ENABLE_EXACT_AUTHENTICATED_GLM_5_3_FLASH_REVIEWER_THEN_RESUME_8D1E
```

Rollback is the preceding backend/image path with the default
`GEMINI_AUTH_MODE=vertex_adc` and existing `GEMINI_LIVE_MODEL`; no production
rollback action was needed because deployment was not attempted. Production
use of the Developer API mode remains separately gated on human acceptance of
the current Gemini data-use/privacy policy and explicit authorization to
mount the protected runtime credential and select the exact Gemini 3.1 Live
model.

## Campaign 8D1E — final GLM review and bounded adapter checkpoint

Date: 2026-09-02 (Australia/Perth)
Status: REVIEW_PASS_ADAPTER_PROBE_FAILED — stopped at the non-production
runtime diagnostic boundary. Production deployment, firmware flash, billing,
Vertex enablement, and PR merge were not performed.

### Review and implementation lineage

The exact final implementation reviewed was `4bfce037b2d206dbabca9ab905301c088a0c1f01`.
The complete bounded correction lineage is preserved:

```text
START_SHA=dc3d70e29e2cf8dbcd0fe3434889959e3f2da224
ORIGINAL_IMPLEMENTATION_SHA=0899d295fa4d35e3922dad9bac2c6e1b21431e19
CORRECTION_SHA_1=3c8df44d358bafa71fc92b485b1d195c1dc6ac86
CORRECTION_SHA_2=1b0956af66e4324123d4948e16a04eb1bd8ee712
CORRECTION_SHA_3=4bfce037b2d206dbabca9ab905301c088a0c1f01
```

The exact configured independent reviewer was invoked read-only and
ephemerally through the protected runtime ZAI credential path. No credential
value was printed or sent in the review prompt.

```text
REVIEWER=GLM_5_3_FLASH
PROVIDER=ZAI
PROFILE=zai-glm53-reviewer
MODEL=glm-5.3-flash
REASONING_EFFORT=high
SANDBOX=read-only
TARGET_SHA=4bfce037b2d206dbabca9ab905301c088a0c1f01
TRACKED_FILES_CHANGED=NO
VERDICT=PASS
P0_FINDINGS=0
P1_FINDINGS=0
P2_FINDINGS=0
P3_FINDINGS=4
```

GLM found no credential leakage, unintended production mutation, production
default change, Outlook exposure, Calendar confirmation bypass, or lifecycle
security failure. Luna adjudicated the four non-blocking observations as:

- Calendar OAuth failure after ticket consumption not directly tested:
  `DEFER_NONBLOCKING`; insertion follows atomic consumption, so a failed write
  burns the ticket safely.
- Runtime-file validation has an ordinary check/use race:
  `DEFER_NONBLOCKING`; the protected runtime mount and fail-closed read are
  sufficient for this bounded evaluation.
- Provider `onerror` does not itself force reconnect/close:
  `DEFER_NONBLOCKING`; reconnect policy is separate reliability work.
- Report/state referenced the original implementation SHA:
  `ACCEPT`; this checkpoint records the final corrective SHA.

No P0/P1/P2 finding remained unresolved. The review did not edit, commit, push,
or access production.

### Deterministic validation

All commands passed against `4bfce037...`:

```text
bun run --cwd backend test
PASS — 297 tests across 74 files; 0 failed; 906 expect() calls
bun run --cwd shared test
PASS — 6 tests; 0 failed; 27 expect() calls
bun run lint
PASS — frontend and backend ESLint; 0 warnings
bun run typecheck
PASS — frontend and backend TypeScript checks
bun run format:check
PASS — all checked files formatted
bun run --cwd frontend build
PASS — Vite production build
git diff --check
PASS
```

### E7 one-shot synthetic adapter verification

One bounded attempt ran after deterministic validation and the GLM PASS. A
disposable ARM64 container executed the actual 8D1E `GeminiConfig`,
`createGeminiClient`, `GeminiLiveService`, and tool configuration bundled from
the exact implementation SHA. The protected credential was mounted read-only
at runtime only. Input was synthetic text `Say exactly TEST.`; no NOTE4,
Outlook, Calendar, Search, or real audio data was sent, and generated audio was
not retained. No production entrypoint, migration, container, or environment
was used or changed.

```text
GEMINI31_LIVE_ADAPTER_SYNTHETIC_PROBE=FAIL_GEMINI_LIVE_CONNECTION_FAILED
PROBE_RUNTIME=DISPOSABLE_ARM64_CONTAINER
PROBE_MODEL=gemini-3.1-flash-live-preview
PROBE_INPUT=SYNTHETIC_ONLY
PROBE_TURN_COMPLETE=NO
PROBE_MODEL_CONTENT=NO
PROTECTED_CREDENTIAL_VALUE_PRINTED=NO
PROTECTED_CREDENTIAL_LOGGED=NO
PRIVATE_NOTE4_DATA_SENT=NO
OUTLOOK_DATA_SENT_TO_GEMINI=NO
PRODUCTION_CONTAINER_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
```

The adapter returned its generic connection-failure outcome before a
turn-complete/model-content event. This does not prove model or free-tier
unavailability. E7 is one-shot, so no second provider call is authorized in
this stage.

### Post-probe invariants and final checkpoint

```text
PRODUCTION_IMAGE=sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d
KNOWN_GOOD_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
SLATE_CONTAINER=healthy
MYSQL_CONTAINER=healthy
PROTECTED_KEY_METADATA_UNCHANGED=YES
DISPOSABLE_ARTIFACTS_REMOVED=YES
CAMPAIGN=8D1E
STATUS=REVIEW_PASS_ADAPTER_PROBE_FAILED
END_SHA=4bfce037b2d206dbabca9ab905301c088a0c1f01
CONTROLLER=LUNA
WORKER=SONNET_4_6
REVIEWER=GLM_5_3_FLASH
DEVELOPER_API_BACKEND_AUTH_MODE_IMPLEMENTED=YES
CREDENTIAL_SOURCE=RUNTIME_SECRET_BACKEND_ONLY
CREDENTIAL_COMMITTED=NO
CREDENTIAL_LOGGED=NO
CREDENTIAL_IN_IMAGE=NO
CREDENTIAL_TO_NOTE4=NO
PRODUCTION_DEFAULT_CHANGED=NO
PRODUCTION_DEPLOYED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
PRIVATE_NOTE4_DATA_SENT=NO
OUTLOOK_DATA_SENT_TO_GEMINI=NO
CALENDAR_WRITE=NO
BACKEND_TESTS=297_PASS
SHARED_TESTS=6_PASS
FORMAT=PASS
LINT=PASS
TYPECHECK=PASS
FRONTEND_BUILD=PASS
SECRET_SCAN=PASS_NO_CREDENTIAL_MATERIAL_IN_CHANGED_FILES
GLM53_FLASH_REVIEW=PASS
GLM53_P0=0
GLM53_P1=0
GLM53_P2=0
GLM53_P3=4_DEFERRED_OR_ACCEPTED
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_PRODUCTION_DEPLOYMENT_REVIEW=NO
READY_FOR_HUMAN_PRODUCTION_API_KEY_AND_DATA_POLICY_DECISION=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_GENERIC_ADAPTER_FAILURE_AND_AUTHORIZE_ANY_FURTHER_NONPRODUCTION_DIAGNOSTICS
```

The production boundary remains closed. No deployment, Gemini model switch,
billing/API change, firmware flash, or PR merge is authorized by this
checkpoint.

## Campaign 8D1F–8D1H — Overnight Gemini Live Diagnostic Checkpoint

Date: 2026-09-02 (Australia/Perth)

```text
CAMPAIGN=8D1F_8D1H_OVERNIGHT
STATUS=DIAG_BUN_MINIMAL_TIMEOUT_NO_SANITIZED_RESULT
START_SHA=b46b6da9134ba385d20ad11698e0e33c6e53420b
END_SHA=dca351adab6d16b26ee0532a3e09258ed5d89d50
FINAL_IMPLEMENTATION_SHA=4bfce037b2d206dbabca9ab905301c088a0c1f01
CONTROLLER=LUNA
WORKER=SONNET_4_6
REVIEWER=GLM_5_3_FLASH
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_EFFORT=high
REVIEW_SANDBOX=read-only
PROVIDER_LIVE_CALLS_USED=2_OF_6
REST_METADATA_CALLS_USED=0
NODE_MINIMAL=PASS_MODEL_EVENT_AND_TURN_COMPLETE
PYTHON_CONTROL=NOT_RUN_NEW_CALL
BUN_MINIMAL=TIMEOUT_NO_SANITIZED_RESULT
SLATE_CLIENT_FACTORY_MINIMAL=NOT_RUN
SLATE_REDUCED_SERVICE=NOT_RUN
SLATE_FULL_ADAPTER=NOT_RUN
ROOT_CAUSE_CLASS=BUN_RUNTIME_OR_DISPOSABLE_BUN_LAUNCH_PATH_INCOMPATIBILITY_NOT_ISOLATED
SOURCE_CORRECTION_MADE=NO
8D1G_STARTED=NO
8D1H_RESULT=FAILURE_CHECKPOINT_ONLY
```

### Diagnostic method and evidence

The exact reviewed implementation remained unchanged at
`4bfce037b2d206dbabca9ab905301c088a0c1f01`. The diagnostic used synthetic
input only and a read-only mount of the protected runtime credential. No
credential value, token, private NOTE4 data, Outlook data, or Calendar data
was emitted, logged, committed, or sent to the device.

The static differential found `@google/genai` `2.20.0`, Node >=20 as the
documented Node requirement, and the Slate Developer API model
`gemini-3.1-flash-live-preview`. The SDK’s Node path uses its Node WebSocket
transport; the Bun run used the same official SDK implementation through an
explicit Node entry path because Bun support is not documented. The two
bounded provider calls produced:

```text
CALL_1_NODE_MINIMAL=PASS
CALL_1_MODEL=gemini-3.1-flash-live-preview
CALL_1_MODEL_EVENT=YES
CALL_1_TURN_COMPLETE=YES
CALL_1_PROCESS_RC=0

CALL_2_BUN_MINIMAL=TIMEOUT_NO_SANITIZED_RESULT
CALL_2_MODEL=gemini-3.1-flash-live-preview
CALL_2_MODEL_EVENT=NOT_OBSERVED
CALL_2_TURN_COMPLETE=NOT_OBSERVED
```

The Bun result does not isolate a source defect or prove provider rejection.
Per the overnight directive, no blind retry and no Slate-specific client,
reduced-service, or full-adapter call was made after the prerequisite Bun
control failed. Therefore 8D1G was not justified and 8D1H could not be an
exact-adapter pass.

### Deterministic validation and review

No production source was changed during this diagnostic. The previously
reviewed source remains covered by the following unchanged gates:

```text
backend tests: 297 passed
shared tests: 6 passed
backend/frontend lint: PASS
backend/frontend typecheck: PASS
format check: PASS
frontend production build: PASS
diff check: PASS
secret scan: PASS; no credential material in changed files
```

The exact configured `glm-5.3-flash` / ZAI read-only high-effort review of
`4bfce037` is retained because no implementation source changed. Its verdict
was `PASS`, with zero P0/P1/P2 findings. Four P3 observations were adjudicated
by Luna as deferred or accepted: direct OAuth-failure-after-ticket coverage,
a runtime file check/use race, provider-error reconnect behavior, and the
then-stale report SHA.

### Safety and cleanup evidence

```text
SLATE_CONTAINER=healthy
MYSQL_CONTAINER=healthy
PRODUCTION_IMAGE_ID=sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d
ROLLBACK_IMAGE_ID=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
ROOT_FREE_BYTES=3732217856
TAILSCALE_BACKEND_STATE=Running
FUNNEL=ON
PUBLIC_HEALTH_HTTP=200
PUBLIC_WEB_UI_HTTP=200
DISPOSABLE_HARNESS_FILES_REMOVED=YES
NODE_IMAGE_REMOVED=YES
PROTECTED_KEY_METADATA_UNCHANGED=YES_MODE_600
CREDENTIAL_COMMITTED=NO
CREDENTIAL_LOGGED=NO
CREDENTIAL_IN_IMAGE=NO
CREDENTIAL_PRINTED=NO
PRIVATE_NOTE4_DATA_SENT=NO
OUTLOOK_DATA_SENT_TO_GEMINI=NO
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
PRODUCTION_DEPLOYED=NO
PRODUCTION_RESTARTED=NO
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
```

### Overnight verdict

```text
READY_FOR_PRODUCTION_DEPLOYMENT_REVIEW=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=REVIEW_BUN_MINIMAL_TIMEOUT_AND_AUTHORIZE_ANY_FURTHER_NONPRODUCTION_DIAGNOSTICS
```

This is a genuine diagnostic boundary. The run used two of the six newly
authorized Live sessions and did not retry the failed Bun shape. Production
deployment, credential/data-policy changes, billing, Vertex, firmware flash,
and PR merge remain unauthorized.

## Campaign 8D1I–8D1J — Node Live bridge implementation final checkpoint

Stage: 8D1I architecture selection and 8D1J implementation/review
Date: 2026-09-03 (Australia/Perth)
Status: PASS — NODE_LIVE_BRIDGE_IMPLEMENTED_AND_REVIEWED

### Repository State

Repository: Streetjk/slate
Branch: feature/gemini-35-live-evaluation (PR #2)
Base SHA: ca7ae0bd2276bb4318548ce61fda86cee5af1552
Implementation head: 90ab7cbbff39dfb4dda79cf1260611e5f26cf941
Documentation checkpoint head: pending report commit
Upstream SHA: not changed during this checkpoint

Implementation commits in this correction lineage:

- `a2eba3f` — add the Node Gemini Live bridge boundary;
- `a5f6319` — harden bridge lifecycle handling;
- `68c196c` — enforce bridge protocol policy;
- `004fed8` — resolve the first independent review findings;
- `2ef807d` — resolve the second independent review findings;
- `90ab7cb` — isolate bridge reconnect/close epochs and harden ADC references.

### Harness

Codex version: 0.152.0
AGY version: not invoked for this checkpoint
AGY model: not invoked for this checkpoint
AGY authentication: not applicable; no AGY call was required by the current 8D1I/8D1J directive
Independent reviewer: GLM-5.3-Flash via `zai-glm53-reviewer`
Reviewer authentication: protected local ZAI reviewer configuration; credential value was not printed or committed
Orchestration mode: Codex/Luna controller; Sonnet 4.6 bounded worker; GLM-5.3-Flash read-only reviewer

The bounded Sonnet 4.6 read-only worker attempt produced no actionable output and made no tracked or untracked product changes. Codex remained the sole writer and integrator.

### Objective

Select and implement the safest supported Node Live boundary for non-production Gemini 3.1 Live evaluation without changing the production Bun runtime, making a provider call, deploying, changing production settings, or flashing NOTE4.

### Work Completed

The selected architecture is the safe supported Node Live boundary:

- production Bun backend remains the main runtime;
- an explicitly configured private stdio child process runs the Node 22 Gemini Live adapter for evaluation only;
- the child has no public listener and exchanges only bounded, versioned JSONL frames over private stdin/stdout;
- the backend remains the model/tool authority and passes no credential value in bridge frames;
- the exact evaluation model is `gemini-3.1-flash-live-preview`;
- Developer API credential access is evaluation-only, file-reference based, and disabled in production; no provider call was made in 8D1I or 8D1J;
- Vertex/ADC references are accepted only from trusted mounted secret roots and are checked before spawn and again in the Node runtime with `O_NOFOLLOW`;
- bridge epochs now gate parent responses and runtime provider callbacks so stale reconnect/close events cannot affect a replacement session;
- the existing Outlook isolation, narrow tool allowlist, Google Calendar proposal/confirmation semantics, and NOTE4 voice session architecture remain unchanged.

The previous GLM review cycles were adjudicated as follows:

- GLM review of `68c196c`: REVISE, P2/P3 protocol/lifecycle findings; valid findings fixed in `004fed8`.
- GLM review of `004fed8`: REVISE, including a P1 lifecycle issue and P2/P3 race/coverage findings; valid findings fixed in `2ef807d`.
- GLM review of `2ef807d`: REVISE, with P1 runtime stale-session close race, P2 parent stale-response race, and P3 ADC path check/use concern; valid findings fixed in `90ab7cb`.
- GLM exact final review of `90ab7cb`: PASS, P0=0, P1=0, P2=0, P3=0. It confirmed monotonic epoch gating, stale-session suppression, reconnect/close safety, and trusted ADC reference validation with no new defect.

The first broad GLM invocation exceeded its execution window without producing a final verdict and was terminated. A correctly targeted `codex exec review --commit 90ab7cb...` run completed independently from the Slate worktree; a final restricted five-file verdict-normalization review also completed with the explicit PASS above. Both were read-only and made no repository changes.

### Files Changed

The implementation correction is limited to the bridge boundary and tests:

- `backend/src/modules/assistant/gemini-live-bridge.protocol.ts` — epoch-bearing request/response protocol validation;
- `backend/src/modules/assistant/gemini-live-node-bridge.ts` — parent epoch filtering and trusted ADC reference validation;
- `backend/src/modules/assistant/gemini-live-node-bridge-runtime.mjs` — runtime epoch/session ownership, stale callback suppression, and ADC checks;
- `backend/src/modules/assistant/gemini-live-node-bridge-session.mjs` — small epoch/session controller;
- `backend/src/modules/assistant/gemini-live-node-bridge.test.ts` — reconnect/close race, stale callback, protocol, credential, and ADC coverage;
- `backend/src/modules/assistant/gemini-live-bridge.protocol.test.ts` — epoch-aware protocol fixtures;
- `backend/eslint.config.js` — explicit handling of the reviewed `.mjs` boundary files.

No production deployment, firmware, PR merge, or unrelated campaign files were changed during 8D1I/8D1J.

### Architecture Decisions

Architecture option B was retained: Bun production runtime plus a private Node child-process adapter for the evaluation boundary. The adapter is not enabled in production, does not open a socket, does not receive Outlook data, and does not have shell, filesystem, arbitrary HTTP, email, Airtable, or calendar-write authority. The provider model remains configuration-selected and is not duplicated in firmware.

The protocol now requires a positive monotonic epoch on `open` and `reconnect`, includes the epoch on all bridge responses, rejects malformed/unknown frames, and ignores responses from prior epochs. Closing invalidates the active epoch before provider cleanup. ADC credential paths are restricted to `/run/secrets/` or `/var/run/secrets/`, with regular-file, size, permission, access, and no-follow checks.

### Tests

Commands executed on the exact implementation head `90ab7cb`:

- `bun run --cwd backend test` — PASS; 320 tests passed, 0 failed, 996 expectations, 76 files;
- `bun run lint` — PASS; frontend and backend ESLint passed with zero warnings;
- `bun run typecheck` — PASS; frontend and backend TypeScript checks passed;
- `bun run format:check` — PASS; all Prettier checks passed;
- `bun run --cwd frontend build` — PASS; Vite 8.0.11, 2,169 modules transformed;
- `node --check backend/src/modules/assistant/gemini-live-node-bridge-runtime.mjs` — PASS;
- `node --check backend/src/modules/assistant/gemini-live-node-bridge-session.mjs` — PASS;
- `git diff --check` — PASS;
- secret scan for API-key/bearer/private-key patterns outside campaign reports — PASS; no matches;
- `docker build --check .` — PASS;
- `docker build --platform linux/arm64 --tag slate-8d1j-final:local .` — PASS; image ID `sha256:36f51af6a1f8cce03322bee310a305cf2c6b380342e6571bee8d7d97ddab0c31`;
- image metadata — PASS; `linux/arm64`, Node `v22.22.2`;
- sanitized container protocol smoke with an unknown frame — PASS; bridge returned `BRIDGE_PROTOCOL_REJECTED` and made no provider call.

The targeted bridge/protocol suite passed 18/18 under the normal Codex environment. GLM's read-only sandbox could not create its temporary directories, so its duplicated targeted run reported 16 pass and 2 environment-limited failures; this did not invalidate the Codex run, which executed both credential/ADC tests successfully.

### AGY Review

Reviewer model: GLM-5.3-Flash
Effort level: high for the final exact-SHA review
Verdict: PASS

P0 findings: 0
P1 findings: 0
P2 findings: 0
P3 findings: 0

Findings accepted: prior valid lifecycle, stale-response, stale-session, and ADC path findings were fixed across `004fed8`, `2ef807d`, and `90ab7cb`; the final GLM review found no remaining finding.

Findings rejected: none in the final exact-SHA review. The GLM reviewer recorded only environment restrictions: read-only inspection of the permitted bridge files/tests and no provider, credential, edit, commit, push, or deployment activity.

### Security Checks

OAuth-only requirement: no new provider call or credential integration was exercised; no credential value was exposed. The explicit non-production Developer API evaluation path remains gated by configuration and disabled in production.
Static AI API keys found: none in tracked implementation files or committed logs/reports; only runtime file references and placeholders remain.
Outlook read-only: preserved.
Outlook exposed to Gemini: no; allowlist and dependency boundary remain free of Outlook/Microsoft capabilities.
Google Calendar confirmation gate: preserved; the bridge only exposes the proposal tool, never a direct write.
Secrets detected: none; no credential was read, printed, copied, committed, placed in the image, or sent to NOTE4.

### Known Issues

- The two normal-reviewer temporary-directory failures are environment restrictions, not implementation failures; the same tests passed in the Codex environment.
- 8D1K provider validation has not run. No Gemini provider call was made during 8D1I or 8D1J.
- Production deployment, production Gemini settings, billing, Vertex, firmware flash, and PR merge remain unauthorized.
- Physical NOTE4 voice end-to-end validation remains pending the matching backend deployment and explicit flash/provider boundaries.

### Deviations

- No AGY call was made during this checkpoint because the governing 8D1I/8D1J directive specified GLM-5.3-Flash as the independent reviewer and explicitly prohibited provider calls; existing AGY evidence remains preserved in prior campaign sections.
- No new provider call was made, so the 8D1K readiness state is architectural/deterministic/review-based rather than a provider-success claim.
- The final Docker image was built for validation and removed as a disposable local image after evidence capture; production images and rollback state were not touched.

### Next Recommended Stage

Human authorization of 8D1K bounded, synthetic, non-production provider validation, with billing OFF and Vertex disabled. Use the reviewed Node bridge boundary and the protected runtime credential path; do not deploy or flash as part of 8D1K.

### Final Stage Verdict

READY

```text
CAMPAIGN=8D1J
STATUS=NODE_LIVE_BRIDGE_IMPLEMENTED_AND_REVIEWED
PROVIDER_CALLS=0
BUN_BACKEND_RETAINED=YES
NODE_LIVE_BOUNDARY_IMPLEMENTED=YES
GLM53_REVIEW=PASS
PRODUCTION_CHANGED=NO
READY_FOR_8D1K_PROVIDER_VALIDATION=YES
HUMAN_PROVIDER_CALL_AUTHORIZATION_REQUIRED=YES
```

8D1K was not run. The campaign stops here at the explicit human provider-call authorization boundary.

## Campaign 8D1K — Node Live non-production E2E recovery checkpoint

Date: 2026-09-03 (Australia/Perth)
Status: HARD_STOP_HARNESS_TIMEOUT_NO_SANITIZED_RESULT — no subsequent provider call was made

This checkpoint recovered the repository from the Mac reboot, fetched `origin`,
verified PR #2, and re-read the governing instructions and campaign state. The
accepted 8D1J implementation remained exact at `90ab7cbbff39dfb4dda79cf1260611e5f26cf941`;
the report/state checkpoint was at `b985e08214fff03d88c6e3ff81a1d85c0a02d470` before
this report update. The current campaign instruction file was read at commit
`08501bb3ca75739e43fbf4f54811e0243ca5d193`.

### Pre-call reconciliation

```text
REMOTE_BRANCH_HEAD=b985e08214fff03d88c6e3ff81a1d85c0a02d470
PR=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
ORANGE_PI_ARCH=aarch64
DOCKER_SERVER=29.1.3
SLATE_CONTAINER=healthy
MYSQL_CONTAINER=healthy
LOCAL_HEALTH=PASS
PROTECTED_KEY_METADATA=pi:pi_MODE_600_SIZE_53
VERTEX_ENABLED_MATCH=NONE_OBSERVED
BILLING_CHANGED=NO
PRODUCTION_CONTAINER_CHANGED=NO
PRODUCTION_RESTARTED=NO
```

The local Mac Docker daemon was unavailable after reboot. A disposable remote
container path was used against the already healthy Orange Pi Docker daemon;
tracked bridge/runtime source only was transferred for the harness. No
production compose file, image, environment, or container was used. The
protected key was mounted read-only at `/run/secrets/gemini_api_key` and was
never printed, copied, passed as an argument, or included in the build context.

### Bounded provider-call result

The first and only authorized call was launched once using Node `22.22.2`, the
exact `gemini-3.1-flash-live-preview` bridge artifact, the protected read-only
secret mount, synthetic text `Say exactly TEST.`, and Search disabled. The
disposable driver/container exited with code `0`, `OOM=false`, and no runtime
error, but the legacy Docker client/SSH transport timed out before returning the
driver's sanitized model-event/turn-complete summary. The summary could not be
recovered from the disposable container before it entered removal.

```text
CAMPAIGN=8D1K
CALL_1_NODE_BRIDGE_MINIMAL=HARNESS_TIMEOUT_NO_SANITIZED_RESULT
CALL_1_PROVIDER_RESULT=NOT_OBSERVABLE
CALL_1_MODEL=gemini-3.1-flash-live-preview
CALL_1_INPUT=SYNTHETIC_ONLY
CALL_1_MODEL_EVENT=NOT_OBSERVED
CALL_1_TURN_COMPLETE=NOT_OBSERVED
CALL_1_FAILURE_CLASS=HARNESS_SSH_DOCKER_CLIENT_TIMEOUT
PROVIDER_CALLS_USED=1_OF_3
CALL_2_EXACT_SLATE_ADAPTER=NOT_RUN_PREREQUISITE_NOT_PROVEN
CALL_3_TOOL_REGISTRY=NOT_RUN_PREREQUISITE_NOT_PROVEN
```

This is not classified as provider rejection or provider success, and no source
defect was identified. Per the 8D1K sequence, no blind retry and no second or
third provider call was authorized after the prerequisite result was not
proven. No Sonnet correction or fresh GLM review was required because no source
change occurred.

### Safety and cleanup

```text
PRIVATE_DATA_SENT=NO
OUTLOOK_DATA_SENT=NO
CALENDAR_DATA_SENT=NO
SEARCH_EXECUTED=NO
REAL_MICROPHONE=NO
GENERATED_AUDIO_RETAINED=NO
CREDENTIAL_VALUE_PRINTED=NO
CREDENTIAL_MOVED=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
DISPOSABLE_HARNESS_CLEANED=YES
SLATE_CONTAINER_AFTER_CLEANUP=healthy
MYSQL_CONTAINER_AFTER_CLEANUP=healthy
```

### Final stage verdict

```text
CAMPAIGN=8D1K
STATUS=HARD_STOP_HARNESS_TIMEOUT_NO_SANITIZED_RESULT
PROVIDER_CALLS_USED=1_OF_3
EXACT_ADAPTER_MODEL_EVENT=NOT_PROVEN
EXACT_ADAPTER_TURN_COMPLETE=NOT_PROVEN
READY_FOR_8D1L=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=RECOVER_OR_REPLACE_DISPOSABLE_NODE_HARNESS_AND_REAUTHORIZE_SEQUENCE_BEFORE_ANY_REMAINING_CALL
```

8D1L was not started. Production deployment/restart, production Gemini
settings, billing, Vertex, firmware, credential movement, and PR merge remain
closed.

## Campaign 8D1K-R — Disposable Node harness recovery

Date: 2026-09-03 (Australia/Perth)
Status: `HARNESS_RECOVERED_NO_PROVIDER_CALL`

This recovery stage used no Gemini provider call. The local Mac Docker daemon
was available, so recovery was performed against a separate local disposable
Docker path; production was checked read-only before and after.

### Durable result design and evidence

The pinned image was `node:22.22.2-alpine3.22`, image ID
`sha256:7dcbccda199cd32f6613be82a2a5e91a6c502e01dca56302c9f8d38e2ff5ea58`.
Two uniquely named containers were created without `--rm`, using a
provider-disabled mock driver, `--network none`, a read-only root filesystem,
and only two temporary mounts: the mock driver and a writable result
directory. No Gemini credential or secret mount was used.

The success case used container
`slate-8d1kr-success-1788392816906944000` and recovered this sanitized result
after deliberately terminating its `docker wait` launcher:

```text
HARNESS_RESULT_VERSION=1
HARNESS_TERMINAL_STATE=PASS
DRIVER_EXIT_CODE=0
OOM=false
SANITIZED_FAILURE_CLASS=NONE
MODEL_EVENT=NOT_APPLICABLE
TURN_COMPLETE=NOT_APPLICABLE
RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
```

The deterministic failure case used container
`slate-8d1kr-failure-1788392819418211000` and recovered this sanitized result
after the same deliberate launcher interruption:

```text
HARNESS_RESULT_VERSION=1
HARNESS_TERMINAL_STATE=FAIL
DRIVER_EXIT_CODE=23
OOM=false
SANITIZED_FAILURE_CLASS=MOCK_PROVIDER_DISABLED
MODEL_EVENT=NOT_APPLICABLE
TURN_COMPLETE=NOT_APPLICABLE
RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
```

For both cases, completion polling, exit/OOM inspection, result retrieval via
`docker cp`, and log retrieval via `docker logs` were separate bounded Docker
commands. Result JSON and retained Docker logs were verified before explicit
container/file cleanup. No raw provider error, token, private data, or audio
was written. The disposable mock driver was deleted and no tracked harness or
product/runtime source was changed.

### Production and campaign safety

The postcheck found `slate-note4` and `slate-note4-mysql` running and healthy,
both with zero restarts; local production `/healthz` returned `status=ok`.
The exact reviewed bridge implementation remained unchanged at
`90ab7cbbff39dfb4dda79cf1260611e5f26cf941`. No credential was read or mounted,
no provider call was made, and billing, Vertex, production settings,
deployment/restart, firmware, and PR merge remained closed.

```text
CAMPAIGN=8D1K_R
STATUS=HARNESS_RECOVERED_NO_PROVIDER_CALL
PROVIDER_CALLS_THIS_STAGE=0
8D1K_TOTAL_PROVIDER_CALLS_USED=1_OF_3
HARNESS_DURABLE_RESULT=PASS
RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
PRODUCT_SOURCE_CHANGED=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1K_REAUTHORIZATION=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REAUTHORIZE_REMAINING_8D1K_PROVIDER_CALLS
```

The remaining two 8D1K provider calls are intentionally unused. This stage
stops at the explicit human reauthorization boundary; 8D1L and 8D1M were not
started.

### Fresh-fetch revalidation

Following a fresh `git fetch origin --prune`, the provider-disabled proof was
rerun with new uniquely named containers
`slate-8d1kr-success-1788393411039268000` and
`slate-8d1kr-failure-1788393413112053000`. The success record recovered as
`PASS`, exit `0`; the deterministic failure record recovered as `FAIL`, exit
`23`, with `MOCK_PROVIDER_DISABLED`. Both had `OOM=false`, provider event
fields `NOT_APPLICABLE`, and
`RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES` after deliberate termination
of their `docker wait` launcher. Separate polling, wait, inspect, result-copy,
and log commands verified the records before cleanup. No provider call or
credential mount/read occurred, the reviewed bridge remained unchanged, and
production Slate/MySQL remained healthy and untouched.

## Campaign 8D1K — final provider validation after harness recovery

Date: 2026-09-03 (Australia/Perth)
Controller: Luna; worker: Sonnet 4.6; reviewer: retained GLM-5.3-Flash PASS
because no tracked product/runtime source changed.

### CALL 2 — minimal exact Node bridge control

CALL 2 was started exactly once in a uniquely named ARM64 disposable container
using the reviewed Node bridge runtime lineage at
`90ab7cbbff39dfb4dda79cf1260611e5f26cf941`, model
`gemini-3.1-flash-live-preview`, synthetic text `Say exactly TEST.`, Search
disabled, and no tool invocation. The protected runtime credential was mounted
only at the container secret destination with read-only access. The container
was started once without `--rm`; its wait launcher was intentionally terminated,
then fresh independent status, wait, result-file, and log commands recovered
the sanitized result before cleanup.

```text
CALL_2=PASS
CALL_2_MODEL_EVENT=YES
CALL_2_TURN_COMPLETE=YES
CALL_2_EXIT=0
CALL_2_OOM=false
CALL_2_SEARCH_DISABLED=YES
CALL_2_TOOL_INVOCATIONS=0
CALL_2_RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
```

### CALL 3 — exact Slate Bun adapter

CALL 3 was started exactly once in a disposable ARM64 image containing the
exact Slate `GeminiLiveService`, `GeminiConfig`, Node bridge factory, and
reviewed private Node runtime. It used the same exact model and protected
read-only runtime credential mechanism, synthetic text only, Search disabled,
and no tool invocation. The result survived deliberate launcher interruption
and was retrieved independently from container status and logs.

```text
CALL_3=FAIL
CALL_3_FAILURE_CLASS=SLATE_ADAPTER_ERROR
CALL_3_EXIT=21
CALL_3_OOM=false
CALL_3_MODEL_EVENT=NO
CALL_3_TURN_COMPLETE=NO
CALL_3_TOOL_INVOCATIONS=0
CALL_3_RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
```

`SLATE_ADAPTER_ERROR` is the exact sanitized classification emitted by the
reviewed service boundary; raw provider error details were not captured or
exposed. The result did not establish a deterministic product-source defect,
so no bridge change or additional provider call was made. CALL 3 therefore
fails the prerequisite for 8D1L, and the optional tool-registry provider call
is waived because the three-call campaign budget is exhausted.

### Final 8D1K stop state

```text
CAMPAIGN=8D1K
STATUS=HARD_STOP_EXACT_NODE_LIVE_ADAPTER_E2E_FAILURE
EXACT_ADAPTER_MODEL_EVENT=NO
EXACT_ADAPTER_TURN_COMPLETE=NO
PROVIDER_CALLS_USED=3_OF_3
PRIVATE_DATA_SENT=NO
OUTLOOK_DATA_SENT=NO
CALENDAR_DATA_SENT=NO
SEARCH_EXECUTED=NO
REAL_MICROPHONE=NO
GENERATED_AUDIO_RETAINED=NO
PRODUCT_SOURCE_CHANGED=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_SANITIZED_CALL_3_FAILURE_NO_REMAINING_PROVIDER_CALLS
```

All disposable images, containers, result files, and build contexts were
removed after evidence verification. Production Slate/MySQL remained running
and healthy with zero restarts and `/healthz` status `ok`. 8D1L and 8D1M were
not started.

## Campaign 8D1K-E — review closure and deterministic revalidation

Date: 2026-09-03 (Australia/Perth)

The exact ZAI reviewer route was restored and passed the required E1 preflight:

```text
E1=PASS
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_PROVIDER=ZAI
REVIEW_MODEL=glm-5.3-flash
ZAI_AUTH=PASS
SECRET_EXPOSED=NO
```

The exact product/runtime artifact review passed at
`daafe6b10e140c81c70acc91443300ba80c12c28` with P0/P1/P2=0 and four accepted
non-blocking P3 observations. A subsequent test-only formatting/import
correction did not alter product/runtime behavior. Host deterministic gates,
the exact ARM64 candidate, and the provider-disabled full Bun-parent/Node-child
adapter all passed. The production guard remained fail-closed, the Node bridge
had no public listener, image/config/history scans found no credential content,
and production Slate/MySQL health was checked read-only and remained healthy.

```text
CAMPAIGN=8D1K_E
STATUS=REVIEW_CLOSED_DETERMINISTICALLY_READY_FOR_HUMAN_PROVIDER_REVALIDATION_DECISION
FINAL_SOURCE_SHA=693288a7b63d61a7ef9fe0e68d1882e5585353d8
GLM53_REVIEW=PASS
EXACT_FULL_ADAPTER_PROVIDER_DISABLED_E2E=PASS
PROVIDER_CALLS_THIS_CAMPAIGN=0
8D1K_TOTAL_PROVIDER_CALLS_USED=3_OF_3
PRIVATE_DATA_SENT=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=YES
READY_FOR_8D1L=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_DECIDE_API_KEY_AND_DATA_POLICY_AND_AUTHORIZE_OR_REJECT_ONE_NEW_EXACT_ADAPTER_PROVIDER_REVALIDATION
```

The future provider plan is prepared only; no Gemini provider call was made in
8D1K-E. 8D1L and 8D1M remain unstarted, and PR #2 remains unmerged.

## Campaign 8D1K-F — F1 credential preflight hard stop

Date: 2026-09-03 (Australia/Perth)

Origin was fetched and the branch was reconciled to authorization checkpoint
`82c05b208f1306cf83553834762c88dc6deb9274`. PR #2 remains open, draft, and
unmerged. The local and standard trusted secret roots had no protected Gemini
credential reference. Production Slate/MySQL remained healthy and the active
production Slate container had no Gemini credential mount. The remote
production `.env` was intentionally not read or loaded into a disposable
process.

```text
CAMPAIGN=8D1K_F
STATUS=HARD_STOP_PROVIDER_AUTH_OR_CREDENTIAL_BOUNDARY
F1=FAIL
F1_FAILURE_CLASS=PROTECTED_RUNTIME_CREDENTIAL_UNAVAILABLE
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=0_OF_1
PROVIDER_CALLS_REMAINING=1
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
MODEL=gemini-3.1-flash-live-preview
CREDENTIAL_VALUE_EXPOSED=NO
PRIVATE_DATA_SENT=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_PROVIDE_APPROVED_HOST_LOCAL_PROTECTED_RUNTIME_CREDENTIAL_REFERENCE_THEN_RESUME_F1
```

The exact full-Slate-adapter provider call was not attempted. No retry or
second call is authorized by this campaign.

## Campaign 8D1K-F — recovered F1 and single-call F2 boundary

Date: 2026-09-03 (Australia/Perth)

The historical protected host source was recovered from prior provider-harness
evidence and verified on `note4-orangepi` using metadata only:

```text
F1=PASS
F1_SOURCE_HOST=note4-orangepi
F1_SOURCE_PATH=/mnt/ssd-tmp/slate-tools/gemini-api-key/gemini_api_key
F1_SOURCE_OWNER=pi
F1_SOURCE_GROUP=pi
F1_SOURCE_MODE=600
F1_SOURCE_SIZE_BYTES=53
F1_SOURCE_NONEMPTY=YES
F1_SOURCE_TYPE=REGULAR_NON_SYMLINK_FILE
F1_CONTAINER_DESTINATION=/run/secrets/gemini_api_key
F1_READ_ONLY_BIND=YES
F1_DOCKER_MOUNT_RW=false
F1_CREDENTIAL_VALUE_READ=NO
F1_PRODUCTION_ENV_USED=NO
```

The one separately authorized F2 provider call then ran exactly once through
the full Slate Bun adapter and private Node bridge. Its sanitized result was
persisted independently and recovered after the launcher command returned.
The call failed quickly, so a deliberate wait-launcher timeout was not
observed and is not claimed as evidence.

```text
CAMPAIGN=8D1K_F
STATUS=HARD_STOP_EXACT_FULL_ADAPTER_REAL_PROVIDER_REVALIDATION_FAILURE
F2=FAIL
F2_FAILURE_CLASS=SLATE_ADAPTER_ERROR
F2_MODEL=gemini-3.1-flash-live-preview
F2_MODEL_EVENT=NO
F2_TURN_COMPLETE=NO
F2_TOOL_INVOCATIONS=0
F2_SEARCH_EXECUTED=NO
F2_PRIVATE_DATA_SENT=NO
F2_GENERATED_AUDIO_RETAINED=NO
F2_OOM=NO
F2_EXIT=21
F2_RESULT_RECOVERED_INDEPENDENTLY=YES
F2_CONTAINER_CLEANUP=ATTEMPTED_DEAD_CONTAINER_REMAINS_IN_DOCKER_METADATA
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=1_OF_1
PROVIDER_CALLS_REMAINING=0
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
SOURCE_DEFECT_PROVEN=NO
SOURCE_CORRECTION_MADE=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_SINGLE_CALL_FAILURE_AND_DECIDE_ANY_FUTURE_CAMPAIGN
```

## Campaign 8D1K-G — G1 sanitized F2 forensic reconstruction

The exact F2 disposable container ID was checked with filtered Docker metadata
only. The remote daemon returned `no such object`; no removal command was
issued, and no credential, environment, raw provider body, or private payload
was read. The already-pushed F2 report and independently recovered sanitized
result remain the authoritative evidence.

```text
CAMPAIGN=8D1K_G
STATUS=G1_F2_FORENSICS_PRESERVED_CONTAINER_METADATA_UNAVAILABLE
G1_F2_CONTAINER_METADATA=NOT_PRESENT_NO_SUCH_OBJECT
G1_F2_CONTAINER_REMOVAL=NOT_PERFORMED
F2_STAGE_REACHED=UNKNOWN
F2_BRIDGE_ERROR_CODE=UNKNOWN
F2_CHILD_EXIT=UNKNOWN
F2_READY_OBSERVED=NO
F2_TEXT_FRAME_SENT=UNKNOWN
F2_RESULT_EVIDENCE_PRESERVED=YES
F2_RAW_PROVIDER_ERROR_READ=NO
F2_CREDENTIAL_VALUE_READ=NO
PROVIDER_CALLS_THIS_CAMPAIGN=0
PRODUCTION_CHANGED=NO
```

The text-transport mismatch remains a current official-contract correction
hypothesis and is not claimed as the proven cause of F2.

## Campaign 8D1K-G — G2–G6 zero-provider correction and validation

The current official-contract mismatch was confirmed in the Node bridge and
corrected narrowly: ordinary post-connect text now uses
`sendRealtimeInput({ text })`; audio, audio-end, tool-response, reconnect,
close, and the production Bun/2.5 route remain unchanged. The SDK and Slate
event path safely preserve multi-part server messages, recorded as
`SERVER_MULTIPART_EVENT_AUDIT=PASS_NO_CHANGE`.

Search/tool reporting is explicit rather than conflated:

```text
SEARCH_DECLARED=NO
CUSTOM_FUNCTIONS_DECLARED=YES
CUSTOM_FUNCTION_NAMES=propose_google_calendar_event,get_btc_price
TOOL_INVOCATIONS=0_IN_PROVIDER_DISABLED_FIXTURES
```

Sanitized internal failure-stage classification was added while retaining
generic device-facing errors and excluding raw provider detail. The exact
deterministic evidence before final commit was:

```text
G31_TEXT_TRANSPORT_COMPATIBILITY=DEFECT_CONFIRMED
TEXT_TRANSPORT_CORRECTED=YES
SAFE_FAILURE_STAGE_OBSERVABILITY=IMPROVED
FULL_BACKEND_HOST=327_PASS_0_FAIL_4_SECRET_GATED_SKIP
FULL_BACKEND_ARM64=331_PASS_0_FAIL
SHARED_TESTS=6_PASS_0_FAIL
LINT=PASS
TYPECHECK=PASS
FORMAT_CHECK=PASS
FRONTEND_BUILD=PASS
NODE_SYNTAX_CHECK=PASS
ARM64_CANDIDATE_BUILD_PRECOMMIT=PASS
ARM64_NODE_VERSION=22.22.2
ARM64_BUN_VERSION=1.4.0
ARM64_GENAI_NODE_SDK_LOAD=PASS_NO_PROVIDER_CALL
PROVIDER_DISABLED_FULL_ADAPTER_E2E=PASS
PRIVATE_DATA_FIXTURES=NONE
PROVIDER_CALLS_THIS_CAMPAIGN=0
PRODUCTION_CHANGED=NO
```

This correction does not claim that the historical F2 failure was caused by
text transport; that attribution remains unproven until a future separately
authorized real-provider revalidation.

## Campaign 8D1K-G — G7 exact GLM-5.3-Flash review and G8 final checkpoint

The exact `zai-glm53-reviewer` route was preflighted successfully with
`REVIEW_PROVIDER=ZAI` and `REVIEW_MODEL=glm-5.3-flash`. A broad first review
attempt timed out at the bounded wall clock (`REVIEW_EXIT=124`); after that
sanitized failure classification, one scope-limited read-only review of the
exact corrected diff completed successfully.

```text
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_PROVIDER=ZAI
REVIEW_MODEL=glm-5.3-flash
REVIEW_MODE=READ_ONLY
REVIEWED_SHA=7a724488a9ed20093469caefc03addc764185be5
GLM53_REVIEW=PASS
GLM53_P0=0
GLM53_P1=0
GLM53_P2=0
GLM53_P3=2
REVIEW_REQUIRED_ACTION=NONE
PROVIDER_CALLS_THIS_CAMPAIGN=0
SECRET_EXPOSED=NO
```

Luna accepted both P3 observations as non-blocking and deferred: conservative
startup stdin classification and the static nature of the compatibility
contract test. No bounded source correction was required.

```text
CAMPAIGN=8D1K_G
STATUS=READY_FOR_HUMAN_DECISION_ON_ONE_CORRECTED_EXACT_ADAPTER_PROVIDER_REVALIDATION
FINAL_SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
FULL_TESTS=PASS
ARM64_BUILD=PASS
PROVIDER_DISABLED_FULL_ADAPTER_E2E=PASS
PROVIDER_CALLS_THIS_CAMPAIGN=0
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_F_PROVIDER_CALLS_USED=1_OF_1
G31_TEXT_TRANSPORT_DEFECT=CONFIRMED_BY_CURRENT_OFFICIAL_API_CONTRACT
F2_FAILURE_ATTRIBUTION_TO_TEXT_TRANSPORT=PLAUSIBLE_NOT_LIVE_PROVEN
TEXT_TRANSPORT_CORRECTED=YES
SAFE_FAILURE_STAGE_OBSERVABILITY=IMPROVED
SEARCH_DECLARED=NO
CUSTOM_FUNCTIONS_DECLARED=YES
TOOL_INVOCATIONS=0_IN_PROVIDER_DISABLED_FIXTURES
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_AUTHORIZE_OR_REJECT_ONE_NEW_CORRECTED_EXACT_ADAPTER_PROVIDER_CALL
```

The exact ARM64 candidate image boundary was also checked without provider
access: no Gemini/API-key/Vertex/Google image environment or history match,
no runtime credential destination, and no `/app/.env` were present; no public
bridge listener was found. No production state changed.
