# Campaign 8D1M-G — M2 C1 GLM-5.3-Flash reviewer substitution — PROPOSED

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
State: `PROPOSED_NOT_AUTHORIZED`

## Current accepted state

The frontier-driven continuation is complete. All currently authorized READY / READONLY_READY work has been exhausted. The sole mandatory blocker is exact independent review of the corrected containerd NVMe migration artifact.

```text
F6_STATUS=FRONTIER_EXHAUSTED
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=1
HUMAN_ACTION_REQUIRED=YES
TERMINAL_REASON=SOLE_C1_EXACT_INDEPENDENT_REVIEW_BLOCKED_AFTER_FRONTIER_EXHAUSTION
```

F1 deterministic analysis found a real bounded defect in V1: source metrics used `SRC_` labels and destination metrics used `DST_` labels immediately before byte-for-byte comparison, making equivalent trees fail. V1 remains preserved. V2 changes only the two metric-call labels to the common `TREE` label and has a new exact identity:

```text
C1_ARTIFACT=scripts/slate-m2-containerd-rootstep-v2-nvme-reversible.sh
C1_ARTIFACT_SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
C1_SCOPE=METRIC_LABEL_NORMALIZATION_ONLY
C1_SAFE_FOR_MANUAL_SUDO=NO
C1_REMOTE_INSTALL=NOT_PERFORMED
```

Production remains healthy and unchanged. F2-F5 read-only/offline preparation is complete or durably staged. No candidate import, containerd mutation, firmware flash, provider/private-microphone session, destructive cleanup, or PR merge has occurred.

## Why a reviewer substitution is now recommended

The required Grok 4.6 reviewer remained authenticated/available for smoke use but all authorized exact-artifact transport paths failed to produce a final verdict, including the final plain-stdin attempt. The Grok review node is therefore exhausted under the current transport policy.

The repository contains historical evidence that the `zai-glm53-reviewer` route using `glm-5.3-flash` has previously produced accepted independent exact-artifact review evidence for this campaign family. The latest frontier report also identifies it as the preferred human-approved substitution candidate. However, the current controller environment did not prove that the local executable/profile is presently available, so this proposal requires a fresh non-secret availability/authentication check before any substitute review is invoked.

For a root-level containerd migration, independent review is preferable to an explicit waiver when an existing independent route can be safely re-established.

## Proposed narrow authorization

If the human explicitly says `proceed`, authorize exactly one reviewer substitution scope:

```text
SUBSTITUTE_REVIEWER_PROFILE=zai-glm53-reviewer
SUBSTITUTE_PROVIDER=ZAI
SUBSTITUTE_MODEL=glm-5.3-flash
REVIEW_SCOPE=EXACT_READ_ONLY_C1_V2_ARTIFACT_ONLY
EXACT_ARTIFACT=scripts/slate-m2-containerd-rootstep-v2-nvme-reversible.sh
EXACT_SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
NEW_CREDENTIAL=NO
OPENROUTER=NO
PRODUCTION_MUTATION_DURING_REVIEW=NO
REVIEW_WAIVER=NO
REVIEWER_SUBSTITUTION_BEYOND_THIS_PROFILE=NO
```

This is not a general reviewer-routing change. Grok 4.6 remains the standing reviewer policy elsewhere unless a newer explicit instruction changes it. This authorization would apply only to the exact C1 V2 root-migration script above because the Grok transport path is exhausted.

## Activation procedure

After explicit human `proceed`, Codex must operate in `FRONTIER_DRIVEN_LONGRUN` mode:

1. `git fetch origin` and reconcile to the activation commit/head.
2. Re-read current campaign state, frontier report, this proposal, and the exact V2 artifact.
3. Re-prove exact V2 SHA-256 before reviewer setup.
4. Perform a non-secret availability/auth check for the existing `zai-glm53-reviewer` profile only. Do not print credential values and do not create/copy/replace a credential.
5. If the existing profile cannot be re-established without a new credential, provider, paid route, OpenRouter, or manual secret handling, stop at a genuine human boundary and publish the exact failure class. Do not fall back or waive review automatically.
6. If available, send the complete exact V2 artifact and narrow root-migration safety rubric for one independent read-only `glm-5.3-flash` review. Bind the verdict to exact SHA `09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd`.
7. Require a final whole-artifact verdict with P0/P1/P2/security findings. Model opinion never outranks deterministic proof/runtime evidence.
8. If PASS with no unresolved P0/P1/P2/security finding, continue automatically to the existing C2 success path: install only that exact reviewed V2 script under `/home/pi/`, verify remote SHA/type/mode/bash-n, arm sanitized observer, push/fetch-verify checkpoint, then give the operator exactly one `ssh -t ... sudo ...` command.
9. If REVISE with bounded findings, use Gemini 3.8 Flash as bounded writer where useful, Codex validates/integrates, assign a new exact SHA, perform deterministic tests, and re-review the corrected artifact with the same explicitly authorized `zai-glm53-reviewer` profile. This bounded repair/re-review loop is non-terminal unless a new human/security boundary is reached.
10. After manual containerd migration PASS, continue automatically through C3 exact candidate load/deploy -> M3 exact app-only firmware flash -> M4 bounded combined EN/JA physical UX retest under the already-activated envelope. Reports/pushes/checkpoints are not stops.

## Non-authority

This proposal does not authorize until the human says `proceed`:

- any ZAI/GLM reviewer invocation;
- any new credential, key, login, paid route, OpenRouter path, or auth-method change;
- independent-review waiver;
- unreviewed root-script installation or execution;
- Docker/containerd mutation;
- candidate import/deployment;
- firmware flash;
- provider/private-microphone session;
- destructive cleanup;
- deletion of rollback roots;
- Deluge changes;
- billing/model/runtime changes;
- merge/release.

## Human decision

Recommended approval text:

```text
proceed
```

Meaning: authorize the exact narrow reviewer substitution above, first requiring a safe re-establishment check of the existing `zai-glm53-reviewer` profile, then exact read-only GLM-5.3-Flash review of V2. No waiver and no broader reviewer/provider authority.

Rejection text:

```text
keep C1 blocked
```

PR #2 must remain open/draft/unmerged.
