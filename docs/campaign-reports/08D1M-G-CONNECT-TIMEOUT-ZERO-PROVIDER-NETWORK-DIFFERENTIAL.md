# Campaign 8D1M-G — ACTIVE Zero-Provider Connect-Timeout Network Differential

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Status

```text
DIRECTIVE_STATE=ACTIVE_ZERO_PROVIDER_ONLY
NEW_GEMINI_PROVIDER_SESSIONS_AUTHORIZED=0
PRODUCTION_MUTATION_AUTHORIZED=NO
PRODUCTION_RESTART_AUTHORIZED=NO
CREDENTIAL_VALUE_READ_AUTHORIZED=NO
PRIVATE_DATA_OR_MICROPHONE=NO
FIRMWARE_FLASH=NO
PR2_MERGE=NO
```

This directive is a continuation of the already-required zero-provider forensics after the G2 provider failure. It does not authorize another Gemini Live session or any production mutation.

## Accepted evidence

```text
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
ARM64_IMAGE_SHA=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
G1_CORRECTED_NATIVE_AUDIO=PASS
G2_HOST_NATIVE_RUNTIME_CONTROL=PASS
G2_PROVIDER_DISABLED_CANDIDATE_CONTROL=PASS_6_TESTS
G2_PROVIDER_FAILURE=CONNECT_TIMEOUT
G2_READY=NO
G2_TURNS=0
G_PROVIDER_SESSIONS_USED=3_OF_3
G_PROVIDER_SESSIONS_REMAINING=0
PRODUCTION_MUTATION=NO
PRODUCTION_HEALTH=PASS
```

The current evidence does not prove whether `CONNECT_TIMEOUT` came from Gemini itself or from the disposable host-native daemon/container egress path. Because G1 previously reached the same 2.5 Live model successfully, the network/runtime differential must be exhausted before requesting another provider session.

## N0 — reconstruct G1 vs G2 launch/network shape

Without provider access or credential reads, compare the exact known-good G1 corrected launch with the failed G2 launch. Record only structural configuration:

- Docker daemon/runtime location and version;
- container `--network` mode;
- daemon bridge/iptables/ip-forward/ip-masq flags;
- `/etc/resolv.conf` source/shape, without reporting private resolver data beyond classification;
- proxy-related environment variable presence/absence only, never values;
- IPv4/IPv6 route availability classification;
- container user/workdir/entrypoint;
- Node executable and SDK version;
- connect-timeout setting;
- secret mount path/mode metadata only.

Explicitly answer:

```text
G1_NETWORK_MODE=<value>
G2_NETWORK_MODE=<value>
NETWORK_SHAPE_EQUIVALENT=YES|NO
G2_USED_HOST_NETWORK=YES|NO
```

Do not infer that the G2 container had internet access merely because its process started.

## N1 — zero-provider egress proof from host-native NVMe runtime

Recreate the same temporary host-native NVMe-backed Docker daemon, still separate from production Docker. Do not mount the Gemini credential.

From both the Orange Pi host and the exact candidate container, perform only non-generative connectivity checks:

1. DNS resolution for the Gemini API hostname used by the SDK;
2. TCP connect to the required remote host on port 443;
3. TLS handshake to that host with SNI and certificate verification;
4. one generic public HTTPS control endpoint for comparison if needed.

Do not send a Gemini generate/live request, do not open a Live WebSocket session, do not send an API key, and do not retain remote payload bodies. A TLS handshake is permitted; an authenticated Gemini request is not.

Run the candidate connectivity check under the exact G2 network mode first. If G2 did not use host networking, also run one control with `--network host` under the same isolated daemon, still without credentials/provider access.

Required classification:

```text
HOST_DNS=PASS|FAIL
HOST_TCP443=PASS|FAIL
HOST_TLS=PASS|FAIL
G2_EXACT_NETWORK_DNS=PASS|FAIL
G2_EXACT_NETWORK_TCP443=PASS|FAIL
G2_EXACT_NETWORK_TLS=PASS|FAIL
G2_HOST_NETWORK_CONTROL_DNS=PASS|FAIL|NOT_NEEDED
G2_HOST_NETWORK_CONTROL_TCP443=PASS|FAIL|NOT_NEEDED
G2_HOST_NETWORK_CONTROL_TLS=PASS|FAIL|NOT_NEEDED
```

## N2 — bounded disposable-runtime correction

If and only if N0/N1 prove the timeout is caused by the disposable G2 runtime/network invocation, correct only that disposable launch/runtime shape. Examples include selecting the already-proposed host network mode or correcting DNS/runtime invocation. Do not change production Docker networking, host firewall policy, persistent iptables/nftables rules, source code, credentials, billing, or model selection.

After a disposable-only correction:

- repeat N1 until the exact candidate proves DNS/TCP/TLS egress;
- repeat provider-disabled 6-test candidate control;
- verify production Slate/MySQL/local/public health remains green;
- stop the temporary daemon and clean only disposable runtime state.

No Gemini Live session is authorized by this directive even after the correction passes.

## N3 — if network already passes

If DNS/TCP/TLS all pass under the exact G2 network shape, do not change the runtime blindly. Compare the G1 and G2 SDK/connect configuration and timing structurally, including model ID, endpoint/client mode, Node/SDK version, timeout values, and connect invocation path. Run deterministic/provider-disabled reproductions where possible.

Do not modify tracked product/runtime source unless a deterministic defect is proven. If tracked source must change, perform full focused tests, ARM64/provider-disabled qualification, baseline-equivalence check, and exact Grok 4.6 review before returning for any new provider authorization.

## Required closure

Publish the result to this file and `CAMPAIGN-STATE.md`, then push/fetch-verify the exact remote checkpoint.

Preferred closure states:

```text
ROOT_CAUSE_CLASS=G2_DISPOSABLE_NETWORK_PATH
NETWORK_CORRECTION=PASS
PRODUCT_SOURCE_CHANGED=NO
READY_FOR_ONE_CORRECTED_G2_PROVIDER_AUTHORIZATION=YES
```

or

```text
ROOT_CAUSE_CLASS=NETWORK_PATH_NOT_CAUSAL
ZERO_PROVIDER_DIFFERENTIAL=EXHAUSTED
PRODUCT_SOURCE_CHANGED=NO|YES_FULLY_REQUALIFIED
READY_FOR_NEW_PROVIDER_DECISION=YES
```

## Hard boundaries

No new Gemini provider session, no G3 production deployment, no credential value read/copy, no billing/Vertex change, no production Docker mutation, no persistent firewall/network change, no Deluge/NVMe repartitioning, no private data/microphone, no firmware flash, and no PR #2 merge.

`REPORT-PUSH-INVARIANT.md` remains binding. Zero-provider forensic/report pushes are not handoffs; exhaust this differential before returning control.