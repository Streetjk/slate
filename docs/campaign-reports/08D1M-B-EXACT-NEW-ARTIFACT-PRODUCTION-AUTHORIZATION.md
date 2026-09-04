# Campaign 8D1M-B — Exact New-Artifact Production Authorization

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Human authorization

The human has already accepted the current Gemini Developer API free-tier data-use/privacy risk for NOTE4 production voice/user content. Campaign 8D1M-A has now completed the narrow production-guard correction and full zero-provider requalification.

This checkpoint explicitly authorizes production deployment and bounded initial physical validation of the exact corrected artifact identified below.

```text
CAMPAIGN=8D1M_B
STATUS=HUMAN_AUTHORIZED_NOT_STARTED
CORRECTED_SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
AUTHORIZED_CANDIDATE_IMAGE_SHA=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
AUTHORIZED_ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
MODEL=gemini-3.1-flash-live-preview
SDK_VERSION=2.20.0
PRODUCTION_OPT_IN=GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED
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
SEARCH_IN_INITIAL_VALIDATION=NO
OUTLOOK_DATA_TO_GEMINI_AUTHORIZED=NO
```

## Initial validation provider budget

A bounded campaign-level real-provider pool is authorized for deployment validation so routine transient failures do not create repeated human gates.

```text
INITIAL_VALIDATION_PROVIDER_SESSIONS_AUTHORIZED=5
INITIAL_VALIDATION_PROVIDER_SESSIONS_USED=0_OF_5
MODEL=gemini-3.1-flash-live-preview
AUTH_PATH=existing_protected_developer_api_credential
SYNTHETIC_INPUT_AUTHORIZED=YES
PRIVATE_NOTE4_VOICE_INPUT_AUTHORIZED=YES_UNDER_ACCEPTED_CURRENT_FREE_TIER_POLICY
SEARCH_AUTHORIZED=NO_DURING_INITIAL_VALIDATION
CALENDAR_WRITE_AUTHORIZED=NO
OUTLOOK_DATA_AUTHORIZED=NO
GENERATED_AUDIO_RETENTION_AUTHORIZED=NO
MICROPHONE_AUTHORIZED=YES_ONLY_FOR_BOUNDED_PHYSICAL_NOTE4_VALIDATION_AFTER_SYNTHETIC_PASS
PRODUCTION_SCOPE=EXACT_AUTHORIZED_IMAGE_ONLY
```

The pool is a maximum, not a target. Use the fewest real provider sessions necessary. Once an attempt is initiated it counts as used even if a launcher disconnects. Do not make repeated identical calls after a deterministic failure. After a provider failure, automatically perform all safe zero-provider diagnosis/correction permitted by `AUTONOMY-AND-HUMAN-GATE-POLICY.md`; consume another call from the remaining pool only when justified by evidence and only if the exact authorized production artifact remains unchanged. If a tracked source correction changes the source or image hash, stop before deploying that changed artifact because this authorization is exact-artifact bound.

After a clean 8D1M-B PASS, normal NOTE4 production use of the exact deployed Gemini 3.1 Live runtime is authorized under the already accepted current free-tier policy; normal user sessions are not part of this bounded initial-validation pool.

## Mandatory live reconciliation before any production mutation

Before deployment/restart/config mutation, Codex must live-reconcile and verify:

1. PR #2 remains open/draft/unmerged.
2. The branch contains this authorization and the completed 8D1M-A terminal report.
3. Corrected source is exactly `895e2d569d6ae0e8909c3e8958d64c189810f203` for tracked product/runtime files.
4. Candidate image is exactly `sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400`, `linux/arm64`, with Node `v22.22.2`, Bun `1.4.0`, and `@google/genai` `2.20.0` as attested by 8D1M-A.
5. Rollback image is exactly `sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3` and remains available on `note4-orangepi`.
6. Current production Slate/MySQL health is green and restart count has not materially drifted.
7. Current official Google documentation still lists `gemini-3.1-flash-live-preview` for Gemini Live API use.
8. Current Gemini API authentication guidance remains compatible with an existing protected API key. Google currently documents the September 2026 migration from Standard keys to Auth keys; do not assume the stored key type.
9. Free-tier data-policy acceptance remains present and unchanged.
10. No new billing/Vertex requirement is introduced.

