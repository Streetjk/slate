# Claude quota refresh — 6 October 2026

Base: abe5e1a. Branch: fix/claude-quota-refresh-20261006.
Campaign instruction source: 08501bb3ca75739e43fbf4f54811e0243ca5d193.

## Fault and change

Claude quota only read the statusline-produced cache. That file was last
observed on 2 October 2026 at 13:41:34 AWST. Invoking /usage did not update it.

The helper now runs a bounded Claude Code /usage collector using its normal
claude.ai login. No credentials or bearer tokens are extracted. Hooks, tools,
MCP and settings sources are disabled for the read. A previously trusted cwd
is required; trust and login prompts are never answered by the collector.

A terminal emulator reads the final screen after this invocation's Refreshing
indicator disappears, so overwritten/cached startup percentages are not
accepted as new observations. Percentages and explicit timezone/reset labels
must validate. Only safe quota metadata is atomically persisted at mode 0600.
Failure preserves the last observation and its timestamp.

Attempts are single-flight and throttled for five minutes, including failures.
The existing four-minute background timer retries on the next eligible tick
(within eight minutes). Requests may also trigger an eligible refresh. The
collector deadline is 25 seconds, cleanup one second, outer helper bound
30 seconds. CLI cleanup never performs an unbounded wait.

## Runtime setup

On this macOS host, use a venv made with /usr/bin/python3. A Python 3.14
framework-based venv hung while starting the native Claude executable;
the system-Python venv completed the same read in 3.61 seconds.

Install scripts/claude-usage-requirements.txt (pyte 0.8.2, wcwidth 0.2.13).
Copy claude-usage-refresh.py beside the deployed helper.ts, and configure:

- SLATE_CLAUDE_USAGE_PYTHON: absolute venv Python path
- SLATE_CLAUDE_USAGE_CWD: existing trusted workspace

Retain the existing launchd KeepAlive service and existing host/IP restrictions.
Rollback: restore the backed-up helper.ts and launchd plist, then reload only
com.slate.ai-usage-helper. No firmware or Orange Pi deployment is required.

## Verification and review

- 10 Python tests: pass. Includes actual-screen parsing, range/date failures,
  pending/error rejection, terminal overwrite, no-completed-refresh rejection,
  bounded timeout and child reaping, completed refresh accepting the new screen.
- 10 existing Bun helper tests: pass.
- Bun helper bundle: pass.
- git diff --check: pass.
- Live collector: 11% five-hour usage and 17% weekly usage, duration 3.61 s.
- Pinned AGY CLI 1.2.13 SHA-256:
  ef3728208834483754b06fd99963b4b6320740bf237212768dfed5256ae24ddb.
- Independent read-only review requested gemini-3.7-flash-medium, mode plan,
  sandbox, one turn: SUCCESS, PASS, no findings.
- Review packet SHA-256:
  b183059edf8f31f1c1bfc1db8664548c44349837587f532af2e6914cb9414b7e.
- Review conversation: b8d415b1-4824-45d2-be90-05a95c75e637.
- Provider response did not include an observed model identifier; none inferred.

## Limits

Claude UI format changes, login expiry, lost workspace trust or a hung CLI
cause a failed refresh rather than invented percentages. Existing six-hour
cache freshness policy remains. Reset times have the CLI display's minute
precision. Physical-device hold is preserved.
