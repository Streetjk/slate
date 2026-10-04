# Slate harness engineering

Slate development uses persistent repository/campaign state rather than
periodic supervisor prompts.

## Development control

Resume the exact incomplete campaign node from committed state. The controller
synthesizes a bounded task, assigns one writer/worktree, runs deterministic
verification, obtains independent read-only review when required, adjudicates
findings, and records the next state.

Terminal states are DONE, BLOCKED and HUMAN_GATE.

Hourly, cron, scheduled, polling or supervisor jobs must not select, dispatch,
repair or advance engineering work. A runtime watchdog may restart or monitor a
deployed/local Slate service for availability, but it must not edit source,
consume development authorization, change candidate identity, or advance a
campaign.

## Evidence and identity

Qualification is bound to the exact source SHA and relevant firmware/runtime
artifact identity. A material source change invalidates candidate-bound review.
Deterministic build/test evidence outranks model opinion.

Persist active node, candidate identity, owned paths, attempts/retry ceiling,
verification commands/results, reviewer result, finding disposition, terminal
or blocker reason, and exact next action.

## Existing release rules remain authoritative

This policy does not alter Slate version synchronization, annotated-tag release
rules, firmware safety requirements, branch-specific campaign instructions, or
the requirement to run ESP-IDF verification for firmware changes.

## Context and multi-agent discipline

Keep always-loaded instructions short and load module READMEs or campaign
reports only when relevant. Worker tasks must be self-contained. Reviewers are
independent/read-only. Parallel writers require separate worktrees and disjoint
ownership.
