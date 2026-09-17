# Campaign 8D1F–8D1H — Overnight Gemini Live diagnostic, correction, and readiness run

Date: 2026-09-02 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
Starting checkpoint: `b46b6da9134ba385d20ad11698e0e33c6e53420b`

## Authorization and objective

The operator explicitly requested an overnight campaign after reviewing the 8D1E checkpoint. This directive authorizes **further non-production diagnostics** for the generic `GEMINI_LIVE_CONNECTION_FAILED` result, bounded implementation corrections when the evidence identifies a Slate/runtime defect, deterministic revalidation, exact GLM-5.3-Flash review, and a final synthetic non-production adapter verification.

This directive does **not** authorize production deployment/restart, production Gemini auth/model changes, billing, Vertex enablement, firmware flash, private user-data submission, PR #2 merge, destructive host/storage work, or unrelated campaigns.

The overnight goal is not to retry blindly. It is to determine, with the fewest provider calls possible, whether the failure is caused by:

1. current Gemini API/project/free-tier availability;
2. JavaScript SDK/version behavior;
3. Bun versus Node runtime behavior;
4. Slate client-factory wiring;
5. Slate Live configuration/tool/transcription setup; or
6. another reproducible non-secret transport/protocol condition.

If the failure is isolated and safely correctable, correct it and prove the exact final adapter. If it is external/transient/ambiguous, stop with durable evidence rather than broadening scope.

## Active routing

- **Controller:** Luna
- **Worker:** Sonnet 4.6
- **Independent reviewer:** GLM-5.3-Flash via the configured `zai-glm53-reviewer` path, high effort, read-only
- **Repository integrator / deterministic validator / sole repository writer:** Codex

Luna controls stage progression and adjudicates findings. Sonnet 4.6 may perform bounded analysis/implementation/correction work only. GLM-5.3-Flash is read-only. Codex alone writes repository changes, runs authoritative validation, commits, pushes, verifies remote state, and publishes checkpoints.

No silent model substitution is allowed. If Sonnet 4.6 or exact GLM-5.3-Flash is unavailable, continue only work that does not require that role and stop at the first role-dependent gate with a non-secret blocker report.

## Controller liveness

Use this loop throughout the night:

`fetch/reconcile remote -> recompute exact stage -> inspect evidence -> bounded diagnostic or implementation -> deterministic validation -> Luna adjudication -> Sonnet 4.6 bounded correction if useful -> GLM-5.3-Flash exact-artifact review when required -> revalidation -> durable report/state checkpoint -> selective commit -> push -> verify remote -> continue automatically to the next authorized stage`

Do not return control merely because one sub-step completed. Continue until a hard stop or the final human production boundary.

## Global safety invariants

1. Keep billing disabled/unattached.
2. Keep `aiplatform.googleapis.com` / Vertex disabled; make no Vertex model calls.
3. The existing protected Gemini Developer API credential remains backend/runtime-secret-only.
4. Never print, echo, log, trace, copy to chat/Git, expose through process arguments, include in URLs shown to the terminal, or persist the credential value outside its existing protected source.
5. Do not enable HTTP/WebSocket debug modes that dump request URLs, query strings, headers, environment variables, or SDK request objects; Gemini API keys may be carried in auth material that such tracing could expose.
6. No private NOTE4, Outlook, Calendar, Search-history, real microphone, or other user content may be sent during the overnight diagnostics.
7. Provider inputs are synthetic only. Default prompt: `Say exactly TEST.`
8. Generated audio must not be retained.
9. Do not execute real tools during provider diagnostics. If a synthetic session unexpectedly requests a tool, reject it safely; no Calendar write and no external action.
10. Outlook remains read-only and isolated from Gemini.
11. Calendar remains proposal-only until physical NOTE4 confirmation; overnight diagnostics perform zero Calendar writes.
12. No production container/env/model/auth change or restart.
13. No firmware flash.
14. No PR #2 merge or base-branch integration.
15. No Campaign 6D, PR #1, PR #3, Airtable, Immich, storage migration, package-removal, or unrelated expansion.

## Provider-call budget

8D1E already consumed its one authorized adapter attempt. This overnight directive authorizes a **new bounded diagnostic budget of at most 6 Gemini Live sessions total**, including the final verification session if reached.

Rules:

