# Portfolio long-run multicampaign scheduler

Date: 2026-09-11 (Australia/Perth)

## Purpose

Generalize the existing C7/C8/C9 portfolio controller into a lane-based scheduler
that remains correct as Campaign 10 and future explicitly-created campaigns are
added.

This is a control-plane directive only. It grants no deployment, provider call,
OAuth/credential/billing/private-data action, firmware flash, NOTE4 reset,
re-pair, Wi-Fi change, merge or release authority.

Preserve the existing campaign-specific authority contracts, including:

- `PORTFOLIO-LONGRUN-CONTROLLER-C7-C8-C9.md`;
- `AUTONOMY-AND-HUMAN-GATE-POLICY.md`;
- `REPORT-PUSH-INVARIANT.md`;
- the exact live `CAMPAIGN-STATE.md`;
- all campaign-specific reviewer/model/provider/physical-action constraints.

## Core scheduler invariants

```text
PORTFOLIO_MODE=PORTFOLIO_FRONTIER_DRIVEN_LONGRUN
BLOCKED_LANE_DOES_NOT_STOP_PORTFOLIO=YES
EXHAUSTED_LANE_DOES_NOT_SPIN=YES
INDEPENDENT_SAFE_WORK_CONTINUES=YES
CHECKPOINT_PUSH_IS_NOT_A_STOP=YES
REVIEW_PASS_IS_NOT_A_STOP=YES
REVIEW_REVISE_IS_NOT_A_STOP_WHILE_SAFE_REPAIR_EXISTS=YES
RECOVERABLE_INFRA_FAILURE_IS_NOT_A_STOP_WHILE_OTHER_SAFE_LANES_EXIST=YES
EXTERNAL_RETRY_IS_BOUNDED=YES
NO_SCOPE_CREATION_TO_AVOID_IDLE=YES
NO_UNAUTHORIZED_PROVIDER_OR_PRIVATE_DATA_PROBES_TO_AVOID_IDLE=YES
REPORT_PUSH_INVARIANT=REQUIRED
```

A campaign being blocked on a reviewer, device, deployment authority, provider
authority, OAuth/private-data authority or another genuine gate must not erase
READY or READONLY_READY work in another independent campaign.

Conversely, an exhausted or intentionally parked campaign must not be reopened
merely so the controller can appear busy. Reopen only when there is a genuine
new in-scope capability/evidence change or explicit operator direction.

## Live reconciliation at every scheduling cycle

Before choosing work, mechanically reconcile every active campaign lane against
live GitHub rather than copying stale state from an older aggregate block.

For every lane publish at least:

```text
CAMPAIGN_ID=
PR_NUMBER=
PR_HEAD=
PR_STATE=
PR_DRAFT=
PR_MERGED=
STAGE=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
NEXT_ACTION=
```

The aggregate portfolio counts are sums/classifications of the reconciled
lane-local frontiers. Do not set aggregate READY/READONLY to zero merely
because the currently highest-priority lane is blocked.

## Scheduling order

On each controller pass:

1. reconcile all explicitly active campaign PR heads and state;
2. enumerate lane-local READY and READONLY_READY nodes;
3. execute the highest-value safe deterministic/read-only node that does not
   require new authority;
4. continue automatically through tests, builds, bounded safe repairs, review
   preparation, checkpoint pushes and other pre-authorized reversible work;
5. if that lane reaches a human/external gate, immediately inspect the other
   lanes for independent READY/READONLY_READY work;
6. only report a portfolio-level stop when every lane is either exhausted,
   intentionally parked, human-gated, externally blocked, or outside authority;
7. never invent a new campaign, provider experiment, credential action or
   private-data probe simply to prevent an idle portfolio.

Priority is based on user-visible correctness/risk and dependency value, not on
PR number. A lane with an unresolved production regression normally outranks an
optional feature lane, but a blocked regression lane does not prevent useful
safe work elsewhere.

## Current live lanes entering this directive

Reconcile again before execution; the following are the expected heads before
this directive is pushed:

```text
C7_PR=1
C7_HEAD=641e358f7067d7e314e4f2c1eb18258690268cab
C7_PR_STATE=OPEN_DRAFT_UNMERGED

C8_PR=2
C8_HEAD_BEFORE_THIS_DIRECTIVE=6edfb893799bb97cc3c63ef15bfee0eb8f33c66c
C8_PR_STATE=OPEN_DRAFT_UNMERGED

C9_PR=3
C9_HEAD=61700ea8c5b7755aa39259a45554289ca01ff700
C9_PR_STATE=OPEN_DRAFT_UNMERGED

C10_PR=4
C10_HEAD=e9a6cfac86c63cb461a62d5029080332fac06865
C10_PR_STATE=OPEN_DRAFT_UNMERGED
```

