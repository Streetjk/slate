# Portfolio C8+C7 physical acceptance ingestion — Japanese glyph corruption and Outlook Chinese server error

Date: 2026-09-11 (Australia/Perth)

## Purpose

Ingest the operator's newly consumed NOTE4 physical acceptance evidence after deployment of the exact post-physical combined C8+C7 backend candidate. This is durable control-bus evidence. Do not request a blind repeat of the same physical acceptance.

This directive grants no new provider call, deployment, firmware flash, reset, re-pair, Wi-Fi change, OAuth consent/sign-in, credential, billing, private-data, merge, or release authority.

Preserve `PORTFOLIO_FRONTIER_DRIVEN_LONGRUN`, `AUTONOMY-AND-HUMAN-GATE-POLICY.md`, and `REPORT-PUSH-INVARIANT.md`. PR #1, #2, #3 and #4 remain OPEN / DRAFT / UNMERGED.

## Live activation context

At ingestion start, PR #2 was independently reconciled as:

```text
LIVE_PR2_HEAD=dd6797b7084d36729f66090edcf17e6cfc45e23c
PR2_STATE=OPEN
PR2_DRAFT=YES
PR2_MERGED=NO
RUNNING_BACKEND_SOURCE=d26efe2441407faf71c4c508f66e9f5c39f98fae
RUNNING_BACKEND_TAG=slate:m4-postphysical-c8-c7-d26efe2
RUNNING_BACKEND_AUTHORIZED_IMAGE=sha256:4788c9c69ac08cc31132ac1f70c72f17d626467e619943014c6a7c8f4f928662
FIRMWARE_CHANGED_BY_DEPLOYMENT=NO
NEW_PROVIDER_SESSION_AUTHORIZED=NO
```

The pre-existing top `CAMPAIGN-STATE.md` still described one bounded physical acceptance as armed. The operator has now exercised the device and supplied fresh physical observations, so that acceptance is consumed and must be ingested before any repeat.

## Operator physical evidence

The operator reports and supplied a photograph of the NOTE4 Voice AI screen:

```text
PHYSICAL_ACCEPTANCE_CONSUMED=YES
C8_JAPANESE_TEXT_MOSTLY_LEGIBLE=YES_OPERATOR_AND_PHOTO
C8_JAPANESE_WRONG_CHARACTER_PRESENT=YES_OPERATOR_REPORTED
C8_JAPANESE_WRONG_CHARACTER_EXAMPLE=BOPOMOFO_CHARACTER_ㄇ_OPERATOR_REPORTED
C8_JAPANESE_MISSING_GLYPH_SQUARE_PRESENT=YES_OPERATOR_REPORTED
C8_JAPANESE_GLYPH_INTEGRITY=FAIL_ISOLATED_CORRUPTION_OR_MISSING_GLYPH
C7_OUTLOOK_CONNECT_CLICK=ATTEMPTED_OPERATOR_REPORTED
C7_OUTLOOK_CONNECT_VISIBLE_RESPONSE=YES_SERVER_ERROR
C7_OUTLOOK_CONNECT_SILENT_NOOP=NO_PREVIOUS_SILENT_NOOP_REPAIR_APPEARS_EFFECTIVE
C7_OUTLOOK_CONNECT_RESULT=FAIL_SERVER_ERROR
C7_OUTLOOK_CONNECT_USER_VISIBLE_LANGUAGE=FAIL_CHINESE_ERROR_ON_ENGLISH_TARGET_PATH
```

The photograph shows a Japanese Voice AI conversation with the majority of Japanese text visually readable. It is valid evidence that the Japanese path is broadly rendering, but it does not prove full glyph correctness because the operator separately observed one or two wrong characters and a missing-glyph square.

Do not infer from the photograph or the operator's brief report that any other acceptance field passed. Preserve unreported properties as UNKNOWN.

```text
C8_REAL_ACCENT_ASR=UNKNOWN_FROM_THIS_REPORT
C8_INPUT_LATENCY=UNKNOWN_FROM_THIS_REPORT
C8_STABILITY=UNKNOWN_FROM_THIS_REPORT
C8_AUDIO_OUTPUT=UNKNOWN_FROM_THIS_REPORT
C8_VOICE_EXIT=UNKNOWN_FROM_THIS_REPORT
C8_BUBBLE_SEMANTICS=UNKNOWN_FROM_THIS_REPORT
C7_WEATHER_ICONS=UNKNOWN_NOT_REPORTED_IN_THIS_MESSAGE
C7_DAILY_CALENDAR=UNKNOWN_NOT_REPORTED
C7_MONTH_CALENDAR=UNKNOWN_NOT_REPORTED
C7_GOOGLE_NEWS_AU=UNKNOWN_NOT_REPORTED
C7_GOOGLE_NEWS_TW=UNKNOWN_NOT_REPORTED
C7_GOOGLE_NEWS_BOTH=UNKNOWN_NOT_REPORTED
```

