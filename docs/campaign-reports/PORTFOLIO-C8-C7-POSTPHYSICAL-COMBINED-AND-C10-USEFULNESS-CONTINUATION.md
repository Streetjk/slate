# Portfolio continuation — combine post-physical C8+C7 repairs and finish C10 usefulness

Date: 2026-09-10 (Australia/Perth)

## Purpose

The current portfolio frontier incorrectly reports that all safe work is exhausted. Safe deterministic work remains before any new deployment or physical retest should be requested:

1. combine the reviewed post-physical C8 latency/session-language repair with the reviewed C7 Outlook/weather repair into one exact deployable artifact;
2. continue Campaign 10 until the requested usage tiles expose useful supported usage/token data where legitimately available, rather than stopping at version-only probes.

This directive grants no deployment, provider call, physical NOTE4 action, firmware flash, OAuth consent, billing, credential change, merge or release authority.

## Current reviewed parents

C8 post-physical repair:

```text
C8_SOURCE=6d0b7f274e36872f5f70c89e4ff7f26746714378
C8_REVIEW=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
C8_CHANGE=FIRST_INPUT_PARTIAL_IMMEDIATE_THEN_BOUNDED_COALESCING;REMOVE_UNJUSTIFIED_EN_SESSION_BIAS
C8_GEMINI25_LANGUAGE_CODES=ABSENT
```

C7 post-physical repair:

```text
C7_SOURCE=641e358f7067d7e314e4f2c1eb18258690268cab
C7_REVIEW=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
C7_OUTLOOK_ROOT_CAUSE=FRONTEND_AUTH_URL_ERROR_SWALLOWED_AS_SILENT_LOADING_RESET
C7_WEATHER_ROOT_CAUSE=OPEN_METEO_WMO_CODE_USED_AS_QWEATHER_ASSET_FILENAME
```

C10 current isolated branch:

```text
C10_PR=4
C10_HEAD=e9a6cfac86c63cb461a62d5029080332fac06865
C10_REVIEW=PASS_GROK_4_6_SECURITY_FOCUSED_P0_0_P1_0_P2_0_SECURITY_0
C10_CURRENT_USAGE=VERSION_ONLY;NO_MACHINE_READABLE_USAGE_VERIFIED
C10_DEPLOYED=NO
```

## A. C8+C7 exact post-physical combined candidate

Before requesting any deployment, create a branch-local or temporary-worktree combined candidate from the exact accepted C7+C8 production lineage plus the two reviewed repairs above.

Mechanically preserve provenance. Do not silently resolve conflicts by discarding either repair.

Publish:

```text
COMBINED_BASE=
C8_REPAIR_PARENT=6d0b7f274e36872f5f70c89e4ff7f26746714378
C7_REPAIR_PARENT=641e358f7067d7e314e4f2c1eb18258690268cab
C8_C7_OVERLAP_FILES=
CONFLICT_FILES=
CONFLICT_RESOLUTION=
C8_ASSISTANT_REPAIR_PRESENT=
C7_OUTLOOK_REPAIR_PRESENT=
C7_WMO_REPAIR_PRESENT=
FIRMWARE_CHANGED=NO
```

Run all impacted deterministic gates, at minimum:

- backend full tests;
- shared tests;
- frontend typecheck/build;
- root lint;
- format check;
- Outlook connect path tests proving navigation-or-visible-error, never silent no-op;
- representative Open-Meteo WMO icon mapping tests;
- C8 voice transcript/coalescing tests;
- C8 mixed EN/JA setup tests;
- privacy/secret scan;
- `git diff --check`.

Build/freeze one ARM64 backend image and publish:

```text
POSTPHYSICAL_COMBINED_SOURCE=
POSTPHYSICAL_COMBINED_TAG=
POSTPHYSICAL_COMBINED_ARM64_IMAGE_ID=
POSTPHYSICAL_COMBINED_BUILD=PASS|FAIL
```

Because combined bytes differ from each separately reviewed repair, obtain one fresh independent review of the exact combined product bytes. Use Grok 4.6 for the combined C7+C8 candidate unless a stricter campaign-specific rule requires more.

```text
REVIEWER=grok_-m_grok-4.6
COMBINED_REVIEW=
P0=
P1=
P2=
SECURITY=
```

Automatically repair justified findings, rerun deterministic gates, refreeze, and repeat review. Do not stop at a review REVISE while safe repair remains.

Do not deploy the combined candidate under this directive.

## B. C10 must be useful, not merely safe

The user asked for Codex, AGY/Gemini and Grok subscription/token usage tiles. A version-only card that always reports unavailable usage is not a sufficient product outcome if safe supported local usage sources still exist to investigate.

Continue read-only/provider-neutral discovery with no model calls and no credential extraction.

### Codex

Inspect only supported local interfaces shipped with the installed Codex tooling, including help/status/app-server or other documented local RPC/status surfaces. Determine whether current-session token usage, rate-limit window usage, remaining percentage, or reset time is available in a machine-readable or safely parseable local form.

Do not copy or parse credential files. Do not call undocumented ChatGPT private web endpoints.

Publish:

```text
CODEX_CLI_VERSION=
CODEX_STATUS_SURFACE=
CODEX_APP_SERVER_OR_RPC_USAGE_SURFACE=
CODEX_SESSION_TOKEN_USAGE_AVAILABLE=
CODEX_SUBSCRIPTION_WINDOW_USAGE_AVAILABLE=
CODEX_RESET_AT_AVAILABLE=
CODEX_SELECTED_SOURCE=
```

### AGY / Gemini

Inspect AGY's own supported CLI help/status/quota surfaces first. AGY is not automatically equivalent to stock Gemini CLI.

