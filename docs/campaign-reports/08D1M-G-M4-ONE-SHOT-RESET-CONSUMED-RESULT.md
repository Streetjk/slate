# Campaign 8D1M-G M4 — one-shot NOTE4 reset consumed result

## Reconciliation

This report was reconciled from live PR #2 at `74cc1a65459280fbd865f5e33db991e6e9e98f64`. PR #2 remained OPEN / DRAFT / UNMERGED. The single authorized NOTE4 reset was already consumed; no reset, power-cycle, BOOT action, pairing action, credential change, or Voice interaction was performed by the controller.

The existing sanitized observer was verified running, its self-test passed, and its output contained no retained raw serial content. The observer session captured no allow-listed reset, watchdog, or boot event, so those cause markers remain unknown rather than being inferred. The observer did capture serial poll-structure matches, and the backend emitted the fixed authenticated-poll success marker.

## Sanitized evidence

Capture time: `2026-09-09T16:38:58+08:00` local controller time.

The observer session began before this capture and remained connected. Its latest sanitized serial counters were `BOOT=0`, `FATAL=0`, `POLL=22`, `WIFI=0`, `SERIAL_LINES=29`; it emitted zero allow-listed serial event rows for this session. The serial counters are structural counts, not claims about private content.

The running Slate container log contained exactly 11 fixed `DEVICE_AUTHENTICATED_POLL_RESULT=PASS` marker lines since the observer session start. Repeated observer backend snapshots were not counted as marker lines. The marker is emitted only after the authenticated poll guard and poll service complete successfully.

Read-only aggregate checks showed one registered device row and one registered-device row with `last_seen_at` in the last 30 minutes. The latest aggregate last-seen age was 58 seconds at capture. No device identity, address, SSID, credential, request/response payload, transcript, audio, provider payload, Calendar content, Outlook content, or raw serial data was retained or published.

## Required classification

```text
RESET_OBSERVED=YES_OPERATOR_REPORTED_ONE_CONTROLLED_NOTE4_RESET
RESET_REASON_CLASS=UNKNOWN_NO_SANITIZED_RESET_MARKER_CAPTURED
WATCHDOG_REASON_CLASS=UNKNOWN_NO_SANITIZED_WATCHDOG_MARKER_CAPTURED
BOOT_SEQUENCE_OBSERVED=BOOT_MARKER_NOT_CAPTURED_POST_BOOT_AUTHENTICATED_POLL_REACHED
WIFI_CONNECT_RESULT=PASS_BY_AUTHENTICATED_POLL
NETWORK_SETUP_RESULT=PASS_BY_AUTHENTICATED_POLL
SYNC_START_RESULT=PASS_BY_AUTHENTICATED_POLL
DEVICE_AUTHENTICATED_POLL_RESULT=PASS
DEVICE_AUTHENTICATED_POLL_MARKER_COUNT=11
DEVICE_ROW_COUNT=1
RECENT_AUTH_ACTIVITY_COUNT=11_FIXED_POLL_PASS_MARKERS_IN_CAPTURE_WINDOW
RECENT_TELEMETRY_COUNT=1_REGISTERED_DEVICE_ROW_RECENTLY_SEEN
BACKEND_HEALTH=HTTP_200_LOCAL_AND_PUBLIC
SLATE_RESTART_COUNT=0
MYSQL_RESTART_COUNT=0
FATAL_MARKER_COUNT=0
NETWORK_QUALIFICATION=PASS
EARLIEST_FAILED_BOUNDARY=NONE_AUTHENTICATED_POLL_SERVICE_REACHED
```

The direct Wi-Fi association and boot-cause markers were not present in the sanitized serial stream. Nevertheless, the authenticated poll PASS is identity-tied backend evidence that the device reached the backend through the configured network path, completed authentication, and entered the poll service. It therefore proves the required network qualification without treating generic HTTP health as proof.

## Frontier advancement

The single-device gate holds (`DEVICE_ROW_COUNT=1`), so the read-only qualification node is closed. The observer remains durably armed and verified; no runtime repair, build, deployment, or firmware flash is required for this boundary.

The next and only remaining human boundary is exactly one combined EN/JA multi-turn Voice AI physical soak. It must compare early and late turns and capture the existing sanitized latency, ordering, Japanese-kana, audio-chain, queue/resource, and reset/watchdog evidence. No additional routine checkpoint is inserted before that soak.

```text
READONLY_READY_NODE_COUNT=0
WAITING_DEVICE_COUNT=0
READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=EXACTLY_ONE_COMBINED_EN_JA_MULTI_TURN_VOICE_AI_PHYSICAL_SOAK
NEXT_ACTION=RUN_EXACTLY_ONE_COMBINED_EN_JA_MULTI_TURN_VOICE_AI_PHYSICAL_SOAK
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
```

PR #2 remains OPEN / DRAFT / UNMERGED.
