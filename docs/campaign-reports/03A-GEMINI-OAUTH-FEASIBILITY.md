# Stage Report

Stage: Campaign 3A — Gemini OAuth/ADC feasibility
Date: 2026-09-01
Status: PASS (implementation-ready with explicit model split)

## Repository State

Repository: Streetjk/slate
Branch: `integration/note4-custom`
Start SHA: `b326bd40e5a363670435bbf7b66a7c4f7b34f3aa`
Base SHA: `b326bd40e5a363670435bbf7b66a7c4f7b34f3aa`
End SHA: report/state publication commit (recorded after commit)
Head SHA: `b326bd40e5a363670435bbf7b66a7c4f7b34f3aa` before this report publication
Upstream SHA: `cf5b4ffb0b3db09cb44c058b425b77c4fa58d21e`

## Harness

Codex version: `codex-cli 0.147.0`
AGY version: `1.1.22`
AGY model: `gemini-3.7-flash-high`
AGY authentication: OAuth through the official AGY CLI
Orchestration mode: `CODEX_PRIMARY`

## Objective

Determine whether the required Gemini capabilities can be implemented through an approved Google OAuth/ADC path, without API keys, and identify current model identifiers for live voice, reasoning, Search grounding, function calling, streaming, STT, and TTS.

## Work Completed

- Invoked AGY researcher with high effort and a read-only instruction. AGY returned `READY` and proposed Google Cloud Vertex AI with Application Default Credentials (ADC), using the existing Slate audio lifecycle and strict AI tool boundaries.
- Independently verified the current official Google Cloud documentation rather than relying on AGY model-name claims or historical model names.
- Confirmed `gemini-3.7-flash` is currently documented as GA with model ID `gemini-3.7-flash`, text/audio input, structured output, Google Search grounding, and function calling. It does **not** support Gemini Live API.
- Confirmed live audio must use the separate GA model `gemini-live-2.5-flash-native-audio`. It supports raw 16-bit PCM input at 16 kHz, raw PCM output at 24 kHz, multilingual conversation, audio transcriptions, Google Search, and function calling over the stateful WebSocket Live API.
- Confirmed Cloud Speech-to-Text V2 documents `chirp_3` support for `en-US`, `en-AU`, and `ja-JP` in supported regions. Australia/Perth deployments should use an available compatible region and retain locale configuration.
- Confirmed Google Cloud documentation provides the OAuth/ADC local path `gcloud auth application-default login`. No API-key path was used or introduced.
- Confirmed Google Cloud Text-to-Speech client documentation supports local ADC credentials. TTS remains a separately configured Google Cloud capability and will be mocked in deterministic tests.
- No product source files were changed. This stage only records feasibility and the implementation constraints for Campaign 3B.

## Files Changed

- `docs/campaign-reports/03A-GEMINI-OAUTH-FEASIBILITY.md` — this feasibility evidence and decision record.
- `docs/campaign-reports/CAMPAIGN-STATE.md` — resumable campaign state advanced to Campaign 3B after this stage passed.

## Architecture Decisions

- Use Google Cloud Vertex AI/Agent Platform through ADC/OAuth-compatible application credentials. The implementation must not add `GEMINI_API_KEY`, `GOOGLE_API_KEY`, or another static model credential.
- Keep model IDs configurable and centralized. The initial documented defaults are:
  - text reasoning, structured proposals, Search grounding, and function calls: `gemini-3.7-flash`;
  - live voice/audio session: `gemini-live-2.5-flash-native-audio`;
  - external STT fallback/explicit transcription: Cloud Speech-to-Text V2 `chirp_3` with configured `en-US`/`en-AU`/`ja-JP` locales;
  - TTS: Google Cloud Text-to-Speech with an ADC-authenticated client and configured voice.
- Do not attempt to use `gemini-3.7-flash` as a Live API model because the official model page marks Live API as unsupported. Live audio and text reasoning are separate provider operations behind the backend voice gateway.
- Keep Google Search and function calling narrow and allowlisted. The initial AI tool set remains `web_search`, `propose_google_calendar_event`, and `get_btc_price`; Outlook/Microsoft capability remains absent.
- Keep Outlook data and credentials outside every Gemini request, tool registry, and provider dependency. The Campaign 3B implementation must preserve the isolation proven in Campaign 2.
- Preserve Slate’s existing ES8311/I2S microphone/speaker buffers and Xiaozhi lifecycle. The backend gateway will translate audio/session events rather than replacing the NOTE4 low-level audio stack.
- Use deterministic mocks for normal CI. Live Google Cloud calls require a configured project, billing/API enablement, and user ADC consent, which are external human-boundary prerequisites and must be separately labelled `LIVE_INTEGRATION`.

Official references consulted:

- [Configure application default credentials](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/gcp-auth) — Google documents ADC and `gcloud auth application-default login` for Gemini on Agent Platform.
- [Gemini 3.7 Flash model details](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-7-flash) — current model ID, GA status, supported tools, and Live API limitation.
- [Gemini Live API overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/live-api) — supported live model, PCM formats, WebSocket transport, transcription, multilingual, Search, and tool use.
- [Gemini 2.5 Flash with Gemini Live API](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/2-5-flash-live-api) — current native-audio model capabilities and model ID.
- [Cloud Speech-to-Text V2 supported languages](https://docs.cloud.google.com/speech-to-text/docs/speech-to-text-supported-languages) — current `en-US`, `en-AU`, and `ja-JP` locale/model availability.
- [Create audio from text using client libraries](https://cloud.google.com/text-to-speech/docs/create-audio-text-client-libraries) — Google Cloud TTS client setup and ADC-compatible local authentication.

## Tests

This was a research-only stage; no product implementation was added, so feature unit tests were not applicable.

- `git status --short` before report creation — PASS; no uncommitted product changes.
- `git diff --check` before report creation — PASS.
- Official documentation review — PASS; all required capability categories were mapped to an OAuth/ADC-compatible Google Cloud path or explicitly constrained below.

Live account verification was not run. No Google Cloud project, billing activation, or interactive ADC consent was performed in this stage.

## AGY Review

Reviewer model: `gemini-3.7-flash-high`
Effort level: high
Verdict: READY

AGY’s substantive research findings:

- Vertex AI with Application Default Credentials is the approved OAuth-compatible route; AGY recommended `gcloud auth application-default login` locally and workload identity/metadata-based credentials in deployment.
- AGY identified `gemini-3.7-flash` for reasoning, Search grounding, structured output, and function calling.
- AGY identified `gemini-live-2.5-flash-native-audio` for low-latency voice, transcription, multilingual interaction, Search, and function calling.
- AGY identified Cloud Speech-to-Text V2 and Cloud Text-to-Speech as OAuth/ADC-compatible companion services.
- AGY recommended preserving the Slate audio stack and isolating the AI module from Outlook.

P0 findings: none.
P1 findings: none.
P2 findings: none.
P3 findings: none.

Findings accepted: AGY’s ADC direction, model split, audio-stack reuse, and Outlook isolation recommendations were accepted after primary-document verification.

Findings rejected: none as actionable defects. AGY’s capability claims were treated as research assertions and independently verified before being used as implementation constraints.

Codex versus AGY resolution:

- AGY’s `gemini-3.7-flash` reasoning model claim was confirmed by the current official model page, including GA status and model ID.
- The important limitation was made explicit: official documentation marks `gemini-3.7-flash` Live API as unsupported. Therefore Campaign 3B must use the separate `gemini-live-2.5-flash-native-audio` model for live audio.
- AGY’s `chirp_3` STT claim was confirmed for the required English and Japanese locales by the current Speech-to-Text V2 language table.
- AGY’s recommendation is not treated as proof of live access. Project configuration, billing, quota, region availability, and interactive ADC consent remain separate live-integration checks.

AGY protocol: the researcher was instructed not to edit the working tree. No reviewer edits, commits, pushes, or merges were observed.

## Security Checks

OAuth-only requirement: PASS for the selected design; Google documents ADC, and no API-key credential path was used.
Static AI API keys found: NONE introduced. No `GEMINI_API_KEY`, `GOOGLE_API_KEY`, or OpenAI model key was added.
Outlook read-only: PRESERVED from Campaign 2; no new Outlook capability was added.
Outlook exposed to Gemini: NO; the selected architecture keeps the provider and event data outside the AI path.
Google Calendar confirmation gate: PRESERVED; proposal interpretation may use the text model, but Campaign 4 will require a user-scoped confirmation ticket before any write.
Secrets detected: NONE; ADC stores and other credential material were not read, copied, or committed.

## Known Issues

- Live Google verification is not complete. A project with billing, required APIs, IAM, quota, and user ADC consent is needed for a separately labelled `LIVE_INTEGRATION` check.
- The Live native-audio model has a documented retirement date of December 13, 2026; model selection must remain configurable so it can be replaced without a protocol-wide rewrite.
- The exact production region and deployment credential mechanism are not selected yet. The implementation must fail closed with a clear configuration error rather than fall back to an API key.
- No TTS voice, audio transcoding policy, or runtime timeout values were selected in this feasibility stage.
- No voice gateway implementation has started; hardware behavior remains pending deterministic backend tests and later physical-device testing.

## Deviations

- The requested Gemini capability set is not implemented in this stage. This was intentional because Campaign 3A is a feasibility gate and the campaign explicitly requires verification before runtime code.
- The approved OAuth route is Google Cloud ADC rather than a Gemini API-key flow. Google documentation mentions API keys as an alternative for testing, but that alternative is prohibited by the campaign and was not used.
- Live voice will use a distinct native-audio model instead of `gemini-3.7-flash`, because the current official model page explicitly says Live API is not supported for 3.7 Flash.

## Next Recommended Stage

Start Campaign 3B — Gemini voice, Search, and Q&A implementation. Add the configurable ADC-backed provider interfaces, preserve Slate audio lifecycle, implement deterministic mocked STT/reasoning/Search/TTS/session tests, and enforce the exact AI tool allowlist and Outlook dependency boundary before AGY high-scrutiny review.

## Final Stage Verdict

READY
