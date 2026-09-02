# Campaign 8D1M — Production deployment and physical NOTE4 voice E2E

Date: 2026-09-02 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
Prerequisite: 8D1L READY_FOR_HUMAN_PRODUCTION_DECISION plus explicit human authorization covering both Gemini data-policy acceptance and production deployment.

## Human-only gate

DO NOT EXECUTE THIS CAMPAIGN merely because the file exists. It is a prepared future directive only.

Execution requires explicit human approval of:
1. the then-current Gemini Developer API/free-tier data-use/privacy policy for real NOTE4 voice/user content;
2. use of the protected runtime Gemini credential in production;
3. the exact candidate image SHA and rollback image SHA;
4. production deployment/restart;
5. any later firmware flash as a separate exact-artifact authorization if needed.

## Objective

Deploy the exact 8D1L-reviewed backend candidate, switch only the authorized backend Gemini runtime/model settings, validate production health, then perform a bounded physical NOTE4 voice E2E without weakening Outlook/Calendar/device-security boundaries.

## Routing

- controller: Luna;
- worker: Sonnet 4.6 for bounded correction only if explicitly safe and non-destructive;
- reviewer: GLM-5.3-Flash read-only for any post-authorization source correction;
- repository integrator/validator/sole writer: Codex.

## Deployment sequence

1. Fetch/reconcile and verify exact authorized source/image/rollback hashes.
2. Verify production health and available rollback before mutation.
3. Mount the protected Gemini credential read-only using the reviewed runtime mechanism; never print/copy it into Git/chat/logs.
4. Load/start only the exact authorized backend image and exact reviewed settings.
5. Verify Slate/MySQL health, public HTTPS/UI, Tailscale/Funnel, NOTE4 authenticated polling, unauthenticated voice-config 401, unauthenticated voice WebSocket rejection, and no legacy vendor regression.
6. Verify Node Live boundary local-only and healthy.
7. Run a bounded synthetic production backend Live check before sending real NOTE4 content.
8. If synthetic production check passes and human data-policy authorization covers real content, run physical NOTE4 voice E2E:
   - English conversational turn;
   - Japanese conversational turn;
   - Search only if separately intended and no sensitive payload;
   - Calendar proposal flow with no write until physical Confirm;
   - Cancel path produces zero Calendar writes;
   - reconnect/exit/re-entry;
   - no Outlook payload sent to Gemini.
9. Any Calendar write test must be an explicitly authorized disposable test event and physically confirmed on NOTE4. Otherwise leave Calendar write untested.
10. Roll back immediately on health regression, credential leak, repeated Live failure, P0/P1 security issue, device auth regression, unexpected Calendar write, Outlook exposure, or unacceptable latency/reliability.

## Firmware boundary

Do not flash firmware unless a separate explicit human message authorizes the exact firmware artifact and hash. Backend deployment authorization does not imply firmware authorization.

## Success state

```text
CAMPAIGN=8D1M
STATUS=PRODUCTION_GEMINI31_LIVE_PASS
PRODUCTION_IMAGE_SHA=<authorized sha>
ROLLBACK_IMAGE_SHA=<authorized sha>
PRODUCTION_HEALTH=PASS
GEMINI31_SYNTHETIC_PROD=PASS
NOTE4_EN_VOICE=<PASS/NOT_RUN>
NOTE4_JP_VOICE=<PASS/NOT_RUN>
CALENDAR_PROPOSAL=<PASS/NOT_RUN>
CALENDAR_CONFIRM_WRITE=<PASS/NOT_RUN_AUTH_REQUIRED>
CALENDAR_CANCEL_ZERO_WRITE=<PASS/NOT_RUN>
OUTLOOK_DATA_TO_GEMINI=NO
CREDENTIAL_EXPOSED=NO
FIRMWARE_FLASHED=<NO/YES_EXPLICITLY_AUTHORIZED>
PR2_MERGED=NO
```

PR #2 merge remains a separate human decision after production soak/evidence.

## Hard stops

Any hash mismatch; credential exposure; rollback unavailable; production health drift; unexpected paid/billing requirement; private-data policy not accepted; unconfirmed Calendar write; Outlook exposure; firmware flash without exact authorization; merge without authorization.