If stock Gemini CLI is present, inspect supported `/stats model`, telemetry/status, or documented local surfaces without extracting OAuth material.

Publish:

```text
AGY_VERSION=
AGY_SUPPORTED_USAGE_OR_QUOTA_SURFACE=
AGY_SESSION_TOKEN_USAGE_AVAILABLE=
AGY_QUOTA_USAGE_AVAILABLE=
GEMINI_CLI_VERSION=
GEMINI_STATS_MODEL_SURFACE=
AGY_GEMINI_SELECTED_SOURCE=
```

### Grok

Inspect the installed Grok CLI's supported `usage`/session accounting surface and local persisted session statistics. Determine whether per-session input/output/total tokens and cost are machine-readable or can be parsed from a stable supported CLI output.

Do not scrape consumer web UI or browser cookies.

Publish:

```text
GROK_VERSION=
GROK_USAGE_SURFACE=
GROK_SESSION_TOKEN_USAGE_AVAILABLE=
GROK_SUBSCRIPTION_WINDOW_USAGE_AVAILABLE=
GROK_RESET_AT_AVAILABLE=
GROK_SELECTED_SOURCE=
```

### C10 acceptance hierarchy

For each tile independently, prefer:

1. supported subscription-window used/remaining + reset time;
2. supported current-session token counts;
3. supported local persisted session totals/cost;
4. explicit `Unavailable` only after all safe supported local surfaces are exhausted.

Never invent zeros or percentages.

If a supported interactive-only CLI output exists but is not machine-readable, a bounded parser may be considered only if the command is documented/stable, read-only, non-billable, shell-disabled, output-size capped, sanitized, and reviewed. Do not automate credential-bearing TUI/browser scraping.

Update C10 tests for any newly selected source. Preserve independent provider failures, stale-last-good state, strict allowlisting, sanitized child environment, shell-disabled execution, timeout/output limits and no credential exposure.

Any material C10 source change requires fresh security-focused Grok 4.6 review.

Do not deploy C10 under this directive.

## C. Decide whether C10 joins the next combined deployment

After C10 usefulness work is exhausted:

- If C10 provides at least one genuinely useful supported metric for at least one provider and the implementation remains isolated, compare its runtime/frontend files against the frozen C7+C8 post-physical candidate.
- If integration is low-risk, prepare a single final C7+C8+C10 deployable candidate and rerun all impacted tests plus one exact combined security review.
- If C10 would materially complicate or delay acceptance of the C7/C8 correctness repairs, keep C10 separate and request C7+C8 deployment first.
- Never force C10 into the release merely to avoid a second future deployment.

Publish the decision:

```text
C10_USEFULNESS_THRESHOLD_MET=
C10_JOIN_NEXT_DEPLOYMENT=YES|NO
C10_JOIN_REASON=
FINAL_NEXT_DEPLOYMENT_SOURCE=
FINAL_NEXT_DEPLOYMENT_TAG=
FINAL_NEXT_DEPLOYMENT_ARM64_IMAGE_ID=
FINAL_NEXT_DEPLOYMENT_REVIEW=
```

## D. Authority discipline

No action in this directive authorizes:

- production deployment/restart of changed bytes;
- another provider session;
- NOTE4 physical retest;
- firmware flash/reset/re-pair/Wi-Fi change;
- Microsoft OAuth consent/sign-in;
- Google OAuth consent;
- billing changes;
- credential creation/rotation/copying;
- private Outlook/Calendar content access;
- merge/release.

The currently running production backend should remain unchanged and healthy while this safe work executes.

## E. Long-run scheduling

Operate under `PORTFOLIO_FRONTIER_DRIVEN_LONGRUN`.

Safe combination, build, deterministic validation, review, CLI-capability inspection, parser hardening and branch-local integration are READY/READONLY_READY work and must be exhausted before controller return.

Do not stop at checkpoint pushes, test PASS, build PASS, reviewer PASS/REVISE, or recoverable tooling failures.

Before returning publish:

```text
PORTFOLIO_CURRENT_HEAD=

C8_C7_POSTPHYSICAL_COMBINED_SOURCE=
C8_C7_POSTPHYSICAL_COMBINED_IMAGE=
C8_C7_POSTPHYSICAL_COMBINED_REVIEW=
C8_C7_DEPLOYMENT_REQUIRED=
C8_C7_PHYSICAL_RETEST_REQUIRED=

C10_PR=4
C10_HEAD=
C10_CODEX_SELECTED_SOURCE=
C10_CODEX_METRICS_AVAILABLE=
C10_AGY_GEMINI_SELECTED_SOURCE=
C10_AGY_GEMINI_METRICS_AVAILABLE=
C10_GROK_SELECTED_SOURCE=
C10_GROK_METRICS_AVAILABLE=
C10_USEFULNESS_THRESHOLD_MET=
C10_JOIN_NEXT_DEPLOYMENT=
C10_TEST_STATUS=
C10_REVIEW_STATUS=
C10_DEPLOYED=NO

C9_STAGE=PARKED_RESEARCH_ONLY

PORTFOLIO_READY_NODE_COUNT=
PORTFOLIO_READONLY_READY_NODE_COUNT=
PORTFOLIO_WAITING_DEVICE_COUNT=
PORTFOLIO_WAITING_HUMAN_COUNT=
PORTFOLIO_EXTERNALLY_BLOCKED_COUNT=
PORTFOLIO_HUMAN_ACTION_REQUIRED=
PORTFOLIO_HUMAN_ACTION_REASON=
PORTFOLIO_TERMINAL_REASON=
PORTFOLIO_NEXT_ACTION=
```

Do not exit with any safe READY or READONLY_READY work remaining.

Keep PR #1, #2, #3 and #4 OPEN / DRAFT / UNMERGED.