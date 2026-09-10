# Campaign 8D1M-G — post-freeze return-to-settings addendum

## New operator observation

This addendum extends the already-issued progressive-lag/freeze instruction. Do not treat it as a new physical test request.

Operator now reports that after the apparent freeze, the device returned to the Settings menu. The operator cannot tell whether this was:

```text
A=very_delayed_processing_of_an_earlier_button_or_navigation_event
B=normal_voice_exit_or_scene_return_after_backlog_drained
C=watchdog_or_software_reset_followed_by_boot_into_settings_or_prior_scene
D=brownout_or_other_reset
E=other_recovery_path
```

Do not ask the operator to determine this manually and do not ask for another button press, reboot, power-cycle, or retry while evidence remains available.

## Required structural discrimination

Use the already-running sanitized observer, backend timing markers, serial allow-list, device uptime continuity and any reset-reason/boot-class markers to classify the transition mechanically. At minimum determine:

```text
RETURN_TO_SETTINGS_OBSERVED=YES
BOOT_SEQUENCE_OBSERVED_AFTER_FREEZE=
RESET_REASON_CLASS=
WATCHDOG_REASON_CLASS=
BROWNOUT_OR_POWER_RESET_EVIDENCE=
UPTIME_CONTINUITY=
VOICE_WS_CLOSE_OBSERVED=
VOICE_SESSION_CLOSE_OR_END_OBSERVED=
UI_SCENE_EXIT_EVENT_OBSERVED=
PENDING_BUTTON_EVENT_DRAINED_AFTER_DELAY=
TASK_WATCHDOG_OR_PANIC_MARKER=
FATAL_MARKER_COUNT=
RECOVERY_CLASS=DELAYED_INPUT|NORMAL_SCENE_RETURN|WATCHDOG_RESET|SOFTWARE_RESET|POWER_RESET|OTHER|UNKNOWN
```

Keep privacy guarantees: no raw transcript, raw audio/PCM, provider payload, credential, auth header, private Calendar/Outlook content, or unrestricted raw serial retention.

## Interpretation rule

Do not assume the device rebooted merely because it returned to Settings. Do not assume an earlier button finally executed merely because Settings appeared. Prefer mechanical evidence in this order:

1. explicit reset reason / boot sequence / uptime discontinuity;
2. watchdog/panic/reset markers;
3. WebSocket/session teardown followed by fresh connection lifecycle;
4. scene/navigation event ordering and delayed button dispatch;
5. otherwise classify UNKNOWN.

Correlate this transition with the already-observed progression:

```text
initial_chat=quick
screen_response=quicker
bubble_order=correct
later_turns=progressively_slower
apparent_freeze=yes
later_return_to_settings=yes
```

Determine whether the return to Settings was recovery from a growing queue/deadlock/resource condition, an automatic reset, or merely delayed event processing. Preserve the earlier requirement to identify the dominant accumulating stage and to run a deterministic multi-turn soak/regression before any further physical acceptance request.

No source/provider/model/credential/billing/private-data authority change is authorized by this addendum. Keep PR #2 OPEN / DRAFT / UNMERGED.
