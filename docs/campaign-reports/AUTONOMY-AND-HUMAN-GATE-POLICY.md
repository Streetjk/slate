# Slate Campaign Autonomy and Human-Gate Policy

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Reduce unnecessary human interruptions while preserving explicit approval for actions with material external, irreversible, privacy, credential, cost, hardware, or release impact.

The default operating mode is now:

```text
LONGRUN_DEFAULT=YES
CHECKPOINT_PUSH_IS_NOT_A_STOP=YES
INTERMEDIATE_STAGE_SUCCESS_IS_NOT_A_STOP=YES
BUNDLE_PREAUTHORIZED_REVERSIBLE_ACTIONS=YES
CONTINUE_AFTER_REPORT_PUSH=YES
CONTINUE_AFTER_REVIEW_PASS=YES
CONTINUE_AFTER_BOUNDED_REPAIR=YES
CONTINUE_AFTER_RECOVERABLE_INFRA_FIX=YES
REPORT_PUSH_INVARIANT=REQUIRED
```

This policy takes precedence over older campaign text only where older text unnecessarily requires returning to the human between actions that are already inside the same explicit bounded authorization. It does **not** create a provider budget, authorize production activity, authorize private-data use, authorize firmware flashing, authorize credential changes, or authorize PR merge by itself.

## Core rule — a checkpoint is not a handoff

Publishing evidence and returning control are separate actions.

`REPORT-PUSH-INVARIANT.md` remains binding, but a report/state update, commit, push, remote verification, or PR checkpoint comment is **not** a reason to stop when more work remains inside the current authorization.

Codex/Luna must continue automatically after a successful checkpoint unless the next action crosses a true human-only boundary that was not already explicitly included in the active campaign authorization.

Do not stop merely because:

- a stage completed successfully;
- a report was pushed;
- the branch head changed only because of authorized report/test/product work;
- deterministic gates passed;
- an independent review passed;
- an independent review needs a bounded retry on the same required route;
- a bounded correction was made and needs requalification;
- a disposable container/build/SSH step failed recoverably;
- ARM64/provider-disabled requalification is required;
- a real-provider attempt failed but useful zero-provider diagnosis remains;
- the next stage is already explicitly and conditionally authorized by the same long-run activation.

## Default autonomous behavior

Within the active scope, continue without returning to the human for ordinary recoverable work, including:

- live reconciliation of PR/report/state/directives;
- deterministic tests, lint, typecheck, format, frontend build and backend/shared regression;
- Docker/container inspection, rebuilds and cleanup of disposable test state;
- ARM64 builds and provider-disabled E2E/replay;
- read-only production health inspection;
- safe credential metadata/mount checks that do not reveal credential values;
- report/state updates, secret-safe checks, commits, pushes, fetch/remote verification and PR checkpoint comments;
- exact reviewer retries on the authorized reviewer route;
- bounded source, harness, observability, timeout, test and documentation corrections justified by deterministic evidence;
- re-test/re-review loops after accepted findings;
- source/image/SDK lineage reconciliation;
- official-documentation refreshes;
- sanitized failure reconstruction;
- zero-provider forensic campaigns after failed or ambiguous provider attempts;
- continuation through every already-authorized conditional stage.

Codex must exhaust safe deterministic recovery before returning control.

## Long-run authorization bundling

A single explicit human activation may authorize an entire declared chain of bounded actions, including conditional production actions, provided all of the following are written into the durable directive/checkpoint before execution:

- exact source/image identity where relevant;
- provider model/auth path;
- maximum provider-session pool;
- synthetic/private-data permissions;
- production deploy/restart permissions;
- rollback conditions;
- retry ceiling;
- credential handling constraints;
- Search/tool/microphone/audio-retention permissions;
- stop conditions.

Once such a chain is explicitly activated, Codex must **not** return between its internal stages merely to request the same permission again.

Example pattern:

```text
D1_NONPROD_PROVIDER_SESSION
    -> if PASS
D2_EXACT_CANDIDATE_PRODUCTION_DEPLOY_AND_SYNTHETIC_SESSION
    -> automatic rollback on any failed production gate
D3_DURABLE_DOSSIER_AND_REQUALIFICATION
    -> final human boundary only if another genuinely new authority is required
```

If D1 and conditional D2 were both explicitly included in the same human activation, a D1 PASS is not another human gate. Continue directly into D2 after its required checkpoint publication and exact identity verification.

Provider-session ceilings remain hard limits. No autonomous retry may exceed the declared pool.

## Source/artifact identity rule

An authorization tied to an exact product/runtime source SHA or image remains valid only while that identity and its relevant semantics remain unchanged.

If bounded repair changes product/runtime source or produces a new deployment artifact:

