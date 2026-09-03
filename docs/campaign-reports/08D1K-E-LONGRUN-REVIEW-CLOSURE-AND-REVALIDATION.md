# Campaign 8D1K-E — Long-run review closure and deterministic revalidation

Date: 2026-09-03 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## 1. Purpose

This campaign resumes exactly from the Campaign 8D1K-D hard stop. Do not rerun the already-completed differential diagnosis unless fresh evidence invalidates it.

The accepted starting checkpoint is the branch state at:

- current implementation/report head before this directive: `f8b36272b71c520d918940ee7cfd8e11594d44fc`;
- long-run differential directive base: `82e8c6737ceecbf56fac0f91469b4e0782f16002`;
- previously reviewed Node-bridge implementation lineage: `90ab7cbbff39dfb4dda79cf1260611e5f26cf941`;
- previous 8D1K provider-call budget: exhausted at `3_OF_3` and must not be reset by this campaign.

Campaign 8D1K-D established the following deterministic evidence:

1. the exact Node Live provider path previously passed a real Gemini 3.1 Live model event and turn completion;
2. the full Slate adapter later failed before a model event, but the historical disposable Call 3 invocation could not be recovered sufficiently to prove its exact `NODE_ENV` override;
3. the final Slate image defaults to `NODE_ENV=production`;
4. `GeminiConfig` intentionally refuses the evaluation-only Developer API `node_bridge` when `NODE_ENV=production`;
5. architecture-matched ARM64 provider-disabled testing proved the production guard fails closed before child spawn;
6. explicit non-production/test-mode architecture-matched testing proved the Bun parent can spawn Node 22, exchange JSONL over private stdio, receive ready/server events, and close cleanly;
7. protocol rejection, crash, timeout, missing executable, missing script, provider error, unexpected close, and unsafe credential-reference behavior were exercised deterministically with sanitized outcomes;
8. a secondary real security defect was identified: the Bun-side Developer API bridge accepted API-key file references outside the intended private runtime secret roots before reaching the child boundary;
9. commit `f8b36272b71c520d918940ee7cfd8e11594d44fc` adds the bounded correction so Developer API key references must be under `/run/secrets/` or `/var/run/secrets/`, plus differential integration/regression coverage;
10. all deterministic gates run before the review hard stop passed;
11. no new Gemini provider call occurred during 8D1K-D;
12. the exact GLM-5.3-Flash review did not run because the configured `zai-glm53-reviewer` route lacked `ZAI_API_KEY` after the host restart.

The objective of 8D1K-E is to close that blocked independent-review gate, adjudicate any findings, complete exact final deterministic proof, publish a precise root-cause/correction dossier, and stop at a human decision about whether to authorize a **new and separate** bounded provider-revalidation campaign.

This campaign authorizes **zero new Gemini provider calls**.

## 2. Routing

Use exactly:

- controller / stage authority: Luna;
- bounded implementation/correction worker: Sonnet 4.6;
- independent reviewer: GLM-5.3-Flash through the configured `zai-glm53-reviewer` route, high effort, read-only;
- repository integrator, deterministic validator, checkpoint publisher and sole repository writer: Codex.

No silent model or provider substitution is allowed.

Do not substitute:

- GLM-5.2;
- Grok;
- Gemini;
- Claude;
- AGY;
- another ZAI model;
- another reviewer profile.

If the exact GLM-5.3-Flash route is unavailable, stop at the reviewer-auth boundary after completing only role-independent read-only reconciliation work.

## 3. Credential rule for the reviewer

The missing reviewer authentication is a human/environment boundary, not a reason to inspect or expose secrets.

Codex may:

- test whether the existing `zai-glm53-reviewer` route is operational;
- use the existing configured reviewer wrapper/profile normally;
- record only non-secret metadata such as profile name, model name, provider name, exit class and whether authentication is available.

Codex must not:

- print `ZAI_API_KEY`;
- dump the full environment;
- search broadly through the home directory for API-key material;
- copy a credential into the repository;
- commit a credential;
- place a credential in argv, logs, reports, screenshots or build layers;
- ask the user to paste the secret into chat or GitHub.

If the route still reports missing authentication, publish:

```text
CAMPAIGN=8D1K_E
STATUS=HARD_STOP_GLM53_REVIEW_AUTH_REQUIRED
GLM53_REVIEW=BLOCKED
GLM53_PROFILE=zai-glm53-reviewer
GLM53_MODEL=glm-5.3-flash
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_RESTORE_EXISTING_ZAI_REVIEW_AUTH_IN_LOCAL_SECURE_ENVIRONMENT_AND_RESUME_8D1K_E
```

