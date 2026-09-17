# Campaign 8D1M-G — M4 Operator Action Now

## Mission

Resume from the live PR #2 M4 physical-session boundary. Operate in `FRONTIER_DRIVEN_LONGRUN`. Live GitHub state is authoritative. Keep PR #2 open, draft, and unmerged.

Current live PR head at publication: `b1fdde5e3268c4076e0446e305d02d20dff4b89d`.

The current campaign report still shows the same accepted state:

```text
M4_STATUS=READY_FOR_ONE_COMBINED_PHYSICAL_SESSION
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_DEVICE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=0
SERIAL_OBSERVER=ARMED_SANITIZED_PORT_OPEN
BACKEND_OBSERVER=ARMED_SANITIZED_REPEATED_HEALTHY_SAMPLES
ACTIVE_BACKEND_IMAGE_ID=sha256:63db9b2133af17d0a755a7149c0fb22e9cfa0fcaad19df31fbac2ebf344def17
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
```

Do not redeploy, reflash, rebuild, rereview, re-probe image identity, or re-arm observers again before the physical test unless fresh evidence proves the accepted state has changed.

## Immediate human action

Perform exactly ONE combined NOTE4 Voice AI session:

1. enter Voice AI;
2. ask one short non-sensitive English factual question;
3. wait for the complete answer;
4. in the same session ask one short non-sensitive Japanese factual question;
5. wait for the complete answer;
6. exit Voice AI.

Suggested prompts:

```text
EN: How many days are in a week?
JA: 一年は何ヶ月ありますか？
```

Do not use Search, tools, Calendar, Outlook, or sensitive/private content.

Observe only:

```text
EN_USER_BUBBLES=
EN_ASSISTANT_BUBBLES=
EN_FRAGMENT_EXTRA_BUBBLES=YES|NO
EN_EINK_REDRAW_CHURN=YES|NO
EN_AUDIO=NORMAL|ABNORMAL|NO_AUDIO
EN_PERCEIVED_LATENCY_SECONDS=

JA_USER_BUBBLES=
JA_ASSISTANT_BUBBLES=
JA_FRAGMENT_EXTRA_BUBBLES=YES|NO
JA_EINK_REDRAW_CHURN=YES|NO
JA_AUDIO=NORMAL|ABNORMAL|NO_AUDIO
JA_PERCEIVED_LATENCY_SECONDS=

VOICE_AI_EXIT=PASS|FAIL
VOICE_SERVICE_UNAVAILABLE=YES|NO
UNEXPECTED_VENDOR_FALLBACK=YES|NO|UNKNOWN
```

A single assistant bubble updating in place is acceptable. Separate fragment-created assistant bubbles or excessive e-ink redraw churn are failures.

## Post-result controller behavior

Immediately ingest the human result and reconcile the already-armed sanitized observers.

Retain no raw audio, transcript text, provider payload contents, auth material, Calendar contents, Outlook contents, or other private data.

Capture only structural results such as:

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

If PASS, continue automatically through final M4 accounting, artifact/backend/firmware identity reconciliation, privacy/security accounting, residual-risk accounting, final campaign closure dossier, and `CAMPAIGN-STATE.md` update. Do not stop for routine confirmation and do not merge/release PR #2.

If FAIL, do not request a blind retry. Attribute mechanically from sanitized evidence, then continue automatically through root-cause analysis, AGY `gemini-3.8-flash` minimal repair where needed, Codex deterministic validation, impacted rebuilds, secret/privacy scan, exact artifact freeze, fresh ZAI `glm-5.3-flash` exact review for any changed production bytes, reviewer REVISE loops, reviewed redeploy/reflash, and zero-private-data requalification. Return to the human only when another physical M4 retest is genuinely the sole remaining useful node or a true authority/security boundary is reached.

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
