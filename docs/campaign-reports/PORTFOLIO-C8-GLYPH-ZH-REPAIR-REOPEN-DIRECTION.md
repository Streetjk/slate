# C8 repair reopen — glyph coverage, Chinese reply language, and latency instrumentation

Date: 2026-09-12 (Australia/Perth)
Status: SAFE DEVELOPMENT DIRECTION; NO DEPLOY/FLASH/PHYSICAL AUTHORITY

## Why the current `no repair justified` conclusion is too conservative

Reconcile live GitHub before execution. The consumed physical attempt at exact application source `e2b5aad597fd1b541921ba97400e72df307a3ad1` and exact running firmware `f6bd1111fba50d94ff9bd6ccfbbc284dbdd4bbcd0d763ed5b09403e231954ab1` proved:

```text
C8_GLYPH_PHYSICAL_RESULT=FAIL
C8_ZH_RELATIVE_LATENCY=FAIL_OPERATOR_REPORTED_MUCH_SLOWER
C8_ZH_SAME_LANGUAGE_RESPONSE=NO
```

The host diagnosis then mechanically established two important facts:

1. The photographed phrase is structurally consistent with a missing character in `楽曲`, and U+697D `楽` is absent from both `Voice_Font_16` and its runtime fallback `Zfull_16`. This does not prove every historic wrong/ㄇ-like glyph has the same cause, but it is a concrete font-coverage defect for a common Japanese character in the exact visible phrase.
2. The current response-language contract is mechanically EN/JA-only while the operator explicitly requires Traditional Chinese input to receive a Traditional Chinese response. That product-contract mismatch is independently sufficient to justify a backend language-policy repair; it does not require another physical session merely to prove that EN/JA-only cannot satisfy ZH-TW.

The exact Chinese latency root cause remains unknown. Host layout was not slower for the tested ZH fixture, so do not attribute the physical slowdown to layout without evidence. The next candidate should therefore add bounded turn-scoped language/timing observability sufficient to attribute the slowdown during the next authorized physical attempt.

## R0 — preserve consumed evidence and current production state

Preserve:

```text
PHYSICAL_ACCEPTANCE_CONSUMED=YES
AUTO_REPEAT_AUTHORIZED=NO
APPLICATION_SOURCE=e2b5aad597fd1b541921ba97400e72df307a3ad1
RUNNING_FIRMWARE_APP_IDENTITY=sha256:f6bd1111fba50d94ff9bd6ccfbbc284dbdd4bbcd0d763ed5b09403e231954ab1
BTC_PRODUCTION_STATE=ONE_WEEKLY_ONLY
```

Do not redeploy the current app, reflash `f6bd...`, rerun BTC consolidation, or ask the operator to repeat the same physical session.

## R1 — Japanese glyph repair

Treat U+697D `楽` as a justified minimum coverage addition because it is absent from both runtime fonts and appears in the photographed phrase context. Do not claim this closes every historic wrong-glyph symptom.

Before modifying font bytes, mechanically confirm the generator/source path used for `Voice_Font_16`/`Zfull_16`, and ensure the minimum change adds U+697D without broad uncontrolled CJK expansion.

Required deterministic fixtures must include at least:

```text
楽
楽曲
THE YELLOW MONKEYの楽曲タイトル
曇り時々雨
の
```

Also strengthen runtime diagnostics so the next physical attempt can distinguish:

```text
RUNTIME_CODEPOINT_HEX=
RUNTIME_PRIMARY_FONT=
RUNTIME_RESOLVED_FONT=
GLYPH_DESCRIPTOR_FOUND=
GLYPH_BITMAP_FOUND=
FALLBACK_USED=
PLACEHOLDER_USED=
LAYOUT_RESULT_CLASS=
```

Use the actual LVGL glyph bitmap API for the locked dependency where feasible. A positive descriptor box size is not bitmap proof. Cover both initial bubble creation and in-place assistant updates.

Do not retain transcript text. A single bounded codepoint hex for an actual missing-glyph event is permitted; do not emit a stream of all codepoints.

Publish:

```text
U697D_GENERATOR_SOURCE=
U697D_PRIMARY_PRESENT_BEFORE=
U697D_FALLBACK_PRESENT_BEFORE=
U697D_PRIMARY_PRESENT_AFTER=
U697D_FALLBACK_PRESENT_AFTER=
U697D_HOST_LAYOUT_DRAW=PASS|FAIL
GLYPH_RUNTIME_MARKER_TEST=PASS|FAIL
FIRMWARE_CHANGE_REQUIRED=YES|NO
```

## R2 — Traditional Chinese response-language policy

The desired contract is now explicit:

```text
EN_INPUT -> EN_RESPONSE
JA_INPUT -> JA_RESPONSE
ZH_HANT_INPUT -> ZH_HANT_RESPONSE
```

Do not make a provider/model/auth/billing change.

Inspect and minimally repair the language-selection/system-instruction path. Prefer a deterministic local script/language classifier over a model call solely for language detection. At minimum distinguish:

- predominantly ASCII/Latin English;
- Japanese kana presence => Japanese;
- Traditional Chinese/Han without Japanese kana => Traditional Chinese;
- mixed/ambiguous input => preserve an explicit safe fallback chosen by Grok.

