# Grok 4.6 technical decision authority

Date: 2026-09-13 (Australia/Perth)
Status: CONTROLLING TECHNICAL DECISION POLICY; NO NEW PRODUCTION AUTHORITY

The operator explicitly directs that Grok 4.6 make all ordinary technical decisions for the current Slate repair campaign.

```text
TECHNICAL_DECISION_AUTHORITY=grok -m grok-4.6
EXECUTION_CONTROLLER=Codex
INTEGRATOR=Codex
PREFERRED_IMPLEMENTATION_WRITER=Z.ai glm-5.3-flash
TEMPORARY_IMPLEMENTATION_WRITER=Codex only when Grok assigns it after the existing bounded Z.ai failure policy
FINAL_REVIEWER=grok -m grok-4.6 in a fresh independent context
```

Grok 4.6 decides, among other ordinary engineering matters:

- repair architecture and mission ordering;
- exact glyph/font strategy;
- EN/JA/ZH_HANT language-policy design;
- Chinese-latency observability design;
- affected files and implementation boundaries;
- writer assignment after the existing Z.ai bounded attempt;
- test scope, failure adjudication, repair loops and candidate composition;
- exact technical readiness before activation.

Codex executes Grok decisions and gathers evidence. Codex must not substitute its own technical preference for a valid Grok decision.

If a Grok decision conflicts with mechanically verified evidence, explicit operator requirements, repository invariants, privacy/safety rules, or an authority boundary, Codex must return the exact contradiction to Grok for a revised decision rather than choosing an alternative itself.

Grok may not grant operator authority for production deployment, firmware flash, physical requalification, credentials, OAuth, billing, provider/model/auth changes, C9/C10 activation, merge or release. Those remain explicit operator boundaries.

The existing physical attempt remains consumed and automatic repeat remains unauthorized. The existing repair directives for the Japanese glyph, Traditional Chinese response policy, and Chinese latency instrumentation remain the active technical scope.

Checkpoint/report/test/build/review completion is not a stop while Grok reports safe runnable work. Before voluntary stop, Grok must return a portfolio decision of CONTINUE or STOP with runnable safe work count, next safe action, and stop reason.
