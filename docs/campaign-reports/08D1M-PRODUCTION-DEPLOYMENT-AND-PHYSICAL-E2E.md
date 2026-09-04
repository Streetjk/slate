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

## 8D1M pre-mutation execution checkpoint

Execution date: 2026-09-04 (Australia/Perth)

The exact 8D1M authorization was live-reconciled from commit
`ecb3dfa9942bc9f1960819e29b7192c1faf5b339`. Safe pre-mutation checks found a
real compatibility boundary in the unchanged reviewed source, so production
was not mutated and no Gemini provider handshake was attempted.

```text
CAMPAIGN=8D1M
STATUS=HARD_STOP_AUTHORIZED_PRODUCTION_CONFIG_REJECTED_BEFORE_CHILD
AUTHORIZATION_SHA=ecb3dfa9942bc9f1960819e29b7192c1faf5b339
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
AUTHORIZED_CANDIDATE_IMAGE_SHA=sha256:fa280ce50cc707f4c442834b3759638ca73851494ce4893a70208a96d2c1807d
AUTHORIZED_ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
LOCAL_CANDIDATE_IMAGE=PASS_EXACT_ID
PRODUCTION_ROLLBACK_IMAGE=PASS_EXACT_ID_AVAILABLE
PRODUCTION_SLATE_HEALTH=PASS
PRODUCTION_MYSQL_HEALTH=PASS
PRODUCTION_RESTARTS=0
PRODUCTION_HEALTHZ=PASS
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
PROVIDER_CALLS_8D1M=0
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
```

### Exact guard incompatibility

The authorized effective settings require `NODE_ENV=production`,
`GEMINI_AUTH_MODE=developer_api_key`,
`GEMINI_DEVELOPER_API_KEY_ENABLED=true`,
`GEMINI_LIVE_RUNTIME=node_bridge`, and
`GEMINI_LIVE_MODEL=gemini-3.1-flash-live-preview`. In the exact reviewed
source, `GeminiConfig.isConfigured()` rejects `node_bridge` whenever
`NODE_ENV=production`, before `GeminiLiveService` can spawn the Node child or
read the protected credential. The exact ARM64 candidate provider-disabled
matrix reproduced this rejection and passed its fail-closed test.

```text
PRODUCTION_NODE_BRIDGE_GUARD=FAIL_CLOSED
CHILD_SPAWN_ATTEMPTED=NO
CREDENTIAL_VALUE_READ=NO
AUTHORIZED_IMAGE_SOURCE_COMPATIBILITY=FAIL
NODE_ENV_OVERRIDE_TO_TEST_OR_DEVELOPMENT=PROHIBITED
SOURCE_CHANGE_TO_BYPASS_GUARD=NOT_AUTHORIZED_BY_THIS_EXACT_IMAGE_CHECKPOINT
DEPLOYMENT_ATTEMPTED=NO
ROLLBACK_EXECUTED=NO_NOT_DEPLOYED
```

No source correction or environment-mode bypass is safe under this exact
candidate authorization: overriding `NODE_ENV` would weaken production
semantics, while changing the guard would require a new reviewed source and
new image hash. The existing production Developer API/Node-bridge guard is
preserved.

### Current official Gemini boundary

The current official documentation still lists
`gemini-3.1-flash-live-preview` as Live API supported and accepts text/audio
inputs. Google’s current API-key guidance states that new keys are Auth keys,
unrestricted standard keys are rejected, and Gemini API requests from
standard keys are scheduled for rejection in September 2026. The existing
protected credential’s key type was not inspected, exposed, hashed, or sent
for a provider handshake because the exact candidate is rejected before
credential access. A future retry therefore requires a human decision on a
new reviewed production-compatible source/image and/or an already approved
Auth-key credential; this checkpoint does not create or replace credentials.

- [Gemini 3.1 Flash Live Preview](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview)
- [Using Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)
- [Gemini API billing](https://ai.google.dev/gemini-api/docs/billing)

### Human boundary

The candidate and rollback state remain preserved. No public endpoint, secret
mount, service configuration, physical NOTE4 session, Search, Calendar write,
or private-data operation was attempted. The next action is a human decision
to authorize a corrected, separately reviewed production-compatible artifact
and authentication boundary; this exact candidate must not be deployed as a
way around the fail-closed guard.