Future campaigns enter this scheduler only after they actually exist and are
within operator-approved scope. Do not create C11/C12/etc. merely because the
current lanes are blocked or exhausted.

## Current C7/C8 lane: safe artifact-identity recovery remains

The current top aggregate state classifies C7/C8 as externally blocked on
artifact identity plus canonical Grok review. That classification is too broad.

The source repair remains:

```text
C7_C8_REPAIR_SOURCE=553ad71932a8036a6f6dfe34794052eb4e573b10
C7_C8_TAG=slate:c7-c8-glyph-outlook-repair-d8
PRODUCT_BYTES_CHANGED_SINCE_REPAIR_FREEZE=NO_REPORTED_CHANGE
```

However the currently recorded purported image identity:

```text
sha256:23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c
```

contains only 63 hexadecimal characters after `sha256:` and therefore cannot
be treated as a valid Docker image SHA-256 identity. Do not guess the missing
nibble and do not restore any prior trailing character without mechanical
proof.

Artifact reconstruction/verification is safe provider-disabled local work and
therefore counts as a READY node before the reviewer block.

Required recovery:

1. reconcile exact repair source `553ad719...` and confirm no product-byte drift;
2. rebuild/freeze the exact linux/arm64 candidate using the established build
   process without provider calls or production deployment;
3. capture the actual resulting image ID/digest mechanically;
4. require exactly 64 lowercase/uppercase hexadecimal characters after
   `sha256:` and record the exact value;
5. if multiple Docker identity forms exist, distinguish image ID, manifest
   digest and transferred/load representation rather than claiming equality;
6. rerun the already-required deterministic impacted gates if the rebuild or
   environment requires them; no product-source mutation solely to make an
   image digest match an old report;
7. update the durable report and `CAMPAIGN-STATE.md` with the newly proven exact
   artifact identity;
8. only then submit the exact frozen source/artifact to the canonical reviewer.

While this artifact recovery is executable:

```text
C7_C8_READY_NODE_COUNT>=1
C7_C8_EXTERNALLY_BLOCKED_COUNT=0_FOR_ARTIFACT_RECOVERY
```

After a valid artifact is frozen, the reviewer may become the sole remaining
external block.

Canonical review remains:

```text
REVIEWER=grok_-m_grok-4.6
REVIEW_FALLBACK=NONE
```

Do not treat inspection without terminal verdict as PASS. If Grok returns
REVISE, use Codex adjudication -> AGY `gemini-3.8-flash-high` minimum repair ->
impacted tests -> privacy/secret scan -> exact refreeze -> fresh Grok 4.6
review. If the canonical reviewer remains unavailable after bounded retries,
mark only this lane externally blocked and continue other independent lanes.

No deployment authority is granted. If exact Grok review later returns PASS
with no blocking findings, the next C7/C8 human request should be the narrowest
exact backend/shared/frontend deployment authority for the reviewed artifact.
Do not bundle firmware flash, provider calls, OAuth consent, private data, C10,
C9, merge or release unless separately justified and authorized.

## Current C8 glyph subnode

Preserve the consumed physical evidence and the current provider-disabled
conclusion:

```text
C8_JAPANESE_GLYPH_INTEGRITY=FAIL
C8_BACKEND_UTF8_CODEPOINT_PRESERVATION=PASS_PROVIDER_DISABLED
C8_FIRMWARE_UTF8_DECODER_PRESERVATION=PASS_HOST_REPLAY
C8_VOICE_FONT_DIRECT_U+306E=YES
C8_U+3107_IN_EFFECTIVE_CMAPS=NO
C8_GLYPH_ROOT_CAUSE=UNRESOLVED_DEPLOYED_FIRMWARE_RENDER_OR_UPSTREAM_CODEPOINT
C8_FIRMWARE_CHANGE_REQUIRED=NO_JUSTIFIED_CHANGE_FROM_CURRENT_EVIDENCE
```

Do not invent a font/firmware repair and do not flash. If future exact evidence
creates a justified firmware candidate, it must be built, tested, privacy
checked, frozen and independently reviewed before a separate flash authority
request.

## Current C9 lane

Campaign 9 remains intentionally parked research-only. Its current research did
not justify replacing the accepted production Gemini/Vertex architecture.
Developer API OAuth/ADC production experimentation crosses project/OAuth,
provider/privacy/billing or deployment authority boundaries depending on the
exact experiment.

Therefore:

```text
C9_STAGE=PARKED_RESEARCH_ONLY
C9_READY_NODE_COUNT=0
C9_READONLY_READY_NODE_COUNT=0
C9_REOPEN_ON_BUSYWORK=NO
```

Do not repeat exhausted documentation/probe work. Reopen only if the operator
explicitly authorizes the next experiment or a genuinely new documented safe
capability materially changes the research conclusion within existing authority.

## Current C10 lane

