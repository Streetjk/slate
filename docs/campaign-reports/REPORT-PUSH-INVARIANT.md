# Persistent campaign report push invariant

Date established: 2026-09-03 (Australia/Perth)
Repository: `Streetjk/slate`
Scope: `integration/note4-custom` and all campaign feature branches derived from it.

This is a binding coordination rule for all current and future NOTE4 campaigns.

## Required behavior

At every meaningful campaign checkpoint, stage completion, hard stop, human boundary, reviewer block, provider-call stop, validation failure, or successful terminal state, Codex must persist the current campaign evidence to GitHub before returning control to the user whenever repository writes remain safe and authorized.

The required sequence is:

1. update the relevant campaign report with the exact current state and evidence;
2. update `docs/campaign-reports/CAMPAIGN-STATE.md` when the active stage/status/next action changed;
3. run final safety checks appropriate to the files changed, including at minimum `git diff --check` and a secret/credential-content check for campaign reports;
4. selectively commit only authorized files;
5. push the active campaign branch to `origin`;
6. fetch/verify the remote branch after push;
7. record and report the exact pushed commit SHA;
8. verify the relevant PR remains in its intended state, including no merge unless separately and explicitly authorized;
9. only then return control at the human/hard-stop boundary.

A local-only report is not considered a durable checkpoint.

A statement such as `report updated locally` is insufficient. Normal terminal evidence must include:

```text
REPORT_UPDATED=YES
CAMPAIGN_STATE_UPDATED=<YES|NO_NOT_REQUIRED>
REPORT_COMMITTED=YES
REPORT_PUSHED=YES
REMOTE_SHA_VERIFIED=YES
PUSHED_SHA=<exact sha>
PR_STATE_VERIFIED=YES
```

## Failure handling

If a report cannot be pushed because of a genuine repository/network/authentication conflict:

- do not discard the local report;
- do not reset valid local work;
- preserve the exact local commit/worktree state;
- record the sanitized push failure class;
- stop with a human/repository boundary;
- resume by reconciling remote state and pushing the preserved report before continuing later campaign work.

If repository safety prevents a commit, explain the exact conflict and preserve evidence without destructive cleanup.

## Security

Reports and state files must never contain:

- API-key values;
- OAuth bearer/refresh tokens;
- client secrets;
- protected credential file contents;
- private NOTE4/Outlook/Calendar payloads unless a later campaign explicitly authorizes sanitized inclusion;
- raw provider error bodies that may include credentials or private data.

Use sanitized classifications and non-secret metadata only.

## Interaction with campaign directives

This invariant supplements campaign-specific directives. It does not grant new authority for provider calls, production deployment/restart, firmware flashing, billing/Vertex changes, destructive host operations, or PR merges.

When a campaign directive says to checkpoint/publish/persist/stop, this file defines the default durable publication behavior: **commit, push, and verify remote before returning control**.

Future campaign directives and Codex wake-up prompts should preserve this invariant explicitly or by reference.
