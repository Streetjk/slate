# CA-1 / CA-2 Exact Backend Deployment Retry Result

Date: 2026-09-14 (Australia/Perth)

## Result

The exact reviewed backend retry completed successfully under exclusive control. The reviewed source is `1cb585a6d554e1eddd3b3ed8300a7e3252e3bc31`. The reviewed local image is `sha256:1201ca661bc5a7e7e775f4bf0f67964852b77d31c23aa17156ba766df232ae8e`, loaded on Orange Pi as equivalent image `sha256:c2bed4492ba5bd8d541ec44d8b805383349433a9bc61635611903a3ac434cb4c`.

```text
RETRY=PASS
SLATE_HEALTH=healthy
SLATE_RESTARTS=0
SLATE_OOMKILLED=false
MYSQL_IDENTITY_PRESERVED=YES
MYSQL_RESTARTS=0
NETWORK_IDENTITY_PRESERVED=YES
SECRET_READONLY=YES
LOCAL_HTTP=HTTP_200
PUBLIC_HTTP=HTTP_200
EVENT_KILL_STOP_DIE_DESTROY_COUNT=0
```

## Failure-boundary adjudication

Docker evidence from the first attempt showed the candidate had already passed its deployment health gate before it was later stopped by an overlapping controller action. Grok 4.6 therefore classified the first disappearance as external controller interference rather than an application defect.

```text
ROOT_CAUSE_CLASS=EXTERNAL_OVERLAPPING_CONTROLLER_MANUAL_STOP_AFTER_HEALTHY_CANDIDATE
APPLICATION_FAILURE_SUPPORTED=NO
DEPLOYMENT_SCRIPT_FAILURE_SUPPORTED=NO
EXTERNAL_CONTROLLER_INTERFERENCE_SUPPORTED=YES
NEW_PRODUCT_REPAIR_REQUIRED=NO
SAFE_RETRY_ALLOWED=YES
RETRY_LIMIT=ONE
REQUIRED_POSTDEPLOY_STABILITY_SECONDS=300
```

The one permitted retry used the already-loaded candidate only. It did not rebuild or pull another backend image, and MySQL was not recreated.

## Fresh Grok 4.6 post-retry stop audit

```text
DEPLOYMENT_VERDICT=PASS_EXACT_REVIEWED_BACKEND_C2BED449_300S_SOAK
NEW_PRODUCT_REPAIR_REQUIRED=NO
BACKEND_ACCEPTED=YES
FIRMWARE_REQUIRED_FOR_BROADER_GLYPH_ACCEPTANCE=YES
SAFE_WORK_REMAINING_WITHOUT_NEW_OPERATOR_AUTHORITY=NO
PORTFOLIO_DECISION=STOP
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=SEPARATE_OPERATOR_AUTHORITY_REQUIRED_FOR_CFA15233_APP_ONLY_FLASH_AND_BOUNDED_PHYSICAL_REQUALIFICATION;THIS_DECISION_GRANTS_NEITHER
STOP_REASON=ONE_ALLOWED_RETRY_CONSUMED_PASS_NO_NEW_REPAIR_REMAINING_ACTIONS_OPERATOR_AUTHORITY_GATED
```

```text
CANDIDATE_FIRMWARE_NOT_FLASHED=cfa15233f037d8cce3721f3d70539f3395b69d85a61f3279b6ac9d3a8616b13c
RUNNING_FIRMWARE=f6bd1111fba50d94ff9bd6ccfbbc284dbdd4bbcd0d763ed5b09403e231954ab1
PHYSICAL_REQUALIFICATION=NOT_AUTHORIZED_NOT_RUN
```

No firmware flash, NOTE4 physical test, provider/model/auth change, OAuth, billing, C9/C10 activation, merge or release occurred. The backend deployment phase is accepted. The next boundary is explicit operator authority for the exact application-only firmware flash and one bounded physical requalification; this report grants neither.
