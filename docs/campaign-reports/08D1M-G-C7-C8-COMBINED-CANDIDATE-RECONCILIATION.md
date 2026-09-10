# Portfolio C7+C8 combined candidate reconciliation

Date: 2026-09-10 (Australia/Perth)

This is a branch-local, non-deployed combined release candidate. Campaign 8
was first stabilized at its exact reviewed restore source; Campaign 7 was then
forward-combined for qualification. No merge, release, production deployment,
firmware flash or physical acceptance is performed by this checkpoint.

## Provenance and isolation

```text
INTEGRATION_BASE=2d4a2a9e9a380c591c2ac7f0f3120f1f7939b65d
C7_PARENT=7c0ebae5e351f2650f4b8704532218d6be7b318d
C8_PARENT=c797cc44842fd598c64dacd22606493890ed9730
C7_SOURCE_FILES_CHANGED=31
C7_C8_PRODUCT_RUNTIME_OVERLAP=0
C8_ASSISTANT_TREE_CHANGED_FROM_EXACT_RESTORE=0
C8_FIRMWARE_TREE_CHANGED_FROM_EXACT_RESTORE=0
SHARED_FILE_CONFLICTS=CAMPAIGN-STATE.md_ONLY
SHARED_FILE_RESOLUTION=EXPLICIT_COMBINED_FRONTIER;NO_RUNTIME_SIDE_DISCARDED
C7_FIRMWARE_CHANGED=NO
C8_FIRMWARE_CHANGED=NO
```

Campaign 7 changes are confined to dynamic-content backend/shared/frontend
files and Campaign 7 reports. Campaign 8 assistant and firmware trees match
the exact reviewed restore source. The only shared-file conflict was the
coordination state document; it was resolved by retaining the C8 current
frontier and incorporating the complete C7 validation/provenance fields.

## Deterministic validation

```text
BACKEND_TESTS=400_PASS_5_SKIP_0_FAIL
SHARED_TESTS=6_PASS_0_FAIL
FRONTEND_TYPECHECK=PASS
FRONTEND_BUILD=PASS
BACKEND_TYPECHECK=PASS
ROOT_LINT=PASS
FORMAT_CHECK=PASS_PRIOR_C7_AND_COMBINED_DIFF_CHECK
FIRMWARE_FRAMEBUFFER_HOST_TEST=PASS
FIRMWARE_VOICE_FONT_COVERAGE_TEST=PASS
FIRMWARE_WEBSOCKET_EVENT_LOSS_TEST=PASS_EXACT_C8_WORKSPACE
COMBINED_WORKTREE_FIRMWARE_SUBMODULE=NOT_POPULATED_FOR_LOWER_TRANSPORT_FIXTURE
PRIVACY_SECRET_SCAN=PASS
GIT_DIFF_CHECK=PASS
```

The lower-transport fixture was absent from the fresh combined worktree's
unpopulated component checkout; the same exact C8 firmware source in the
qualified workspace passed the event-loss regression. This is an environment
fixture limitation, not a product assertion. No source was copied or changed
to conceal it.

## Review and deployment boundary

```text
C7_STANDALONE_REVIEW=HISTORICAL_PASS;VALID_FOR_STANDALONE_BYTES_ONLY
COMBINED_BYTES_REVIEW=REQUIRED_FRESH_AGY_GEMINI37_MEDIUM_READONLY_REVIEW
COMBINED_DEPLOYMENT=NOT_AUTHORIZED
COMBINED_PHYSICAL_ACCEPTANCE=NOT_AUTHORIZED
NEXT_ACTION=FRESH_INDEPENDENT_REVIEW_OF_COMBINED_BYTES
```

The combined candidate must receive a fresh independent AGY review because
its bytes differ from the standalone reviewed C7 candidate. The existing C8
Grok review remains evidence for the C8 subtree but is not silently reused as
review of the combined bytes.
