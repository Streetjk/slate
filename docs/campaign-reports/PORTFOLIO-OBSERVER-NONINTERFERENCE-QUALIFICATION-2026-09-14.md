# Observer Non-Interference Qualification Result

Date: 2026-09-14 (Australia/Perth)

## Gate correction

The anomaly review at `/tmp/slate-observer-anomaly-review-20260914.txt`
supersedes the prior observer-ready gate. The exact backend and externally
activated firmware remain accepted; only observer attachment readiness is
reopened. The physical window was not consumed.

```text
PHYSICAL_REQUALIFICATION_CONSUMED=NO
REQUALIFICATION_WINDOW_ARMED=NO
HUMAN_ACTION_REQUIRED=NO
```

## Grok decision and tooling-only change

Grok 4.6 classified the original broad BOOT/Wi-Fi counts as insufficient to
prove resets, but identified a real attach risk: pyserial 3.5 opened the CDC
port with DTR/RTS defaults asserted. The selected action was tooling-only:

- set DTR and RTS false before opening;
- qualify the open path on a local pty;
- count contiguous boot boundaries rather than broad log-line matches;
- stop before any further device attach if an actual reset boundary appears.

Product/backend/firmware bytes, provider configuration, Wi-Fi and pairing were
not changed.

```text
COLLECTOR_SOURCE_PATH=scripts/slate-m4-sanitized-observer-v2.py
COLLECTOR_ID=m4-sanitized-structural-v3|sha256:9bac9adc2231839542b993d8a8e5af0c29414d327dfee1f4c5590f5faf334576
COLLECTOR_SELF_TEST=PASS
PTY_IOCTL_QUALIFICATION=PASS
PTY_TIOCMBIS_ASSERT=NO
PTY_TIOCMBIC_DEASSERT=YES
RAW_PTY_TERMios_QUALIFICATION=PASS
REAL_DEVICE_TOUCHED_BY_OFFLINE_TESTS=NO
```

The pty tests prove the userspace change and a raw `os.open`/termios path
without modem-control ioctl use. They do not claim that either path is safe on
the campaign USB-Serial/JTAG adapter.

## Single bounded real attach result

After stopping the stale competing observer, one five-second no-interaction
attach was run with the repaired collector. No Voice input, prompt, provider
call or physical acceptance step occurred.

```text
SERIAL_CONNECTED=YES
SERIAL_DISCONNECTED=NO
ACTUAL_RESET_EVENT_COUNT_DURING_IDLE_ATTACH=1
LEGACY_BROAD_BOOT_COUNT=4
LEGACY_BROAD_WIFI_COUNT=31
FATAL_EVENT_COUNT=0
RESET_REASON_CLASS=UNKNOWN
WATCHDOG_REASON_CLASS=NONE
SERIAL_LINE_COUNT=121
REQUIRED_PHYSICAL_PRODUCER_EVENTS=ABSENT_EXPECTED_BEFORE_VOICE
BACKEND_HEALTH_DURING_ATTACH=HTTP_200_200_SLATE_MYSQL_HEALTHY_RESTARTS_0
OBSERVER_RAW_CONTENT_RETAINED=NO
```

This is `PROVEN_ATTACH_RESET` under the bounded structural boundary tracker.
The result fails observer non-interference. It is not a product failure and
not a physical Voice result.

## Final gate

```text
OBSERVER_ATTACH_NONINTERFERENCE=FAIL
OBSERVER_READY=NO_PRELIMINARY_NONINTERFERENCE_UNPROVEN
REQUALIFICATION_WINDOW_ARMED=NO
REAL_DEVICE_REATTACH_ALLOWED=NO
PHYSICAL_VOICE_RUN=NO
```

Grok's final adjudication was:

```text
DECISION_STATUS=DECIDED
ROOT_CAUSE_WORKING_MODEL=RESET_REMAINS_OUTSIDE_QUALIFIED_USERSPACE_IOCTL_CONTRACT;KERNEL_ADAPTER_OR_HARDWARE_OPEN_PATH
SELECTED_ACTION=STOP_REAL_DEVICE_ATTACH;FREEZE_ATTACH_AS_RESET_PROOF;OFFLINE_ONLY_DIAGNOSIS
DEVICE_RESET_EVIDENCE_STATUS=PROVEN_ATTACH_RESET
HUMAN_ACTION_REQUIRED=NO
NEXT_SAFE_ACTION=QUALIFY_A_NON_CAMPAIGN_USB_SERIAL_ADAPTER_OR_DRIVER_OPEN_PATH_OFFLINE;LEAVE_NOTE4_UNTOUCHED
STOP_CONDITION=ACTUAL_RESET_COUNT_GREATER_THAN_ZERO_ON_QUALIFIED_NO_INTERACTION_ATTACH
```

The next safe lane is offline qualification on a non-campaign adapter/driver
or equivalent OS-level test environment. Do not reopen the NOTE4 port until
that work proves non-interference. Do not reset, power-cycle, re-pair, reflash,
redeploy, or consume the physical window.

## Host-only offline inventory and stop boundary

The remaining offline qualification was completed without opening any serial
node. The campaign node remained closed, and the other modem node was not used
because its campaign identity could not be disproven from available metadata.

