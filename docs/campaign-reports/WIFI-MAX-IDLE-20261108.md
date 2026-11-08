# Slate NOTE4 idle MAX_MODEM battery trial — 8 November 2026

## Complaint and evidence

- User reported the prior week's battery life was substantially better; on 8 November the NOTE4 lost approximately 6 percentage points since morning. That is a user observation, not a controlled capacity measurement.
- Backend at 2026-11-08 16:44 AWST: battery 74%, RSSI -49 dBm, firmware version 0.1.27. The `devices` table stores only the latest battery percentage and cannot reconstruct a discharge curve.
- Backend showed roughly 11–12 successful authenticated polls per hour throughout the day; no evidence of an excessive polling loop.
- Source comparison: baseline `27d69ea` used `WIFI_PS_MAX_MODEM` and `wifi_sta_config_t.listen_interval=10`. Previous repair `87b39b5` used `WIFI_PS_MIN_MODEM` at idle and omitted listen_interval, while keeping `WIFI_PS_NONE` during setup, sync and voice transfers. Both lineages already had five-minute polling (introduced 9 Oct) and no daytime connected deep sleep (changed 8 Oct).
- This is a plausible remaining power regression: MIN_MODEM follows the AP DTIM and may wake the radio more frequently than MAX_MODEM. It is not yet a measured current-consumption attribution. Earlier aggressive modem sleep produced beacon/HTTPS timeouts during active transfers; active-only NONE aims to avoid that failure.

## Change

- Branch `fix/wifi-max-idle-20261108`; source commit `a0efbbd`, based on `53fea7c`.
- In `firmware/main/network/wifi.cc`: restore listen interval 10 and `WIFI_PS_MAX_MODEM` only for idle station mode. Preserve the reference-counted `ScopedNetworkActivity` leases selecting NONE for setup, HTTP sync/download and Xiaozhi voice traffic.
- Update power-policy comment. No changes to five-minute polling, quiet hours, existing RTC/deep sleep behavior, CA trust, credentials, NVS, storage, or partitions.

## Validation and deployment

- Five host suites PASS: wifi_power_policy, wifi_retry_policy, offline_sleep_policy, framebuffer_ops, xiaozhi_bubble_update.
- ESP-IDF 5.5.2 full incremental build PASS; `slate.bin` size 2,564,880 bytes, SHA256 `6c6d14e3ec7f9f071ed0ee7c48cfb15a633d0c396d6d2126936c6888102352aa`.
- Preserved rollback of previous MIN_MODEM application at `/Users/ollama/slate-device-backups/2026-11-08-note4-wifi-power/slate-87b39b5-idle-min-modem.bin`, SHA256 `fda24a8fcc08630ba72f9e538d91a8224aff2f1f03209ad929e9e8a24e996e05`. The pre-Nov8 physical readback also remains in that backup directory.
- Physically identified ESP32-S3 NOTE4 by USB MAC `44:1B:F6:C4:E5:74` at `/dev/cu.usbmodem101`, with 16 MB flash and a 4 MB factory app at offset 0x10000.
- Flashed application only at `0x10000`; esptool verified data hash and hard reset succeeded. No NVS, SPIFFS or partition-table writes.
- Serial: active_none at 1.595s; Wi-Fi connected at 4.404s; idle_max_modem at 27.622s. The next 5-minute cycle went active_none at 327.624s, returned idle_max_modem at 339.787s. Backend accepted authenticated poll at 2026-11-08 16:57:06 AWST.
- During this monitored interval, no disconnect or beacon-timeout event was observed. The startup `bcn_timeout: 25000` line is a driver configuration message, not evidence of an actual timeout.

## Acceptance still pending

- The USB-powered test cannot prove battery-runtime improvement. Unplug and perform a controlled 24–48h percentage/voltage discharge comparison under similar usage and access-point conditions, preferably recording starting battery and time.
- Longer AP-specific stability and voice/gallery transfers have not been accepted on this trial. If beacon timeouts or stale sync recur, roll back to the preserved MIN_MODEM application, without erasing NVS or SPIFFS.