Ensure the same selected response language reaches both Bun and Node-bridge runtime paths if both remain supported. Do not let the Node bridge silently default to English when another language was selected.

Required provider-disabled tests:

```text
EN_FIXTURE_RESPONSE_POLICY=EN
JA_FIXTURE_RESPONSE_POLICY=JA
ZH_HANT_FIXTURE_RESPONSE_POLICY=ZH_HANT
MIXED_FIXTURE_RESPONSE_POLICY=<documented>
NODE_BRIDGE_LANGUAGE_PROPAGATION=PASS
BUN_RUNTIME_LANGUAGE_PROPAGATION=PASS
```

Do not claim provider behavior without an authorized provider session; these are deterministic policy/serialization tests.

## R3 — bounded Chinese latency attribution for next candidate

The consumed physical attempt proved relative ZH slowness but no retained timing markers were bound to that turn. Add the minimum privacy-safe correlation needed for the next physical attempt.

Use a bounded per-turn correlation index/class; do not log transcript or private payload. Record only sanitized stage timestamps/latencies already within the observer privacy contract:

```text
TURN_INDEX=
TURN_LANGUAGE_CLASS=EN|JA|ZH_HANT|OTHER
T_DEVICE_LISTEN_START_MS=
T_BACKEND_FIRST_AUDIO_RECEIVED_MS=
T_TRANSCRIPT_FINALIZED_MS=
T_PROVIDER_FIRST_OUTPUT_EVENT_MS=
T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE_MS=
T_UI_RENDER_REQUEST_MS=
T_EPD_REFRESH_DONE_MS=
```

If a stage is unavailable, preserve `UNKNOWN`; never synthesize zero.

Add deterministic observer tests that prove language class + turn index survive producer -> collector without transcript leakage.

The next physical report should be able to publish stage deltas and identify the dominant slow boundary rather than only saying `ZH much slower`.

## R4 — Grok 4.6 decision and implementation

Send a compact SHA-bound packet to `grok -m grok-4.6` containing:

- exact consumed physical evidence;
- U+697D absence in both runtime fonts;
- the EN/JA-only current language contract;
- host layout benchmark showing no ZH layout slowdown;
- current privacy/authority limits;
- the R1-R3 proposed minimal repairs.

Require:

```text
DECISION_STATUS=DECIDED|REVISE_PLAN|NEEDS_EVIDENCE
GLYPH_REPAIR_SELECTED=
ZH_LANGUAGE_REPAIR_SELECTED=
ZH_TIMING_INSTRUMENTATION_SELECTED=
AFFECTED_FILES=
WRITER_ASSIGNMENT=
REQUIRED_TESTS=
STOP_CONDITION=
```

Grok should decide ordinary engineering details. Use the established writer policy:

```text
PREFERRED_WRITER=Z.ai glm-5.3-flash
CODEX_FALLBACK=AUTHORIZED_WHEN_GROK_ASSIGNS_AFTER_BOUNDED_ZAI_FAILURE
```

Do not stop solely because Z.ai is unavailable when the authorized fallback exists.

## R5 — qualify and freeze

After implementation run all impacted deterministic gates, including:

- font/generator and LVGL host layout/draw tests;
- initial + in-place bubble glyph tests;
- EN/JA/ZH_HANT response-policy tests;
- Bun + Node-bridge language propagation tests;
- turn/language/timing observer contract tests;
- provider-disabled Voice replay if affected;
- backend/shared/frontend tests as impacted;
- firmware build if firmware/font bytes change;
- typecheck/lint/format/build;
- privacy/secret scan;
- `git diff --check`.

Freeze exact backend and firmware artifacts. If firmware bytes change, record exact BIN/ELF/font/build-manifest identities. If backend bytes change, freeze exact linux/arm64 application image identity.

Then run a fresh exact-artifact Grok 4.6 review:

```text
VERDICT=PASS|REVISE
P0=
P1=
P2=
SECURITY=
REVIEWED_BACKEND_ARTIFACT=
REVIEWED_FIRMWARE_BIN_SHA256=
```

A missing/malformed/artifact-mismatched review is not PASS. On REVISE, repair/retest/refreeze/rereview while safe work remains.

## R6 — authority boundary

This direction grants no deployment, firmware flash, provider session, physical repeat, OAuth, billing, credential change, BTC mutation, C9/C10 activation, merge or release authority.

When and only when the new candidate has terminal review:

```text
P0=0
P1=0
P2=0
SECURITY=0
```

prepare the smallest exact operator request for:

- backend deployment if backend changed;
- one app-only firmware flash if firmware/font changed;
- one later bounded physical requalification specifically covering the repaired Japanese glyph, EN/JA/ZH_HANT same-language responses, and turn-attributed ZH latency.

Do not bundle unrelated Calendar/Weather/News/Outlook retesting unless explicitly useful and authorized.

## Scheduler correction

While R1-R5 safe development is runnable:

```text
READY_NODE_COUNT>=1
READONLY_READY_NODE_COUNT>=0
WAITING_HUMAN_COUNT=0
HUMAN_ACTION_REQUIRED=NO
```

`NEEDS_EVIDENCE` must not mean `no work` when a mechanically proven product-contract gap and a concrete font coverage gap already exist and can be repaired/tested without physical access.
