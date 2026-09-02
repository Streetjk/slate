# Campaign 8D1E — Gemini 3.1 Live secure backend integration

Date: 2026-09-02 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
Starting checkpoint: `ed41d1e60640eced6716db6ffd62a2628876486e`

## Objective

Campaign 8D1D proved that `gemini-3.1-flash-live-preview` can complete a synthetic Gemini Developer API Live session for project `slate-note4` while billing is unattached. 8D1E prepares the Slate backend for this authentication/runtime option safely and validates the implementation without production deployment.

This campaign authorizes code, tests, documentation, and one bounded synthetic adapter verification only. It does not authorize production configuration changes, deployment, firmware flash, billing, or PR merge.

## Controller workflow

Codex remains controller, integrator, validator, adjudicator, sole repository writer, and checkpoint publisher.

Use:

`fetch/reconcile remote -> inspect exact current architecture -> implement minimal backend auth abstraction -> deterministic validation -> Luna bounded work if useful -> Codex adjudication -> GLM-5.3-Flash independent review -> bounded correction -> revalidation -> report/state checkpoint -> selective commit -> push -> remote verification`

Continue automatically through authorized steps until the final human boundary or a hard stop.

Routing:
- worker: Luna;
- reviewer: GLM-5.3-Flash using the already configured Mac setup;
- reviewer is read-only and must receive only the exact implementation diff plus non-secret validation evidence;
- no silent reviewer substitution; if GLM-5.3-Flash is unavailable or its configured Mac path cannot be used safely, stop and report the blocker;
- Codex remains sole repository writer and final adjudicator;
- Gemini 3.7 family remains excluded from reviewer/shadow work until `2026-09-06T02:00:00+08:00`.

## Boundaries

Do not:
- deploy or restart the production Slate service;
- change the production model/auth setting;
- expose, print, commit, document, or return the operator credential value;
- embed Gemini credentials in firmware or client-visible configuration;
- place credentials in build artifacts or image layers;
- enable billing;
- enable Vertex API or make Vertex model calls;
- send private NOTE4, Outlook, Calendar, Search, or real voice content during testing;
- write to Outlook;
- bypass physical NOTE4 confirmation for Calendar writes;
- flash firmware;
- merge PR #2;
- expand into Campaign 6D, PR #1, PR #3, Airtable, Immich, storage work, or unrelated campaigns.

## E0 — Reconcile current state

1. Fetch origin and verify PR #2 remains open, draft, and unmerged.
2. Reconcile the current remote head rather than assuming the starting SHA remains current.
3. Read:
   - `docs/campaign-reports/CAMPAIGN-STATE.md`
   - `docs/campaign-reports/08-GEMINI-35-LIVE.md`
   - `docs/campaign-reports/08D1D-GEMINI31-LIVE-API-KEY-FREE-TIER-PROBE.md`
   - this directive, including the current GLM-5.3-Flash reviewer routing.
4. Confirm 8D1D remains the latest accepted proof: exact model auth PASS, Live session PASS, billing unattached, Vertex disabled.
5. If newer remote work materially conflicts with this directive, stop and report the conflict.

## E1 — Inspect before editing

Discover the exact current implementation and document a compact architecture matrix covering:
- current Gemini Live service and SDK usage;
- backend model selection;
- existing ADC/Vertex-compatible path;
- voice-config endpoint;
- backend WebSocket/session lifecycle;
- audio event translation and reconnect behavior;
- Search grounding hooks;
- function/tool calling;
- Calendar proposal/Confirm/Cancel contract;
- Outlook isolation boundary;
- configuration validation;
- container/runtime configuration mechanism;
- logging/error paths that could reveal credentials.

Do not invent file names or abstractions before inspecting the tree. Prefer the smallest change that preserves the current architecture.

## E2 — Recheck current Google documentation and data policy

