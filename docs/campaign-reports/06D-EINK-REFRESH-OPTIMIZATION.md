# Stage Report

Stage: Campaign 6D — NOTE4 E-Ink refresh optimization
Date: 2026-09-01
Status: D0 BASELINE COMPLETE — second-pass optimization pending; optimized flash not authorized

## Repository State

Repository: `Streetjk/slate`
Branch: `integration/note4-custom`
Start SHA: `3446979b695afd40c920af1610f7c0659df4dbee`
End SHA: `e32ff24` (diagnostic instrumentation; report/state reconciliation follows)
Campaign instruction SHA: `3446979b695afd40c920af1610f7c0659df4dbee`
Campaign 5 production firmware source SHA: `bca05819e2cccc5cfdc128d82ffda052b3913412`
Diagnostic firmware source SHA: `e32ff24` (same product behavior, compile-time timing trace enabled)
Diagnostic app SHA-256: `a22b1e00da653abc5faad29f1d561c72859a2e3f6fc7d1de22b56ca4e2467506`

## Harness

Codex version: `codex-cli 0.147.0`
AGY version: `1.1.23`
AGY model: not invoked
AGY authentication: OAuth/ADC only
Orchestration mode: `CODEX_PRIMARY`

## Objective

Measure the current NOTE4 e-paper refresh path, implement only safe and measurable latency improvements, and produce an optimized firmware artifact without flashing it automatically.

## Work Completed

- Fetched `origin` and fast-forwarded the clean integration branch to the current 06D directive.
- Read `AGENTS.md`, campaign instructions/state, the 06C deployment report, firmware README, and the complete 06D directive.
- Inspected the existing SSD1683/SSD2683-compatible path. It currently performs full-panel transition-data transfer for partial refreshes, retains the existing debounce/throttle/full-refresh safeguards, and has no host-native firmware test harness in the repository.
- Reconciled the formerly stale D0 report against `origin/integration/note4-custom`; no remote advance was present.
- Built the compile-time-gated timing diagnostic with exact ESP-IDF `v5.5.2`, target `esp32s3`.
- Flashed only the diagnostic app at `0x10000` with `esptool v5.2.0`; no erase, bootloader, partition-table, NVS, LittleFS, or pairing write was performed.
- Captured 31 button events, 21 LVGL invalidation/flush-return flows, and 28 completed refreshes from `/dev/cu.usbmodem31201`.
- The trace confirms the existing partial path transfers the entire 400x300 transition frame. These are the first physical D0 measurements; no source optimization gain is claimed.
- During capture, HTTPS polls failed with `ESP_ERR_HTTP_CONNECT`; pairing data was preserved, but BTC D/W/M was not counted as a successful synchronized flow.

## Files Changed

- `firmware/main/utils/timing_trace.h` plus display/app/scene instrumentation — compile-time-gated physical timing evidence; default behavior is unchanged.
- `docs/campaign-reports/06D-EINK-REFRESH-OPTIMIZATION.md` — reconciled D0 and optimization checkpoint.
- `docs/campaign-reports/CAMPAIGN-STATE.md` — durable campaign position and human boundary.

## Architecture Decisions

- Do not change waveform/LUT tables, EPD voltage/booster settings, SPI timing, power sequencing, reset/re-init behavior, or cleanup-full cadence without separate evidence and authorization.
- D0 physical measurements are complete. The next bounded change is a real `0x83` windowed partial transfer, retaining reset/re-init and full-refresh safeguards.
- Preserve the healthy Orange Pi deployment and its rollback image; no Docker cleanup was attempted during this checkpoint.

## Tests

- `git fetch origin` — PASS; remote branch remained at `3446979b695afd40c920af1610f7c0659df4dbee` before this checkpoint.
- `esptool --chip esp32s3 ... write-flash ... 0x10000 .../slate.bin` — PASS; app-only diagnostic write, no erase.
- Diagnostic firmware build — PASS; ESP-IDF `v5.5.2`, target `esp32s3`, separate `build-timing` directory.
- Diagnostic app SHA-256 — PASS; `a22b1e00da653abc5faad29f1d561c72859a2e3f6fc7d1de22b56ca4e2467506`.
- Serial capture — PASS; `/dev/cu.usbmodem31201`, 684 timing records, 28 completed refreshes.
- Campaign 5 production artifacts remain unchanged: app `e880386b0155780389469c2895177528959a81c46f2fe44b411668ac184062b9`, full image `522f189bd36ea9b19cfe6767d70ea00c87c909d7e98ae4c8e1b7015430a1b41c`.
- `git diff --check` — PASS before this report update.
- AGY review — NOT RUN for diagnostic-only work; required after the windowed controller change.

## Baseline Measurements