Then stop. Do not make product changes merely because the reviewer is unavailable.

## 4. Provider-call accounting

The previous 8D1K real-provider budget is historical and exhausted:

```text
8D1K_PROVIDER_CALLS_USED=3_OF_3
8D1K_REMAINING_PROVIDER_CALLS=0
```

For 8D1K-E:

```text
PROVIDER_CALLS_AUTHORIZED=0
```

Do not:

- retry Call 2;
- retry Call 3;
- make a new minimal Node control call;
- make a new full-adapter call;
- make a tool-registry call;
- perform Gemini model metadata probes that count as provider/API usage merely to gain confidence.

A new provider validation, if later approved, must be a separately authorized campaign with a new explicit budget.

## 5. Non-negotiable security and scope invariants

Preserve all of the following:

- production Developer API / `node_bridge` remains fail-closed while `NODE_ENV=production`;
- do not weaken or remove the production guard merely to make evaluation pass;
- the backend remains model authority;
- NOTE4 never stores Gemini/Google credentials and never calls Gemini directly;
- API-key material remains runtime-only and backend-only;
- API-key file references must remain restricted to trusted private runtime secret roots;
- do not read or print the protected Gemini key during deterministic work;
- Outlook remains read-only and isolated from Gemini;
- Google Calendar remains proposal-only until physical NOTE4 confirmation;
- no direct Calendar write is exposed to the model/bridge;
- Search must not execute during deterministic mock/provider-disabled testing;
- no private NOTE4, Outlook or Calendar payload enters evaluation fixtures;
- billing remains off/unattached;
- Vertex remains disabled unless separately authorized in another campaign;
- no production deployment or restart;
- no production `.env` change;
- no firmware flash;
- no PR #2 merge;
- no Campaign 6D work;
- no PR #1 or PR #3 expansion;
- no Airtable, Immich, storage or unrelated host cleanup work.

## 6. E0 — Fresh reconciliation

Before review or edits:

1. `git fetch origin --prune`;
2. verify PR #2 is open, draft and unmerged;
3. verify the current remote head;
4. verify local branch relationship to remote;
5. read, in full or the relevant latest sections:
   - `AGENTS.md`;
   - `docs/campaign-reports/CAMPAIGN-INSTRUCTIONS.md`;
   - `docs/campaign-reports/CAMPAIGN-STATE.md`;
   - `docs/campaign-reports/08-GEMINI-35-LIVE.md`;
   - `docs/campaign-reports/08D1K-D-LONGRUN-SLATE-ADAPTER-DIFFERENTIAL-RECOVERY.md`;
   - this directive;
6. verify the exact correction lineage from `82e8c6737ceecbf56fac0f91469b4e0782f16002` to the current product head;
7. verify no unrelated user change is being overwritten;
8. perform read-only production health checks only if the existing safe path is available; no restart or mutation;
9. confirm prior provider-call accounting remains `3_OF_3`.

The expected bounded change from `82e8c673...` to `f8b36272...` is limited to:

- `backend/src/modules/assistant/gemini-live-adapter.integration.test.ts`;
- `backend/src/modules/assistant/gemini-live-node-bridge.test.ts`;
- `backend/src/modules/assistant/gemini-live-node-bridge.ts`;
- campaign documentation/state.

If the live branch has advanced, inspect and reconcile the exact newer remote state rather than resetting backwards.

## 7. E1 — Reviewer-route preflight

Run the smallest safe authentication/model preflight for the existing `zai-glm53-reviewer` route.

Required observed metadata:

```text
REVIEW_PROVIDER=ZAI
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_MODEL=glm-5.3-flash
REVIEW_MODE=READ_ONLY
REVIEW_AUTH_AVAILABLE=<YES|NO>
```

Do not send product source to the reviewer until the route is confirmed to be the exact model/profile required.

If auth is unavailable, stop as defined in Section 3.

If auth is available, continue automatically to E2.

## 8. E2 — Exact independent GLM-5.3-Flash review

Review the **exact current corrected artifact**, not the old `90ab7cb` artifact.

The reviewer must receive enough exact source/diff context to assess the correction and its tests. At minimum review:

