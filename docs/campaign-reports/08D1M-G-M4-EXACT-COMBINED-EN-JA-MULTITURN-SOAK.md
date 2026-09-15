# Campaign 8D1M-G M4 — exact combined EN/JA multi-turn Voice AI soak

## Purpose

The one-shot NOTE4 network qualification has passed. The remaining human boundary is exactly one combined multi-turn Voice AI soak designed to stress the previously observed pattern: initially quick response, progressive slowdown after several turns, apparent freeze, and eventual return to Settings.

This is a single physical session. Do not split it into multiple short sessions and do not repeat it blindly.

```text
MODE=FRONTIER_DRIVEN_LONGRUN
PR_NUMBER=2
PR_STATE_REQUIRED=OPEN
PR_DRAFT_REQUIRED=YES
PR_MERGED_REQUIRED=NO
NETWORK_QUALIFICATION=PASS
CANONICAL_REVIEWER=GROK_4_6
NO_ZAI_RETRY=true
PHYSICAL_SOAK_COUNT=1
TARGET_USER_TURNS=8
LANGUAGE_MIX=4_EN_4_JA_ALTERNATING
```

## Before the operator starts

Codex must verify the existing sanitized observer is running and connected, backend/MySQL remain healthy, and no runtime bytes/configuration/firmware changed since the network-qualified checkpoint.

Do not rebuild, redeploy, reflash, reset, re-pair, change Wi-Fi, change Gemini provider/model/auth, or touch private-data authority merely to prepare the soak.

## Exactly one physical soak

The operator should perform one continuous Voice AI session with 8 short non-sensitive factual turns, alternating English and Japanese. Wait for each complete assistant response before asking the next question.

Suggested sequence:

1. EN — How many days are in a week?
2. JA — 日本の首都はどこですか？
3. EN — What planet do we live on?
4. JA — 一年は何ヶ月ありますか？
5. EN — How many minutes are in an hour?
6. JA — 水は何度で凍りますか？
7. EN — What is the largest ocean on Earth?
8. JA — 日本の通貨は何ですか？

Do not use Search, tools, Calendar, Outlook, private information, sensitive content, or long prompts during this soak.

After turn 8, exit Voice AI normally and observe whether the device returns cleanly to the expected non-Voice screen/Settings behavior.

## Operator observations

The operator only needs to report structural/user-visible observations, not transcripts:

```text
EARLY_TURN_LATENCY=FAST|ACCEPTABLE|SLOW|UNKNOWN
LATE_TURN_LATENCY=FAST|ACCEPTABLE|SLOW|UNKNOWN
PROGRESSIVE_LATENCY_DEGRADATION=YES|NO|UNKNOWN
APPARENT_FREEZE=YES|NO
VOICE_SERVICE_ERROR=YES|NO
BUBBLE_ORDER_CORRECT=YES|NO|UNKNOWN
ONE_BUBBLE_PER_ROLE_BEHAVIOR=PASS|FAIL|UNKNOWN
JAPANESE_KANA_RENDERING=PASS|FAIL|UNKNOWN
JAPANESE_NO_GLYPH=PASS|FAIL|UNKNOWN
AUDIBLE_ASSISTANT_AUDIO=PASS|FAIL|UNKNOWN
VOICE_AI_EXIT=PASS|FAIL|UNKNOWN
UNEXPECTED_REBOOT_OR_SETTINGS_RETURN=YES|NO|UNKNOWN
```

The Japanese questions intentionally include `の` so the repaired kana font path can be checked directly.

## Required sanitized evidence ingestion

Immediately after this one session, Codex must consume the human observations and reconcile the already-armed sanitized instrumentation. Retain no raw audio, transcript, provider payload, credential, device identity, IP/MAC/SSID, Calendar content, Outlook content, or private data.

Capture/derive only structural evidence needed to compare early and late turns, including where available:

```text
TURN_COUNT_OBSERVED=
EARLY_TURN_PROVIDER_LATENCY_MS=
LATE_TURN_PROVIDER_LATENCY_MS=
PROVIDER_READY_TO_FIRST_OUTPUT_TREND=
TRANSCRIPT_FINAL_LATENCY_TREND=
BACKEND_EVENT_QUEUE_TREND=
NODE_BRIDGE_STDIO_BACKLOG_TREND=
PRE_PROVIDER_MIC_QUEUE_TREND=
FIRMWARE_UI_EVENT_QUEUE_TREND=
FIRMWARE_AUDIO_QUEUE_TREND=
HEAP_INTERNAL_FREE_TREND=
HEAP_PSRAM_FREE_TREND=
RESET_REASON_CLASS=
WATCHDOG_REASON_CLASS=
VOICE_WS_CLOSE_CLASS=
PROVIDER_SESSION_STATUS=
FIRST_MIC_FRAME_STATUS=
AUDIO_CHAIN_STATUS=
FATAL_MARKER_COUNT=
SLATE_RESTART_COUNT=
MYSQL_RESTART_COUNT=
```

Do not claim a queue/resource root cause unless the captured evidence supports it.

## PASS criteria

M4 physical stability acceptance requires the combined evidence to support all of the following:

- no progressive latency degradation across the 8-turn session;
- no apparent freeze or unexpected reset/watchdog event;
- user/assistant bubble ordering remains correct;
- no fragment-created extra bubbles / pathological e-ink redraw churn;
- Japanese kana, including `の`, renders correctly;
- assistant audio is audible;
- the session exits cleanly;
- no Voice service unavailable/error branch;
- backend/MySQL remain healthy.

Baseline provider latency may still be materially slow. A stable 8-turn session with consistently slow provider response may pass the stability/freeze repair while opening a separate provider-latency optimization node. Do not conflate stable-but-slow with progressive degradation.

## Post-session controller behavior

If PASS:

- publish the exact physical-soak result;
- close the M4 progressive-lag/freeze acceptance node;
- separate any residual constant provider latency into its own optimization item if still materially slow;
- complete M4 accounting, artifact/runtime identity, privacy/security, and residual-risk reporting;
- update `CAMPAIGN-STATE.md`;
- continue any remaining READY/READONLY_READY campaign work automatically;
- do not merge/release PR #2.

If FAIL:

- consume this one physical attempt; do not request an immediate blind retry;
- mechanically identify the earliest/dominant failed boundary from the sanitized evidence;
- continue autonomously through Codex adjudication -> AGY `gemini-3.8-flash-high` minimum repair -> deterministic validation -> privacy/secret scan -> exact artifact freeze -> fresh Grok 4.6 review -> impacted deployment/reflash -> requalification -> observer rearm;
- only return to the operator when another physical test is genuinely the sole remaining useful node or a true authority/security boundary is reached.

A report push, review PASS, deployment, flash, observer rearm, or recoverable failure is not terminal while READY or READONLY_READY work remains.

Before controller exit publish:

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

Keep PR #2 OPEN / DRAFT / UNMERGED.
