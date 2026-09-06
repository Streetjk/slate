# Campaign 8D1M-G — C1 AGY Gemini 3.7 reviewer substitution — PROPOSED

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
State: `PROPOSED_NOT_AUTHORIZED`

## Current boundary

The final authorized ZAI `zai-glm53-reviewer` / `glm-5.3-flash` exact-artifact attempt has terminated without a durable final verdict despite the exact route, existing authentication, exact target SHA, minimal output contract, and extended bounded wait being correct.

The current exact C1 artifact remains:

```text
ARTIFACT=scripts/slate-m2-containerd-rootstep-v2-nvme-reversible.sh
SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
SAFE_FOR_MANUAL_SUDO=NO
REMOTE_INSTALL=NO
PRODUCTION_MUTATION=NO
```

The authorized frontier is exhausted and the next action is a human review-policy decision.

## Recommendation

Prefer a different independent reviewer over an independent-review waiver for this root-level containerd migration.

The proposed fallback is the previously proven AGY `gemini-3.7-flash-high` read-only reviewer route, which has already produced accepted independent review evidence in this PR lineage. The temporary Gemini 3.7 review/shadow blackout ended at `2026-09-06T02:00:00+08:00`; however, expiry of that blackout does not itself authorize a new Gemini 3.7 reviewer call under the current routing override. Explicit human authorization is still required.

This proposal is intentionally narrow and applies only to the exact C1 V2 artifact above because both Grok 4.6 and the ZAI GLM-5.3 exact-review transports are exhausted.

## Proposed narrow authorization

On explicit human `proceed`, authorize:

```text
SUBSTITUTE_REVIEWER=AGY_GEMINI_3_7_FLASH_HIGH
REVIEW_PROVIDER=AGY_EXISTING_AUTH_ROUTE
REVIEW_MODEL=gemini-3.7-flash-high
REVIEW_MODE=READ_ONLY
REVIEW_SCOPE=EXACT_C1_V2_ARTIFACT_ONLY
EXACT_ARTIFACT=scripts/slate-m2-containerd-rootstep-v2-nvme-reversible.sh
EXACT_SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
NEW_CREDENTIAL=NO
OPENROUTER=NO
PRODUCTION_MUTATION_DURING_REVIEW=NO
REVIEW_WAIVER=NO
REVIEWER_SUBSTITUTION_BEYOND_THIS_ONE_ARTIFACT=NO
```

Gemini 3.8 Flash remains the bounded implementation writer/worker. It must not review its own authored work. Codex remains controller, sole repository/production writer/integrator, deterministic validator, and final adjudicator.

## Activation procedure

After explicit human `proceed`:

1. Fetch/reconcile to the activation head and re-read current state, routing override, ZAI terminal report, this proposal, and exact V2.
2. Re-prove exact V2 SHA-256.
3. Perform a non-secret preflight of the already-existing AGY reviewer route only; do not create or expose credentials.
4. Require the reviewer identity to resolve exactly to `gemini-3.7-flash-high`, high-effort/read-only equivalent.
5. Send the complete exact V2 artifact plus the narrow root-migration safety rubric.
6. Require a final whole-artifact result bound to exact SHA:

```text
REVIEW_TARGET_SHA=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
VERDICT=<PASS|REVISE|BLOCK>
P0=<count>
P1=<count>
P2=<count>
P3=<count>
SECURITY_FINDINGS=<summary>
```

7. If PASS with no unresolved P0/P1/P2/security finding, continue automatically to existing C2: install only the exact reviewed V2 under `/home/pi/`, verify remote SHA/type/mode 700/`bash -n`, arm observer, publish checkpoint, then give exactly one `ssh -t ... sudo ...` command.
8. If bounded REVISE findings are returned, use Gemini 3.8 Flash as bounded writer where useful, Codex validates/integrates, assign a new exact SHA, rerun deterministic proof, and re-review the corrected exact artifact using this same explicitly authorized AGY reviewer route without stopping at ordinary checkpoints.
9. After manual containerd migration PASS, continue automatically through C3 exact candidate load/deploy -> M3 exact app-only firmware flash -> M4 combined EN/JA physical UX retest under the already-activated envelope.

## Non-authority

Until explicit human `proceed`, this proposal does not authorize:

- any Gemini 3.7 reviewer invocation;
- any new credential/login/auth method;
- OpenRouter;
- independent-review waiver;
- unreviewed root-script install/execution;
- Docker/containerd mutation;
- candidate image import/deploy;
- firmware flash;
- provider/private-microphone session;
- destructive cleanup;
- Deluge changes;
- production model/billing/Vertex/credential changes;
- PR merge/release.

If the exact AGY reviewer route is unavailable under existing authentication/tooling, stop and publish that exact boundary; do not silently choose a fourth reviewer or waive review.

## Human decision

Recommended approval text:

```text
proceed
```

Meaning: authorize one exact read-only AGY `gemini-3.7-flash-high` independent review of C1 V2 only, with bounded correction/re-review if findings require it. No waiver and no broader reviewer-routing change.

Rejection text:

```text
keep C1 blocked
```

PR #2 remains open/draft/unmerged.
