# Campaign 8 — Gemini 3.5 Live evaluation / voice-stack upgrade

Repository: `Streetjk/slate`
Base: `integration/note4-custom`
Feature branch: `feature/gemini-35-live-evaluation`

## Authority and isolation

This directive governs a separate feature PR. It must not modify, merge, flash, or otherwise interfere with:

- Campaign 6D e-ink refresh optimization;
- `feature/perth-calendar-weather-google-news` / PR #1;
- Orange Pi production deployment unless a later explicit deployment boundary authorizes it.

Codex remains primary controller, sole production writer/integrator, and final adjudicator. Claude Sonnet 5 may be used as a bounded implementation/research worker under the existing temporary worker policy. AGY/Gemini remains the required independent reviewer. No recursive delegation.

Before work:

1. `git fetch origin`.
2. Rebase/fast-forward this feature branch only as needed against its recorded base; do not merge unrelated in-progress feature branches.
3. Read `AGENTS.md`, `CAMPAIGN-INSTRUCTIONS.md`, `CAMPAIGN-STATE.md`, Campaign 3B/4/5 reports, and this directive.
4. Record exact starting SHA and working-tree state.

## User intent

Evaluate whether the NOTE4 voice assistant should move to the current Gemini 3.5 Live family, while preserving every required Slate voice capability and the existing OAuth/ADC security architecture.

Do not interpret “Gemini 3.5 Live” as a license to replace the general conversational model blindly. As of 2026-09-01, Google publishes specialized Gemini 3.5 Live models including:

- `gemini-3.5-transcribe-live` — dedicated real-time speech-to-text, not a conversational spoken agent;
- `gemini-3.5-live-translate-preview` — dedicated speech-to-speech translation; it does not support function calling or Search grounding.

Google currently documents `gemini-3.1-flash-live-preview` as the general-purpose low-latency voice-agent model with Live API, audio output, function calling, Search grounding, and thinking support.

Official sources to re-check at execution time because model availability changes quickly:

- https://ai.google.dev/gemini-api/docs/live-api/live-transcribe
- https://ai.google.dev/gemini-api/docs/models/gemini-3.5-live-translate-preview
- https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview
- https://ai.google.dev/gemini-api/docs/deprecations
- relevant current Vertex AI / Google Cloud Live API documentation

Do not rely only on this directive’s snapshot. Re-verify exact model IDs, supported endpoints, lifecycle, Vertex/ADC availability, regions, and feature matrix before implementation.

## Existing Slate architecture to preserve

The integration branch currently uses backend-controlled Gemini configuration:

- `GEMINI_TEXT_MODEL` default: `gemini-3.7-flash`;
- `GEMINI_LIVE_MODEL` default: `gemini-live-2.5-flash-native-audio`;
- backend `GeminiLiveService` constructs `GoogleGenAI` with `vertexai: true`, `project`, and `location`;
- no Gemini model ID belongs in NOTE4 firmware;
- NOTE4 firmware talks to Slate/Xiaozhi; Slate backend decides which Gemini model is used.

Current Live requirements include:

- low-latency bidirectional voice conversation;
- English and Japanese speech/input/output;
- input and output transcription;
- Q&A;
- Google Search grounding when enabled;
- synchronous function/tool calling;
- Google Calendar proposal generation and the existing physical Confirm/Cancel gate;
- no unconfirmed Google Calendar write;
- reconnect/session lifecycle handling;
- Xiaozhi WebSocket bridge and Opus/PCM handling;
- Outlook/Microsoft data isolation.

## Existing NOTE4 physical AI controls — preserve unless separately justified

The current default interaction must be documented and retained:

- outside Settings/Xiaozhi: double-tap ENTER opens the `XiaozhiScene` / Voice AI mode;
- in Voice AI standby: short ENTER toggles/starts the conversation;
- when a Google Calendar proposal is active: short ENTER confirms it;
- UP/DOWN cancel an active calendar proposal; otherwise they adjust volume;
- double-tap ENTER in Voice AI exits the scene;
- long ENTER opens Settings after stopping the conversation.