- Use fewer calls whenever evidence is already decisive.
- Never loop or retry the same shape merely because it failed.
- At most one call for each distinct diagnostic shape below.
- A quota/free-tier/billing-required response is a hard stop for further provider calls in this overnight run.
- A credential/auth rejection is a hard stop until the configuration is reconciled without exposing the secret.
- Do not exceed 6 new Live sessions under any circumstances.
- REST/catalog metadata calls should be avoided unless genuinely required; if used, keep them minimal and non-private and record the count separately.

---

# Campaign 8D1F — Differential diagnosis of the generic adapter failure

## F0 — Reconcile exact state

1. Fetch origin and fast-forward/reconcile without rewriting history.
2. Verify PR #2 remains open, draft, and unmerged.
3. Verify remote starting checkpoint and read:
   - `docs/campaign-reports/08-GEMINI-35-LIVE.md`
   - `docs/campaign-reports/CAMPAIGN-STATE.md`
   - `docs/campaign-reports/08D1E-GEMINI31-LIVE-SECURE-BACKEND-INTEGRATION.md`
   - this directive.
4. Confirm accepted 8D1E evidence:
   - exact final implementation `4bfce037b2d206dbabca9ab905301c088a0c1f01`;
   - 297 backend tests + 6 shared tests PASS;
   - lint/typecheck/format/frontend build/diff check PASS;
   - GLM-5.3-Flash exact-artifact review PASS, P0/P1/P2 = 0;
   - standalone 8D1D Python SDK Live probe historically PASS with billing unattached;
   - one 8D1E actual-adapter disposable ARM64 attempt failed only as generic `GEMINI_LIVE_CONNECTION_FAILED`.
5. Recheck production health and safety state read-only. Do not change production.

If newer remote work materially conflicts, stop and report the conflict rather than overwriting it.

## F1 — Static/runtime differential before any provider call

Do not call Gemini yet.

Build a compact evidence matrix with exact versions/behaviors for:

- repository-resolved `@google/genai` version from the lockfile/install, not merely the `^2` manifest range;
- Bun version used by the backend/container;
- Node version available in a clean ARM64 disposable runtime;
- Python + `google-genai` version from the previously successful 8D1D control if still reproducible from recorded evidence;
- CPU architecture and TLS/OpenSSL/runtime details relevant to WebSocket connectivity;
- the exact public Live endpoint path/service selected by the JS SDK for Developer API mode, inspected without exposing any credential-bearing query string;
- whether the SDK uses global/native WebSocket, `ws`, fetch/undici, or another transport under Node and Bun;
- abort-signal behavior around `client.live.connect`;
- whether `@google/genai` documents/supports Bun for Live WebSocket use at the resolved version;
- the exact Slate Live connect configuration: model, AUDIO response modality, system instruction, input/output transcription, and tool registry.

Inspect the installed SDK/package source in a disposable workspace if necessary. Do not patch dependencies in place and do not log credential-bearing request material.

Compare the final Slate implementation against the current official JavaScript server Live example. Record differences as hypotheses ranked by likelihood. Pay particular attention to runtime compatibility and configuration differences because 8D1D already proved the key/project/model can establish a Live session through the Python SDK.

## F2 — Build disposable diagnostic harnesses

Prepare disposable ARM64 harnesses from the exact source/lock state. They must be removable and must not alter production.

Harness shapes:

A. **Official-minimal Node JS control**
- exact resolved `@google/genai` package;
- Node runtime;
- Developer API client constructed from runtime secret;
- exact model `gemini-3.1-flash-live-preview`;
- minimal official Live configuration sufficient for synthetic text -> response;
- no tools, no Search, no transcription unless the current official minimum requires it.

B. **Official-minimal Bun control**
- same package/model/config as A;
- Bun runtime matching Slate as closely as practical.

C. **Slate client-factory minimal control**
- actual `GeminiConfig.clientOptions()` + `createGeminiClient()` from final Slate source;
- minimal Live config, bypassing `GeminiLiveService` feature configuration only for isolation;
- same synthetic prompt.

D. **Slate service reduced-feature control**
- actual `GeminiLiveService` connection path;
- Search disabled;
- no real tool execution;
- if a temporary diagnostic seam is required to isolate transcription/tools, keep it test-only/disposable unless evidence later justifies a production-source correction.

E. **Full Slate service control**
- exact intended 8D1E adapter configuration;
- Search/tool declarations as current implementation would supply, but no tool execution;
- synthetic prompt only.