A docs-only/report-only branch-head advance after the corrected source SHA is acceptable if product/runtime files and the authorized image remain exactly the attested artifact. Any product/runtime source drift, image mismatch, rollback loss, new security boundary, or production health regression is a hard stop before mutation.

## Protected credential boundary

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

Never `cat`, print, hash, copy, move, screenshot, commit, place the value in argv, place it in an image/build context, dump it through environment output, or expose it in logs or reviewer prompts.

Credential creation/replacement/recovery is NOT authorized. If the existing credential is rejected because Google now requires an Auth key or otherwise requires replacement, publish sanitized evidence and stop at the credential-replacement human gate.

## Exact authorized production configuration

Use the minimum reviewed production settings required by the corrected source. The effective Gemini Live path must be exactly:

```text
NODE_ENV=production
GEMINI_AUTH_MODE=developer_api_key
GEMINI_DEVELOPER_API_KEY_ENABLED=true
GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED=true
GEMINI_LIVE_RUNTIME=node_bridge
GEMINI_LIVE_MODEL=gemini-3.1-flash-live-preview
GEMINI_API_KEY_FILE=/run/secrets/gemini_api_key
```

Determine any required Node executable/bridge-script values from the exact candidate/source and 8D1M-A evidence; do not invent alternate paths.

Production Bun SDK + Developer API remains prohibited. Vertex/ADC account/service state must not be changed. The Node bridge must remain private stdio only with no public listener. NOTE4 must continue to talk only to Slate, never directly to Gemini.

## Execution sequence

Proceed autonomously through the following sequence.

1. Reconcile exact source/image/rollback/PR state and current official Google model/auth/data-policy documentation.
2. Recheck production Slate/MySQL health, `/healthz`, restart counts, public HTTPS/UI, Tailscale/Funnel, existing NOTE4 authenticated polling, unauthenticated voice-config rejection, and unauthenticated voice-WebSocket rejection.
3. Preserve a secret-safe rollback snapshot of current production image/configuration. Do not copy secret values into Git/reports.
4. Before mutating the running production service, run one exact-image disposable preflight using the existing protected credential read-only and synthetic prompt `Say exactly TEST.` with Search/tools/private data/microphone off. This consumes one session from the initial validation pool. PASS requires successful provider connection plus model event/turn completion through the exact corrected Slate -> Bun parent -> Node bridge -> Gemini Live path. Do not retain generated audio.
5. If the preflight fails because the credential itself is rejected or requires replacement/migration, do not deploy; stop at the credential-replacement gate. If it fails for a recoverable non-credential reason, perform autonomous zero-provider diagnosis and use another remaining validation session only when justified.
6. Only after a clean exact-image preflight, load/start the exact authorized ARM64 candidate with the exact minimum production Gemini settings and read-only protected secret mount.
7. Verify Slate/MySQL health, `/healthz` HTTP 200, restart count, public HTTPS/UI, Tailscale/Funnel, NOTE4 authenticated polling, unauthenticated voice-config 401, unauthenticated voice-WebSocket rejection, no legacy vendor regression, and Node bridge local-only status.
8. Run one bounded synthetic production backend Gemini 3.1 Live validation with prompt `Say exactly TEST.` before sending private NOTE4 content.
9. Only after the synthetic production check passes, perform bounded physical NOTE4 voice E2E under the accepted free-tier policy:
   - one English conversational turn;
   - one Japanese conversational turn;
   - reconnect/exit/re-entry;
   - Search remains off;
   - no Calendar write/test event;
   - Outlook remains isolated and no Outlook payload is sent to Gemini.
