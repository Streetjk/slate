# Campaign 8D1 — Vertex/ADC human setup boundary

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

This directive follows Campaign 8D0. Read first:

- `08-GEMINI-35-LIVE.md`
- `08D-PHYSICAL-VOICE-E2E-INSTRUCTIONS.md`
- `08D-CLAUDE-SONNET5-WORKER-POLICY.md`
- `CAMPAIGN-STATE.md`

## Accepted checkpoint

Campaign 8D0 is complete.

Backend/routing remains healthy, but the Orange Pi currently has no usable Vertex/Application Default Credentials runtime:

```text
HUMAN_VERTEX_ADC_SETUP_REQUIRED=YES
VERTEX_ADC_LIVE=BLOCKED_HUMAN_AUTH
FIRMWARE_FLASHED=NO
```

No firmware write is authorized by this document.

## Binding worker policy

Codex remains controller and integrator.

If a Claude worker is needed, use **Claude Sonnet 5 through the authenticated Claude CLI only** under `08D-CLAUDE-SONNET5-WORKER-POLICY.md`.

Do not use OpenRouter, Anthropic API-key fallback, proxy/aggregator routing, or a silent model substitution.

## Human-owned Google Cloud setup

The human operator must choose the Google account and Google Cloud project. Codex must not create billing, start a free trial, select an account, or complete browser consent on the user's behalf.

Current Google Cloud documentation requires a billing-enabled project for Vertex AI. If the chosen Google account is eligible for the Google Cloud Free Trial, the operator may choose to activate the official trial/credit in the Google Cloud console. Do not attempt to obtain multiple trials or circumvent eligibility rules.

Human checklist:

1. Sign in to the intended long-term Google account for NOTE4.
2. Select or create **one** Google Cloud project for Slate/NOTE4.
3. Confirm billing is enabled for that project. A Google Cloud Free Trial credit may be used if the account is legitimately eligible, but the project must still be billing-enabled for Vertex AI.
4. Enable the Vertex AI API (`aiplatform.googleapis.com`).
5. Keep project ownership/IAM minimal; the authenticated user must have the permissions required to use Vertex AI and consume enabled services.

Official references checked 2026-09-02:

- https://docs.cloud.google.com/sdk/docs/install-sdk
- https://docs.cloud.google.com/docs/authentication/provide-credentials-adc
- https://docs.cloud.google.com/sdk/docs/authenticate
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/scale/sandbox/code-execution-quickstart
- https://cloud.google.com/free

## Install Google Cloud CLI on Orange Pi

The Orange Pi is ARM64 Linux. Google currently publishes an ARM Linux Google Cloud CLI archive and Debian/Ubuntu installation instructions.

Prefer the official package/repository method if the Orange Pi OS is a supported Debian/Ubuntu release and the extra disk use is safe. The root filesystem has been tight during this campaign, so before installation Codex must re-check free space and must not perform broad destructive cleanup.

If package installation would create an unsafe disk-space condition, stop and report the exact space requirement rather than deleting rollback images, MySQL data, Slate data, Tailscale state, or unrelated active packages.

Human privileged package installation may be required because Codex does not have non-interactive sudo. When required, Codex should present only the exact official installation commands and wait for the operator to run them.

## Authentication on the Orange Pi

The credential must be created **on the Orange Pi account that the Slate backend can actually read**, not copied from chat, another machine, Git, or a report.

After `gcloud` is installed, use the normal Google interactive flow:

```text
gcloud init
gcloud auth application-default login
```

For a headless SSH session, use Google's documented browser-on-another-device flow if necessary. Do not paste any verification URL/code, access token, refresh token, credential JSON, private key, or client secret into ChatGPT/Codex/GitHub. The operator handles the browser consent directly.

After login, set the ADC quota project if Google reports that it is needed:

```text
gcloud auth application-default set-quota-project <PROJECT_ID>
```

`PROJECT_ID` is non-secret project metadata, but it still does not need to be posted in public reports unless useful for reproducibility.

Do not create or download a service-account key file. Do not add `GEMINI_API_KEY` or `GOOGLE_API_KEY`.

## After the human says authentication is complete

Codex resumes autonomously and verifies, without printing credential material:

1. `gcloud` exists and reports a current supported version.
2. ADC can obtain/refresh an access identity.
3. ADC quota project is valid or an explicit Service Usage Consumer/IAM error is documented.
4. Vertex AI API is enabled for the selected project.
5. Billing is enabled at the project level; do not print payment method/account details.
6. Determine from current official Google documentation the supported location for the retained model `gemini-live-2.5-flash-native-audio`; do **not** guess a location.
7. Report the required non-secret production settings only as proposed values:
   - `GOOGLE_CLOUD_PROJECT=<project-id>`
   - `GOOGLE_CLOUD_LOCATION=<supported-location>`
8. Stop at a separate production `.env` authorization boundary if those settings are not already present. This directive does not authorize changing the production environment automatically.

If the current backend container cannot see the host ADC credential through its existing runtime/mount design, do not copy credentials into the image or repository. Instead identify the smallest secure runtime-mount or credential-delivery change, subject it to deterministic tests/security review, and stop for approval before production mutation.

## After production Vertex settings are separately authorized

Only then:

1. apply the minimum reviewed production configuration;
2. restart only the Slate backend if required;
3. verify Slate/MySQL/Funnel and NOTE4 polling remain healthy;
4. run one bounded backend-side Vertex Gemini Live connection/clean-close probe;
5. record model acceptance, auth refresh, failure mode, and no-secret evidence;
6. keep `GEMINI_LIVE_MODEL=gemini-live-2.5-flash-native-audio` unless a later reviewed campaign explicitly changes it.

If the bounded Vertex probe fails, do not flash NOTE4 firmware. Diagnose and report the exact non-secret error and preserve the Campaign 8C backend rollback.

If the bounded Vertex probe passes, return to `08D-PHYSICAL-VOICE-E2E-INSTRUCTIONS.md` and stop at the explicit physical firmware-flash authorization boundary.

## Hard prohibitions

- no firmware flash from this directive;
- no PR #2 merge;
- no PR #3 work;
- no Campaign 6D work;
- no OpenRouter;
- no Anthropic API-key worker fallback;
- no Gemini/Google API key;
- no service-account key JSON;
- no copied OAuth access/refresh token;
- no automatic billing/free-trial activation;
- no broad Docker/system prune;
- no deleting rollback images or persistent data.

## Required checkpoint

After the human Google Cloud/ADC step, update `08-GEMINI-35-LIVE.md` and `CAMPAIGN-STATE.md` with one of:

```text
VERTEX_ADC_AUTH=PASS
VERTEX_API_ENABLED=PASS
BILLING_PROJECT_READY=PASS
PRODUCTION_VERTEX_ENV=HUMAN_AUTH_REQUIRED|ALREADY_VALID
VERTEX_LIVE_PROBE=NOT_RUN_PENDING_ENV|PASS|FAIL
READY_FOR_SLATE_VOICE_FLASH=false|true
```

Do not include credential values in the checkpoint.
