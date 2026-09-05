# Campaign 8D1B — Gemini 3.1 Flash Live OAuth / free-tier setup

Date: 2026-09-02 (Australia/Perth)
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Objective

Before attaching billing to Vertex AI, prove whether Slate can use the **Gemini Developer API** with **Google OAuth / Application Default Credentials (ADC)** and the free-tier `gemini-3.1-flash-live-preview` model.

This stage supersedes the immediate 8D1A Vertex billing/API decision. Keep the existing Vertex route as a fallback architecture, but do not enable Vertex or attach billing in this stage.

Google's current official documentation establishes all of the following:

- Gemini Developer API supports OAuth and ADC for testing: https://ai.google.dev/gemini-api/docs/oauth
- the project must enable the Google Generative Language API;
- the documented ADC login for a desktop OAuth client uses:
  `gcloud auth application-default login --client-id-file=client_secret.json --scopes='https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/generative-language.retriever'`;
- the documented OAuth REST verification uses a Bearer ADC token plus `x-goog-user-project`;
- `gemini-3.1-flash-live-preview` is the current Gemini 3.1 low-latency audio-to-audio Live model and the documented migration target from `gemini-2.5-flash-native-audio-preview-12-2025`: https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview
- the current Gemini Developer API pricing page lists Gemini 3.1 Flash Live Preview input and output as free of charge on the Free Tier: https://ai.google.dev/gemini-api/docs/pricing
- Free Tier content may be used to improve Google's products. Do not send personal/private NOTE4 content in this setup campaign.

## Controller / reviewer policy

Codex remains controller, adjudicator, validator and sole repository writer.

Current temporary worker/reviewer policy remains binding:

- bounded worker: Luna when useful;
- independent reviewer: Grok 4.6 via the existing authenticated Grok CLI/session when a review is materially required;
- do not call Gemini 3.7 Flash for review, shadow review, shadow test or retry before `2026-09-06T02:00:00+08:00`;
- do not use OpenRouter or introduce static reviewer credentials.

No worker is required merely to run the setup/readiness steps.

## Hard invariants

- **NO Vertex billing attachment.**
- **NO Cloud Billing activation/change.**
- **NO `aiplatform.googleapis.com` enablement.**
- **NO `GEMINI_API_KEY`.**
- **NO `GOOGLE_API_KEY`.**
- **NO Gemini authorization/static API key.**
- **NO service-account key JSON.**
- **NO copied Google access/refresh tokens.**
- Never print OAuth client JSON contents, access tokens, refresh tokens, ADC contents, authorization codes, verification URLs containing sensitive state, or secrets into Git/chat/report/log output.
- OAuth client JSON must never enter Git.
- NOTE4 must never receive Google credentials.
- Do not modify production Slate Gemini configuration in this stage.
- Do not restart/recreate production Slate for Gemini changes in this stage.
- Do not flash firmware.
- Do not merge PR #2.
- Do not run `apt autoremove`.
- Do not migrate Slate/MySQL or alter NVMe/Deluge paths.
- Campaign 6D remains isolated.

## Approved mutation in this stage

The user explicitly requested setup of Gemini 3.1 Flash Live with OAuth.

Codex is therefore authorized to enable **only**:

```text
generativelanguage.googleapis.com
```

on project:

```text
slate-note4
```

This authorization does **not** extend to Vertex AI, billing, IAM changes, additional APIs, production configuration, deployment or firmware.

## Known starting point

8D1A established:

```text
GCLOUD=PASS
GCLOUD_VERSION=583.0.0
GOOGLE_CLOUD_PROJECT=slate-note4
ADC=PASS
ADC_QUOTA_PROJECT=slate-note4
VERTEX_API_ENABLED=NO
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_IAM=SUFFICIENT_roles/owner
SLATE_HEALTH=PASS
MYSQL_HEALTH=PASS
TAILSCALE=PASS
PUBLIC_HEALTH=PASS
NOTE4_POLLING=PASS
VERTEX_MODEL_CALLS=0
```

Official gcloud binary on Orange Pi:

```text
/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud
```

Do not repeat generic gcloud installation or the previous Vertex ADC setup.

---

# Phase O0 — reconcile and safety baseline

1. Fetch/reconcile `origin` and verify exact branch/HEAD.
2. Read:
   - this directive;
   - `08D1A-GCLOUD-ABSOLUTE-PATH-READINESS-RECHECK.md`;
   - `08E-TEMPORARY-LUNA-WORKER-GROK46-REVIEWER.md`;
   - current `08-GEMINI-35-LIVE.md` and `CAMPAIGN-STATE.md`.