- the exact product diff from `82e8c6737ceecbf56fac0f91469b4e0782f16002` to the current correction head;
- `backend/src/modules/assistant/gemini-live-node-bridge.ts`;
- `backend/src/modules/assistant/gemini-live-node-bridge.test.ts`;
- `backend/src/modules/assistant/gemini-live-adapter.integration.test.ts`;
- relevant existing `gemini.config.ts` and `gemini-live.service.ts` context where required to understand the guard and call boundary;
- sanitized deterministic test evidence;
- the explicit statement that historical Call 3 `NODE_ENV` is UNKNOWN and must not be retroactively invented.

The reviewer must focus on:

1. whether restricting Developer API key references to `/run/secrets/` and `/var/run/secrets/` is correct and sufficient;
2. path-normalization / prefix-bypass possibilities;
3. symlink and check/use behavior;
4. whether parent-side validation and child-side `O_NOFOLLOW` checks form a coherent defense-in-depth boundary;
5. whether the new test uses a realistic architecture-matched path;
6. whether the test accidentally creates false confidence because some local tests skip when `/run/secrets/slate-test` is absent;
7. whether the production `NODE_ENV=production` guard remains fail-closed;
8. whether any correction accidentally authorizes Developer API production use;
9. whether any raw credential/provider detail can leak through logs or exceptions;
10. whether Bun parent → Node child lifecycle, stdio, protocol, close, crash and timeout behavior remain safe;
11. whether Outlook isolation and Calendar proposal-only semantics remain unaffected;
12. whether the root-cause wording distinguishes proven deterministic behavior from unresolved historical attribution;
13. whether there are any P0/P1/P2/P3 findings.

Reviewer output must be read-only and include:

```text
REVIEW_TARGET_SHA=<exact sha>
VERDICT=<PASS|REVISE|BLOCK>
P0=<count>
P1=<count>
P2=<count>
P3=<count>
```

No repository writes by the reviewer.

## 9. E3 — Luna adjudication

Luna must adjudicate every reviewer finding individually.

For each finding record:

- reviewer severity;
- accepted/rejected/deferred;
- evidence;
- security/runtime impact;
- correction required yes/no;
- tests required;
- whether a fresh exact review is required.

Rules:

- any credible P0: stop immediately;
- any credible P1: must be corrected before campaign success;
- credible P2: correct unless Luna can demonstrate it is out-of-scope/non-applicable with exact evidence;
- P3 may be deferred only with explicit non-blocking rationale;
- do not dismiss a finding simply because prior deterministic tests passed;
- do not change architecture merely to satisfy a speculative review comment;
- no reviewer finding authorizes a provider call.

## 10. E4 — Bounded correction loop

Run only if E3 identifies a valid source defect.

Use:

Luna selects the bounded hypothesis/correction scope → Sonnet 4.6 performs bounded implementation/correction analysis → Codex remains sole repository writer/integrator → deterministic tests → exact GLM review → Luna adjudication.

Maximum correction/re-review cycles for this stage: 3.

If three cycles leave a credible P1 unresolved, publish a hard stop rather than looping indefinitely.

Corrections must not:

- weaken the production guard;
- broaden trusted secret roots without strong evidence;
- make `/tmp`, repository paths, home-directory paths or arbitrary absolute paths valid API-key sources;
- copy secrets into a new path;
- introduce a public sidecar/listener;
- introduce another provider or architecture;
- change NOTE4 firmware;
- change Calendar confirmation semantics;
- expose Outlook data;
- change production configuration.

If no source correction is required after GLM review, do not churn the implementation.

## 11. E5 — Exact deterministic validation

Against the exact final source SHA after adjudication/correction, run the full deterministic gate.

Required minimum:

- targeted Gemini bridge/unit tests;
- `gemini-live-adapter.integration.test.ts` with the synthetic trusted-secret fixture actually enabled in an isolated deterministic environment;
- backend full test suite;
- shared test suite;
- lint;
- typecheck;
- format check;
- frontend production build;
- `git diff --check`;
- Node syntax checks for `.mjs` bridge runtime/session files;
- secret scan across changed implementation, test, build and report content;
- Dockerfile/build check;
- reproducible `linux/arm64` candidate image build;
- verify Node runtime version inside candidate;
- verify `@google/genai/node` loads inside candidate without a provider call;
- image history/layer inspection for credential material;
- verify no key/value is present in repository, build context, image env, image history or layer metadata.

Do not treat skipped architecture-specific tests as equivalent to a pass. Where local host constraints cause a skip, run the corresponding isolated ARM64/container test using a synthetic secret at a trusted path.

Expected success evidence should be expressed by result, not hard-coded test count. If test counts change due to valid new tests, record the actual counts.

