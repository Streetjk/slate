# Campaign 9 — Gemini runtime/auth architecture directive

Repository: `Streetjk/slate`
Base branch: `integration/note4-custom`
Feature branch: `feature/gemini-runtime-auth-architecture`

Read first:

- `docs/campaign-reports/09-GEMINI-RUNTIME-AUTH-ARCHITECTURE-RESEARCH.md`
- PR #2 / Campaign 8 directives, especially the newer Tenclass routing addendum when available
- current `backend/src/modules/assistant/gemini.*`
- current environment schema and deployment docs

## Authority and isolation

This is a separate backend architecture PR.

Do not modify or flash NOTE4 firmware in Campaign 9.
Do not interfere with Campaign 6D refresh work.
Do not duplicate PR #2's Tenclass/Xiaozhi routing fix.
Do not merge or deploy automatically.

Codex remains controller/integrator. Claude Sonnet 5 may be used for bounded research/implementation. AGY remains independent reviewer. Deterministic tests are mandatory.

## Objective

Determine and implement the smallest secure Gemini runtime abstraction that lets Slate choose the best Google product surface for this personal NOTE4:

1. Vertex/Agent Platform using ADC;
2. Gemini Developer API using OAuth/ADC if supported for the full Live path;
3. current Developer API authorization/auth key only as an explicitly authorized fallback.

The choice must be based on actual capability, quota, privacy, latency, reliability, and cost evidence rather than assumption.

## Phase A0 — current-source audit

Trace the exact current backend Gemini construction and all consumers.

Record:

- current `@google/genai` version;
- `GoogleGenAI` construction options;
- all direct `GeminiConfig` consumers;
- text and Live model usage;
- Search/tool invocation path;
- calendar tool/proposal path;
- test seams/client factories;
- production environment variables;
- current Orange Pi credential assumptions without reading or exposing secret values.

Confirm that model/auth selection remains backend-only.

## Phase A1 — official Google capability/auth audit

Re-check current official docs at execution time:

- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/oauth
- https://ai.google.dev/gemini-api/docs/api-key
- https://ai.google.dev/gemini-api/docs/rate-limits
- current Gemini Live model docs
- current Vertex/Agent Platform Live API docs and pricing

Build a matrix for at least:

### Vertex ADC

- project requirements;
- billing requirement;
- exact supported Live model IDs;
- region/location;
- auth/credential lifecycle;
- function calling;
- Search grounding;
- EN/JP;
- input/output transcription;
- reconnect/session resumption;
- quotas;
- current prices;
- customer-data policy.

### Developer API OAuth/ADC

- exact official auth mechanism;
- whether Node `@google/genai` supports it cleanly for Live;
- whether free-tier quota is applied to OAuth-authenticated calls;
- Live audio model support;
- tools/Search/function calling;
- user-project/quota attribution;
- token refresh lifecycle;
- data-use policy for free vs paid tier.

### Developer API auth key

- current auth-key mechanism and September 2026 standard-key retirement;
- service-account binding;
- API restriction support;
- rate/quota behavior;
- secret rotation/revocation;
- only evaluate as fallback, not default.

Do not rely on forum posts when official docs or a bounded live probe can answer the question.

## Phase A2 — bounded non-production probes

Without changing Orange Pi production configuration, use the existing authorized Google account/project path to run bounded probes where possible.

For each viable surface test:

- model listing/discovery;
- one text request;
- one short Live connection;
- short EN audio interaction;
- short JP audio interaction if authorized;
- input/output transcription;
- Search-grounded prompt;
- function/tool call;
- reconnect/close behavior;
- returned quota/rate-limit headers/errors where available;
- auth refresh behavior.

Never introduce a static key merely to make a probe pass unless the user separately authorizes that fallback.

If Developer API OAuth requires an interactive Google consent step that cannot be completed autonomously, stop only at that minimal human boundary and provide exact official-console/CLI action. Do not ask for secrets or tokens in chat.

## Phase A3 — cost and privacy model

Produce a simple personal-use comparison for at least:

- 5 minutes voice/day;
- 15 minutes voice/day;
- 30 minutes voice/day;
- 60 minutes voice/day.

Use current official pricing and clearly state assumptions about user-speaking vs model-speaking time and audio token rates.

Separate:

- Developer API free tier;
- Developer API paid tier;
- Vertex/Agent Platform.

Include Search-grounding costs/limits where relevant.

Privacy section must explicitly state the current Google policy distinction discovered in research:

- Developer API free tier: content may be used to improve Google products;
- Developer API paid tier: current pricing page says content is not used to improve Google products.

