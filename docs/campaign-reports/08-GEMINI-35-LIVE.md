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