10. Use additional sessions from the five-session initial-validation pool only when required for the reconnect test or a justified transient retry. Do not exceed the pool.
11. If the physical E2E passes, leave the exact authorized production Gemini 3.1 Live runtime running for normal NOTE4 use.
12. Publish sanitized durable results, update `CAMPAIGN-STATE.md`, satisfy `REPORT-PUSH-INVARIANT.md`, commit/push/fetch/verify, and post a concise PR checkpoint. PR #2 remains open/draft/unmerged.

## Automatic rollback authority

Rollback is explicitly pre-authorized and must occur immediately without a new human gate if any of these occur during deployment/initial validation:

- source/image/hash mismatch;
- credential exposure or unsafe credential handling;
- service/MySQL health regression;
- `/healthz` non-200;
- unexpected restart loop;
- device-auth/public-boundary regression;
- repeated Gemini Live failure or unacceptable basic reliability;
- Node bridge unexpectedly public/reachable;
- Outlook exposure;
- unexpected Calendar write;
- P0/P1 security issue;
- unplanned production/data mutation.

Restore the exact preserved rollback image/configuration and verify full health. Publish the rollback result and continue autonomous zero-provider diagnosis where safe. Return to the human only when another exact artifact, credential replacement, billing/Vertex change, firmware flash, destructive operation, privacy/security decision, or merge decision is genuinely required.

## Still prohibited

This authorization does NOT permit:

- billing/tier changes;
- Vertex account/service changes;
- credential creation/replacement/recovery/exposure/relocation;
- firmware flashing;
- Search during the initial validation campaign;
- Calendar write testing;
- Outlook payload transmission to Gemini;
- PR #2 merge;
- Campaign 6D work;
- PR #1/PR #3 expansion;
- destructive storage/database/host operations;
- disabling rollback safeguards;
- broad unrelated production configuration changes.

## Successful terminal state

On PASS, publish at minimum:

```text
CAMPAIGN=8D1M_B
STATUS=PRODUCTION_GEMINI31_LIVE_PASS
CORRECTED_SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
PRODUCTION_IMAGE_SHA=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
PRODUCTION_OPT_IN=GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED
PRODUCTION_HEALTH=PASS
EXACT_IMAGE_PREDEPLOY_PROVIDER_PREFLIGHT=PASS
GEMINI31_SYNTHETIC_PROD=PASS
NOTE4_EN_VOICE=PASS
NOTE4_JP_VOICE=PASS
NOTE4_RECONNECT=PASS
INITIAL_VALIDATION_PROVIDER_SESSIONS_USED=<N>_OF_5
SEARCH_EXECUTED=NO
CALENDAR_WRITE=NO
OUTLOOK_DATA_TO_GEMINI=NO
CREDENTIAL_EXPOSED=NO
BILLING_ENABLED=NO
VERTEX_CHANGED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
NORMAL_PRODUCTION_USE_AUTHORIZED=YES_UNDER_ACCEPTED_CURRENT_FREE_TIER_POLICY
```

Do not stop for routine implementation-free reconciliation, transient network recovery, test/report publication, or rollback verification. Apply `AUTONOMY-AND-HUMAN-GATE-POLICY.md` throughout.

## 8D1M-B pre-deploy reconciliation checkpoint

Date: 2026-09-04 (Australia/Perth)

The branch was fetched and fast-forwarded to authorization checkpoint
`53662296b337e3852f39c31a51080893be731c3f`. PR #2 is open, draft, and
unmerged. The exact corrected product source remains
`895e2d569d6ae0e8909c3e8958d64c189810f203`; the exact authorized candidate is
`sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400`
and the exact rollback image is
`sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3`.

The local candidate attestation remains `linux/arm64`, Node `v22.22.2`, Bun
`1.4.0`, and `@google/genai` `2.20.0`. On `note4-orangepi`, the established
protected source exists as a regular non-symlink mode-600 `pi:pi` file with
non-empty metadata only; its value was not read. The exact candidate is not
yet present on that host, while the exact rollback image is present.

Read-only production reconciliation passed before any mutation:

