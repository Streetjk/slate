# Campaign 8D1A — gcloud absolute-path Vertex readiness recheck

Date: 2026-09-02 (Australia/Perth)
Branch: `feature/gemini-35-live-evaluation`
Precedence: this addendum supersedes only the `GCLOUD_UNAVAILABLE` conclusion from the immediately prior 8D1 readiness check. All existing safety boundaries remain binding.

## Human-confirmed facts now available

The human has completed official Google Cloud CLI installation and ADC setup on the Orange Pi under user `pi`.

Known non-secret facts:

```text
GCLOUD_INSTALL_ROOT=/mnt/ssd-tmp/slate-tools/google-cloud-sdk
GCLOUD_BIN=/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud
GCLOUD_VERSION=583.0.0
GOOGLE_CLOUD_PROJECT=slate-note4
ADC_TOKEN_PROBE=ADC_OK
ADC_QUOTA_PROJECT=slate-note4
ADC_WELL_KNOWN_PATH=/home/pi/.config/gcloud/application_default_credentials.json
```

Do not re-run interactive authentication. Do not print, read, copy, hash, upload, commit, or otherwise inspect credential contents. Existence/permissions of the ADC file may be checked, but its contents must not be displayed.

## Objective

Re-run the 8D1 Vertex readiness matrix using the absolute gcloud path. The prior blocker was caused by non-interactive PATH resolution, not failed authentication.

This stage is read-only. It must establish the current state of:

- gcloud availability/version;
- active project and account visibility;
- ADC token usability;
- Vertex AI API enablement state;
- Cloud Billing attachment/readiness state;
- IAM visibility for the active account;
- Orange Pi root/NVMe headroom;
- Slate/MySQL/Tailscale/Funnel/NOTE4 health.

No billable Vertex model request is authorized in 8D1A.

## Required execution rules

1. Fetch/reconcile origin and confirm the exact current PR #2 branch/stage before doing anything else.
2. Use the absolute binary path rather than relying on shell startup files:

```bash
GCLOUD_BIN=/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud
```

3. Do not modify `.bashrc`, `/etc/profile`, system PATH, symlinks, ownership of `/mnt/ssd-tmp`, or the gcloud installation.
4. Run gcloud as the normal `pi` user with `HOME=/home/pi`. Do not run gcloud auth commands under `sudo` or root.
5. Do not run `gcloud init`, `gcloud auth login`, or `gcloud auth application-default login` again unless a newer explicit human instruction requires it.
6. Never print an access token. Token validation must redirect stdout to `/dev/null`.

## Read-only readiness checks

At minimum collect the following without exposing secrets:

```bash
GCLOUD_BIN=/mnt/ssd-tmp/slate-tools/google-cloud-sdk/bin/gcloud

# binary/version
if [ -x "$GCLOUD_BIN" ]; then
  "$GCLOUD_BIN" version
else
  echo GCLOUD_ABSOLUTE_PATH_MISSING
fi

# project/account identity; account email is not a secret but do not print any tokens
"$GCLOUD_BIN" config get-value project
"$GCLOUD_BIN" config get-value account

# ADC usability; never print token
"$GCLOUD_BIN" auth application-default print-access-token >/dev/null \
  && echo ADC_OK \
  || echo ADC_FAIL

# ADC file: metadata only, not contents
stat -c '%U %G %a %s %n' /home/pi/.config/gcloud/application_default_credentials.json 2>/dev/null \
  || echo ADC_FILE_ABSENT

# Vertex API enabled state — read-only
"$GCLOUD_BIN" services list --enabled --project=slate-note4 \
  --filter='config.name:aiplatform.googleapis.com' \
  --format='value(config.name)'

# Billing attachment/readiness — read-only
"$GCLOUD_BIN" billing projects describe slate-note4 \
  --format='yaml(projectId,billingEnabled,billingAccountName)' 2>&1

# IAM visibility for the active account — read-only
ACTIVE_ACCOUNT="$("$GCLOUD_BIN" config get-value account 2>/dev/null)"
"$GCLOUD_BIN" projects get-iam-policy slate-note4 \
  --flatten='bindings[].members' \
  --filter="bindings.members:user:${ACTIVE_ACCOUNT}" \
  --format='value(bindings.role)' 2>&1
```

If a read-only command fails due to permission or API visibility, record the exact non-secret error class and continue with the remaining read-only checks. Do not attempt to fix IAM, billing, or API enablement automatically.

## Service/storage checks

Re-run the existing non-destructive Orange Pi checks and report exact current values where available:

```text
ROOT_FREE_BYTES
ROOT_TOTAL_BYTES
ROOT_USED_PERCENT
NVME_FREE_BYTES
SLATE_HEALTH
MYSQL_HEALTH
TAILSCALE
FUNNEL
PUBLIC_HEALTH
NOTE4_POLLING
```

Do not run `apt autoremove`, delete packages, move Slate/MySQL data, repartition NVMe, change Deluge paths, or change Docker data-root.

## Decision matrix

### A — ready for a separately authorized bounded Vertex probe
Only if all of the following are true:

```text
GCLOUD_ABSOLUTE_PATH=PASS
GOOGLE_CLOUD_PROJECT=slate-note4
ADC=PASS
VERTEX_API_ENABLED=YES
BILLING_ENABLED=YES
VERTEX_IAM=SUFFICIENT_OR_NO_BLOCKING_PERMISSION_ERROR
SLATE_HEALTH=PASS
MYSQL_HEALTH=PASS
ORANGEPI_STORAGE_GATE=PASS
```

Then stop and report:

```text
STATUS=READY_FOR_EXPLICIT_VERTEX_PROBE_AUTHORIZATION
VERTEX_MODEL_CALLS=0
```

Do not make the probe in 8D1A.

### B — API disabled
If `aiplatform.googleapis.com` is not enabled, report:

```text
VERTEX_API_ENABLED=NO
STATUS=HUMAN_API_ENABLEMENT_DECISION_REQUIRED
```

Do not enable it automatically.

### C — billing not attached/disabled
If billing is not enabled or no billing account is attached, report:

```text
BILLING_ENABLED=NO
STATUS=HUMAN_BILLING_DECISION_REQUIRED
```

Do not attach or activate billing automatically.

### D — IAM blocker
If ADC works but the active account lacks required access or IAM policy cannot be read due to permission restrictions, report the exact non-secret error and stop for human review. Do not add roles.

## Explicit prohibitions

Not authorized in 8D1A:

- enabling `aiplatform.googleapis.com` or any API;
- attaching/enabling/changing billing;
- changing IAM roles/policies;
- any Vertex/Gemini model call;
- any production `.env` or container configuration change;
- copying ADC credentials into Docker, Git, chat, reports, another host, or firmware;
- `GEMINI_API_KEY`, `GOOGLE_API_KEY`, service-account JSON, OpenRouter fallback, or copied tokens;
- package removals / `apt autoremove`;
- NVMe repartition or Slate/MySQL migration;
- firmware flash;
- PR merge.

## Durable checkpoint

Update the current Campaign 8 report/state with the exact read-only results and push the checkpoint to `feature/gemini-35-live-evaluation`. Add a concise PR #2 comment summarizing only non-secret readiness status.

Stop after this stage for human review. Do not proceed automatically to a Vertex probe, API enablement, billing, production config, or firmware flashing.
