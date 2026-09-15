# Campaign 8D1M-G — Execute Final M4 Now and Ingest Result

## Mission

Resume from the current live M4 physical-session boundary without repeating completed backend, firmware, image-identity, reviewer, migration, or observer work. Operate in `FRONTIER_DRIVEN_LONGRUN`. Live GitHub state is authoritative. Keep PR #2 open, draft, and unmerged.

The current live PR head at instruction publication is `02ccbe469b7a15979439a9db83ec1a832a062293`. Embedded `CURRENT_HEAD` fields in campaign reports may lag by one documentation checkpoint and must not trigger documentation-only refresh loops.

## Accepted live boundary

Accept unless fresh evidence disproves it:

```text
DEVICE_STATUS=CONNECTED_IDENTITY_VERIFIED
ACTIVE_BACKEND_IMAGE_ID=sha256:63db9b2133af17d0a755a7149c0fb22e9cfa0fcaad19df31fbac2ebf344def17
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
SLATE_HEALTH=PASS_RESTART_0
MYSQL_HEALTH=PASS_RESTART_0_IDENTITY_PRESERVED
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
NVME_RESERVE=PASS
ORIGINAL_ROOTS_PRESERVED=YES
SERIAL_OBSERVER=ARMED_SANITIZED_PORT_OPEN
BACKEND_OBSERVER=ARMED_SANITIZED_REPEATED_HEALTHY_SAMPLES
M4_STATUS=READY_FOR_ONE_COMBINED_PHYSICAL_SESSION
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_DEVICE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=0
```

Do not redeploy, reflash, rebuild, rereview, re-probe image identity, or re-arm observers again unless new evidence requires it.

## Human M4 session

The sole immediate human action is one combined physical NOTE4 Voice AI session using short, non-sensitive, tool-free prompts.

Protocol:

1. Enter Voice AI using the normal control.
2. Ask one short English factual question, for example: `How many days are in a week?`
3. Wait for the complete assistant response.
4. In the same Voice AI session, ask one short Japanese factual question, for example: `一年は何ヶ月ありますか？`
5. Wait for the complete assistant response.
6. Exit Voice AI using the normal control.

Do not use Search, tools, Calendar, Outlook, or sensitive/private content in this session.

## Human observations to ingest

For each English and Japanese turn ingest the operator's observation of:

```text
USER_BUBBLES=<count>
ASSISTANT_BUBBLES=<count>
FRAGMENT_CREATED_EXTRA_BUBBLES=YES|NO
EXCESSIVE_EINK_REDRAW_CHURN=YES|NO
AUDIO=NORMAL|ABNORMAL|NO_AUDIO
PERCEIVED_RESPONSE_LATENCY_SECONDS=<approximate if available>
```

Also ingest:

```text
VOICE_AI_EXIT=PASS|FAIL
VOICE_SERVICE_UNAVAILABLE=YES|NO
UNEXPECTED_VENDOR_FALLBACK=YES|NO|UNKNOWN
```

A single assistant bubble that updates in place while streaming is not an extra-bubble failure unless separate fragment-created bubbles are actually produced or e-ink redraw churn is excessive.

## Sanitized observer reconciliation

Immediately after the human session reconcile the already-armed serial/backend observers. Preserve privacy boundaries: do not retain raw audio, transcript text, provider payload contents, credentials, auth headers, Calendar data, Outlook data, or private user content.

Capture only sanitized structural evidence such as:

```text
VOICE_CONFIG_AUTHENTICATED_RESULT=
VOICE_CONFIG_PARSE_RESULT=
VOICE_WEBSOCKET_AUTHENTICATED_RESULT=
VOICE_WEBSOCKET_OPEN_RESULT=
VOICE_WEBSOCKET_CLOSE_CODE=
PROVIDER_SESSION_CREATE_START=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
MIC_AUDIO_REACHED_PROVIDER=
FIRMWARE_GENERIC_FAILURE_BRANCH=
SANITIZED_STAGE_LATENCY_DELTAS=
SLATE_RESTART_COUNT=
MYSQL_RESTART_COUNT=
BACKEND_HEALTH=
```

## PASS path

If the physical observations and sanitized structural evidence satisfy acceptance:

- Voice AI service available;
- English turn succeeds;
- Japanese turn succeeds;
- one logical user turn = one user bubble;
- one logical assistant turn = one assistant bubble;
- no fragment-created extra bubbles;
- no excessive e-ink redraw churn;
- normal audio;
- Voice AI exit PASS;
- no unexpected vendor fallback;
- backend and MySQL remain healthy/stable;

then continue automatically without another routine human stop:

```text
M4 result ingestion
-> sanitized observer reconciliation
-> latency/result accounting
-> final backend/firmware/artifact identity reconciliation
-> privacy/security accounting
-> residual-risk accounting
-> final campaign closure dossier
-> final CAMPAIGN-STATE update
```

Do not merge or release PR #2. Campaign closure means the implementation/acceptance campaign is complete while PR #2 remains open/draft/unmerged.

Do not create documentation-only head-refresh loops after closure.

## FAIL path

If `VOICE_SERVICE_UNAVAILABLE` appears, or any M4 acceptance assertion fails, do not ask the human to blindly repeat the session.

First mechanically attribute the exact failing stage from the sanitized observers.

Then continue automatically under existing campaign authority:

```text
sanitized attribution
-> root-cause classification
-> AGY gemini-3.8-flash minimal implementation if code/config bytes require repair
-> Codex deterministic validation
-> impacted backend/firmware rebuild only
-> privacy/secret scan
-> exact artifact freeze
-> fresh ZAI glm-5.3-flash independent exact review if production bytes changed
-> reviewer REVISE repair/retest/rereview loop until PASS
-> reviewed backend redeploy if needed
-> exact app-only firmware reflash if needed
-> post-deploy/post-flash requalification
```

Do not stop at repair, tests, reviewer PASS/REVISE, backend deployment, firmware flash, or report publication while READY/READONLY_READY work remains.

Return to the human only when another physical M4 retest is genuinely the sole remaining useful node or a true authority/security boundary is reached.

Do not change production Gemini model, credentials, provider, billing, private-data authority, Calendar authority, or Outlook authority without separate explicit authorization.

## Exit contract

Before any controller exit record:

```text
CURRENT_HEAD=
CURRENT_STAGE=
M4_STATUS=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
VOICE_SERVICE_UNAVAILABLE=
PROVIDER_SESSION_STARTED=
BACKEND_HEALTH=
FIRMWARE_STATUS=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Do not exit while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`.

Keep PR #2 OPEN / DRAFT / UNMERGED.
