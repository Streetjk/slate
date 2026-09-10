# Campaign 8D1D — Gemini 3.1 Flash Live API-key free-tier probe

Date: 2026-09-02 (Australia/Perth)
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Starting checkpoint: `ad31e548010ddeeeff3b8121bb12b365aa8b988b`

## Purpose

The operator has explicitly authorized a narrow exception to the prior API-key prohibition for one bounded, synthetic Gemini Developer API Live feasibility probe only.

A Gemini Developer API key has been stored locally on the Orange Pi at:

`/mnt/ssd-tmp/slate-tools/gemini-api-key/gemini_api_key`

Expected local security state from the human setup:

- owner: `pi:pi`
- mode: `0600`
- observed size: 53 bytes

The key is secret. Never print, echo, `cat`, log, commit, paste, report, hash into public artifacts, or expose it through shell tracing, process arguments, screenshots, error dumps, test fixtures, environment dumps, or PR comments.

This directive authorizes only a standalone synthetic Live probe against `gemini-3.1-flash-live-preview` while billing remains unattached and Vertex remains disabled. It does not authorize production integration, deployment, `.env` changes, firmware flashing, PR merge, private NOTE4 data, Outlook data, calendar data, Search requests, or tool calls.

## Binding safety rules

1. Keep Google Cloud billing OFF/unattached.
2. Keep `aiplatform.googleapis.com` disabled.
3. Do not create another key and do not modify the existing key in Google Console.
4. Do not move the key into the repository or a production `.env`.
5. Do not expose the key through command-line arguments. Read it from the protected file into process memory only.
6. Do not use the key for reviewer/worker/shadow-model calls.
7. Do not send private NOTE4, Outlook, Calendar, names, contacts, voice recordings, files, or user-generated content.
8. Synthetic probe payload only. Use a trivial prompt such as `Say exactly TEST.`
9. No production restart or runtime model change.
10. No firmware flash.
11. No PR merge.
12. No billing enablement even if Google reports quota/payment required.
13. No retry loops. At most two model calls total: one minimal authentication/catalogue probe if needed and one Live session probe.
14. If any secret appears in terminal output, logs, Git diff, report, or tool transcript, stop immediately and mark `CREDENTIAL_EXPOSURE_HARD_STOP=YES`; do not copy the value into the report.

## D0 — Reconcile exact remote state

Before probing:

- fetch/reconcile origin;
- verify current branch is `feature/gemini-35-live-evaluation`;
- verify PR #2 remains open/unmerged;
- verify starting report/state corresponds to Campaign 8D1C or a newer non-conflicting checkpoint;
- preserve Campaign 6D isolation;
- do not touch PR #1 or PR #3.

If the branch has advanced in a conflicting way, stop and report rather than overwrite or reset.

## D1 — Non-secret local readiness

On Orange Pi, verify without reading or printing key contents:

- key file exists;
- regular file;
- owned by `pi`;
- mode `0600`;
- non-zero size;
- parent directory mode `0700` if feasible;
- Slate health;
- MySQL health;
- Tailscale/Funnel health;
- recent NOTE4 polling health;
- Generative Language API enabled;
- billing remains unattached;
- Vertex API remains disabled.

Record only metadata and PASS/FAIL states.

Expected evidence labels:

```text
API_KEY_FILE_PRESENT=
API_KEY_FILE_OWNER=
API_KEY_FILE_MODE=
API_KEY_FILE_NONZERO=
API_KEY_DIRECTORY_MODE=
GENERATIVE_LANGUAGE_API=
BILLING_ENABLED=
BILLING_ACCOUNT_ATTACHED=
VERTEX_API_ENABLED=
SLATE_HEALTH=
MYSQL_HEALTH=
TAILSCALE=
FUNNEL=
NOTE4_POLLING=
```

Hard stop if billing is attached/enabled unexpectedly or Vertex was enabled unexpectedly. Do not change either state.

## D2 — Verify current official model surface before call

Using current official Google Gemini Developer API documentation and/or the official model catalogue, verify at execution time:

- exact model name `gemini-3.1-flash-live-preview` still exists;
- Live API remains supported for the model;
- current Developer API Live authentication path accepts an API/Auth key;
- no newer model name supersedes the exact target in a way that would make the probe invalid.

Do not switch models automatically. If the exact target is removed/deprecated or the documented auth path materially changed, stop with `HUMAN_MODEL_OR_AUTH_REVIEW_REQUIRED=YES` and report the official evidence.

## D3 — Minimal API-key authentication check

Use the locally stored key only in process memory. Preferred pattern:

- read file with restrictive shell/Python handling;
- do not export it globally;
- do not pass it on the command line;
- do not enable shell tracing;
- ensure exception output does not serialize client configuration or headers.

A minimal non-private model metadata/list check is permitted if it materially helps distinguish invalid-key/auth errors from Live quota errors. This counts as one of the maximum two calls.

Classify result only, for example:

```text
API_KEY_AUTH=PASS
```

or

```text
API_KEY_AUTH=FAIL_<SANITIZED_REASON>
```

Never include the key value, authorization header, full request headers, or raw credential-bearing URLs.

## D4 — One synthetic Gemini 3.1 Flash Live probe