## 12. E6 — Architecture-matched provider-disabled full adapter proof

Build/use the exact final ARM64 candidate and run provider-disabled deterministic E2E tests that exercise the real boundaries without any Gemini network call.

### Positive evaluation-mode shape

Use:

- explicit non-production `NODE_ENV` (`test` or a dedicated non-production evaluation value already allowed by schema; do not invent a new production mode casually);
- `GEMINI_AUTH_MODE=developer_api_key`;
- `GEMINI_DEVELOPER_API_KEY_ENABLED=true`;
- `GEMINI_LIVE_RUNTIME=node_bridge`;
- exact candidate model configuration;
- actual Bun parent;
- actual Node executable from candidate;
- actual stdio bridge parent implementation;
- provider-disabled/mock Node child or deterministic shim;
- synthetic credential file mounted read-only under `/run/secrets/` or `/var/run/secrets/`;
- `--network none` where feasible for the mock proof;
- no real Gemini credential read.

Prove:

- `GeminiConfig.isConfigured()` succeeds only under allowed evaluation conditions;
- parent resolves executable/script correctly from the actual backend working directory;
- parent spawns Node child;
- JSONL open frame is accepted;
- ready event reaches parent;
- synthetic text passes parent → child;
- synthetic server event passes child → parent;
- turn-complete-shaped event is observable;
- clean close works;
- stale/lifecycle events remain bounded;
- no public listener exists.

### Production negative shape

Using the same candidate with `NODE_ENV=production`, prove:

- the Developer API Node bridge remains disabled;
- rejection happens before child spawn;
- no credential value is read;
- no provider/network call can occur;
- failure text remains sanitized.

### Credential-reference negative shapes

Prove at least:

- `/tmp/...` rejected before spawn;
- repository path rejected before spawn;
- relative path rejected;
- symlink behavior fails closed at the appropriate layer;
- overly permissive file mode fails at the appropriate validation layer;
- empty file fails;
- non-file fails;
- trusted-root synthetic regular mode-0600 file passes the parent reference boundary.

Do not use the real protected Gemini key for this section.

## 13. E7 — Root-cause and historical-attribution dossier

Publish precise language. Do not rewrite history.

The current accepted deterministic statement is:

```text
PROVEN_DIFFERENTIAL=production_guard_blocks_node_bridge_before_child_spawn_WHILE_explicit_nonproduction_mode_allows_full_Bun_parent_Node_child_mock_E2E
ORIGINAL_CALL3_NODE_ENV=UNKNOWN
ORIGINAL_CALL3_FAILURE_CAUSE=NOT_CONCLUSIVELY_ATTRIBUTABLE_TO_PRODUCTION_GUARD
SECONDARY_REAL_DEFECT=Developer_API_key_reference_root_not_enforced_at_Bun_parent_before_f8b36272
```

If new deterministic evidence changes any of those statements, document exactly why.

Do not state that historical Call 3 definitely failed because `NODE_ENV=production` unless direct durable evidence is recovered. The prior invocation was disposable and its exact override was not preserved.

The final dossier must separate:

- proven provider health from prior Node real-call PASS;
- proven deterministic full-adapter behavior;
- historical unknowns;
- the bounded credential-reference defect and fix;
- reviewer findings/adjudication;
- what still requires a future real-provider call.

## 14. E8 — Prepare, but do not execute, future provider revalidation

If and only if:

- exact GLM review passes with no unresolved P0/P1;
- valid P2s are resolved/adjudicated;
- full deterministic gates pass;
- ARM64 full-adapter provider-disabled proof passes;
- secret scan passes;
- production remains unchanged;

then prepare a proposed next campaign plan for human review.

Do not make the provider call.

The proposed future campaign should normally begin with **one** exact full Slate adapter Live session, because the Node minimal provider path has already passed independently multiple times historically.

Proposed future Call 1 shape:

- exact reviewed final source/image;
- explicit non-production evaluation mode, never `NODE_ENV=production`;
- exact `gemini-3.1-flash-live-preview`;
- protected real credential mounted read-only at the approved runtime secret path;
- synthetic text `Say exactly TEST.`;
- Search disabled;
- no tool invocation;
- no private NOTE4/Outlook/Calendar data;
- no microphone input;
- generated audio not retained;
- durable result capture independent of launcher lifetime;
- success requires model event + turn complete.

A second provider call must not be presumed necessary. It may be proposed only as an optional separately budgeted follow-up if the first exact adapter call passes and a specific additional capability needs live validation.

