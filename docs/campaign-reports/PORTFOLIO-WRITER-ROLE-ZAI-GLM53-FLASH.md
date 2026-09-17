# Portfolio writer-role change — Z.ai GLM 5.3 Flash

Date: 2026-09-11 (Australia/Perth)

This directive changes the implementation-writer role for future Slate campaign repair work. It does not alter any already-frozen/reviewed product artifact, production Gemini runtime/provider configuration, reviewer role, deployment authority, firmware-flash authority, OAuth scope, billing, credentials, merge or release state.

```text
CONTROLLER=CODEX_CLI
IMPLEMENTATION_WRITER_PROVIDER=Z.AI
IMPLEMENTATION_WRITER_MODEL=glm-5.3-flash
IMPLEMENTATION_WRITER_ROUTE=EXISTING_SUPPORTED_ZAI_GLm_5_3_FLASH_ROUTE
CANONICAL_REVIEWER=grok -m grok-4.6
SILENT_WRITER_FALLBACK=NO
SILENT_REVIEWER_FALLBACK=NO
AGY_GEMINI_3_8_FLASH_WRITER=RETIRED_FROM_NEW_WORK_UNLESS_OPERATOR_REAUTHORIZES
PRODUCTION_GEMINI_RUNTIME_CHANGED=NO
```

## Scope

Effective for new material implementation work after this checkpoint:

1. Codex remains controller/adjudicator.
2. Z.ai `glm-5.3-flash` is the sole implementation writer unless the operator explicitly changes the role again.
3. Grok 4.6 remains the canonical independent reviewer.
4. Existing exact reviewed C7/C8 backend and firmware artifacts remain valid and must not be invalidated, rebuilt or rewritten merely because the writer role changed after their freeze/review.
5. Deployment/flash of already-reviewed exact artifacts does not require reimplementation by the new writer.

## Z.ai availability/auth gate

Before the first new writer task, use only the already-authorized existing Z.ai setup/session. Do not expose secrets.

If Z.ai `glm-5.3-flash` cannot be invoked because of auth/session/device/provider infrastructure:

```text
WRITER_STATUS=BLOCKED_ZAI_GLM_5_3_FLASH
SILENT_SUBSTITUTE=NO
```

Do not silently use AGY/Gemini, another GLM model, OpenRouter, or another writer. Report the exact safe failure boundary and continue any independent non-writer safe work.

This directive does not authorize creation of new credentials, billing changes, provider-account changes or secret copying.

## Standard material-repair loop from this point forward

```text
Codex adjudication
-> Z.ai glm-5.3-flash minimum justified implementation
-> deterministic tests
-> impacted typecheck/lint/format/build
-> privacy/secret scan
-> git diff --check
-> exact source/artifact freeze
-> fresh grok -m grok-4.6 review
```

Grok REVISE returns to Codex adjudication and then Z.ai `glm-5.3-flash` for the minimum justified repair.

## Current frozen C7/C8 frontier

The writer-role change is prospective only. Preserve the already-reviewed current candidate identities recorded in `CAMPAIGN-STATE.md` and `PORTFOLIO-C7-C8-POSTDEPLOY-PHYSICAL-FAILURES-INGESTION-RESULT.md`.

Do not modify/rebuild current reviewed backend or firmware bytes solely to make them appear as Z.ai-authored work.

All PRs remain OPEN / DRAFT / UNMERGED unless the operator explicitly authorizes otherwise.