1. continue all deterministic testing, ARM64 qualification, reviewer work and report publication autonomously;
2. do not consume provider/deployment authority that was pinned to the old artifact;
3. stop only when the new artifact is fully qualified and a new human provider/deployment authorization is actually required.

Documentation/report-only commits do not invalidate a product/runtime source pin.

## Provider-failure recovery

A failed, timed-out or ambiguous real-provider attempt is **not by itself a human boundary**.

After an authorized provider attempt, Codex must automatically perform all safe zero-provider work that can improve the diagnosis or next candidate, including:

1. preserve exact sanitized call accounting and evidence;
2. reconstruct the event/timeout timeline;
3. inspect current source, harness, SDK and image lineage;
4. perform provider-disabled reproductions and wire/protocol tests;
5. make bounded feature-branch corrections when deterministic evidence justifies them;
6. run full deterministic regression and ARM64/provider-disabled validation as relevant;
7. run the exact required independent reviewer route for tracked runtime/product changes;
8. publish/commit/push/fetch/verify all durable evidence;
9. continue until either the issue is closed without another provider session or a new provider session is genuinely required.

Only the second case creates a provider-budget human gate, unless a remaining call is already available inside the active campaign pool.

## Human-only gates that remain

Return to the human only when an action is actually required **and is not already explicitly included in the active bounded authorization**:

1. Additional real-provider budget beyond the active declared pool.
2. Production deployment/restart/recreate/config mutation not already included in the active activation.
3. New production/private-data scope, including NOTE4, Outlook, Calendar, microphone or other private data sent to an external provider.
4. Billing/tier/Vertex/provider-account changes that can alter cost or service policy.
5. Credential creation, replacement, migration, interactive recovery, exposure or relocation beyond already-approved read-only use.
6. Firmware flashing or another physical-device write not already explicitly authorized.
7. OAuth login/consent or another interactive identity approval.
8. Destructive host/storage/database operations outside clearly disposable test state.
9. A source/artifact change that invalidates an exact provider/deployment authorization pin.
10. An unresolved P0/P1, credible security/privacy contradiction, or unsafe migration/data-integrity condition that cannot be resolved mechanically inside scope.
11. Campaign scope expansion or a genuinely new product/data-policy decision.
12. PR merge, release, publish, repository-visibility change or equivalent final integration action.

Do not elevate ordinary implementation uncertainty, test failures, reviewer retries, Docker/SSH issues, report publication, feature-branch commits, successful intermediate stages, or zero-provider recovery into human gates.

## Current PR #2 application

PR #2 must remain open/draft/unmerged unless separately authorized.

Historical provider accounting remains immutable:

```text
8D1K_HISTORICAL_PROVIDER_CALLS=3_OF_3
8D1K_F_PROVIDER_CALLS=1_OF_1
8D1M_B_PROVIDER_SESSIONS=5_OF_5
8D1M_C_PROVIDER_CALLS=0
```

Current 8D1M-D state is:

```text
CAMPAIGN=8D1M_D
D0_STATUS=PASS
DIRECTIVE_STATE=PROPOSED_NOT_AUTHORIZED
PROVIDER_CALLS_AUTHORIZED=0
PRODUCTION_DEPLOYMENT_AUTHORIZED=NO
PRODUCTION_RESTART_AUTHORIZED=NO
PHYSICAL_NOTE4_TEST_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
ARM64_IMAGE=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
```

This policy update does **not** activate D1 or D2.

If a future human activation explicitly authorizes both D1 and conditional D2 under the existing 8D1M-D design, the preferred long-run execution is:

```text
D1_PROVIDER_SESSION_MAX=1
D2_PROVIDER_SESSION_MAX=1
D1_PLUS_D2_PROVIDER_POOL_MAX=2
NO_RETRY_IF_D1_FAILS=YES
NO_RETRY_AFTER_D2=YES
AUTO_ROLLBACK_ON_D2_FAILURE=YES
STOP_BETWEEN_D1_AND_D2=NO_IF_D2_WAS_PREAUTHORIZED
```

After activation, execute D1 -> conditional D2 -> D3 autonomously. Publish every required checkpoint, but do not return merely because D1 passed, deployment is next, or a report was pushed.

Physical NOTE4 EN/JP/reconnect testing, firmware flashing, private-data expansion and PR merge remain separate gates unless a later explicit human authorization specifically bundles them.

## Reporting

`docs/campaign-reports/REPORT-PUSH-INVARIANT.md` remains binding.

At meaningful checkpoints Codex must update, commit, push, fetch/verify and record the exact remote SHA. Then continue automatically whenever the next action is already inside the active authorization.

The policy goal is simple:

```text
PUSH_OFTEN=YES
STOP_RARELY=YES
STOP_ONLY_FOR_TRUE_NEW_AUTHORITY=YES
```
