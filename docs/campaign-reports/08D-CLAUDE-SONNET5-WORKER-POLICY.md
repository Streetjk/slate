# Campaign 8D addendum — Claude Sonnet 5 worker policy

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

This addendum is binding for Campaign 8D and any follow-up work on this PR unless superseded by a newer explicit user instruction.

## Worker routing

Codex remains the primary controller, sole production writer/integrator, and final adjudicator.

When a bounded Claude worker is useful, use **Claude Sonnet 5 through the authenticated Claude CLI session only**.

Required rules:

- use Claude Sonnet 5 via the installed/authenticated Claude CLI;
- do not use OpenRouter for Claude/Sonnet work;
- do not use an Anthropic API key path unless separately and explicitly authorized by the user;
- do not introduce `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, copied bearer tokens, or other static credentials;
- do not route Claude requests through a proxy, aggregator, or compatibility endpoint;
- do not expose or copy Claude CLI session credentials;
- Claude is a bounded worker only; it must not become controller, production integrator, or autonomous recursive delegator;
- Codex must validate all Claude output with deterministic tests and repository evidence before integration;
- AGY remains the independent read-only reviewer where required by the campaign.

If Claude CLI is unavailable, unauthenticated, rate-limited, or Sonnet 5 cannot be selected through the existing CLI session, **do not silently fall back to OpenRouter or another Claude transport**. Continue with Codex alone where safe, or record the worker as unavailable and proceed according to the campaign gates.

For reports, record only:

- `CLAUDE_WORKER=SONNET_5`
- `CLAUDE_TRANSPORT=CLAUDE_CLI`
- `CLAUDE_AUTH=EXISTING_AUTHENTICATED_CLI_SESSION`

Never record credential values.
