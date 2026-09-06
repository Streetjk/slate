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

## Authorized AGY attempt 1 — restricted headless permission failure

The exact V2 SHA was re-proved and one AGY `gemini-3.7-flash-high` review job
was started with the existing OAuth route in restricted read-only mode. The
job returned no review content because headless restricted mode denied an
unlisted command permission before evidence collection. No source, provider
payload, credential, production, Docker, containerd, or firmware state was
changed.

The companion's sanitized failure classification identifies dropping
`--restricted` as the recoverable remedy. This does not constitute a review
verdict; the same exact review will be retried once using default unrestricted
AGY mode, with the read-only task prohibiting mutation.

```text
AGY_REVIEW_JOB=review-mtpayqxj4
AGY_REVIEW_MODEL=gemini-3.7-flash-high
AGY_REVIEW_PROFILE=restricted
REVIEW_TARGET_SHA=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
AGY_RESULT=EMPTY_RESPONSE
AGY_FAILURE_CLASS=RESTRICTED_HEADLESS_COMMAND_PERMISSION_DENIED
VERDICT=NO_VERDICT
REVIEW_CONTENT_SENT=NO
SOURCE_CHANGED=NO
PRODUCTION_MUTATION=NO
RECOVERY_ACTION=DROP_RESTRICTED_FOR_SAME_EXACT_READ_ONLY_REVIEW
```

## Authorized AGY attempt 2 — exact review PASS

After publishing the restricted-mode recovery checkpoint, the same exact
review was rerun in default unrestricted AGY mode as explicitly authorized by
the companion's failure guidance. The complete V2 artifact was reviewed
read-only and the result binds to the independently re-proved exact SHA.

```text
AGY_REVIEW_JOB=review-mtpb0rarq
AGY_REVIEW_MODEL=gemini-3.7-flash-high
AGY_REVIEW_PROFILE=unrestricted
REVIEW_TARGET_SHA=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
VERDICT=PASS
P0=0
P1=0
P2=0
P3=0
SECURITY_FINDINGS=NONE
FINDINGS=NONE
SOURCE_CHANGED=NO
PRODUCTION_MUTATION=NO
V2_INSTALL=NOT_YET
V2_EXECUTION=NO
```

The reviewer specifically confirmed the normalized `TREE` metrics correction,
all fail-closed preflight and copy gates, checksum/itemized rsync dry-run
gate, reserve and service handling, health/restart checks, rollback/trap
behavior, and no-delete protections. C2 is now authorized for install-only
of this exact reviewed artifact.

## C2 exact reviewed artifact installed — observer armed

The exact reviewed V2 artifact was transferred to the Orange Pi without sudo
and without executing it. Remote identity and syntax checks passed. A local
sanitized observer is running independently of the manual sudo terminal and
records only service/root/health status; it does not read credentials,
application payloads, or private data.

```text
C2_STATUS=REVIEWED_V2_INSTALLED_OBSERVER_ARMED_MANUAL_SUDO_PENDING
C2_REMOTE_HOST=note4-orangepi
C2_REMOTE_PATH=/home/pi/slate-m2-containerd-rootstep-v2-nvme-reversible.sh
C2_REMOTE_SHA256=09b40568306daeeb36feb114ee17eede1dffd44c8e824a1022fbce36b2be7ebd
C2_REMOTE_TYPE=regular_file
C2_REMOTE_MODE=700
C2_REMOTE_BASH_N=PASS
C2_OBSERVER_DIR=/tmp/slate-m2-c2-observer.I8Pyu8
C2_OBSERVER_STATUS=RUNNING
C2_OBSERVER_RESULT=WAITING
V2_EXECUTION=NO
PRODUCTION_MUTATION=NO
```

The one manual operator command, using only the exact reviewed V2, is:

```text
ssh -t note4-orangepi 'sudo /home/pi/slate-m2-containerd-rootstep-v2-nvme-reversible.sh'
```

The operator enters any SSH/sudo password only in their own terminal. Codex
does not request, receive, store, or transmit it. After this command, the
observer result will be ingested and C3 will continue automatically only if
the migration reports PASS; otherwise healthy rollback evidence is required.

The initial inline observer launcher exited before producing samples because
its background stdin lifecycle was not durable. It did not observe a
migration, and the manual command had not been issued. A replacement
file-backed disposable observer was syntax-checked and armed successfully:

```text
C2_OBSERVER_V1=EXITED_BEFORE_SAMPLES
C2_OBSERVER_V2_SCRIPT=/tmp/slate-m2-c2-observer-v2.sh
C2_OBSERVER_V2_DIR=/tmp/slate-m2-c2-observer-v2.idebXg
C2_OBSERVER_V2_PID=41109
C2_OBSERVER_V2_STATUS=RUNNING
C2_OBSERVER_V2_RESULT=WAITING
C2_OBSERVER_V2_SCOPE=SANITIZED_SERVICE_ROOT_HEALTH_ONLY
C2_OBSERVER_V2_SUDO=NO
V2_EXECUTION=NO
PRODUCTION_MUTATION=NO
```

The single manual command remains unchanged:

```text
ssh -t note4-orangepi 'sudo /home/pi/slate-m2-containerd-rootstep-v2-nvme-reversible.sh'
```
