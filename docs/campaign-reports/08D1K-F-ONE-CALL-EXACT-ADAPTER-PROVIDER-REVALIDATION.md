# Campaign 8D1K-F — One-call exact Slate-adapter provider revalidation

Date authorized: 2026-09-03 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## 1. Purpose and authorization

This is a new, separately authorized provider-validation campaign that begins only after successful completion of Campaign 8D1K-E.

The human has explicitly authorized **one and only one new Gemini provider call** for an exact full-Slate-adapter validation.

This authorization does not alter historical 8D1K accounting. Preserve it exactly:

```text
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
```

Create a separate budget for this campaign:

```text
CAMPAIGN=8D1K_F
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=0_OF_1
```

Do not reuse or reset the old `3_OF_3` budget.

## 2. Starting checkpoint

Start from the latest live remote PR #2 state after fetching origin.

The accepted 8D1K-E terminal evidence before this directive was:

```text
STATUS=REVIEW_CLOSED_DETERMINISTICALLY_READY_FOR_HUMAN_PROVIDER_REVALIDATION_DECISION
FINAL_SOURCE_SHA=693288a7b63d61a7ef9fe0e68d1882e5585353d8
GLM53_REVIEW=PASS
GLM53_P0=0
GLM53_P1=0
GLM53_P2=0
FULL_TESTS=PASS
ARM64_BUILD=PASS
EXACT_FULL_ADAPTER_PROVIDER_DISABLED_E2E=PASS
PROVIDER_CALLS_THIS_CAMPAIGN=0
8D1K_TOTAL_PROVIDER_CALLS_USED=3_OF_3
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=YES
```

If the live branch has advanced since that checkpoint, reconcile the exact remote state and do not reset backwards.

## 3. Current official Google constraints verified before campaign creation

Fresh official Google documentation was checked on 2026-09-03.

Current exact model:

```text
gemini-3.1-flash-live-preview
```

Google documents this model as supporting Live API, function calling, Search grounding, text/audio I/O, and thinking.

Current Gemini API key policy:

- Gemini API supports standard and authorization keys;
- new keys are now auth keys by default;
- unrestricted standard keys are rejected;
- Google states that standard keys will be rejected in September 2026 and migration to auth keys is required.

Current data-use distinction in Google pricing documentation:

```text
Free Tier: Used to improve our products = Yes
Paid Tier: Used to improve our products = No
```

This campaign sends only synthetic, non-private text and no private NOTE4/Outlook/Calendar data. Therefore this one-call evaluation is authorized even if the current project remains on Free Tier. This does **not** authorize production use of private data on Free Tier.

Production data-policy and billing decisions remain a later human boundary.

## 4. Controller routing

Use the existing campaign routing:

- controller/stage authority: **Luna**;
- bounded worker/correction analysis if needed after the call: **Sonnet 4.6**;
- independent reviewer: exact **GLM-5.3-Flash** through `zai-glm53-reviewer`, read-only, only if a new source correction becomes necessary;
- **Codex**: sole repository writer, integrator, validator, checkpoint publisher.

No silent reviewer substitution.

Do not use GLM-5.2, Grok, Hermes, Gemini reviewer, Claude reviewer, or another ZAI model/profile in place of the exact GLM-5.3-Flash reviewer.

## 5. Non-negotiable invariants

Preserve all of the following:

- production Developer API / Node bridge remains fail-closed under `NODE_ENV=production`;
- do not weaken/remove the production guard;
- backend remains model authority;
- NOTE4 never stores Gemini/Google credentials and never calls Gemini directly;
- API-key material remains runtime-only and backend-only;
- credential references remain restricted to trusted private runtime secret roots;
- do not print, log, copy, commit, screenshot or otherwise expose credential values;
- Outlook remains read-only and isolated from Gemini;
- Google Calendar remains proposal-only until physical NOTE4 confirmation;
- no direct Calendar write is exposed to this provider validation;
- Search disabled for the authorized call;
- tools disabled for the authorized call;
- no private NOTE4, Outlook or Calendar payload;
- no microphone input;
- generated audio must not be retained;
- billing remains off/unattached unless a later human explicitly changes it;
- Vertex remains disabled;
- no production deployment or restart;
- no production `.env` mutation;
- no firmware flash;
- no PR #2 merge;
- no Campaign 6D, PR #1, PR #3, Airtable, Immich, storage, or unrelated host work.

