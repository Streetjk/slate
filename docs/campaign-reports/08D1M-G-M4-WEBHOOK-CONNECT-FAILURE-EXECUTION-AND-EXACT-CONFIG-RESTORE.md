# Campaign 8D1M-G — webhook/connect failure execution and exact configuration restore

## Live reconciliation and consumed physical boundary

```text
LIVE_HEAD=4f73389f570e267396bb21466fbd3bd6ba31ff8d
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
MODE=FRONTIER_DRIVEN_LONGRUN
HUMAN_BOUNDARY=CONSUMED
```

The completed physical attempt was ingested from the already-running sanitized
observer. Its retained serial evidence was structural only: the observer saw
connection/boot churn, `FATAL=0`, and retained no raw serial, audio, transcript,
credential, URL, or auth-header content.

The timestamped, allow-listed backend markers for the device attempt were:

```text
PHYSICAL_ATTEMPT_UTC=2026-09-08T21:55:18Z
VOICE_WS_CONNECT_RESULT=OPEN
VOICE_WS_AUTH_RESULT=PASS
VOICE_WS_ACCEPTED=YES
T_DEVICE_LISTEN_START_MS=1788904519295
PROVIDER_SESSION_CREATE_START=YES
PROVIDER_SESSION_CREATE_RESULT=CONFIG_ERROR
PROVIDER_SESSION_STARTED=NO
LIVE_FAILURE_SOURCE=CONNECT_REJECT
PROVIDER_CLOSE_EXPECTED=NO
ACTIVE_CONNECT_GENERATION=2
T_FAILURE=YES
FIRST_MIC_FRAME_RECEIVED=NO
```

The later `VOICE_CONFIG_AUTH_RESULT=REJECT` at `2026-09-08T22:02:48Z` was
created by the controller's deliberate unauthenticated public-route probe
during this investigation. It is explicitly excluded from the physical-session
classification.

## Earliest failed boundary

The physical device did not fail at webhook URL reachability. WebSocket upgrade,
backend authentication, and backend acceptance all passed. The first proven
failure was the Slate provider-session configuration gate, before a Gemini Live
session existed and before microphone audio reached the backend:

```text
VOICE_CONFIG_REQUEST_STARTED=UNKNOWN_OBSERVER_NOT_RETAINED
VOICE_CONFIG_AUTH_RESULT=UNKNOWN_FOR_PHYSICAL_ATTEMPT
VOICE_CONFIG_RESPONSE_CLASS=UNKNOWN_FOR_PHYSICAL_ATTEMPT
VOICE_CONFIG_RESULT=UNKNOWN_FOR_PHYSICAL_ATTEMPT
CONFIG_WEBHOOK_URL_PRESENT=UNKNOWN
CONFIG_WEBHOOK_URL_CLASS=UNKNOWN
DNS_RESOLUTION_RESULT=PASS_IMPLIED_BY_ACCEPTED_WSS
TCP_CONNECT_RESULT=PASS_IMPLIED_BY_ACCEPTED_WSS
TLS_HANDSHAKE_RESULT=PASS_IMPLIED_BY_ACCEPTED_WSS
VOICE_WS_CONNECT_RESULT=OPEN
VOICE_WS_UPGRADE_REACHED_BACKEND=YES
VOICE_WS_AUTH_RESULT=PASS
VOICE_WS_ACCEPTED=YES
VOICE_SESSION_INIT_SENT=YES
PROVIDER_SESSION_CREATE_START=YES
PROVIDER_SESSION_STARTED=NO
FIRST_MIC_FRAME_RECEIVED=NO
LIVE_FAILURE_SOURCE=CONNECT_REJECT
FAILURE_STAGE=PROVIDER_SESSION_CREATE_CONFIG_GATE_BEFORE_LIVE_SESSION
FAILURE_ROOT_CAUSE_CLASS=PRODUCTION_RUNTIME_CONFIGURATION_MISSING
MIC_AUDIO_REACHED_PROVIDER=NO
PROVIDER_OUTPUT_REACHED_BACKEND=NO
PROVIDER_AUDIO_REACHED_BACKEND=NO
OLD_WS_TRANSPORT_FAILURE_REPRODUCED=NO
```

The device detail `unable to connect to webhook` is therefore a generic visible
error and is not treated as transport proof.

## Deployment/configuration comparison

The current live service was read without reading or printing any secret value:

