# Campaign 8D1M-G M4 — post-flash Wi-Fi qualification continuation

## Purpose

Continue from the live frontier after Grok 4.6 review PASS, backend deployment PASS, app-only firmware flash PASS/hash verified, Gemini exact configuration qualification PASS, health checks PASS, and durable observer rearm PASS.

The only remaining nonphysical gap is that the bounded post-flash observer window captured boot markers but no Wi-Fi marker. This is an evidence gap only; it is not a Voice AI failure and does not authorize a physical Voice retry yet.

```text
MODE=FRONTIER_DRIVEN_LONGRUN
PR_NUMBER=2
PR_STATE_REQUIRED=OPEN
PR_DRAFT_REQUIRED=YES
PR_MERGED_REQUIRED=NO
REVIEWER=GROK_4_6
REVIEW_TARGET=81e983086fb414fa24233434da4927564c16dc98
BACKEND_DEPLOYMENT=PASS
FIRMWARE_FLASH=PASS_APP_ONLY_HASH_VERIFIED
POST_FLASH_FATAL_MARKERS=0
POST_FLASH_WIFI_MARKERS=0_NOT_CAPTURED
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=1
HUMAN_ACTION_REQUIRED=NO
```

## Required continuation

Exhaust the remaining read-only/nonphysical Wi-Fi qualification automatically before requesting any human interaction.

Use existing sanitized evidence and established controller access only. At minimum inspect, where available:

- current durable observer output/error paths and current serial structural markers;
- whether the NOTE4 remains enumerated on the same serial identity;
- current firmware boot/reset class and uptime continuity markers;
- existing backend-visible device connection/heartbeat/authenticated-device activity that can prove the device has network connectivity without exposing private payload content;
- current WebSocket/config fetch/network lifecycle markers if already emitted passively;
- existing LAN/host neighbor or reachability evidence only where already authorized and identity-preserving;
- whether the missing Wi-Fi marker is simply an observer-window/marker-coverage gap rather than actual Wi-Fi failure.

Do not retain or publish SSID, password, IP-derived private data, raw serial content outside the approved allow-list, transcripts, audio, credentials, auth headers, or provider payloads. Report only sanitized status classes/counters/timestamps already permitted by the campaign.

## Classification

Publish an exact result such as:

```text
POSTFLASH_WIFI_QUALIFICATION=PASS_STRUCTURAL_EVIDENCE|PASS_EXISTING_NETWORK_ACTIVITY|UNRESOLVED_READONLY_EVIDENCE_GAP|FAIL_PROVEN_WIFI_CONNECTIVITY
WIFI_MARKER_CAPTURED=YES|NO
DEVICE_NETWORK_ACTIVITY_PROVEN=YES|NO
DEVICE_IDENTITY_PRESERVED=YES|NO
RESET_FATAL_MARKERS=0|<count>
OBSERVER_RUNNING=YES|NO
```

Do not infer Wi-Fi PASS solely because Slate backend health is HTTP 200; the evidence must tie back to the device/network path.

## No unnecessary device action

Because the current frontier says `READONLY_READY_NODE_COUNT=1`, do not reset, reflash, reboot, erase, pair, or ask the operator to press NOTE4 controls merely to manufacture a Wi-Fi marker while useful read-only evidence remains.

If read-only evidence proves current device network connectivity, close this gap, set `READONLY_READY_NODE_COUNT=0`, and advance to exactly one combined EN/JA physical Voice AI acceptance boundary.

If read-only evidence is genuinely insufficient, publish the exact missing evidence and whether a bounded non-Voice device/network qualification action is necessary. Do not silently perform a broader reset/reflash and do not request a Voice session as a substitute for Wi-Fi qualification.

## Next physical acceptance only after Wi-Fi gap closes

Once all safe nonphysical/read-only work is exhausted and Wi-Fi qualification is closed, arm the observer and request exactly one multi-turn EN/JA physical Voice AI soak. That acceptance must check:

- early-turn versus late-turn latency;
- no progressive UI lag/freeze;
- correct user -> assistant bubble ordering;
- one logical bubble per role;
- audible assistant audio;
- Japanese kana rendering, especially U+306E `の`;
- sanitized queue/heap/resource trends;
- reset/watchdog markers if instability occurs.

If that single physical soak fails, consume the evidence and continue diagnosis without repeated operator retries.

Keep PR #2 OPEN / DRAFT / UNMERGED.
