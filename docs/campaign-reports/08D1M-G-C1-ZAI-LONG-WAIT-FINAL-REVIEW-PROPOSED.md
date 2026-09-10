# Campaign 8D1M-G — C1 ZAI final long-wait exact review — PROPOSED

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
State: `PROPOSED_NOT_AUTHORIZED`

## Current accepted state

The exact corrected C1 V2 artifact remains:

```text
ARTIFACT=scripts/slate-m2-containerd-rootstep-v2-nvme-reversible.sh
SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
```

The existing approved ZAI reviewer route has now been recovered far enough to prove:

```text
REVIEW_PROVIDER=ZAI
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_MODEL=glm-5.3-flash
ZAI_AUTH_PRESENT=YES
CORRECTED_EXACT_REVIEW_REQUEST=YES
```

The corrected exact-SHA request inspected the artifact but produced no final message or result file during a 360-second bounded wait and was terminated. No verdict was accepted. V2 remains unreviewed, uninstalled and unexecuted. Production/containerd/Docker/firmware/provider state was not changed.

Historical campaign evidence shows the same configured `zai-glm53-reviewer` / `glm-5.3-flash` route previously completed an exact read-only review successfully. Therefore one final transport adjustment is preferable to an independent-review waiver at this point.

## Recommendation

Authorize exactly one final read-only review attempt using the same existing provider/profile/model/auth and exact V2 SHA, with no reviewer/provider substitution and no credential change.

The only material transport-policy change is to remove the artificial six-minute termination and allow a longer bounded completion window appropriate for a high-effort whole-artifact review.

```text
FINAL_ZAI_REVIEW_ATTEMPT=ONE
REVIEW_PROVIDER=ZAI
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_MODEL=glm-5.3-flash
REVIEW_MODE=READ_ONLY
REVIEW_TARGET_SHA=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
MAX_WALL_WAIT=20_MINUTES
NEW_CREDENTIAL=NO
NEW_LOGIN=NO
OPENROUTER=NO
REVIEWER_SUBSTITUTION=NO
REVIEW_WAIVER=NO
PRODUCTION_MUTATION=NO
```

## Activation procedure

Only after explicit human `proceed`:

1. `git fetch origin` and reconcile to the activation head.
2. Re-read `CAMPAIGN-STATE.md`, the ZAI recovery report, this proposal and the exact V2 artifact.
3. Re-prove V2 SHA-256 exactly.
4. Confirm the same existing ZAI profile/model and only the presence/non-empty status of existing auth; never print or move secret material.
5. Use the already-recovered reviewer invocation path. Do not invent a new wrapper, provider, auth method or model.
6. Use a minimal final-output contract. The reviewer must inspect the complete exact artifact and return only the evidence needed to close the gate:

```text
REVIEW_TARGET_SHA=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
VERDICT=<PASS|REVISE|BLOCK>
P0=<count>
P1=<count>
P2=<count>
P3=<count>
SECURITY_FINDINGS=<compact summary>
```

7. Capture ordinary reviewer stdout/stderr/result metadata safely. Do not place credentials in argv, logs or report content. Do not dump raw transport/auth diagnostics that could contain secret material.
8. Allow the review process up to 20 minutes to complete. Poll process/result state without killing a still-running healthy reviewer merely because an intermediate checkpoint elapsed.
9. If a final verdict arrives earlier, stop waiting immediately and adjudicate it.
10. If the process exits without a valid exact-SHA verdict, or remains alive without a final verdict at the 20-minute bound, terminate it once, publish the exact failure class and declare this ZAI transport exhausted. No blind retry.

## Outcome handling

### PASS

If PASS with no unresolved P0/P1/P2/security finding:

- continue immediately to the existing C2 path;
- install only exact reviewed V2 under `/home/pi/` without executing it;
- verify remote SHA/type/mode 700/`bash -n`;
- arm the sanitized observer;
- push/fetch-verify checkpoint;
- give the operator exactly one `ssh -t ... sudo ...` command;
- after manual containerd migration PASS, continue automatically through C3 exact candidate load/deploy -> M3 exact app-only firmware flash -> M4 bounded combined EN/JA physical UX retest;
- reports/checkpoints are not stops.

### REVISE

If bounded findings are returned:

- Gemini 3.8 Flash may act as bounded writer where useful;
- Codex remains sole repository writer/integrator and validator;
- assign a new exact SHA;
- rerun deterministic proof;
- because this authorization is for the exact V2 SHA only, stop at a new exact-review authorization boundary unless a newer directive explicitly extends this same reviewer authorization to the repaired SHA.

### BLOCK / P0/P1/security

Stop and publish the exact findings. Do not install/execute the root script.

### NO FINAL VERDICT AFTER 20 MINUTES

Publish one compressed human decision packet with only these choices:

1. authorize a different independent reviewer for the exact artifact;
2. explicitly waive independent review and rely on the existing Codex deterministic proof package;
3. keep C1 blocked and wait for reviewer transport recovery.

Do not silently choose among them.

## Non-authority

This proposal does not authorize until the human says `proceed`:

- any further ZAI reviewer invocation;
- any new credential/login/provider/model/profile;
- reviewer substitution;
- review waiver;
- V2 install or execution;
- Docker/containerd mutation;
- candidate load/deployment;
- firmware flash;
- provider/private microphone session;
- destructive cleanup;
- Deluge changes;
- merge/release.

PR #2 remains open/draft/unmerged.
