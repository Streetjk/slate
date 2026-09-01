# Campaign 6B — Flash Authorization and Physical Hardware Validation

Date: 2026-09-01
Repository: `Streetjk/slate`
Integration branch: `integration/note4-custom`
Status: AUTHORIZED HARDWARE EXECUTION

## Preconditions

This directive is based on the completed local pre-flash reconnaissance reported by Codex:

- NOTE4 USB detected on `/dev/cu.usbmodem31201`
- ESP32-S3 (QFN56), revision v0.2
- flash size 16 MB
- Secure Boot disabled
- Flash Encryption disabled
- no UART download restrictions observed
- factory flash readable
- full 16 MB factory backup completed
- factory backup SHA-256: `241f93485d03317501157294e9c2c48983aa145fea0c9072f0de1f3cb1f2de3f`
- Campaign 5 source SHA: `bca05819e2cccc5cfdc128d82ffda052b3913412`
- expected custom full image SHA-256: `522f189bd36ea9b19cfe6767d70ea00c87c909d7e98ae4c8e1b7015430a1b41c`
- expected custom app image SHA-256: `e880386b0155780389469c2895177528959a81c46f2fe44b411668ac184062b9`
- local conclusion: `READY_TO_FLASH=true`

Before writing anything, re-check the connected port/device and hashes. If any precondition differs materially, STOP and report rather than assuming the earlier observation still holds.

## H2 — Preserve rollback evidence durably

Before flashing:

1. Copy the existing factory image from its temporary/random backup directory into a durable user-owned backup location outside the Git repository, e.g. a dedicated NOTE4 backup directory under the user's home directory.
2. Preserve mode 600 or equivalent owner-only permissions.
3. Recompute SHA-256 after the copy and require exact match with:
   `241f93485d03317501157294e9c2c48983aa145fea0c9072f0de1f3cb1f2de3f`
4. Record the durable backup path, size and hash in the hardware report.
5. Do not commit the factory image to Git.

If the durable backup copy/hash fails, STOP before flashing.

## H3 — Authorized custom flash

Flashing is now explicitly authorized, provided H2 and the preconditions pass.

Use the repository's accepted Campaign 5 build artifacts and the locally verified correct ESP-IDF/esptool invocation. Do not improvise partition offsets from memory if the build metadata provides the authoritative offsets.

Requirements:

- target the mechanically verified ESP32-S3 device only;
- do not burn/modify eFuses;
- do not enable Secure Boot or Flash Encryption in this checkpoint;
- capture the complete flash command and result;
- verify write completion and post-write reset behavior;
- preserve serial logs from first boot.

If flashing fails, do not repeatedly erase/reflash blindly. Capture the exact error and inspect before retrying.

## H4 — Immediate boot/smoke validation

After successful flash, capture serial output and verify first, before deeper account/config testing:

1. device boots without reset loop/panic;
2. e-paper initializes and displays expected English UI;
3. buttons respond;
4. Wi-Fi/pairing/settings path remains reachable;
5. filesystem/content partition mounts successfully;
6. audio stack initializes without fatal error;
7. sleep/wake path does not immediately crash or brick the device.

If any of these fail, mark HARDWARE_REVISE, preserve logs, diagnose narrowly, and do not continue to OAuth/calendar testing until the base device is stable.

## H5 — Functional MVP physical checklist

Once H4 passes, execute the existing Campaign 5 physical checklist:

1. English boot/settings/status/error UI.
2. Wi-Fi + backend sync + reconnect.
3. Cached frame display + sleep/wake.
4. Provision BTC trio in Web UI and verify Daily/Weekly/Monthly frames plus local frame switching.
5. Microsoft OAuth and Outlook read-only Perth agenda, including recurrence/all-day/offline/reconnect behavior.
6. English and Japanese voice STT, Q&A/Search, TTS and reconnect.
7. Google Calendar voice event proposal: Cancel, timeout, replay resistance and Confirm; exactly one write after Confirm.
8. Verify no Outlook write capability and no token exposure on device/logs.

Interactive OAuth consent is authorized when needed, but do not expose tokens in reports or logs committed to Git.

## H6 — Evidence, fixes and review

For each item record PASS/FAIL/NOT RUN and supporting evidence.

If a hardware-specific defect is found:

- reproduce it;
- implement the narrowest valid fix;
- run focused deterministic tests;
- rebuild exact firmware;
- run relevant regression;
- use AGY review for non-trivial, security-sensitive, auth, confirmation, voice lifecycle, or persistence changes;
- flash the repaired candidate only after the new candidate SHA/hash are recorded.

Do not silently broaden scope.

## H7 — Publish checkpoint

Publish a new report:

`docs/campaign-reports/06-HARDWARE-VALIDATION.md`

Include at minimum:

```text
DEVICE_PORT=
CHIP=
DURABLE_FACTORY_BACKUP_PATH=
FACTORY_BACKUP_SHA256=
FLASHED_SOURCE_SHA=
FLASHED_IMAGE_SHA256=
FLASH_RESULT=
FIRST_BOOT_RESULT=
ENGLISH_UI=
WIFI_SYNC=
BTC_TRIO=
OUTLOOK_READONLY=
VOICE_EN=
VOICE_JA=
GOOGLE_CALENDAR_CONFIRMATION=
SLEEP_WAKE=
OUTLOOK_WRITE_TEST=
TOKEN_EXPOSURE_CHECK=
HARDWARE_VERDICT=PASS|REVISE|BLOCKED
BLOCKERS=
```

Update `CAMPAIGN-STATE.md` conservatively to reflect the real physical result.

Commit and push only text/source/report/state changes; never commit private factory firmware, tokens, secrets, or raw credential-bearing logs.

## Stop/continue rule

- If H4/H5 reaches a genuine hardware/software defect requiring code repair: continue automatically through narrow repair -> tests -> review -> rebuild -> reflash -> retest, unless a hard-stop security/credential/destructive ambiguity occurs.
- If all MVP hardware checks pass: publish PASS and stop for final release-readiness review. Do not begin Airtable/Gantt yet.
- If interactive human input is required for account consent or physical observation that Codex cannot perform autonomously, request only that specific action and preserve all completed evidence.