Using current official Google sources, record the date and URLs for:
- `gemini-3.1-flash-live-preview` Live availability;
- Developer API server authentication requirements;
- current free-tier availability/quota language;
- current free-tier data-use/privacy language;
- audio, Search grounding, and function-calling constraints relevant to NOTE4.

Separate:
1. what Google currently documents;
2. what 8D1D empirically proved for this project;
3. what remains uncertain or can change later.

Do not send real user content merely to investigate policy.

## E3 — Implement a backend-only Developer API auth mode

Add the minimal backend abstraction needed to support the newly approved Developer API authentication mode while preserving the current/default runtime path.

Requirements:
- backend remains sole Gemini authority;
- NOTE4 receives no Gemini credential material;
- existing/default auth behavior remains unchanged unless an explicit backend configuration selects the new mode;
- model selection remains backend-controlled;
- target the exact `gemini-3.1-flash-live-preview` model unless current official metadata proves it has changed; do not silently substitute another model;
- use the existing project configuration conventions;
- prefer a runtime secret-file reference rather than putting a credential value into repository configuration;
- credential contents exist only in backend process memory when the mode is used;
- no credential value in logs, errors, debug output, health/config endpoints, WebSocket messages, tests, or reports;
- normal automated tests use synthetic credentials/mocks only;
- fail closed on missing, empty, whitespace-only, invalid, or unreadable credential configuration;
- do not hard-code one host-specific secret path as the only supported location;
- preserve the existing auth path for rollback and compatibility.

Use the installed JS SDK if it already supports this cleanly. Do not upgrade dependencies unless required by the current API contract; if an upgrade is necessary, justify it and run full regressions.

## E4 — Preserve security and product semantics

The new auth mode must preserve:
- Outlook read-only isolation; no Outlook payload is sent to Gemini;
- Calendar proposal-only behavior until physical NOTE4 confirmation;
- Cancel causes zero Calendar writes;
- strict deterministic tool argument validation before execution;
- backend-controlled Search/tool enablement;
- device/client isolation from Gemini credentials;
- existing reconnect/session cleanup semantics;
- no credential disclosure through errors, logs, or client-visible configuration.

Add negative tests wherever current coverage is insufficient.

## E5 — Prepare deployment shape without deploying

Prepare code/config/documentation so a later deployment can supply the protected production credential as a read-only runtime secret, without embedding it in the repository or image.

The design must allow:
- image build without credentials;
- runtime-only credential injection;
- straightforward rollback to the current production auth/model path;
- no changes to the running Orange Pi service in this campaign.

Repository examples may show only placeholder secret locations, never credential values.

## E6 — Deterministic validation

At minimum test:
- auth-mode selection;
- default/current auth path unchanged;
- new mode requires explicit selection;
- valid synthetic credential loading;
- missing credential -> fail closed;
- empty credential -> fail closed;
- whitespace-only credential -> fail closed;
- unreadable credential -> fail closed where practical;
- errors/logs do not include credential contents;
- exact model selection;
- WebSocket/Live session configuration mapping;
- reconnect and cleanup behavior;
- audio/session event translation;
- Search/tool configuration remains controlled;
- function/tool input validation;
- Calendar proposal/Confirm/Cancel semantics unchanged;
- Outlook isolation unchanged;
- voice-config/client responses contain no credential material.

Run the complete relevant backend/shared test suites plus format, lint, typecheck, frontend/build checks normally required by PR #2.

Run a repository/changed-files secret scan without printing any real credential value.

## E7 — One bounded synthetic adapter verification

Only after deterministic tests pass, Codex may perform at most one synthetic Live verification through the newly implemented backend adapter without deploying it as the production service.

Conditions:
- use the existing protected operator credential only through the runtime secret mechanism;
- do not print or log it;
- synthetic input only, such as `Say exactly TEST.`;
- no private NOTE4, Outlook, Calendar, Search, or real audio content;
- generated audio is not retained;
- confirm billing remains unattached before the call;
- confirm Vertex remains disabled;
- if free-tier/quota rejects the call, record only the non-secret error classification and stop; do not enable billing.

