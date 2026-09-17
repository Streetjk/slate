# Campaign 8D1K-R — Disposable Node harness recovery

Date: 2026-09-03 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
Prerequisite checkpoint: `150d1c633623a4c14d83ed839c2ba1f325b38db5`
Reviewed implementation remains: `90ab7cbbff39dfb4dda79cf1260611e5f26cf941`

## Objective

Recover or replace the disposable Node validation harness after 8D1K call 1 became unobservable because the SSH/Docker control path timed out before returning the sanitized result. Prove the harness can durably preserve and recover a sanitized result even when the launching shell/client loses the response.

This is a harness-only recovery stage. It authorizes **zero Gemini provider calls**.

## Routing

- controller: Luna;
- worker: Sonnet 4.6 only for bounded harness/test work if useful;
- reviewer: GLM-5.3-Flash only if tracked product/runtime source changes; no review call is required for documentation-only or disposable harness work;
- repository integrator/validator/sole writer: Codex.

## Accepted prior state

- 8D1J final implementation `90ab7cbbff39dfb4dda79cf1260611e5f26cf941` remains reviewed PASS.
- 8D1K call 1 used one of three authorized provider sessions.
- The disposable driver/container exited `0`, `OOM=false`, with no runtime error, but the sanitized model-event/turn-complete summary was not recovered.
- The failure class is `HARNESS_SSH_DOCKER_CLIENT_TIMEOUT`, not provider rejection or provider success.
- Calls 2 and 3 remain unused and are **not authorized by this recovery directive**.

## R1 — Reconcile and preserve implementation

Fetch origin and verify PR #2 remains open, draft, unmerged. Read:

- `AGENTS.md`;
- `docs/campaign-reports/CAMPAIGN-STATE.md`;
- `docs/campaign-reports/08-GEMINI-35-LIVE.md`;
- `docs/campaign-reports/08D1K-NODE-LIVE-NONPROD-E2E.md`;
- this directive.

Do not modify the reviewed Node Live bridge merely to work around the harness unless deterministic evidence proves a product-source defect.

## R2 — Replace the fragile result-collection shape

The recovered harness must not depend on one long-lived SSH/Docker client call returning the final result.

Prefer a bounded design with these properties:

1. create a uniquely named disposable container without `--rm`;
2. run the driver with provider access disabled/mocked for this stage;
3. write one sanitized terminal result record to a durable disposable location independent of the initiating shell, such as a dedicated mounted temp result file and/or container stdout retained by Docker logs;
4. wait/poll for container completion separately from result retrieval;
5. retrieve exit status, OOM state, sanitized result, and logs in separate bounded commands;
6. verify the result remains recoverable after deliberately interrupting or timing out the launcher/control connection;
7. only after evidence capture, remove the disposable container/files;
8. never write credentials, tokens, raw provider errors, private data, or generated audio to the result artifact.

The result schema should include at minimum:

```text
HARNESS_RESULT_VERSION=<...>
HARNESS_TERMINAL_STATE=<PASS/FAIL/TIMEOUT>
DRIVER_EXIT_CODE=<...>
OOM=<true/false>
SANITIZED_FAILURE_CLASS=<...>
MODEL_EVENT=<YES/NO/NOT_APPLICABLE>
TURN_COMPLETE=<YES/NO/NOT_APPLICABLE>
RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=<YES/NO>
```

## R3 — Zero-provider deterministic proof

Use a fake/mock driver or provider-disabled bridge path only. No Gemini network request is allowed.

At minimum prove:

- normal success result survives container exit;
- deterministic failure result survives container exit;
- launcher timeout/disconnect does not destroy the result;
- container logs/result artifact can be retrieved in a fresh SSH/Docker command;
- cleanup happens only after result verification;
- secret mount is absent for these tests;
- production Slate/MySQL containers remain untouched and healthy.

If local Mac Docker is available, it may be used. If not, a uniquely named disposable Orange Pi container is permitted, isolated from production and with no protected Gemini credential mounted.

## R4 — Source-change rule

If recovery can be completed using disposable harness changes only, do not change tracked product source.

If a reusable tracked harness/script is clearly justified, keep it evaluation-only, ensure it cannot make a provider call without an explicit separate flag/config gate, add deterministic tests, run relevant lint/typecheck/format checks, secret scan, and obtain GLM-5.3-Flash review if the change touches product/runtime code.

## R5 — Checkpoint

Update `docs/campaign-reports/08-GEMINI-35-LIVE.md` and `CAMPAIGN-STATE.md` with non-secret evidence.

Successful recovery state:

```text
CAMPAIGN=8D1K_R
STATUS=HARNESS_RECOVERED_NO_PROVIDER_CALL
PROVIDER_CALLS_THIS_STAGE=0
8D1K_TOTAL_PROVIDER_CALLS_USED=1_OF_3
HARNESS_DURABLE_RESULT=PASS
RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
PRODUCT_SOURCE_CHANGED=<YES/NO>
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1K_REAUTHORIZATION=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REAUTHORIZE_REMAINING_8D1K_PROVIDER_CALLS
```

Commit intended report/harness changes, push, and verify remote state.

## Hard stops

Stop for credential exposure/suspected exposure, production mutation, billing/Vertex requirement, private data exposure, destructive storage/system action, firmware flash, PR merge, unresolved P0/P1, or inability to make the sanitized result durable without relying on the fragile one-shot SSH/Docker response.

Do not use either of the remaining two Gemini Live sessions in this campaign.