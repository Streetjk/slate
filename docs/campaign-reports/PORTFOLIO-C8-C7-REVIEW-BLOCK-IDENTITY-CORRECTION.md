# Portfolio C8+C7 review-block identity correction

Date: 2026-09-11 (Australia/Perth)

## Purpose

Preserve exact artifact identity and prevent a documentation typo from contaminating the next deployment-authority boundary while the canonical Grok 4.6 review remains externally blocked.

This directive grants no deployment, firmware flash, provider call, physical NOTE4 action, reset, re-pair, Wi-Fi change, OAuth/credential/private-data action, merge or release authority.

PR #2 must remain OPEN / DRAFT / UNMERGED.

## Live activation context

```text
LIVE_PR2_HEAD_AT_ACTIVATION=0c0d160af45273cd8f61a08f17e89cc50378c3fb
REPAIR_SOURCE=553ad71932a8036a6f6dfe34794052eb4e573b10
POSTPHYSICAL_COMBINED_SOURCE=553ad71932a8036a6f6dfe34794052eb4e573b10
POSTPHYSICAL_COMBINED_TAG=slate:c7-c8-glyph-outlook-repair-d8
CANONICAL_ARM64_IMAGE_ID=sha256:23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c
GROK_REVIEW_COMMAND=grok -m grok-4.6
GROK_REVIEW_STATUS=BLOCKED_EXTERNAL_REVIEWER_INFRASTRUCTURE_NO_TERMINAL_VERDICT
```

## Exact identity correction

`docs/campaign-reports/PORTFOLIO-C8-C7-DETERMINISTIC-REPAIR-AND-GLYPH-INGESTION.md` contains two representations of the final ARM64 artifact. The authoritative build/review block records:

```text
EXACT_ARTIFACT_BUILD=PASS_LINUX_ARM64_PROVIDER_DISABLED_BUILD;IMAGE_ID_SHA256_23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c
```

The later portfolio summary currently contains an accidental extra trailing `4`:

```text
FINAL_COMBINED_ARM64_IMAGE=sha256:23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c4
```

That second value is not a valid SHA-256-length identity and must not be used in any review, deployment, or authority request.

Correct the durable report/state so the single canonical value is exactly:

```text
FINAL_COMBINED_ARM64_IMAGE=sha256:23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c
```

Before any later deployment request, mechanically verify the frozen local image/source still match the exact source and canonical image ID above. If they do not match, do not deploy; refreeze/rebuild/review the actual candidate first.

## Review-block handling

The candidate is not review-PASS yet. Preserve:

```text
FINAL_COMBINED_REVIEW=BLOCKED_EXTERNAL_GROK_NO_TERMINAL_VERDICT
```

Do not interpret inspection without a terminal verdict as PASS or REVISE.

When the canonical reviewer infrastructure is available, retry only:

```text
grok -m grok-4.6
```

against the exact frozen candidate `553ad71932a8036a6f6dfe34794052eb4e573b10` and the canonical ARM64 artifact identity above.

No ZAI fallback. No silent reviewer substitution. Do not weaken review scope or fabricate a verdict.

If Grok returns REVISE, continue automatically through Codex adjudication -> AGY `gemini-3.8-flash-high` minimum justified repair -> deterministic tests -> privacy/secret scan -> exact freeze/build -> fresh canonical Grok 4.6 review. A changed production byte invalidates the prior freeze/review identity.

If Grok returns PASS with no blocking findings, publish the exact reviewed source/image identity and move to the smallest new human authority boundary: deployment of the exact reviewed backend/shared/frontend candidate only. Do not silently include firmware flash, provider calls, OAuth actions, C10, C9, merge or release.

## Current technical conclusions to preserve

### C7

The deterministic repair remains qualified provider-disabled:

- Weather root cause: the deployed `d26` combined source omitted the reviewed C7 Open-Meteo schema/provider/normalization path, so Open-Meteo-shaped persisted configuration was rejected at backend validation.
- Google News root cause: the reviewed C7 `google_news` path was omitted from deployed `d26` before runtime registration.
- Outlook visible Chinese error: an HTTP 5xx backend exception envelope was propagated through the pre-repair frontend; the repair sanitizes status/non-English/sensitive failures into safe English user-visible errors while preserving `Calendars.Read` read-only scope.

Do not access private Outlook contents or initiate OAuth consent to claim the underlying Microsoft configuration/service cause.

### C8 glyph integrity

Preserve the physical failure and the current bounded conclusion:

```text
C8_JAPANESE_GLYPH_INTEGRITY=FAIL
C8_BACKEND_UTF8_CODEPOINT_PRESERVATION=PASS_PROVIDER_DISABLED
C8_FIRMWARE_UTF8_DECODER_PRESERVATION=PASS_HOST_REPLAY
C8_VOICE_FONT_DIRECT_U+306E=YES
C8_U+3107_IN_EFFECTIVE_CMAPS=NO
C8_GLYPH_ROOT_CAUSE=UNRESOLVED_DEPLOYED_FIRMWARE_RENDER_OR_UPSTREAM_CODEPOINT;SOURCE_UTF8_AND_DECODER_REPLAY_PASS
C8_FIRMWARE_CHANGE_REQUIRED=NO_JUSTIFIED_CHANGE_FROM_CURRENT_EVIDENCE
```

Do not invent a font/firmware repair and do not flash under this directive.

## Work queue / exit

The identity correction itself is safe deterministic work and should be completed immediately. After that, if the canonical reviewer infrastructure remains unavailable, `EXTERNALLY_BLOCKED_COUNT=1` is legitimate and there is no human action required merely to wait for reviewer infrastructure.

Before controller exit publish:

```text
PORTFOLIO_CURRENT_HEAD=
CURRENT_STAGE=
CANONICAL_REPAIR_SOURCE=553ad71932a8036a6f6dfe34794052eb4e573b10
CANONICAL_ARM64_IMAGE_ID=sha256:23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c
ARTIFACT_IDENTITY_DOC_CORRECTION=PASS|FAIL
GROK_REVIEW_STATUS=
GROK_REVIEW_VERDICT=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```

Do not request deployment authority until the exact candidate has a terminal canonical Grok PASS.

Keep all PRs OPEN / DRAFT / UNMERGED.