Do not change this button mapping merely as part of a model migration.

## Phase G0 — live model capability and endpoint audit

Create a current capability matrix using official Google documentation and, where possible without changing production, live model discovery/probes through the existing authorized account path.

Matrix must include at minimum:

1. current Slate configured Live model actually accepted by the existing Vertex/ADC path;
2. `gemini-3.1-flash-live-preview`;
3. `gemini-3.5-transcribe-live` (and any Vertex-specific alias/version if official docs differ);
4. `gemini-3.5-live-translate-preview`;
5. any newer general-purpose Gemini 3.5 Live agent model officially published by execution time.

For each record:

- exact model ID;
- product surface / endpoint: Gemini Developer API, Vertex AI, Enterprise Agent Platform, or other;
- OAuth/ADC compatibility;
- required region/location;
- audio input;
- audio output;
- input transcription;
- output transcription;
- EN support;
- JP support;
- function calling;
- Google Search grounding;
- system instruction;
- interruption/barge-in;
- session limits;
- reconnect/session-resumption semantics;
- current lifecycle/deprecation status;
- preview/GA status;
- whether it is a general agent, transcription model, or translation model.

### Hard rule

If no Gemini 3.5 Live model supports the full general-agent requirement over Slate’s approved OAuth/ADC path, do NOT downgrade Slate just to put “3.5” in the model string.

## Phase G1 — choose the safest architecture

Use the capability matrix to choose one of these outcomes:

### Outcome A — direct general-agent upgrade

Allowed only if an official Gemini 3.5 Live general conversational model exists and passes all required capability/auth gates.

Then migrate `GEMINI_LIVE_MODEL` to that exact supported model and make only the protocol changes required by current Google Live API semantics.

### Outcome B — general agent on Gemini 3.1 Live + optional Gemini 3.5 transcription

If Gemini 3.5 remains specialized, prefer:

- `gemini-3.1-flash-live-preview` for the actual conversational voice agent, tools, Search grounding, and calendar proposal flow;
- evaluate `gemini-3.5-transcribe-live` only as an optional STT sidecar if it produces a material, measurable transcription gain without adding unacceptable complexity, cost, latency, credentials, or privacy exposure.

Do not duplicate the microphone stream into a second external service without documenting privacy/data flow and proving the benefit.

### Outcome C — no migration yet

If approved ADC/Vertex access or feature parity is unavailable, retain the current working model and publish the evidence. A correct no-change outcome is preferable to a feature regression.

`gemini-3.5-live-translate-preview` must not replace the general conversational model because its documented specialization does not provide Slate’s required function-calling/Search feature set. Use it only if a separate translation feature is later authorized.

## Phase G2 — modernize the Live client only where required

If migrating to `gemini-3.1-flash-live-preview` or a newer supported general Live model, inspect current Google migration guidance carefully.

Known current 3.1 migration considerations to verify at execution time include:

- use `thinkingLevel` rather than legacy thinking-budget configuration when applicable;
- process all parts in each Live server event rather than assuming one part per event;
- `sendClientContent` may be restricted to initial-history seeding on 3.1; use current supported realtime input semantics for live text updates;
- function calling is synchronous rather than async;
- avoid unsupported proactive/affective options.

Do not copy these assumptions blindly; derive changes from current official docs and the installed `@google/genai` version.

## Phase G3 — security and product invariants

Mandatory:

- continue using Google OAuth/ADC / Vertex authorized identity where supported;
- no `GEMINI_API_KEY`;
- no `GOOGLE_API_KEY`;
- no OpenRouter/proxy for product Gemini;
- no manually copied access tokens;
- no secrets in firmware, Git, reports, tests, screenshots, or logs;
- backend remains the model authority;
- NOTE4 never calls Gemini directly;
- Outlook remains read-only;
- Gemini must never receive Microsoft OAuth tokens, Graph credentials, Outlook descriptions, Outlook attendee data, or raw private Outlook payloads;
- Google Calendar remains proposal-only until the physical NOTE4 confirmation action;
- only confirmed proposals can call the existing narrow calendar-write path;
- preserve strict tool schemas and existing safety validation.

