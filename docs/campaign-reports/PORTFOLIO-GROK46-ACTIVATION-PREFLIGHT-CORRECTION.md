# Grok 4.6 M07 activation-preflight correction

Date: 2026-09-12 (Australia/Perth)
Status: SAFE NONPRODUCTION CONTINUATION; NOT DEPLOYMENT/FLASH/DATA/PHYSICAL AUTHORITY

## Reconciled live state

Live PR #2 advanced to `d693184b2b735e66eff9c418611c37f126407a39`, remains OPEN / DRAFT / UNMERGED, and records M01-M07 as technically qualified with Grok 4.6 final blocking findings closed.

The final repaired product source is:

```text
FINAL_SOURCE=e2b5aad597fd1b541921ba97400e72df307a3ad1
M07_FINAL=PASS_NO_BLOCKING_FINDINGS
M07_REPAIR_DELTA_REVIEW=PASS_P0_0_P1_0_P2_0_SECURITY_0
```

No production deployment, provider call, physical test, production BTC consolidation or firmware flash has occurred under M01-M07.

## Correction A — exact post-repair application artifact is not yet published

The final qualification report identifies `e2b5aad...` as the final source but does not bind a newly frozen exact linux/arm64 application image produced from that post-P2 source. A source SHA is not a deployable artifact identity.

Before asking the operator for application deployment authority, safe provider-disabled work remains:

1. mechanically confirm product-byte state at exact `e2b5aad...`;
2. build the exact established linux/arm64 Slate application image from that source with locked dependencies/tooling and no production activation;
3. capture exact image ID/digest and distinguish local image ID from manifest/transport/load identities;
4. require valid 64-hex SHA-256 identity where applicable;
5. run the established artifact-local smoke/qualification gates needed after the build;
6. bind source, image, platform, toolchain/lockfiles, collector identity and the reviewed M07 evidence in one activation manifest;
7. if any product bytes change to make the build pass, invalidate the candidate and return through deterministic qualification + fresh Grok review.

Until this is done:

```text
APPLICATION_DEPLOYMENT_AUTHORITY_READY=NO_EXACT_POST_REPAIR_IMAGE_NOT_FROZEN
READY_NODE_COUNT>=1
HUMAN_ACTION_REQUIRED=NO_FOR_ARTIFACT_FREEZE
```

A build/freeze/checkpoint is not a deployment and should not stop the long-running controller.

## Correction B — firmware requirement must be compared with production, not only the M01-M07 baseline

`PORTFOLIO-GROK46-M07-FINAL-QUALIFICATION.md` records `FIRMWARE_CHANGED=NO`. Interpret this only as no additional firmware product changes during the latest M01-M07 development delta.

Earlier reviewed observability work produced the candidate firmware artifact:

```text
CANDIDATE_FIRMWARE_APP_SHA256=f6bd1111fba50d94ff9bd6ccfbbc284dbdd4bbcd0d763ed5b09403e231954ab1
```

and explicitly recorded `FIRMWARE_FLASH=NONE`.

The last recorded production app-only firmware activation used the older application artifact:

```text
LAST_RECORDED_PRODUCTION_FIRMWARE_APP_SHA256=0b4c9f1c989cf3157ef54d9a904bc33c05e202f3c31d4d2661b16a18bc32619a
```

Therefore do not conclude `FIRMWARE_FLASH_NOT_REQUIRED` from the M07 delta flag. First mechanically reconcile the currently running NOTE4 app identity with the candidate firmware identity and confirm which frame/glyph diagnostic producers exist in each artifact.

Publish:

```text
RUNNING_FIRMWARE_APP_IDENTITY=
CANDIDATE_FIRMWARE_APP_IDENTITY=
FIRMWARE_ARTIFACT_MATCH=
CANDIDATE_DIAGNOSTIC_PRODUCERS_REQUIRE_NEW_FIRMWARE=YES|NO|UNKNOWN
APP_ONLY_FLASH_REQUIRED_FOR_NEXT_PHYSICAL_DIAGNOSIS=YES|NO|UNKNOWN
```

This read-only identity reconciliation does not authorize a flash. Do not reset, re-pair or alter partitions merely to determine identity.

If the new frame/glyph producers are absent from the running app and present only in `f6bd1111...`, the later authority package must include an exact application-partition-only firmware flash as a distinct scope. If production already runs an equivalent artifact, prove that mechanically rather than assuming it.

## Correction C — production BTC consolidation remains a separate data operation

M04 qualified the local algorithm with mock/plan tests and an isolated MariaDB suite. The production records have not been consolidated.

Application deployment does not itself prove the user's requested live state of exactly one Weekly BTC tile.

Before later production-data authority, prepare a read-only/dry-run plan with:

```text
BTC_PRODUCTION_PRECONDITION_DAILY_COUNT=
BTC_PRODUCTION_PRECONDITION_WEEKLY_COUNT=
BTC_PRODUCTION_PRECONDITION_MONTHLY_COUNT=
BTC_PRODUCTION_TARGET_WEEKLY_COUNT=1
BTC_PRODUCTION_UNRELATED_CONTENT_CHANGE_COUNT=0
BTC_CONSOLIDATION_ROLLBACK_OR_RECOVERY_PLAN=
```

Applying consolidation is a separate explicit authority from deploying code.

## Correct frontier before operator activation request

Continue safe work through exact artifact/identity reconciliation. Grok 4.6 remains technical decision lead and should perform the stop audit only after these safe nodes are exhausted.

Required next sequence:

```text
exact e2b5aad application artifact build/freeze
-> bind application/collector identities
-> reconcile running-vs-candidate firmware identity read-only
-> prepare BTC production dry-run/preconditions
-> Grok 4.6 activation-readiness audit
-> publish smallest exact authority package
```

No deployment, firmware flash, production BTC mutation, physical test, provider qualification, OAuth, credential/billing change, merge or release is authorized by this document.

Keep PR #1, #2, #3 and #4 OPEN / DRAFT / UNMERGED.
