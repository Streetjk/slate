# Campaign 8D1M-G — Post-repair combined M4 acceptance and numeric latency ingest

## Live reconciliation at issue

Issued after reconciling PR #2 at live head `36a1250e83054c34e487be3b750c35093c391595`.

```text
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
HEAD_BRANCH=feature/gemini-35-live-evaluation
BASE_BRANCH=integration/note4-custom
RUNTIME_SOURCE_HEAD=7acb8b96a02130dd0de8b21bc39e3fc43355da5f
CURRENT_STAGE=M4_REPAIR_DEPLOYED_APP_ONLY_REFLASHED_OBSERVER_REARMED_WAITING_COMBINED_ACCEPTANCE
BACKEND_ACTIVE_TAG=slate:m4-slow-turn-order-jp-7acb8b9
FIRMWARE_ACTIVE_APP_SHA256=4ea31710c6dfd5bff025b5282f2dd5edd49117eacfe4161988dcde0df820c298
OBSERVER_PORT=/dev/cu.usbmodem31101
READY_NODE_COUNT=0
READONLY_READY_COUNT=0
WAITING_HUMAN_COUNT=1
```

Before acting, re-fetch live PR #2 and `docs/campaign-reports/CAMPAIGN-STATE.md` at the exact live head. If GitHub has advanced, reconcile the newer frontier and preserve this instruction's intent rather than replaying stale state.

Keep PR #2 OPEN / DRAFT / UNMERGED. Do not merge or release.

## Established nonphysical results

Treat these as already proven and do not rerun them without contradictory evidence:

```text
TURN_ORDER_ROOT_CAUSE=INPUT_TRANSCRIPT_FLUSHED_AT_TURN_COMPLETE_PLUS_FIRMWARE_ARRIVAL_ORDER
TURN_ORDER_REPAIR_STATUS=PASS_DETERMINISTIC_TESTS_AND_FRESH_ZAI_REVIEW;STREAMING_PRESERVED
JP_GLYPH_ROOT_CAUSE=ZFULL_16_GB2312_ORIENTED_WITHOUT_U+306E_CMAP
JP_GLYPH_REPAIR_STATUS=PASS_COVERAGE_AND_FRESH_ZAI_REVIEW;NO_TRANSLITERATION
ENGLISH_CHINESE_RENDERING=PASS_COVERAGE_REGRESSION
JP_FONT_BINARY_DELTA_BYTES=26976_FINAL_FIRMWARE_OVER_BASELINE
VOICE_SERVICE_ERROR=NO_FOR_LATEST_PRE_REPAIR_FUNCTIONAL_SESSION
PROVIDER_SESSION_CREATE_RESULT=PASS
PROVIDER_SESSION_STARTED=YES
FIRST_MIC_FRAME_RECEIVED=YES
VOICE_RESPONSE_LATENCY_MS_OR_RANGE=OPERATOR_REPORTED_APPROX_10000_MS_PLUS_ON_PRE_NUMERIC_MARKER_IMAGE
DOMINANT_LATENCY_STAGE=UNDETERMINED_PRE_INSTRUMENTED_OBSERVER_GAP
AUDIO_ACCEPTANCE=OPEN
```

The exact reviewed backend and firmware are deployed, the app-only reflash passed exact readback hash verification, Slate/MySQL/local/public health are green, and the corrected sanitized observer is rearmed. Therefore one physical acceptance session is a legitimate human boundary.

## Exactly one combined physical acceptance session

Ask the operator for ONE normal Voice AI session only. Do not ask for repeated retries while ingest/analysis can continue.

1. Enter Voice AI normally.
2. Start once with short ENTER.
3. Ask one short English question, preferably `What time is it?`.
4. Observe:
   - whether the user question bubble appears before the assistant answer;
   - whether the assistant answer updates in one logical assistant bubble;
   - whether audible assistant audio is heard;
   - whether `Voice service error` appears;
   - subjective time from end of speaking to first visible assistant response: FAST / ACCEPTABLE / SLOW / VERY_SLOW, and an approximate seconds estimate if obvious.
5. If the session remains usable, ask one short Japanese question, preferably `今日の曜日は何ですか？`.
6. Observe:
   - correct Hiragana, especially `の` rendered as `の`, not `ㄇ` or another wrong glyph;
   - Katakana/Japanese punctuation if present;
   - correct user-before-assistant bubble order;
   - audible audio;
   - subjective latency.
7. Exit normally if the session remains open.

The operator only needs to report concise physical observations. Do not require exact stopwatch timing because the deployed sanitized numeric markers must provide the technical decomposition.

## Immediate observer ingest after the one session

Treat the human boundary as consumed immediately after the single session:

```text
WAITING_HUMAN_COUNT=0
HUMAN_ACTION_REQUIRED=NO
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
```

unless a true new authority/safety boundary is reached.

Ingest the already-running corrected sanitized observer before any speculative code change. Never retain raw mic audio, PCM, transcripts, provider payloads, credentials, auth headers, Calendar/Outlook contents, or raw serial lines.