3. Recheck, without exposing credential contents:
   - project is `slate-note4`;
   - billing remains disabled/unattached;
   - `aiplatform.googleapis.com` remains disabled;
   - ADC token probe succeeds;
   - Slate/MySQL/Tailscale/Funnel/NOTE4 polling remain healthy;
   - root free space remains safe.
4. If billing is unexpectedly attached or Vertex unexpectedly enabled, stop and report the discrepancy before proceeding.

Checkpoint fields:

```text
OAUTH_SETUP_BASELINE=PASS|FAIL
PROJECT=slate-note4|OTHER
BILLING_ENABLED=NO|YES
VERTEX_API_ENABLED=NO|YES
ADC_EXISTING=PASS|FAIL
SLATE_HEALTH=PASS|FAIL
MYSQL_HEALTH=PASS|FAIL
NOTE4_POLLING=PASS|FAIL
```

---

# Phase O1 — enable only the Generative Language API

Use the absolute gcloud binary as user `pi`:

```bash
GCLOUD=/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud
"$GCLOUD" services enable generativelanguage.googleapis.com --project=slate-note4
```

Immediately verify:

```bash
"$GCLOUD" services list --enabled \
  --project=slate-note4 \
  --filter='config.name:generativelanguage.googleapis.com' \
  --format='value(config.name)'
```

Then recheck that:

- billing is still disabled/unattached;
- `aiplatform.googleapis.com` is still disabled;
- no other API was intentionally enabled by this campaign.

Do not infer that API enablement proves model quota or Live access.

Checkpoint:

```text
GENERATIVE_LANGUAGE_API=ENABLED|FAIL
BILLING_AFTER_ENABLE=DISABLED|UNEXPECTED_ENABLED
VERTEX_API_AFTER_ENABLE=DISABLED|UNEXPECTED_ENABLED
```

Hard stop on unexpected billing/Vertex change.

---

# Phase O2 — secure OAuth-client location and human Console boundary

Create only a dedicated private directory on the existing NVMe tools area:

```bash
install -d -m 0700 /mnt/ssd-tmp/slate-tools/gemini-oauth
```

Preferred client path:

```text
/mnt/ssd-tmp/slate-tools/gemini-oauth/client_secret.json
```

Check **metadata only** for that exact path. Do not print/read the JSON contents.

If the file is absent, STOP at a human boundary and give the operator these exact Google Console steps:

1. Select project `slate-note4`.
2. Google Auth Platform → Overview.
3. Configure app if not already configured; Audience = External.
4. Add the operator's Google account as a Test user.
5. Google Auth Platform → Clients → Create Client.
6. Application type = Desktop app.
7. Suggested name: `Slate NOTE4 Gemini OAuth`.
8. Download the OAuth client JSON.
9. Transfer it directly to the Orange Pi as:
   `/mnt/ssd-tmp/slate-tools/gemini-oauth/client_secret.json`.
10. On the Orange Pi run:

```bash
chmod 600 /mnt/ssd-tmp/slate-tools/gemini-oauth/client_secret.json
```

The user must not paste the JSON, client secret, auth URL, or authorization code into chat/Git.

At this boundary record only:

```text
OAUTH_DESKTOP_CLIENT=HUMAN_REQUIRED
CLIENT_SECRET_PATH=/mnt/ssd-tmp/slate-tools/gemini-oauth/client_secret.json
```

and return control to the user.

If the file already exists and metadata shows owner `pi`, group `pi`, mode `600`, continue. Otherwise stop with the minimal permission/ownership correction; do not inspect contents.

---

# Phase O3 — Gemini-scoped ADC human login boundary

Once the Desktop OAuth client JSON exists securely, do not invent another auth flow.

The official Google Gemini OAuth quickstart requires the Desktop client and the following scopes:

```text
https://www.googleapis.com/auth/cloud-platform
https://www.googleapis.com/auth/generative-language.retriever
```

Because browser consent is a human boundary, Codex should provide the exact command for the operator to run on the Orange Pi rather than trying to capture/relay the authorization code through Git or logs:

```bash
GCLOUD=/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud

"$GCLOUD" auth application-default login \
  --no-browser \
  --client-id-file=/mnt/ssd-tmp/slate-tools/gemini-oauth/client_secret.json \
  --scopes='https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/generative-language.retriever'
```

The operator completes the browser flow on a trusted device and enters any verification result **only into the Orange Pi terminal**.

After successful login, the operator may run if needed:

```bash
"$GCLOUD" auth application-default set-quota-project slate-note4
```

Then Codex resumes.

Do not back up/copy the old ADC token file. Do not print its contents. The cloud-platform scope is intentionally retained so this OAuth ADC does not unnecessarily remove the existing Cloud scope while adding the documented Gemini scope.

---

# Phase O4 — non-secret OAuth verification

After the human reports the login is complete, perform only non-secret verification:

```bash
GCLOUD=/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud
"$GCLOUD" auth application-default print-access-token >/dev/null
```

Expected:

```text
GEMINI_ADC=PASS
```

Verify quota project without dumping credential JSON. Prefer supported gcloud metadata/behavior and the successful authorized request below rather than reading the credential file contents.

Use the official OAuth REST pattern to list models, ensuring the token itself is never printed:

```bash
ACCESS_TOKEN="$("$GCLOUD" auth application-default print-access-token)"
trap 'unset ACCESS_TOKEN' EXIT

curl -fsS https://generativelanguage.googleapis.com/v1/models \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H 'x-goog-user-project: slate-note4' \
  > /tmp/slate-gemini-models.json

unset ACCESS_TOKEN
```

Inspect only model names/capability metadata needed for the test; do not retain any credential material.

Check exact model presence:

```text
gemini-3.1-flash-live-preview
```

Delete the temporary model-list response after extracting the non-secret result.

Checkpoint:

```text
GEMINI_ADC=PASS|FAIL
GENERATIVE_LANGUAGE_REST_OAUTH=PASS|FAIL
GEMINI31_LIVE_MODEL_VISIBLE=YES|NO
```

If REST OAuth fails, stop. Do not fall back to an API key.

---

# Phase O5 — prove Live API OAuth/free-tier access with no private data

This phase is a **single bounded synthetic probe** only. No NOTE4 audio, Calendar data, Outlook data, names, personal prompts, or other private content may be sent.

Important implementation constraint:

- Google's OAuth quickstart explicitly documents ADC for the Gemini Developer API.
- Google's Live examples document `gemini-3.1-flash-live-preview` through client libraries.
- The installed Slate TypeScript SDK (`@google/genai` 2.20.0) must **not** be assumed to support Gemini Developer API OAuth simply because Vertex ADC works. Its current JS documentation commonly initializes Developer API with an API key.

Therefore perform the probe independently of production Slate first.

## O5A — preferred official client-library probe

Prefer a disposable Python environment under NVMe, not root, using the current official `google-genai` package. Do not use sudo and do not pollute the system Python.

Example location:

```text
/mnt/ssd-tmp/slate-tools/gemini-oauth/probe-venv
```

Create a minimal script that:

1. constructs `genai.Client()` using ADC;
2. connects to `gemini-3.1-flash-live-preview`;
3. uses `response_modalities=["AUDIO"]`;
4. sends one synthetic text turn such as `Reply only with the word READY.`;
5. enables output transcription if supported so success can be proven without storing/playing audio;
6. waits for setup + one completed model turn with a strict short timeout;
7. records only PASS/failure class, model ID, and non-sensitive transcript metadata;
8. closes immediately.

Do not enable Google Search grounding in this probe.
Do not use tools/function calls in this probe.
Do not send audio input.
Do not retain generated audio.

The expected model is exactly:

```text
gemini-3.1-flash-live-preview
```

For Gemini 3.1 use the 3.1 protocol semantics:

- `thinkingLevel` rather than the old 2.5 `thinkingBudget` if thinking config is specified;
- process all content parts in a server event because 3.1 may return multiple parts in one event.

Use `minimal` thinking or omit the setting for the first latency probe.

## O5B — fallback investigation, not credential fallback

If the Python client cannot establish Live through ADC, diagnose the exact reason. It is permissible to inspect current official docs and installed SDK behavior.

Do **not** switch to an API key, auth key, service account key, OpenRouter, copied token, or Vertex.

If current official documentation does not clearly support OAuth for the specific Live transport even though REST OAuth works, record:

```text
GEMINI_DEVELOPER_OAUTH_REST=PASS
GEMINI31_LIVE_OAUTH=UNPROVEN_TRANSPORT_AUTH_LIMITATION
```

and stop rather than inventing an undocumented production authentication scheme.

## Free-tier safety

Before the Live probe, re-confirm:

```text
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
```

If any becomes YES unexpectedly, stop.

A quota-denied result such as `RESOURCE_EXHAUSTED`, zero free quota, model-not-available, or equivalent is a valid campaign result. Do not attach billing to overcome it.

Record:

```text
GEMINI31_LIVE_OAUTH=PASS|FAIL|QUOTA_BLOCKED|UNPROVEN
GEMINI31_LIVE_FREE_TIER=PASS_OBSERVED|QUOTA_BLOCKED|NOT_PROVEN
LIVE_PROBE_PROMPTS=1
LIVE_PROBE_PRIVATE_DATA=NO
LIVE_AUDIO_RETAINED=NO
BILLING_ENABLED=NO
VERTEX_API_ENABLED=NO
```

---

# Phase O6 — Slate TypeScript compatibility assessment only

