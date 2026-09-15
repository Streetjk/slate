# C10 Weather WMO-to-asset mapping repair — 2026-09-16

This report records a source-only Weather repair on the C10 lineage. The
currently deployed C10 image was not changed or redeployed.

## Fresh physical evidence

The operator reports that the Weather forecast icon is still visibly `?`.
This is fresh physical evidence of persistence, but it does not expose the
exact frame code or private device state.

```text
C7_WEATHER_FRESH_PHYSICAL_RESULT=FAIL_VISIBLE_QUESTION_MARK_PERSISTING
C7_WEATHER_EXACT_LIVE_FRAME_CODE=UNKNOWN
C7_WEATHER_RESET_OR_DEVICE_CAUSE=UNKNOWN
C7_WEATHER_PHYSICAL_REPEAT=NO
```

## Source-bound finding

The deployed C10 source was `965f1a605ff47b64dee20b36c68597db5760b46f`.
Its Weather provider emits Open-Meteo WMO integer codes, while the icon
resolver expects the repository's QWeather SVG asset codes. Valid WMO values
could therefore miss their asset and fall through to the intentional
`999.svg` unknown icon, which is the source-level explanation for the visible
question mark. The exact live frame code remains unknown.

Grok 4.6 selected the minimum repair: carry the reviewed WMO-to-QWeather
mapping and normalization into the C10 lineage, preserve QWeather codes and
the explicit unknown fallback, and add deterministic mapping tests. No
provider, authentication, device, firmware, database or unrelated Weather
behavior was changed.

```text
GROK_DECISION=DECIDED
WEATHER_ROOT_CAUSE=DEPLOYED_C10_SOURCE_MISSING_WMO_TO_QWEATHER_MAPPING
WEATHER_REPAIR_SCOPE=WEATHER_ICONS_MAPPING_AND_DETERMINISTIC_TESTS_ONLY
```

## Candidate and qualification

```text
C10_REPAIR_SOURCE=8a5008f0c6d8b37f125b7d868fdebdbf526be9cc
C10_REPAIR_IMAGE_ID=sha256:4af8ff25c3ca3ba8a7de7a48d72d3340b7a43837c2cb2efc219be7ed5f33d33c
C10_REPAIR_PLATFORM=linux/arm64
C10_REPAIR_ROLLBACK_IMAGE=sha256:bc755aa2aa78017b327e1f12bf91bebd1f3446f36f8f0def5b328087288207ae
C10_REPAIR_DEPLOYED=NO

WEATHER_FOCUSED_TESTS=17_PASS_0_FAIL
BACKEND_FULL_REGRESSION=422_PASS_5_DOCUMENTED_SKIP_0_FAIL
BACKEND_TYPECHECK=PASS
BACKEND_LINT=PASS
ROOT_TYPECHECK=PASS
ROOT_LINT=PASS
ROOT_FORMAT_CHECK=PASS
ARTIFACT_BUILD=PASS_DOCKER_LINUX_ARM64
ARTIFACT_NODE_SDK_SMOKE=PASS
PRIVACY_SCAN=PASS
GIT_DIFF_CHECK=PASS
```

The image inspect mechanically reports `linux/arm64` and the exact local
image ID above. The artifact-local Node bridge SDK smoke passed without a
provider call.

## Fresh exact-artifact review

```text
FINAL_GROK_REVIEW=PASS
P0=0
P1=0
P2=0
SECURITY=0
REVIEWED_SOURCE=8a5008f0c6d8b37f125b7d868fdebdbf526be9cc
REVIEWED_IMAGE_ID=sha256:4af8ff25c3ca3ba8a7de7a48d72d3340b7a43837c2cb2efc219be7ed5f33d33c
REVIEWED_PLATFORM=linux/arm64
```

The review found no blocking issue and matched the frozen source/image. It is
technical readiness only; separate deployment authority is still required.
The existing deployed image remains `sha256:821de0092acd4aa121984a9a9f2f16a7fb26254580f2ed6b62a970dc4eb94dfb`.

## Boundaries

No deployment, firmware flash, physical repeat, serial access, provider or
auth change, credential access, database mutation, OAuth, merge or release
was performed. Existing observer and reset-cause UNKNOWN values remain true.
