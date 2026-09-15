# Slate portfolio authority sequencing — Campaigns 8, 7, then optional 9

## Purpose

The portfolio long-run controller has exhausted currently safe READY and READONLY_READY work across Campaigns 7, 8, and 9. This directive narrows the next human decisions so the controller does not request or consume multiple unrelated authority gates at once.

This is a sequencing directive only. It does **not** grant production deployment, restart, provider-call, physical-device, firmware-flash, credential, OAuth, billing, private-data, merge, or release authority.

Preserve:

- `docs/campaign-reports/PORTFOLIO-LONGRUN-CONTROLLER-C7-C8-C9.md`
- `docs/campaign-reports/AUTONOMY-AND-HUMAN-GATE-POLICY.md`
- `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`
- all campaign-specific directives and reports.

All PRs #1, #2, and #3 must remain OPEN / DRAFT / UNMERGED unless the operator explicitly authorizes otherwise.

## Current portfolio conclusion

The portfolio checkpoint reports:

```text
PORTFOLIO_READY_NODE_COUNT=0
PORTFOLIO_READONLY_READY_NODE_COUNT=0
PORTFOLIO_WAITING_DEVICE_COUNT=1
PORTFOLIO_WAITING_HUMAN_COUNT=3
PORTFOLIO_EXTERNALLY_BLOCKED_COUNT=0
```

The three human boundaries are not equal in priority or necessity.

Use this order:

```text
FIRST=C8_EXACT_REVIEWED_BACKEND_RESTORE_AND_ONE_BOUNDED_PROVIDER_QUALIFICATION
SECOND=C7_COMBINED_RELEASE_CANDIDATE_RECONCILIATION_THEN_DEPLOYMENT_AND_PHYSICAL_ACCEPTANCE
THIRD=C9_OPTIONAL_RUNTIME_AUTH_ARCHITECTURE_DECISION
```

Do not ask the operator to authorize all three simultaneously.

## Stage 1 — Campaign 8 first

Campaign 8 remains the active product-critical path.

The current reviewed restore candidate is expected to be:

```text
C8_REVIEWED_RESTORE_SOURCE=f0dfdad0b4065e48ff8bc82aa505706d40fd9f4c
C8_REVIEWED_RESTORE_ARM64_IMAGE=sha256:b271eb8bfcb7a4d04d602d3974ceeb83c928e72721c67fda19c1c2e822a646d5
C8_REVIEW_STATUS=GROK_4_6_PASS_P0_0_P1_0_P2_0_SECURITY_0
```

The candidate removes the undocumented Gemini 2.5 `inputAudioTranscription.languageCodes` setup field that was the only material provider-facing setup difference associated with the `FAIL_SESSION_SETUP` regression, while preserving the new input-latency instrumentation.

Before requesting authority, reconcile the exact live C8 head and ensure the candidate identity and review status remain unchanged.

The **minimum first human request** is only:

1. deploy/restart the Slate backend exactly as required for the reviewed C8 restore candidate;
2. preserve the existing approved Gemini model/provider/auth/credential path and read-only secret mount;
3. consume at most one bounded synthetic/non-sensitive provider qualification session;
4. no firmware flash, NOTE4 reset, re-pair, Wi-Fi change, billing change, credential change, OAuth action, private-data expansion, Calendar/Outlook expansion, merge, or release.

After explicit authority is granted, continue Campaign 8 autonomously through deployment identity verification, health/config qualification, the one provider session, deterministic terminal classification, all zero-provider diagnosis if that session fails or is ambiguous, review loops for any subsequent source changes, observer rearm, and durable reporting.

Do not request physical NOTE4 testing until it is genuinely the sole remaining useful C8 node.

If the provider session establishes successfully, use the new structural timing markers to classify the input path and distinguish provider/session latency from transcript flush/UI latency. Do not infer Japanese/Chinese ASR improvement merely from successful session establishment.

If the provider session fails, the attempt is consumed. Do not retry without a new exact authority boundary.

## Stage 2 — Campaign 7 only after C8 reaches a stable accepted runtime boundary

Campaign 7 software has been revalidated and its external endpoints/source assumptions remain current, but it must not be deployed in a way that replaces or omits accepted C8 runtime changes.

The C7 reconciliation currently reports no direct runtime-file overlap with C8 and no source change requiring a new historical C7 review. That does **not** by itself prove that deploying a historical C7 branch image over the current C8-era production image preserves all accepted C8 bytes.

Therefore, before asking for C7 deployment authority, create a **combined release-candidate reconciliation stage** after C8 reaches a stable accepted source/runtime boundary.

Required Stage-2 preparation:

