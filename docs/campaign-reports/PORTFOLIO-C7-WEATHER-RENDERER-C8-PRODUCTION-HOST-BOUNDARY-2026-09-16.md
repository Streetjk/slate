# C7 Weather Renderer and C8 Production Host Boundary — 2026-09-16

## Scope

This offline slice was run without a provider call, database mutation,
deployment, firmware build/flash, serial access, device access, or physical
acceptance. It addresses the persistent Weather `?` report and challenges the
claim that the C8 input-stall lane has no further safe evidence work.

## Grok decision

The bounded Grok 4.6 adjudication used PR2 source
`c862f6f800fc68d901bd7ecc8bb1a63a26744b69`, the local reviewed Weather image,
and the exact host-compile failures. It returned:

```text
DECISION_STATUS=DECIDED
WEATHER_ACTION=retain the test-only DynamicFrameRendererService mapped-vs-unknown WMO render contract and image-local mapping/assets smoke
INPUT_STALL_ACTION=do not add a production seam or extraction; document the missing FreeRTOS/ESP-IDF host dependency boundary and retain static/host model
SOURCE_RUNTIME_REPAIR_REQUIRED=NO
STOP_CONDITION=no production firmware seam/extraction, ESP-IDF compile, device, serial, provider, deployment, flash, or edit under slate-font-build
```

## Weather result

Added a direct `DynamicFrameRendererService` regression in
`backend/src/modules/dynamic-content/rendering/dynamic-frame-renderer.service.test.ts`.
It renders synthetic current and forecast Open-Meteo WMO values through the
real frame renderer, compares the mapped result with an unsupported `1234`
that must resolve to the intentional `999.svg` fallback, checks nonzero
icon-region differences, and checks deterministic repeated rendering.

```text
WMO_CURRENT=61 -> QWEATHER_305
WMO_FORECAST=0,80,95 -> QWEATHER_100,300,302
UNKNOWN=1234 -> 999.svg
DYNAMIC_FRAME_RENDERER_WMO_TEST=PASS
WEATHER_ICON_HELPER_TESTS=PASS
WEATHER_REPAIR_IMAGE_LOCAL_SMOKE=PASS_MAPPING_AND_REPRESENTATIVE_ASSETS_PRESENT
```

The exact frozen image was inspected locally only:

```text
IMAGE=sha256:4af8ff25c3ca3ba8a7de7a48d72d3340b7a43837c2cb2efc219be7ed5f33d33c
PLATFORM=linux/arm64
TRANSPORT=NOT_USED
PROVIDER_CALLS=0
```

The image contains the reviewed mapping source and representative non-empty
`100.svg`, `102.svg`, `300.svg`, `302.svg`, `305.svg`, and `999.svg` assets.
This proves artifact-local presence and renderer behavior, not current device
display state or a new physical Weather result.

## C8 production-class feasibility

The real firmware classes were attempted with a host C++17 syntax-only
compile using the repository firmware, LVGL, and component include roots:

```text
c++ ... -fsyntax-only firmware/main/xiaozhi/service/audio_service.cc
FAIL fatal error: freertos/FreeRTOS.h file not found
c++ ... -fsyntax-only firmware/main/xiaozhi/service/xiaozhi_service.cc
FAIL fatal error: freertos/FreeRTOS.h file not found
```

The first dependency boundary is therefore the missing ESP-IDF/FreeRTOS
environment, before either production class can compile. The classes also
depend on FreeRTOS queues/tasks/semaphores, ESP logging, LVGL and target audio
interfaces. No minimal seam or extraction was added because it would make a
new design choice without evidence that a host shim is behaviorally faithful.

The existing static/host coverage remains bounded evidence only. It proves the
source ordering and model behavior, but not runtime device scheduling,
codec/playback timing, UI/EPD backpressure, or provider/network delay.

## Firmware provenance

The reviewed U+6CA2 source `9074daa71f1b065522942b70699f50a2907d944b` is an
ancestor of PR2. The known recovery worktree
`/Users/ollama/slate-fw-recovery.6uEWUl` contains the exact reviewed outputs:

```text
BIN_SHA256=5346a2d5e045d50ca7dca2f6cc9b79aa39351aad9189205edf7f9b104da4fcda
BIN_BYTES=2538064
ELF_SHA256=5e01c88e64ab7160a262cb931fb90667413327ee353c6334c0903fe792d043d6
```

The dirty `/Users/ollama/slate-font-build` checkout is a separate scratch
checkout with generated font/tool changes; it was not edited or cleaned and
was not treated as an owned product lane.

## Other lanes

| Lane | Current safe result |
| --- | --- |
| C10 | Deployed reviewed app remains healthy; Weather mapping candidate remains reviewed and undeployed; no new quota/provider action |
| C7 Outlook | Read-only OAuth/account-consent gated; no account action |
| C9 | Parked research-only; no new documented evidence justifies reopening |
| C8 input stall | New offline coverage and host boundary complete; no source defect proven |

No further non-account, non-provider, non-device work was identified after
these checks. The remaining input-stall attribution and reviewed Weather/U+6CA2
activation actions require their existing authority boundaries.

## Durable conclusion

```text
WEATHER_SOURCE_DEFECT_PROVEN=NO_NEW_DEFECT;DIRECT_RENDERER_AND_IMAGE_LOCAL_PATH_PASS
INPUT_STALL_SOURCE_DEFECT_PROVEN=NO
INPUT_STALL_PRODUCTION_RUNTIME=UNPROVEN_HOST_BLOCKED_BY_IDF_DEPENDENCY
OBSERVER_NONINTERFERENCE_PROVEN=NO
RESET_CAUSE_ATTRIBUTION=UNKNOWN
PROVIDER_CALLS=0
DEVICE_ACTIONS=0
```

## Fresh exact-diff review

```text
REVIEWER=grok -m grok-4.6
VERDICT=PASS
P0=none
P1=none
P2=host compile miss of freertos/FreeRTOS.h is an IDF environment boundary, not a production-seam or runtime finding
SECURITY=none
REVIEWED_WEATHER_RENDERER_TEST=PASS
REVIEWED_IMAGE_LOCAL_SMOKE=PASS
REVIEWED_FIRMWARE_PROVENANCE=PASS_SOURCE_ANCESTOR_AND_EXACT_RECOVERED_BIN_ELF
REVIEWED_STATE_CORRECTION=PASS_STALE_U6CA2_AND_PRIOR_COUNTER_FIELDS_RECONCILED
```

The review confirmed that pixel differences are used as renderer-path
evidence, while mapping-table evidence remains separately identified. It also
confirmed no current-tree rebuild, firmware seam change, device action, or
provider action was claimed.
