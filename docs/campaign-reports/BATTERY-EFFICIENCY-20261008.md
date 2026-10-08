# Battery efficiency — 8 October 2026

User authorized implementation and flash: “proceed with the recommendations and flash”.
Controller: Codex. Branch fix/wifi-auto-recovery, destination origin/feature/context-navigation.
Base 2933020; governing instructions 08501bb3ca75739e43fbf4f54811e0243ca5d193.

## Changes

- Close idle ES8311 codec and duplex I2S after one idle second; disable PA before bias/clocks change. Lazy reopen retains volume and DAC stabilization. Shared GPIO42 audio/I2C rail remains on.
- Serialize close/open/volume with codec mutex; pending playback and voice ownership prohibit idle close. Rail shutdown waits for in-flight idle close and prevents future idle I2C operations. Aborted EPD drain re-enables idle shutdown.
- Enable connected daytime battery deep sleep after ten idle minutes (Kconfig default and tested local sdkconfig 10). Static pages timer-sync every 600 seconds, dynamic TTL and failure backoff remain unchanged.
- Retain offline sixty-second button-only hibernation, charging/onboarding/unbound guards, voice/sync blocker, quiet-hours deferral, GPIO17 latch hold and ENTER/DOWN/USB ext1 wake.
- Existing zero-pixel-diff skip and changed-manifest batched downloads already satisfy the other recommendations. Do not duplicate them or download unrelated groups.

## Validation

Commands passed:
- bash firmware/test/run_connected_sleep_policy_host_test.sh — seven schedule cases, including static remote edits and preserving 3600-second failure backoff.
- bash firmware/test/run_offline_sleep_policy_host_test.sh
- bash firmware/test/run_wifi_retry_policy_host_test.sh
- bash firmware/test/run_framebuffer_ops_host_test.sh
- git diff --check
- ESP-IDF 5.5.2 idf.py -C firmware build

Independent AGY model-only OAuth review: gemini-3.7-flash-medium, PASS, no findings.
Conversation f1ef980e-52a5-4765-b1fb-be5fa867fe5c, SUCCESS.
Packet SHA256 84dc93b6ba3873bb0342806cc204dc55f7c3d62aff19a514b298a5389a32a171.
Pinned CLI SHA256 ef3728208834483754b06fd99963b4b6320740bf237212768dfed5256ae24ddb verified before and after review; no tools/production writes by reviewer. Model identifier requested; returned observed model ID absent.

No partition, NVS, protocol or OTA changes. No credentials logged, extracted or copied.
No merge/tag/release. Existing unrelated untracked files preserved.
Flash evidence to append after exact-commit rebuild and application-only write.

## Physical limits

USB-connected checks cannot quantify battery savings. Unplugged current, speaker pop/reopen, voice behavior and front-button wake latency require physical measurement.
Deep wake boots firmware; rendering is not instantaneous. UP cannot wake from deep sleep.
