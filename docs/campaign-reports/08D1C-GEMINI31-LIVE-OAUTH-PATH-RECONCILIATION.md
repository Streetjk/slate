# Campaign 8D1C — Gemini 3.1 Flash Live OAuth path reconciliation

Date: 2026-09-02 (Australia/Perth)
Branch: `feature/gemini-35-live-evaluation`
Starting checkpoint: `40b30b180265414bb8954f0cad79f404f762d082`

## Purpose

Resolve the exact Google-supported authentication path for using
`gemini-3.1-flash-live-preview` from the Slate backend through the Gemini Developer
API while preserving the project's OAuth/ADC-only policy, keeping billing unattached,
and keeping Vertex disabled.

Campaign 8D1B already proved:

```text
ADC_TOKEN_PROBE=PASS
ADC_SCOPES=cloud-platform,generative-language.retriever
GENERATIVE_LANGUAGE_API=ENABLED
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
V1BETA_GEMINI31_LIVE=PRESENT
V1BETA_GEMINI31_LIVE_METHOD=bidiGenerateContent
EPHEMERAL_TOKEN_OAUTH=FAIL_HTTP_403
ERROR_REASON=ACCESS_TOKEN_SCOPE_INSUFFICIENT
```

Do not repeat the same failed probe blindly.

## Controller model

Codex remains controller, integrator, validator, and final adjudicator.

For bounded delegated analysis, Luna may be used as worker. Grok 4.6 may be used as
independent reviewer through the existing authenticated Grok route when useful.
Do not use Gemini 3.7 for review/shadow work before the existing blackout expires.
Do not use OpenRouter or add static reviewer credentials.

## Current official-source facts to reconcile

Treat these as starting evidence, but re-check them at execution time:

1. Google's current Gemini OAuth quickstart documents Desktop OAuth + ADC and the
   scopes:
   - `https://www.googleapis.com/auth/cloud-platform`
   - `https://www.googleapis.com/auth/generative-language.retriever`
   It also shows Gemini Developer API REST access with a bearer token and
   `x-goog-user-project`.

2. Google's current Live API overview distinguishes:
   - server-to-server: backend forwards audio/data to the Live API;
   - client-to-server: frontend connects directly, where ephemeral tokens are
     recommended/required to avoid exposing long-lived credentials.

3. Google's current Live WebSocket reference exposes:
   - `GenerativeService.BidiGenerateContent`;
   - constrained Live access through `AuthTokenService.CreateToken` plus
     `BidiGenerateContentConstrained`.

4. Current `@google/genai` documentation presents an API key as the normal Gemini
   Developer API initialization path, while Google's OAuth quickstart separately
   documents OAuth/ADC. This apparent product/SDK mismatch must be resolved rather
   than guessed around.

Authoritative references:
- https://ai.google.dev/gemini-api/docs/oauth
- https://ai.google.dev/gemini-api/docs/live-api
- https://ai.google.dev/api/live
- https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens
- https://googleapis.github.io/python-genai/
- https://googleapis.github.io/js-genai/

## Hard invariants

Do not violate any of these:

```text
GEMINI_API_KEY=PROHIBITED
GOOGLE_API_KEY=PROHIBITED
SERVICE_ACCOUNT_KEY_JSON=PROHIBITED
COPIED_GOOGLE_TOKEN=PROHIBITED
OPENROUTER=PROHIBITED
VERTEX_API_ENABLEMENT=PROHIBITED
BILLING_ATTACHMENT=PROHIBITED
BILLING_CHANGE=PROHIBITED
PRODUCTION_GEMINI_CONFIG_CHANGE=PROHIBITED
PRODUCTION_RESTART_FOR_GEMINI=PROHIBITED
FIRMWARE_FLASH=PROHIBITED
PR2_MERGE=PROHIBITED
APT_AUTOREMOVE=PROHIBITED
NVME_DATA_MIGRATION=PROHIBITED
PRIVATE_NOTE4_DATA_TO_PROBE=PROHIBITED
OUTLOOK_DATA_TO_GEMINI=PROHIBITED
CALENDAR_WRITE=PROHIBITED
```

