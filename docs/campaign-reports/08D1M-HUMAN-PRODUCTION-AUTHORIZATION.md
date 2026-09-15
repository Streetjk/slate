# Campaign 8D1M — Human Production Deployment Authorization

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Human authorization

The human has accepted the current Gemini Developer API free-tier data-use/privacy risk for NOTE4 production voice/user content in `08D1M-FREE-TIER-DATA-POLICY-ACCEPTANCE.md` and now requests the next execution instruction at the sole remaining 8D1M production-deployment gate.

This checkpoint authorizes the bounded 8D1M production deployment and physical NOTE4 validation described in `08D1M-PRODUCTION-DEPLOYMENT-AND-PHYSICAL-E2E.md`, subject to the exact limits below.

```text
CAMPAIGN=8D1M
STATUS=HUMAN_AUTHORIZED_NOT_STARTED
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
AUTHORIZED_CANDIDATE_IMAGE_SHA=sha256:fa280ce50cc707f4c442834b3759638ca73851494ce4893a70208a96d2c1807d
AUTHORIZED_ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
MODEL=gemini-3.1-flash-live-preview
CURRENT_GEMINI_FREE_TIER_DATA_POLICY_ACCEPTED=YES
PRIVATE_NOTE4_CONTENT_POLICY_RISK_ACCEPTED=YES_FOR_CURRENT_FREE_TIER
PRODUCTION_DEPLOYMENT_AUTHORIZED=YES
PRODUCTION_RESTART_AUTHORIZED=YES
PRODUCTION_ENV_MUTATION_AUTHORIZED=YES_MINIMUM_EXACT_REVIEWED_GEMINI31_NODE_BRIDGE_SETTINGS_ONLY
PROTECTED_CREDENTIAL_PRODUCTION_USE_AUTHORIZED=YES_READ_ONLY_EXISTING_PROTECTED_FILE_ONLY
BILLING_CHANGE_AUTHORIZED=NO
VERTEX_CHANGE_AUTHORIZED=NO
CREDENTIAL_CREATE_OR_REPLACE_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
DESTRUCTIVE_HOST_OR_STORAGE_WORK_AUTHORIZED=NO
CALENDAR_WRITE_TEST_AUTHORIZED=NO
SEARCH_IN_INITIAL_PHYSICAL_E2E=NO
OUTLOOK_DATA_TO_GEMINI_AUTHORIZED=NO
```

## Mandatory live reconciliation before production mutation

Before any production deploy/restart/config mutation, Codex must live-reconcile:

1. PR #2 is still open/draft/unmerged and the branch contains this authorization;
2. 8D1L remains `READY_FOR_HUMAN_PRODUCTION_DECISION` with final exact GLM-5.3 review PASS and no unresolved P0/P1;
3. accepted source remains `7a724488a9ed20093469caefc03addc764185be5`;
4. candidate image ID is exactly `sha256:fa280ce50cc707f4c442834b3759638ca73851494ce4893a70208a96d2c1807d`;
5. rollback image ID is exactly `sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3` and is locally available on the production host;
6. current production Slate/MySQL health is green and restart counts have not drifted materially;
7. current official Google documentation still lists `gemini-3.1-flash-live-preview` for Live API use;
8. current Gemini API authentication rules are compatible with the existing protected credential. Because Google documents a September 2026 migration away from Standard keys, verify acceptance through a safe bounded preflight/provider handshake without reading, printing, hashing, copying, moving, or replacing the credential value;
9. the free-tier data-policy acceptance checkpoint remains present and unchanged;
10. no unexpected billing/Vertex requirement is introduced.

If any hash, source, credential mechanism, model/API compatibility, rollback availability, production health, or security boundary has materially drifted, stop before mutation, publish the sanitized evidence, and return to the human only if the issue cannot be resolved without a retained human-only action.

## Authorized production credential boundary

Use only the already established protected credential mechanism:

```text
HOST=note4-orangepi
SOURCE=/mnt/ssd-tmp/slate-tools/gemini-api-key/gemini_api_key
DESTINATION=/run/secrets/gemini_api_key
OWNER=pi
GROUP=pi
MODE=0600
TYPE=regular_non_symlink
MOUNT=read_only
```

Production use of this existing protected credential is authorized for 8D1M and subsequent normal NOTE4 Gemini 3.1 Live production traffic under the accepted current free-tier policy.

Never `cat`, print, hash, copy, move, screenshot, commit, place it in argv, place it in an image/build context, dump it through the environment, or expose it in logs. Do not create or replace the credential. If the current key is rejected because migration to a new Auth key is required, stop at a credential-replacement human gate; this authorization does not permit creating/replacing a key.