## Required C8 diagnosis — Japanese glyph integrity

Treat the Bopomofo-looking `ㄇ` and square/tofu glyph as a rendering/data-path integrity issue until mechanically classified. Do not assume pronunciation/ASR is the cause, and do not assume firmware font coverage is the cause merely from appearance.

Provider-disabled diagnosis must distinguish at least:

1. provider/transcription text actually contained the wrong Unicode code point;
2. backend UTF-8/event framing changed or corrupted code points;
3. firmware UTF-8 decoder/codepoint iteration mis-decoded a valid Japanese sequence;
4. font selection/fallback maps a missing Japanese glyph to an unrelated Bopomofo glyph;
5. glyph cache/indexing returns the wrong glyph bitmap;
6. the requested Japanese glyph is absent and the renderer emits tofu/square;
7. mixed JP/CJK font fallback ordering is incorrect;
8. e-ink rendering/cache state produces a stale glyph from a previous codepoint.

Use synthetic known literals only. No provider call is authorized. No raw physical transcript needs to be retained.

At minimum replay/render known non-sensitive Japanese literals through the current backend/firmware text pipeline where feasible, including representative strings already used by the campaign such as:

```text
こんにちは。
今日の天気どう？
日本の首都はどこですか？
一年は何ヶ月ありますか？
日本の通貨は何ですか？
```

Add deterministic codepoint/glyph coverage checks sufficient to prove that expected Japanese Unicode code points remain unchanged end-to-end and resolve to a valid Japanese glyph. Explicitly test that U+3107 `ㄇ` is never substituted for an unrelated Japanese character by the decoder/font/cache path. Treat an intentional literal U+3107 test input separately from Japanese strings.

If the root cause is firmware/font/rendering, safe implementation/build/review work may proceed provider-disabled, but **do not flash**. Produce and freeze an exact firmware candidate and request flash authority only if flashing becomes the sole remaining useful node.

If the root cause is backend runtime bytes, follow the normal C8 repair loop and do not deploy changed bytes without explicit deployment authority.

For any material C8 repair:

```text
CODEX_ADJUDICATION
-> AGY_IMPLEMENTATION=gemini-3.8-flash-high
-> FOCUSED_TESTS
-> IMPACTED_TYPECHECK_LINT_FORMAT_BUILD
-> PRIVACY_SECRET_SCAN
-> GIT_DIFF_CHECK
-> EXACT_SOURCE_ARTIFACT_FREEZE
-> FRESH_GROK_4_6_REVIEW
```

Canonical independent reviewer: `grok -m grok-4.6`. No ZAI fallback and no silent reviewer substitution.

## Required C7 diagnosis — Outlook Connect visible Chinese server error

Classify the new result carefully. The previous failure mode was a silent no-op after Connect. That specific UX defect appears improved because the operator now sees an error. However the acceptance still fails because Connect did not succeed and the visible error is Chinese on an English-target NOTE4/dashboard path.

Publish separately:

```text
C7_OUTLOOK_SILENT_NOOP_REPAIR=PASS_OPERATOR_VISIBLE_ERROR_NOW_PRESENT
C7_OUTLOOK_CONNECTION_SUCCESS=FAIL_OR_NOT_ESTABLISHED
C7_OUTLOOK_ERROR_LANGUAGE=FAIL_CHINESE
C7_OUTLOOK_ERROR_CLASS=
C7_OUTLOOK_EARLIEST_FAILED_BOUNDARY=
```

Diagnose provider-/OAuth-action-free first. Trace the existing Connect flow through frontend request -> Slate authorization-url endpoint -> Microsoft OAuth configuration/URL generation -> sanitized frontend presentation.

Determine whether the visible Chinese string originates from:

- a generic backend/Nest exception response;
- an existing Chinese localization/error catalog;
- a proxy/gateway error page;
- the Outlook controller/service itself;
- frontend raw propagation of a backend error message;
- an unconfigured Microsoft OAuth state;
- an HTTP/network/server failure unrelated to OAuth consent.

Do not start Microsoft sign-in/consent and do not access Outlook private data merely to diagnose the visible error.

The target behavior for the English Campaign 7 UI is:

