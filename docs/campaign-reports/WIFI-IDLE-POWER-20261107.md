# Wi-Fi idle power regression — 7 November 2026

## Provenance and finding

- Governing campaign-instruction commit: 08501bb.
- Investigated worktree: /Users/ollama/slate-hcmo-ca-oct16.
- Base: b3b5fffd55f4c37216c106ee9887c9cb575292ea, branch fix/slate-hcmo-ca-wifi-refresh.
- Repair branch: fix/wifi-idle-power-20261107.
- The earlier /Users/ollama/slate-context-navigation worktree at 27d69ea is NOT the latest Wi-Fi repair lineage.
- b3b5fff changed WIFI_PS_MAX_MODEM to WIFI_PS_NONE to prevent beacon timeouts during HTTPS transfers. However, it applies NONE after every connection and never restores modem sleep between transfers. The radio therefore remains awake during the five-minute polling wait. This is a confirmed source regression with a direct power-consumption mechanism.
- The Nov 5 commit records successful build and physical synchronization. Its preserved local application binary SHA256 is 140bfb773ebaba979e7faa086c11e92a5e9fbd3ce370103a2aff5dbd22400e12.
- The current installed image was NOT independently read back in this investigation. Backend version 0.1.27 is insufficient to establish exact binary identity because several different builds share it. Thus attribution of the user's battery loss to this image remains strongly supported, not physically proven.
- Backend observations supplied by the controller: five-minute polling, latest battery 65%, RSSI -61 dBm, fw_version 0.1.27. The database retains only latest battery, so no measured comparative discharge rate is available.

## Repair

- Idle station mode uses WIFI_PS_MIN_MODEM (AP DTIM), not the older aggressive MAX_MODEM/listen_interval=10 profile.
- Preserve WIFI_PS_NONE throughout initial network setup, each sync/download burst including connection teardown, voice configuration fetch and active voice conversation.
- A noncopyable RAII activity lease releases on normal return, error and cancellation. Reference counting prevents overlapping setup/sync/voice owners from restoring sleep too soon.
- A mutex serializes ownership changes and radio mode application, including IP reacquisition. No user callback or network transfer is invoked under this mutex.
- Five-minute polling, quiet hours, CPU policy, inspection CA trust, retry budget, NVS, partitions and cached content are unchanged.
- Background SNTP remains ordinary low-volume UDP compatible with modem sleep. HTTP, WebSocket and MQTT network call sites were audited for activity coverage.

## Verification

PASS:
- New wifi_power_policy_host_test, with UndefinedBehaviorSanitizer: idle, nested ownership, invalid-release underflow prevention, 10,000 balanced cycles, production RAII early return and nested lifetime, simulated IP reacquisition while active/idle, noncopy/nonmove checks.
- Existing wifi_retry_policy_host_test.
- Existing offline_sleep_policy_host_test.
- Existing framebuffer_ops_host_test.
- Existing xiaozhi_bubble_update_host_test.
- git diff --check.
- Full ESP-IDF 5.5.2 ESP32-S3 build, followed by rebuild after RAII test refinement.

Build command:
```sh
source /Users/ollama/esp-idf-v5.5.2/export.sh
idf.py -C firmware -B /Users/ollama/slate-hcmo-ca-oct16/build-hcmo build
```

Candidate application:
- Path: /Users/ollama/slate-hcmo-ca-oct16/build-hcmo/slate.bin
- Size: 0x272310 bytes (2,564,880 bytes); 39% application-partition headroom.
- SHA256: fda24a8fcc08630ba72f9e538d91a8224aff2f1f03209ad929e9e8a24e996e05
- Generated configuration confirms PM, tickless idle, full public CA bundle and local inspection CA enabled.

Review: Astra implementation/self-review and controller diff review performed. No AGY review or physical AP/current test performed in this task; do not label those PASS.

## Deployment hold and validation

NOT FLASHED. Controller observed /dev/cu.usbmodem31101 and /dev/cu.usbmodem31201 absent. No serial port was opened, no device reset, and no backend/provider configuration changed.

When hardware is reconnected and physical action is authorized:
1. Establish exact chip/device identity and read back the installed application partition before writing; compare with known baseline. Do not infer identity from version 0.1.27 alone.
2. Back up offset 0x10000, length 0x400000, then flash ONLY the verified application image at offset 0x10000. Do not use full-flash erase or the generated multi-partition flash command; preserve NVS and LittleFS.
3. Verify write hash, authenticated check-in and logs alternating active_none -> idle_min_modem after sync.
4. On the problematic AP, observe at least three five-minute polls and a representative image download/voice session, checking beacon timeouts and successful idle restoration.
5. Measure unplugged idle current or a controlled multi-hour battery-voltage/discharge comparison. USB-powered testing disables CPU light sleep and cannot establish battery-runtime improvement.

Preserved pre-repair build: firmware/build-hcmo/slate-before-idle-fix-b3b5fff.bin. This is a known prior build, NOT a fresh backup of the physical device. Use the fresh device readback for rollback if identity differs.

## Separate findings, deliberately not changed

- 27d69ea's offline RTC retry is bypassed by App::HandleBackgroundRefreshDone passing manual_wake_only=true after an offline background wake; failed recovery can sleep indefinitely. This explains stale/offline behavior, not higher idle power.
- Sync health watchdog retains pre-quiet-hours/offline completion time; when its gates reopen, elapsed suppressed time can produce an immediate restart. No evidence of repeated resets was captured here.
- Minute-by-minute e-paper clock redraw and five-minute polling carry intentional power costs. They were not rolled back or changed.
