# Grok 4.6 conditional activation recommendation

Date: 2026-09-12 (Australia/Perth)
Status: RECOMMENDATION ONLY; NOT AUTHORITY UNTIL OPERATOR EXPLICITLY ADOPTS

## Exact current boundary

Reconcile live GitHub before execution. The activation-preflight result freezes the reviewed application candidate:

```text
FINAL_SOURCE=e2b5aad597fd1b541921ba97400e72df307a3ad1
FINAL_IMAGE_TAG=slate:m07-e2b5aad-arm64
FINAL_BACKEND_IMAGE_ID=sha256:bc755aa2aa78017b327e1f12bf91bebd1f3446f36f8f0def5b328087288207ae
FINAL_BACKEND_PLATFORM=linux/arm64
FINAL_TRANSPORT_ARCHIVE_SHA256=f4a7d1b289992ccdb9c3cf4ebae9b62875aa69d7764840c91b27f9c3412de8d0
FINAL_FRONTEND_ARTIFACT_ID=sha256:9bd14d4ca829412c5ee47381a4791d5f5fe7e6bb0ebb56fcfcdf15c054a3c29d
FINAL_COLLECTOR_ID=m4-sanitized-structural-v3|sha256:2c60ae95bec6236afdb42f77b0e2dfc1a9c9123a847559fd67c04c3f173af65a
M07_FINAL=PASS_P0_0_P1_0_P2_0_SECURITY_0
```

The firmware candidate identity is:

```text
CANDIDATE_FIRMWARE_APP_IDENTITY=sha256:f6bd1111fba50d94ff9bd6ccfbbc284dbdd4bbcd0d763ed5b09403e231954ab1
CANDIDATE_FIRMWARE_APP_BYTES=2537024
CANDIDATE_FIRMWARE_APP_PARTITION_BYTES=4194304
```

Running firmware identity is not currently proven. Historical production firmware identity must not be treated as current readback. Live BTC Daily/Weekly/Monthly counts are also not currently proven. These UNKNOWNs are reasons for conditional activation logic, not reasons to invent more provider-disabled development work.

## Recommended order

### A — exact application activation

After explicit operator authority, deploy only the frozen linux/arm64 application artifact corresponding to source `e2b5aad...` and image ID `sha256:bc755...`.

Before application recreation, mechanically verify:

- exact candidate image identity and platform;
- resolved deployment configuration contains the already-approved required non-secret Gemini configuration markers;
- existing protected credential/secret mount remains read-only;
- current Slate and MySQL health/restart counters;
- MySQL identity/data path and network identity;
- current known-good application rollback image.

Do not print secret values. Preserve MySQL, networking, pairing, provider/model/auth configuration, C9/C10, and all unrelated content.

After activation require local/public health, zero unexpected restart growth, authenticated NOTE4 polling, no fatal markers, and exact running application image/load equivalence. On failure, rollback application only.

### B — conditional application-only firmware assurance

Do not blindly claim the running firmware matches the diagnostic candidate.

After application health, first attempt the smallest non-destructive identity/marker proof available through the already-established serial/runtime surfaces without reset, erase, pairing or Wi-Fi mutation.

If running firmware can be mechanically proven to equal the candidate and expose the required frame/glyph markers, skip flashing.

If it is mechanically proven different, or identity remains unprovable while the required marker behavior cannot be established, the recommended operator authority may permit one exact application-partition-only flash of the reviewed candidate `f6bd111...`, using only the established known-safe application partition scope/offset from the prior successful app-only flash procedure. Verify the written bytes/hash and boot/reconnect/authenticated poll. Do not touch partition table, bootloader, NVS, pairing or Wi-Fi.

This is an assurance flash to make the diagnostic runtime deterministic, not a new firmware-development campaign. No product-byte substitution is allowed.

### C — conditional targeted BTC live-state consolidation

After the exact application is healthy, perform a read-only structural inspection limited to BTC dynamic-content records and only the fields required for preconditions. Do not print unrelated/private content.

Publish counts/classifications before mutation:

```text
BTC_PRODUCTION_DAILY_COUNT=
BTC_PRODUCTION_WEEKLY_COUNT=
BTC_PRODUCTION_MONTHLY_COUNT=
BTC_PRODUCTION_OTHER_BTC_COUNT=
BTC_TARGET_WEEKLY_COUNT=1
BTC_EXPECTED_KEEP_COUNT=
BTC_EXPECTED_REMOVE_COUNT=
BTC_PRECONDITIONS_PASS=
```

If the observed state is within the reviewed migration's tested scope, apply the targeted BTC-only consolidation through the reviewed transaction/lease/retry path so exactly one valid Weekly record remains. Preserve unrelated content and a valid existing Weekly record where possible. Verify post-state exactly one Weekly and no unintended dynamic-content mutation.

If live state differs materially from reviewed preconditions, do not mutate. Publish the exact mismatch and return to Grok for technical adjudication.

### D — one bounded physical acceptance after A/B/C

Only after application health, firmware marker assurance, collector self-test, and BTC post-state (or safe BTC skip) are complete should one physical window be armed.

Use existing Weather and Calendar cards; do not delete/recreate them merely to pass.

Check at minimum:

1. Monthly Calendar: English weekday/month path, no Chinese lunar annotations, WA public-holiday presentation for a relevant known date/month, and frame-sync/freshness markers.
2. Weather: no visible stale `Invalid configuration` when backend state says success; validate lifecycle markers and representative icon behavior.
3. BTC: exactly one visible Weekly/7-day tile if consolidation was applied.
4. Google News: minimal regression only; preserve prior partial success and do not overclaim AU/TW/Both if not exercised.
5. Outlook: error presentation only unless separately configured; no OAuth consent/private event access.
6. Japanese glyph: exercise a bounded synthetic or ordinary Voice path sufficient to observe the known square issue with the v3 collector armed; preserve UNKNOWN where the required character is not actually exercised.
7. Voice: only within the separately authorized ordinary production acceptance budget; observe bubble order, lag/freeze, audible audio and clean exit without creating another synthetic provider-qualification campaign.

Consume the physical attempt once. Do not blind-repeat on failure. Preserve each successful sub-result independently and use sanitized marker evidence to isolate the earliest failing boundary.

## Authority semantics

The operator may adopt A/B/C/D together in one prompt, but they remain distinct scopes and each is conditional:

```text
A_APPLICATION_DEPLOYMENT_AUTHORITY=EXPLICIT
B_APP_ONLY_FIRMWARE_AUTHORITY=CONDITIONAL_AS_ABOVE
C_BTC_PRODUCTION_CONSOLIDATION_AUTHORITY=CONDITIONAL_ON_READONLY_PRECONDITIONS
D_PHYSICAL_ACCEPTANCE_AUTHORITY=CONDITIONAL_AFTER_A_B_C_QUALIFICATION
```

This recommendation does not authorize merge/release, C9 activation, C10 deployment, Microsoft OAuth, new credentials/accounts/billing, model/provider changes, MySQL recreation, broad data deletion, NOTE4 reset/re-pair/Wi-Fi changes, or another independent Gemini qualification session.

## Controller continuation

Grok 4.6 remains technical decision lead. Codex executes and integrates. Z.ai is not required for ordinary activation because no new product implementation is expected. If activation evidence reveals a new code defect, stop the affected scope, preserve other passing scopes, and return to the development/review loop rather than patching production ad hoc.

After meaningful activation transitions, update `CAMPAIGN-STATE.md`, publish exact runtime identities and results, run privacy-safe scans/diff checks for any report changes, push/fetch-verify, and continue automatically until the next legitimate physical/human boundary.