## 6. F0 — Fresh reconciliation

Before any provider call:

1. `git fetch origin --prune`;
2. verify PR #2 remains open, draft and unmerged;
3. verify current remote head and local relationship;
4. read:
   - `AGENTS.md`;
   - `docs/campaign-reports/CAMPAIGN-INSTRUCTIONS.md`;
   - `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`;
   - `docs/campaign-reports/CAMPAIGN-STATE.md`;
   - `docs/campaign-reports/08-GEMINI-35-LIVE.md`;
   - `docs/campaign-reports/08D1K-E-LONGRUN-REVIEW-CLOSURE-AND-REVALIDATION.md`;
   - this directive;
5. verify the final product/runtime source lineage and current exact candidate SHA;
6. verify no unrelated local/user work will be overwritten;
7. confirm historical accounting remains `3_OF_3` and this campaign budget begins `0_OF_1`;
8. perform read-only production health only through the already-approved safe path if available; no restart/mutation.

## 7. F1 — Credential and exact-candidate preflight

Before spending the one provider call, prove without exposing credential values:

```text
AUTH_MODE=developer_api_key
LIVE_RUNTIME=node_bridge
MODEL=gemini-3.1-flash-live-preview
NODE_ENV=<explicit non-production value>
CREDENTIAL_REFERENCE_ROOT=<trusted private runtime secret root>
CREDENTIAL_FILE_READ_ONLY=YES
SEARCH_ENABLED=NO
TOOLS_ENABLED=NO
PRIVATE_DATA_INCLUDED=NO
MICROPHONE_INCLUDED=NO
GENERATED_AUDIO_RETAINED=NO
```

The call must use the exact reviewed/final candidate artifact produced by the 8D1K-E lineage. Do not quietly rebuild from a materially different source tree.

If the credential is unavailable or rejected before the provider call can be made, do **not** spend repeated attempts. Publish the boundary and stop.

Do not use `NODE_ENV=production` for this provider validation.

## 8. F2 — One exact full-Slate-adapter real-provider call

This is the **only authorized Gemini provider call** in 8D1K-F.

Run one full adapter session with this exact shape:

```text
PROVIDER=Gemini Developer API
MODEL=gemini-3.1-flash-live-preview
NODE_ENV=explicit_nonproduction
AUTH=protected runtime credential
RUNTIME=node_bridge
INPUT_TYPE=text
INPUT="Say exactly TEST."
SEARCH=disabled
TOOLS=disabled
PRIVATE_DATA=none
OUTLOOK_DATA=none
CALENDAR_DATA=none
MICROPHONE=none
GENERATED_AUDIO_RETAINED=no
DURABLE_RESULT_CAPTURE=yes
```

The session must exercise the real Slate boundaries, not a minimal direct-Node control:

```text
Slate GeminiConfig
→ GeminiLiveService
→ Bun parent adapter
→ Node bridge
→ @google/genai/node
→ Gemini Live provider
```

Do not replace this with a direct SDK or Node-only call.

Use the durable result harness proven in prior recovery work so launcher/SSH/control disconnect cannot erase the result.

### Required PASS criteria

All of the following are required:

```text
PROVIDER_CALL_EXIT=0
MODEL_EVENT=YES
TURN_COMPLETE=YES
SLATE_ADAPTER_ERROR=NO
TOOL_INVOCATIONS=0
SEARCH_EXECUTED=NO
PRIVATE_DATA_SENT=NO
RESULT_DURABLY_RECOVERABLE=YES
OOM=NO
```