Capture the numeric/sanitized chain as available, including:

```text
VOICE_WS_CONNECT_RESULT=
VOICE_WS_AUTH_RESULT=
VOICE_WS_ACCEPTED=
VOICE_SESSION_INIT_SENT=
VOICE_MIC_STREAM_STARTED=
FIRST_MIC_FRAME_RECEIVED=
PROVIDER_SESSION_CREATE_START=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
T_LISTEN_START=
T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN=
T_FIRST_MIC_FRAME=
T_PROVIDER_FIRST_OUTPUT_EVENT=
T_PROVIDER_FIRST_AUDIO_EVENT=
T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=
T_FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED=
T_FIRMWARE_FIRST_AUDIO_PACKET_ACCEPTED=
T_FIRMWARE_FIRST_DECODED_PCM=
T_AUDIO_PLAYER_FIRST_WRITE=
T_UI_RENDER_REQUEST=
TRANSCRIPT_UPDATE_COUNT=
EPD_REFRESH_COUNT_DURING_RESPONSE=
```

Derive bounded stage latencies rather than relying only on the operator estimate. At minimum classify:

```text
SESSION_SETUP_LATENCY_MS=
MIC_START_LATENCY_MS=
END_OF_SPEECH_OR_STOP_TO_PROVIDER_FIRST_OUTPUT_MS=
PROVIDER_FIRST_OUTPUT_TO_BACKEND_TRANSCRIPT_MS=
BACKEND_TRANSCRIPT_TO_FIRMWARE_UI_REQUEST_MS=
FIRMWARE_UI_REQUEST_TO_VISIBLE_REFRESH_MS_OR_RANGE=
PROVIDER_FIRST_AUDIO_TO_BACKEND_PACKET_MS=
BACKEND_PACKET_TO_FIRMWARE_RECEIVE_MS=
FIRMWARE_RECEIVE_TO_DECODED_PCM_MS=
DECODED_PCM_TO_AUDIO_PLAYER_WRITE_MS=
DOMINANT_LATENCY_STAGE=
```

If exact end-of-speech timing is still not instrumented, state that explicitly and isolate the largest provable buckets. Do not invent precision.

## Required acceptance classifications

Publish:

```text
LATEST_POST_REPAIR_PHYSICAL_SESSION_INGESTED=YES
EN_SESSION_RESULT=
JA_SESSION_RESULT=
VOICE_SERVICE_ERROR=YES|NO
TURN_ORDER_PHYSICAL_ACCEPTANCE=PASS|FAIL|UNKNOWN
ONE_USER_BUBBLE_PER_TURN=PASS|FAIL|UNKNOWN
ONE_ASSISTANT_BUBBLE_PER_TURN=PASS|FAIL|UNKNOWN
JP_HIRAGANA_RENDERING=PASS|FAIL|UNKNOWN
JP_KATAKANA_RENDERING=PASS|FAIL|UNKNOWN
JP_U306E_RENDERING=PASS|FAIL|UNKNOWN
AUDIBLE_AUDIO_EN=YES|NO|UNKNOWN
AUDIBLE_AUDIO_JA=YES|NO|UNKNOWN
AUDIO_FAILURE_STAGE=
VOICE_RESPONSE_LATENCY_MS_OR_RANGE=
TEXT_VISIBLE_LATENCY_MS_OR_RANGE=
DOMINANT_LATENCY_STAGE=
NEXT_AUTONOMOUS_ACTION=
```

## Autonomous continuation

- If turn order still fails, prove whether the failure is backend protocol order, firmware snapshot insertion/upsert, or render-order state before modifying code.
- If Japanese glyphs still fail, prove whether UTF-8/cmap/font fallback selection is wrong. Do not transliterate Japanese and do not replace the entire firmware font stack without size justification.
- If audible audio is absent, continue the provider -> bridge -> backend PCM/Opus -> binary WS -> firmware receive/state gate -> decode -> player -> codec/I2S/amplifier trace automatically.
- If latency remains poor, use the new numeric markers to identify the dominant stage before repair. Do not mask provider/VAD latency by delaying or batching UI text.
- Preserve immediate/streaming assistant text and correct USER -> ASSISTANT ordering.
- Preserve bounded pre-provider mic queue, one logical user bubble, one logical assistant bubble, and in-place e-ink update unless evidence directly implicates them.
- No provider/model/credential/billing/private-data authority changes without new human approval.

Any runtime-byte repair must follow:

```text
evidence
-> Codex adjudication
-> designated AGY Gemini 3.8 Flash minimal repair
-> deterministic regression
-> impacted validation
-> privacy/secret scan
-> exact build/freeze
-> fresh ZAI glm-5.3-flash exact review
-> bounded deployment/app-only reflash if authorized
-> requalification
-> observer rearm
```

Do not ask the operator for another physical attempt until READY and READONLY_READY are both zero again.

Before stopping, publish the full FRONTIER_DRIVEN_LONGRUN frontier fields and push every meaningful checkpoint/state change to GitHub.