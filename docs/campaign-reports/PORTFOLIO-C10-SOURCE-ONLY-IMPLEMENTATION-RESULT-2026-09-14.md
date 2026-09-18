# Portfolio C10 Source-Only Implementation Result — 2026-09-14

## Scope and decision

This report records the reviewed C10 source-only implementation on PR #4.
The required provider scope is Codex, AGY/Gemini, and Claude. Grok is additive
and does not replace Claude.

The technical lead selected the minimum honest slice: expose local CLI
capability/source/freshness/availability metadata, preserve explicit
unsupported and unavailable states, keep quota and session metrics null when
no supported machine-readable source exists, and isolate provider failures.
No provider usage or quota endpoint was called.

The preferred Z.ai glm-5.3-flash route was structurally unavailable in this
environment. Grok explicitly assigned Codex as the temporary implementation
writer under the existing operator-authorized fallback. No other writer,
provider, model, account, credential, or billing path was used.

## Implemented

Source commit:

`965f1a605ff47b64dee20b36c68597db5760b46f`

Source tree:

`d3bd58c1b54062e8ad7aea76ac4c136dee699dbc`

Changed product paths:

- `backend/src/modules/ai-usage/ai-usage.types.ts`
- `backend/src/modules/ai-usage/ai-usage.service.ts`
- `backend/src/modules/ai-usage/ai-usage.service.test.ts`
- `frontend/src/features/ai-usage/query/ai-usage-queries.ts`
- `frontend/src/features/ai-usage/components/AiUsageSection.tsx`
- `frontend/src/features/ai-usage/presentation.ts`
- `frontend/src/features/ai-usage/presentation.test.ts`

The implementation uses only bounded `--version` probes with `execFile`,
`shell=false`, a safe working directory, and a PATH-only child environment.
Version presence is not treated as quota. The UI distinguishes version
probe, sanitized metrics, and no source; it renders unavailable metrics
honestly rather than inventing numbers.

Unknown fields are bounded and fail closed for sensitive/private,
credential-like, prototype, nested, malformed, URL-shaped, and unsafe values.
Safe documented scalar fields remain available for a future sanitized local
collector. Stale data can only derive from a prior actual sanitized metrics
card, never from a capability-only probe.

## Qualification

- C10 backend focused: 18 pass, 0 fail.
- C10 frontend focused: 3 pass, 0 fail.
- Full backend suite: 418 pass, 5 documented skips, 0 fail.
- Backend and frontend typecheck: pass.
- Backend and frontend lint: pass.
- Prettier check: pass.
- Frontend production build: pass.
- Runtime-source privacy/secret scan: pass.
- `git diff --check`: pass.

The five backend skips are the repository's documented live Node/Gemini
differential tests; no live provider call was introduced by C10.

## Exact review

The first fresh security review returned `REVISE` for source-label collapse
and insufficient proof that sensitive unknown keys were rejected. Grok then
selected the surgical correction. The corrected candidate received a fresh
separate exact-source review:

```text
VERDICT=PASS
P0=0
P1=0
P2=0
SECURITY=allowlisted --version probes only; no provider calls, quota scraping,
credentials, billing, OAuth, deployment, or NOTE4
REVIEWED_SOURCE_SHA=965f1a605ff47b64dee20b36c68597db5760b46f
REVIEWED_PROVIDER_SCOPE=required codex, agy_gemini, claude; additive grok
REQUIRED_FOLLOWUP=none
```

Review scope covered the changed backend/frontend AI-usage paths, source and
availability semantics, provider isolation, unknown-field privacy boundary,
null metrics, and UI state mapping. The review PASS is a development
qualification result and does not grant deployment authority.

## Frozen artifacts and authority boundary

`FINAL_REPAIR_SOURCE=965f1a605ff47b64dee20b36c68597db5760b46f`

`FINAL_SOURCE_TREE=d3bd58c1b54062e8ad7aea76ac4c136dee699dbc`

`BACKEND_CHANGED=YES`

`FINAL_BACKEND_IMAGE_ID=NOT_BUILT_SOURCE_ONLY`

`FINAL_BACKEND_PLATFORM=NOT_APPLICABLE`

`FRONTEND_ARTIFACT=LOCAL_BUILD_VERIFIED_NOT_FROZEN_FOR_DEPLOYMENT`

`FIRMWARE_CHANGED=NO`

`FINAL_FIRMWARE_BIN_SHA256=NOT_CHANGED`

`FINAL_FIRMWARE_BIN_BYTES=NOT_CHANGED`

`FINAL_FIRMWARE_ELF_ID=NOT_CHANGED`

`FINAL_FONT_ID=NOT_CHANGED`

`FINAL_COLLECTOR_ID=NOT_APPLICABLE_TO_C10`

`LOCKFILE_SHA256=bun.lock:781b1b6fd546e8fa0e78c40414b3e5e206ba9269daeca0baaabf1d2365467078`

No deployment, restart, firmware flash, physical NOTE4 interaction, provider
configuration, OAuth, credential, billing, C9/C10 activation, merge, or
release was performed. PR #4 remains the only branch changed by this C10
implementation; all campaign PRs remain open, draft, and unmerged.

## Next authority boundary

The next action is a separate exact application artifact build/freeze and
deployment-approval decision for the repaired source. This report does not
request or perform deployment. Production quota data remains unsupported
until a separately reviewed, safe machine-readable source is authorized and
implemented.
