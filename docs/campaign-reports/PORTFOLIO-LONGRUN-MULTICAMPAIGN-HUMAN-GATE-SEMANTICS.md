# Portfolio long-run multicampaign human-gate semantics

Date: 2026-09-11 (Australia/Perth)

## Purpose

Refine the generic multi-campaign scheduler after the first successful live
portfolio pass. The scheduler correctly recovered the C7/C8 artifact identity,
reconciled C7/C8/C9/C10 independently, exhausted safe READY/READONLY work, and
stopped at the canonical Grok 4.6 external infrastructure block.

The remaining correction is semantic: an optional future authority boundary is
not the same thing as an immediate human action requirement.

This addendum grants no deployment, provider, credential, OAuth, billing,
private-data, firmware, device, merge, or release authority.

It supplements:

- `PORTFOLIO-LONGRUN-MULTICAMPAIGN-SCHEDULER.md`;
- `PORTFOLIO-LONGRUN-CONTROLLER-C7-C8-C9.md`;
- `AUTONOMY-AND-HUMAN-GATE-POLICY.md`;
- `REPORT-PUSH-INVARIANT.md`;
- live `CAMPAIGN-STATE.md`.

## Human-gate classification

Use three distinct concepts.

```text
HUMAN_ACTION_REQUIRED_NOW=
OPTIONAL_HUMAN_AUTHORITY_AVAILABLE=
PARKED_BY_DESIGN=
```

`HUMAN_ACTION_REQUIRED_NOW=YES` means the controller's currently recommended
next useful action cannot proceed without the operator and there is no
higher-priority safe/external lane that should remain the portfolio focus.

`OPTIONAL_HUMAN_AUTHORITY_AVAILABLE=YES` means an operator could deliberately
reopen or advance that lane, but no action is presently required and the
controller must not nag, count it as mandatory waiting work, or infer approval.

`PARKED_BY_DESIGN=YES` means the lane has no current work and should not count as
waiting for a human merely because a future decision could theoretically reopen
it.

Therefore do not use `WAITING_HUMAN_COUNT=1` solely because deployment, OAuth,
billing, provider, private-data, firmware, merge, or other future authority has
not been granted when that action is not the current recommended next step.

## Aggregate semantics

At portfolio level:

```text
PORTFOLIO_HUMAN_ACTION_REQUIRED=YES
```

only when at least one immediate recommended portfolio action genuinely requires
operator input/authority now.

Do not set it to YES merely because one or more parked or optional lanes could be
advanced by a hypothetical future authorization.

Publish optional opportunities separately when useful:

```text
PORTFOLIO_OPTIONAL_HUMAN_AUTHORITY_COUNT=
PORTFOLIO_OPTIONAL_HUMAN_AUTHORITY_LANES=
```

A portfolio may validly have:

```text
PORTFOLIO_READY_NODE_COUNT=0
PORTFOLIO_READONLY_READY_NODE_COUNT=0
PORTFOLIO_WAITING_HUMAN_COUNT=0
PORTFOLIO_EXTERNALLY_BLOCKED_COUNT=1
PORTFOLIO_HUMAN_ACTION_REQUIRED=NO
PORTFOLIO_OPTIONAL_HUMAN_AUTHORITY_COUNT>0
```

when the current priority is externally blocked and other lanes are merely
parked or available for optional future authority.

## Dependency-aware lane de-duplication

Do not treat every PR as an independent production-deployment opportunity when
one combined candidate already incorporates another lane's fixes.

For the current portfolio, the exact combined C7/C8 repair source is:

```text
C7_C8_COMBINED_SOURCE=553ad71932a8036a6f6dfe34794052eb4e573b10
C7_C8_COMBINED_IMAGE_ID=sha256:23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c4
C7_C8_COMBINED_IMAGE_ID_FORMAT=PASS_64_HEX
C7_C8_COMBINED_REVIEW=BLOCKED_CANONICAL_GROK_4_6_NO_TERMINAL_VERDICT
```

This combined candidate contains the C7 Weather/Google News/Outlook repair path
being prepared for the next production decision. While that combined candidate
remains the selected production path, do not separately promote a C7-only
deployment authority request as an immediate human action.

Classify C7 approximately as:

```text
C7_PRODUCTION_PATH=DEFER_TO_SELECTED_C7_C8_COMBINED_CANDIDATE
C7_HUMAN_ACTION_REQUIRED=NO
C7_WAITING_HUMAN_COUNT=0
C7_OPTIONAL_HUMAN_AUTHORITY_AVAILABLE=NO_WHILE_COMBINED_PATH_SELECTED
C7_NEXT_ACTION=TRACK_COMBINED_C7_C8_REVIEW_OUTCOME
```

Reopen a C7-only deployment choice only if the combined path is deliberately
abandoned, the combined review establishes a reason to split the candidates, or
the operator explicitly asks for C7-only deployment.

This avoids duplicate/stale production paths and unnecessary human prompts.

## Current C8 lane

The fresh provider-disabled artifact recovery is complete and mechanically
proved:

