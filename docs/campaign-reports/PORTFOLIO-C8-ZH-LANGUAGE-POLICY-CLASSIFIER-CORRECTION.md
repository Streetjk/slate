# C8 Traditional Chinese language-policy correction

Date: 2026-09-12 (Australia/Perth)
Status: SAFE DEVELOPMENT ADDENDUM; NO DEPLOY/FLASH/PHYSICAL AUTHORITY

This addendum refines `PORTFOLIO-C8-GLYPH-ZH-REPAIR-REOPEN-DIRECTION.md` before implementation.

The desired external behavior remains:

```text
EN_INPUT -> EN_RESPONSE
JA_INPUT -> JA_RESPONSE
ZH_HANT_INPUT -> ZH_HANT_RESPONSE
```

However, do **not** implement the earlier fallback rule as `Han without Japanese kana => ZH_HANT`. Short Japanese utterances such as `東京`, `日本`, names and other kanji-only text are ambiguous and would be misclassified by that rule.

## Preferred policy order

Use the strongest already-available non-secret turn-language signal first, without retaining transcript/audio/private payload:

1. explicit trusted language metadata already produced by the ASR/provider/runtime, if mechanically available and supported by both Bun and Node-bridge paths;
2. explicit existing user/session language preference if such a product setting already exists and is authorized;
3. deterministic script cues only when unambiguous:
   - Japanese kana present => `JA`;
   - distinctive Traditional-Chinese-only cues may support `ZH_HANT` when the rule is mechanically documented/tested;
   - predominantly Latin/ASCII English => `EN`;
4. ambiguous Han-only text => `AUTO_OR_UNKNOWN`, **not automatically ZH_HANT**.

For AUTO/UNKNOWN, prefer a provider/system-instruction contract equivalent to:

```text
Reply in the language used in the user's current turn.
If the user speaks or writes Chinese, reply in Traditional Chinese.
If the user speaks or writes Japanese, reply in Japanese.
If the user speaks or writes English, reply in English.
```

Do not infer Traditional vs Japanese from Han characters alone when the evidence is ambiguous.

## Required tests

Add provider-disabled tests covering at least:

```text
EN: "Where is Perth?" -> EN
JA_WITH_KANA: "日本の首都はどこですか？" -> JA
ZH_HANT_DISTINCTIVE: "臺灣的首都是哪裡？" -> ZH_HANT
JA_KANJI_ONLY_AMBIGUOUS: "東京" -> AUTO_OR_PRIOR_TRUSTED_LANGUAGE, NOT_FORCED_ZH_HANT
JA_KANJI_ONLY_AMBIGUOUS: "日本" -> AUTO_OR_PRIOR_TRUSTED_LANGUAGE, NOT_FORCED_ZH_HANT
MIXED_HAN_LATIN -> documented AUTO/fallback policy
```

If provider/ASR language metadata exists, test its propagation through both Bun and Node bridge and ensure it takes precedence over script heuristics.

## Observability

Turn observability should publish only a bounded class:

```text
TURN_LANGUAGE_SOURCE=ASR_METADATA|PROVIDER_METADATA|SESSION_PREF|SCRIPT_CUE|AUTO_UNKNOWN
TURN_LANGUAGE_CLASS=EN|JA|ZH_HANT|OTHER|UNKNOWN
```

Do not log transcript contents or a sequence of codepoints.

## Grok decision requirement

Grok 4.6 should choose the smallest language-policy design that satisfies the trilingual contract while explicitly proving that kanji-only Japanese is not automatically converted to Traditional Chinese. If the current live provider path already auto-detects turn language reliably, prefer fixing the restrictive EN/JA instruction/serialization contract rather than building an unnecessary home-grown classifier.

All other R1/R3/R4/R5/R6 instructions remain unchanged.