The provider-call plan is only a recommendation for a later human authorization.

## 15. E9 — Durable publication

After successful review/adjudication/revalidation:

1. update `docs/campaign-reports/08-GEMINI-35-LIVE.md` with the 8D1K-D/8D1K-E outcome;
2. update `docs/campaign-reports/CAMPAIGN-STATE.md`;
3. if needed, append a concise final checkpoint to the D/E directive rather than rewriting historical evidence;
4. run final `git diff --check` and secret scan after report edits;
5. selectively commit only authorized campaign/product changes;
6. push the feature branch;
7. verify the remote head exactly matches the pushed commit;
8. verify PR #2 remains open/draft/unmerged;
9. post a concise PR #2 checkpoint with exact final SHA, review result, tests, provider-call count, production state, and next human boundary.

Do not merge PR #2.

## 16. Successful final state

Preferred success state:

```text
CAMPAIGN=8D1K_E
STATUS=REVIEW_CLOSED_DETERMINISTICALLY_READY_FOR_HUMAN_PROVIDER_REVALIDATION_DECISION
FINAL_SOURCE_SHA=<exact final sha>
ROOT_CAUSE_CLASS=B_PARENT_CONFIG_GUARD_BEHAVIOR_AS_DESIGNED
ORIGINAL_CALL3_ENV_PROVEN=NO
HISTORICAL_CALL3_ATTRIBUTION=UNRESOLVED
SECONDARY_DEFECT=E_CREDENTIAL_REFERENCE_PERMISSION_DEFECT
SECONDARY_DEFECT_FIXED=YES
PRODUCTION_GUARD_PRESERVED=YES
EXACT_FULL_ADAPTER_PROVIDER_DISABLED_E2E=PASS
SAFE_ERROR_CLASSIFICATION=PASS
GLM53_REVIEW=PASS
GLM53_P0=0
GLM53_P1=0
GLM53_P2=<0_or_adjudicated>
FULL_TESTS=PASS
ARM64_BUILD=PASS
SECRET_SCAN=PASS
PROVIDER_CALLS_THIS_CAMPAIGN=0
8D1K_PRIOR_PROVIDER_CALLS_USED=3_OF_3
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_FINAL_CORRECTION_AND_AUTHORIZE_OR_REJECT_NEW_BOUNDED_EXACT_ADAPTER_PROVIDER_REVALIDATION
```

Do not mark `READY_FOR_8D1L=YES` until a future separately authorized exact real-provider full-adapter validation passes.

## 17. Alternate terminal states

### Reviewer auth still unavailable

```text
STATUS=HARD_STOP_GLM53_REVIEW_AUTH_REQUIRED
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=NO
```

### Reviewer finds unresolved P0/P1

```text
STATUS=HARD_STOP_INDEPENDENT_REVIEW_BLOCKING_FINDINGS
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=NO
```

### Deterministic final artifact fails

```text
STATUS=HARD_STOP_DETERMINISTIC_FINAL_ARTIFACT_FAILURE
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=NO
```

### Security/credential concern

```text
STATUS=HARD_STOP_CREDENTIAL_OR_SECRET_BOUNDARY
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=NO
```

## 18. Hard stops

Stop immediately for:

- credential value exposure or suspected exposure;
- reviewer route requiring secret disclosure through chat/Git/logs;
- unresolved credible P0;
- persistent credible P1 after bounded correction cycles;
- provider/network call required to continue this campaign;
- request to enable billing;
- request to enable Vertex;
- production deployment/restart/config mutation;
- firmware flash;
- PR merge;
- Calendar confirmation bypass;
- Outlook exposure to Gemini;
- broad architecture redesign/new sidecar/public listener/new provider;
- destructive host/storage/package operations;
- repo state conflict that cannot be safely reconciled.

## 19. Controller liveness

This is a long-run campaign.

After the exact GLM reviewer route is available, continue autonomously through E1 → E2 → E3 → E4 if needed → E5 → E6 → E7 → E8 → E9.

Do not return control merely because:

- the independent review finished;
- one reviewer finding was corrected;
- targeted tests passed;
- the ARM64 build completed;
- the mock E2E passed;
- the report was updated locally.

Continue automatically while the next action is authorized and no hard/human boundary has been reached.

The only intended normal human boundaries are:

1. restore the already-configured GLM-5.3-Flash reviewer authentication if it is still absent; and
2. after successful campaign completion, decide whether to authorize a new bounded exact-adapter real-provider validation.

No real Gemini provider call is authorized by this directive.
