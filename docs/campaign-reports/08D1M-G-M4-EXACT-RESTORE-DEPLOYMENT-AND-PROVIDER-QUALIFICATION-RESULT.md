# Campaign 8D1M — exact restore deployment and bounded provider qualification

Date: 2026-09-10 (Australia/Perth)

This report records the one explicitly authorized Campaign 8 backend deployment
and synthetic provider qualification. Evidence is structural and sanitized;
raw provider messages, transcripts, audio and credentials were not retained.

```text
AUTHORIZATION_PROVENANCE=EXPLICIT_OPERATOR_INSTRUCTION_AVAILABLE
AUTHORITY_TYPE=EXACT_BACKEND_DEPLOYMENT_AND_ONE_BOUNDED_PROVIDER_QUALIFICATION
AUTHORIZED_SOURCE=f0dfdad0b4065e48ff8bc82aa505706d40fd9f4c
AUTHORIZED_ARM64_IMAGE=sha256:b271eb8bfcb7a4d04d602d3974ceeb83c928e72721c67fda19c1c2e822a646d5
AUTHORIZED_PROVIDER_SESSION_MAX=1
PROVIDER_SESSION_ATTEMPTS=1
PROVIDER_RETRY=NO
FIRMWARE_CHANGED=NO
FIRMWARE_FLASHED=NO
MYSQL_RECREATED=NO
PRIVATE_DATA_SENT=NO
SEARCH_OR_TOOLS_USED=NO
```

## Deployment identity and qualification gates

```text
SOURCE_PRODUCT_BYTES=UNCHANGED_FROM_GROK_REVIEW
CANDIDATE_SETUP=inputAudioTranscription={}
UNSUPPORTED_LANGUAGECODES_FIELD=ABSENT
INPUT_LATENCY_INSTRUMENTATION=PRESENT
LOCAL_IMAGE_ID=sha256:b271eb8bfcb7a4d04d602d3974ceeb83c928e72721c67fda19c1c2e822a646d5
REMOTE_LOADED_IMAGE_ID=sha256:131537dd90cf85fef9df5d286d4977f8d118f3fe8a25d7eaa72ba1314ec8cab6
IMAGE_CONFIG_ROOTFS_COMPARISON=PASS
SLATE_IMAGE_TAG=slate:m4-gemini25-setup-restored-f0dfdad
SLATE_RUNTIME=running|healthy|restart_0
MYSQL_RUNTIME=running|healthy|restart_0_unchanged
GEMINI_CONFIG_QUALIFICATION=PASS
GEMINI_SECRET_MOUNT_READONLY=PASS
PUBLIC_HEALTH=HTTP_200
NOTE4_AUTHENTICATED_POLL=PASS_STRUCTURAL_OBSERVER_EVIDENCE
OBSERVER_SELF_TEST=PASS
OBSERVER_STATE=ARMED_CONNECTED_SANITIZED
```

The remote Docker image ID differs from the local exported image ID because of
Docker load representation. Architecture, entrypoint/cmd, environment-array,
rootfs layer-list and related image configuration hashes matched; no product
source or firmware bytes changed.

## One synthetic EN then JA provider session

The session used the deployed Slate Node bridge, Gemini 2.5 native-audio model,
the existing Developer API-key path and synthetic non-sensitive audio only.
The runtime sent no `inputAudioTranscription.languageCodes` field because that
field was removed for Gemini 2.5 compatibility.

```text
PROVIDER_SESSION_ESTABLISHED=YES
PROVIDER_SETUP_LANGUAGE_CODES=ABSENT_EXPECTED
EN_INPUT_TRANSCRIPTION=YES
JA_INPUT_TRANSCRIPTION=YES
EN_LANGUAGE_EXPECTATION_MET=YES
JA_LANGUAGE_EXPECTATION_MET=YES
EN_PROVIDER_OUTPUT=YES
JA_PROVIDER_OUTPUT=YES
EN_TURN_COMPLETE=YES
JA_TURN_COMPLETE=YES
CLEAN_CHILD_EXIT=YES
PROVIDER_ERROR_CLASS=NONE
QUALIFICATION_TERMINAL=PASS
```

This is a provider/bridge synthetic qualification only. It supports session
establishment, audio acceptance, transcription-event presence, structural
EN/JA classification, provider output and clean completion. It does not prove
Slate firmware bubble order, device microphone timing, audible codec/I2S
output, Japanese rendering on the device, or real-accent ASR performance.
Those remain separate acceptance evidence. Direct-driver numeric Slate timing
markers were not emitted by this route and are therefore `UNKNOWN`, not
inferred.

## Frontier transition

Campaign 8 has a stable reviewed/deployed runtime boundary. Its remaining
device acceptance remains a human-only node and was not requested or consumed
here. The controller now proceeds to Campaign 7 safe combined-candidate
reconciliation; Campaign 9 remains research-only and parked.

```text
C8_PROVIDER_QUALIFICATION=PASS_SYNTHETIC_PROVIDER_BRIDGE
C8_BILINGUAL_ASR_REAL_DEVICE_STATUS=NOT_PROVEN
C8_DEVICE_ACCEPTANCE=WAITING_HUMAN_DEVICE_BOUNDARY
C7_NEXT=CONSTRUCT_AND_QUALIFY_COMBINED_C8_PLUS_C7_CANDIDATE
C9_DISPOSITION=RETAIN_CURRENT_ACCEPTED_C8_RUNTIME_AND_KEEP_C9_RESEARCH_ONLY
```