If a candidate model requires a static API key or a product surface incompatible with the authorized ADC architecture, treat it as unsupported for production and report that result rather than introducing the credential.

## Phase G4 — deterministic and live validation

Tests must cover at minimum:

- selected model string/config validation;
- backend controls model selection, not firmware;
- audio send/receive event processing;
- multiple parts in one server message where applicable;
- input transcript extraction;
- output transcript extraction;
- interruption/cancellation;
- reconnect behavior;
- error/timeout cleanup;
- EN voice flow;
- JP voice flow;
- Search-grounded Q&A path;
- tool-call handling;
- rejected/unknown tool behavior;
- Google Calendar proposal only;
- Confirm writes exactly once;
- Cancel writes zero times;
- Outlook isolation regression;
- no credential regression.

Where authorized account access exists, run bounded live probes from the backend development environment using the same OAuth/ADC architecture. Never use static fallback credentials merely to make the test pass.

Measure and report where practical:

- connection establishment latency;
- speech end → first transcript latency;
- speech end → first model audio latency;
- interruption response;
- transcription correctness for a small EN/JP fixture set;
- tool-call latency;
- reconnect time.

Do not claim quality gains without comparative evidence.

## Phase G5 — NOTE4 button-path verification

No firmware modification is expected for a backend-only model upgrade.

Mechanically verify the current physical path from source:

`ENTER double-click -> XiaozhiScene -> ENTER short-click -> XiaozhiService -> Slate voice WebSocket -> backend GeminiLiveService -> selected Live model`

Add or retain tests/documentation proving the model ID is not embedded in firmware.

If firmware changes become necessary, use exact ESP-IDF `v5.5.2`, target `esp32s3`, and build deterministic artifacts, but do not flash automatically.

## Validation gates

Before PR readiness:

- relevant unit tests PASS;
- full backend tests PASS;
- shared tests PASS;
- format check PASS;
- lint PASS;
- typecheck PASS;
- frontend build PASS if touched;
- Prisma validation PASS if touched;
- exact ESP-IDF v5.5.2 build PASS if firmware touched;
- `git diff --check` PASS;
- secret-pattern scan PASS;
- no forbidden credential path introduced;
- AGY independent review returned a substantive verdict;
- P0/P1 resolved; normal P2/P3 follow existing adjudication rules.

Maximum 3 review/fix loops. Persistent P1 after 3 loops => BLOCKED.

## Deployment boundary

Implementation, tests, capability probes, and PR review are authorized.

Do NOT automatically:

- merge into `integration/note4-custom`;
- deploy the changed backend to `note4-orangepi`;
- edit production Orange Pi `.env`;
- flash NOTE4 firmware.

Before production deployment, publish:

- chosen architecture/outcome A/B/C;
- exact old and new model IDs;
- exact Google product/endpoint and location;
- OAuth/ADC proof without secrets;
- capability matrix;
- deterministic tests;
- bounded live test results if possible;
- latency comparison;
- AGY verdict;
- known limitations/preview lifecycle risks;
- rollback method (restore previous `GEMINI_LIVE_MODEL` / previous backend image);
- explicit `READY_FOR_GEMINI_LIVE_DEPLOY=true|false`.

Then stop at the production-deployment authorization boundary.

## Report

Create and push:

`docs/campaign-reports/08-GEMINI-35-LIVE.md`

The report must clearly distinguish:

- documented Google capability facts;
- live account/probe evidence;
- implementation changes;
- untested assumptions;
- whether Gemini 3.5 was actually selected or rejected for the general-agent role.

A result that chooses Gemini 3.1 Flash Live for general conversation while optionally evaluating Gemini 3.5 Transcribe Live is an acceptable successful outcome if that is what the official capability evidence requires.
