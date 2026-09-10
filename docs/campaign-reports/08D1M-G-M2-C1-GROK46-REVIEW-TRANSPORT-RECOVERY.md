# Campaign 8D1M-G — M2 C1 Grok 4.6 review transport recovery

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Recover the existing exact Grok 4.6 independent-review gate for the already-prepared containerd NVMe migration script without changing reviewer, artifact scope, production state, or human authority.

Current accepted state:

```text
M1_STATUS=PASS_NVME_DOCKER_ROOT_ACTIVE
M2_STATUS=HARD_STOP_CONTAINERD_ROOT_CAPACITY
C0_STATUS=TOPOLOGY_COMPATIBLE
C1_SCRIPT=scripts/slate-m2-containerd-rootstep-v1-nvme-reversible.sh
C1_SCRIPT_SHA256=84ab71aa5f126eb58ff70f34dd89d92c3d72cc3ea0335c9f3f9f07a522a757cd
C1_LOCAL_BASH_N=PASS
C1_LOCAL_DIFF_CHECK=PASS
C1_LOCAL_SECRET_SCAN=PASS
C1_GROK_AUTH=PASS
C1_GROK_MODEL=grok-4.6
C1_GROK_SMOKE=PASS
C1_GROK_EXACT_REVIEW=NO_FINAL_VERDICT
C1_REMOTE_INSTALL=NOT_PERFORMED
PRODUCTION_MUTATION=NO
```

The blocker is review transport/file-tool stalling, not reviewer availability and not a product or migration defect.

## Routing

```text
CONTROLLER=CODEX
WRITER=GEMINI_3_8_FLASH
INDEPENDENT_REVIEWER=GROK_4_6
REVIEWER_SUBSTITUTION=NO
```

Do not substitute Luna, Gemini, GLM, Sonnet, another Grok model, or another reviewer. Do not use OpenRouter.

## Bounded recovery

Codex may perform bounded, read-only reviewer-transport recovery using only the existing authenticated Grok CLI/session.

1. Reconcile the exact artifact SHA before every attempt. If the script changes, the prior review attempt is invalid and the new exact SHA must be reviewed.
2. Inspect the locally installed Grok CLI help/capabilities without credentials or private payloads and choose only supported input mechanisms.
3. Prefer mechanisms that avoid the previously stalled file-reading path, for example supported stdin/piped prompt input or another documented local-content input mode. Do not invent unsupported flags.
4. Send the complete exact artifact plus the narrow review rubric. If CLI input-size limits require chunking, use a deterministic manifest/chunk protocol that proves all chunks belong to the same exact SHA and require a final whole-artifact verdict; do not accept per-chunk PASS as the final review.
5. Maximum three materially different bounded transport attempts in this recovery cycle. A reconnect/re-auth of the same existing Grok session is allowed if needed; do not create or expose a new credential.
6. Raw failed/stalled output need not be retained if it contains no verdict. Retain only sanitized transport status, exact artifact SHA, and final findings/verdict.
7. No production, Docker, containerd, firmware, provider, credential, billing, Deluge, or merge mutation is authorized by reviewer-transport recovery.

## Success path

If exact Grok 4.6 review of SHA `84ab71aa5f126eb58ff70f34dd89d92c3d72cc3ea0335c9f3f9f07a522a757cd` returns PASS with no unresolved P0/P1/P2/security finding:

1. Codex validates the verdict against the exact artifact.
2. Install that exact reviewed script under `/home/pi/` without executing it.
3. Verify remote SHA-256, regular-file type, mode 700, and `bash -n`.
4. Arm sanitized observer.
5. Push/fetch-verify the checkpoint.
6. Give the operator exactly one `ssh -t ... sudo ...` command for the containerd NVMe root step.
7. On manual root-step PASS, continue automatically through C3 exact candidate load/deploy -> M3 app-only firmware flash -> M4 bounded EN/JA physical UX retest under the already-authorized envelope. Checkpoint pushes are not stops.

## Review findings path

If Grok returns REVISE with bounded findings, use Gemini 3.8 Flash as bounded implementation writer, Codex validates/adjudicates, update only the required script logic, assign a new exact SHA, and immediately re-run exact Grok 4.6 review. Bounded fix/re-review is non-stopping.

## Hard stop

Stop only if:

- all three materially different supported Grok transport attempts fail to produce a final exact-artifact verdict;
- Grok 4.6 is no longer authenticated/available;
- unresolved P0/P1/security finding remains;
- artifact identity cannot be proven;
- a new credential, reviewer substitution, production mutation, or new human authority would be required.

If stopped, publish the exact sanitized failure class and keep production unchanged. Do not install or execute an unreviewed root script.

PR #2 must remain open/draft/unmerged.
