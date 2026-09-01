# Stage Report

Stage: Campaign 8 — Gemini 3.5 Live evaluation / voice-stack upgrade
Date: 2026-09-02 (Australia/Perth)
Status: PASS — evaluation complete; Outcome C, no runtime migration selected

## Repository State

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
Base SHA: `2d4a2a9e9a380c591c2ac7f0f3120f1f7939b65d` (`origin/integration/note4-custom`)
Start SHA: `ad6ed1ec04ad7afffd9822be1632b456fa066d11`
Implementation SHA: `ad6ed1ec04ad7afffd9822be1632b456fa066d11` (no product/runtime changes)
Head SHA: `ad6ed1ec04ad7afffd9822be1632b456fa066d11` before this report commit
Campaign 8 instruction SHA: `ad6ed1ec04ad7afffd9822be1632b456fa066d11`
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

No implementation migration was justified. Source inspection confirms the model remains backend-owned:

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

No product/runtime implementation changes were made. This branch adds only the Campaign 8 directive initially; the evaluation result is captured in this report and the campaign state. A no-op runtime result was selected because changing the model would either require an unverified product surface/authentication path or lose required capabilities.

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

READY FOR HUMAN REVIEW — OUTCOME C / NO MIGRATION; NOT DEPLOYED
