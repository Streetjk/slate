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
