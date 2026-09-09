# Campaign 8D1M-G M4 — physical soak consumed; input-latency / ASR follow-up

## Purpose

The operator has now completed the single authorized 8-turn EN/JA Voice AI physical soak. This physical boundary is consumed and must not be repeated blindly.

The operator-reported user-visible observations are:

```text
PHYSICAL_SOAK_CONSUMED=YES
TARGET_TURN_COUNT=8
ASSISTANT_REPLY_SPEED=IMPROVED_QUICKER
AUDIO_INPUT_PROCESSING_AND_DISPLAY=SIGNIFICANTLY_SLOWER
JAPANESE_RECOGNITION=OCCASIONALLY_MISHEARD_OR_TRANSCRIBED_AS_CHINESE
OPERATOR_CONTEXT_ON_LANGUAGE_MISRECOGNITION=ACCENT_MAY_PLAUSIBLY_CONTRIBUTE
```

Do not reinterpret the accent comment as proof of root cause. Treat it only as operator context. Mechanically determine the actual speech-input / transcription / language-identification behavior from sanitized structural evidence and current code/runtime behavior.

This report supplements and remains controlled by:

- `docs/campaign-reports/08D1M-G-M4-LONG-CONTINUOUS-CAMPAIGN.md`
- `docs/campaign-reports/08D1M-G-M4-EXACT-COMBINED-EN-JA-MULTITURN-SOAK.md`
- `docs/campaign-reports/AUTONOMY-AND-HUMAN-GATE-POLICY.md`
- `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`

PR #2 must remain OPEN / DRAFT / UNMERGED.

## Immediate controller behavior

Reconcile the exact live PR head, running backend image/config, active firmware identity, observer state, Slate/MySQL health, and the sanitized evidence captured during the already-consumed 8-turn session.

Do not request another physical session merely because some acceptance fields were not verbally reported by the operator. Use the already-armed instrumentation first and preserve `UNKNOWN` where evidence is genuinely unavailable.

Do not reset, re-pair, reflash, change Wi-Fi, change Gemini provider/model/auth, consume new provider budget, change credentials, or change private-data authority during ingestion.

## Required physical-soak classification

Populate the full consumed-session result using operator-visible evidence plus sanitized instrumentation:

```text
PHYSICAL_SOAK_CONSUMED=YES
TURN_COUNT_OBSERVED=
EARLY_TURN_LATENCY_CLASS=
LATE_TURN_LATENCY_CLASS=
PROGRESSIVE_LATENCY_DEGRADATION=
APPARENT_FREEZE=
VOICE_SERVICE_ERROR=
BUBBLE_ORDER_CORRECT=
ONE_BUBBLE_PER_ROLE_BEHAVIOR=
JAPANESE_KANA_RENDERING=
JAPANESE_NO_GLYPH=
AUDIBLE_ASSISTANT_AUDIO=
VOICE_AI_EXIT=
UNEXPECTED_REBOOT_OR_SETTINGS_RETURN=
ASSISTANT_REPLY_SPEED_CLASS=IMPROVED_QUICKER_OPERATOR_REPORTED
AUDIO_INPUT_PROCESSING_DISPLAY_CLASS=SIGNIFICANTLY_SLOWER_OPERATOR_REPORTED
JAPANESE_ASR_LANGUAGE_CONFUSION=YES_OPERATOR_REPORTED_CHINESE_MISRECOGNITION
```

Do not infer PASS for unreported items solely from silence. Use instrumentation where available.

## New dominant issue split

The new operator evidence suggests the dominant remaining latency may have shifted from output/reply latency to the speech-input / recognition / transcript-display path.

Mechanically split the end-to-end turn into at least these boundaries where current instrumentation or code permits:

```text
T_LISTEN_START
T_FIRST_MIC_FRAME
T_LAST_MEANINGFUL_MIC_FRAME_OR_VAD_END
T_AUDIO_INPUT_COMMIT_OR_TURN_END
T_PROVIDER_INPUT_TRANSCRIPTION_FIRST_PARTIAL
T_PROVIDER_INPUT_TRANSCRIPTION_FINAL
T_BACKEND_USER_TRANSCRIPT_FLUSH
T_USER_BUBBLE_EVENT_POSTED
T_USER_BUBBLE_FIRST_VISIBLE
T_PROVIDER_READY
T_PROVIDER_FIRST_OUTPUT
T_ASSISTANT_FIRST_VISIBLE
T_AUDIO_OUTPUT_FIRST_FRAME
```

