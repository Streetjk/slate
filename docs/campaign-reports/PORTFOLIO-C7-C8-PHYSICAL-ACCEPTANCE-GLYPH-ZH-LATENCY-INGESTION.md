# C7/C8 physical acceptance — glyph and Chinese latency/language evidence ingestion

Date: 2026-09-12 (Australia/Perth)
Status: PHYSICAL ATTEMPT CONSUMED; SAFE DIAGNOSIS REQUIRED; NO AUTO-REPEAT

## Live artifact binding before evidence ingestion

Reconcile live GitHub before acting. The physical acceptance was armed only after the exact reviewed application and exact reviewed firmware were activated. Preserve these identities unless mechanically disproven:

```text
APPLICATION_SOURCE=e2b5aad597fd1b541921ba97400e72df307a3ad1
APPLICATION_IMAGE_LOCAL_ID=sha256:bc755aa2aa78017b327e1f12bf91bebd1f3446f36f8f0def5b328087288207ae
RUNNING_FIRMWARE_APP_IDENTITY=sha256:f6bd1111fba50d94ff9bd6ccfbbc284dbdd4bbcd0d763ed5b09403e231954ab1
COLLECTOR_ID=m4-sanitized-structural-v3|sha256:2c60ae95bec6236afdb42f77b0e2dfc1a9c9123a847559fd67c04c3f173af65a
BTC_PRODUCTION_STATE=ONE_WEEKLY_ONLY
```

The operator has now interacted with the armed NOTE4 and supplied two photographs plus direct latency/glyph feedback. Treat this as consumption of the one armed physical attempt.

```text
PHYSICAL_ACCEPTANCE_CONSUMED=YES
PHYSICAL_ACCEPTANCE_PENDING=NO
AUTO_REPEAT_AUTHORIZED=NO
```

Do not ask for another physical run until the new evidence has been exhausted and a changed hypothesis/candidate justifies it.

## Explicit new physical evidence

### Japanese / mixed Japanese response glyph integrity

The first supplied photograph visibly contains a tofu/square-like wrong glyph in an assistant Japanese response near the mixed Latin/Japanese tail. The operator independently reports that the prior `ㄇ`-like wrong character is still appearing.

```text
C8_JAPANESE_WRONG_GLYPH_OPERATOR_REPORTED=YES
C8_JAPANESE_VISIBLE_TOFU_OR_WRONG_GLYPH=YES
C8_GLYPH_PHYSICAL_RESULT=FAIL_AFTER_EXACT_F6BD_FLASH
C8_PRIOR_HOST_FONT_PASS_SUFFICIENT=NO_PHYSICAL_EVIDENCE_DISPROVES_CLOSURE
C8_EXACT_FAILING_UPSTREAM_CODEPOINT=UNKNOWN_NOT_YET_BOUND_TO_RUNTIME_MARKER
```

The visible Japanese context is consistent with a missing/wrong character immediately before `曲` in a normal `...楽曲...` phrase, so U+697D `楽` is a high-value diagnostic candidate, but this is NOT accepted as the exact upstream codepoint until runtime evidence confirms it.

```text
C8_VISIBLE_CONTEXT_CANDIDATE_CODEPOINT=U+697D_RAKU_PLAUSIBLE_NOT_PROVEN
```

Do not blindly add U+697D or regenerate/flash a broader font merely from the photograph. First inspect the sanitized runtime marker evidence from this consumed session and reproduce the exact candidate string provider-disabled.

Required diagnosis:

