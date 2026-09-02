# Campaign 8D1L — Gemini 3.1 Live production-readiness audit

Date: 2026-09-02 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
Prerequisite: 8D1K exact non-production adapter E2E PASS.

## Objective

Turn a successful exact non-production Node Live adapter result into a production-readiness decision without deploying, restarting production, changing billing, or changing the production Gemini model/auth mode.

## Routing

- controller: Luna;
- worker: Sonnet 4.6 for bounded readiness fixes/documentation only;
- reviewer: GLM-5.3-Flash read-only final readiness review;
- repository integrator/validator/sole writer: Codex.

## Audit areas

1. Re-run complete backend/shared tests, lint, typecheck, format, frontend build, diff check, and secret scan against the exact proposed production artifact.
2. Rebuild the ARM64 production image reproducibly without any credential in build context/layers.
3. Verify the image contains the required pinned Node runtime/bridge artifact and current Bun backend runtime, but contains no Gemini credential.
4. Confirm runtime secret injection design is read-only and host-local.
5. Verify the Node Live boundary is not publicly reachable and cannot be accessed by NOTE4/client traffic directly.
6. Verify current production rollback image and exact rollback procedure.
7. Verify current production health before any future deployment.
8. Verify default/rollback behavior if the Node bridge fails to start, crashes, times out, or loses Gemini connectivity.
9. Review Google’s then-current Developer API free-tier quota and data-use/privacy language from official sources. Separate current policy from earlier observed project behavior.
10. Produce a deployment matrix with exact proposed environment/config changes, exact model, image SHA, rollback image SHA, secret mount shape, health gates, smoke tests, and rollback triggers.
11. GLM-5.3-Flash reviews the exact final diff, deployment plan, secret boundary, failure behavior, and test evidence. Luna adjudicates findings; Sonnet 4.6 may correct bounded issues; revalidate afterward.

## No production mutation

This campaign may build and inspect a candidate image but must not load/start it on the production Orange Pi service, alter production env/config, restart production, move/copy the protected key into a new location, enable billing/Vertex, flash firmware, or merge PR #2.

## Successful state

```text
CAMPAIGN=8D1L
STATUS=READY_FOR_HUMAN_PRODUCTION_DECISION
PROPOSED_IMAGE_SHA=<...>
ROLLBACK_IMAGE_SHA=<...>
SECRET_IN_IMAGE=NO
NODE_BOUNDARY_PUBLIC=NO
FULL_TESTS=PASS
GLM53_REVIEW=PASS
READY_FOR_PRODUCTION_DEPLOYMENT_REVIEW=YES
READY_FOR_HUMAN_PRODUCTION_API_KEY_AND_DATA_POLICY_DECISION=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_ACCEPT_OR_REJECT_CURRENT_GEMINI_DATA_POLICY_AND_AUTHORIZE_OR_REJECT_8D1M_DEPLOYMENT
```

Stop there.

## Hard stops

Unresolved P0/P1; credential exposure; key in image/build context; inability to rollback; production health drift; billing/Vertex requirement; data-policy ambiguity that cannot be stated clearly; firmware or merge requirement.