This verifies the Slate adapter rather than repeating only the standalone SDK probe.

## E8 — Independent review

Give GLM-5.3-Flash, through the already configured Mac reviewer path, the exact implementation diff and non-secret validation evidence for read-only review.

Do not send the Gemini API key, secret-file contents, OAuth tokens, private NOTE4 data, Outlook data, Calendar content, or other credentials to the reviewer.

Review specifically:
- credential handling and possible leakage;
- auth-mode isolation;
- accidental production-default changes;
- data-policy documentation;
- NOTE4 credential isolation;
- Outlook isolation;
- Calendar confirmation semantics;
- WebSocket/session lifecycle;
- rollback viability;
- test sufficiency.

Codex adjudicates every finding. Use Luna only for bounded correction when useful. Re-run affected and full relevant tests after corrections. Stop on unresolved P0 or persistent P1.

If GLM-5.3-Flash cannot be reached through the configured Mac setup, do not substitute Grok, Gemini, Claude, or another reviewer silently. Stop with `GLM53_REVIEW_BLOCKED` and the non-secret reason.

## E9 — Durable checkpoint

Update:
- `docs/campaign-reports/08-GEMINI-35-LIVE.md`
- `docs/campaign-reports/CAMPAIGN-STATE.md`

Record at minimum:

```text
CAMPAIGN=8D1E
STATUS=<...>
START_SHA=<...>
END_SHA=<...>
DEVELOPER_API_BACKEND_AUTH_MODE_IMPLEMENTED=<YES/NO>
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
GEMINI31_LIVE_ADAPTER_SYNTHETIC_PROBE=<PASS/FAIL/NOT_RUN>
PRIVATE_NOTE4_DATA_SENT=NO
OUTLOOK_DATA_SENT_TO_GEMINI=NO
CALENDAR_WRITE=NO
FULL_BACKEND_TESTS=<...>
SHARED_TESTS=<...>
FORMAT=<...>
LINT=<...>
TYPECHECK=<...>
SECRET_SCAN=<...>
GLM53_FLASH_REVIEW=<PASS/REVISE/BLOCKED>
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_PRODUCTION_DEPLOYMENT_REVIEW=<YES/NO>
HUMAN_ACTION_REQUIRED=<YES/NO>
NEXT_ACTION=<...>
```

Commit only intended files, push the branch, verify remote SHA, and post a concise PR #2 checkpoint comment containing no credential material.

## Expected successful verdict

If implementation, deterministic tests, secret scan, bounded synthetic adapter probe, and GLM-5.3-Flash review all pass:

```text
STATUS=READY_FOR_HUMAN_PRODUCTION_API_KEY_AND_DATA_POLICY_DECISION
READY_FOR_PRODUCTION_DEPLOYMENT_REVIEW=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_FREE_TIER_DATA_POLICY_AND_AUTHORIZE_OR_REJECT_PRODUCTION_RUNTIME_SECRET_AND_DEPLOYMENT
```

Stop there. Do not deploy automatically.

The later human decision must explicitly cover both:
1. acceptance or rejection of the then-current Gemini free-tier data-use/privacy policy for real NOTE4 voice/user content; and
2. authorization or rejection of production runtime use of the protected credential and switch to Gemini 3.1 Flash Live.

## Hard stops

Stop immediately for:
- any credential exposure or suspected exposure;
- requirement to embed credentials in Git, image layers, firmware, client-visible config, logs, or command arguments;
- undocumented authentication workaround;
- billing or paid-tier requirement;
- Vertex enablement requirement;
- private user-data exposure during validation;
- Outlook write capability;
- unconfirmed Calendar write path;
- P0;
- persistent P1 after bounded correction;
- unsafe repository state;
- destructive system/storage action;
- firmware flash requirement;
- PR merge requirement.

Do not infer authorization for production deployment, private-data submission, firmware flash, billing, or PR merge from this directive.