Do not execute all shapes automatically. F3 decides the minimum sequence.

## F3 — Bounded provider diagnostic ladder

Use the provider-call budget adaptively.

### Call 1 — Node minimal control

Run A once.

Record only sanitized evidence:
- connect PASS/FAIL;
- WebSocket close code / HTTP status if available without dumping URL/headers;
- SDK exception class/name/category;
- whether setup completed;
- whether a model event arrived;
- whether turn complete arrived;
- latency bands if useful.

Do not preserve raw provider dumps if they may contain auth/request details.

Decision:
- If A PASS -> continue to Call 2.
- If A FAIL with quota/billing/auth -> hard stop provider calls and classify.
- If A FAIL generically -> use one Python control only if it can materially distinguish current service availability from JS-specific failure; otherwise stop and investigate locally first.

### Optional Call 2-control — Python availability control

Only if Node A failed generically and current service availability is ambiguous, run one minimal Python control equivalent to the known-good 8D1D shape.

- Python PASS + Node FAIL => classify JS SDK/runtime path as primary suspect; continue local analysis before any more calls.
- Python FAIL too => classify external/service/quota/project condition unless specific evidence says otherwise; do not burn more calls tonight.

### Call 2 — Bun minimal control

If Node A passed, run B once.

- Node PASS + Bun FAIL => isolate Bun/runtime compatibility. Do not mutate Slate feature configuration to compensate until local root cause is understood.
- Node PASS + Bun PASS => continue to Call 3.

### Call 3 — Slate client-factory minimal control

Run C once only if A/B show the SDK/runtime can connect.

- B PASS + C FAIL => isolate Slate auth/client-factory/config wiring.
- C PASS => continue to Call 4.

### Call 4 — Reduced-feature Slate service

Run D once.

- C PASS + D FAIL => isolate `GeminiLiveService` connection configuration/lifecycle.
- D PASS => continue only if needed to Call 5.

### Call 5 — Full Slate service

Run E once if preceding evidence is healthy and the call is still useful.

- E PASS => 8D1F diagnosis resolves as transient/prior-runtime or corrected diagnostic environment; proceed to 8D1H readiness audit if no source change is needed.
- E FAIL with D PASS => isolate full feature configuration (tools/Search/transcriptions/system setup). Proceed to 8D1G correction only with a specific hypothesis.

Reserve at least one of the six authorized calls for the post-correction exact-final verification if source changes are made. If five calls have already been consumed and a code correction is required, the sixth call is the only permitted final verification.

## F4 — Diagnostic outcomes

Checkpoint one of the following, or an equally precise evidence-based status:

- `DIAG_NODE_JS_PROVIDER_FAILURE`
- `DIAG_EXTERNAL_OR_CURRENT_SERVICE_FAILURE`
- `DIAG_BUN_RUNTIME_INCOMPATIBILITY`
- `DIAG_SLATE_CLIENT_FACTORY_FAILURE`
- `DIAG_SLATE_LIVE_CONFIG_FAILURE`
- `DIAG_FULL_ADAPTER_TRANSIENT_PASS`
- `DIAG_QUOTA_OR_FREE_TIER_BLOCK`
- `DIAG_AUTH_BLOCK`
- `DIAG_INCONCLUSIVE_BUDGET_EXHAUSTED`

If there is no safely correctable Slate/runtime defect, skip 8D1G and go directly to the durable checkpoint/human boundary.

---

# Campaign 8D1G — Evidence-driven correction and exact-artifact verification

Run this campaign only when 8D1F has isolated a correctable problem in Slate, its selected JS SDK/runtime integration, or a narrowly scoped Live configuration incompatibility.

## G0 — Correction rules

- Luna selects the correction hypothesis from F evidence.
- Sonnet 4.6 may propose/implement a bounded patch in a worktree or reviewable diff.
- Codex adjudicates and is sole repository writer/integrator.
- Preserve backend-only credential handling and default `vertex_adc` behavior.
- Do not weaken fail-closed credential validation.
- Do not expose provider errors/raw URLs merely to make diagnostics easier.
- Do not disable Calendar confirmation semantics or Outlook isolation.
- Do not remove tools/Search/transcription capabilities permanently merely to make a test pass unless current official Gemini 3.1 Live capability proves a specific unsupported combination and the product impact is explicitly documented.
- Do not introduce a new sidecar/service, new provider, API proxy, or major architecture solely to work around one runtime failure without a strong evidence case. Such a redesign is a human boundary.
- Dependency upgrades/downgrades are permitted only if F demonstrates a version-specific SDK/runtime defect or current official compatibility requirement. Lock the exact version and justify it.