```text
NON_CAMPAIGN_PHYSICAL_ADAPTER=NONE_IDENTITY_PROVEN
CAMPAIGN_NODE=/dev/cu.usbmodem31201=FORBIDDEN_NOT_OPENED
OTHER_USB_NODE=/dev/cu.usbmodem31101=IDENTITY_UNPROVEN_NOT_OPENED
IOKIT_PRODUCT_CLASS=Espressif_USB_JTAG_serial_debug_unit
SYSTEM_PROFILER=NO_SAFE_METADATA_OUTPUT
PTY=PASS
RAW_TERMIOS=PASS
OFFLINE_DEVICE_QUALIFICATION=EXHAUSTED_IN_THIS_ENVIRONMENT
```

The host-only pty and raw termios qualifications passed, but they cannot prove
that the campaign adapter's kernel/USB-CDC/JTAG open path is non-interfering.
No non-campaign adapter or equivalent isolated OS-level driver harness was
available. The single bounded real attach remains frozen as
`ACTUAL_RESET_EVENT_COUNT_DURING_IDLE_ATTACH=1`; it is not repeated and does
not consume the physical Voice window.

The final offline stop audit was:

```text
PORTFOLIO_DECISION=STOP
RUNNABLE_SAFE_WORK_COUNT=0
NEXT_SAFE_ACTION=KEEP_EVERY_SERIAL_NODE_CLOSED;QUALIFY_IDENTITY_PROVEN_NON_CAMPAIGN_USB_SERIAL_ADAPTER_OR_ISOLATED_OS_DRIVER_HARNESS_WHEN_AVAILABLE
STOP_REASON=OBSERVER_NONINTERFERENCE_UNPROVEN;NO_NON_CAMPAIGN_ADAPTER_OR_ISOLATED_DRIVER_HARNESS_AVAILABLE;REAL_NOTE4_REATTACH_FORBIDDEN
OBSERVER_NONINTERFERENCE_PROVEN=NO
HUMAN_ACTION_REQUIRED=YES
```

Additional hardware or an isolated driver-test environment is required before
the observer can be qualified. This is not a request to interact with NOTE4;
the device remains untouched and the physical acceptance remains unconsumed.

## Fresh observer-tooling review

A separate Grok 4.6 review of the exact tooling change returned:

```text
VERDICT=PASS
P0=NONE
P1=NONE
P2=IDLE_ATTACH_RESET_AND_NO_NONCAMPAIGN_ADAPTER_REMAIN_GATE_FACTS
SECURITY=PASS_NO_PRIVATE_PAYLOADS_OR_SECRETS
REVIEWED_COMMIT=1f679d38bd91674b573992d410ecc9f5724a5d9e
REVIEWED_PATH=scripts/slate-m4-sanitized-observer-v2.py
OBSERVER_TOOLING_REVIEW=PASS
NONINTERFERENCE_GATE=FAIL_CLOSED_STOP
NEXT_SAFE_BOUNDARY=IDENTITY_PROVEN_NONCAMPAIGN_ADAPTER_OR_ISOLATED_OS_DRIVER_HARNESS;NO_SERIAL_NODE_OPEN
```

The reviewer confirmed the pty/ioctl and raw-termios evidence, the bounded
boot-boundary counter, privacy behavior, and the fail-closed interpretation of
the one real idle-attach reset. This review does not authorize a campaign
device attach or physical Voice session.

## Final host-only static identity-resolution slice

Both serial nodes were inspected only through static filesystem metadata,
`IOSerialBSDClient` properties, IORegistry USB topology, `lsof` ownership
inspection, and repository history. Neither node was opened or read.

```text
STATIC_31101_IOSERIAL=IOSerialBSDClient_CALL_OUT_AND_DIAL_IN_PRESENT
STATIC_31201_IOSERIAL=IOSerialBSDClient_CALL_OUT_AND_DIAL_IN_PRESENT
STATIC_USB_TOPOLOGY= two sibling Espressif USB JTAG_serial debug unit devices under one USB2 hub
STATIC_DIRECT_SERIAL_TO_USB_PARENT_LINK=NOT_EXPOSED_BY_SAFE_METADATA
STATIC_LSOF_OWNER_31101=NONE
STATIC_LSOF_OWNER_31201=NONE
STATIC_31101_HISTORY=Slate_observer_and_instrumented_session_path
STATIC_31201_HISTORY=qualified_NOTE4_campaign_flash_and_physical_path
STATIC_31101_IDENTITY=CAMPAIGN_RELATED
STATIC_31201_IDENTITY=CAMPAIGN_RELATED
STATIC_MAPPING_SUFFICIENCY=SUFFICIENT_FOR_CAMPAIGN_RELATED_CLASSIFICATION
```

Grok 4.6 adjudicated that `31101` is campaign-related, not a safe
non-campaign adapter. The sibling USB topology and historical Slate use are
enough for that classification, but do not authorize opening either node and
do not prove observer non-interference.

```text
OPEN_AUTHORIZED=NO
OBSERVER_NONINTERFERENCE_PROVEN=NO
PORTFOLIO_DECISION=STOP
RUNNABLE_SAFE_WORK_COUNT=0
NEXT_SAFE_ACTION=NONE
STOP_REASON=31101_CAMPAIGN_RELATED;BOTH_SERIAL_NODES_FORBIDDEN;HOST_ONLY_QUALIFICATION_EXHAUSTED
```
