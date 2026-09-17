# Portfolio C8 canonical Grok reviewer recovery

Date: 2026-09-11 (Australia/Perth)

## Purpose

Recover the canonical C8 independent-review lane without changing Slate product
bytes, without substituting reviewers, and without consuming unrelated provider,
OAuth, billing, private-data, deployment, firmware, or device authority.

This directive exists because the current evidence does **not** prove that Grok
4.6 itself is unavailable. The latest canonical invocation reached the reviewer,
inspected the candidate, and then terminated at the controller/CLI max-turn
boundary without producing the required terminal PASS or REVISE verdict. Older
attempt history also included a `device not configured` state. Treat this as a
reviewer CLI/auth/session/harness recovery problem until mechanically proven to
be an external xAI/Grok service outage.

## Live expected state entering recovery

Reconcile live GitHub before execution.

```text
PR=2
EXPECTED_HEAD_BEFORE_RECOVERY=d5e0d708c9e2307fbe17e8735181cb98d9377034
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO

CANONICAL_REPAIR_SOURCE=553ad71932a8036a6f6dfe34794052eb4e573b10
CANONICAL_TAG=slate:c7-c8-glyph-outlook-repair-d8
CANONICAL_ARM64_IMAGE_ID=sha256:23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c4
CANONICAL_REVIEWER=grok -m grok-4.6
REVIEWER_FALLBACK=NONE
```

Do not mutate product runtime bytes during reviewer recovery.

## Recovery classification

Before retrying the real review, determine which boundary is failing.

Publish:

```text
GROK_CLI_PRESENT=
GROK_CLI_VERSION=
GROK_MODEL_SELECTION_ACCEPTED=
GROK_AUTH_STATE=
GROK_DEVICE_CONFIGURATION_STATE=
GROK_TRIVIAL_NONREPO_HEALTHCHECK=
GROK_TRIVIAL_TERMINAL_EXIT=
GROK_REVIEW_PROMPT_SIZE_CLASS=
GROK_REVIEW_CONTEXT_SIZE_CLASS=
GROK_TOOL_LOOP_OBSERVED=
GROK_MAX_TURN_SOURCE=
GROK_TERMINAL_VERDICT_CONTRACT_ENFORCED=
GROK_EARLIEST_FAILED_BOUNDARY=
GROK_FAILURE_CLASS=
```

Possible failure classes include at least:

```text
CLI_MISSING_OR_BROKEN
AUTH_OR_DEVICE_CONFIGURATION
MODEL_SELECTION_REJECTED
NETWORK_OR_EXTERNAL_SERVICE
PROMPT_OR_CONTEXT_TOO_LARGE
TOOL_LOOP_OR_REVIEW_PLAN_TOO_EXPANSIVE
CONTROLLER_MAX_TURN_LIMIT
TERMINAL_VERDICT_NOT_FORCED
CLI_EXIT_OR_STDOUT_CAPTURE
UNKNOWN
```

Do not classify `NETWORK_OR_EXTERNAL_SERVICE` merely because the real review did
not finish.

## Zero-product-byte health checks

Use only the existing authorized canonical Grok reviewer account/session.
Do not create new credentials or accounts.

1. Record `grok` executable path and version.
2. Inspect safe auth/config status using supported CLI status/config commands only.
   Do not print tokens, cookies, auth headers or secret values.
3. If the CLI exposes a documented device/login status, record structural state
   only.
4. Run one minimal non-sensitive healthcheck using the exact canonical model,
   asking for one short deterministic terminal line, for example:

   `REVIEWER_HEALTH=PASS`

   The purpose is only to prove model selection, auth, request/response and clean
   CLI termination. Do not attach Slate source or private data to this healthcheck.
5. If the healthcheck itself fails, stop the real-review retry and classify the
   exact failure boundary.

A trivial canonical-model healthcheck is reviewer-infrastructure diagnosis, not
Gemini/provider qualification and not Slate production activity.

## Real-review harness repair

If the trivial healthcheck passes, diagnose why the real review reaches max turns.

Prefer fixing the **review harness/prompt**, not increasing turn limits blindly.

Required properties:

- exact frozen source/artifact identity supplied;
- bounded evidence bundle;
- no redundant repository wandering;
- no broad full-repo rediscovery when focused evidence already exists;
- explicit severity contract P0/P1/P2/P3/security;
- explicit instruction that the reviewer MUST terminate with one machine-readable
  verdict after inspection;
