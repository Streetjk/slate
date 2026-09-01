# Stage Report

Stage: Campaign 6B — Flash authorization and physical hardware validation  
Date: 2026-09-01  
Status: FLASH PASS; physical and live-account validation pending human action

## Repository State

Repository: `Streetjk/slate`  
Branch: `integration/note4-custom`  
Start SHA: `cfd0886da8ef0875b14b271323aff695b59f8003`  
Flashed source SHA: `bca05819e2cccc5cfdc128d82ffda052b3913412`  
Upstream SHA: `cf5b4ffb0b3db09cb44c058b425b77c4fa58d21e`

## Harness

Codex version: `codex-cli 0.147.0`  
AGY version: `1.1.22`  
AGY model: `gemini-3.7-flash-high`  
AGY authentication: OAuth/ADC only  
Orchestration mode: `CODEX_PRIMARY`

## Objective

Preserve the pre-flash device state, flash the authorized Campaign 5 firmware to the verified NOTE4, verify the written regions, capture first-boot evidence, and execute the hardware MVP checklist without claiming unobserved physical behavior.

## Work Completed

- Re-fetched `origin` and fast-forwarded the local branch to the fetched documentation-only authorization commits.
- Re-verified the device as ESP32-S3 revision `v0.2`, 16 MB flash, USB-Serial/JTAG, MAC `44:1b:f6:c4:e5:74`.
- Re-verified Secure Boot disabled, Flash Encryption disabled, and no download-mode restrictions.
- Preserved a complete pre-flash 16 MB image before writing.
- Flashed only the bootloader, application, and partition-table regions using authoritative `flasher_args.json` offsets. No `--erase-all` operation and no eFuse operation were used.
- Re-verified all three written regions with esptool digest checks.
- Hard-reset the device and captured a partial USB boot log. The device re-enumerated and emitted an ESP image segment line; no panic or reset-loop evidence was present in the captured bytes. The capture is insufficient to certify all H4 physical behaviors.

## Files Changed

- `docs/campaign-reports/06-HARDWARE-VALIDATION.md` — this hardware checkpoint evidence.
- `docs/campaign-reports/CAMPAIGN-STATE.md` — conservative resume state and remaining human actions.

Private factory firmware backup and serial logs are outside the repository and are not committed.

## Architecture Decisions

- The factory/current pre-flash image is retained as a full 16 MB owner-only backup.
- The accepted build was written as three targeted regions: bootloader at `0x0`, partition table at `0x8000`, and app at `0x10000`.
- No eFuses were burned or modified. Secure Boot and Flash Encryption remain disabled.
- Physical display, button, audio, power, network, and account-consent outcomes are not inferred from source or esptool success.

## Tests

- `git fetch origin` — PASS; fetched authorization commits.
- `git status --short --branch` — PASS before flash; branch clean.
- `esptool ... chip-id` — PASS; ESP32-S3 revision `v0.2`.
- `esptool ... flash-id` — PASS; manufacturer `0x46`, device `0x4018`, detected size `16MB`.
- `espefuse ... summary` and `esptool ... get-security-info` — PASS/read-only; Secure Boot disabled, Flash Encryption disabled, USB download enabled, no UART download restriction observed.
- Full factory read: `esptool --chip esp32s3 --port /dev/cu.usbmodem31201 --baud 115200 --before usb-reset --after no-reset read-flash --no-progress 0x0 0x1000000 ...` — PASS; 16,777,216 bytes.
- Partition-table decode from the full backup — PASS; `nvs`, `otadata`, `phy_init`, `ota_0`, `ota_1`, and `assets` layout recorded below.
- Authorized targeted flash with esptool v5.2.0 — PASS; each region reported `Hash of data verified`.
- Post-flash `verify-flash` for bootloader, app, and partition table — PASS; all three digests matched.
- First-boot USB capture — PARTIAL; 64 bytes captured containing an `esp_image` segment line. No complete console transcript was available.
- Physical display/button/Wi-Fi/audio/sleep-wake checks — NOT RUN; require human observation and interaction.
- Microsoft/Google live OAuth checks — NOT RUN; require interactive account consent.

## Device and Backup Evidence

DEVICE_PORT: `/dev/cu.usbmodem31201`  
CHIP: ESP32-S3 (QFN56)  
CHIP_REVISION: `v0.2`  
FLASH_SIZE: `16MB`  
FLASH_ID: manufacturer `0x46`, device `0x4018`  
MAC: `44:1b:f6:c4:e5:74`

