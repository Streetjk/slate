# C10 API Route Reconciliation — 2026-09-15

## Scope

This is a docs-only reconciliation of the C10 deployment smoke result. No
product bytes, deployment, provider call, credential, account, or data state
changed.

## Exact source and runtime evidence

```text
C10_SOURCE_ROUTE=GET_/api/v1/ai-usage
C10_SOURCE_ROUTE_REGISTRATION=AiUsageModule->AiUsageController->AiUsageService
C10_SOURCE_ROUTE_WIRING=PASS
C10_FRONTEND_REQUEST=GET_/api/v1/ai-usage
C10_GLOBAL_AUTH_BEHAVIOR=HTTP_401_FOR_MISSING_OR_INVALID_AUTH
C10_PRIOR_SMOKE_RESULT=HTTP_404_REQUEST_DETAILS_NOT_RETAINED
C10_LIVE_LOOPBACK_ROUTE_RESULT=HTTP_401_AUTH_REQUIRED
C10_LIVE_LOOPBACK_UNKNOWN_ROUTE_RESULT=HTTP_404
C10_API_404_CLASS=REQUEST_OR_SMOKE_PATH_ERROR_NOT_SOURCE_WIRING
C10_AUTHENTICATED_API_SUCCESS=UNOBSERVED
C10_API_RESPONSE_BODY_RETAINED=NO
C10_PROVIDER_QUOTA_ACCOUNT_CALLS=0_OBSERVED
C10_SOURCE_OR_IMAGE_CHANGED=NO
```

The deployed image was unchanged. The exact route returned an auth response,
while an intentionally unknown route returned 404. Therefore the prior 404
does not establish that the C10 route is absent. It is unresolved as to the
original request boundary because that smoke omitted its exact URL,
authentication state, headers, proxy path and response envelope.

## Grok adjudication

Fresh bounded `grok -m grok-4.6` adjudication of the exact evidence returned:

```text
DECISION_STATUS=DECIDED
C10_404_CLASS=REQUEST_OR_SMOKE_PATH_ERROR
SOURCE_ONLY_REPAIR_REQUIRED=NO
REQUIRED_DOC_UPDATE=YES
SAFE_NEXT_ACTION=DOCUMENT_AND_PRESERVE_SOURCE
FINAL_CONCLUSION=ROUTE_PRESENT_AUTH_GATED_PRIOR_404_IS_REQUEST_PATH_ERROR
UNAUTHENTICATED_SUCCESS=UNOBSERVED
```

No source-only repair is justified. The C10 quota/subscription/session/account
metrics remain unavailable unless a separately authorized supported source and
authenticated read-only observation are established. No provider or account
call was made for this reconciliation.

## Boundaries

```text
C10_DEPLOYMENT=UNCHANGED_ALREADY_DEPLOYED
NOTE4_SERIAL_VOICE_PHYSICAL=NOT_TOUCHED
FIRMWARE=NOT_TOUCHED
OAUTH_CREDENTIALS_BILLING=NOT_TOUCHED
```
