# Five-minute AI Usage cadence — 9 October 2026

User explicitly requested5minutes after diagnosing slow quota updates.
Branchfix/wifi-auto-recovery; base3cae1dd; governing instructions08501bb3ca75739e43fbf4f54811e0243ca5d193.

Firmware bound polling changed600->300seconds. Unbound retry, local navigation,
quiet-hours, offline60s sleep, audio savings, daytime connected light sleep and
all storage/protocol/security behavior preserved. More routine Wi-Fi/TLS bursts
than10minutes; independent5minute renderer/poll schedules can approach10minutes
plus download time. Current-frame prioritization is not part of this interval-only
request and was not implemented.

Production single AI Usage content config changed refresh_interval_sec600->300
through shared AiUsageConfig validation and an optimistic lease-guarded transaction.
Next refresh queued. No backend source/default changes or service restart.
Live job verification: last run2026-10-09T12:16:52.555Z (20:16:52AWST), next due
12:21:52.555Z, exactly300seconds, no error. Original config600 is rollback value.

ESP-IDF5.5.2 buildPASS; binary2562160bytes; SHA256a9d987c66cbdadd583cfa50b697dc6e0082c8fca4d01d20d3e70a394c5463117.
gitdiffcheckPASS. No duplicate constant-mirroring tests added for this bounded
configuration adjustment; existing sync mechanics unchanged.
Independent read-only OAuth AGY reviewPASS/no findings, requestedgemini-3.7-flash-medium;
observed modelIDnotreturned. Conversation6a520428-9f4a-45fe-ab6d-1a2e5bed71ea SUCCESS.
PacketSHA256a27c0559d5abab7e5296545c25ed295318202807f9aec15bd7e3ebff1737cc5e.
PinnedCLIef3728208834483754b06fd99963b4b6320740bf237212768dfed5256ae24ddb verifiedpre/post.
No secrets/static AI credentials/auth changes, merge/tag/release.

USB ports['/dev/cu.usbmodem31101']; NOT flashed. Device remains10minute polling
until reconnect and previously authorized application-only flash0x10000. Backend
5minute cadence is active. Next: reconnect Slate dataUSB, verify reviewed binary,
flash preserving NVS/LittleFS, verify backend reconnect and cadence.


## Authorized flash — 20:37 AWST, 9 October 2026

User reconnectedSlate. Verified source equality to1c1f6c7 and applicationSHA256
a9d987c66cbdadd583cfa50b697dc6e0082c8fca4d01d20d3e70a394c5463117 beforeflash.
Slate/dev/cu.usbmodem31101 unoccupied. ESP32-S3 application-only flash0x10000,
2562160bytes,460800baud,exit0; data hashverified/hard resetcompleted.
NVS/LittleFS/bootloader/partitiontable preserved. Backend authenticatedpoll201
req-1c0 at2026-10-09T12:37:08.854018033Z confirms reconnect.
Livebackend config300seconds, last12:31:54.040Z/next12:36:54.040Z/noerror.
Five-minute devicepoll firmware nowinstalled; sustained physicalcadence/current
not independentlymeasured. No outstandingflashblocker.