Verify the current Vertex/Agent Platform customer-data policy from official Google Cloud sources rather than inferring it.

Do not recommend free tier solely because it costs $0 if the privacy tradeoff is material for always-on voice usage.

## Phase A4 — implement the minimal runtime factory

Only after A0-A3 identify at least two viable surfaces, introduce the smallest backend abstraction necessary.

Preferred internal shape:

- one Gemini client factory/runtime factory;
- explicit runtime mode;
- existing `GeminiLiveService` and text assistant depend on the same narrow internal client interface;
- no provider-specific branching scattered through voice/tool/calendar services.

Candidate config enum:

- `vertex_adc`
- `developer_oauth`
- `developer_auth_key` only if explicitly authorized

Exact names may change if repository conventions suggest a better shape.

Rules:

- reject invalid/mixed credential configurations at startup;
- do not silently fall back from OAuth/ADC to a key;
- no credential value in logs;
- no Gemini credential/model ID in firmware;
- model IDs remain env/config controlled;
- preserve tool registry and calendar safety semantics;
- preserve Outlook isolation;
- preserve reconnect and timeout behavior;
- preserve current test client injection seam where practical.

If the current Google SDK cannot support a clean common factory without excessive complexity, prefer a small explicit adapter rather than a generalized multi-provider framework.

## Phase A5 — candidate selection

Use this decision order:

### Preferred candidate: Developer API OAuth/ADC

Select only if:

- official/live evidence confirms full Live functionality;
- quota is actually useful for this account/project;
- Search/tool/calendar requirements pass;
- Orange Pi credential refresh is robust;
- latency/reliability are acceptable;
- free-tier privacy tradeoff is explicitly documented.

### Privacy-first candidate: paid Developer API

If the Developer API path is technically best but free-tier data use is undesirable, compare the paid Developer API cost before defaulting to Vertex.

Do not activate billing or paid tier automatically.

### Governance fallback: Vertex ADC

Retain/select Vertex when:

- Developer OAuth lacks required Live functionality;
- free-tier quota cannot be used with OAuth;
- credential refresh is unreliable;
- required model/tools are only available on Vertex;
- stronger IAM/data-governance is worth the operational cost.

### Key fallback

`developer_auth_key` requires a separate explicit human authorization before production use.

## Security invariants

Mandatory:

- NOTE4 never stores Google/Gemini credentials;
- no Gemini credential in Git;
- no access/refresh token in reports;
- no secret values in test snapshots;
- Outlook remains read-only and isolated from Gemini;
- Gemini never receives Microsoft OAuth tokens/raw Outlook private payloads;
- Google Calendar remains proposal-only until physical NOTE4 Confirm;
- Cancel writes zero events;
- no implicit surface/auth fallback;
- no paid service activation without explicit user approval.

## Validation

Required before PR readiness:

- focused runtime/config tests;
- Gemini Live service tests;
- text assistant tests;
- tool registry tests;
- calendar safety tests;
- Outlook isolation regression;
- full backend tests;
- shared tests;
- format/lint/typecheck;
- frontend build only if touched;
- `git diff --check`;
- secret-pattern scan;
- AGY independent review;
- max 3 review/fix loops.

## Interaction with PR #2

PR #2 owns:

- removing Tenclass/Xiaozhi vendor activation from NOTE4 production voice path;
- Slate-owned NOTE4 voice routing;
- Live-model family evaluation.

Campaign 9 owns only:

- Google runtime/product-surface/auth selection;
- quota/cost/privacy comparison;
- minimal backend Gemini client construction abstraction.

If PR #2 changes shared Gemini files first, rebase this branch after PR #2 reaches a stable reviewed commit. Do not overwrite PR #2 logic.

## Deployment boundary

Do not automatically:

- merge;
- modify Orange Pi `.env`;
- create/enable Cloud Billing;
- create a production API/auth key;
- complete a user OAuth consent flow on behalf of the user;
- deploy a new backend image;
- flash NOTE4 firmware.

Before production authorization, publish:

- exact recommended runtime mode;
- why alternatives lost;
- auth mechanism;
- model IDs;
- free/paid quota evidence;
- monthly cost scenarios;
- privacy/data-use tradeoff;
- live probe results;
- test results;
- AGY verdict;
- rollback to existing Vertex path;
- `READY_FOR_GEMINI_RUNTIME_DEPLOY=true|false`.

## Report

Create:

`docs/campaign-reports/09-GEMINI-RUNTIME-AUTH-ARCHITECTURE.md`

Commit/push the feature branch and update the PR. Stop at the production deployment / interactive OAuth / billing boundary, whichever comes first.
