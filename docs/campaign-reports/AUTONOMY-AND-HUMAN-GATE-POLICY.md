# Slate Campaign Autonomy and Human-Gate Policy

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Reduce unnecessary human interruptions while preserving explicit approval for actions with material external, irreversible, privacy, credential, cost, or production impact.

This policy is additive and takes precedence over older campaign text only where that older text requires returning to the human for routine recoverable work or zero-provider failure recovery. It does **not** expand any currently authorized real-provider call budget and does **not** authorize production deployment, firmware flashing, credential changes, private-data use, destructive work, OAuth consent, or PR merge.

## Default autonomous behavior

Codex should continue without returning to the human for ordinary recoverable work, including:

- live reconciliation of PR/report/state/directives;
- deterministic tests, lint, typecheck, builds, ARM64 builds and provider-disabled E2E;
- Docker/container inspection and cleanup of disposable test containers;
- read-only production health inspection;
- safe credential metadata checks that do not reveal credential values;
- report/state updates, secret-safe checks, commits, pushes, fetch/remote verification and PR checkpoint comments;
- exact reviewer retries on the authorized reviewer route;
- bounded source, harness, observability, timeout, test and documentation corrections justified by deterministic evidence;
- source/image/SDK lineage reconciliation;
- official-documentation refreshes;
- sanitized failure reconstruction;
- zero-provider forensic campaigns following a failed or ambiguous provider attempt;
- continuation through already-authorized non-production stages.

Do not create human gates for these actions merely because a stage completed, a test failed, a container exited, a reviewer timed out once, documentation drift was found, or a provider attempt failed and additional zero-provider work remains available.

## Provider-failure recovery

A failed, timed-out or ambiguous real-provider attempt is **not by itself a human boundary**.

After the authorized provider budget is consumed, Codex must automatically perform all safe zero-provider work that can improve the diagnosis or next candidate, including:

1. preserve exact sanitized call accounting and evidence;
2. reconstruct the event/timeout timeline;
3. inspect current source, harness, SDK and image lineage;
4. perform provider-disabled reproductions and wire/protocol tests;
5. make bounded feature-branch corrections when deterministic evidence justifies them;
6. run full deterministic regression and ARM64/provider-disabled validation as relevant;
7. run the exact required independent reviewer route for tracked runtime/product changes;
8. publish/commit/push/fetch/verify all durable evidence;
9. continue until either:
   - the issue is closed without another provider session; or
   - a new real-provider session is genuinely required.

Only at the second case should Codex return for a new provider-budget decision.

For the currently authorized G17 campaign, the existing `PROVIDER_CALLS_AUTHORIZED=1` remains exactly one. This policy does **not** authorize a second G17 provider session. It supersedes only the requirement in the G17 failure path to stop before performing safe zero-provider forensic/correction work.

## Provider authorization model going forward

Prefer one bounded campaign-level provider budget rather than repeated one-call human gates when the human explicitly authorizes such a pool.

A provider budget must still be explicit about:

- maximum number of real provider sessions;
- model/API/auth path;
- synthetic versus private input authorization;
- Search/tool/microphone/audio-retention permissions;
- production versus disposable validation scope;
- stop conditions.

Within an explicitly authorized pool, Codex may consume calls autonomously according to the directive and must stop when the pool is exhausted. Historical budgets remain immutable and cannot be reused.

## Human-only gates that remain

Return to the human only when one of these actions is actually required and not already explicitly authorized:

1. **Additional real-provider budget** beyond the currently authorized pool.
2. **Production deployment or restart**, including loading or mutating production environment material.
3. **Production/private-data policy decision**, including sending NOTE4, Outlook, Calendar, microphone or other private user data to an external model/provider when not already explicitly authorized.
4. **Billing/tier/Vertex/provider-account changes** that can alter cost or service policy.
5. **Credential creation, replacement, recovery, exposure or relocation** beyond already-approved metadata-only/read-only use.
6. **Firmware flashing or other physical-device writes**.
7. **OAuth login/consent or other interactive identity approval**.
8. **Destructive host/storage/database operations** not clearly confined to disposable test state.
9. **PR merge or equivalent integration action** when the standing instruction requires the PR to remain open/draft/unmerged.
10. Any genuinely new security/privacy boundary not covered by an existing explicit authorization.

Do not elevate ordinary implementation uncertainty, test failures, reviewer retries, Docker issues, report publication, feature-branch commits, or zero-provider recovery into a human gate.

## Current PR #2 application

PR #2 remains open/draft/unmerged.

The current G17 authorization remains:

```text
CAMPAIGN=8D1K_G17
PROVIDER_CALLS_AUTHORIZED=1
MODEL=gemini-3.1-flash-live-preview
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
SDK_VERSION=2.20.0
SYNTHETIC_INPUT_ONLY=YES
SEARCH_ENABLED=NO
PRIVATE_DATA_AUTHORIZED=NO
MICROPHONE_AUTHORIZED=NO
PRODUCTION_MUTATION_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

If G17 passes, continue automatically through 8D1L as already directed.

If G17 fails, do not retry the provider call, but do **not** immediately return solely because of the failure. Continue autonomously with the zero-provider forensic/correction sequence above, publish all evidence, and return only when another provider session or another human-only action listed in this policy is truly required.

## Reporting

`docs/campaign-reports/REPORT-PUSH-INVARIANT.md` remains binding. Reporting is an automatic execution requirement, not a human approval gate.

At meaningful checkpoints Codex must update, commit, push, fetch/verify, and record the exact remote SHA before continuing or returning at a legitimate human boundary.
