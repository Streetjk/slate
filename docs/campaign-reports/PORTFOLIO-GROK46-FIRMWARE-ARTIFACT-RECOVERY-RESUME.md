# Grok 4.6 firmware artifact recovery and physical-gate resume

Date: 2026-09-12 (Australia/Perth)
Status: SAFE RECOVERY CONTINUATION; NO NEW FIRMWARE-HASH FLASH AUTHORITY

## Current proven activation state

Reconcile live GitHub before execution. The activation result at the current frontier proves:

```text
APPLICATION_DEPLOYMENT_RESULT=PASS
APPLICATION_SOURCE=e2b5aad597fd1b541921ba97400e72df307a3ad1
APPLICATION_IMAGE_LOCAL_ID=sha256:bc755aa2aa78017b327e1f12bf91bebd1f3446f36f8f0def5b328087288207ae
APPLICATION_REMOTE_LOAD_ID=sha256:359c562815e101b37071dfa75155b0fa18171bde75bd4eca2e4ffdfa18b04e32
SLATE_HEALTH=running_healthy
MYSQL_HEALTH=running_healthy
NOTE4_AUTHENTICATED_POLL=PASS
BTC_CONSOLIDATION_RESULT=PASS_TARGETED_BTC_ONLY
BTC_WEEKLY_COUNT_AFTER=1
BTC_DAILY_COUNT_AFTER=0
BTC_MONTHLY_COUNT_AFTER=0
BTC_UNRELATED_CONTENT_MUTATED=NO
PHYSICAL_ACCEPTANCE_CONSUMED=NO
```

Do not redeploy the application or rerun BTC consolidation merely to continue this recovery.

The sole unresolved activation node is firmware identity:

```text
AUTHORIZED_FIRMWARE_SHA256=f6bd1111fba50d94ff9bd6ccfbbc284dbdd4bbcd0d763ed5b09403e231954ab1
AUTHORIZED_FIRMWARE_BYTES=2537024
APP_PARTITION_BYTES=4194304
APP_OFFSET=0x10000
RUNNING_FIRMWARE_SHA256=d3c3866683eea5dab3ac8fefd37fd839aeb02a52bb2e097a39c46b9892397bd2
RUNNING_FIRMWARE_BYTES=2537024
FIRMWARE_ARTIFACT_MATCH=NO
APP_ONLY_FLASH_REQUIRED=YES
EXACT_AUTHORIZED_BINARY_AVAILABLE=NO_CURRENT_PROOF
REBUILD_1_SHA256=e7358690157695559ecc370b32d43eb2107093cc7092e82a10531ed4bd3f859d
REBUILD_2_SHA256=232b69e9d152121d4fed61a6248eb54137c11acdb83a79ae5c608cb950374764
TRACKED_SOURCE_AND_LOCKFILE_DRIFT=NO
```

The previous conditional firmware authority was for exactly `f6bd...` and remains unconsumed because no flash occurred. It does not authorize flashing `e735...`, `232b...`, or any future different hash.

## Scheduler correction

Exact artifact recovery, read-only artifact search, binary comparison, deterministic qualification, clean firmware build, and fresh independent review are safe non-production work. Therefore this state is not yet a human-only stop.

During this recovery:

```text
READY_NODE_COUNT>=1
READONLY_READY_NODE_COUNT>=0
WAITING_HUMAN_COUNT=0
HUMAN_ACTION_REQUIRED=NO
CURRENT_BLOCKED_NODE=NONE_WHILE_SAFE_FIRMWARE_RECOVERY_IS_RUNNABLE
```

A human gate becomes valid only if a new reviewed firmware hash must be flashed, or if all safe artifact-recovery work is exhausted without a usable exact artifact.

## Mission F0 — search for the exact already-reviewed binary

First attempt recovery of the exact `f6bd...` bytes without rebuilding or changing product state.

Inspect only known build/artifact locations and campaign-controlled storage, for example existing campaign worktrees, prior firmware build output directories, controller-local artifact/archive directories, transfer staging used by earlier NOTE4 flashes, and Orange Pi/controller deployment staging if already authorized for read-only inspection. Do not scan unrelated personal/private directories and do not inspect credential contents.

Mechanically hash candidate files; do not trust names.

Publish sanitized structural evidence only:

```text
F6BD_SEARCH_LOCATIONS_CLASS=
F6BD_CANDIDATE_FILE_COUNT=
F6BD_EXACT_MATCH_FOUND=YES|NO
F6BD_EXACT_MATCH_SHA256=
F6BD_EXACT_MATCH_BYTES=
F6BD_EXACT_MATCH_IMAGE_INFO_CLASS=
```

If and only if exact SHA-256 equals `f6bd1111...` and byte count is 2537024, treat the prior exact flash authority as still applicable after the ordinary preflash partition/hash checks.

Do not substitute a same-source but different binary under that authority.

## Mission F1 — explain build non-reproducibility if exact binary is not recovered

If the exact binary cannot be found, compare the two clean rebuilds and their provenance before selecting a new candidate.

Use ESP-IDF/esptool-supported image inspection and build metadata. Compare, as available:

- source/tree and submodule/managed-component identities;
- sdkconfig and sdkconfig.defaults identities;
- component lock/dependency identities;
- IDF/Python/toolchain/compiler/linker versions;
- build directory generation inputs;
- partition table inputs;
- project/version strings;
- application description compile date/time fields;
- ELF identities and app-image descriptors;
- section/segment sizes and offsets;
- generated files that can legitimately embed timestamps/build identities.

Do not patch timestamps, edit binaries, or strip metadata solely to make a historical hash match.

