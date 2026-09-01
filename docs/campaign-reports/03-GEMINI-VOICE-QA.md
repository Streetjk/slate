# Stage Report

Stage: Campaign 3B — Gemini voice, Search, and Q&A
Date: 2026-09-01
Status: PASS (software gate; live Google account smoke test deferred)

## Repository State

Repository: Streetjk/slate
Branch: `integration/note4-custom`
Start SHA: `96d8d01a542f30e745be6cdb056016eff1870d7d`
Base SHA: `96d8d01a542f30e745be6cdb056016eff1870d7d`
End SHA: `919d723146b19813cf3a43725ce2c4cc39842c8b` (implementation integration before report publication)
Head SHA before report publication: `919d723146b19813cf3a43725ce2c4cc39842c8b`
Upstream SHA: `cf5b4ffb0b3db09cb44c058b425b77c4fa58d21e`

Implementation commits:

- `b35ed7a` — `feat(ai): add OAuth-backed Gemini assistant core`
- `1e902a2` — `fix(ai): bound live session reconnect lifecycle`
- `f9112f6` — `feat(ai): bridge Xiaozhi voice websocket to Gemini Live`
- `9b04682` — `fix(ai): harden voice turn lifecycle`
- `919d723` — `feat(ai): integrate Gemini voice and Q&A`

## Harness

Codex version: `codex-cli 0.147.0`
AGY version: `1.1.22`
AGY model: `gemini-3.7-flash-medium` for final review; `gemini-3.7-flash-high` for Campaign 3A feasibility
AGY authentication: OAuth through the official AGY CLI; Gemini runtime uses Google Cloud ADC/Vertex AI configuration
Orchestration mode: `CODEX_PRIMARY`

## Objective

Add the first backend Gemini assistant and live voice gateway while preserving Slate’s NOTE4 audio, Xiaozhi, synchronization, and low-power architecture. Provide English/Japanese voice handling, general Q&A, optional web grounding, and a narrow proposal-only tool boundary without exposing Outlook to Gemini or introducing model API keys.

## Work Completed

- Added a configurable ADC/Vertex-backed Gemini text assistant using `@google/genai`, with no `apiKey` construction path.
- Added configurable Gemini Live native-audio connection handling with bounded connection timeout, reconnect, close, and fail-closed configuration behavior.
- Added the authenticated WebSocket route `/api/v1/voice/websocket`. Existing device-secret authentication is checked before a voice session is created; the secret and device context are not passed to Gemini.
- Preserved Slate’s existing firmware-side Xiaozhi protocol and audio stack. The backend translates 16 kHz Opus device packets to 24 kHz model PCM and converts model PCM back to 16 kHz Opus frames.
- Added hello handshake validation, serialized session operations, listen start/stop, abort, goodbye, speaking state, transcription, TTS audio events, async callback error handling, and cleanup of Opus resources and partial frames.
- Added `POST /api/v1/assistant/answer` for validated text requests. Model tools are closed-world: Google Search grounding plus `propose_google_calendar_event` and `get_btc_price`; proposal handling performs no calendar write.
- Centralized model names and live timeout configuration in environment schema/configuration. Documentation explicitly requires ADC/OAuth and forbids Gemini API keys.
- Added deterministic tests for OAuth/ADC construction, missing configuration, model/tool configuration, malformed tool calls, voice lifecycle, codec framing/resampling, async failure, handshake enforcement, device authentication, and controller forwarding.

## Files Changed

Important implementation files:

- `backend/src/modules/assistant/assistant.module.ts` — assistant dependency-registration boundary.
- `backend/src/modules/assistant/assistant.controller.ts` and `assistant.controller.test.ts` — validated text endpoint and forwarding coverage.
- `backend/src/modules/assistant/gemini-assistant.service.ts` and `gemini-live.service.ts` — ADC-backed text and Live API adapters.
- `backend/src/modules/assistant/gemini-tool-registry.ts` — narrow allowlist and function declarations.
- `backend/src/modules/assistant/xiaozhi-voice.gateway.ts` and `xiaozhi-voice-session.ts` — authenticated WebSocket and session state machine.
- `backend/src/modules/assistant/opus-pcm-codec.ts` — Opus/PCM conversion, resampling, frame buffering, and cleanup.
- `backend/src/modules/assistant/*.test.ts` — deterministic assistant, codec, gateway, session, and Live API tests.
- `backend/src/main.ts` — WebSocket plugin and route registration.
- `backend/src/infra/config/env.schema.ts` and `.env.example` files — centralized ADC/model/timeout configuration and OAuth-only documentation.
- `backend/package.json`, `bun.lock` — approved `@google/genai`, `@fastify/websocket`, and `opusscript` dependencies.

No firmware source, NOTE4 BSP, SSD2683, ES8311/I2S, sleep/wake, LittleFS, or synchronization implementation was rewritten.

## Architecture Decisions

- Text reasoning uses configurable `GEMINI_TEXT_MODEL` with default `gemini-3.7-flash`; Live audio uses configurable `GEMINI_LIVE_MODEL` with default `gemini-live-2.5-flash-native-audio`, as established by the Campaign 3A feasibility gate.
- The approved runtime authentication path is Google Cloud ADC/Vertex OAuth. Missing project/location configuration fails closed. No API-key fallback is present in the new Gemini code.
- The device voice path is independent of Outlook. Gemini receives neither Outlook credentials, Graph clients, normalized Outlook events, nor an Outlook-capable tool or HTTP route.
- The model may propose a Google Calendar event, but this stage does not execute it. Campaign 4 must add the user-scoped, single-use confirmation ticket before any write.
- Server-side Gemini Live tool calls are rejected rather than executed until the explicit Campaign 4 confirmation boundary exists.
- Normal CI uses mocks; live Google Cloud calls require an external project, enabled services, IAM/quota, and interactive ADC consent and are separately labelled `LIVE_INTEGRATION`.
- `@google/genai` is Apache-2.0, `@fastify/websocket`/`ws` are MIT, and `opusscript` is MIT; no copied third-party implementation was added.

## Tests

- `bun run format:check` — PASS; all Prettier-checked TypeScript/TSX/JSON files matched.
- `bun run lint` — PASS; frontend and backend ESLint completed with zero warnings.
- `bun run typecheck` — PASS; frontend and backend TypeScript checks completed.
- `bun run --cwd shared test` — PASS; 6 tests, 0 failures, 27 expectations.
- `bun run --cwd backend test` — PASS; 252 tests, 0 failures, 803 expectations across 66 files.
- `bun run --cwd frontend build` — PASS; Vite transformed 2,169 modules and produced the production bundle.
- `bun run --cwd backend prisma validate` — PASS; Prisma schema valid.
- `git diff --check` — PASS.
- Focused `bun test src/modules/assistant` from `backend` — PASS; 23 tests, 0 failures, 52 expectations.

Firmware was not rebuilt in this stage because no firmware files changed. The exact firmware baseline remains the Phase 0 `v5.5.2`/`esp32s3` result; no new firmware success is claimed here.

## AGY Review

Reviewer model: `gemini-3.7-flash-medium` for final re-review
Effort level: medium final re-review; high-effort adversarial review at the preceding implementation checkpoint
Verdict: PASS

Review history and substantive findings:

