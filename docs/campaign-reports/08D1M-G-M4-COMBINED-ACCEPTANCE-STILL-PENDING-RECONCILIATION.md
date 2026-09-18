# Campaign 8D1M-G — Combined acceptance still pending reconciliation

## Live reconciliation

Issued after re-fetching PR #2 and `CAMPAIGN-STATE.md` at exact live head `fcfa69d6b4cfef4ce39219c30249e379e548d4f1`.

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
TERMINAL_REASON=PHYSICAL_BOUNDARY_ONLY
```

The live repository has not yet recorded ingestion of a newer EN/JA acceptance session after deployment of the reviewed bubble-order repair, Japanese font repair, and numeric timing instrumentation.

## Required behavior

Do not modify source, provider/model/credential/billing/private-data authority, backend deployment, or firmware while this physical boundary remains unconsumed.

If the operator has **not** yet run the repaired acceptance session, wait for exactly one combined physical Voice AI session:

1. English: `What time is it?`
2. Verify user bubble precedes assistant bubble, one logical bubble per role, audible assistant audio, Voice-service-error status, and perceived latency.
3. If the same session remains usable, Japanese: `今日の曜日は何ですか？`
4. Verify correct Japanese rendering, especially `の`, correct bubble ordering, audible assistant audio, and perceived latency.
5. Exit normally.

Do not ask for repeated retries.

If the operator **has already completed** this physical session, treat the human boundary as consumed immediately and ingest the already-running sanitized observer before any code change. Do not ask the operator to repeat the test merely because the durable state has not yet been updated.

## Post-session ingest

Publish numeric/structural attribution for:

```text
LATEST_REPAIRED_COMBINED_ACCEPTANCE_INGESTED=YES
VOICE_SERVICE_ERROR=
EN_TURN_ORDER=
JA_TURN_ORDER=
EN_ONE_USER_BUBBLE=
EN_ONE_ASSISTANT_BUBBLE=
JA_ONE_USER_BUBBLE=
JA_ONE_ASSISTANT_BUBBLE=
JP_U306E_RENDERING=
EN_AUDIBLE_AUDIO=
JA_AUDIBLE_AUDIO=
PROVIDER_SESSION_STARTED=
FIRST_MIC_FRAME_RECEIVED=
PROVIDER_FIRST_OUTPUT_EVENT=
PROVIDER_FIRST_AUDIO_EVENT=
BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=
FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED=
FIRMWARE_FIRST_DECODED_PCM=
AUDIO_PLAYER_FIRST_WRITE=
AUDIO_PLAYER_WRITE_RESULT=
VOICE_RESPONSE_LATENCY_MS_OR_RANGE=
TEXT_VISIBLE_LATENCY_MS_OR_RANGE=
DOMINANT_LATENCY_STAGE=
AUDIO_FAILURE_STAGE=
NEXT_AUTONOMOUS_ACTION=
```

Use only sanitized timing/structural markers. Do not retain raw transcript, raw serial content, audio/PCM, provider payloads, credentials, auth headers, Calendar/Outlook contents, or other private data.

If latency remains high, identify the dominant measured stage before changing code. If audio is silent, continue automatically from the first broken provider/backend/firmware/player boundary. If ordering or Japanese rendering fails, prove the exact remaining layer before repair.

Any runtime-byte repair must use the established loop:

```text
evidence -> Codex adjudication -> designated AGY Gemini 3.8 Flash -> deterministic regression -> impacted validation -> privacy/secret scan -> exact build/freeze -> fresh ZAI glm-5.3-flash review -> bounded deployment/app-only flash if authorized -> requalification -> observer rearm
```

Keep PR #2 OPEN / DRAFT / UNMERGED.
