# Campaign 8D1M-G M4 — one-shot NOTE4 reset consumed; ingest now

## Authority and current control-plane correction

The operator has returned after the previously authorized one-shot non-Voice NOTE4 network qualification boundary. Treat that single reset opportunity as **consumed** for campaign control purposes.

Do **not** ask the operator to reset, power-cycle, re-pair, change Wi-Fi, press BOOT, enter Voice AI, or otherwise repeat the boundary merely because the durable GitHub state has not yet been updated.

The live GitHub head before this instruction still showed the pre-action waiting state. That is now a stale control-plane checkpoint, not authority to request another reset.

```text
MODE=FRONTIER_DRIVEN_LONGRUN
PR_NUMBER=2
PR_STATE_REQUIRED=OPEN
PR_DRAFT_REQUIRED=YES
PR_MERGED_REQUIRED=NO
ONE_SHOT_NETWORK_RESET=CONSUMED
REPEAT_RESET_ALLOWED=NO
CANONICAL_REVIEWER=GROK_4_6
NO_ZAI_RETRY=true
```

## Immediate controller work

Without any new physical action, ingest the already-running sanitized observer output and backend-side structural evidence generated since the one-shot boundary.

Mechanically classify and publish at minimum:

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

Use only privacy-safe structural evidence. Do not retain or publish SSID, IP, MAC, device ID, device secret/token, raw serial lines, request/response payloads, transcripts, audio, Gemini/provider payloads, Calendar contents, Outlook contents, or other private data.

## PASS path

If exactly one authenticated NOTE4 poll is mechanically proven and the single registered-device gate still holds:

```text
DEVICE_AUTHENTICATED_POLL_RESULT=PASS
NETWORK_QUALIFICATION=PASS
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_DEVICE_COUNT=0
```

Then:

1. rearm/verify the sanitized observer;
2. update `CAMPAIGN-STATE.md` at the new exact head;
3. publish a durable post-reset qualification report;
4. advance directly to exactly ONE combined EN/JA multi-turn Voice AI soak;
5. do not insert another routine nonphysical checkpoint before that human boundary.

The later Voice soak must evaluate early-vs-late latency, progressive lag/freeze, bubble ordering, one bubble per role, Japanese kana including `の`, audible assistant audio, provider/backend/bridge/firmware queue/resource trends, heap/PSRAM, and reset/watchdog evidence if instability occurs.

## FAIL / UNKNOWN path

If the authenticated poll marker is absent, the single reset is still sufficient physical evidence. Do **not** request another reset.

Continue autonomously through all safe nonphysical diagnosis of the earliest failed boundary:

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

Use available sanitized serial lifecycle markers, backend aggregate auth/telemetry state, source inspection, deterministic tests, and already-authorized read-only probes to narrow the failure.

If a repair is justified, continue automatically:

Codex adjudication -> AGY `gemini-3.8-flash-high` minimum repair -> deterministic validation -> privacy/secret scan -> exact build/freeze -> fresh independent Grok 4.6 exact review -> bounded deploy/reflash only if impacted -> requalification -> observer rearm -> updated durable frontier.

No ZAI retry and no silent reviewer fallback.

Do not return to the operator until all safe nonphysical work is exhausted and the next human-only action is genuinely the sole useful remaining node.

## Required durable publication

Before controller exit, push a new exact report and update `CAMPAIGN-STATE.md` so GitHub no longer says the reset is still pending.

Record:

```text
CURRENT_HEAD=
CURRENT_STAGE=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Do not exit while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0` unless a true safety/authority boundary prevents progress.

Keep PR #2 OPEN / DRAFT / UNMERGED.