```text
BUTTON_EVENT_TIMESTAMP=CAPTURED (31 events)
SCENE_INVALIDATION_TIMESTAMP=CAPTURED (21 flows; direct changes typically <6 ms after button event)
LVGL_FLUSH_TIMESTAMP=CAPTURED (final flush return)
REFRESH_TASK_START=CAPTURED (direct flows typically ~50-64 ms after final flush; task-to-path start ~1.8-2.7 ms)
FULL_VS_PARTIAL_DECISION=CAPTURED (25 partial, 3 full)
SPI_TRANSFER_START_END=CAPTURED (partial median 21.80 ms for 30,000 bytes; full median 14.56 ms for 30,000 bytes)
BUSY_COMPLETION=CAPTURED (display-refresh BUSY median partial 451.59 ms; full 866.53 ms)
BUTTON_TO_VISIBLE_REFRESH_LATENCY=CAPTURED (direct partial interactions typically ~0.91-0.98 s; full ~1.34 s)
SMALL_PARTIAL_FLOW=PASS (settings/menu indicator changes; current path still sends full transition frame)
MENU_NAVIGATION_FLOW=PASS (settings and frame/group navigation captured)
BTC_DWM_FLOW=NOT_VALIDATED (synchronization failed during capture; no successful D/W/M comparison claimed)
LARGE_FULL_REFRESH_FLOW=PASS (Up+Down full-refresh path captured)

### D0 measured baseline

| Path/metric | Samples | Min | Median | Mean | Max |
|---|---:|---:|---:|---:|---:|
| Partial refresh total | 25 | 828.07 ms | 829.26 ms | 830.36 ms | 852.85 ms |
| Partial SPI transition transfer | 25 | 21.72 ms | 21.80 ms | 22.08 ms | 28.47 ms |
| Partial display-refresh BUSY | 24 | 451.45 ms | 451.59 ms | 451.61 ms | 452.52 ms |
| Full refresh total | 3 | 1244.66 ms | 1262.55 ms | 1256.66 ms | 1262.78 ms |
| Full SPI transfer | 3 | 14.54 ms | 14.56 ms | 14.62 ms | 14.76 ms |
| Full display-refresh BUSY | 3 | 861.65 ms | 866.53 ms | 864.91 ms | 866.53 ms |

Representative direct menu/button flows were approximately 923–975 ms button-to-refresh completion for partial updates and 1.34 s for a full update. The trace shows the existing 50 ms debounce, approximately 2 ms task dispatch, about 50–70 ms initialization/setup before transfer, and the BUSY waveform/power stages. No before/after optimization gain is claimed: this is the first captured physical baseline.
```

## Optimization Results

No second-pass optimization has been flashed. The only flashed change is the diagnostic timing overlay described above. The next implementation candidate is true `0x83` windowed partial transfer; its physical result remains unvalidated until a separately authorized artifact is flashed.

## AGY Review

Reviewer model: not invoked for diagnostic-only checkpoint
Effort level: not applicable
Verdict: pending — required after windowed partial implementation

P0 findings: none
P1 findings: none
P2 findings: none
P3 findings: none

Findings accepted: none.
Findings rejected: none.

## Orange Pi Disk / Deployment Preservation

The running deployment was preserved. No `docker system prune -a`, volume deletion, running-image deletion, or rollback-image deletion was performed.

```text
BACKEND_HEALTHZ=PASS
DEPLOYMENT_MUTATED=NO
DOCKER_CLEANUP=NOT_RUN
OPTIMIZED_IMAGE=NOT_BUILT
ROLLBACK_ASSET=preserved per Campaign 6C deployment evidence
```

## Security Checks

OAuth-only requirement: PASS; no credentials were accessed or introduced.
Static AI API keys found: none introduced.
Firmware/eFuse changes: none.
Flash/write operations: none.
Secrets detected in report changes: none.

## Known Issues

- The diagnostic serial trace captured refresh behavior, but HTTPS connection failed during the same session; pairing storage was not altered.
- BTC D/W/M switching lacks a successful synchronized physical sample in this trace.
- The Orange Pi root filesystem remains space-constrained; cleanup is deferred until the running and rollback image IDs are mechanically recorded under D3.

## Deviations

- The earlier D0-blocked statements in this report are superseded by the measured checkpoint above and retained as historical context. No simulated measurement was used.

## Next Recommended Stage

Next automatic action: implement the bounded `0x83` dirty-rectangle candidate, add deterministic rectangle/packing/fallback tests, build with ESP-IDF `v5.5.2`, and obtain AGY review. Do not flash that new artifact without explicit physical-flash authorization for its exact hash.

## Final Stage Verdict

NOT READY FOR OPTIMIZED FLASH — D0 baseline is complete; second-pass implementation/review and authorized physical validation remain.

## Required Gate

```text
READY_FOR_OPTIMIZED_FLASH=false
PAIRING_COMPLETE=preserved; live HTTPS poll failed during diagnostic capture
PHYSICAL_DEVICE_DETECTED=true (/dev/cu.usbmodem31201)
FIRMWARE_CHANGED=true (diagnostic app only; no optimized artifact flashed)
```