Derive only supported deltas, for example:

```text
MIC_START_LATENCY_MS=
SPEECH_END_TO_INPUT_COMMIT_MS=
INPUT_COMMIT_TO_TRANSCRIPT_PARTIAL_MS=
INPUT_COMMIT_TO_TRANSCRIPT_FINAL_MS=
TRANSCRIPT_FINAL_TO_BACKEND_FLUSH_MS=
BACKEND_FLUSH_TO_USER_BUBBLE_VISIBLE_MS=
INPUT_COMMIT_TO_PROVIDER_FIRST_OUTPUT_MS=
PROVIDER_READY_TO_FIRST_OUTPUT_MS=
```

If exact display visibility timing is not available, use the narrowest existing backend/firmware structural proxy and label it accurately.

## Input-latency diagnosis priorities

Investigate in this order without consuming new provider authority unless already available under an existing bounded authorization:

1. **Turn-end detection / VAD / silence tail**
   - determine whether the system waits too long after speech ends before committing the turn;
   - inspect any provider-side automatic activity detection, local VAD, silence duration, end-of-speech, or explicit activity-end settings;
   - distinguish slow speech-end detection from slow transcription.

2. **Input transcription finalization**
   - compare first partial versus final transcript timing;
   - determine whether the UI waits unnecessarily for a final transcript even when a useful partial is already available;
   - inspect whether current code intentionally delays user-bubble flush until turn-complete/finalization.

3. **Backend transcript flush / event coalescing**
   - verify the earlier ordering repair did not introduce unnecessary transcript-display delay;
   - inspect batching/coalescing interval, stale-generation guards, queue depth and event-post timing;
   - preserve one logical user turn = one bubble while reducing display latency.

4. **Firmware UI/render path**
   - inspect whether the user-bubble update is queued behind assistant/audio/UI work;
   - inspect coalesced Xiaozhi-change events, queue depth and e-ink redraw policy;
   - do not reintroduce the prior progressive event-backpressure failure.

5. **Bridge/provider input path**
   - inspect Node bridge stdio buffering, microphone framing/chunk cadence, pre-provider queue and any buffering thresholds;
   - confirm audio frames are streamed continuously rather than held until end-of-turn.

6. **Context growth / long-session effects**
   - compare early and late input-processing deltas separately from reply-output deltas;
   - determine whether the input side itself degrades across turns or is consistently slow.

Do not conflate faster assistant replies with faster user transcript display. Measure and classify the two directions separately.

## Japanese vs Chinese recognition / language-identification diagnosis

The operator reported that some Japanese speech was recognized as Chinese. Treat this as a bilingual ASR/language-disambiguation issue, not automatically as a pronunciation fault.

Inspect the actual production path and current official/provider-supported behavior before changing anything:

- determine whether input transcription uses provider automatic language identification, a fixed language, session instructions, a separate STT path, or implicit Live-model transcription;
- determine whether the current EN/JA alternating test supplies any language expectation to the transcription path;
- inspect whether a session-level language hint, per-turn language context, supported BCP-47 input language configuration, transcription configuration, or system-instruction bias exists in the currently used Gemini Live/runtime APIs;
- verify whether such a hint affects transcription itself versus only model response behavior;
- do not invent unsupported provider parameters;
- do not force Japanese globally if the product is intended to accept English and Japanese in the same session;
- do not disable future Chinese use unless that is a separately approved product decision.

Prefer a minimum-footprint disambiguation mechanism that preserves bilingual EN/JA operation. Candidate mechanisms may include, only if actually supported and justified:

1. explicit supported transcription-language hinting;
2. turn/session language expectation carried by Slate when the operator is intentionally running a known language mode;
3. conservative hysteresis/priors favoring the currently established session language without blocking switches;
4. display-side correction only when the provider emits a reliable language metadata signal;
5. prompt/session instruction bias only if provider documentation and controlled tests show it materially affects input transcription.

Do not silently rewrite or translate user transcripts. Preserve user intent and raw-provider privacy constraints.

## Stability acceptance versus new optimization nodes

The consumed soak was primarily intended to validate the prior progressive-lag/freeze repair.

If sanitized evidence plus operator observations support:

- no progressive latency degradation;
- no apparent freeze;
- no unexpected reset/watchdog;
- correct bubble order / bounded bubble behavior;
- healthy Slate/MySQL;

then close the **progressive-lag/freeze stability node** even if speech-input processing remains slow.

