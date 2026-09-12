# Grok 4.6 decision-led M01–M05/M03 checkpoint

Date: 2026-09-12 (Australia/Perth)

This checkpoint records the exact safe development work executed from the
Grok-selected packet. It does not authorize production deployment, firmware
flash, provider traffic, physical testing, production BTC consolidation,
OAuth, billing, private-data expansion, merge, or release.

## Control and writer attribution

```text
SOURCE_BASE=2489e69821638a37a506660735f5c2df251af5c4
INTEGRATED_SOURCE=a4e0015
TECHNICAL_DECISION_LEAD=Grok_4.6
EXECUTION_CONTROLLER=Codex
PREFERRED_WRITER=Z.ai_glm-5.3-flash
WRITER_EXCEPTION_ADOPTED=YES
ACTIVE_WRITER=Codex_temporary_fallback
GROK_WRITER_ASSIGNMENT=CODEX_TEMPORARY_FALLBACK
FALLBACK_REASON=ZAI_GLM_5_3_FLASH_AUTHENTICATION_BEFORE_MODEL_EXECUTION
FINAL_REVIEWER=grok_-m_grok-4.6
```

The exact Z.ai route was not retried after the unchanged authentication
failure. Grok explicitly corrected the writer assignment to Codex under the
operator-authorized exception. No credential value or auth response was
retained.

## Mission evidence

```text
M01_STATUS=PASS
M01_SOURCE=f6c399e
M01_COLLECTOR_CONTRACT=m4-sanitized-structural-v3
M01_PRODUCER_FIXTURES=7_EXPECTED_CLASSES_CAPTURED
M01_FRAGMENT_DUPLICATE_REORDER=PASS
M01_REJECTION_AND_MISSING_EVIDENCE=PASS
M01_DUPLICATE_TRACKING_BOUND=2048_WITH_EVICTION
M01_SELF_TEST=PASS

M02_STATUS=PASS_MOCK_ONLY
M02_BACKEND_CALENDAR_WEATHER_TESTS=39_PASS_0_FAIL
M02_FRONTEND_WEATHER_TESTS=10_PASS_0_FAIL
M02_PHYSICAL_OR_LIVE_PROVIDER_OBSERVATION=NO
M02_CARDS_MUTATED=NO

M04_STATUS=PASS_LOCAL_ISOLATED_DB
M04_SOURCE=b4abd92
M04_TARGET=ONE_WEEKLY_7D_1H_MAX_168
M04_MOCK_AND_PLAN_TESTS=10_PASS_0_FAIL
M04_ISOLATED_MARIADB_TESTS=4_PASS_0_FAIL
M04_CONCURRENCY=PASS_REAL_GROUP_ROW_LOCK
M04_RENDER_FAILURE_ROLLBACK=PASS
M04_EXPIRED_INTERRUPTED_PLACEHOLDER_RETRY=PASS
M04_PRODUCTION_CONSOLIDATION=NOT_APPLIED

M05_STATUS=PASS_PROVIDER_DISABLED
M05_VOICE_SESSION_TESTS=53_PASS_0_FAIL
M05_VOICE_SOURCE_CHANGED_FROM_BASELINE=NO
M05_HISTORICAL_100_TURN_1000_PARTIAL_BASELINE=REUSED_UNCHANGED

M03_STATUS=PASS_HOST_SOURCE_PROOF_WITH_ONE_FIXTURE_LIMITATION
M03_VOICE_FONT_COVERAGE=PASS
M03_U+66C7_DIRECT_RESOLUTION=PASS
M03_JA_EN_ZH_REPRESENTATIVE_RESOLUTION=PASS
M03_SANITIZED_FONT_MARKERS=PASS
M03_FRAMEBUFFER_LAYOUT_BUBBLE_AUDIO_MARKERS=PASS
M03_WEBSOCKET_EVENT_LOSS_SCRIPT=NOT_RUN_MISSING_CHECKOUT_TRANSPORT_SOURCES
M03_FIRMWARE_FLASH=NONE
```

The missing WebSocket regression fixture is the expected `esp_tcp.cc` and
`esp_ssl.cc` component source under the checkout's `78__esp-ml307` component;
only `web_socket.cc` is present. This is an environment/fixture limitation,
not evidence of a product regression and not grounds for changing firmware.

All relevant typecheck, lint, format and `git diff --check` gates pass. The
known aggregate dynamic-content Outlook decorator/import failure remains a
pre-existing harness interaction: the direct unchanged-worktree Outlook test
passes 4/4. It is not repaired or reclassified without identical-base proof.

## Frontier

```text
M01_M02_M03_M04_M05_SAFE_WORK=QUALIFIED
M06_STATUS=NOT_STARTED
M07_STATUS=NOT_READY
DEPLOYMENT=NONE
FIRMWARE_FLASH=NONE
PROVIDER_CALL=NONE
PHYSICAL_TEST=NONE
NEXT_ACTION=GROK_SELECT_M06_INTEGRATION_OR_OTHER_SAFE_WORK
```

No product activation authority is implied by this report.