Do not print, read into reports, hash, copy, upload, or commit:
- ADC JSON contents;
- OAuth client secret contents;
- access tokens;
- refresh tokens;
- browser authorization URLs/codes.

Credential file existence/owner/mode/size may be recorded.

## R0 — Reconcile repository and machine state

Fetch/reconcile origin and confirm the exact PR #2 head before work.

On the Orange Pi, as user `pi`, re-confirm without mutation:

```text
GCLOUD=/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud
PROJECT=slate-note4
GENERATIVE_LANGUAGE_API=ENABLED
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
ADC_TOKEN_PROBE=PASS
SLATE_HEALTH=PASS
MYSQL_HEALTH=PASS
TAILSCALE=PASS
FUNNEL=PASS
NOTE4_POLLING=PASS
```

If billing is attached, Vertex became enabled, credentials are missing, or production
state unexpectedly changed, stop and report. Do not repair by mutation.

## R1 — Determine the actual OAuth authorization contract

Before any new consent, inspect authoritative machine-readable/public metadata where
available.

Try, read-only, to retrieve Google's current Generative Language discovery/service
metadata, including the public Discovery document if available, and inspect only:

- advertised OAuth scope names;
- the auth requirements attached to `AuthTokenService.CreateToken`;
- the auth requirements attached to `GenerativeService.BidiGenerateContent`;
- the auth requirements attached to `BidiGenerateContentConstrained`;
- endpoint/version differences (`v1`, `v1beta`, `v1alpha`) relevant to Live.

Do not dump large remote documents into the campaign report. Record only the exact
relevant method names, scope names, version, and source URL.

Also inspect the installed disposable `google-genai` Python package and the repo's
existing `@google/genai` version to determine whether Developer-API credentials are
actually accepted for:

- model listing;
- auth-token creation;
- Live connect;

Distinguish SDK limitation from API limitation.

Do not infer that a scope is valid merely because a forum post, old issue, third-party
repo, or historical sample mentions it.

### Scope decision rule

The currently consented scopes are:

```text
https://www.googleapis.com/auth/cloud-platform
https://www.googleapis.com/auth/generative-language.retriever
```

A different/additional scope may be proposed only if supported by one of:

1. current official Google documentation;
2. current Google API discovery/service metadata for the relevant method;
3. current official Google SDK source/config that explicitly associates the scope
   with the Gemini Developer API method being tested.

If no authoritative source supports an additional scope, do not re-authenticate and
do not guess `generative-language`, `tuning`, `peruserquota`, or any other scope.

## R2 — Re-evaluate whether ephemeral tokens are appropriate for Slate

Slate is a backend/server proxy. Determine from the current official Live API docs
whether the correct architecture is:

### Path A — server-to-server OAuth Live

```text
NOTE4 -> Slate backend -> Gemini Live BidiGenerateContent
```

using backend OAuth/ADC directly, without an ephemeral token; or

### Path B — constrained/ephemeral-token Live

```text
Slate -> AuthTokenService.CreateToken -> constrained Live endpoint
```

Do not assume Path B merely because it is recommended for browser/mobile
client-to-server applications.

If official docs support Path A for a backend, verify the exact WebSocket endpoint,
API version, authorization header/query convention, setup frame, model resource name,
and subprotocol behavior before another connection attempt.

The earlier raw WebSocket failure is not enough to classify OAuth as unsupported
unless the request matched the exact current official server-to-server protocol.

## R3 — Bounded non-private probes with existing ADC

Without changing scopes or credentials, Codex may run at most:

- one corrected server-to-server OAuth Live connection attempt if R2 establishes a
  currently documented/authoritative route; and
- one corrected `AuthTokenService.CreateToken` request only if R1 shows the existing
  scopes should authorize that method and the prior request was malformed or used the
  wrong version/path/header.

Probe data must be synthetic only, e.g. a minimal text `ping`/`hello`. Do not send:
- microphone audio;
- NOTE4 content;
- names;
- Outlook content;
- Calendar content;
- Search queries;
- tool calls.

Because billing remains unattached, do not attach billing to obtain quota. If Google
returns quota/rate-limit/free-tier denial, record it exactly and stop.

Classify outcomes separately:

