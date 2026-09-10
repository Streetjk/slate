# Campaign 8D1M — Human Free-Tier Data-Policy Acceptance

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Human decision

The human explicitly accepts, for now, the privacy/data-use risks documented in the completed 8D1L audit for use of the Gemini Developer API / free-tier service with NOTE4 production voice/user content.

The human understands and accepts the 8D1L-reported policy risk that unpaid/free-tier submitted content and responses may be used by Google to provide, improve, or develop products and machine-learning technologies and may be processed by human reviewers.

```text
CAMPAIGN=8D1M
CURRENT_GEMINI_FREE_TIER_DATA_POLICY_ACCEPTED=YES
PRIVATE_NOTE4_CONTENT_POLICY_RISK_ACCEPTED=YES_FOR_CURRENT_FREE_TIER
PAID_TIER_REQUIRED=NO_FOR_NOW
BILLING_CHANGE_AUTHORIZED=NO
PRODUCTION_DEPLOYMENT_AUTHORIZED=NO
PRODUCTION_RESTART_AUTHORIZED=NO
PRODUCTION_ENV_MUTATION_AUTHORIZED=NO
PROTECTED_CREDENTIAL_PRODUCTION_USE_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

## Scope

This checkpoint clears only the human data-policy acceptance portion of the 8D1M prerequisite.

It does **not** by itself authorize:

- production deployment or restart;
- loading or mutating production environment/configuration;
- use of the protected Gemini credential in production;
- billing/tier or Vertex changes;
- firmware flashing;
- PR #2 merge;
- destructive host/storage/database work.

A separate explicit human authorization is still required before 8D1M production deployment/restart begins.

The existing reviewed candidate, rollback image, source lineage, G17 accounting, and PR-open/draft/unmerged requirements remain unchanged.