Do not hold the stability repair open merely because a distinct input-latency or ASR-language issue remains.

When justified, create separate in-scope nodes:

```text
M4_AUDIO_INPUT_TRANSCRIPT_LATENCY_OPTIMIZATION
M4_BILINGUAL_ASR_LANGUAGE_DISAMBIGUATION
```

These nodes may remain READY and must be pursued automatically under the long-run policy using all safe deterministic/provider-disabled work.

Japanese glyph rendering and audible assistant audio remain separate acceptance fields. Do not mark them PASS unless the consumed physical session or sanitized evidence actually supports them.

## Bounded repair/review loop

If deterministic evidence justifies product-byte changes:

```text
CODEX_ADJUDICATION
  -> AGY_IMPLEMENTATION=gemini-3.8-flash-high
  -> FOCUSED_TESTS
  -> IMPACTED_TYPECHECK_LINT_FORMAT_BUILD
  -> REPLAY_OR_HOST_SOAK
  -> PRIVACY_SECRET_SCAN
  -> GIT_DIFF_CHECK
  -> EXACT_SOURCE_ARTIFACT_FREEZE
  -> FRESH_GROK_4_6_REVIEW
```

Use Grok 4.6 only through the established route:

`grok -m grok-4.6`

No ZAI retry. No silent reviewer fallback.

If Grok returns REVISE, Codex adjudicates findings, accepts only justified ones, sends the minimum repair to the same AGY worker, reruns deterministic gates, freezes a new exact source/artifact, and requests a fresh Grok 4.6 review automatically.

Do not stop at review PASS while READY/READONLY_READY work remains.

## Provider/deployment/flash authority

This directive does not itself authorize a new provider session, production deploy/restart, firmware flash, credential change, OAuth action, billing change, private-data expansion, Calendar/Outlook action, merge or release.

If a changed candidate can be fully qualified without crossing one of those gates, do so automatically.

If new provider/deployment/flash authority becomes genuinely necessary, stop only after:

- the candidate is fully qualified and reviewed;
- the exact hypothesis is written;
- the exact source/artifact identity is frozen;
- the minimum required provider-session/deploy/flash scope is stated;
- all remaining safe work is exhausted.

## Durable checkpoint requirements

The existing top of `CAMPAIGN-STATE.md` is stale and still describes the soak as pending. Correct it at the next durable checkpoint.

The new top authoritative frontier must record the consumed physical session and the exact current work queue.

At every meaningful checkpoint preserve `REPORT-PUSH-INVARIANT.md` and publish:

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

Rules:

- do not exit with READY_NODE_COUNT > 0;
- do not exit with READONLY_READY_NODE_COUNT > 0;
- do not ask for an immediate repeat of the consumed 8-turn soak;
- continue all safe diagnosis / implementation / validation / Grok loops automatically;
- keep PR #2 OPEN / DRAFT / UNMERGED;
- do not expand into Campaign 9 / PR #3.

## Immediate next action

Ingest the already-consumed 8-turn physical session now. Reconcile the sanitized evidence, classify whether the prior progressive-lag/freeze node passes, and split any remaining issues into speech-input/transcript latency and bilingual ASR language-disambiguation nodes. Then continue the long-run campaign automatically until a true human-only authority boundary or campaign completion is reached.

## Consumed-session ingestion — 59ce9a8

The exact live PR head was independently reconciled before ingestion:

```text
LIVE_PR_HEAD=59ce9a83f552104f664a6a7ae0846fffce44d3e3
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
PHYSICAL_SOAK_CONSUMED=YES
TARGET_TURN_COUNT=8
TURN_COUNT_OBSERVED=8_OPERATOR_CONFIRMED;9_UNIQUE_VOICE_TURN_START_MARKERS_CAPTURED
EARLY_TURN_LATENCY_CLASS=IMPROVED_QUICKER_OPERATOR_REPORTED
LATE_TURN_LATENCY_CLASS=INPUT_PROCESSING_DISPLAY_SLOW_OPERATOR_REPORTED;TURN_8_PROVIDER_READY_TO_FIRST_OUTPUT_30281_MS
PROGRESSIVE_LATENCY_DEGRADATION=UNKNOWN_NOT_PROVEN
APPARENT_FREEZE=UNKNOWN_NOT_REPORTED
VOICE_SERVICE_ERROR=NO_STRUCTURAL_ERROR_CAPTURED
BUBBLE_ORDER_CORRECT=UNKNOWN_NOT_REPORTED
ONE_BUBBLE_PER_ROLE_BEHAVIOR=UNKNOWN_NOT_REPORTED
JAPANESE_KANA_RENDERING=UNKNOWN_NOT_REPORTED
JAPANESE_NO_GLYPH=UNKNOWN_NOT_REPORTED
AUDIBLE_ASSISTANT_AUDIO=UNKNOWN_NOT_REPORTED;OUTPUT_AUDIO_MARKER_NOT_CAPTURED
VOICE_AI_EXIT=UNKNOWN_NOT_REPORTED
UNEXPECTED_REBOOT_OR_SETTINGS_RETURN=UNKNOWN_NO_RESET_WATCHDOG_FATAL_MARKERS;EXIT_STATUS_NOT_CAPTURED
JAPANESE_ASR_LANGUAGE_CONFUSION=YES_OPERATOR_REPORTED_CHINESE_MISRECOGNITION
ASSISTANT_REPLY_SPEED_CLASS=IMPROVED_QUICKER_OPERATOR_REPORTED
AUDIO_INPUT_PROCESSING_DISPLAY_CLASS=SIGNIFICANTLY_SLOWER_OPERATOR_REPORTED
M4_PROGRESSIVE_LAG_FREEZE_ACCEPTANCE=OPEN_AMBIGUOUS_NOT_CLOSED
```

The operator-confirmed count is authoritative for the requested eight-turn boundary. The ninth unique listen-start marker is recorded as an instrumentation anomaly/out-of-scope marker, not silently counted as a ninth requested turn.

### Sanitized structural evidence

The existing observer remained running and connected (`slate-m4-sanitized-observer-v2`, serial `/dev/cu.usbmodem31101`, self-test PASS). The consumed capture contained `VOICE_WS_CONNECT_RESULT=OPEN`, `VOICE_WS_AUTH_RESULT=PASS`, `VOICE_WS_ACCEPTED=YES`, `VOICE_WS_UPGRADE_ATTEMPT=YES`, `VOICE_SESSION_INIT_SENT=YES`, `VOICE_MIC_STREAM_STARTED=YES`, and `FIRST_MIC_FRAME_RECEIVED=YES`. No `VOICE_SERVICE_ERROR`, fatal, reset, watchdog, or WebSocket-close marker was captured. This supports no structural Voice-service failure, but does not prove downstream audible playback or normal exit.

The eight provider-ready-to-first-output deltas were:

```text
TURN_1=9747_MS
TURN_2=12954_MS
TURN_3=9715_MS
TURN_4=10361_MS
TURN_5=8869_MS
TURN_6=8402_MS
TURN_7=8877_MS
TURN_8=30281_MS
```

Turns 1–7 are non-monotonic; turn 8 is a late outlier. Therefore a progressive leak/backlog is not mechanically proven, while the provider/output stage is measurably high and the operator separately reports slow input processing/display.

Available structural queue/resource evidence was bounded: pre-provider mic buffering reached at most the observed 30-frame/4385-byte sample and reset between bursts; UI queue waiting stayed `0` with `64` spaces; decode and playback queues stayed `0`; send queue was `0/1`; PSRAM stayed approximately `8.09–8.105 MB`; sampled internal heap was variable (`11095–25651` bytes) without a monotonic trend. Node stdio backlog, backend transcript flush timing, user-bubble visibility, VAD/end-of-speech, input partial/final timing, provider input transcription timing, and downstream provider-audio-to-player timing were not captured. All unsupported derived fields are `UNAVAILABLE_NOT_INSTRUMENTED`, not PASS.

