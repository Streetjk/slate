# Firmware identity read-only reconciliation — 2026-09-17

This is a device-identity reconciliation record only. No serial node was
opened, read, or written for this slice. No firmware write, erase, reset,
physical attribution, or application action was performed.

## Reconciled repository state

```text
PR2_RECONCILED_HEAD=2a6785ce0ad45f96785e28cecd3078d6296feb93
PR1_4_STATE=OPEN_DRAFT_UNMERGED
U6CA2_CANDIDATE_SHA256=5346a2d5e045d50ca7dca2f6cc9b79aa39351aad9189205edf7f9b104da4fcda
U6CA2_CANDIDATE_BYTES=2538064
U6CA2_FLASH_WRITE_PERFORMED=NO
```

## Read-only evidence

The host-only checks were limited to `ioreg` IOService/IOUSB metadata,
`IOSerialBSDClient` metadata, static device-node metadata, non-mutating
`lsof` ownership inspection, and repository history. Neither
`/dev/cu.usbmodem31101` nor `/dev/cu.usbmodem31201` was opened.

Both current USB units report the same structural class: Espressif USB
JTAG/serial debug unit, VID/PID class `0x303A/0x1001`. The IORegistry parent
links distinguish them:

```text
STATIC_31101_PARENT=ESPRESSIF_USB_UNIT_LOCATION_CLASS_A
STATIC_31101_HARDWARE_IDENTITY=HISTORICAL_QUALIFIED_NOTE4_IDENTITY_MATCH
STATIC_31201_PARENT=ESPRESSIF_USB_UNIT_LOCATION_CLASS_B
STATIC_31201_HARDWARE_IDENTITY=DISTINCT_FROM_HISTORICAL_QUALIFIED_NOTE4
STATIC_PORT_TO_PARENT_LINK=MECHANICALLY_OBSERVED_IN_IOREGISTRY
```

The exact hardware identifiers and private/device-specific values were not
retained in this report. Historical Slate records show the qualified NOTE4
identity on a prior `31201` enumeration, so the port suffix is not itself a
stable identity; the current IORegistry parent relationship is the stronger
current mapping.

The complete read-only application-region readback from the attempted target
was preserved outside the repository:

```text
CURRENT_READBACK_PATH=/Users/ollama/NOTE4-backups/campaign9-u6ca2-20260917/current-app-readback-0x10000-2538064.bin
CURRENT_READBACK_BYTES=2538064
CURRENT_READBACK_SHA256=218d1d1b5bcd1dffb734253f2e4f16efc36af2449e5936bf4831549e52d7aac9
CURRENT_READBACK_IMAGE_CLASS=FOREIGN_ARDUINO_LIB_BUILDER_ESP_IDF_4_4_7
RECORDED_RUNNING_IDENTITY_SHA256=cfa15233f037d8cce3721f3d70539f3395b69d85a61f3279b6ac9d3a8616b13c
RECORDED_RUNNING_BYTES=2537984
CURRENT_READBACK_VS_RECORDED_RUNNING=NO
```

The readback is therefore not evidence that the intended NOTE4 has
unexpected firmware. It is evidence that the selected `31201` path currently
resolves to the distinct sibling unit. The intended NOTE4 identity is
currently mapped by static metadata to `31101`, but no firmware identity was
read from that unit under this slice.

## Adjudication and boundary

```text
IDENTITY_CLASS=WRONG_PORT
GROK_READONLY_ADJUDICATION=IDENTITY_CLASS_WRONG_PORT
FIRMWARE_FLASH_RESULT=FAIL_CLOSED_CURRENT_TARGET_WRONG_PORT
FIRMWARE_WRITE_PERFORMED=NO
U6CA2_FLASH_AUTHORITY_CONSUMED=NO_PREFLIGHT_FAILED
NOTE4_RUNNING_FIRMWARE_IDENTITY=UNKNOWN_NOT_READ_FROM_CURRENT_NOTE4_MAPPING
NO_SERIAL_ATTRIBUTION=NOT_ARMED
OBSERVER_NONINTERFERENCE_PROVEN=NO
RESET_CAUSE_ATTRIBUTION=UNKNOWN
NEXT_ACTION=NONE_UNTIL_EXACT_NOTE4_DEVICE_ACTION_BOUNDARY_IS_RECONCILED
```

This slice is exhausted. No activity is routed to `31101`; no physical or
serial action is requested or implied by this report.