## G1 — Local deterministic proof before provider call

Add/adjust tests that reproduce the isolated defect where practical.

Run:

- full backend tests;
- shared tests;
- lint;
- typecheck;
- format check;
- frontend production build;
- `git diff --check`;
- relevant secret-safety checks;
- any new runtime compatibility/unit/integration test justified by F.

All must pass before another provider call.

## G2 — Luna adjudication + GLM independent review

Review the exact candidate correction, not an earlier SHA.

GLM-5.3-Flash must receive:
- exact diff;
- sanitized F evidence;
- deterministic validation summary;
- no credentials/private data.

Review focus:
- whether the fix follows the actual diagnostic evidence;
- credential leakage;
- runtime/SDK assumptions;
- accidental default/production behavior change;
- Live session lifecycle;
- tool/Search behavior;
- Calendar/Outlook isolation;
- rollback ability;
- test sufficiency.

Luna adjudicates every finding. Sonnet 4.6 may perform bounded corrections. Codex integrates and reruns authoritative validation. Stop on unresolved P0 or persistent P1.

## G3 — Final exact-adapter provider verification

Use **one** remaining authorized Live call on the exact final reviewed source.

Conditions:
- disposable non-production runtime only;
- actual backend runtime mode/client factory/`GeminiLiveService` path;
- exact `gemini-3.1-flash-live-preview`;
- existing protected credential mounted read-only at runtime only;
- synthetic text only;
- no private data;
- no real tool execution;
- generated audio not retained;
- billing still unattached;
- Vertex still disabled.

PASS requires:
- Live connection established;
- at least one expected model response event;
- turn complete observed;
- no credential exposure;
- no production mutation.

If it fails, do not exceed the call budget and do not begin another speculative fix/retry cycle tonight. Record the exact sanitized classification and stop.

---

# Campaign 8D1H — Overnight readiness audit and durable checkpoint

Run after either:
- 8D1F full-adapter PASS without source correction; or
- 8D1G exact-final adapter PASS after correction.

If neither condition is met, run only the failure checkpoint subsection and stop.

## H0 — Full final validation

Against the exact final source SHA:

1. full backend tests;
2. shared tests;
3. lint;
4. typecheck;
5. format check;
6. frontend build;
7. `git diff --check`;
8. secret scan / changed-file credential safety;
9. configuration regression tests;
10. device voice auth negative tests;
11. Calendar proposal/Confirm/Cancel tests;
12. Outlook isolation tests;
13. Live lifecycle/reconnect/cleanup tests;
14. verify default auth remains `vertex_adc` unless explicitly selected otherwise;
15. verify production has not changed.

## H1 — Final independent review

If any source changed after the last GLM review, run exact GLM-5.3-Flash read-only review again on the exact final SHA. If no source changed and 8D1E's exact final reviewed source remains unchanged, the prior PASS may be retained, but explicitly document that no code changed after it.

Luna adjudicates. No unresolved P0/P1 is permitted for readiness.

## H2 — Production-boundary readiness assessment

Do not deploy. Assess whether the project is technically ready for the operator's separate production/data-policy decision.

Required technical readiness:

```text
DEVELOPER_API_BACKEND_AUTH_MODE_IMPLEMENTED=YES
DEFAULT_VERTEX_ADC_PATH_PRESERVED=YES
CREDENTIAL_RUNTIME_ONLY=YES
CREDENTIAL_EXPOSURE=NO
DETERMINISTIC_GATES=PASS
GLM53_FLASH_REVIEW=PASS
GEMINI31_LIVE_EXACT_ADAPTER_PROBE=PASS
BILLING_ENABLED=NO
VERTEX_API_ENABLED=NO
PRODUCTION_CHANGED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
```

If all are true, set:

```text
STATUS=READY_FOR_HUMAN_PRODUCTION_API_KEY_AND_DATA_POLICY_DECISION
READY_FOR_PRODUCTION_DEPLOYMENT_REVIEW=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_FREE_TIER_DATA_POLICY_AND_AUTHORIZE_OR_REJECT_PRODUCTION_RUNTIME_SECRET_AND_GEMINI31_LIVE_DEPLOYMENT
```

