# U+6CA2 NOTE4 preflight result — 2026-09-17

The exact reviewed firmware activation was attempted only through the
established application-partition procedure on the statically identified
NOTE4 mapping. The precondition failed closed. No firmware write occurred and
the no-serial physical attribution window was not started.

```text
PORT=31101_STATIC_NOTE4_MAPPING
CANDIDATE_SHA256=5346a2d5e045d50ca7dca2f6cc9b79aa39351aad9189205edf7f9b104da4fcda
CANDIDATE_BYTES=2538064
CHIP_PREFLIGHT=PASS
FLASH_ID_PREFLIGHT=PASS
FLASH_SCOPE=APPLICATION_PARTITION_ONLY
FLASH_OFFSET=0x10000
FIRMWARE_WRITE_PERFORMED=NO
```

## Preserved current application readback

The complete 4 MiB application-partition readback was preserved outside the
repository before any possible write:

```text
CURRENT_READBACK_PATH=/Users/ollama/NOTE4-backups/campaign9-u6ca2-20260917/note4-31101-current-app-partition-0x10000-0x400000-preflash.bin
CURRENT_READBACK_BYTES=4194304
CURRENT_READBACK_SHA256=296faf4f8e82dab30e932002bedeec69bd5e8f8a6b4b83c7c4e0a0116a1f1a2d
CURRENT_APP_PREFIX_BYTES=2537984
CURRENT_APP_PREFIX_SHA256=c794f02f19e19fe9422b723f6aeff53032cfa8117e6a94123b4eeb63e3fd1fe8
RECORDED_RUNNING_APP_SHA256=cfa15233f037d8cce3721f3d70539f3395b69d85a61f3279b6ac9d3a8616b13c
RECORDED_RUNNING_APP_BYTES=2537984
CURRENT_APP_PREFIX_MATCH=NO
```

Local image metadata identifies a Slate application, ESP-IDF v5.5.2, version
0.1.1, compile time 2026-09-08, with ELF identity
`184a321ad69fa778bb9eb5d4c0f5a8f7c1ea0c1b7a1c9bba3e9b572ced111bf1`.
That identity differs from the recorded running ELF. This is an unexpected
firmware state on the intended NOTE4, not evidence of a wrong port.

## Decision and boundary

```text
IDENTITY_CLASS=NOTE4_UNEXPECTED_FIRMWARE
GROK_IDENTITY_ADJUDICATION=IDENTITY_CLASS_NOTE4_UNEXPECTED_FIRMWARE
FLASH_RESULT=FAIL_CLOSED_CURRENT_RUNNING_IDENTITY_MISMATCH
FLASH_AUTHORITY_CONSUMED=NO_WRITE_NOT_CONSUMED
NO_SERIAL_OBSERVER=USED_NO
NO_SERIAL_INPUT_LAG_ATTRIBUTION=NOT_RUN
REQUALIFICATION_WINDOW_ARMED=NO
OBSERVER_NONINTERFERENCE_PROVEN=NO
RESET_CAUSE_ATTRIBUTION=UNKNOWN
NEXT_ACTION=NONE_UNTIL_UNEXPECTED_NOTE4_FIRMWARE_IS_RECONCILED
```

The prior `31201` readback remains separately preserved as wrong-port evidence;
this result supersedes it only for the current `31101` activation target.
