# Grok 4.6 M07 P2 repair checkpoint

Date: 2026-09-12 (Australia/Perth)

The first fresh review of `b13bf52` returned a terminal PASS but identified
three actionable P2 residuals. The operator policy requires those findings to
be closed before readiness is claimed.

```text
PRIOR_REVIEW_SOURCE=b13bf52
PRIOR_REVIEW_VERDICT=PASS
PRIOR_REVIEW_P0=0
PRIOR_REVIEW_P1=0
PRIOR_REVIEW_P2=3
PRIOR_REVIEW_SECURITY=0
REPAIR_WRITER=Codex_temporary_fallback
ZAI_RETRY=NO_UNCHANGED_AUTH_FAILURE
```

## Exact repairs

```text
P2_1=BTC_WAITER_HONORS_UNEXPIRED_PLACEHOLDER_LEASE
P2_2=BTC_EXPIRED_PLACEHOLDER_CLAIM_USES_BLOB_CLEANUP_PATH
P2_3=OBSERVER_OVERFLOW_PRESERVES_COMPLETE_LINES_AND_DROPS_ONLY_PARTIAL_TAIL
```

The BTC waiter now extends its deadline to the active lease and keeps treating
the placeholder as occupancy until completion or expiry. Expired placeholders
removed during claim use the same image/audio cleanup path as final cleanup.
The observer drains complete newline-terminated records before applying the
pending-input cap, so a complete record is not discarded by a later partial
overflow.

## Focused validation

```text
M01_SELF_TEST=PASS
M04_MOCK_AND_PLAN_TESTS=11_PASS_0_FAIL
M04_ISOLATED_MARIADB_TESTS=4_PASS_0_FAIL
M04_ACTIVE_LEASE_WAIT_TEST=PASS
M04_EXPIRED_PLACEHOLDER_BLOB_CLEANUP_TEST=PASS
BACKEND_TYPECHECK=PASS
BACKEND_LINT=PASS
ROOT_FORMAT_CHECK=PASS
GIT_DIFF_CHECK=PASS
PRIVACY_SECRET_SCAN=PASS
```

No production, device, provider, physical, OAuth, billing, credential,
private-data, merge, or release action occurred. The exact next step is a
fresh independent Grok review of this repair delta only.
