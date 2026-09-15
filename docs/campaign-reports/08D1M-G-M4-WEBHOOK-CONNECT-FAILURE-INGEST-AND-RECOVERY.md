# Campaign 8D1M-G — webhook/connect failure ingest and recovery

## Live reconciliation at issue

Issued after re-fetching PR #2 at exact live head `629c50d2109e9f2e2877c368c047123ee09b2d30`.

```text
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
HEAD_BRANCH=feature/gemini-35-live-evaluation
BASE_BRANCH=integration/note4-custom
CURRENT_STAGE=M4_REPAIR_DEPLOYED_APP_ONLY_REFLASHED_OBSERVER_REARMED_WAITING_COMBINED_ACCEPTANCE
RUNTIME_SOURCE_HEAD=7acb8b96a02130dd0de8b21bc39e3fc43355da5f
READY_NODE_COUNT=0
READONLY_READY_COUNT=0
WAITING_DEVICE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=0
CURRENT_BLOCKED_NODE=ONE_COMBINED_EN_JA_INSTRUMENTED_PHYSICAL_M4_ACCEPTANCE_SESSION
HUMAN_ACTION_REQUIRED=YES
```

The operator has now performed the pending repaired physical Voice AI attempt. The observed device-visible result was:

```text
VOICE_SERVER_UNAVAILABLE=YES
DEVICE_VISIBLE_DETAIL="unable to connect to webhook"
```

Treat this single attempt as sufficient evidence. The human boundary is consumed immediately.

```text
WAITING_HUMAN_COUNT=0
HUMAN_ACTION_REQUIRED=NO
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
```

Do **not** ask for another physical retry before exhausting all safe technical READY/READONLY_READY work.

## First action — ingest before changing anything

Immediately ingest the already-running corrected sanitized observer and the matching backend/service health/log markers for this exact attempt. Preserve only structural/sanitized evidence; do not retain raw serial lines, transcripts, audio/PCM, provider payloads, credentials, auth headers, Calendar/Outlook content, or other private data.

Do not infer root cause from the device string `unable to connect to webhook`. Mechanically determine the earliest failed boundary.

At minimum publish:

```text
LATEST_REPAIRED_COMBINED_ACCEPTANCE_INGESTED=YES
DEVICE_VISIBLE_RESULT=VOICE_SERVER_UNAVAILABLE_UNABLE_TO_CONNECT_TO_WEBHOOK
VOICE_CONFIG_REQUEST_STARTED=YES|NO|UNKNOWN
VOICE_CONFIG_AUTH_RESULT=PASS|REJECT|NOT_REACHED|UNKNOWN
VOICE_CONFIG_RESPONSE_CLASS=2xx|4xx|5xx|NO_RESPONSE|UNKNOWN
VOICE_CONFIG_RESULT=PASS|FAIL|NOT_REACHED|UNKNOWN
CONFIG_WEBHOOK_URL_PRESENT=YES|NO|UNKNOWN
CONFIG_WEBHOOK_URL_CLASS=VALID_WSS|VALID_WS|MALFORMED|EMPTY|UNSUPPORTED|UNKNOWN
DNS_RESOLUTION_RESULT=PASS|FAIL|NOT_REACHED|UNKNOWN
TCP_CONNECT_RESULT=PASS|FAIL|NOT_REACHED|UNKNOWN
TLS_HANDSHAKE_RESULT=PASS|FAIL|NOT_REACHED|UNKNOWN
VOICE_WS_CONNECT_RESULT=OPEN|TRANSPORT_FAIL|HANDSHAKE_FAIL|NOT_REACHED|UNKNOWN
VOICE_WS_UPGRADE_REACHED_BACKEND=YES|NO|UNKNOWN
VOICE_WS_AUTH_RESULT=PASS|REJECT|NOT_REACHED|UNKNOWN
VOICE_WS_ACCEPTED=YES|NO|UNKNOWN
VOICE_SESSION_INIT_SENT=YES|NO|UNKNOWN
PROVIDER_SESSION_CREATE_START=YES|NO|UNKNOWN
PROVIDER_SESSION_STARTED=YES|NO|UNKNOWN
FIRST_MIC_FRAME_RECEIVED=YES|NO|UNKNOWN
LIVE_FAILURE_SOURCE=
FAILURE_STAGE=
FAILURE_ROOT_CAUSE_CLASS=
SLATE_HEALTH=
SLATE_RESTART_COUNT=
MYSQL_HEALTH=
MYSQL_RESTART_COUNT=
PUBLIC_HEALTH=
LOCAL_HEALTH=
ACTIVE_BACKEND_IMAGE_ID=
ACTIVE_FIRMWARE_APP_SHA256=
DEPLOYED_CONFIG_CONTINUITY=PASS|FAIL|UNKNOWN
NEXT_AUTONOMOUS_ACTION=
```

## Mandatory classification order

Classify the first broken boundary in this order and stop guessing once one is proven:

1. firmware did not obtain usable voice configuration;
2. voice/config authentication or backend response failure;
3. webhook/WebSocket URL missing, malformed, stale, wrong scheme/host/path/port, or otherwise unusable;
4. DNS resolution failure;
5. TCP connect failure;
6. TLS validation/handshake failure;
7. WebSocket HTTP upgrade/handshake failure before backend acceptance;
8. backend WebSocket auth/acceptance failure;
9. only if all above pass, continue into provider/session/mic/output/audio/timing analysis.

Explicitly compare the current deployed voice configuration and runtime environment with the previously working post-config-restore deployment. Prove whether the repair deployment/recreation preserved every already-authorized voice routing variable, public endpoint/host/path, secret mount, model/runtime setting, and container network/reverse-proxy behavior. Do not expose secret values.

Do not reopen the old managed-component WebSocket event-loss bug merely because the user sees a connection string. That old defect remains closed unless the new observer mechanically reproduces its characteristic pre-backend-upgrade transport failure on the current firmware.

## Recovery rules

- If configuration/routing was omitted or lost during the latest backend redeploy, restore the exact previously approved values only; do not change provider/model/credential/billing/private-data authority.
- If a stale or malformed webhook/WebSocket URL is generated, repair the smallest responsible config or serialization path and add a deterministic regression proving the exact URL class/path/scheme behavior without logging sensitive endpoints unnecessarily.
- If DNS/TCP/TLS/WebSocket transport fails, isolate firmware vs network vs reverse-proxy/backend boundary with sanitized evidence before changing code.
- If the backend is unhealthy or restarted, determine the exact deployment/runtime cause and repair that first.
- If connection succeeds after nonphysical recovery but no provider/audio progression can be proven without hardware, requalify, rearm observer, then request exactly one new physical acceptance session.

Any runtime-byte repair must use:

```text
evidence
-> Codex adjudication
-> designated AGY Gemini 3.8 Flash minimal repair
-> deterministic regression
-> impacted validation
-> privacy/secret scan
-> exact build/freeze
-> fresh ZAI glm-5.3-flash review
-> bounded backend deploy/app-only firmware flash if authorized
-> requalification
-> observer rearm
```

If no runtime-byte change is required and the fault is exact previously-approved deployment/config restoration, validate and redeploy the exact reviewed artifacts without unnecessary source churn, then requalify and rearm the observer.

Preserve the bubble-order repair, Japanese font repair, numeric latency instrumentation, and audio-chain instrumentation unless evidence shows one is directly responsible.

Keep PR #2 OPEN / DRAFT / UNMERGED.

Before controller exit, publish the standard frontier fields. Do not exit while READY_NODE_COUNT > 0 or READONLY_READY_NODE_COUNT > 0 unless a true safety/authority boundary exists.