```text
PRODUCTION_SLATE=healthy_running
PRODUCTION_MYSQL=healthy_running
PRODUCTION_RESTARTS=0
PRODUCTION_CURRENT_IMAGE=sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d
PRODUCTION_HEALTHZ=PASS
BILLING_ENABLED=NO_CHANGE
VERTEX_CHANGED=NO
PROVIDER_SESSIONS_USED=0_OF_5
```

Current official references still list `gemini-3.1-flash-live-preview` as a
Live API model. Google’s current API-key guidance notes the September 2026
Standard-key rejection/migration boundary; the existing protected key type is
not inferred from metadata. The first authorized preflight will therefore
test the existing key without exposing it. If Google rejects it as requiring
Auth-key migration, no credential replacement will be attempted and this
campaign will stop at that human credential boundary.

No production service mutation or provider session has occurred at this
checkpoint. The next authorized action is transfer of the exact candidate
image without touching the protected credential, followed by the exact-image
read-only protected-credential preflight.

## 8D1M-B preflight recovery checkpoint

The first detached exact-image preflight attempt was retained as container
`slate-8d1mb-preflight-20260904` and inspected separately. It failed during
disposable runner parsing because an `.mjs` runner contained TypeScript-only
`as never` syntax. The failure occurred before Slate initialization, credential
access, or provider handshake; no raw provider body or credential value was
read. The disposable runner was corrected only, with no product/source/image
change.

```text
PREFLIGHT_ATTEMPT_1=CONSUMED_BY_INITIATION
PREFLIGHT_FAILURE_CLASS=DISPOSABLE_RUNNER_SYNTAX_BEFORE_PROVIDER_ACCESS
PROVIDER_HANDSHAKE_STARTED=NO
CREDENTIAL_VALUE_READ=NO
PRODUCTION_SERVICE_MUTATED=NO
AUTHORIZED_IMAGE_UNCHANGED=YES
INITIAL_VALIDATION_PROVIDER_SESSIONS_USED=1_OF_5
NEXT_SESSION_JUSTIFICATION=RUN_CORRECTED_EXACT_IMAGE_PREFLIGHT_ONCE
```

The second detached attempt used the corrected runner but exposed one further
runner-only parse defect: a TypeScript return-type annotation remained in the
`.mjs` file. It again failed before Slate initialization, credential access,
or provider handshake. The runner is corrected and syntax-checked locally;
this is still no product/source/image drift.

```text
PREFLIGHT_ATTEMPT_2=CONSUMED_BY_INITIATION
PREFLIGHT_FAILURE_CLASS=DISPOSABLE_RUNNER_TYPESCRIPT_ANNOTATION_BEFORE_PROVIDER_ACCESS
PROVIDER_HANDSHAKE_STARTED=NO
CREDENTIAL_VALUE_READ=NO
PRODUCTION_SERVICE_MUTATED=NO
AUTHORIZED_IMAGE_UNCHANGED=YES
INITIAL_VALIDATION_PROVIDER_SESSIONS_USED=2_OF_5
NEXT_SESSION_JUSTIFICATION=RUN_SYNTAX_CHECKED_EXACT_IMAGE_PREFLIGHT_ONCE
```

## 8D1M-B preflight evidence-capture recovery checkpoint

The third detached exact-image preflight used the syntax-checked runner and
completed with exit code 0. Its logs reported `PREFLIGHT_RESULT_PERSISTED=PASS`,
but independent retrieval showed that the sanitized result was written inside
the container's disposable `/tmp` tmpfs. Because that tmpfs is not durable
after container exit, `docker cp` could not recover the result. This is a
deterministic disposable-runner evidence-capture defect, not a provider or
product failure; no result is treated as proven until it is recovered from an
independent host-bound output path.

