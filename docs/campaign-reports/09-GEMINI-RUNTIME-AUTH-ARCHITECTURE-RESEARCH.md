# Campaign 9 — Gemini runtime/auth architecture research

Date: 2026-09-02
Repository: `Streetjk/slate`
Base: `integration/note4-custom` @ `2d4a2a9e9a380c591c2ac7f0f3120f1f7939b65d`

## Question

For a personal NOTE4 backed by Slate on an Orange Pi, should Gemini voice/text run through Google Vertex AI / Agent Platform, or through the Gemini Developer API / Google AI Studio surface?

The goal is the smallest secure architecture that preserves Live voice, EN/JP, Search grounding, function calling, calendar confirmation semantics, and backend-only credentials while keeping cost predictable.

## Current Slate position

Slate currently constructs Gemini via `@google/genai` with:

- `vertexai: true`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_LOCATION`
- `GEMINI_TEXT_MODEL`
- `GEMINI_LIVE_MODEL`

The NOTE4 firmware does not contain Gemini credentials or model IDs. That separation is correct and must remain.

PR #2 / Campaign 8 is independently fixing the discovered legacy Tenclass/Xiaozhi activation path and evaluating current Live models. Campaign 9 must not duplicate or undo that work.

## Research findings — official Google documentation

### 1. Gemini Developer API has a real free tier

Google's current Developer API pricing page explicitly offers free-tier input/output for supported models.

For `gemini-3.1-flash-live-preview`, current published pricing says:

- free-tier input: free of charge;
- free-tier output: free of charge;
- Google Search grounding: supported on free tier;
- paid audio input: about USD $0.005/min;
- paid audio output: about USD $0.018/min;
- free-tier data may be used to improve Google products;
- paid-tier data is not used to improve Google products.

The user's current AI Studio quota UI also shows generous personal-use Live quotas (including Unlimited RPD for several Live models), but those account-specific quota screenshots must be treated as evidence to verify at execution time rather than hard-coded product guarantees.

Official source:

- https://ai.google.dev/gemini-api/docs/pricing

### 2. The Developer API does not strictly require an API key

Google now documents OAuth authentication for the Gemini Developer API. The official OAuth quickstart uses a Google Cloud project, enables the Generative Language API, configures OAuth, and establishes Application Default Credentials (ADC). The resulting bearer token is sent to `generativelanguage.googleapis.com` with `x-goog-user-project`.

This is strategically important for Slate because it means the project may be able to use the Developer API without embedding a long-lived `GEMINI_API_KEY` in the Orange Pi deployment.

Official source:

- https://ai.google.dev/gemini-api/docs/oauth

Do not assume the exact Node.js `@google/genai` production path until tested. Codex must verify current SDK support and whether Live sessions, tools, Search grounding, quota accounting, and reconnect behavior work over Developer API OAuth/ADC.

### 3. Google is changing Gemini API key security

Google documents two Gemini API key types:

- standard API keys;
- authorization/auth keys bound to a Google Cloud service account.

New keys created in AI Studio are auth keys, and Google states that standard keys are being retired/rejected in September 2026. If a key-based fallback is ever authorized, Slate must use the current auth-key design, never an unrestricted legacy key, and the key must remain server-side on the Orange Pi only.

Official source:

- https://ai.google.dev/gemini-api/docs/api-key

### 4. Vertex AI / Agent Platform supports Gemini Live with ADC

Google's current Vertex/Agent Platform samples continue to support the Google Gen AI SDK with ADC, including Live API examples. The pattern is the one Slate already follows: project + location + `vertexai: true`.

Official sources:

- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/samples/googlegenaisdk-live-with-txt
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/samples/googlegenaisdk-textgen-with-txt

### 5. Vertex is the stronger cloud/IAM surface, but is heavier for this personal deployment

Vertex / Agent Platform is designed around Google Cloud IAM, project/location control, enterprise governance, and normal cloud billing. It is a good fit where service identity, auditability, enterprise controls, or data-governance requirements justify the extra setup.

For a single personal NOTE4 on an Orange Pi, it may be unnecessarily heavy if the Developer API supplies the same required Live capabilities through OAuth/ADC at a useful free or low-cost tier.

### 6. Privacy is the main tradeoff with the Developer API free tier

Google's current pricing documentation explicitly marks free-tier Developer API data as eligible for use to improve Google products, while paid-tier data is not used for that purpose.

That is a more important architectural consideration than a few dollars of monthly cost for this device because NOTE4 voice input can include personal conversation and calendar requests.

Current Slate privacy constraints reduce exposure and must remain:

- Outlook data is read-only;
- Gemini receives no Microsoft access token;
- Gemini receives no raw Outlook descriptions/attendee payloads;
- Google Calendar writes require the physical NOTE4 Confirm path;
- no Gemini credential exists in firmware.

## Candidate architectures

### A — Vertex ADC (current Slate design)

`NOTE4 -> Slate backend -> @google/genai (vertexai=true, ADC) -> Vertex/Agent Platform Gemini`

Pros:

- already implemented;
- no static Gemini key;
- IAM/service identity model;
- strong cloud governance;
- official Live API support.

Cons:

- Cloud project/billing setup;
- likely no direct benefit from the user's AI Studio free-tier quota;
- heavier operational footprint for a personal Orange Pi.

### B — Gemini Developer API with OAuth/ADC — preferred experiment

`NOTE4 -> Slate backend -> @google/genai / Generative Language API with OAuth/ADC -> Gemini Developer API`

Pros:

- potentially uses the user's Developer API free-tier quotas;
- official Google OAuth/ADC authentication exists;
- no long-lived Gemini API key required if current Node/Live path is supported;
- same backend-only credential boundary;
- smaller hobby/personal deployment footprint.

Cons / unknowns to prove:

- exact `@google/genai` Node.js OAuth behavior for Live;
- whether account free-tier quota is applied to OAuth-authenticated calls;
- whether all required Live tools/Search/function-calling features work identically;
- free-tier data-use/privacy tradeoff;
- refresh-token/service credential lifecycle on an always-on Orange Pi.

### C — Gemini Developer API paid tier with OAuth or current auth-key mechanism

Same logical surface as B, but billing is enabled.

Pros:

- higher limits;
- Google currently states paid-tier content is not used to improve products;
- potentially simpler and cheaper than Vertex while preserving privacy.

Cons:

- billed usage;
- exact production OAuth/auth-key mechanism must be chosen carefully.

### D — Developer API auth key fallback

Allowed only if B cannot support reliable server-side Live OAuth and the user explicitly authorizes a credential change.

Requirements:

- current authorization/auth key only;
- bind to dedicated service account/project;
- restrict to Gemini / Generative Language API;
- store only on Orange Pi `.env`/secret store with mode 600;
- never firmware, Git, reports, logs, screenshots, or Web UI;
- rotate/revoke path documented.

This is not the preferred first choice because OAuth/ADC may avoid the static secret entirely.

## Recommended design direction

Do not hard-code one Google surface throughout the assistant code. Introduce one narrow backend Gemini client/runtime factory with a small explicit runtime mode.

Suggested modes:

- `vertex_adc`
- `developer_oauth`
- `developer_auth_key` only as an explicitly authorized fallback

The rest of Slate (`GeminiLiveService`, text assistant, tool registry, calendar proposal logic, voice session bridge) should consume the same internal client interface regardless of Google surface.

Do not add a provider abstraction larger than necessary: both surfaces use the Google Gen AI SDK and the same Gemini semantics. The abstraction should isolate only construction/auth/endpoint/model-capability differences.

Suggested configuration shape, subject to Codex source/schema review:

- `GEMINI_RUNTIME=vertex_adc|developer_oauth|developer_auth_key`
- `GOOGLE_CLOUD_PROJECT` when required
- `GOOGLE_CLOUD_LOCATION` for Vertex when required
- `GEMINI_TEXT_MODEL`
- `GEMINI_LIVE_MODEL`
- a credential reference/path only if the selected runtime actually requires one

Avoid simultaneously accepting multiple dormant credential types because that increases secret-management ambiguity.

## Preliminary recommendation

For this personal NOTE4, test **Developer API + OAuth/ADC first** once PR #2 establishes the Slate-owned voice route.

Choose it only if all of these pass:

1. Live audio dialogue works through the Developer API with OAuth/ADC;
2. the user's free-tier quota is actually applied;
3. EN/JP audio, Search grounding, function calling, calendar proposal flow, interruption and reconnect all remain functional;
4. latency is equal or better than Vertex;
5. credential refresh is robust on the Orange Pi;
6. the user accepts the documented free-tier data-use terms.

If privacy outweighs free usage, compare **paid Developer API** against Vertex rather than automatically choosing Vertex. Current published paid Live prices are low enough that ordinary personal use may be inexpensive, but Codex must measure actual session token/audio usage before estimating monthly cost.

Retain Vertex ADC as the high-governance fallback and as a rollback path until Developer API operation is physically proven.

## Explicit non-goals

Campaign 9 does not:

- pair the NOTE4 with Tenclass/Xiaozhi;
- put Google credentials in firmware;
- weaken Outlook isolation;
- bypass Google Calendar physical confirmation;
- automatically create a billing account;
- enable paid usage without user authorization;
- deploy to production automatically;
- change the e-ink refresh campaign.