## Authorized production configuration scope

Codex may make only the minimum production runtime/configuration changes required by the reviewed source to run the exact Gemini 3.1 Live Developer-API Node-bridge path. Determine the exact variable names and values from the accepted source and existing campaign evidence; do not invent or broaden configuration.

The intended effective runtime is:

```text
MODEL=gemini-3.1-flash-live-preview
AUTH_PATH=existing_protected_developer_api_credential
LIVE_RUNTIME=reviewed_node_bridge
NODE_BRIDGE_PUBLIC=NO
NOTE4_DIRECT_GEMINI_ACCESS=NO
BACKEND_MODEL_AUTHORITY=YES
```

Do not enable billing, change Vertex configuration/account state, or expose the Node bridge publicly.

Before mutation, preserve a rollback snapshot of the current production image/configuration using secret-safe methods. Do not copy secret values into the report or repository.

## Execution sequence

Follow `08D1M-PRODUCTION-DEPLOYMENT-AND-PHYSICAL-E2E.md` with the following bounded authority:

1. reconcile exact source/image/rollback/PR state and current official Google model/auth policy;
2. verify production health and rollback availability;
3. preserve the current production configuration in a secret-safe rollback form;
4. mount the existing protected Gemini credential read-only;
5. deploy/start only the exact authorized candidate image with the minimum reviewed Gemini 3.1 Node-bridge production settings;
6. verify Slate/MySQL health, `/healthz`, public HTTPS/UI, Tailscale/Funnel, authenticated NOTE4 polling, unauthenticated voice-config 401, unauthenticated voice-WebSocket rejection, restart count, and Node bridge local-only status;
7. perform one bounded synthetic production backend Gemini 3.1 Live validation before real NOTE4 content;
8. only if the synthetic check passes, perform one bounded physical NOTE4 voice validation session containing an English conversational turn and a Japanese conversational turn, plus reconnect/exit/re-entry;
9. Search remains off during this initial physical E2E;
10. Calendar proposal/cancel behavior may be observed, but no Calendar write/test event is authorized by this checkpoint;
11. Outlook data must remain isolated and must not be sent to Gemini;
12. publish durable sanitized results and satisfy REPORT-PUSH-INVARIANT.

After a clean 8D1M PASS, the authorized production Gemini 3.1 Live runtime may remain running for normal NOTE4 use under the accepted current free-tier data-policy risk. Do not merge PR #2 automatically.

## Automatic rollback authority

Rollback is pre-authorized and should occur immediately, without another human gate, if any of the following happens during rollout or initial E2E:

- candidate/image/hash mismatch;
- credential exposure or unsafe credential handling;
- service or MySQL health regression;
- non-200 health gate;
- unexpected restart loop;
- device-auth or public-boundary regression;
- repeated Gemini Live failure or unacceptable basic reliability;
- Node bridge unexpectedly public/reachable;
- Outlook exposure;
- unexpected Calendar write;
- P0/P1 security finding;
- any unplanned production/data mutation.

Restore the exact preserved rollback image/configuration and verify full health. Publish the rollback result and continue autonomous zero-provider/diagnostic work under `AUTONOMY-AND-HUMAN-GATE-POLICY.md`. Return to the human only if a new provider/credential/billing/firmware/merge/destructive/privacy boundary is genuinely required.

## Still prohibited

This authorization does **not** permit:

- billing/tier changes;
- Vertex account/service changes;
- credential creation/replacement/recovery/exposure/relocation;
- firmware flashing;
- Calendar write testing;
- PR #2 merge;
- Campaign 6D work;
- PR #1/PR #3 expansion;
- destructive storage/database/host operations;
- disabling rollback safeguards;
- broad production configuration changes unrelated to the exact Gemini 3.1 Node-bridge path.

## Completion

On PASS, publish at minimum:

```text
CAMPAIGN=8D1M
STATUS=PRODUCTION_GEMINI31_LIVE_PASS
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
PRODUCTION_IMAGE_SHA=sha256:fa280ce50cc707f4c442834b3759638ca73851494ce4893a70208a96d2c1807d
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
PRODUCTION_HEALTH=PASS
GEMINI31_SYNTHETIC_PROD=PASS
NOTE4_EN_VOICE=PASS
NOTE4_JP_VOICE=PASS
SEARCH_EXECUTED=NO
CALENDAR_WRITE=NO
OUTLOOK_DATA_TO_GEMINI=NO
CREDENTIAL_EXPOSED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
```

Satisfy `REPORT-PUSH-INVARIANT.md`, update `CAMPAIGN-STATE.md`, commit/push/fetch/verify, and post a concise PR checkpoint. Do not stop for routine recoverable work.