Campaign 10 remains isolated, reviewed and not deployed. Safe supported local
usage-metric discovery was exhausted without proving useful machine-readable
subscription-window/current-session metrics for the requested providers.

Therefore:

```text
C10_STAGE=ISOLATED_USAGE_TILES_REVIEWED_NOT_DEPLOYED
C10_READY_NODE_COUNT=0
C10_READONLY_READY_NODE_COUNT=0
C10_USEFULNESS_THRESHOLD_MET=NO
C10_DEPLOYED=NO
C10_REOPEN_ON_UNSAFE_PROBE=NO
```

Do not scrape browser cookies, credential files, undocumented private web
endpoints or make billable/model calls simply to improve the cards. A future
separate deployment is an explicit human authority decision, and new metric
work should reopen only on a supported safe data surface or explicit new scope.

## External infrastructure policy

An external reviewer/tool outage is lane-local.

- Use bounded retries appropriate to the failure class.
- Do not tight-loop or consume model/provider budget indefinitely.
- Do not silently substitute reviewer/model/provider/auth routes.
- Record the exact failure class and last successful boundary.
- Continue another independent READY/READONLY_READY lane if one exists.
- If no other lane has safe work, an aggregate `EXTERNALLY_BLOCKED_COUNT > 0`
  stop is legitimate and `HUMAN_ACTION_REQUIRED` remains NO unless the remedy
  actually requires the operator.

## Human authority boundaries remain lane-local

The scheduler does not create authority. Explicit human approval remains
required where applicable for:

- changed production artifact deployment;
- firmware flash or changed firmware bytes;
- new provider/model/auth/credential/billing scope;
- OAuth consent or project/account changes;
- private Calendar/Outlook or other private-data scope expansion;
- physical NOTE4 interaction when it is the sole remaining useful node;
- merge/release.

A human gate in one lane must not block unrelated safe work elsewhere.

## Required aggregate frontier

Before controller exit, publish both lane-local state and aggregate state:

```text
PORTFOLIO_CURRENT_HEAD=
PORTFOLIO_CURRENT_PRIORITY=
PORTFOLIO_ACTIVE_CAMPAIGNS=

C7_PR_HEAD=
C7_STAGE=
C7_READY_NODE_COUNT=
C7_READONLY_READY_NODE_COUNT=
C7_WAITING_DEVICE_COUNT=
C7_WAITING_HUMAN_COUNT=
C7_EXTERNALLY_BLOCKED_COUNT=
C7_CURRENT_BLOCKED_NODE=
C7_NEXT_ACTION=

C8_PR_HEAD=
C8_STAGE=
C8_READY_NODE_COUNT=
C8_READONLY_READY_NODE_COUNT=
C8_WAITING_DEVICE_COUNT=
C8_WAITING_HUMAN_COUNT=
C8_EXTERNALLY_BLOCKED_COUNT=
C8_CURRENT_BLOCKED_NODE=
C8_NEXT_ACTION=

C9_PR_HEAD=
C9_STAGE=
C9_READY_NODE_COUNT=
C9_READONLY_READY_NODE_COUNT=
C9_WAITING_HUMAN_COUNT=
C9_EXTERNALLY_BLOCKED_COUNT=
C9_NEXT_ACTION=

C10_PR_HEAD=
C10_STAGE=
C10_READY_NODE_COUNT=
C10_READONLY_READY_NODE_COUNT=
C10_WAITING_HUMAN_COUNT=
C10_EXTERNALLY_BLOCKED_COUNT=
C10_NEXT_ACTION=

PORTFOLIO_READY_NODE_COUNT=
PORTFOLIO_READONLY_READY_NODE_COUNT=
PORTFOLIO_WAITING_DEVICE_COUNT=
PORTFOLIO_WAITING_HUMAN_COUNT=
PORTFOLIO_EXTERNALLY_BLOCKED_COUNT=
PORTFOLIO_CURRENT_BLOCKED_NODE=
PORTFOLIO_HUMAN_ACTION_REQUIRED=
PORTFOLIO_HUMAN_ACTION_REASON=
PORTFOLIO_TERMINAL_REASON=
PORTFOLIO_NEXT_ACTION=
```

Do not exit with aggregate READY or READONLY_READY greater than zero unless a
higher-order safety/authority conflict mechanically prevents execution.

A valid aggregate stop is one of:

1. all active lanes are exhausted or intentionally parked;
2. all unfinished lanes are at genuine human authority boundaries;
3. all unfinished lanes are externally blocked after bounded retry;
4. a higher-order safety conflict prevents otherwise-safe work.

Never use a blocked lane as shorthand for the state of the entire portfolio.

Keep PR #1, PR #2, PR #3, PR #4 and any future campaign PRs OPEN / DRAFT /
UNMERGED unless the operator explicitly authorizes merge/release.
