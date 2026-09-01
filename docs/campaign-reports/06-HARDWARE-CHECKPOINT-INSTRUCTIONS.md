# Campaign 6 — Physical NOTE4 Hardware Checkpoint Instructions

Date: 2026-09-01
Repository: `Streetjk/slate`
Integration branch: `integration/note4-custom`
Status: ACTIVE HARDWARE DIRECTIVE

## Authority

This directive governs the next NOTE4 action after Campaign 5 software MVP PASS.

It does **not** reopen completed Campaigns 0–5 and does not authorize Airtable/Gantt work.

Controller remains Codex/Luna. AGY remains read-only reviewer/researcher. Deterministic evidence and real hardware observations remain authoritative.

## Known accepted software checkpoint

Expected integration branch before this instruction commit:

`c2a182efb9e9e2c8a777fa84523459a949101c71`

Accepted firmware source commit:

`bca05819e2cccc5cfdc128d82ffda052b3913412`

Expected Campaign 5 artifact hashes:

- `firmware/build/slate-full.bin` SHA-256: `522f189bd36ea9b19cfe6767d70ea00c87c909d7e98ae4c8e1b7015430a1b41c`
- `firmware/build/slate-ota.bin` / `slate.bin` SHA-256: `e880386b0155780389469c2895177528959a81c46f2fe44b411668ac184062b9`

Always verify live Git/local state instead of assuming the values above are still current.

---

# Phase H0 — Non-destructive device reconnaissance

The physical NOTE4 is connected to the Mac mini running Codex.

Before any erase or write operation:

1. `git fetch origin` and verify this is `Streetjk/slate` on `integration/note4-custom` with an expected clean working tree.
2. Read:
   - `AGENTS.md`
   - `docs/campaign-reports/CAMPAIGN-INSTRUCTIONS.md`
   - `docs/campaign-reports/CAMPAIGN-STATE.md`
   - `docs/campaign-reports/05-MVP-FINAL.md`
   - `docs/campaign-reports/05-MVP-PRE-HARDWARE.md`
   - this file
3. Detect the NOTE4 serial device on macOS using read-only inspection (`/dev/cu.usbmodem*`, `/dev/cu.usbserial*`, `system_profiler`, `ioreg`, esptool read-only commands, or equivalent).
4. Mechanically identify the ESP32-S3 and record:
   - serial port
   - chip/revision
   - flash size
   - flash ID if available
   - MAC/device identity normally exposed by tooling
5. Inspect ESP32-S3 security/eFuse state **read-only**. Determine at minimum:
   - Secure Boot state
   - Flash Encryption state
   - UART download/read/write restrictions
   - any condition that makes custom flashing unsafe or irreversible
6. Do **not** burn/modify eFuses.
7. Verify the Campaign 5 firmware artifacts and hashes against the values above.

If chip identity cannot be established or security configuration makes custom flashing unsafe/irreversible, STOP and record the blocker.

---

# Phase H1 — Preserve factory firmware before flashing

If flash reading is permitted:

1. Determine the real detected flash size mechanically.
2. Read a complete factory flash backup before writing custom firmware.
3. If the device is confirmed as 16 MB, the expected full range is `0x0` through `0x1000000`; use the locally installed esptool's correct syntax rather than blindly copying a command.
4. Store the backup outside tracked repository files. Do **not** commit the binary to Git.
5. Calculate SHA-256 and size of the factory backup.
6. Read/decode the current partition table where safely possible and record it.
7. Preserve any readable metadata useful for rollback/recovery.

Do not erase flash merely to create the backup.

If factory flash cannot be read because of legitimate security configuration, record that fact and do not bypass security controls.

---

# Mandatory pre-flash checkpoint

Before any write, produce a local evidence snapshot containing:

```text
NOTE4_USB_DETECTED=
SERIAL_PORT=
CHIP=
CHIP_REVISION=
FLASH_SIZE=
FLASH_ID=

SECURE_BOOT_ENABLED=
FLASH_ENCRYPTION_ENABLED=
UART_DOWNLOAD_RESTRICTIONS=
CUSTOM_FLASH_SAFETY=

FACTORY_FLASH_READABLE=
FACTORY_BACKUP_COMPLETED=
FACTORY_BACKUP_PATH=
FACTORY_BACKUP_SIZE=
FACTORY_BACKUP_SHA256=
FACTORY_PARTITION_LAYOUT=

CAMPAIGN5_SOURCE_SHA=
CUSTOM_FULL_IMAGE_SHA256=
CUSTOM_APP_IMAGE_SHA256=

READY_TO_FLASH=true|false
BLOCKER=
```

## Stop boundary

**Do not flash during H0/H1.**

Stop after the pre-flash snapshot and preserve evidence. The next controller/human directive will decide whether to flash.

Do not claim physical PASS from software/build evidence.

---

# After a later explicit flash authorization

The already-preserved Campaign 5 physical checklist remains the required validation sequence:

1. flash and capture serial boot log;
2. English boot/settings/status/error UI;
3. Wi-Fi + backend sync + reconnect;
4. cached frame display + sleep/wake;
5. BTC Daily/Weekly/Monthly trio and local switching;
6. Outlook OAuth + read-only Perth agenda + recurrence/all-day/offline behavior;
7. English/Japanese voice STT, Q&A/Search, TTS, reconnect;
8. Google Calendar proposal Cancel/timeout/replay/Confirm; exactly one write only after Confirm;
9. verify no Outlook writes and no token exposure;
10. record pass/fail, logs, device identity, source SHA and firmware hash.

Any hardware failure must be reproduced and repaired narrowly, followed by deterministic regression and AGY review where the fix is non-trivial or security-sensitive.

Do not begin Airtable/Gantt until the NOTE4 MVP hardware checkpoint is accepted.