1. reconcile the exact final/stable C8 source that is intended to remain in production;
2. reconcile the exact current C7 source;
3. construct the smallest combined candidate containing both accepted C8 runtime changes and C7 calendar/weather/news changes;
4. record provenance for every shared backend/shared/frontend file;
5. prove no reviewed C8 voice/runtime behavior is lost;
6. prove no C7 feature is silently dropped;
7. rerun all impacted C8 voice/backend tests and all impacted C7 backend/shared/frontend/renderer/timezone tests;
8. rerun privacy/secret scan and `git diff --check`;
9. freeze the exact combined backend/frontend artifact identities;
10. obtain a fresh independent review of the **combined bytes** if the combined candidate differs from the previously reviewed branch artifacts.

Do not deploy C7's historical standalone image merely because C7 itself was reviewed and revalidated.

Only after the combined candidate is qualified should the controller request a second human boundary for:

- exact combined production deployment/restart; and
- the bounded C7 NOTE4 physical acceptance checklist.

Keep firmware untouched unless an independently justified firmware change is introduced; this directive grants no firmware authority.

## Stage 3 — Campaign 9 is optional, not required for C8/C7 completion

Campaign 9's current reconciliation says:

```text
C9_PRODUCT_CODE_CHANGED=NO
C9_REBASE_STATUS=DEFERRED_C8_NOT_YET_STABLE_AND_SHARED_ASSISTANT_CONFIG_PATHS_OVERLAP
C9_DEVELOPER_OAUTH=RESEARCH_ONLY
C9_DEVELOPER_AUTH_KEY=FORBIDDEN_WITHOUT_EXPLICIT_AUTHORIZATION
C9_TRANSCRIBE_LIVE_SPLIT=RESEARCH_ONLY_DO_NOT_IMPLEMENT
C9_RUNTIME_FACTORY_CHANGE=NOT_JUSTIFIED
C9_PROVIDER_CALLS=0
```

Therefore Campaign 9 should remain parked unless the operator explicitly chooses to pursue a new runtime/auth architecture experiment.

Do not treat C9 as a blocker for completing or accepting C8/C7.

If the operator does **not** request OAuth/billing/provider architecture work, the valid disposition is:

```text
C9_DISPOSITION=RETAIN_CURRENT_ACCEPTED_C8_RUNTIME_AND_KEEP_C9_RESEARCH_ONLY
```

If the operator later requests C9 exploration, first reconcile it against the then-stable C8/C7 combined source and present the smallest human decision package. Do not begin OAuth consent, billing, new credential creation, provider/model/auth changes, or live provider probes without explicit authority.

## Portfolio scheduler after this directive

At each controller loop:

1. reconcile PR #1/#2/#3 live heads and states;
2. reconcile this sequencing directive and the portfolio controller;
3. prioritize C8 until it is stable or human-blocked;
4. once C8 is stable, automatically perform all safe C7 combined-candidate reconciliation and qualification before requesting C7 deployment/physical authority;
5. treat C9 as parked unless explicitly selected by the operator;
6. after every meaningful stage, push durable evidence and continue while any READY/READONLY_READY node exists;
7. do not return merely because one stage checkpoint or reviewer PASS occurred.

## Authority provenance

Every future authority-consuming action must record a concrete operator authorization statement or durable authorization record. A branch SHA or ordinary documentation commit is not itself proof of human authority.

Before consuming an authority gate record:

```text
AUTHORITY_TYPE=
AUTHORITY_OPERATOR_STATEMENT_AVAILABLE=YES
AUTHORITY_SCOPE=
AUTHORIZED_ARTIFACT_OR_RUNTIME_IDENTITY=
AUTHORIZED_PROVIDER_SESSION_COUNT=
AUTHORIZED_PHYSICAL_ACTION_COUNT=
AUTHORIZED_FIRMWARE_ACTION=
AUTHORIZATION_CONSUMED=NO|YES
```

## Next operator-facing request

The controller should request only the **Campaign 8 minimum exact authority** first.

Do not bundle C7 deployment/physical acceptance or C9 OAuth/billing/provider architecture authority into that request.

After C8 is resolved, continue automatically into safe C7 combined-candidate work before requesting the next human action.

## Exit schema

Before returning to the operator, publish:

```text
PORTFOLIO_CURRENT_PRIORITY=
C8_HEAD=
C8_STAGE=
C8_NEXT_HUMAN_AUTHORITY=
C8_READY=
C8_READONLY_READY=
C7_HEAD=
C7_STAGE=
C7_COMBINED_RECONCILIATION_STATUS=
C7_NEXT_HUMAN_AUTHORITY=
C7_READY=
C7_READONLY_READY=
C9_HEAD=
C9_STAGE=
C9_DISPOSITION=
C9_NEXT_HUMAN_AUTHORITY=
PORTFOLIO_READY_NODE_COUNT=
PORTFOLIO_READONLY_READY_NODE_COUNT=
PORTFOLIO_WAITING_HUMAN_COUNT=
PORTFOLIO_HUMAN_ACTION_REQUIRED=
PORTFOLIO_HUMAN_ACTION_REASON=
PORTFOLIO_TERMINAL_REASON=
PORTFOLIO_NEXT_ACTION=
```

Do not exit with portfolio READY or READONLY_READY work remaining unless blocked by a higher-order safety/authority conflict.