Publish:

```text
REBUILD_SOURCE_EQUIVALENCE=
REBUILD_CONFIG_EQUIVALENCE=
REBUILD_TOOLCHAIN_EQUIVALENCE=
REBUILD_BINARY_EQUAL=NO
FIRST_MECHANICALLY_PROVEN_DIFFERENCE_CLASS=
NONDETERMINISM_EXPECTED_BUILD_METADATA=YES|NO|UNKNOWN
PRODUCT_SEMANTIC_DRIFT_PROVEN=YES|NO
```

If semantic/product drift is found, repair through the normal Grok-led development flow before creating a candidate.

## Mission F2 — freeze a new exact candidate when necessary

If `f6bd...` is unavailable and no semantic source drift is found, build exactly one clean firmware candidate from the current qualified source/toolchain state, freeze the resulting binary immediately, and bind the exact bytes rather than expecting a later rebuild to reproduce its hash.

Record:

```text
NEW_FIRMWARE_SOURCE_SHA=
NEW_FIRMWARE_SOURCE_TREE=
NEW_FIRMWARE_BIN_SHA256=
NEW_FIRMWARE_BIN_BYTES=
NEW_FIRMWARE_ELF_IDENTITY=
NEW_FIRMWARE_FONT_IDENTITY=
NEW_FIRMWARE_PARTITION_SCOPE=APPLICATION_ONLY
NEW_FIRMWARE_APP_OFFSET=0x10000_IF_MECHANICALLY_RECONFIRMED
NEW_FIRMWARE_BUILD_MANIFEST_ID=
```

Do not flash this new hash yet.

Run all affected provider-disabled gates, including frame/glyph marker source tests, font/layout tests, firmware build qualification, privacy-safe instrumentation checks, `git diff --check`, and any existing NOTE4 firmware regression tests that are available in the checkout. Preserve the documented WebSocket-fixture limitation if transport source files remain absent; do not fabricate a pass.

## Mission F3 — fresh Grok 4.6 exact-artifact review

If a new firmware hash is frozen, send a compact exact SHA-bound packet to a fresh `grok -m grok-4.6` review context containing:

- current qualified requirements;
- firmware source/tree;
- exact frozen BIN/ELF/font/build-manifest identities;
- why the historical hash could not be reproduced;
- binary/image-info structural comparison;
- changed-vs-unchanged firmware source statement;
- marker/host/build test results;
- known fixture limitations;
- partition/flash scope and safety invariants.

Require a terminal verdict:

```text
VERDICT=PASS|REVISE
P0=
P1=
P2=
SECURITY=
REVIEWED_FIRMWARE_BIN_SHA256=
```

Missing, malformed, timed-out, or artifact-mismatched review is not PASS.

On REVISE, use the existing Grok decision-lead + authorized development-writer policy to repair, retest, refreeze and rereview. Do not flash while safe repair remains.

## Mission F4 — decide the activation path

### Path A: historical exact binary recovered

If exact `f6bd...` is recovered and the prior review binding is mechanically confirmed:

```text
FIRMWARE_AUTHORITY_PATH=EXISTING_UNCONSUMED_EXACT_F6BD_AUTHORITY
```

Proceed only through the already-authorized single application-partition-only flash after exact hash/size/partition checks. No new firmware authority is needed because the artifact and scope are unchanged and the prior one-flash budget was never consumed.

After flash, verify hash/boot/network/pairing/authenticated-poll and required frame/glyph markers. If all pass, continue to the already-authorized one bounded physical acceptance. Do not ask the operator to repeat authorization already granted for exactly these scopes.

### Path B: new reviewed firmware hash required

If a new hash has fresh terminal Grok PASS with `P0=0 P1=0 P2=0 SECURITY=0`, stop at a precise human authority gate:

```text
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=NEW_EXACT_REVIEWED_FIRMWARE_HASH_REQUIRES_APP_ONLY_FLASH_AUTHORITY
NEXT_ACTION=REQUEST_ONE_EXACT_APP_ONLY_FLASH_AUTHORITY_FOR_NEW_REVIEWED_HASH;THEN_USE_EXISTING_UNCONSUMED_PHYSICAL_ACCEPTANCE_SCOPE_IF_STILL_VALID
```

The request must identify the exact new hash, byte count, partition scope, app offset if mechanically verified, review verdict and rollback/safety constraints. Do not broaden it to bootloader, partition table, NVS, Wi-Fi, pairing, provider/model/auth, BTC, application redeployment, merge or release.

## Preserved production state

Throughout F0-F4 preserve:

- current healthy exact application deployment;
- the completed single-Weekly BTC production state;
- MySQL identity/data;
- network/device identity and pairing;
- provider/model/auth configuration;
- Outlook/OAuth/private-data boundaries;
- C9 parked state;
- C10 undeployed state;
- PR #1/#2/#3/#4 OPEN / DRAFT / UNMERGED.

No provider session, physical test, firmware flash, application redeployment, BTC reconsolidation, OAuth, credential, billing, private-data expansion, merge or release is authorized by this recovery document beyond already-existing exact unconsumed authorities explicitly described above.

## Required durable exit

Before any controller exit update the live frontier and publish:

```text
CURRENT_HEAD=
CURRENT_STAGE=
F6BD_EXACT_MATCH_FOUND=
FIRST_MECHANICALLY_PROVEN_DIFFERENCE_CLASS=
NEW_FIRMWARE_BIN_SHA256=
NEW_FIRMWARE_REVIEW=
FIRMWARE_AUTHORITY_PATH=
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

Do not stop at a report push while F0-F3 safe work remains runnable.