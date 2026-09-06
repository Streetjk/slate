# Campaign 8D1M-G — C1 ZAI reviewer-route recovery

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Recover the already-human-authorized exact `zai-glm53-reviewer` / `glm-5.3-flash` independent-review route for the corrected C1 V2 containerd migration artifact without creating a new reviewer, credential, provider, paid route, or waiver.

This directive adds no new product/production/credential/billing/reviewer authority. It operationalizes the already-activated narrow ZAI reviewer substitution after the controller reported that the exact local reviewer executable/profile was not found.

Current exact review target:

```text
ARTIFACT=scripts/slate-m2-containerd-rootstep-v2-nvme-reversible.sh
SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
REVIEW_PROVIDER=ZAI
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_MODEL=glm-5.3-flash
REVIEW_MODE=READ_ONLY
```

The unrelated local NVIDIA NIM GLM-5.2 wrapper is not authorized and must not be invoked.

## Operating mode

Operate in `FRONTIER_DRIVEN_LONGRUN` mode. The reviewer-route recovery is the only current READY/READONLY_READY node. Report pushes are checkpoints, not stops. Do not retry exhausted Grok transports.

## R0 — reconcile exact live state

1. `git fetch origin` and reconcile to the newest remote head.
2. Re-read `CAMPAIGN-STATE.md`, the frontier report, the GLM-5.3 substitution proposal, the prior 8D1K-E reviewer-route recovery history, and this directive.
3. Re-prove V2 SHA-256 exactly `09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd`.
4. Verify PR #2 remains open/draft/unmerged.
5. Do not install or execute V2 during reviewer-route recovery.

## R1 — recover the existing reviewer route, not a new one

Perform bounded, non-secret discovery for the historically configured `zai-glm53-reviewer` route.

Allowed read-only checks include:

- `type -a`, `command -v`, shell function/alias inspection for the exact historical profile/launcher name;
- `git grep` / repository history for exact historical invocation syntax and launcher/profile definition;
- inspection of existing PATH entries and already-configured local tool directories for the exact launcher/profile;
- installed package/CLI metadata where needed to identify an already-present launcher;
- checking only whether `ZAI_API_KEY` is present/non-empty in the current controller environment, never printing its value;
- checking exact profile/provider/model metadata after the route is found;
- starting a fresh controller child process only if necessary to inherit an already-present environment and invoke the existing reviewer normally.

Do not:

- print or dump `ZAI_API_KEY`;
- dump the full environment;
- search broadly for API-key material;
- read secret-file contents;
- copy/move/create/replace a credential;
- ask the user to paste a key into chat/GitHub;
- install a new reviewer package/CLI;
- create a new login or auth method;
- use OpenRouter;
- use NVIDIA NIM GLM-5.2;
- substitute another model/provider/profile;
- waive independent review.

Historical durable evidence says this exact ZAI route has previously worked and that host restart can remove reviewer authentication from the active shell/environment. Use that only to guide safe recovery; do not infer or expose secret locations or values.

## R2 — route found

If the exact existing launcher/profile is found:

1. confirm only:

```text
REVIEW_PROVIDER=ZAI
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_MODEL=glm-5.3-flash
REVIEW_MODE=READ_ONLY
REVIEW_AUTH_AVAILABLE=<YES|NO>
```

2. If auth is unavailable, stop at the exact secure-environment human boundary below; do not send the artifact.
3. If auth is available, re-prove the V2 SHA immediately before transmission.
4. Send the complete exact V2 artifact plus the narrow root-migration safety rubric for one independent whole-artifact review.
5. Require:

```text
REVIEW_TARGET_SHA=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
VERDICT=<PASS|REVISE|BLOCK>
P0=<count>
P1=<count>
P2=<count>
P3=<count>
SECURITY_FINDINGS=<summary>
```

6. Codex independently validates that the verdict binds to the exact V2 SHA.

## R3 — reviewer outcome

### PASS

If PASS with no unresolved P0/P1/P2/security finding:

- continue automatically to existing C2;
- install only exact reviewed V2 under `/home/pi/` without executing it;
- verify remote SHA/type/mode 700/`bash -n`;
- arm sanitized observer;
- push/fetch-verify checkpoint;
- then give the operator exactly one `ssh -t ... sudo ...` command for the reviewed containerd NVMe migration;
- after manual migration PASS, continue automatically C3 exact candidate load/deploy -> M3 exact app-only firmware flash -> M4 combined bounded EN/JA physical UX retest;
- do not stop at successful checkpoints.

### REVISE

If bounded findings are returned:

- use Gemini 3.8 Flash as bounded writer where useful;
- Codex remains sole repository writer/integrator and deterministic validator;
- assign a new exact SHA;
- rerun deterministic proof;
- re-review the corrected exact artifact with this same already-authorized ZAI profile;
- bounded fix/re-review is non-terminal.

### BLOCK / unresolved P0/P1/security

Stop and publish exact findings. Do not install/execute the root script.

## R4 — exact route not recoverable

If the existing reviewer launcher/profile cannot be recovered from already-present tooling/configuration without a new install, new login, new auth method, secret-value handling, or provider change, publish one compressed human packet:

```text
STATUS=HARD_STOP_EXISTING_ZAI_REVIEW_ROUTE_NOT_RECOVERABLE
EXACT_ARTIFACT=scripts/slate-m2-containerd-rootstep-v2-nvme-reversible.sh
EXACT_SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
ZAI_REVIEWER_EXECUTABLE=<FOUND|NOT_FOUND>
ZAI_AUTH_PRESENT=<YES|NO|NOT_CHECKABLE>
NEW_INSTALL_REQUIRED=<YES|NO>
NEW_LOGIN_REQUIRED=<YES|NO>
SECRET_VALUE_HANDLING_REQUIRED=<YES|NO>
PRODUCTION_MUTATION=NO
NEXT_ACTION=<one exact minimal human recovery action based only on proven local evidence>
```

If the only missing condition is existing ZAI auth in the local secure environment, the human instruction must be phrased generically as restoring the already-existing ZAI reviewer authentication locally and resuming Codex; never ask for the secret value in chat and never publish a secret path unless it is already non-secret repository documentation.

Do not recommend a review waiver while recovery of the existing approved independent route remains possible.

## Terminal contract

Before exit persist:

```text
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
HUMAN_ACTION_REQUIRED=
TERMINAL_REASON=
```

Exit only if the exact route is not recoverable under current authority, a genuine reviewer finding blocks, or the next required action is the one manual sudo boundary after a clean exact review.

PR #2 remains open/draft/unmerged.