- on a correctly configured authorization-url path: navigate to the Microsoft authorization URL;
- on a safe configuration/server failure: display a concise sanitized **English** error with no secret/token/account leakage;
- never return to the previous silent no-op;
- preserve Outlook `Calendars.Read` read-only scope;
- do not add Mail/Files/Contacts/write scopes.

Add deterministic tests for the exact observed class once mechanically identified. Any material combined C7+C8 bytes must receive impacted deterministic tests, privacy/secret scan, exact freeze and fresh Grok 4.6 review before a new deployment request.

## No blind physical repeat

The one physical acceptance authorized at the previous frontier is consumed by this operator interaction. Do not immediately request the user to repeat it.

First ingest all available sanitized observer/runtime evidence from this consumed window. Where evidence exists, classify structural Voice health, reset/watchdog/fatal markers, backend restart counts and queue/resource trends. Do not claim PASS for missing markers.

Then exhaust all safe deterministic/provider-disabled diagnosis and repair for:

```text
NODE_1=C8_JAPANESE_GLYPH_INTEGRITY
NODE_2=C7_OUTLOOK_CONNECT_SERVER_ERROR_AND_ENGLISH_LOCALIZATION
```

Keep other unreported C7/C8 acceptance items UNKNOWN unless already supported by independent structural evidence from this exact consumed window.

If safe work remains, represent it as READY or READONLY_READY and continue automatically. A report push, test pass, build pass, or review pass is not a stop.

## Authority boundaries preserved

This ingestion authorizes none of the following:

```text
PROVIDER_CALL=NO
BACKEND_REDEPLOY=NO_NEW_AUTHORITY
FIRMWARE_FLASH=NO
NOTE4_RESET=NO
NOTE4_REPAIR_OR_WIFI_CHANGE=NO
NOTE4_REPAIR_OR_PAIRING_CHANGE=NO
MICROSOFT_OAUTH_SIGNIN_OR_CONSENT=NO
GOOGLE_OAUTH_ACTION=NO
BILLING_CHANGE=NO
CREDENTIAL_CHANGE_OR_COPY=NO
PRIVATE_OUTLOOK_DATA_ACCESS=NO_NEW_AUTHORITY
C10_DEPLOYMENT=NO
C9_ARCHITECTURE_CHANGE=NO
MERGE_OR_RELEASE=NO
```

C10 remains separate. C9 remains parked research-only.

## Required durable checkpoint

Update `CAMPAIGN-STATE.md` at the next checkpoint so the old `PHYSICAL_ACCEPTANCE=ARMED` frontier is superseded by this consumed physical evidence and the safe work queue is represented accurately.

Before controller exit publish:

```text
PORTFOLIO_CURRENT_HEAD=
PORTFOLIO_CURRENT_PRIORITY=

C8_STAGE=
C8_PHYSICAL_ACCEPTANCE=CONSUMED
C8_JAPANESE_GLYPH_INTEGRITY=
C8_GLYPH_ROOT_CAUSE=
C8_REAL_ACCENT_ASR=
C8_INPUT_LATENCY=
C8_STABILITY=
C8_READY=
C8_READONLY_READY=
C8_NEXT_ACTION=

C7_STAGE=
C7_PHYSICAL_ACCEPTANCE=CONSUMED_PARTIAL_EVIDENCE
C7_OUTLOOK_SILENT_NOOP_REPAIR=
C7_OUTLOOK_CONNECTION_SUCCESS=
C7_OUTLOOK_ERROR_LANGUAGE=
C7_OUTLOOK_ERROR_CLASS=
C7_OUTLOOK_EARLIEST_FAILED_BOUNDARY=
C7_WEATHER_ICONS=UNKNOWN_UNLESS_EXACT_WINDOW_EVIDENCE_EXISTS
C7_READY=
C7_READONLY_READY=
C7_NEXT_ACTION=

PORTFOLIO_READY_NODE_COUNT=
PORTFOLIO_READONLY_READY_NODE_COUNT=
PORTFOLIO_WAITING_DEVICE_COUNT=
PORTFOLIO_WAITING_HUMAN_COUNT=
PORTFOLIO_EXTERNALLY_BLOCKED_COUNT=
PORTFOLIO_HUMAN_ACTION_REQUIRED=
PORTFOLIO_HUMAN_ACTION_REASON=
PORTFOLIO_TERMINAL_REASON=
PORTFOLIO_NEXT_ACTION=
```

Do not exit while safe READY or READONLY_READY work remains. Do not request a new physical/deployment/firmware/OAuth/provider authority until the relevant safe diagnosis, implementation, deterministic validation, freeze and required review are exhausted.