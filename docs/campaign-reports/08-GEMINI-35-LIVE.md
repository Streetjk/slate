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
