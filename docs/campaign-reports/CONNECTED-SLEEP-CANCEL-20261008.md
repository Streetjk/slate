# Connected daytime idle sleep cancellation — 8 October 2026

User requested cancelling the 10-minute connected idle deep sleep to maintain AI usage updates.
Base803dc6b; governing instructions08501bb3ca75739e43fbf4f54811e0243ca5d193; branchfix/wifi-auto-recovery.

Restore full-active idle_deep_sleep_enabled=false. Remove static600s timer fallback/helper/tests introduced exclusively for connected idle sleep. Automatic light sleep and normal sync polling continue. Retain offline60s manual-wake hibernation, idle audio shutdown, charging/onboarding/unbound guards, existing quiet-hours/low-battery/blocker-watchdog policies. Quiet-hours idle grace remains10min; user request concerns daytime connected operation.

Three focused suites PASS: offline sleep policy, WiFi retry policy, framebuffer ops. gitdiffcheckPASS. ESP-IDF5.5.2 buildPASS.
Independent AGY OAuth model-only gemini-3.7-flash-medium PASS/no findings. Conversationf455c1b7-2697-407e-beec-7da38b24ae9f SUCCESS; packetSHA256f44a5e1c988bbaa9e3b571d8241e6ac057d12bb0870f0b6cb8f97a46fcf2c9f4. PinnedCLIef3728208834483754b06fd99963b4b6320740bf237212768dfed5256ae24ddb verifiedpre/post; no tools/write by reviewer; requested model ID, observedIDabsent.

No partition/NVS/protocol/OTA changes; no merge/tag/release.
Flash authorized from prior task, but /dev/cu.usbmodem31101 absent. Cancellation is source/build ready, NOT applied to device. Next action: reconnect Slate data USB, verify exact reviewed build, application-only flash, verify data and backend reconnect.

Exact-commit rebuild PASS: source 56d0e09752e184d3f042c8305916d18095e6a901, slate.bin size 2561968 bytes, SHA256 1563380fcec2b9b33bc7e66a6d6a0add7008088dbce55938b60dba8a5fcc4bd8. USB port still absent after rebuild; no flash attempted.