The exact model response text does not need to be retained if doing so creates unnecessary output persistence. The key success signal is a valid model/server event plus turn completion through the full adapter.

## 9. F3 — Call adjudication

### If F2 PASS

Do not make a second provider call.

Immediately set:

```text
CAMPAIGN=8D1K_F
STATUS=PASS_EXACT_FULL_ADAPTER_REAL_PROVIDER_REVALIDATION
PROVIDER_CALLS_USED=1_OF_1
EXACT_ADAPTER_MODEL_EVENT=YES
EXACT_ADAPTER_TURN_COMPLETE=YES
READY_FOR_8D1L=YES
HUMAN_ACTION_REQUIRED=NO_FOR_8D1L_AUDIT_ONLY
```

Then continue automatically into durable publication for 8D1K-F and, after the report is pushed/verified, begin **8D1L production-readiness audit** only if its existing directive prerequisites are satisfied.

8D1L remains non-production readiness work. Passing F2 does not authorize production deployment, production API-key use, billing enablement, firmware flash, or PR merge.

### If F2 fails before model event/turn completion

Do not make another provider call automatically.

Classify the failure using sanitized evidence only.

If the result proves a specific Slate/runtime defect that can be corrected without another provider call:

1. Luna adjudicates exact root cause;
2. Sonnet 4.6 may perform bounded correction analysis;
3. Codex remains sole writer;
4. run deterministic/full/ARM64 gates;
5. exact GLM-5.3-Flash review is required for any product/runtime source correction;
6. publish the result;
7. stop at a new human boundary for any further provider call.

Do not infer a second provider-call budget.

If failure is credential/quota/provider availability rather than source defect, publish the sanitized boundary and stop.

## 10. F4 — No-repeat rule

The authorized budget is exactly one provider call.

After that call, regardless of PASS or FAIL:

```text
PROVIDER_CALLS_USED=1_OF_1
PROVIDER_CALLS_REMAINING=0
```

No retry, second validation call, Node control, SDK direct control, or tool/Search test is authorized by this directive.

Any further real Gemini call requires a new explicit human authorization and a new budget.

## 11. F5 — Validation after call

After F2, run only the deterministic checks necessary to prove the resulting repository state/report is coherent.

If no source changed:

- do not rerun every expensive build solely for ceremony if the exact candidate and its 8D1K-E gates are unchanged;
- verify the candidate/source SHA used for the provider call matches the already validated artifact;
- verify durable result evidence;
- secret scan new report/checkpoint content;
- `git diff --check`;
- verify production health read-only if safe.

If source changed because a proven defect was corrected, rerun the full deterministic/ARM64/reviewer gates required by 8D1K-E standards before any future authorization.

## 12. F6 — Durable publication

Obey `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`.

At every terminal state:

1. update `docs/campaign-reports/08-GEMINI-35-LIVE.md`;
2. update this directive with the exact checkpoint;
3. update `docs/campaign-reports/CAMPAIGN-STATE.md`;
4. secret-check all new evidence;
5. `git diff --check`;
6. selectively commit authorized files;
7. push the active PR branch;
8. fetch/verify exact remote SHA;
9. verify PR #2 remains open/draft/unmerged;
10. post a concise PR #2 checkpoint comment with exact source SHA, call result, budget, production state, and next action.

A local-only result does not count as a completed checkpoint.

## 13. Success terminal state

Preferred success state:

