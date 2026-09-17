# Campaign 8D1M-G — V5 root handoff quoting failure correction

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Operator result

The operator ran the exact V5 root-boundary command issued from the prior execution packet and received:

```text
[sudo] password for pi:
sh: 1: 1: parameter not set
Connection to 192.168.50.108 closed.
```

## Attribution

The failure is in the handoff command's SHA guard, not in V5.

The prior command embedded this construct inside `sh -c` under `set -u`:

```text
awk "{print \\$1}"
```

After the nested shell quoting layers were resolved, the inner shell attempted to expand `$1` as its own positional parameter. Because no positional parameter 1 was supplied and `set -u` was active, the shell terminated with:

```text
sh: 1: 1: parameter not set
```

This occurs before either archival `mv` and before `exec "$SCRIPT"` in the issued command. Therefore:

```text
V5_EXECUTED=NO
ROOT_ARCHIVE_RENAME=NOT_REACHED
BACKUP_ARCHIVE_RENAME=NOT_REACHED
CONTAINERD_DOCKER_MUTATION=NO_FROM_THIS_ATTEMPT
V5_SCRIPT_BYTES_CHANGED=NO
V5_REVIEW_INVALIDATED=NO
```

Do not modify or rereview V5 merely for this shell-wrapper defect.

## Required controller behavior

Treat this as a routine handoff-command quoting repair under the active LONGRUN V5 authority, not a new campaign or reviewer boundary.

Before reissuing the command, perform a short read-only reconciliation that proves the prior command did not cross the mutation boundary:

- active containerd root remains `/var/lib/containerd`;
- Docker root remains `/mnt/ssd-tmp/slate-tools/docker-data`;
- Slate/MySQL healthy;
- `ROOT=/mnt/ssd-tmp/slate-tools/containerd-root` still exists;
- `BAK=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup` still exists;
- both planned archive destinations remain absent;
- `/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v5-backup` remains absent;
- `/run/containerd-v5` remains absent;
- exact remote V5 SHA remains `5deee30cb8c9c8cd7605a430e5717d1f9358ac5e3f9519b53f89bb4c8b608acd`;
- 150 GiB reserve and Deluge invariants remain satisfied.

If those checks pass, reissue exactly one corrected password-bearing root command. The only change from the prior wrapper is the SHA guard: use `sha256sum | grep -q` and do not embed `$1`, `awk`, or any positional-parameter-sensitive expression.

## Corrected single root command

```bash
ssh -t note4-orangepi 'sudo sh -c '\''set -eu; SCRIPT=/home/pi/slate-m2-containerd-rootstep-v5-isolated-state-slate-recreate.sh; ROOT=/mnt/ssd-tmp/slate-tools/containerd-root; ROOT_ARCH=/mnt/ssd-tmp/slate-tools/containerd-root.failed-slate-restart-growth-20260906; BAK=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup; BAK_ARCH=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-slate-restart-growth-20260906; V5_BAK=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v5-backup; test -f "$SCRIPT"; test ! -L "$SCRIPT"; sha256sum "$SCRIPT" | grep -q "^5deee30cb8c9c8cd7605a430e5717d1f9358ac5e3f9519b53f89bb4c8b608acd  "; test -d "$ROOT"; test ! -L "$ROOT"; test -d "$BAK"; test ! -L "$BAK"; test ! -e "$ROOT_ARCH"; test ! -e "$BAK_ARCH"; test ! -e "$V5_BAK"; test ! -e /run/containerd-v5; mv -- "$ROOT" "$ROOT_ARCH"; mv -- "$BAK" "$BAK_ARCH"; exec "$SCRIPT"'\'''
```

No separate cleanup command is authorized. No `rm`, `rm -rf`, Docker prune, wildcard deletion, new reviewer, new provider, credential change, or V5 byte change is needed.

If a guard fails, V5 must not execute. Persist the exact failure and continue all read-only attribution/repair work available under LONGRUN V5 before asking the human again.

If V5 executes and PASSes, immediately continue the already-active automatic chain:

```text
R5 post-root verification
-> R6/C3 exact UX backend deployment
-> provider-disabled deterministic validation
-> R7/M3 exact app-only firmware
-> R8 one combined EN/JA physical/private-mic boundary only when actually required
-> R9 bounded repair/review/requalification if needed
-> R10 closure dossier
```

Do not stop at report pushes, PASS checkpoints, deterministic failures with bounded repairs, reviewer REVISE, C3 completion, or M3 completion.

Keep PR #2 open/draft/unmerged.
