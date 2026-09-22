# Campaign 8D1M-G M4 — Grok 4.6 review, qualifier repair, and requalification

## Live reconciliation

```text
LIVE_PR=2
LIVE_PR_HEAD_AT_RECONCILIATION=9ece62a721f88e2b3314c31fa4f99dd9c4e41749
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
REVIEWER=GROK_4_6
REVIEW_MODEL=grok-4.6
ZAI_RETRY_FOR_THIS_STAGE=STOPPED
```

The operator's reviewer-role directive was read from the live head. The exact
review target was `8a51da387f8c1ec058883031ef0603ae3da3af36`.

## Initial independent review and adjudication

The direct controller route `grok -m grok-4.6` returned `REVISE` for the
exact target. It found one blocking P2/Low issue and no P0, P1, or credential
leak: the Node fallback in `scripts/qualify-gemini-deployment.sh` dynamically
imported the TypeScript qualifier without invoking its CLI entry point and
could therefore false-PASS.

Codex accepted only that finding. AGY `gemini-3.8-flash-high` implemented the
minimum repair in commit `81e983086fb414fa24233434da4927564c16dc98`:

- removed the Node fallback so the wrapper fails closed when Bun is absent;
- added deterministic wrapper tests for missing/invalid configuration,
  missing secret mount, absent Bun, and output confidentiality;
- changed no provider, model, credential, billing, private-data authority,
  firmware, audio, Japanese, ordering, or WebSocket behavior.

No credential value was read, printed, stored, or committed.

## Deterministic validation and privacy

```text
QUALIFIER_TESTS=10_PASS_0_FAIL
RELATED_GEMINI_TESTS=34_PASS_0_FAIL
BACKEND_TYPECHECK=PASS
BACKEND_LINT=PASS
FORMAT_CHECK=PASS
DEFAULT_WRAPPER_WITHOUT_CONFIG=EXIT_1_FAIL_CLOSED
PRIVACY_SECRET_SCAN=PASS_NO_REAL_SECRET_PATTERN
GITLEAKS=UNAVAILABLE_ON_CONTROLLER
```

The only secret-like test match was the intentional synthetic canary fixture;
no real secret pattern was present in the changed files.

## Fresh exact Grok review

The fresh direct read-only review was run with `grok -m grok-4.6` against the
exact repair commit `81e983086fb414fa24233434da4927564c16dc98`, with no desired
verdict supplied and no implementation delegated to Grok.

```text
GROK_REVIEW_STATUS=PASS_CANDIDATE_READY
GROK_REVIEW_TARGET=81e983086fb414fa24233434da4927564c16dc98
GROK_P0=0
GROK_P1=0
GROK_P2=0
GROK_P3=3
GROK_SECURITY_BLOCKING=0
GROK_BLOCKING_TOTAL=0
```

The three residual P3 notes were non-blocking: synthetic canary strength,
stderr/stdout stream split for the Bun-missing branch, and host-dependent PATH
construction in one test. The review confirmed the wrapper has no success path
that skips the fail-closed qualifier and no authority expansion.

## Exact artifact verification and bounded deployment

The previously frozen runtime artifacts remain the exact reviewed repair
artifacts:

```text
BACKEND_TAG=slate:m4-progressive-freeze-8a51da3
BACKEND_LOCAL_IMAGE_ID=sha256:45d77127e801e6d8552e01b64dd3f77e4708a6944f9a1933a98a4821ab88a16c
BACKEND_PLATFORM=linux/arm64
BACKEND_IMAGE_SIZE_BYTES=1130775751
FIRMWARE_APP_SIZE_BYTES=2535248
FIRMWARE_APP_SHA256=d6cf12371f8c98cc81e102110439f1fbbad3aec153cdbfe53b997413a52ad441
FIRMWARE_FLASH_OFFSET=0x10000
FIRMWARE_FLASH_SCOPE=APP_ONLY
```

The backend archive transferred byte-for-byte with SHA-256
`338abc5ab611cbe744f56b1fad9621ef58d690fab1deac09b7e9846d201b10c6`.
The remote round-trip archive retained config digest
`45d77127e801e6d8552e01b64dd3f77e4708a6944f9a1933a98a4821ab88a16c` and the
same complete layer chain. Docker's remote containerd image display ID is
`sha256:ff9a495d26a171e9218038a2d6cf1a30d174dced594700d19a067b0988643669`;
the content/config identity, not that display-ID representation, matched.

Only `slate-note4` was recreated using the exact approved eight `GEMINI_*`
settings and the existing read-only secret mount. MySQL was not recreated;
persistent data mounts, network, rollback image, and database identity were
preserved.

```text
BACKEND_DEPLOYMENT=PASS_SLATE_ONLY
SLATE_STATUS=RUNNING_HEALTHY_RESTART_0
MYSQL_STATUS=RUNNING_HEALTHY_RESTART_0
GEMINI_CONFIG_QUALIFICATION=PASS
GEMINI_SECRET_MOUNT_RW=false
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
VOICE_CONFIG_UNAUTH=HTTP_401
```

The app-only firmware write completed with esptool 5.2.0 and reported
`Hash of data verified`; a subsequent `verify-flash` reported digest matched.
No full erase, bootloader, partition table, NVS, LittleFS, pairing, or user
data write was performed. Device identity remained ESP32-S3 revision 0.2,
flash `46/4018`, 16 MB.

```text
FIRMWARE_FLASH=PASS_APP_ONLY_HASH_VERIFIED
POST_FLASH_BOOT_MARKERS=6
POST_FLASH_FATAL_MARKERS=0
POST_FLASH_WIFI_MARKERS=0_NOT_CAPTURED
```

The durable observer was explicitly rearmed at
`/dev/cu.usbmodem31101`, remains running under
`com.streetjk.slate.m4observer`, and retains only sanitized structural
markers. Wi-Fi was not claimed from the observer because no Wi-Fi marker was
captured in the bounded post-flash window; this is a qualification evidence
gap, not a physical Voice AI verdict. No further probe or physical Voice
session was requested.

## Current frontier

```text
SAFE_NONPHYSICAL_REVIEW=EXHAUSTED
SAFE_NONPHYSICAL_DEPLOYMENT=PASS
SAFE_NONPHYSICAL_FLASH=PASS
OBSERVER_DURABLE_REARM=PASS_RUNNING_SANITIZED
AUDIO_ACCEPTANCE=OPEN
PHYSICAL_EN_JA_ACCEPTANCE=NOT_REQUESTED_UNTIL_POSTFLASH_WIFI_REQUALIFICATION_IS_RESOLVED
PROVIDER_MODEL_CREDENTIAL_BILLING_PRIVATE_DATA_AUTHORITY_CHANGED=NO
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
```
