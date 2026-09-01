
Stage: MVP pre-hardware checkpoint
Date: 2026-09-01
Status: HUMAN ACTION REQUIRED

## Repository State

Repository: Streetjk/slate
Branch: `integration/note4-custom`
Base SHA: `bca05819e2cccc5cfdc128d82ffda052b3913412`
Head SHA before report publication: `bca05819e2cccc5cfdc128d82ffda052b3913412`
Upstream SHA: `cf5b4ffb0b3db09cb44c058b425b77c4fa58d21e`

## Harness

Codex version: `codex-cli 0.147.0`
AGY version: `1.1.22`
AGY model: `gemini-3.7-flash-high`
AGY authentication: OAuth/ADC only
Orchestration mode: `CODEX_PRIMARY`

## Objective

Provide reproducible firmware and an explicit checklist before any physical NOTE4 interaction. No flashing was performed by Codex.

## Firmware Artifact

Source commit: `bca05819e2cccc5cfdc128d82ffda052b3913412`
ESP-IDF: `v5.5.2`
Target: `esp32s3`
Container image digest: `sha256:05cbfc42ed2e987b8026722c15bf1d8523d3e4fd1b4ac04d2e4056f5e0918b99`

Artifacts:

- `firmware/build/slate-full.bin` — SHA-256 `522f189bd36ea9b19cfe6767d70ea00c87c909d7e98ae4c8e1b7015430a1b41c`, 2,583,760 bytes.
- `firmware/build/slate-ota.bin` — SHA-256 `e880386b0155780389469c2895177528959a81c46f2fe44b411668ac184062b9`, 2,518,224 bytes.

The files are ignored build outputs and are not committed to GitHub.

## Flash Command

From the repository root, after confirming the source/artifact hash:

```bash
python -m esptool --chip esp32s3 -b 460800 \
  --before default_reset --after hard_reset write_flash \
  --flash_mode dio --flash_size 16MB --flash_freq 80m \
  0x0 firmware/build/bootloader/bootloader.bin \
  0x8000 firmware/build/partition_table/partition-table.bin \
  0x10000 firmware/build/slate.bin
```

This command requires a connected NOTE4 and is not executed in this campaign.

## Expected Boot Behavior

- English boot/splash and settings UI.
- Existing Wi-Fi, synchronization, sleep/wake, and audio initialization remain available.
- Existing voice scene can display a Google Calendar proposal.
- ENTER confirms a displayed proposal; UP/DOWN cancels it.
- BTC Daily/Weekly/Monthly frames are available through the existing frame/group navigation after trio provisioning.
- A failed or unavailable backend must not cause an unconfirmed calendar write.

These are expected behaviors from source/build evidence, not claimed physical test results.

## Physical Test Checklist

- Flash and verify serial boot log.
- Confirm English boot, settings, pairing, status, and error text.
- Confirm Wi-Fi connection, backend sync, cached frame display, sleep, and wake.
- Provision BTC trio in the Web UI; verify Daily, Weekly, and Monthly frames and local frame switching.
- Connect Outlook and verify read-only agenda display, Perth timezone, recurrence, all-day, offline cache, and reconnect.
- Ask English and Japanese voice questions; verify transcription, Q&A/search path, TTS, and reconnect.
- Request a Google Calendar event; verify proposal display; test Cancel, timeout, replay, and Confirm. Confirm only one event is created after Confirm.
- Verify no physical flow exposes tokens or writes Outlook.
- Record device model, firmware hash, date, logs, and pass/fail for every item.

## Rollback Method

- Stop using the device and preserve serial logs.
- Reflash the last accepted full image, verifying its SHA-256 before flashing.
- For a source-reproducible rollback to the previous software checkpoint, build the known-good Campaign 3B source commit `f0e3e9adfaab59cf58857f020c6f0d9945da3c9a` with the same `espressif/idf:v5.5.2` image and repeat `merge-bin`.
- Do not force-push or rewrite the integration branch.

## Tests

- Firmware build and merge-bin passed at source commit `bca0581`.
- Full software regression and final AGY high-effort review passed; see `05-MVP-FINAL.md`.

## Security Checks

OAuth-only requirement: PASS for implemented integrations; no credentials are in artifacts.
Static AI API keys found: NONE introduced.
Outlook read-only: PASS in source/tests.
Outlook exposed to Gemini: NO.
Google Calendar confirmation gate: PASS in source/tests.
Secrets detected: NONE.

## Known Issues

Physical hardware and interactive OAuth tests are not complete. Do not interpret source/build success as a device boot or account-integration result.

## Deviations

No device was flashed because this is the mandatory human hardware boundary.

## Next Recommended Stage

Human executes the physical checklist and reports results with the recorded firmware hash.

## Final Stage Verdict

HUMAN ACTION REQUIRED
