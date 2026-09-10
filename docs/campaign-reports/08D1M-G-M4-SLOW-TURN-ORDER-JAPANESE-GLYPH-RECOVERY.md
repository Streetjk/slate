# Campaign 8D1M-G — Working Voice AI, but >10 s latency, reversed turn order, and Japanese glyph corruption

## Live reconciliation at issue

Issued after reconciling PR #2 at live head:

```text
LIVE_HEAD_AT_ISSUE=5be439a00d9581a54e284fcfef88231bd66ff8ca
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
HEAD_BRANCH=feature/gemini-35-live-evaluation
BASE_BRANCH=integration/note4-custom
CURRENT_STAGE=M4_CONFIG_ERROR_REPAIRED_EXACT_CONFIG_REQUALIFIED_WAITING_NEW_PHYSICAL_ACCEPTANCE
```

Before acting, re-fetch live PR #2 and `docs/campaign-reports/CAMPAIGN-STATE.md` at the exact live head. If GitHub advanced, reconcile from the newer frontier and preserve this instruction's intent rather than replaying stale state.

Keep PR #2 **OPEN / DRAFT / UNMERGED**. Do not merge or release.

## New authoritative operator result — consumes the current physical boundary

The post-config-restore physical Voice AI session has now been performed. The provider path is functionally working enough to produce visible answers, but three major acceptance defects remain:

```text
VOICE_SERVICE_ERROR=NO_FOR_THIS_SESSION
ASSISTANT_RESPONSE_VISIBLE=YES
VOICE_RESPONSE_LATENCY=VERY_SLOW_APPROX_10_SECONDS_PLUS
TURN_BUBBLE_SEQUENCE=WRONG
OBSERVED_SEQUENCE=ASSISTANT_ANSWER_THEN_USER_QUESTION
EXPECTED_SEQUENCE=USER_QUESTION_THEN_ASSISTANT_ANSWER
JAPANESE_SESSION_REACHED=YES
JAPANESE_VISIBLE_TEXT=YES_BUT_GLYPHS_CORRUPTED
EXAMPLE_EXPECTED_HIRAGANA=の
EXAMPLE_RENDERED_WRONG_GLYPH=ㄇ
AUDIO_ACCEPTANCE=UNKNOWN_FROM_OPERATOR_REPORT_INGEST_OBSERVER
```

Treat the prior human boundary as consumed immediately:

```text
WAITING_HUMAN_COUNT=0
HUMAN_ACTION_REQUIRED=NO
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
```

Do **not** ask for another physical Voice AI retry until all safe nonphysical READY/READONLY_READY work described below is exhausted.

## First action — ingest the already-running corrected observer

Before changing code, ingest the exact structural markers from this successful-but-unacceptable session and publish the real progression/timing chain. Never retain raw mic audio, PCM, transcript contents, provider payloads, credentials, auth headers, Calendar/Outlook contents, or other private data.

At minimum establish:

```text
LATEST_POST_CONFIG_RESTORE_PHYSICAL_SESSION_INGESTED=YES
CONFIG_ERROR_REPRODUCED=NO
OLD_WS_TRANSPORT_FAILURE_REPRODUCED=NO|UNKNOWN
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
FIRST_MIC_FRAME_RECEIVED=
PROVIDER_FIRST_OUTPUT_EVENT=
PROVIDER_FIRST_AUDIO_EVENT=
BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=
FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED=
FIRMWARE_FIRST_AUDIO_PACKET_ACCEPTED=
FIRMWARE_FIRST_DECODED_PCM=
AUDIO_PLAYER_FIRST_WRITE=
AUDIO_PLAYER_WRITE_RESULT=
TTS_START_RECEIVED=
TTS_STOP_RECEIVED=
TRANSCRIPT_UPDATE_COUNT=
EPD_REFRESH_COUNT_DURING_RESPONSE=
```

Publish exact or bounded timing deltas where available:

