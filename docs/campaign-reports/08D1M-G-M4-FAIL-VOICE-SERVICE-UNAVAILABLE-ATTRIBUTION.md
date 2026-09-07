# Campaign 8D1M-G — M4 Voice Service Unavailable Attribution and Recovery

## Operator result

The sole combined physical M4 attempt failed immediately with the operator-visible result:

```text
VOICE_SERVICE_UNAVAILABLE=YES
```

Do not ask the operator to retry Voice AI again at this stage.

## Mission

Resume from live PR #2 under `FRONTIER_DRIVEN_LONGRUN`. Live GitHub state is authoritative. Keep PR #2 OPEN / DRAFT / UNMERGED.

Current instruction publication head was `3a093eede770385fbd25cd09752c68ce09ca9240`; reconcile before execution and do not create documentation-only head-refresh loops.

The exact reviewed backend and app-only firmware were already deployed and the sanitized serial/backend observers were armed before this physical attempt. Therefore the immediate job is to ingest those already-running observers before re-arming, redeploying, reflashing, rebuilding, or repeating the physical session.

## Immediate attribution sequence

1. Preserve and read the existing sanitized serial observer output from the failed attempt.
2. Preserve and read the existing sanitized backend observer output from the failed attempt.
3. Do not retain or surface raw microphone audio, transcript text, provider payload contents, credentials, auth headers, Calendar data, Outlook data, or private content.
4. Correlate timestamps and mechanically resolve as many of the following as the evidence supports:

```text
VOICE_CONFIG_REQUEST_START=
VOICE_CONFIG_AUTHENTICATED_RESULT=
VOICE_CONFIG_RESPONSE_CLASS=
VOICE_CONFIG_PARSE_RESULT=
VOICE_WS_CONNECT_START=
VOICE_WEBSOCKET_AUTHENTICATED_RESULT=
VOICE_WEBSOCKET_OPEN_RESULT=
VOICE_WEBSOCKET_CLOSE_CODE=
VOICE_SESSION_INIT_SENT=
PROVIDER_SESSION_CREATE_START=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
VOICE_MIC_STREAM_STARTED=
FIRST_MIC_FRAME_RECEIVED=
MIC_AUDIO_REACHED_PROVIDER=
FIRMWARE_GENERIC_FAILURE_BRANCH=
SANITIZED_STAGE_LATENCY_DELTAS=
SLATE_RESTART_COUNT=
MYSQL_RESTART_COUNT=
BACKEND_HEALTH=
```

Do not infer PASS from an absent marker. Classify unknowns explicitly.

## Root-cause classification

Use the structural evidence to select the narrowest supported branch, for example:

- authenticated voice-config request rejected;
- voice-config response malformed/parse failure;
- firmware transport/TLS failure before WebSocket open;
- authenticated WebSocket rejected or closed;
- provider session creation failed;
- provider session started but microphone stream did not start;
- microphone reached backend but not provider;
- provider-side failure after session creation;
- firmware generic-failure mapping defect;
- observer/instrumentation gap.

Do not jump directly to credential, provider, model, or billing changes unless the evidence proves a genuine authority boundary.

## Continue automatically after attribution

If the cause is repairable under existing campaign authority, continue without another human stop:

```text
sanitized attribution
-> root-cause matrix
-> AGY gemini-3.8-flash minimal implementation where code/config bytes require repair
-> Codex deterministic validation
-> targeted backend/firmware tests
-> privacy/logging tests
-> secret scan
-> rebuild impacted artifacts only
-> freeze exact new identities
-> fresh ZAI glm-5.3-flash independent exact review for every changed production byte set
-> automatic REVISE -> repair -> retest -> rereview loop until PASS
-> reviewed backend redeploy if required
-> exact app-only NOTE4 reflash if required
-> post-deploy/post-flash health and identity verification
-> re-arm sanitized observers
```

A reviewer REVISE, deterministic test failure, repair completion, deployment PASS, flash PASS, or report publication is not a terminal stop while READY / READONLY_READY work remains.

Only return to the operator when another physical M4 retest is genuinely the sole remaining useful node or a real authority/security boundary exists.

## Important invariants

Do not:

- manually retry the current physical session;
- deploy or flash unreviewed changed production bytes;
- change production Gemini model;
- change credentials, provider, endpoint authority, billing, or private-data authority without explicit authorization;
- change Calendar/Outlook authority;
- merge or release PR #2;
- delete rollback roots/backups;
- repartition NVMe;
- touch Deluge data.

If the already-armed observer evidence is insufficient to attribute the failure, treat that as a software/instrumentation frontier first. Add the minimum additional privacy-preserving structural observability, qualify/review/redeploy/reflash it as required, and only then request one new physical retest.

## Exit contract

Before any controller exit record:

```text
CURRENT_HEAD=
CURRENT_STAGE=
M4_STATUS=
VOICE_SERVICE_UNAVAILABLE=YES
VOICE_CONFIG_AUTHENTICATED_RESULT=
VOICE_CONFIG_PARSE_RESULT=
VOICE_WEBSOCKET_AUTHENTICATED_RESULT=
VOICE_WEBSOCKET_OPEN_RESULT=
VOICE_WEBSOCKET_CLOSE_CODE=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
MIC_AUDIO_REACHED_PROVIDER=
FIRMWARE_GENERIC_FAILURE_BRANCH=
ROOT_CAUSE_CLASS=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
BACKEND_HEALTH=
FIRMWARE_STATUS=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Do not exit while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`.

Keep PR #2 OPEN / DRAFT / UNMERGED.