- Initial review at `b35ed7a`: `PASS`; no findings and no reviewer changes.
- Re-review at `1e902a2`: `PASS`; no findings and no reviewer changes.
- High-effort review at `f9112f6`: `REVISE`, with two P1, three P2, and two P3 findings. All were accepted and fixed:
  - `AI-VOICE-P1-01` — abort left speaking/audio state; abort now clears speaking and codec buffers, with regression coverage.
  - `AI-VOICE-P1-02` — asynchronous Live callback exceptions could escape; model event handling now catches and fails the session safely.
  - `AI-VOICE-P2-01` — Live could start before hello; listen start now requires a valid handshake.
  - `AI-VOICE-P2-02` — goodbye did not close the socket; goodbye now closes with code 1000.
  - `AI-VOICE-P2-03` — partial PCM could cross turns; turn completion and abort reset codec state.
  - `AI-VOICE-P3-01` — unaligned PCM views could fail; resampling copies unaligned input before creating an `Int16Array` view.
  - `AI-VOICE-P3-02` — controller lacked coverage; forwarding test added.
- Final re-review after `9b04682`/`919d723`: `PASS`. AGY verified all seven prior findings fixed, ADC/Vertex OAuth construction, configurable model IDs, strict tool allowlist, Outlook isolation, Live timeout/resource cleanup, serialized operations, and the 252-test backend suite. It reported no new P0–P3 findings and no reviewer-introduced tracked or untracked changes.

P0 findings: none.
P1 findings: none after correction cycle.
P2 findings: none after correction cycle.
P3 findings: none after correction cycle.

Findings accepted: all seven findings from the high-effort review were accepted, fixed, and covered by regression tests.

Findings rejected: none.
Reason for any rejected finding: not applicable.

## Security Checks

OAuth-only requirement: PASS for new Gemini runtime; Google Cloud ADC/Vertex configuration is used and no model API key was added.
Static AI API keys found: NONE introduced. Pre-existing legacy `AI_API_KEY`/`TTS_API_KEY` variable names remain in Slate’s older provider/TTS paths without committed values; they are not used by the new Gemini adapter and require later migration if the final MVP policy forbids those legacy providers.
Outlook read-only: PRESERVED from Campaign 2; this campaign adds no Outlook mutation.
Outlook exposed to Gemini: NO; tool registry and dependency path contain no Outlook/Microsoft capability, and Outlook isolation tests remain green.
Google Calendar confirmation gate: PRESERVED; this campaign only validates/proposes event data and performs no write. Campaign 4 is required before writes.
Secrets detected: NONE in the new changes, diff, or report. Credential stores, `.env` files, tokens, cookies, and private keys were not read or committed.

## Known Issues

- No live Google ADC/Vertex account smoke test was run. User project setup, billing/API enablement, IAM/quota, and interactive ADC consent are external prerequisites and are deferred as `LIVE_INTEGRATION`.
- No physical NOTE4 flash or microphone/speaker test was performed; hardware validation remains a later human-boundary action.
- The existing legacy Slate TTS/AI provider variable names remain outside the new Gemini path. They contain no committed credentials but must be retired or explicitly dispositioned before a strict final “no static AI API keys” claim.
- Campaign 4 still must implement Google Calendar OAuth, proposal display, user confirmation, and single-use confirmation tickets. No calendar write is available from this campaign.
- The Live gateway currently rejects server-side model tool calls; this is intentional until the confirmation-controlled Google Calendar capability is implemented.

## Deviations

- Live account verification and physical audio verification were not claimed as automated passes because they require external user credentials or hardware.
- The default review used medium effort; high effort was used for the adversarial review and will be used for OAuth/security-sensitive Campaign 4 review as required.
- Firmware was not rebuilt after integration because the firmware tree was unchanged; the Phase 0 exact-version firmware baseline remains the applicable evidence.

## Next Recommended Stage

Start Campaign 4 — Google Calendar voice writes. Implement Google OAuth with minimal scopes and a server-generated, short-lived, user-scoped, proposal-bound, single-use confirmation ticket. Enforce `NO CONFIRMATION = NO WRITE`, then add deterministic tests for confirm, cancel, expiry, replay, wrong-user, duplicate, timezone, OAuth expiry, and upstream failure paths.

## Final Stage Verdict

READY
