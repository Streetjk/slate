# Campaign 8D1I–8D1M — Multi-campaign Gemini Live recovery and rollout sequence

Date: 2026-09-02 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
Starting evidence: overnight checkpoint `6f5de7fe1fe86289cca99d83a02fd944f0c87d55`

## Current evidence

- final reviewed 8D1E implementation: `4bfce037b2d206dbabca9ab905301c088a0c1f01`;
- GLM-5.3-Flash PASS, 0 P0/P1/P2;
- 297 backend tests + 6 shared tests and all deterministic gates PASS;
- Node minimal official JS SDK Live call PASS with model event + turn complete;
- Bun minimal official JS SDK Live call TIMEOUT with no sanitized result;
- 2 of the prior 6 overnight provider-call budget were consumed;
- no production mutation, no private data, billing OFF, Vertex disabled.

## Runtime conclusion guiding the sequence

Treat Bun compatibility as the current uncertainty, not Gemini 3.1 model availability. The production Slate application is intentionally Bun-based, while the current official Google Gen AI JS SDK documents Node.js support. Therefore prefer a narrow supported Node boundary for Gemini Live over a whole-backend runtime migration or raw protocol duplication unless Campaign 8D1I proves otherwise.

## Fixed routing

- controller: Luna;
- worker: Sonnet 4.6;
- independent reviewer: GLM-5.3-Flash via the configured ZAI profile, read-only;
- repository integrator/validator/sole writer: Codex;
- no silent role/model substitution.

## Sequence

### 8D1I — Runtime boundary decision

Directive: `docs/campaign-reports/08D1I-NODE-LIVE-BOUNDARY-DECISION.md`

Run automatically now. No provider calls. Finish with an explicit selected architecture and interface contract.

### 8D1J — Node Live bridge implementation

Directive: `docs/campaign-reports/08D1J-NODE-LIVE-BRIDGE-IMPLEMENTATION.md`

If 8D1I selects a safe narrow boundary, continue automatically into 8D1J. Implement, fully test, secret-scan, and obtain GLM-5.3-Flash review. No provider calls. Stop if P0/persistent P1 or architecture invariants fail.

### 8D1K — Exact non-production provider E2E

Directive: `docs/campaign-reports/08D1K-NODE-LIVE-NONPROD-E2E.md`

Human gate. Do not make a new Gemini provider call until the user explicitly authorizes 8D1K after reviewing the 8D1J checkpoint. Once authorized, maximum 3 new Live sessions, synthetic-only, no blind retry.

If 8D1K passes and no source correction remains unreviewed, continue automatically to 8D1L.

### 8D1L — Production-readiness audit

Directive: `docs/campaign-reports/08D1L-PRODUCTION-READINESS-AUDIT.md`

No production mutation. Build/inspect the exact candidate image, verify rollback and secret boundary, re-check current Google policy, run full gates and GLM final review. Stop at `READY_FOR_HUMAN_PRODUCTION_DECISION`.

### 8D1M — Production deployment + physical NOTE4 E2E

Directive: `docs/campaign-reports/08D1M-PRODUCTION-DEPLOYMENT-AND-PHYSICAL-E2E.md`

Prepared future directive only. Requires explicit human authorization covering current Gemini data policy, production API-key use, exact image/rollback hashes, and production deploy/restart. Firmware remains a separate exact-artifact authorization boundary. PR #2 merge remains separate.

## Controller liveness

Within authorized stages use:

`fetch/reconcile remote -> recompute exact stage -> inspect current health/state -> bounded worker if useful -> Codex integrate/validate -> GLM-5.3-Flash review where required -> Luna adjudication -> bounded correction -> full revalidation -> durable report/state checkpoint -> selective commit -> push -> verify remote -> continue automatically`

Do not stop merely because research or deterministic implementation is tedious. Stop only at a documented human/hard boundary.

## Global hard stops

- credential exposure/suspected exposure;
- billing attachment/change;
- Vertex enablement/model calls;
- private NOTE4/Outlook/Calendar data in synthetic validation;
- Outlook write capability;
- Calendar write without physical confirmation;
- production mutation before 8D1M explicit authorization;
- firmware flash without exact-artifact authorization;
- Campaign 6D / PR #1 / PR #3 / unrelated work;
- unresolved P0 or persistent P1;
- unsafe repo/storage state;
- PR #2 merge without authorization.

## Immediate authorized execution scope

Campaigns 8D1I and 8D1J are authorized to run autonomously because they require no new Gemini provider calls and no production mutation.

Campaign 8D1K is NOT authorized by this planning directive. Stop after 8D1J with the exact checkpoint and request explicit 8D1K provider-call authorization.