```text
C8_PHYSICAL_TURN_RUNTIME_CODEPOINT_CLASS=
C8_PHYSICAL_TURN_MISSING_CODEPOINT_HEX=
C8_PHYSICAL_TURN_SELECTED_FONT=
C8_PHYSICAL_TURN_DIRECT_DESCRIPTOR_FOUND=
C8_PHYSICAL_TURN_DIRECT_BITMAP_FOUND=
C8_PHYSICAL_TURN_FALLBACK_USED=
C8_PHYSICAL_TURN_FALLBACK_DESCRIPTOR_FOUND=
C8_PHYSICAL_TURN_FALLBACK_BITMAP_FOUND=
C8_PHYSICAL_TURN_LAYOUT_RESULT_CLASS=
C8_PHYSICAL_TURN_RUNNING_APP_IDENTITY_MATCH=
C8_GLYPH_FIRST_FAILED_BOUNDARY=
C8_GLYPH_ROOT_CAUSE=
C8_FIRMWARE_CHANGE_REQUIRED=
```

If the runtime reports no missing descriptor/bitmap while the photographed glyph is visibly wrong, investigate cmap/index-to-bitmap mapping, resolved-font identity, glyph bitmap identity and LVGL draw/cache/layout path rather than simply adding another character.

Run a provider-disabled exact layout/draw fixture for the likely visible phrase shape and, separately, literal U+697D `楽`, preserving only structural/hash evidence and not production transcript content.

### Chinese interaction latency and language behavior

The second photograph visibly shows a Traditional Chinese user query and a Japanese assistant answer. The operator reports that using Chinese became "a lot slower" than the preceding interactions.

```text
C8_ZH_INPUT_VISIBLE=YES_TRADITIONAL_CHINESE
C8_ZH_ASSISTANT_OUTPUT_VISIBLE_LANGUAGE=JAPANESE
C8_ZH_SAME_LANGUAGE_RESPONSE=NO
C8_ZH_RELATIVE_LATENCY=FAIL_OPERATOR_REPORTED_MUCH_SLOWER
C8_ZH_EXACT_LATENCY_MS=UNKNOWN_NOT_MEASURED_BY_OPERATOR
C8_ZH_PHYSICAL_RESULT=FAIL_LATENCY_AND_LANGUAGE_BEHAVIOR
```

The current project historically targeted EN/JA. This operator feedback now adds Chinese behavior as an explicit observed issue to diagnose; do not silently claim full Chinese-language support from this one turn.

Use the sanitized observer evidence from the consumed session, if retained, to separate these boundaries without raw transcript/audio retention:

```text
ZH_TURN_INDEX_OR_ORDER_CLASS=
ZH_DEVICE_LISTEN_START_TO_BACKEND_FIRST_AUDIO_MS=
ZH_BACKEND_FIRST_AUDIO_TO_TRANSCRIPT_FINAL_MS=
ZH_TRANSCRIPT_FINAL_TO_PROVIDER_FIRST_OUTPUT_MS=
ZH_PROVIDER_FIRST_OUTPUT_TO_BACKEND_DEVICE_PACKET_MS=
ZH_DEVICE_PACKET_TO_FIRST_LAYOUT_OR_UI_MS=
ZH_UI_TO_EPD_REFRESH_COMPLETE_MS=
ZH_TOTAL_STRUCTURAL_LATENCY_CLASS=
ZH_DOMINANT_DELAY_BOUNDARY=
```

If existing timestamps cannot be correlated to the Chinese turn without transcript retention, add only a bounded privacy-safe script/language class marker for future deterministic/physical evidence, e.g. `INPUT_SCRIPT_CLASS=LATIN|JAPANESE|HAN_TRADITIONAL_OR_HAN|MIXED|UNKNOWN`; do not log user text.

Before any new physical run, perform provider-disabled comparative host benchmarks with representative EN, JA and Traditional Chinese strings through the SAME bubble/layout/font path. Measure separately:

```text
EN_LAYOUT_US=
JA_LAYOUT_US=
ZH_LAYOUT_US=
EN_DIRECT_GLYPH_COUNT=
JA_DIRECT_GLYPH_COUNT=
ZH_DIRECT_GLYPH_COUNT=
EN_FALLBACK_GLYPH_COUNT=
JA_FALLBACK_GLYPH_COUNT=
ZH_FALLBACK_GLYPH_COUNT=
ZH_LAYOUT_SLOWDOWN_VS_JA=
ZH_LAYOUT_SLOWDOWN_VS_EN=
```

