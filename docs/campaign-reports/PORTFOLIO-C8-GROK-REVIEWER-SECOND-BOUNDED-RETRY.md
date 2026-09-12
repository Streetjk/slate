# Portfolio C8 Grok reviewer second bounded retry

Date: 2026-09-11 (Australia/Perth)

## Purpose

Authorize exactly one additional canonical Grok 4.6 review attempt after the reviewer recovery checkpoint proved that the Grok CLI, existing session/auth state, and exact `grok-4.6` model are healthy.

This is a reviewer-harness authority only. It grants no Slate product runtime change, deployment, firmware flash, NOTE4 device action, provider call, OAuth/credential/billing/private-data action, merge, or release authority.

## Controlling evidence

The latest recovery result established:

```text
GROK_CLI_PRESENT=YES
GROK_CLI_VERSION=1.0.25 (f7e67d6988e2) [stable]
GROK_MODEL_SELECTION_ACCEPTED=YES_HEALTHCHECK
GROK_AUTH_STATE=EXISTING_SESSION_OPERATIONAL_FOR_HEALTHCHECK
GROK_TRIVIAL_NONREPO_HEALTHCHECK=PASS
GROK_TRIVIAL_HEALTHCHECK_OUTPUT=REVIEWER_HEALTH=PASS
GROK_REAL_REVIEW_ATTEMPTED=YES
GROK_REVIEW_TERMINAL=TIMEOUT
GROK_REVIEW_VERDICT=UNKNOWN_NO_TERMINAL_VERDICT
GROK_FAILURE_CLASS=REVIEW_HARNESS_OR_CONTROLLER_LIMIT
```

The canonical frozen candidate remains:

```text
SOURCE=553ad71932a8036a6f6dfe34794052eb4e573b10
ARM64_IMAGE=sha256:23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c4
PRODUCT_RUNTIME_CHANGED_SINCE_FREEZE=NO_REPORTED_CHANGE
```

## Diagnosis

Do not classify the current state as an xAI/Grok service outage unless a fresh minimal exact-model healthcheck now fails.

The prior bounded real review used a focused package of approximately 1,219 changed lines across 23 runtime paths with a 120,000 ms wall-clock timeout. Since the exact-model healthcheck passed and the real review timed out without a terminal block, wall-clock budget and/or review-package execution behavior remain the most likely failed boundary.

## Authorized retry

Exactly one additional canonical full-review attempt is authorized.

Before spending it:

1. reconcile live PR #2 and confirm no product-runtime byte drift from source `553ad719...`;
2. run the existing harness tests and fail closed if they do not pass;
3. preserve shell-free invocation, exact source/image binding, strict single-verdict parsing, no reviewer fallback, and no secret/private payload exposure;
4. do not expand the review package beyond the existing focused runtime scope unless mechanically necessary;
5. keep the reviewer tool/web denied if the complete evidence bundle is provided directly;
6. preserve the exact reviewer `grok -m grok-4.6`.

For this one retry, increase only the wall-clock allowance to a realistic bounded value:

```text
REVIEW_HARNESS_MAX_TURNS=2
REVIEW_HARNESS_TIMEOUT_MS=300000
REVIEW_HARNESS_OUTPUT_CAP=BOUNDED
REVIEWER=grok_-m_grok-4.6
REVIEW_FALLBACK=NONE
```

Do not simply increase max turns. The purpose is to allow the already-bounded no-tool review enough wall-clock time to finish reasoning and emit its terminal verdict.

The terminal contract remains exactly one block equivalent to:

```text
VERDICT=PASS
P0=<n>
P1=<n>
P2=<n>
SECURITY=<n>
```

or:

```text
VERDICT=REVISE
P0=<n>
P1=<n>
P2=<n>
SECURITY=<n>
```

Missing, duplicate, malformed, timeout, crash, or post-exit output must remain fail-closed and must not be interpreted as PASS.

## Result handling

If the canonical retry returns PASS with:

```text
P0=0
P1=0
P2=0
SECURITY=0
```

then:

- publish the exact reviewer evidence and reviewed source/image identities;
- update `CAMPAIGN-STATE.md`;
- continue safe deterministic bookkeeping automatically;
- stop only at the smallest human authority boundary for exact combined C7+C8 backend/shared/frontend deployment;
- do not deploy automatically.

If it returns REVISE:

```text
Codex adjudication
-> AGY gemini-3.8-flash-high minimum justified repair
-> impacted deterministic tests
-> typecheck/lint/format/build where applicable
-> privacy/secret scan
-> git diff --check
-> exact source/artifact refreeze
-> fresh canonical Grok 4.6 review
```

Continue automatically while safe READY/READONLY_READY work remains.

If it again times out with the 300,000 ms wall-clock budget while the trivial exact-model healthcheck remains healthy:

- do not call the reviewer unavailable;
- classify the failure as `REVIEW_PACKAGE_OR_CLI_SESSION_COMPLETION_FAILURE`;
- do not spend another full-review retry immediately;
- use zero-provider/local evidence to identify whether the CLI buffers final output, whether the prompt package is too large, or whether a smaller SHA-bound evidence manifest can preserve independent review quality;
- publish the exact earliest failed boundary;
- do not deploy without a terminal canonical PASS.

## Portfolio constraints

C7 remains deferred to the selected combined C7+C8 path.
C9 remains parked research-only.
C10 remains isolated/reviewed/not deployed.

Do not manufacture work in parked lanes merely because this review lane is blocked.

No authorization is granted for:

- production deployment;
- firmware flash;
- NOTE4 reset/re-pair/Wi-Fi change;
- Gemini/provider call;
- provider/model/auth changes;
- credentials;
- OAuth consent;
- billing;
- Outlook/Calendar private-data expansion;
- C9 activation;
- C10 deployment;
- merge/release.

Keep PRs #1, #2, #3 and #4 OPEN / DRAFT / UNMERGED.

Before controller exit, durably publish lane-local and aggregate frontier fields, including the exact review attempt outcome and the next true authority/blocking boundary.