```text
T_DEVICE_LISTEN_START
T_PROVIDER_SESSION_CREATE_START
T_PROVIDER_SESSION_READY
T_FIRST_DEVICE_AUDIO_SENT
T_BACKEND_FIRST_AUDIO_RECEIVED
T_AUDIO_STREAM_END_OR_END_OF_TURN_SIGNAL
T_PROVIDER_FIRST_OUTPUT_EVENT
T_TRANSCRIPT_FIRST_USER_FORWARD_TO_DEVICE
T_TRANSCRIPT_FIRST_ASSISTANT_FORWARD_TO_DEVICE
T_PROVIDER_FIRST_AUDIO_EVENT
T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE
T_FIRMWARE_FIRST_AUDIO_PACKET_RECEIVED
T_FIRMWARE_FIRST_DECODED_PCM
T_AUDIO_PLAYER_FIRST_WRITE
T_UI_RENDER_REQUEST
T_EPD_REFRESH_START
T_EPD_REFRESH_DONE
```

Classify the dominant >10 s latency mechanically. Do not optimize from subjective latency alone.

## Workstream A — >10 s response latency

Measure the major buckets separately:

```text
LISTEN_START_TO_PROVIDER_READY_MS=
PROVIDER_READY_TO_FIRST_MIC_FORWARD_MS=
MIC_CAPTURE_OR_END_OF_TURN_MS=
END_OF_TURN_TO_PROVIDER_FIRST_OUTPUT_MS=
PROVIDER_FIRST_OUTPUT_TO_DEVICE_TRANSCRIPT_SEND_MS=
DEVICE_TRANSCRIPT_SEND_TO_UI_RENDER_MS=
UI_RENDER_TO_EPD_VISIBLE_MS=
TOTAL_FIRST_VISIBLE_RESPONSE_MS=
```

Specifically determine whether the dominant delay is:

1. provider session cold-start / Node bridge startup;
2. mic/end-of-turn or AutoStop/VAD semantics delaying `endAudio()`;
3. backend queueing;
4. provider inference latency;
5. transcript buffering/coalescing;
6. firmware/UI/e-ink refresh.

The current provider connection is created at listen start. If prewarming or persistent-session reuse would materially reduce first-turn latency, do not silently implement it if it changes provider session lifetime/cost semantics. First quantify the saving and preserve the existing provider/model/billing authority. Prefer lower-risk improvements such as fixing unnecessary end-of-turn waits, avoiding avoidable bridge startup, and reusing an already-open same-conversation session where current semantics already permit it.

Do not sacrifice correct ordering, audio, privacy, or interruption behavior merely to reduce the number.

## Workstream B — wrong bubble order: user question appears under assistant answer

There is a concrete current-code ordering defect that must be reproduced in deterministic tests before repair.

At the current source, `handleGeminiMessage()` accumulates `inputTranscription` only into `pendingInputTranscript`, while assistant `outputTranscription` is scheduled for streaming immediately. `flushPendingTranscripts()` sends the user `stt` message only at `turnComplete`.

That allows this protocol order:

```text
assistant tts sentence_start -> firmware appends assistant bubble
turnComplete -> backend sends stt -> firmware appends user bubble
```

The firmware service appends messages based on arrival order via `UpsertMessageLocked`, so a late STT naturally produces the exact observed wrong sequence.

Required semantics after repair:

```text
ONE_LOGICAL_USER_TURN=ONE_USER_BUBBLE
ONE_LOGICAL_ASSISTANT_TURN=ONE_ASSISTANT_BUBBLE
DISPLAY_ORDER=USER_THEN_ASSISTANT
ASSISTANT_STREAMING_MUST_NOT_REORDER_THE_TURN
NO_PER_TOKEN_EINK_REFRESH_STORM
```

Use the narrowest robust design. Candidate approaches include:

- coalesced/streamed user transcription as soon as provider input transcription becomes available;
- before the first assistant text/audio event for a turn, emit any already-available pending user transcript first;
- if provider callback ordering can deliver assistant output before any input transcription, preserve logical turn order without adding a large latency penalty (for example a bounded turn-order barrier or explicit turn-aware update semantics).