```text
ACTIVE_IMAGE=slate:m4-slow-turn-order-jp-7acb8b9
ACTIVE_IMAGE_ID=sha256:35f5c510a54e53784dde56c2b7377bf6850cf3eed4bcdcc34a32d2f113d80cdf
SLATE_HEALTH=HEALTHY
SLATE_RESTART_COUNT=0
MYSQL_HEALTH=HEALTHY
MYSQL_RESTART_COUNT=0
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
NETWORK=slate-note4-deploy_default
PORT=3001
ENTRYPOINT=/app/entrypoint.sh
WORKDIR=/app
USER=bun
RESTART_POLICY=unless-stopped
SLATE_DATA_MOUNT=/home/pi/slate-note4-deploy/slate-data:/data:rw
GEMINI_SECRET_MOUNT=/mnt/ssd-tmp/slate-tools/gemini-api-key/gemini_api_key:/run/secrets/gemini_api_key:ro
FUNNEL=https://orangepi5.tail6aabef.ts.net -> http://127.0.0.1:3001
TLS_VALIDATED_HEALTH=HTTP_200
```

The approved route, host, path, network, reverse proxy, secret destination and
persistent mounts were present. The current container's `GEMINI_*` environment
keys were absent, whereas the previously working post-config-restore values
were exactly:

```text
GEMINI_AUTH_MODE=developer_api_key
GEMINI_DEVELOPER_API_KEY_ENABLED=true
GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED=true
GEMINI_LIVE_RUNTIME=node_bridge
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
GEMINI_API_KEY_FILE=/run/secrets/gemini_api_key
GEMINI_NODE_EXECUTABLE=node
GEMINI_NODE_BRIDGE_SCRIPT=./src/modules/assistant/gemini-live-node-bridge-runtime.mjs
```

The exact omission is thus the latest deployment's missing production Gemini
runtime environment, not a provider/model change, device firmware defect,
secret-mount loss, endpoint/routing loss, or reverse-proxy failure. No runtime
bytes are changed and the existing protected credential remains read-only.

## Authorized next action

```text
CONFIG_RESTORE_SCOPE=EXACT_PREVIOUSLY_APPROVED_G_SETTINGS_ONLY
RUNTIME_SOURCE_CHANGE=NO
FIRMWARE_CHANGE=NO
PROVIDER_MODEL_CREDENTIAL_BILLING_AUTHORITY_CHANGE=NO
NEXT_ACTION=RECREATE_ONLY_SLATE_WITH_EXACT_SETTINGS;REQUALIFY;REARM_OBSERVER
```

After requalification, the nonphysical frontier remains open until the exact
authorized physical EN/JA acceptance boundary is reached again. No additional
physical request is made by this checkpoint.

## Exact restore requalified and observer rearmed

```text
CONFIG_RESTORE=PASS
CONFIG_RESTORE_SCOPE=EXACT_PREVIOUSLY_APPROVED_G_SETTINGS_ONLY
SLATE_CONTAINER_RECREATED=YES
MYSQL_RECREATED=NO
ACTIVE_IMAGE=slate:m4-slow-turn-order-jp-7acb8b9
ACTIVE_IMAGE_ID=sha256:35f5c510a54e53784dde56c2b7377bf6850cf3eed4bcdcc34a32d2f113d80cdf
GEMINI_AUTH_MODE=developer_api_key
GEMINI_DEVELOPER_API_KEY_ENABLED=true
GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED=true
GEMINI_LIVE_RUNTIME=node_bridge
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
GEMINI_API_KEY_FILE=/run/secrets/gemini_api_key
GEMINI_NODE_EXECUTABLE=node
GEMINI_NODE_BRIDGE_SCRIPT=./src/modules/assistant/gemini-live-node-bridge-runtime.mjs
SECRET_MOUNT_RW=false
SLATE_HEALTH=HEALTHY
SLATE_RESTART_COUNT=0
MYSQL_HEALTH=HEALTHY
MYSQL_RESTART_COUNT=0
LOCAL_HEALTH=HTTP_200
PUBLIC_HEALTH=HTTP_200
VOICE_CONFIG_UNAUTH=HTTP_401
VOICE_WEBSOCKET_UNAUTH=HTTP_400
OBSERVER_SELF_TEST=PASS
OBSERVER_PYTHON_SYNTAX=PASS
OBSERVER_STATE=RUNNING_CORRECTED_REARMED
OBSERVER_RAW_CONTENT=NO
FIRMWARE_CHANGED=NO
PROVIDER_CALLS_THIS_STAGE=0
```

The corrected observer was kickstarted after the deployment and is running on
the established device port. No firmware reflash is required because the
failure was an exact deployment-environment omission and the reviewed app
image remains unchanged.

```text
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=ONE_COMBINED_EN_JA_PHYSICAL_ACCEPTANCE_SESSION_AFTER_EXACT_CONFIG_RESTORE
TERMINAL_REASON=PHYSICAL_BOUNDARY_ONLY
NEXT_ACTION=ONE_COMBINED_EN_JA_PHYSICAL_ACCEPTANCE_SESSION
```