```text
T_LISTEN_START=CAPTURED_AS_T_DEVICE_LISTEN_START
T_FIRST_MIC_FRAME=CAPTURED_AS_T_FIRST_DEVICE_AUDIO_SENT_AND_T_BACKEND_FIRST_AUDIO_RECEIVED
T_LAST_MEANINGFUL_MIC_FRAME_OR_VAD_END=UNAVAILABLE
T_AUDIO_INPUT_COMMIT_OR_TURN_END=UNAVAILABLE
T_PROVIDER_INPUT_TRANSCRIPTION_FIRST_PARTIAL=UNAVAILABLE
T_PROVIDER_INPUT_TRANSCRIPTION_FINAL=UNAVAILABLE;T_TRANSCRIPT_FINALIZED_IS_TURN_COMPLETE_MARKER
T_BACKEND_USER_TRANSCRIPT_FLUSH=UNAVAILABLE
T_USER_BUBBLE_EVENT_POSTED=UNAVAILABLE
T_USER_BUBBLE_FIRST_VISIBLE=UNAVAILABLE
T_PROVIDER_READY=CAPTURED
T_PROVIDER_FIRST_OUTPUT=CAPTURED
T_ASSISTANT_FIRST_VISIBLE=UNAVAILABLE
T_AUDIO_OUTPUT_FIRST_FRAME=UNAVAILABLE
SPEECH_END_TO_INPUT_COMMIT_MS=UNAVAILABLE
INPUT_COMMIT_TO_TRANSCRIPT_PARTIAL_MS=UNAVAILABLE
INPUT_COMMIT_TO_TRANSCRIPT_FINAL_MS=UNAVAILABLE
TRANSCRIPT_FINAL_TO_BACKEND_FLUSH_MS=UNAVAILABLE
BACKEND_FLUSH_TO_USER_BUBBLE_VISIBLE_MS=UNAVAILABLE
INPUT_COMMIT_TO_PROVIDER_FIRST_OUTPUT_MS=UNAVAILABLE
PROVIDER_READY_TO_FIRST_OUTPUT_MS=8402..30281_CAPTURED
```

### ASR/language diagnosis

The deployed path uses Gemini Live input transcription. Both direct SDK and Node bridge configs currently send `inputAudioTranscription: {}`; omitted language codes therefore leave language detection automatic. The Slate `language` value is currently used in the response/system-language instruction and is not passed as an input-transcription language hint. Current `@google/genai` v2.20.0 types expose `AudioTranscriptionConfig.languageCodes?: string[]`, and the official Live transcription contract supports BCP-47 hints including English and Japanese while retaining automatic detection for multiple supplied languages. This is a provider-supported transcription setting, not a display rewrite or response-only instruction.

The smallest justified candidate is a bilingual hint in both actual runtime paths:

```text
inputAudioTranscription: { languageCodes: ['en-US', 'ja-JP'] }
```

It does not globally force Japanese, does not transliterate or translate text, does not change provider/model/auth/credentials, and preserves EN/JA switching. It requires deterministic config tests; real-provider efficacy is not claimed without an authorized future provider session.

The safe work queue is split into:

```text
M4_AUDIO_INPUT_TRANSCRIPT_LATENCY_OPTIMIZATION=READY
M4_BILINGUAL_ASR_LANGUAGE_DISAMBIGUATION=READY
```

No firmware, Wi-Fi, deployment, credential, or production state was changed during ingestion. Current accepted runtime remains `slate:m4-observability-07248b6`; Slate/MySQL health remains `200,200` / healthy with restart count `0`; the accepted firmware app identity remains unchanged at `4ea31710c6dfd5bff025b5282f2dd5edd49117eacfe4161988dcde0df820c298`.

The existing progressive-lag/freeze repair cannot be closed from this capture because freeze, exit, bubble, kana, and audio acceptance are unknown. No immediate physical retry is requested. Continue provider-disabled timing diagnosis and qualify the minimum bilingual ASR candidate under the established AGY and Grok 4.6 review loop.

## Safe qualification and exact review — b0606b6

The evidence justified two minimum-footprint backend changes: a provider-supported bilingual input-transcription hint, and sanitized timing boundaries for future authorized sessions. AGY `gemini-3.8-flash-high` implemented both; the accepted Grok P1 repair removed the misleading `T_PROVIDER_INPUT_TRANSCRIPTION_FINAL` alias from `turnComplete`. The existing `T_TRANSCRIPT_FINALIZED` marker remains the turn-complete boundary, while input-transcription finality remains unavailable unless the provider emits a distinct supported signal.

