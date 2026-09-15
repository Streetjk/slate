# Campaign 8D1M-G — V5 single root boundary, then automatic R5-R10 resume

Date: 2026-09-06 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

This is an execution/continuation packet under the already-active LONGRUN V5 authority. It adds no new product, credential, provider, billing, private-data, firmware, destructive-cleanup, or merge authority.

The current controller stop at head `983c80b7f45e0d4fd3799e38b4b939c9de65dd62` is accepted as a genuine password-bearing root boundary, not a routine engineering stop.

Accepted state:

```text
V5_SCRIPT=scripts/slate-m2-containerd-rootstep-v5-isolated-state-slate-recreate.sh
V5_REMOTE=/home/pi/slate-m2-containerd-rootstep-v5-isolated-state-slate-recreate.sh
V5_SHA256=5deee30cb8c9c8cd7605a430e5717d1f9358ac5e3f9519b53f89bb4c8b608acd
V5_REVIEWER=AGY_GEMINI_3_7_FLASH_HIGH
V5_REVIEW=PASS
R1=PASS
R2=PASS
R3=PASS
R4=PASS_ROOT_BOUNDARY_READY
ACTIVE_CONTAINERD_ROOT=/var/lib/containerd
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
SLATE=running/healthy/restarts=0
MYSQL=running/healthy/restarts=0
LOCAL_PUBLIC_HEALTH=HTTP_200
NVME_RESERVE_150GB=PASS
PROVIDER_CALLS=0
PRODUCTION_MUTATION=NO
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
HUMAN_ACTION_REASON=ONE_MANUAL_SUDO_ROOT_TRANSACTION
```

## One operator command

The operator should run exactly one password-bearing command. It must preserve both failed derived artifacts by same-filesystem rename, verify the exact reviewed V5 remote script before running it, and then execute V5 only if all guards pass.

```bash
ssh -t note4-orangepi 'sudo sh -c '\''set -eu; SCRIPT=/home/pi/slate-m2-containerd-rootstep-v5-isolated-state-slate-recreate.sh; ROOT=/mnt/ssd-tmp/slate-tools/containerd-root; ROOT_ARCH=/mnt/ssd-tmp/slate-tools/containerd-root.failed-slate-restart-growth-20260906; BAK=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup; BAK_ARCH=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v1-backup.failed-slate-restart-growth-20260906; V5_BAK=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v5-backup; test -f "$SCRIPT"; test ! -L "$SCRIPT"; test "$(sha256sum "$SCRIPT" | awk "{print \\$1}")" = 5deee30cb8c9c8cd7605a430e5717d1f9358ac5e3f9519b53f89bb4c8b608acd; test -d "$ROOT"; test ! -L "$ROOT"; test -d "$BAK"; test ! -L "$BAK"; test ! -e "$ROOT_ARCH"; test ! -e "$BAK_ARCH"; test ! -e "$V5_BAK"; test ! -e /run/containerd-v5; mv -- "$ROOT" "$ROOT_ARCH"; mv -- "$BAK" "$BAK_ARCH"; exec "$SCRIPT"'\'''
```

Do not run any separate cleanup command before this. Do not use `rm`, `rm -rf`, Docker prune, or wildcard deletion.

If an early guard or archival rename fails, V5 must not execute. Record the exact output and do not improvise another root command.

## Automatic resume contract after operator output

When the operator pastes the output of the command above into the active Codex session, treat it as a child result under this already-active instruction. **Do not require GPTWeb relay, a new `proceed`, or another campaign activation merely to resume.**

Immediately:

```text
INGEST OUTPUT
-> PERSIST REPORT/STATE
-> PUSH
-> FETCH/RE-READ CONTROL PLANE
-> RECONCILE LIVE STATE
-> RECOMPUTE FRONTIER
-> CONTINUE R5-R10
```

### If V5 PASS

Continue without stopping through:

```text
R5 post-root independent verification
-> R6 exact C3 UX candidate load/deploy
-> deterministic provider-disabled backend validation
-> bounded automatic repair/rollback/retest if needed
-> R7 exact app-only firmware step
-> firmware verification
-> R8 one combined EN/JA physical/private-mic action only when genuinely required
-> R9 bounded UX repair/review/requalification loop if needed
-> R10 closure dossier
```

A report, PASS, commit, push, test result, reviewer result, C3 completion, or M3 completion is not a stop.

### If V5 fail-closes with rollback PASS

Do not terminalize merely because this root hypothesis failed. Persist the exact failure, perform all authorized non-secret/read-only attribution immediately, and continue bounded repair/test/review work under LONGRUN V5 while READY/READONLY_READY work exists. Stop only if another password-bearing root transaction becomes genuinely necessary after that frontier is exhausted, or another V5 genuine stop condition is reached.

### If rollback fails or production health is uncertain

Treat that as a genuine safety stop. Do not run another mutation until live state is reconciled.

## Human-intervention minimization

After the command above, the next expected human intervention is **not** another engineering checkpoint. It should be only one of:

1. a new unavoidable password-bearing root transaction after a materially different reviewed repair;
2. changed firmware device identity/pin;
3. a new credential/billing/private-data/provider trust boundary;
4. unresolved P0/P1/security block;
5. the already-approved combined M4 EN/JA physical/private-microphone action;
6. merge/release.

Before any controller exit, record:

```text
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Exit remains forbidden while READY or READONLY_READY work remains unless continuation would violate safety or authority.

Keep PR #2 open/draft/unmerged.