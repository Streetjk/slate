# Campaign 8D1M-G M4 — diagnose designated ZAI reviewer credential binding

## Live state

The operator reports refreshing the ZAI API credential in `ollama/Cre.txt`, but the exact designated reviewer still failed authentication after the refresh.

Live PR #2 remained OPEN / DRAFT / UNMERGED and the exact frozen review target remains:

```text
8a51da387f8c1ec058883031ef0603ae3da3af36
```

The reviewer identity must remain exactly:

```text
PROVIDER=ZAI
MODEL=glm-5.3-flash
PROFILE=zai-glm53-reviewer
```

The latest exact retry reached the configured ZAI transport, then failed authentication after five bounded reconnects with no verdict. No backend deployment or firmware flash occurred.

## Objective

Do not ask the operator to rotate another key blindly. First determine exactly where `zai-glm53-reviewer` obtains authentication on this controller and whether `ollama/Cre.txt` is actually part of that source chain.

Use local controller inspection only. Never print, echo, commit, log, hash, fingerprint, or otherwise expose credential contents.

## Required binding diagnosis

Mechanically inspect the existing reviewer profile and its launch/invocation path and publish only sanitized structural results:

```text
ZAI_PROFILE_FOUND=YES|NO
ZAI_PROFILE_CONFIG_LOCATION_CLASS=PROJECT_LOCAL|USER_CONFIG|ENVIRONMENT|WRAPPER_SCRIPT|OTHER|UNKNOWN
ZAI_PROFILE_CREDENTIAL_SOURCE_CLASS=FILE|ENV_VAR|KEYCHAIN|WRAPPER_INJECTION|OTHER|UNKNOWN
ZAI_PROFILE_CREDENTIAL_SOURCE_PATH_MATCHES_OLLAMA_CRE_TXT=YES|NO|UNKNOWN
ZAI_PROFILE_CREDENTIAL_SOURCE_ENV_NAME=<name only or UNKNOWN>
ZAI_REVIEWER_PROCESS_REQUIRES_RESTART_TO_RELOAD_AUTH=YES|NO|UNKNOWN
ZAI_REVIEWER_PROCESS_WAS_RESTARTED_OR_RELOADED=YES|NO
ZAI_AUTH_PREFLIGHT_RESULT=PASS|FAIL|UNKNOWN
ZAI_AUTH_FAILURE_CLASS=
NEXT_ACTION=
```

Do not include any secret value, token prefix/suffix, length, checksum, hash, fingerprint, account identifier, or raw HTTP auth payload.

## Decision tree

1. If `ollama/Cre.txt` is **not** the credential source for `zai-glm53-reviewer`, identify the exact existing credential source class/path or environment variable name the profile already expects. Do not mutate it automatically if that would constitute a new credential authority. Publish the smallest exact operator action needed to update the **existing** source.

2. If `ollama/Cre.txt` **is** the correct source but the reviewer process caches authentication, safely reload/restart only the reviewer/client process or shell context required to consume the refreshed credential. Do not restart Slate, MySQL, the NOTE4 device, or unrelated services.

3. If the correct refreshed credential is already loaded but ZAI still rejects it, classify the rejection as far as safely possible (for example invalid/expired/revoked credential vs endpoint/profile mismatch vs account/provider-side rejection) without exposing private response content. Do not switch provider/model/reviewer.

4. Only after a sanitized auth preflight succeeds, rerun the fresh exact independent review against:

```text
8a51da387f8c1ec058883031ef0603ae3da3af36
```

using exactly `ZAI / glm-5.3-flash / zai-glm53-reviewer`.

5. If the exact review PASSes with no blocking findings, continue automatically through exact artifact verification, backend deployment, app-only firmware flash, hash verification, Gemini fail-closed configuration qualification, health qualification, durable observer rearm, and frontier publication.

6. Do not request another physical test until all safe nonphysical work is exhausted and the repaired/reviewed build is deployed and qualified.

Keep PR #2 OPEN / DRAFT / UNMERGED. Preserve all frozen artifacts. No fallback reviewer, model, provider, billing authority, credential authority, or private-data authority change is permitted.