Run exactly one bounded Live session probe against:

`gemini-3.1-flash-live-preview`

Use the current official Google Gen AI SDK if possible. Re-use the disposable probe environment under `/mnt/ssd-tmp/slate-tools/gemini-oauth/probe-venv` if compatible, or create another disposable venv under `/mnt/ssd-tmp/slate-tools/`; do not modify Slate production dependencies or system Python.

The API key must be loaded from the protected file into process memory. Do not place it in `.env`, shell history, source code, test files, Docker build args, GitHub Actions, or command-line arguments.

Synthetic input only:

`Say exactly TEST.`

Use the minimum configuration needed to establish a genuine Live session and receive a valid server response/event. If Live requires an audio response modality, receiving enough protocol data to prove the session is accepted is sufficient; do not persist generated audio unless the SDK requires a temporary file, and delete any such temporary artifact immediately.

Do not enable Search grounding or function/tool calling for this probe.

Do not retry the Live call after a conclusive result.

Sanitize all exception/error output before writing the campaign report.

## D5 — Classify the result precisely

If the Live session establishes and Google returns a valid model response/event while billing remains unattached:

```text
GEMINI31_LIVE_API_KEY=PASS
GEMINI31_LIVE_SESSION=PASS
GEMINI31_LIVE_FREE_TIER=PROVEN_FOR_THIS_PROJECT_AT_PROBE_TIME
BILLING_CHANGED=NO
VERTEX_API_ENABLED=NO
READY_FOR_PRODUCTION_API_KEY_MIGRATION=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_SECURE_PRODUCTION_KEY_INTEGRATION_AND_DATA_POLICY
```

A successful probe proves only that this project/key can establish the Live session without attached billing at that moment. It does not authorize production use and does not guarantee future free-tier quotas.

If Google rejects the Live call for quota/tier/payment reasons, record the exact sanitized Google status/reason and classify:

```text
GEMINI31_LIVE_API_KEY=AUTHENTICATED_IF_APPLICABLE
GEMINI31_LIVE_SESSION=FAIL_QUOTA_OR_TIER
GEMINI31_LIVE_FREE_TIER=NOT_AVAILABLE_OR_NOT_PROVEN_FOR_THIS_PROJECT
BILLING_CHANGED=NO
READY_FOR_PRODUCTION_API_KEY_MIGRATION=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_DECIDE_PAID_GEMINI_VS_ALTERNATIVE_PROVIDER
```

Do not enable billing.

If authentication itself fails, distinguish invalid/restricted key, project/API configuration, model availability, and network/protocol errors. Do not create or rotate keys automatically.

## D6 — Security and regression check

After the probe:

- unset/delete any in-memory shell variable where applicable;
- ensure no key material was written to repo files, logs, temp files, shell scripts, command history, or reports;
- run a targeted secret scan over changed files and current Git diff;
- confirm production `.env` and runtime Gemini settings were not changed;
- confirm Slate/MySQL/Tailscale/Funnel/NOTE4 polling remain healthy;
- confirm billing remains unattached;
- confirm Vertex remains disabled;
- confirm no firmware flash and no PR merge.

Do not scan or print the secret file itself as part of the report.

## D7 — Durable checkpoint

Update:

- `docs/campaign-reports/08-GEMINI-35-LIVE.md`
- `docs/campaign-reports/CAMPAIGN-STATE.md`

with sanitized evidence only.

Commit only campaign report/state changes, push the branch, verify remote head, and add a concise PR #2 checkpoint comment.

Do not commit probe scripts containing credentials. A credential-free disposable probe script may remain outside the repository; no need to commit it.

## Required final matrix

```text
CAMPAIGN=8D1D
API_KEY_FILE_PRESENT=
API_KEY_FILE_OWNER=
API_KEY_FILE_MODE=
API_KEY_FILE_NONZERO=
GENERATIVE_LANGUAGE_API=
BILLING_ENABLED=
BILLING_ACCOUNT_ATTACHED=
VERTEX_API_ENABLED=
API_KEY_AUTH=
GEMINI31_LIVE_MODEL_VISIBLE=
GEMINI31_LIVE_API_KEY=
GEMINI31_LIVE_SESSION=
GEMINI31_LIVE_FREE_TIER=
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
PRODUCTION_RESTARTED_FOR_GEMINI=NO
PRIVATE_NOTE4_DATA_SENT=NO
OUTLOOK_DATA_SENT=NO
CALENDAR_DATA_SENT=NO
SEARCH_GROUNDING_USED=NO
TOOL_CALLS_USED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
CREDENTIAL_EXPOSURE_HARD_STOP=NO
SLATE_HEALTH=
MYSQL_HEALTH=
TAILSCALE=
FUNNEL=
NOTE4_POLLING=
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=
```

## Controller liveness

Codex remains controller/integrator/validator. Continue autonomously through D0-D7 unless a genuine hard stop is reached. Do not return control merely for ordinary command execution, package setup inside the disposable venv, deterministic validation, report writing, commit, push, or remote verification.

Stop only for a genuine human boundary, including billing/payment, key rotation/recreation, production secret integration, production deployment, firmware flash, PR merge, credential exposure, or another explicitly irreversible/high-impact action.
