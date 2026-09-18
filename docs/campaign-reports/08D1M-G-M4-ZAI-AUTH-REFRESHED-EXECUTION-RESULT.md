# Campaign 8D1M-G M4 — Refreshed ZAI Authentication Execution Result

## Live reconciliation

The refreshed-auth directive was read from live PR #2 head
`0588e47483f7046971b225a3f13d785f4f2da8af`. PR #2 remained OPEN, DRAFT, and
UNMERGED. The exact frozen runtime target remains
`8a51da387f8c1ec058883031ef0603ae3da3af36`.

## Exact reviewer attempt

The existing designated profile was loaded without reading or exposing any
credential value:

```text
REVIEW_PROVIDER=ZAI
REVIEW_MODEL=glm-5.3-flash
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_TARGET=8a51da387f8c1ec058883031ef0603ae3da3af36
```

The normal exact review invocation reached the configured ZAI transport, but
model metadata refresh returned the non-secret authentication failure class.
The bounded client exhausted five reconnects and emitted no review verdict:

```text
ZAI_AUTHENTICATION=FAIL
ZAI_FAILURE_CLASS=AUTHENTICATION_FAILED
ZAI_RECONNECTS=5
ZAI_REVIEW_VERDICT=NONE
ZAI_REVIEW_SECRET_EXPOSED=NO
```

The local GLM 5.2 convenience command, another provider, another model, and
another reviewer were not used. No backend deployment, firmware flash, device
reset, provider session, credential mutation, or production configuration
change was performed.

## Frontier

```text
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=0
EXTERNALLY_BLOCKED_COUNT=1
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=RESTORE_OR_REPAIR_EXISTING_DESIGNATED_ZAI_GLM53_REVIEW_AUTH_OUT_OF_BAND
TERMINAL_REASON=DESIGNATED_REVIEWER_AUTH_BOUNDARY
NEXT_ACTION=RESTORE_EXISTING_ZAI_GLM53_AUTH_THEN_RERUN_EXACT_REVIEW
PHYSICAL_TEST_REQUESTED=NO
```

The durable sanitized observer and all previously built artifacts remain
preserved. PR #2 stays OPEN / DRAFT / UNMERGED.