```text
SOURCE_COMMIT=b0606b6beb22a21b49570c17c323a64d486c38c9
PARENT_COMMIT=97711c48312d4f3da94519a371a07a38c7f50ab6
AGY_IMPLEMENTER=gemini-3.8-flash-high
AGY_SCOPE=MINIMUM_BILINGUAL_ASR_HINT_PLUS_SANITIZED_INPUT_BOUNDARY_MARKERS
CHANGED_RUNTIME_PATHS=GEMINI_DIRECT_SDK;GEMINI_NODE_BRIDGE;XIAOZHI_INPUT_TIMING
INPUT_TRANSCRIPTION_HINT=en-US;ja-JP_BCP47_LIST
INPUT_FINAL_MARKER=UNAVAILABLE_NOT_CLAIMED
PROVIDER_MODEL_AUTH=UNCHANGED
FIRMWARE=UNCHANGED
FOCUSED_VALIDATION=PASS_74;SKIP_5_OPTIONAL_PROVIDER_DISABLED_HARNESS;FAIL_0
TYPECHECK=PASS
LINT=PASS
FORMAT=PASS_IMPACTED_TYPESCRIPT
PRIVACY_SECRET_SCAN=PASS_NO_SECRET_ASSIGNMENTS_OR_PAYLOAD_LOGGING
GIT_DIFF_CHECK=PASS
ARM64_IMAGE_BUILD=PASS
ARM64_IMAGE_ID=sha256:36131bdcc39adca1975dc782c8e5e56e2b35fec87e59f76ae1daba2f5fc94fd7
EXACT_INDEPENDENT_REVIEWER=GROK_4_6
EXACT_INDEPENDENT_REVIEW_COMMAND=grok -m grok-4.6
EXACT_REVIEW_TARGET=b0606b6beb22a21b49570c17c323a64d486c38c9
EXACT_REVIEW_STATUS=PASS
EXACT_REVIEW_BLOCKING_FINDINGS=0
EXACT_REVIEW_P0=0
EXACT_REVIEW_P1=0
EXACT_REVIEW_P2=0
EXACT_REVIEW_SECURITY=0
PROVIDER_CALL_THIS_STAGE=0
PRODUCTION_DEPLOYMENT_THIS_STAGE=NO
FIRMWARE_FLASH_THIS_STAGE=NO
```

The timing additions are structural only: `T_AUDIO_INPUT_COMMIT_OR_TURN_END` is emitted at client listen-stop before `endAudio`; `T_PROVIDER_INPUT_TRANSCRIPTION_FIRST_PARTIAL` is emitted on the first nonblank provider input-transcription fragment; `T_BACKEND_USER_TRANSCRIPT_FLUSH` and `T_USER_BUBBLE_EVENT_POSTED` are emitted synchronously when the backend sends the `stt` event. `T_LAST_MEANINGFUL_MIC_FRAME_OR_VAD_END`, `T_PROVIDER_INPUT_TRANSCRIPTION_FINAL`, and `T_USER_BUBBLE_FIRST_VISIBLE` remain unavailable rather than being inferred.

### Exact remaining authority boundary

All safe provider-disabled implementation, validation, privacy scanning, build, freeze and independent review work is exhausted. The new image/source identity cannot be used as the currently accepted production identity without a fresh bounded authorization for the changed backend deployment and an authorized provider qualification session. No deploy, restart, firmware flash, credential/configuration change or physical retry was performed. The next action is to obtain only that exact new backend/provider qualification authority; after it is granted, deploy/requalify and rearm the observer before any physical acceptance request.

## Final durable checkpoint — observer rearmed

```text
CURRENT_HEAD=5d2fc14701a62ea7c8300c9ce2e6f321fde63bb4
SOURCE_REVIEW_TARGET=b0606b6beb22a21b49570c17c323a64d486c38c9
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
OBSERVER_SELF_TEST=PASS
OBSERVER_STATE=RUNNING
OBSERVER_SERIAL_CONNECTED=YES
OBSERVER_RAW_CONTENT=NOT_RETAINED
ACTIVE_BACKEND_TAG=slate:m4-observability-07248b6
ACTIVE_FIRMWARE_APP_SHA256=4ea31710c6dfd5bff025b5282f2dd5edd49117eacfe4161988dcde0df820c298
SLATE_HEALTH=HEALTHY_RESTART_0
MYSQL_HEALTH=HEALTHY_RESTART_0
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_DEVICE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=0
CURRENT_BLOCKED_NODE=NEW_CHANGED_BACKEND_DEPLOYMENT_AND_PROVIDER_QUALIFICATION_AUTHORITY
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=AUTHORIZE_EXACT_REVIEWED_B0606B6_BACKEND_DEPLOYMENT_AND_ONE_BOUNDED_PROVIDER_QUALIFICATION_SESSION
TERMINAL_REASON=NEW_ARTIFACT_DEPLOYMENT_PROVIDER_AUTHORITY_BOUNDARY
NEXT_ACTION=WAIT_FOR_EXACT_NEW_BACKEND_DEPLOYMENT_AND_PROVIDER_QUALIFICATION_AUTHORITY
```

No physical Voice retry, reset, reflash, redeploy, provider call, credential change, Wi-Fi change, pairing change, or Gemini model/provider/auth change occurred after the consumed session.