Do not simply delay all assistant output until `turnComplete`, because that would restore the very text-latency problem already being fixed.

Required deterministic tests:

1. input transcription arrives before output -> user then assistant;
2. cumulative input fragments -> one user bubble;
3. delta input fragments -> one user bubble;
4. assistant output begins before turnComplete -> still user then assistant;
5. synthetic callback ordering where output arrives before input -> stable logical order without duplicate bubbles;
6. final authoritative turnComplete does not duplicate/reorder either bubble;
7. interruption/reconnect/new-turn state does not merge adjacent turns.

Also test the firmware snapshot path because `SetUserText`, `SetAssistantText`, and `UpsertMessageLocked()` are arrival-order driven.

## Workstream C — Japanese hiragana/kana glyph corruption

The operator observed valid Japanese response text on the Voice AI screen, but hiragana is rendered as unrelated glyphs, e.g.:

```text
EXPECTED=の U+306E
OBSERVED_VISUAL=ㄇ
```

Treat this first as a **font/glyph coverage or cmap problem**, not UTF-8 corruption, unless byte-level host tests prove otherwise.

Concrete current-source evidence:

- Voice AI message labels use `&Zfull_16`.
- `firmware/main/ui/theme.h` explicitly documents `Zfull_16` as `Zfull-GB`, **GB2312 + symbols**, intended as the unified Chinese firmware font.
- Therefore Japanese Hiragana/Katakana coverage is not guaranteed and the observed kana corruption is consistent with the current font choice.
- `firmware/main/resources/fonts/zfull_16.c` is already a large embedded font artifact; do not replace it with a huge full-Unicode font without measuring firmware-size impact.

Required mechanical checks before repair:

```text
UTF8_INPUT_BYTES_FOR_U+306E=PASS|FAIL
SANITIZE_FOR_SCREEN_PRESERVES_U+306E=PASS|FAIL
LVGL_SELECTED_FONT_HAS_U+306E=YES|NO
LVGL_GLYPH_DESCRIPTOR_U+306E_VALID=YES|NO
RENDERED_GLYPH_ID_FOR_U+306E=
HIRAGANA_RANGE_COVERAGE=
KATAKANA_RANGE_COVERAGE=
JP_PUNCTUATION_COVERAGE=
```

Add host/deterministic coverage with a representative string such as:

```text
今日は何曜日ですか？ の ひらがな カタカナ 日本語
```

Preferred minimum-footprint repair:

- keep the existing Chinese/global font for the rest of the firmware where appropriate;
- add a Japanese-capable 16 px Voice AI text font or LVGL fallback chain only where needed;
- at minimum cover Hiragana, Katakana, Japanese punctuation, ASCII, and the Japanese ideographs needed by the chosen supported strategy;
- if common Kanji can safely fall back to the existing CJK glyph set, prove the fallback behavior and note locale-glyph limitations; otherwise use a measured Japanese CJK subset;
- use a repository-compatible font/license and record provenance/license requirements;
- quantify added source size, `.text`/rodata contribution, final app binary delta, flash headroom, RAM impact, and render-time impact.

Do **not** ship a font workaround that transliterates Japanese to romaji or silently changes transcript text.

Required acceptance examples must prove at least:

```text
の -> の
ひらがな -> correct
カタカナ -> correct
今日 -> readable correct glyphs
曜日 -> readable correct glyphs
ですか？ -> correct
```

## Workstream D — audio remains part of acceptance

The operator did not explicitly report whether audible assistant audio succeeded in this latest session. Resolve it from observer structural evidence if possible. If audio reached player-write but physical audibility remains unknown, keep audio acceptance open for the final combined physical retest; do not guess success.