Only if the standalone Gemini 3.1 OAuth Live probe passes, inspect the repository and installed `@google/genai` 2.20.0 implementation/docs to determine the cleanest **OAuth-only Developer API** integration for Slate.

Do not alter production configuration or deploy in this stage.

Determine one of:

### A — installed `@google/genai` supports Developer API OAuth/ADC directly

Prove the exact supported constructor/options and a deterministic unit test. Do not guess based on Vertex behavior.

### B — installed JS SDK does not expose supported Developer API OAuth but official OAuth REST/Live transport can be used safely

Design the smallest server-side OAuth transport using normal ADC refresh semantics. No access token may be persisted in `.env`, DB, Git or NOTE4. Any access token must be obtained/refreshable at runtime through approved Google auth libraries and remain memory-only.

### C — official supported Live OAuth path is not available for the backend runtime

Stop and retain Vertex as fallback; do not weaken auth policy.

The assessment must explicitly preserve:

- NOTE4 → Slate authenticated WebSocket ownership;
- backend model authority;
- EN/JP voice;
- input/output transcription;
- function calling;
- Google Search grounding capability for a later approved test;
- Calendar proposal-only semantics and physical Confirm/Cancel;
- Outlook isolation;
- existing reconnect/session cleanup behavior;
- no Google credentials on NOTE4.

Do not implement/deploy the chosen production transport until a later explicit directive after human review of this result.

---

# Phase O7 — deterministic validation and durable checkpoint

After each non-human phase, keep Slate production healthy.

At the end:

1. update `docs/campaign-reports/08-GEMINI-35-LIVE.md` with a concise 8D1B section;
2. update `docs/campaign-reports/CAMPAIGN-STATE.md`;
3. run `git diff --check`;
4. secret-scan the changed tracked files for OAuth client IDs/secrets, access/refresh tokens, API keys and credential JSON;
5. commit only intended report/state changes;
6. push `feature/gemini-35-live-evaluation`;
7. verify the remote commit;
8. add a concise PR #2 checkpoint comment.

No OAuth client JSON or ADC material is ever a repository change.

Final matrix must include:

```text
CAMPAIGN=8D1B
PROJECT=slate-note4
GENERATIVE_LANGUAGE_API=ENABLED|FAIL
VERTEX_API_ENABLED=NO
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
OAUTH_DESKTOP_CLIENT=READY|HUMAN_REQUIRED|FAIL
GEMINI_ADC=PASS|PENDING_HUMAN|FAIL
GENERATIVE_LANGUAGE_REST_OAUTH=PASS|NOT_RUN|FAIL
GEMINI31_LIVE_MODEL_VISIBLE=YES|NO|NOT_RUN
GEMINI31_LIVE_OAUTH=PASS|FAIL|QUOTA_BLOCKED|UNPROVEN|NOT_RUN
GEMINI31_LIVE_FREE_TIER=PASS_OBSERVED|QUOTA_BLOCKED|NOT_PROVEN|NOT_RUN
SLATE_JS_OAUTH_PATH=A_SDK_DIRECT|B_RUNTIME_OAUTH_TRANSPORT|C_UNSUPPORTED|NOT_ASSESSED
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
PRODUCTION_RESTARTED_FOR_GEMINI=NO
NOTE4_PRIVATE_DATA_SENT_TO_FREE_TIER=NO
GOOGLE_SEARCH_LIVE_PROBE=NOT_RUN
CALENDAR_LIVE_PROBE=NOT_RUN
OUTLOOK_DATA_SENT_TO_GEMINI=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
APT_AUTOREMOVE_EXECUTED=NO
NVME_DATA_MIGRATION=NO
```

## Human boundaries

Return control only for one of these genuine boundaries:

1. Desktop OAuth client must be created/downloaded in Google Console.
2. Browser OAuth consent/verification must be completed by the user.
3. Free-tier/privacy decision before sending real NOTE4 voice data.
4. Any request to enable billing/Vertex.
5. Any production deployment/configuration change.
6. Any firmware flash.

Do not ask the user to repeat project/account information already established.

## Success criteria

Best outcome:

```text
GENERATIVE_LANGUAGE_API=ENABLED
BILLING_ENABLED=NO
VERTEX_API_ENABLED=NO
GEMINI_ADC=PASS
GENERATIVE_LANGUAGE_REST_OAUTH=PASS
GEMINI31_LIVE_MODEL_VISIBLE=YES
GEMINI31_LIVE_OAUTH=PASS
GEMINI31_LIVE_FREE_TIER=PASS_OBSERVED
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
```

If successful, stop for human review before implementing the production Slate migration. The following campaign can then adapt Slate from Vertex mode to the proven Gemini Developer API OAuth transport while keeping Vertex as a non-active fallback.