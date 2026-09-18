# Campaign 8D1M-G M4 — one bounded non-Voice network qualification

## Purpose

The long-run backend-only authenticated poll marker is deployed and reviewed. The remaining boundary is no longer an observability-design gap: NOTE4 has not produced one authenticated poll after deployment.

This file defines exactly one identity-preserving, non-Voice human action to force a clean full-active boot/network/sync path and then requires autonomous evidence ingestion. Do not repeat the action blindly.

```text
MODE=FRONTIER_DRIVEN_LONGRUN
PR_NUMBER=2
PR_STATE_REQUIRED=OPEN
PR_DRAFT_REQUIRED=YES
PR_MERGED_REQUIRED=NO
CURRENT_RUNTIME_REPAIR=BACKEND_ONLY_AUTHENTICATED_POLL_SUCCESS_MARKER
BACKEND_TAG=slate:m4-observability-07248b6
FIRMWARE_BYTES_CHANGED=NO
DEVICE_IDENTITY_PRESERVED=YES
CANONICAL_REVIEWER=GROK_4_6
NO_ZAI_RETRY=true
```

## Why this action

On a normal full-active boot, firmware `App::Init()` calls `InitWifiAndSync(..., false)`. If network setup succeeds, `SyncService::Start(..., InitialSync::kUserActive)` is invoked. That start path immediately triggers user-active sync, and the sync path performs the authenticated device poll. Once bound and running, the normal poll interval is 60 seconds.

Therefore a single controlled reset is the narrowest deterministic human action that forces the intended boot -> Wi-Fi -> authenticated sync/poll path without changing device identity, credentials, backend configuration, provider/model, firmware bytes, pairing state, or private-data authority.

## Exactly one human action

The operator should perform exactly ONE controlled NOTE4 reset using the board/device reset control.

Do not:
- erase flash;
- hold BOOT while resetting;
- enter captive-portal setup unless the device itself lands there;
- re-pair;
- change Wi-Fi credentials;
- enter Voice AI;
- press additional controls to "help" the test;
- power-cycle repeatedly;
- repeat the reset if the marker does not appear.

After the one reset, leave the device untouched so the already-running sanitized observer and backend can capture the resulting boot/network/auth/poll sequence.

## Required autonomous ingestion

Immediately after the one reset, Codex must ingest only sanitized structural evidence and determine the earliest reached boundary:

```text
RESET_OBSERVED=
RESET_REASON_CLASS=
WATCHDOG_REASON_CLASS=
BOOT_SEQUENCE_OBSERVED=
WIFI_CONNECT_RESULT=
NETWORK_SETUP_RESULT=
SYNC_START_RESULT=
DEVICE_AUTHENTICATED_POLL_RESULT=
DEVICE_AUTHENTICATED_POLL_MARKER_COUNT=
DEVICE_ROW_COUNT=
RECENT_AUTH_ACTIVITY_COUNT=
RECENT_TELEMETRY_COUNT=
BACKEND_HEALTH=
SLATE_RESTART_COUNT=
MYSQL_RESTART_COUNT=
FATAL_MARKER_COUNT=
NETWORK_QUALIFICATION=PASS|FAIL|UNKNOWN
EARLIEST_FAILED_BOUNDARY=
```

Do not retain or publish SSID, IP, MAC, device ID, token/secret, raw serial content, request/response bodies, transcript, audio, provider payload, Calendar data, or Outlook data.

## PASS handling

If one authenticated NOTE4 poll is mechanically proven and the single registered-device gate still holds:

```text
DEVICE_AUTHENTICATED_POLL_RESULT=PASS
NETWORK_QUALIFICATION=PASS
READONLY_READY_NODE_COUNT=0
WAITING_DEVICE_COUNT=0
```

Then rearm/verify the sanitized observer and advance automatically to exactly ONE combined EN/JA multi-turn Voice AI physical soak. Do not add another routine checkpoint before that human boundary.

## FAIL/UNKNOWN handling

If the marker does not appear, the one reset is sufficient evidence. Do NOT ask the operator to reset again.

Classify the earliest failed boundary from the captured structure, for example:

```text
BOOT_NOT_REACHED
WIFI_ASSOCIATION_FAILED
NETWORK_SETUP_FAILED
SYNC_TASK_NOT_STARTED
AUTHENTICATED_POLL_NOT_ATTEMPTED
POLL_AUTH_REJECTED
POLL_SERVICE_FAILED
DEVICE_ENTERED_CAPTIVE_PORTAL
OTHER
UNKNOWN
```

Then continue autonomously with all safe nonphysical diagnosis. If a software/runtime repair is justified, use Codex adjudication -> AGY `gemini-3.8-flash-high` minimum repair -> deterministic validation -> privacy/secret scan -> exact build/freeze -> fresh Grok 4.6 review -> bounded deployment/reflash only if impacted -> requalification -> observer rearm.

Do not ask for another physical action until safe nonphysical work is exhausted and another human-only boundary is genuinely necessary.

A report push, review, deployment, observer rearm, recoverable failure, or changed checkpoint is not terminal while READY or READONLY_READY work remains.

Keep PR #2 OPEN / DRAFT / UNMERGED.