- fail closed if no terminal verdict is emitted.

The terminal block must be unambiguous, e.g. exactly one of:

```text
VERDICT=PASS
P0=0
P1=0
P2=0
SECURITY=0
```

or

```text
VERDICT=REVISE
P0=<n>
P1=<n>
P2=<n>
SECURITY=<n>
```

with concise findings references.

If the current wrapper allows the reviewer to spend all turns browsing before
verdict emission, restructure it so evidence inspection is bounded and verdict
emission is reserved before the turn ceiling.

Do not solve this merely by setting an unbounded/high retry or turn count.

## Canonical review retry

After CLI/auth/healthcheck and harness recovery pass, run exactly ONE fresh real
review using:

```text
grok -m grok-4.6
```

against the exact frozen C7+C8 candidate.

No ZAI.
No alternate Grok model.
No Gemini/Claude/Codex substitution as independent reviewer.
No silent fallback.

If PASS with zero P0/P1/P2/security findings, publish exact review evidence and
advance to the smallest human authority boundary: exact reviewed combined
C7+C8 backend/shared/frontend deployment only.

If REVISE, continue the established repair loop:

Codex adjudication -> AGY gemini-3.8-flash-high minimum repair -> impacted tests
-> typecheck/lint/format/build as applicable -> privacy/secret scan -> exact
refreeze -> fresh Grok 4.6 review.

If the healthcheck passes but the real review again reaches max turns/no verdict,
classify this as REVIEW_HARNESS_OR_CONTROLLER_LIMIT, not generic external service
unavailability, and keep recovery as safe READY/READONLY work if a deterministic
harness change remains possible.

If the trivial healthcheck fails for a proven external/network/service reason,
then classify C8 as externally blocked after bounded retry.

## Prohibitions

This directive grants no authority for:

- Slate production deployment;
- firmware change or flash;
- NOTE4 physical action/reset/re-pair/Wi-Fi change;
- Gemini/provider calls;
- Microsoft OAuth consent;
- private Outlook/Calendar data;
- C9 activation;
- C10 deployment;
- billing/credential changes;
- merge/release.

## Portfolio scheduler behavior

Reviewer recovery is C8 lane-local.

While deterministic CLI/harness diagnosis remains possible:

```text
C8_READY_NODE_COUNT>=1 OR C8_READONLY_READY_NODE_COUNT>=1
C8_EXTERNALLY_BLOCKED_COUNT=0
```

Only set `C8_EXTERNALLY_BLOCKED_COUNT=1` after zero-product-byte recovery work is
mechanically exhausted and the failure is proven external/nonrecoverable within
current authority.

Before controller exit update `CAMPAIGN-STATE.md`, push/fetch verify exact SHA,
and publish:

```text
PORTFOLIO_CURRENT_HEAD=
C8_STAGE=
GROK_CLI_PRESENT=
GROK_CLI_VERSION=
GROK_AUTH_STATE=
GROK_DEVICE_CONFIGURATION_STATE=
GROK_TRIVIAL_NONREPO_HEALTHCHECK=
GROK_TRIVIAL_TERMINAL_EXIT=
GROK_MAX_TURN_SOURCE=
GROK_TERMINAL_VERDICT_CONTRACT_ENFORCED=
GROK_EARLIEST_FAILED_BOUNDARY=
GROK_FAILURE_CLASS=
GROK_REAL_REVIEW_ATTEMPTED=
GROK_REVIEW_VERDICT=
GROK_P0=
GROK_P1=
GROK_P2=
GROK_SECURITY=
C8_READY_NODE_COUNT=
C8_READONLY_READY_NODE_COUNT=
C8_EXTERNALLY_BLOCKED_COUNT=
C8_HUMAN_ACTION_REQUIRED=
C8_NEXT_ACTION=
PORTFOLIO_READY_NODE_COUNT=
PORTFOLIO_READONLY_READY_NODE_COUNT=
PORTFOLIO_EXTERNALLY_BLOCKED_COUNT=
PORTFOLIO_HUMAN_ACTION_REQUIRED=
PORTFOLIO_TERMINAL_REASON=
PORTFOLIO_NEXT_ACTION=
```

Keep PR #1, #2, #3 and #4 OPEN / DRAFT / UNMERGED.