DURABLE_FACTORY_BACKUP_PATH: `/Users/ollama/NOTE4-backups/campaign5/note4-factory-full-bca05819e2cccc5cfdc128d82ffda052b3913412.bin`  
FACTORY_BACKUP_SIZE: `16777216` bytes  
FACTORY_BACKUP_SHA256: `241f93485d03317501157294e9c2c48983aa145fea0c9072f0de1f3cb1f2de3f`

Factory/current pre-flash partition layout:

```text
nvs       0x9000    16K
otadata   0xd000    8K
phy_init  0xf000    4K
ota_0     0x20000   6080K
ota_1     0x610000  6080K
assets    0xc00000  4M
```

## Flash Evidence

FLASHED_SOURCE_SHA: `bca05819e2cccc5cfdc128d82ffda052b3913412`  
FLASHED_IMAGE_SHA256: `522f189bd36ea9b19cfe6767d70ea00c87c909d7e98ae4c8e1b7015430a1b41c`  
FLASHED_APP_SHA256: `e880386b0155780389469c2895177528959a81c46f2fe44b411668ac184062b9`  
FLASH_RESULT: PASS  
POST_FLASH_VERIFY: PASS  
FIRST_BOOT_RESULT: PARTIAL — device reset and USB-Serial/JTAG re-enumerated; serial evidence incomplete

Authoritative write mapping from `firmware/build/flasher_args.json`:

```text
0x00000000 firmware/build/bootloader/bootloader.bin
0x00008000 firmware/build/partition_table/partition-table.bin
0x00010000 firmware/build/slate.bin
```

The successful command used esptool v5.2.0 at 115200 baud with `--before usb-reset`, `--after hard-reset`, DIO mode, 80 MHz frequency, and 16 MB size. It did not use `--erase-all`.

## Hardware MVP Matrix

```text
ENGLISH_UI=NOT RUN — physical display observation required
WIFI_SYNC=NOT RUN — network/account environment required
BTC_TRIO=NOT RUN — Web UI and physical frame navigation required
OUTLOOK_READONLY=NOT RUN — interactive Microsoft OAuth and physical display required
VOICE_EN=NOT RUN — microphone/speaker observation required
VOICE_JA=NOT RUN — microphone/speaker observation required
GOOGLE_CALENDAR_CONFIRMATION=NOT RUN — interactive Google OAuth and physical confirmation required
SLEEP_WAKE=NOT RUN — physical power/button observation required
OUTLOOK_WRITE_TEST=NOT RUN — live account test required; source-level read-only gate remains PASS
TOKEN_EXPOSURE_CHECK=NOT RUN physically; source/log/credential scan remained clean
```

## Security Checks

OAuth-only requirement: PASS for the implemented software paths; no credential was entered or logged during flashing.  
Static AI API keys found: NONE introduced.  
Outlook read-only: PASS in source/tests; live device/account test pending.  
Outlook exposed to Gemini: NO in source/tests; live device test pending.  
Google Calendar confirmation gate: PASS in source/tests; live device/account test pending.  
Secure Boot / Flash Encryption: both disabled before flash; no eFuse writes performed.  
Secrets detected: NONE in repository changes or committed evidence.

## AGY Review

Reviewer model: not invoked for the hardware-only operation.  
Effort level: not applicable.  
Verdict: not applicable; no source change was made.

P0 findings: none.  
P1 findings: none.  
P2 findings: none.  
P3 findings: none.

## Known Issues

- Complete serial boot evidence was not available through the USB capture; physical display, button, audio, network, sleep/wake, and account flows remain unverified.
- Live Microsoft and Google OAuth consent/account tests require user interaction.
- GitHub Actions workflow registration remains infrastructure debt; this flash used the accepted local build artifacts.
- The factory backup contains the pre-flash device state and must remain private; it is not in Git.

## Deviations

- A first flash command was rejected by esptool argument parsing before device connection because flash options were placed before `write-flash`; it performed no device operation. The corrected command then completed successfully.
- USB serial capture was partial, so no physical behavior was inferred from the boot log.

## Next Recommended Stage

Human completes the physical NOTE4 checklist and interactive Microsoft/Google OAuth tests using the already-flashed device. Record device observations, serial logs, account-test outcomes, and pass/fail evidence. Do not begin Airtable/Gantt.

## Final Stage Verdict

BLOCKED — hardware/account validation requires human physical observation and interactive OAuth consent; flash and post-write verification passed.