Also inspect the backend/provider system instruction and language-selection logic provider-disabled. Determine whether non-English input is intentionally routed to Japanese, whether conversation-history language anchoring can cause the observed Chinese->Japanese answer, or whether another language-detection layer is responsible. Do not change provider/model/auth while diagnosing.

Publish:

```text
C8_ZH_REPLY_LANGUAGE_DECISION_PATH=
C8_ZH_LANGUAGE_MISMATCH_ROOT_CAUSE=
C8_ZH_LATENCY_ROOT_CAUSE=
C8_ZH_BACKEND_CHANGE_REQUIRED=
C8_ZH_FIRMWARE_OR_FONT_CHANGE_REQUIRED=
```

## Other physical fields

Do not infer PASS for fields the operator did not explicitly confirm in this evidence. Preserve them as UNKNOWN or prior accepted subresults as appropriate. In particular, no new Calendar, Weather, News, Outlook, audio, exit, freeze, reboot, or four-turn-soak result should be invented from these photos alone.

```text
C7_CALENDAR_NEW_PHYSICAL_RESULT=UNKNOWN_NOT_PROVIDED_THIS_ATTEMPT
C7_WEATHER_NEW_PHYSICAL_RESULT=UNKNOWN_NOT_PROVIDED_THIS_ATTEMPT
C7_NEWS_NEW_PHYSICAL_RESULT=UNKNOWN_NOT_PROVIDED_THIS_ATTEMPT
C7_OUTLOOK_NEW_PHYSICAL_RESULT=UNKNOWN_NOT_PROVIDED_THIS_ATTEMPT
C8_AUDIO_OUTPUT_NEW_RESULT=UNKNOWN_NOT_EXPLICITLY_REPORTED
C8_VOICE_EXIT_NEW_RESULT=UNKNOWN_NOT_EXPLICITLY_REPORTED
C8_PROGRESSIVE_LAG_NEW_RESULT=UNKNOWN_EXCEPT_ZH_RELATIVE_SLOWNESS
```

## Safe next work

This is now a software/diagnostic frontier, not another immediate human/device frontier.

1. Reconcile and ingest any retained `m4-sanitized-structural-v3` evidence from this just-consumed interaction.
2. Bind the photographed wrong-glyph position to an exact runtime codepoint if possible.
3. Run provider-disabled exact LVGL/font/layout reproduction, including U+697D as a candidate but not an assumption.
4. Compare EN/JA/ZH layout/font costs provider-disabled.
5. Trace language-selection/prompt logic and timing boundaries for Chinese input.
6. Have Grok 4.6 choose the minimum repair(s), implementation scope and regression tests.
7. Implement through the active approved writer policy, qualify, freeze exact changed artifacts, and obtain a fresh Grok review.
8. Do not deploy/flash/repeat physical acceptance until the new repair candidate and authority boundary are explicit.

Preserve application health, one-Weekly BTC production state, MySQL data, pairing/network identity, provider/model/auth configuration, and all privacy boundaries. Keep PRs #1-#4 OPEN / DRAFT / UNMERGED.

## Required frontier after diagnosis

```text
CURRENT_HEAD=
PHYSICAL_ACCEPTANCE_CONSUMED=YES
AUTO_REPEAT_AUTHORIZED=NO
C8_GLYPH_PHYSICAL_RESULT=FAIL
C8_GLYPH_ROOT_CAUSE=
C8_ZH_RELATIVE_LATENCY=FAIL_OPERATOR_REPORTED_MUCH_SLOWER
C8_ZH_SAME_LANGUAGE_RESPONSE=NO
C8_ZH_LATENCY_ROOT_CAUSE=
C8_ZH_LANGUAGE_MISMATCH_ROOT_CAUSE=
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