If observer shows an audio-chain failure, continue the already-established provider -> bridge -> backend PCM/Opus -> binary WebSocket -> firmware state gate -> decoder -> AudioPlayer -> codec/I2S/amplifier investigation automatically.

## Writer / validation / reviewer loop

For every runtime-byte change, preserve the established route:

```text
evidence
-> Codex adjudication
-> designated AGY Gemini 3.8 Flash minimal repair
-> narrow deterministic regression first
-> impacted backend/firmware tests
-> lint/typecheck/format where applicable
-> privacy/secret scan
-> impacted backend/firmware build
-> freeze exact identities
-> fresh ZAI glm-5.3-flash exact review
-> REVISE => AGY repair => retest => refreeze => fresh ZAI automatically
```

If both backend and firmware change, freeze/review both exact runtime identities together or with clearly linked exact review targets so deployment/reflash cannot mix versions.

Preserve the exact restored production Gemini configuration. Do not change provider, model, credentials, billing, OAuth/ADC, Calendar, Outlook, or private-data authority.

## Deployment / reflash

After exact review PASS:

- deploy the exact reviewed backend artifact if backend runtime bytes changed;
- app-only reflash the exact reviewed firmware if firmware bytes changed and the existing bounded campaign flash authority still covers that repair;
- never full-erase, rewrite partition table, NVS, LittleFS, pairing, or device identity;
- if an exact firmware write is no longer within existing authority, stop only at that true authority boundary;
- requalify Slate/MySQL/local/public health and exact production Gemini config after backend deployment;
- re-arm the corrected sanitized observer after deployment/reflash.

## Next physical acceptance boundary

Do not request another physical session until:

```text
LATEST_SESSION_INGESTED=YES
LATENCY_BREAKDOWN_PUBLISHED=YES
DOMINANT_LATENCY_CAUSE_PROVEN=YES
TURN_ORDER_REPAIR_QUALIFIED=YES
JAPANESE_GLYPH_REPAIR_QUALIFIED=YES
AUDIO_NONPHYSICAL_CHAIN_STATUS_KNOWN=YES
ZAI_EXACT_REVIEW=PASS_FOR_ALL_CHANGED_RUNTIME_BYTES
DEPLOYMENT_REQUALIFIED=YES_IF_CHANGED
FIRMWARE_REFLASH_REQUALIFIED=YES_IF_CHANGED
OBSERVER_REARMED=YES
READY_NODE_COUNT=0
READONLY_READY_COUNT=0
```

Then request at most one combined EN/JA physical acceptance session and require all of:

```text
VOICE_SERVICE_ERROR=NO
FIRST_VISIBLE_RESPONSE_LATENCY=ACCEPTABLE_AND_MEASURED
USER_BUBBLE_BEFORE_ASSISTANT_BUBBLE=YES
ONE_USER_BUBBLE_PER_TURN=YES
ONE_ASSISTANT_BUBBLE_PER_TURN=YES
HIRAGANA_KATAKANA_RENDERING_CORRECT=YES
JP_SAMPLE_TEXT_READABLE=YES
AUDIBLE_ASSISTANT_AUDIO=YES
EN=PASS
JA=PASS
```

If any one fails, ingest that one session and return to nonphysical repair automatically rather than blindly repeating it.

## Required durable state before controller stop

Publish and push:

```text
CURRENT_HEAD=
CURRENT_STAGE=
LATEST_POST_CONFIG_RESTORE_PHYSICAL_SESSION_INGESTED=
PROVIDER_SESSION_STARTED=
VOICE_RESPONSE_LATENCY_MS_OR_RANGE=
DOMINANT_LATENCY_STAGE=
TURN_ORDER_ROOT_CAUSE=
TURN_ORDER_REPAIR_STATUS=
JP_GLYPH_ROOT_CAUSE=
JP_GLYPH_REPAIR_STATUS=
JP_FONT_BINARY_DELTA_BYTES=
AUDIO_CHAIN_STATUS=
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

No controller exit while READY/READONLY_READY work remains unless a true authority/safety conflict exists.