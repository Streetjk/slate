# Slate AI usage sync recovery — 16 October 2026

## Incident and findings
- At 08:12 AWST, the local device clock was current while the AI usage tile still displayed 06:42.
- Orange Pi quota collector and backend renderer were healthy; the renderer ran every five minutes.
- The existing Mac observer classified Slate's last server contact as stale at 08:15.
- USB serial opening reset the ESP32-S3; Wi-Fi rejoined and authenticated polls resumed at 08:21:24 and 08:26:31.
- The installed application was byte-for-byte identical to the 09 October five-minute firmware image (SHA256 a9d987c66cbdadd583cfa50b697dc6e0082c8fca4d01d20d3e70a394c5463117).
- Original trigger was not captured before the reset, so the exact reason the firmware stopped connecting cannot be confirmed. The code had two recoverability gaps: offline hibernation had no timer wake, and a connected but stalled sync worker had no independent progress watchdog.

## Code changes
- Preserve 60-second offline hibernation; schedule low-power saved-Wi-Fi retry via RTC after 900 seconds, including static frames and background-refresh failure.
- Preserve quiet hours (23:00 to 05:30 AWST) and the configured five-minute normal sync cadence.
- While charging prevents deep sleep, retry saved Wi-Fi profiles with a nonblocking scan every 900 seconds; request an immediate sync on recovery.
- Monitor the local sync worker from the UI loop: a missed completed burst at 12 minutes triggers a poll; no completion by 20 minutes while connected triggers a controlled MCU restart. No restarts for completed but failed HTTP calls, offline state, or quiet hours.
- Do not modify provider logins, MySQL, server containers, NVS or cached files.

## Verification and deployment
- Host offline sleep policy test: PASS.
- Host Wi-Fi retry policy test: PASS.
- git diff --check: PASS.
- ESP-IDF 5.5.2 full firmware build: PASS. App size 2563440 bytes, below 4 MiB partition.
- Old app partition backup: `~/Library/Application Support/Slate/firmware-backups/slate-app-pre-recovery-20261016.bin` (4 MiB, file mode 0600).
- New app SHA256: c5882acada07a4b35f26e512cdea42a8f53e9ff43ffd4899b028fbfca5ab478b.
- Flashed the **application partition only** at 0x10000, 460800 baud. Esptool write hash VERIFIED, exit 0, hard reset.
- At 08:40:46 AWST the Orange Pi again recorded Slate's authenticated check-in, RSSI -53 dBm.
- At 08:37:55 AWST the AI tile backend render had a fresh new image ETag.
- Physical e-ink screen freshness and extended offline/charger scenario testing have not been directly observed.

## Rollback
Use the protected 4 MiB backup above with esptool to restore offset 0x10000 on the same ESP32-S3. Do **not** erase full flash or touch NVS (0x9000), LittleFS/storage (0x410000), bootloader or partition table. Verify connection afterward.