```text
C8_CANONICAL_REPAIR_SOURCE=553ad71932a8036a6f6dfe34794052eb4e573b10
C8_CANONICAL_ARM64_IMAGE_ID=sha256:23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c4
C8_IMAGE_ID_FORMAT=PASS_64_HEX
C8_ARTIFACT_PROVENANCE=FRESH_LOCAL_BUILD_FROM_EXACT_SOURCE
C8_READY_NODE_COUNT=0
C8_READONLY_READY_NODE_COUNT=0
C8_EXTERNALLY_BLOCKED_COUNT=1
C8_HUMAN_ACTION_REQUIRED=NO
```

The canonical review remains exactly:

```text
REVIEW_COMMAND=grok -m grok-4.6
REVIEW_FALLBACK=NONE
```

Do not retry in a tight loop. Retry only on a later controller pass, after a
meaningful reviewer-infrastructure state change, or after a reasonable bounded
backoff. A no-terminal-verdict result is not PASS and not REVISE.

If exact Grok 4.6 eventually PASSes, then prepare the smallest combined
C7/C8 deployment authority request. Do not request separate C7 deployment in
parallel unless dependency evidence requires a split.

If Grok returns REVISE, continue the existing Codex -> AGY
`gemini-3.8-flash-high` minimum repair -> deterministic gates -> privacy/secret
scan -> exact refreeze -> fresh Grok 4.6 loop without asking the operator unless
new authority is actually required.

## Current C9 lane

C9 is intentionally parked research-only. Lack of OAuth/billing/provider
experiment authority is not an immediate human wait state.

Use:

```text
C9_STAGE=PARKED_RESEARCH_ONLY
C9_PARKED_BY_DESIGN=YES
C9_READY_NODE_COUNT=0
C9_READONLY_READY_NODE_COUNT=0
C9_WAITING_HUMAN_COUNT=0
C9_HUMAN_ACTION_REQUIRED=NO
C9_OPTIONAL_HUMAN_AUTHORITY_AVAILABLE=YES
C9_NEXT_ACTION=NONE_UNLESS_EXPLICITLY_REOPENED_OR_NEW_SAFE_EVIDENCE_MATERIALLY_CHANGES_CONCLUSION
```

Do not create OAuth consent, projects, credentials, billing, provider probes, or
private-data scope merely because C8 is externally blocked.

## Current C10 lane

C10 is isolated, reviewed, not deployed, and its safe supported metric discovery
was exhausted. Unless the operator has explicitly selected C10 deployment as a
current objective, the absence of deployment authority is not an immediate
human wait state.

Use:

```text
C10_STAGE=ISOLATED_USAGE_TILES_REVIEWED_NOT_DEPLOYED
C10_PARKED_BY_DESIGN=YES
C10_READY_NODE_COUNT=0
C10_READONLY_READY_NODE_COUNT=0
C10_WAITING_HUMAN_COUNT=0
C10_HUMAN_ACTION_REQUIRED=NO
C10_OPTIONAL_HUMAN_AUTHORITY_AVAILABLE=YES
C10_NEXT_ACTION=NONE_UNLESS_OPERATOR_EXPLICITLY_SELECTS_C10_DEPLOYMENT_OR_SUPPORTED_NEW_METRIC_SURFACE_APPEARS
```

Do not use unsafe probes to manufacture work.

## Recommended current aggregate frontier

After live reconciliation, if no new state supersedes the current report, the
portfolio should classify approximately as:

```text
PORTFOLIO_CURRENT_PRIORITY=C8_CANONICAL_GROK_4_6_REVIEW
PORTFOLIO_READY_NODE_COUNT=0
PORTFOLIO_READONLY_READY_NODE_COUNT=0
PORTFOLIO_WAITING_DEVICE_COUNT=0
PORTFOLIO_WAITING_HUMAN_COUNT=0
PORTFOLIO_EXTERNALLY_BLOCKED_COUNT=1
PORTFOLIO_CURRENT_BLOCKED_NODE=C8_CANONICAL_GROK_4_6_EXTERNAL_INFRASTRUCTURE
PORTFOLIO_HUMAN_ACTION_REQUIRED=NO
PORTFOLIO_OPTIONAL_HUMAN_AUTHORITY_COUNT=2
PORTFOLIO_OPTIONAL_HUMAN_AUTHORITY_LANES=C9;C10
PORTFOLIO_TERMINAL_REASON=C8_CANONICAL_GROK_REVIEW_EXTERNAL_INFRASTRUCTURE_BLOCK_AFTER_BOUNDED_RETRY;NO_SAFE_READY_OR_READONLY_READY_LANES
PORTFOLIO_NEXT_ACTION=RETRY_CANONICAL_GROK_4_6_ON_LATER_CONTROLLER_PASS_OR_MEANINGFUL_INFRASTRUCTURE_RECOVERY;NO_FALLBACK;NO_DEPLOYMENT;NO_FLASH
```

C7 is not listed as an optional independent deployment lane while the selected
combined C7/C8 candidate remains active.

Reconcile live state before applying these approximate counts.

## Controller exit rule

A controller exit at the above frontier is correct. Long-run does not mean
busy-waiting forever or inventing work; it means exhausting every currently safe
node across every lane before exiting and resuming deterministically from the
durable frontier on the next invocation.

Keep PR #1, PR #2, PR #3, PR #4 OPEN / DRAFT / UNMERGED unless the operator
explicitly authorizes merge/release.