Stop there. Do not deploy automatically.

## H3 — Failure checkpoint

If the exact adapter does not pass tonight, set a precise status based on the isolated layer. Do not mark production-ready.

At minimum record:

```text
CAMPAIGN=8D1F_8D1H_OVERNIGHT
STATUS=<precise result>
START_SHA=b46b6da9134ba385d20ad11698e0e33c6e53420b
END_SHA=<exact final source/checkpoint SHA>
CONTROLLER=LUNA
WORKER=SONNET_4_6
REVIEWER=GLM_5_3_FLASH
PROVIDER_LIVE_CALLS_USED=<0..6>
REST_METADATA_CALLS_USED=<count>
NODE_MINIMAL=<PASS/FAIL/NOT_RUN>
PYTHON_CONTROL=<PASS/FAIL/NOT_RUN>
BUN_MINIMAL=<PASS/FAIL/NOT_RUN>
SLATE_CLIENT_FACTORY_MINIMAL=<PASS/FAIL/NOT_RUN>
SLATE_REDUCED_SERVICE=<PASS/FAIL/NOT_RUN>
SLATE_FULL_ADAPTER=<PASS/FAIL/NOT_RUN>
ROOT_CAUSE_CLASS=<...>
SOURCE_CORRECTION_MADE=<YES/NO>
FINAL_IMPLEMENTATION_SHA=<...>
BACKEND_TESTS=<...>
SHARED_TESTS=<...>
LINT=<...>
TYPECHECK=<...>
FORMAT=<...>
FRONTEND_BUILD=<...>
SECRET_SCAN=<...>
GLM53_FLASH_REVIEW=<PASS/REVISE/BLOCKED/RETAINED_PRIOR_PASS>
CREDENTIAL_COMMITTED=NO
CREDENTIAL_LOGGED=NO
CREDENTIAL_TO_NOTE4=NO
PRIVATE_NOTE4_DATA_SENT=NO
OUTLOOK_DATA_SENT_TO_GEMINI=NO
CALENDAR_WRITE=NO
BILLING_ENABLED=NO
BILLING_ACCOUNT_ATTACHED=NO
VERTEX_API_ENABLED=NO
PRODUCTION_DEPLOYED=NO
PRODUCTION_RESTARTED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_PRODUCTION_DEPLOYMENT_REVIEW=<YES/NO>
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=<specific human boundary>
```

## H4 — Durable publication

Update:
- `docs/campaign-reports/08-GEMINI-35-LIVE.md`
- `docs/campaign-reports/CAMPAIGN-STATE.md`

Commit only intended repository files. Push the branch. Verify remote SHA. Post a concise PR #2 checkpoint comment with no secret/private material.

If diagnostics generate disposable scripts/images/worktrees, remove them when no longer needed unless a non-secret test harness genuinely belongs in the repository and has been reviewed.

---

# Hard stops

Stop immediately for any of the following:

- credential exposure or suspected exposure;
- a command/tool requiring the credential in argv, visible URL, Git, chat, logs, or build layers;
- quota response requiring billing/payment;
- billing attachment/enablement requirement;
- Vertex enablement requirement;
- private-data use required to reproduce;
- real Calendar write or bypass of physical confirmation;
- Outlook write capability/exposure;
- unresolved P0 or persistent P1;
- need for a major architecture redesign/sidecar/new provider to continue;
- destructive host/storage/package action;
- production deployment/restart/model/auth change;
- firmware flash;
- PR merge;
- provider-call budget exhaustion without a decisive PASS;
- unsafe or conflicting repository state.

# Overnight success definition

The strongest allowed overnight success is **technical readiness only**:

```text
GEMINI31_LIVE_EXACT_ADAPTER_PROBE=PASS
GLM53_FLASH_REVIEW=PASS
DETERMINISTIC_GATES=PASS
READY_FOR_PRODUCTION_DEPLOYMENT_REVIEW=YES
HUMAN_ACTION_REQUIRED=YES
```

Even on full success, stop before production. The next morning's operator decision must separately accept/reject the then-current Gemini free-tier data-use/privacy policy and explicitly authorize/reject production runtime use of the protected API key and Gemini 3.1 Flash Live.