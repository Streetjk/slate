# One-minute offline hibernation — 8 October 2026

Base: ee6c901. Branch: fix/wifi-auto-recovery.
Campaign instruction source: 08501bb3ca75739e43fbf4f54811e0243ca5d193.
User requested one-minute Wi-Fi failure deep sleep and front-button wake.

## Fault and change

Full-active mode deliberately disables ordinary idle deep sleep. When initial
saved Wi-Fi setup fails it also started a captive portal and disabled the sleep
manager. Stopping scans after 30 seconds therefore did not shut down the CPU,
SoftAP or other active tasks.

For already-registered units with saved profiles:
- After startup networking/PM initialization finishes, arm the offline monitor.
- Use the original networking start timestamp, not an extra minute after failure.
- Successful connectivity clears the offline timestamp. A later loss gets a fresh
  60-second window; zero start is valid, negative timestamp means inactive.
- Check deadlines even under a continuously busy UI event queue.
- Failed startup uses cached frames rather than enabling a permanent hotspot.
- After 60 seconds offline, begin the existing guarded shutdown/deep sleep path.
- Offline sleep disables RTC timer wakes and clears the quiet-wake marker, so
  scheduled frames cannot wake the device repeatedly to search for Wi-Fi.
- Background-refresh network failure also returns to manual-wake sleep; intentional
  quiet-hours deferral retains its existing wake at quiet-hours end.

Existing charge/unbound/onboarding guards are preserved. First-time setup keeps
its portal. Existing 30-second automatic reconnect budget is unchanged.

## Wake and practical limits

Existing EXT1 GPIO0 ENTER, GPIO18 DOWN and GPIO2 charge wake remain configured.
GPIO17 main-power hold and display/audio rail shutdown reuse the proven code.
GPIO39 UP is not an RTC wake pin.

The front button triggers wake without waiting for a timer, but deep sleep
reboots the ESP32-S3; visible UI/navigation is not instantaneous. Firmware boot,
Wi-Fi attempts and EPD initialization take additional time. The displayed e-ink
image remains while asleep. Shutdown waits for sync and EPD to finish; 60 seconds
is the policy deadline to start safe shutdown, not a measured physical sleep time.
Returning within Wi-Fi range alone does not wake the sleeping device.

## Validation

- 12 boundary/reconnect/clock-range assertions in offline policy host test: PASS
  with undefined-behaviour sanitizer and warnings as errors.
- Existing Wi-Fi retry host regression: PASS.
- ESP-IDF v5.5.2 build: PASS.
- git diff --check: PASS.
- Independent packet-only AGY review: SUCCESS, PASS, no findings.
- Requested model: gemini-3.7-flash-medium. No observed model ID returned.
- Verified pre/post CLI 1.2.13 SHA-256:
  ef3728208834483754b06fd99963b4b6320740bf237212768dfed5256ae24ddb.
- Final packet SHA-256:
  a7ba175a7f9cde122e0399d9324a8512e0c0200ed25dd6b95340953fec9081e4.
- Final conversation: 48a8f614-e893-4597-bff0-344c48edc8c8.
- Candidate slate.bin SHA-256:
  650fa29a84afd06a36a6018a53aa1543de060607f00a5e294cabdbca54c05d51.

No partition, NVS schema, credentials or synchronization protocol changes.
No firmware flash, serial access, device reset, merge or release occurred.
Actual sleep current, button wake latency and out-of-range physical behaviour
remain to be measured after separately authorized flashing.