```text
GEMINI31_LIVE_MODEL_VISIBLE=
SERVER_TO_SERVER_OAUTH_PATH=
SERVER_TO_SERVER_OAUTH_PROBE=
EPHEMERAL_TOKEN_OAUTH_PATH=
EPHEMERAL_TOKEN_OAUTH_PROBE=
FREE_TIER_ACCEPTANCE=
SDK_LIMITATION=
API_AUTH_LIMITATION=
```

## R4 — Conditional human re-consent boundary

If and only if R1 produces authoritative evidence for a specific additional OAuth
scope required by the relevant Live method:

1. Do not run interactive login yourself.
2. Publish the exact scope string and supporting official source/method.
3. Produce one exact Orange Pi `gcloud auth application-default login` command using
   the existing private Desktop client file:

```text
/mnt/ssd-tmp/slate-tools/gemini-oauth/client_secret.json
```

4. Preserve every currently required legitimate scope unless official evidence says
   otherwise.
5. Stop with:

```text
STATUS=HUMAN_OAUTH_RECONSENT_REQUIRED
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_RUN_EXACT_DOCUMENTED_OAUTH_RECONSENT_COMMAND
```

Do not print any remote-bootstrap URL or browser code in Git/report output.

After the human later confirms successful consent, a subsequent controller run may
verify non-secret token metadata and continue the bounded probe. Do not require the
human to paste tokens or URLs into chat.

## R5 — If no supported OAuth-only Live route exists

If authoritative current Google material shows that Gemini Developer API Live
requires an API key/auth key for this server-side use, or OAuth works only for model
listing/non-Live methods and no supported OAuth Live authorization path is available,
stop cleanly.

Do not weaken project policy to make it work.

Record:

```text
GEMINI31_DEVELOPER_API_OAUTH_LIVE=NOT_CURRENTLY_SUPPORTED_FOR_REQUIRED_PATH
FREE_TIER_LIVE_OAUTH=NOT_VIABLE_UNDER_CURRENT_POLICY
```

Then compare, without changing anything:

- retained Vertex ADC route (paid if enabled/billing attached later);
- Developer API API/auth-key route (architecturally possible but prohibited by current
  project policy);
- any current officially documented Google OAuth-only Live alternative.

No migration decision is authorized in this stage.

## R6 — If OAuth-only Live succeeds

If a bounded synthetic Live session succeeds while:

```text
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
API_KEY_USED=NO
PRIVATE_DATA_SENT=NO
```

then record:

```text
GEMINI31_LIVE_OAUTH=PASS
GEMINI31_LIVE_FREE_TIER=PASS_OBSERVED
```

`PASS_OBSERVED` means only that this project/account accepted the bounded test at the
time of execution. Do not claim an unlimited or guaranteed future free tier.

Then assess—but do not yet implement or deploy—the smallest Slate TypeScript change
needed to use that exact proven route. Preserve backend model authority and all
Calendar/Outlook isolation semantics.

No production `.env` change, image build/deploy, container restart, or firmware flash
is authorized by 8D1C.

## R7 — Validation and durable checkpoint

Before stopping, re-verify:

```text
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
SLATE_HEALTH=PASS
MYSQL_HEALTH=PASS
TAILSCALE=PASS
FUNNEL=PASS
NOTE4_POLLING=PASS
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
```

Update:

- `docs/campaign-reports/08-GEMINI-35-LIVE.md`
- `docs/campaign-reports/CAMPAIGN-STATE.md`

Commit only the report/state changes and any intentionally retained non-secret probe
source if it materially improves reproducibility. Never commit credential material.
Push and verify remote.

Add a concise PR #2 checkpoint comment.

## Required final status

End in exactly one of these states:

```text
PASS_GEMINI31_LIVE_OAUTH_FREE_TIER_OBSERVED
HUMAN_OAUTH_RECONSENT_REQUIRED
NOT_VIABLE_OAUTH_ONLY_LIVE_CURRENT_GOOGLE_SURFACE
BLOCKED_AUTHORITATIVE_AUTH_METADATA_INCONCLUSIVE
HARD_STOP_SECURITY_OR_STATE_DRIFT
```

Do not return control merely because research is tedious. Continue autonomously
through all non-interactive read-only analysis and authorized bounded probes until
one of those states is reached.