```text
PREFLIGHT_ATTEMPT_3=INITIATED_AND_PROVIDER_RUN_COMPLETED
PREFLIGHT_FAILURE_CLASS=SANITIZED_RESULT_LOST_IN_DISPOSABLE_TMPFS_AFTER_EXIT
PROVIDER_HANDSHAKE_STARTED=YES
SANITIZED_PASS_OBSERVABLE_AFTER_EXIT=NO
CREDENTIAL_VALUE_READ=NO
PRODUCTION_SERVICE_MUTATED=NO
AUTHORIZED_IMAGE_UNCHANGED=YES
INITIAL_VALIDATION_PROVIDER_SESSIONS_USED=3_OF_5
NEXT_SESSION_JUSTIFICATION=ONE_CORRECTED_RUNNER_WITH_HOST_BOUND_SANITIZED_RESULT
```

The runner-only correction is to bind a dedicated disposable output directory
for the sanitized JSON result while retaining the read-only container and
read-only protected credential mount. No credential value is read, printed,
copied, or persisted by this correction. The next session is the single
justified evidence-capture retry; no provider call is made until this
correction is installed and syntax-checked.

## 8D1M-B exact-image pre-deploy provider preflight PASS checkpoint

The fourth initiated preflight used the exact loaded candidate image and the
same protected host source mounted read-only at
`/run/secrets/gemini_api_key`. The disposable container was uniquely named,
root-read-only, and retained until separate status, wait, log, and
host-bound-result retrieval completed. The sanitized result was then verified
as a regular mode-600 `pi:pi` host file before the disposable container was
removed. The result contains no provider response body, audio, credential, or
private content.

```text
PREFLIGHT_ATTEMPT_4=PASS
PREFLIGHT_FAILURE_CLASS=NONE
EXACT_IMAGE_PREDEPLOY_PROVIDER_PREFLIGHT=PASS
PROVIDER_RESULT=PASS
MODEL=gemini-3.1-flash-live-preview
MODEL_EVENT=YES
TURN_COMPLETE=YES
SEARCH_EXECUTED=NO
TOOL_INVOCATIONS=0
PRIVATE_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
CREDENTIAL_EXPOSED=NO
RESULT_CAPTURE=HOST_BOUND_SANITIZED_JSON
RESULT_FILE_MODE=600
RESULT_FILE_OWNER=pi:pi
RESULT_RETRIEVED_AFTER_CONTAINER_EXIT=YES
DISPOSABLE_CONTAINER_CLEANED_AFTER_EVIDENCE=YES
PRODUCTION_SERVICE_MUTATED=NO
INITIAL_VALIDATION_PROVIDER_SESSIONS_USED=4_OF_5
```

The authorized candidate source/image/rollback lineage remains unchanged.
Production deployment is now the next authorized stage, pending the required
fresh read-only production snapshot and health/route checks. No production
container has been stopped or restarted at this checkpoint.

## 8D1M-B pre-mutation production snapshot and boundary checks PASS

The fresh read-only production snapshot was captured from the existing Compose
project before any service mutation. Secret-bearing environment values were
not printed or inspected. The rollback configuration is preserved by the
existing project file and persistent Slate bind mount; the MySQL service and
its data mount remain outside the candidate service replacement.

```text
PRODUCTION_SLATE=running_healthy
PRODUCTION_MYSQL=running_healthy
PRODUCTION_RESTARTS_SLATE=0
PRODUCTION_RESTARTS_MYSQL=0
PRODUCTION_CURRENT_IMAGE=sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d
PRODUCTION_CURRENT_CONTAINER=slate-note4
PRODUCTION_NETWORK=slate-note4-deploy_default
PRODUCTION_PORT=3001:3001
PRODUCTION_RESTART_POLICY=unless-stopped
PRODUCTION_DATA_MOUNT=/home/pi/slate-note4-deploy/slate-data:/data:rw
MYSQL_DATA_MOUNT=/home/pi/slate-note4-deploy/mysql-data:/var/lib/mysql:rw
PRODUCTION_HEALTHZ_LOCAL=HTTP_200
PRODUCTION_HEALTHZ_PUBLIC=HTTP_200
PRODUCTION_WEB_UI_LOCAL=HTTP_200
PRODUCTION_WEB_UI_PUBLIC=HTTP_200
TAILSCALE=Running
FUNNEL=https://orangepi5.tail6aabef.ts.net -> http://127.0.0.1:3001
NOTE4_AUTHENTICATED_POLLING=HTTP_201_EVENTS_OBSERVED
VOICE_CONFIG_UNAUTHENTICATED=HTTP_401
VOICE_WEBSOCKET_UNAUTHENTICATED=CLOSE_1008_DEVICE_AUTHENTICATION_FAILED
LEGACY_XIAOZHI_OTA=HTTP_404
PRODUCTION_MUTATED=NO
ROLLBACK_SNAPSHOT=CAPTURED_SECRET_SAFE
```