```text
CAMPAIGN=8D1K_F
STATUS=PASS_EXACT_FULL_ADAPTER_REAL_PROVIDER_REVALIDATION
FINAL_SOURCE_SHA=<exact source sha>
MODEL=gemini-3.1-flash-live-preview
EXACT_FULL_ADAPTER_REAL_PROVIDER_E2E=PASS
EXACT_ADAPTER_MODEL_EVENT=YES
EXACT_ADAPTER_TURN_COMPLETE=YES
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=1_OF_1
PROVIDER_CALLS_REMAINING=0
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
SEARCH_EXECUTED=NO
TOOL_INVOCATIONS=0
PRIVATE_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
RESULT_DURABLY_RECOVERABLE=YES
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=YES
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=NO_FOR_8D1L_AUDIT_ONLY
NEXT_ACTION=BEGIN_8D1L_PRODUCTION_READINESS_AUDIT_NONPRODUCTION_ONLY
```

## 14. Failure terminal states

### Credential/auth boundary before call

```text
STATUS=HARD_STOP_PROVIDER_AUTH_OR_CREDENTIAL_BOUNDARY
PROVIDER_CALLS_USED=0_OF_1
READY_FOR_8D1L=NO
HUMAN_ACTION_REQUIRED=YES
```

### Provider call made but exact adapter failed

```text
STATUS=HARD_STOP_EXACT_FULL_ADAPTER_REAL_PROVIDER_REVALIDATION_FAILURE
PROVIDER_CALLS_USED=1_OF_1
READY_FOR_8D1L=NO
HUMAN_ACTION_REQUIRED=YES
```

### Security boundary

```text
STATUS=HARD_STOP_CREDENTIAL_OR_PRIVATE_DATA_BOUNDARY
READY_FOR_8D1L=NO
HUMAN_ACTION_REQUIRED=YES
```

## 15. Controller liveness

This is a bounded one-call campaign.

Continue autonomously through F0 → F1 → F2 → F3 → F5 → F6 while the next action is authorized and no hard stop occurs.

If F2 passes and the durable report is pushed/verified, continue automatically into the existing 8D1L **non-production readiness audit** if all prerequisites are met.

Do not continue into 8D1M.

Normal human boundaries are:

1. any credential/private-data/security blocker before the one call;
2. any failure after the one call that would require a second provider call;
3. after 8D1L, the production API-key/data-policy/billing/deployment decision.

No production deployment, restart, firmware flash, billing change, Vertex enablement, or PR merge is authorized by this directive.

## 16. F1 credential preflight hard stop

After fetching origin and fast-forwarding to authorization checkpoint
`82c05b208f1306cf83553834762c88dc6deb9274`, PR #2 was verified open, draft,
and unmerged. The local environment and standard trusted secret roots contained
no protected Gemini credential reference. The active production Slate container
was verified healthy but has no Gemini credential mount, preserving the
production fail-closed boundary. The remote deployment directory contains a
mode-600 production `.env`; it was not read or loaded into a disposable
process, because doing so would expose unrelated production secret material and
would not be a protected isolated runtime mount.

No provider call was made. No credential value was read, printed, moved, or
mounted. The one-call budget remains available but cannot be spent until a
human supplies an approved host-local protected runtime secret reference through
the existing secure mechanism.

```text
CAMPAIGN=8D1K_F
STATUS=HARD_STOP_PROVIDER_AUTH_OR_CREDENTIAL_BOUNDARY
F1=FAIL
F1_FAILURE_CLASS=PROTECTED_RUNTIME_CREDENTIAL_UNAVAILABLE
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=0_OF_1
PROVIDER_CALLS_REMAINING=1
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
MODEL=gemini-3.1-flash-live-preview
NODE_ENV=NOT_STARTED_EXPLICIT_NONPRODUCTION
SEARCH_ENABLED=NO
TOOLS_ENABLED=NO
PRIVATE_DATA_INCLUDED=NO
MICROPHONE_INCLUDED=NO
GENERATED_AUDIO_RETAINED=NO
CREDENTIAL_VALUE_EXPOSED=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_PROVIDE_APPROVED_HOST_LOCAL_PROTECTED_RUNTIME_CREDENTIAL_REFERENCE_THEN_RESUME_F1
```
