# Campaign 8D1M-G — PROPOSED P2 Manual Button Observation

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Close the remaining physical-observation gap after the exact Campaign 8 firmware app-only flash passed. The firmware write, boot, authenticated polling, production health, and no-vendor source/backend checks already pass. The remaining unobserved items require a human to press the NOTE4 controls.

This proposal does **not** authorize real/private microphone audio to Gemini, any new provider session, billing/Vertex changes, credential changes, firmware reflash, backend mutation, Calendar write, or PR merge.

## Accepted checkpoint

```text
PR2=OPEN_DRAFT_UNMERGED
P1_FLASH=PASS_APP_ONLY_0x10000
P2_DEVICE_BOOT=PASS
P2_AUTHENTICATED_POLLING=PASS
P2_PAIRING_PRESERVED=YES
P2_SERVER_ADDRESS_PRESERVED=YES
PRODUCTION_SLATE=HEALTHY
PRODUCTION_MYSQL=HEALTHY
PRODUCTION_BACKEND=QUALIFIED_GEMINI_2_5_DEVELOPER_API
TENCLASS_SOURCE_CHECK=PASS_ABSENT
PRIVATE_MICROPHONE_TO_GEMINI=NO
```

## Safe manual observation

The human may perform **one double-tap ENTER only** while Codex observes sanitized USB serial and backend route/log evidence.

Required observations:

1. confirm the NOTE4 opens the expected Voice AI screen/flow;
2. record whether any Tenclass/Xiaozhi activation screen, code request, or control-panel prompt appears;
3. record whether the NOTE4 fetches Slate voice configuration as a consequence of entering Voice AI;
4. record any authenticated Slate voice WebSocket connection only if it occurs before microphone streaming;
5. record no fallback to `api.tenclass.net` or other legacy vendor route;
6. verify Slate/MySQL/local/public health remain green.

Do **not** perform a short ENTER press under this proposal if that action can start microphone capture/streaming. Do not speak into the device for provider testing. Do not deliberately open a Gemini Live provider session with real microphone data.

If double-tap ENTER itself unexpectedly begins forwarding microphone content to Gemini, terminate/exit the Voice AI flow promptly, retain only sanitized structural evidence, and stop at the P3 privacy boundary.

## Closure

Publish the exact physical observations and update `CAMPAIGN-STATE.md`.

Preferred closure:

```text
P2_DOUBLE_TAP_ENTER=PASS
P2_VOICE_AI_UI=PASS
TENCLASS_ACTIVATION_PHYSICAL=ABSENT
P2_SLATE_VOICE_CONFIG_FETCH=PASS|NOT_TRIGGERED_UNTIL_SHORT_ENTER
P2_AUTHENTICATED_VOICE_WEBSOCKET=PASS|NOT_TRIGGERED_UNTIL_SHORT_ENTER
PRIVATE_MICROPHONE_PROVIDER_TEST=NOT_RUN
READY_FOR_P3_PRIVACY_DECISION=YES
```

If the authenticated voice WebSocket or microphone path requires short ENTER, classify that remaining action as part of the explicit P3/private-microphone decision rather than weakening the privacy gate.

`REPORT-PUSH-INVARIANT.md` remains binding. Keep PR #2 open/draft/unmerged.