The candidate image is loaded on `note4-orangepi` under transport identity
`sha256:f644fa6fa0bed63b3f248d33038e8595016fd453e78f6bb97565495a2268de5`.
Its complete RootFS layer chain and `.Config` digest match the authorized
local candidate `sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400`;
the differing image IDs are recorded as Docker save/load transport identity,
not artifact drift. The protected source remains the established non-symlink
mode-600 file and will be mounted only read-only at
`/run/secrets/gemini_api_key`.

All mandatory pre-mutation checks pass. The next action is the authorized
exact candidate Slate-service replacement, with the current Compose project,
persistent data mount, MySQL dependency, and existing non-secret environment
configuration preserved, plus only the reviewed Gemini 3.1 Node-bridge
settings and protected read-only secret mount.

## 8D1M-B exact candidate production deployment checkpoint

The exact authorized candidate was deployed through the existing
`slate-note4-deploy` Compose project. Only the Slate service was recreated;
MySQL was not restarted or recreated. The existing `/data` persistent bind
mount, network, port, restart policy, and environment-file configuration were
preserved. The reviewed Gemini settings were applied as the explicit
production environment override and the established protected host file was
bound read-only at the reviewed destination. No environment values were
dumped, and no credential value was read or exposed.

```text
DEPLOYMENT=PASS
PRODUCTION_CONTAINER=slate-note4
PRODUCTION_IMAGE_TRANSPORT_ID=sha256:f644fa6fa0bed63b3f248d33038e8595016fd453e78f6bb97565495a2268de5c
AUTHORIZED_IMAGE_ID=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
IMAGE_ROOTFS_AND_CONFIG_MATCH=YES
PRODUCTION_ARCH=linux/arm64
PRODUCTION_HEALTH=healthy
PRODUCTION_RESTARTS_SLATE=0
PRODUCTION_MYSQL=healthy
PRODUCTION_RESTARTS_MYSQL=0
PRODUCTION_HEALTHZ_LOCAL=HTTP_200
PRODUCTION_HEALTHZ_PUBLIC=HTTP_200
PRODUCTION_WEB_UI_LOCAL=HTTP_200
PRODUCTION_WEB_UI_PUBLIC=HTTP_200
GEMINI_API_KEY_MOUNT=/run/secrets/gemini_api_key
GEMINI_API_KEY_MOUNT_READ_ONLY=YES
PROTECTED_SOURCE_VALUE_EXPOSED=NO
NODE_BRIDGE_PUBLIC_LISTENER=NO_WHEN_IDLE
VOICE_CONFIG_UNAUTHENTICATED=HTTP_401
VOICE_WEBSOCKET_UNAUTHENTICATED=CLOSE_1008_DEVICE_AUTHENTICATION_FAILED
LEGACY_XIAOZHI_OTA=HTTP_404
TAILSCALE_FUNNEL=PASS
PRODUCTION_GEMINI_SYNTHETIC_CHECK=NOT_RUN_YET
NOTE4_POST_RESTART_POLLING=AWAITING_NEXT_DEVICE_POLL
PROVIDER_SESSIONS_USED=4_OF_5
```

The candidate is running without a health or boundary regression. The one
remaining provider session is reserved for the bounded synthetic production
backend check before any physical NOTE4 content is sent. A physical test will
not be started if that check fails.
