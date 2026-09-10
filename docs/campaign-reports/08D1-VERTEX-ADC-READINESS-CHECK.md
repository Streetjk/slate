# Campaign 8D1 — Vertex ADC readiness check

Date: 2026-09-02 (Australia/Perth)
Status: READY_TO_RUN_READ_ONLY

## Human boundary completed

The user completed Google Cloud CLI setup on the Orange Pi and successfully established Application Default Credentials (ADC) for project `slate-note4`.

Observed user-side confirmation:

```text
GOOGLE_CLOUD_PROJECT=slate-note4
ADC_QUOTA_PROJECT=slate-note4
ADC_TOKEN_PROBE=PASS
GCLOUD_VERSION=583.0.0
```

Do not record or request browser login URLs, authorization codes, access tokens, refresh tokens, credential JSON contents, or other secrets.

## Objective

Run a read-only readiness check for Slate's approved Vertex/ADC path before any API enablement, billing change, billable model invocation, production environment mutation, firmware flash, or NVMe migration.

## Scope

Reconcile remote state first, then inspect the Orange Pi only.

Confirm:

1. `gcloud` is available and functional.
2. Active gcloud project is exactly `slate-note4`.
3. ADC exists and can mint an access token without printing the token.
4. ADC quota project is `slate-note4` where observable without exposing credential contents.
5. `aiplatform.googleapis.com` enablement state.
6. Project billing attachment/enabled state using read-only gcloud/API commands only.
7. Current authenticated account identity may be reported only as account email if already exposed by gcloud; never report tokens or credential material.
8. Relevant project-level IAM roles/permissions for the authenticated user needed to use Vertex AI. Do not modify IAM.
9. Current root and NVMe free space.
10. Slate/MySQL/Tailscale/Funnel/NOTE4 polling health remains unchanged.

## Allowed read-only commands

Use equivalent commands as appropriate, including:

```bash
gcloud version
gcloud config get-value project
gcloud auth list --filter=status:ACTIVE --format='value(account)'
gcloud auth application-default print-access-token >/dev/null && echo ADC_OK || echo ADC_FAIL
gcloud services list --enabled --project=slate-note4 --filter='config.name:aiplatform.googleapis.com' --format='value(config.name)'
gcloud billing projects describe slate-note4 --format='value(billingEnabled,billingAccountName)' 2>/dev/null || true
gcloud projects get-iam-policy slate-note4 --flatten='bindings[].members' --filter='bindings.members:user:streetjk@gmail.com' --format='table(bindings.role)' 2>/dev/null || true
df -B1 /
df -B1 /mnt/ssd-tmp
systemctl is-active tailscaled.service
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/healthz
curl -fsS -o /dev/null -w '%{http_code}\n' https://orangepi5.tail6aabef.ts.net/healthz
docker ps --format 'table {{.Names}}\t{{.Status}}'
```

If billing inspection is denied, record `BILLING_STATUS=UNKNOWN_PERMISSION_DENIED`; do not attempt to grant roles or enable billing.

If IAM inspection is denied, record the limitation and continue with all other read-only checks.

## Prohibited in this stage

Do NOT:

- enable `aiplatform.googleapis.com` or any other API
- attach, change, or enable billing
- make any Gemini/Vertex model request, including a nominal/free probe
- change project IAM
- modify Slate production environment variables
- copy ADC credentials into Docker, Git, chat, reports, or another host
- move Slate/MySQL data
- modify NVMe/Deluge configuration
- run `apt autoremove`
- remove OpenVPN, libllvm20, graphics packages, or additional packages
- flash firmware
- merge PR #2
- start Campaign 6D, PR #1, PR #3, Airtable, or unrelated work
- call Gemini 3.7 Flash as reviewer/shadow during the existing blackout

## Decision gate

Classify readiness as follows:

### `VERTEX_READINESS=READY_FOR_API_ENABLEMENT_DECISION`
Use only if:
- project = `slate-note4`
- ADC token probe passes
- billing state is known
- no P0/P1 health issue exists

The API may still be disabled. This status means the next human decision can be limited to API/billing authorization.

### `VERTEX_READINESS=READY_FOR_BOUNDED_PROBE_DECISION`
Use only if:
- project = `slate-note4`
- ADC passes
- Vertex AI API is already enabled
- billing is enabled/attached if required by the project
- IAM is sufficient or a non-billable permissions check establishes access
- no P0/P1 health issue exists

Do not actually run the model probe in this stage.

### `VERTEX_READINESS=BLOCKED_<reason>`
Use if ADC/project/health is not valid or the state cannot safely progress.

## Durable checkpoint

Append the result to `docs/campaign-reports/08-GEMINI-35-LIVE.md` and update `docs/campaign-reports/CAMPAIGN-STATE.md`.

Required checkpoint fields:

```text
CAMPAIGN=8D1
GCLOUD=PASS|FAIL
GCLOUD_VERSION=<version>
GOOGLE_CLOUD_PROJECT=<project-id>
ACTIVE_GCLOUD_ACCOUNT=<email-or-UNKNOWN>
ADC=PASS|FAIL
ADC_QUOTA_PROJECT=slate-note4|UNKNOWN
VERTEX_API_ENABLED=YES|NO|UNKNOWN
BILLING_ENABLED=YES|NO|UNKNOWN_PERMISSION_DENIED|UNKNOWN
BILLING_ACCOUNT_ATTACHED=YES|NO|UNKNOWN
VERTEX_IAM=SUFFICIENT|INSUFFICIENT|UNKNOWN_PERMISSION_DENIED|UNKNOWN
ROOT_FREE_BYTES=<integer>
NVME_FREE_BYTES=<integer>
SLATE_HEALTH=PASS|FAIL
MYSQL_HEALTH=PASS|FAIL
TAILSCALE=PASS|FAIL
PUBLIC_HEALTH=PASS|FAIL
NOTE4_POLLING=PASS|NOT_OBSERVED|FAIL
VERTEX_MODEL_CALLS=0
BILLING_CHANGED=NO
API_ENABLEMENT_CHANGED=NO
IAM_CHANGED=NO
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
FIRMWARE_FLASHED=NO
NVME_CHANGED=NO
APT_AUTOREMOVE_EXECUTED=NO
VERTEX_READINESS=READY_FOR_API_ENABLEMENT_DECISION|READY_FOR_BOUNDED_PROBE_DECISION|BLOCKED_<reason>
```

After checkpoint/push, stop at the next true human decision boundary. Do not infer authorization to enable billing, enable an API, or make a model call.
