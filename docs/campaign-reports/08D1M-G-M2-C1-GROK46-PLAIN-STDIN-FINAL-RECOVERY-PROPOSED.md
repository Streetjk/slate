# Campaign 8D1M-G — M2 C1 Grok 4.6 plain-stdin final recovery — PROPOSED

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
State: `PROPOSED_NOT_AUTHORIZED`

## Current accepted state

The containerd NVMe migration remains blocked only at the independent-review transport gate.

```text
M1_STATUS=PASS_NVME_DOCKER_ROOT_ACTIVE
M2_STATUS=CONTAINERD_RECOVERY_C1_REVIEW_TRANSPORT_HARD_STOP
C0_STATUS=TOPOLOGY_COMPATIBLE
C1_SCRIPT=scripts/slate-m2-containerd-rootstep-v1-nvme-reversible.sh
C1_SCRIPT_SHA256=84ab71aa5f126eb58ff70f34dd89d92c3d72cc3ea0335c9f3f9f07a522a757cd
C1_LOCAL_BASH_N=PASS
C1_LOCAL_DIFF_CHECK=PASS
C1_LOCAL_SECRET_SCAN=PASS
C1_GROK_AUTH=PASS
C1_GROK_MODEL=grok-4.6
C1_GROK_EXACT_REVIEW=NO_FINAL_VERDICT
C1_RECOVERY_ATTEMPTS=3_OF_3
C1_REMOTE_INSTALL=NOT_PERFORMED
PRODUCTION_MUTATION=NO
```

The prior three authorized transport attempts were:

```text
1. structured JSON with full artifact embedded
2. structured JSON multipart line-ranged chunks
3. documented prompt-file/read-file allowlist path
```

All timed out without a final verdict. The exact artifact remained unchanged.

## Recommendation

Before considering reviewer substitution or an independent-review waiver, authorize exactly one final materially different Grok transport attempt:

- existing authenticated Grok CLI/session family only;
- fresh CLI process/session is allowed;
- confirm from local `grok --help` that stdin/piped prompt input is supported;
- if supported, feed the complete exact artifact over plain stdin directly from the local file or deterministic `git show` output;
- no JSON envelope;
- no chunking;
- no Grok file-read tool;
- no remote URL fetch;
- no new credential;
- no artifact modification;
- require a single final whole-artifact verdict with P0/P1/P2/security findings.

The exact SHA must be rechecked immediately before transmission and again before accepting any verdict.

If the installed Grok CLI does not support plain stdin/piped prompt input, stop without attempting an invented mechanism.

## Success path

If Grok 4.6 returns PASS with no unresolved P0/P1/P2/security finding for exact SHA
`84ab71aa5f126eb58ff70f34dd89d92c3d72cc3ea0335c9f3f9f07a522a757cd`:

1. Codex validates the verdict and exact SHA.
2. Install only that reviewed script under `/home/pi/` without executing it.
3. Verify remote SHA-256, regular-file type, mode 700, and `bash -n`.
4. Arm sanitized observer.
5. Push/fetch-verify checkpoint.
6. Give the operator exactly one `ssh -t ... sudo ...` command.
7. On containerd migration PASS continue automatically through C3 exact candidate load/deploy -> M3 app-only firmware flash -> M4 bounded EN/JA physical UX retest.

If Grok returns bounded REVISE findings, Gemini 3.8 Flash remains the bounded writer; Codex validates/adjudicates and a new exact SHA must receive a fresh Grok 4.6 review before installation.

## Failure path

If this final plain-stdin attempt is unsupported, times out, or produces no exact-artifact verdict:

```text
C1_REVIEW_TRANSPORT=EXHAUSTED
C1_SAFE_FOR_MANUAL_SUDO=NO
NEXT_ACTION=HUMAN_DECISION_REVIEWER_SUBSTITUTION_OR_EXPLICIT_REVIEW_WAIVER
```

Do not silently substitute a reviewer and do not install or execute the unreviewed root script.

## Non-authority while proposed

Until the human explicitly says `proceed`, this proposal authorizes no additional Grok attempt, reviewer change, production/containerd/Docker mutation, image load, firmware flash, provider call, credential change, destructive cleanup, or merge.

PR #2 remains open/draft/unmerged.

## Final plain-stdin attempt — retained human boundary

The proposal was explicitly activated by the operator's `proceed` instruction.
The exact artifact was reconciled immediately before transmission:

```text
ATTEMPT=4_FINAL_PLAIN_STDIN
REVIEW_PROVIDER=GROK
REVIEW_MODEL=grok-4.6
ARTIFACT=scripts/slate-m2-containerd-rootstep-v1-nvme-reversible.sh
ARTIFACT_SHA256=84ab71aa5f126eb58ff70f34dd89d92c3d72cc3ea0335c9f3f9f07a522a757cd
INPUT=PLAIN_STDIN_COMPLETE_ARTIFACT
FILE_READ_TOOL=NOT_USED
JSON_ENVELOPE=NOT_USED
REMOTE_FETCH=NOT_USED
```

The supported `grok agent stdio` process returned without any final reviewer
verdict. No retry was made.

```text
PLAIN_STDIN_RESULT=NO_FINAL_VERDICT
C1_REVIEW_TRANSPORT=EXHAUSTED
C1_SAFE_FOR_MANUAL_SUDO=NO
C1_REMOTE_INSTALL=NOT_PERFORMED
PROVIDER_CALLS=0
PRODUCTION_MUTATION=NO
NEXT_ACTION=HUMAN_DECISION_REVIEWER_SUBSTITUTION_OR_EXPLICIT_REVIEW_WAIVER
```

The exact script remains uninstalled and unexecuted. C2/C3/M3/M4 remain
blocked. No credentials, private payloads, production services, Docker or
containerd trees, firmware, or images were changed.
