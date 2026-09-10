import { describe, expect, it } from 'bun:test';
import {
  AiUsageService,
  buildSanitizedChildEnv,
  COMMAND_TIMEOUT_MS,
  COMMANDS,
  MAX_COMMAND_OUTPUT_BYTES,
  parseSanitizedUsagePayload,
  unavailableCard,
  type CommandRunner,
  type CommandRunnerOptions,
} from './ai-usage.service';

describe('AI usage service and command runner', () => {
  it('probes exact allowlisted commands with shell:false, safe cwd, bounded limits, and env redaction', async () => {
    const recordedCalls: Array<{
      command: string;
      args: readonly string[];
      options: CommandRunnerOptions;
    }> = [];

    const mockRunner: CommandRunner = async (command, args, options) => {
      recordedCalls.push({ command, args, options });
      return { stdout: 'version 1.0.0\n', stderr: '' };
    };

    const dirtyEnv: NodeJS.ProcessEnv = {
      PATH: '/custom/bin:/usr/bin',
      HOME: '/Users/admin',
      USER: 'admin',
      JWT_SECRET: 'super-secret-key',
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      COOKIE: 'session_id=abcdef123456',
      AUTH_TOKEN: 'bearer-token-val',
      OPENAI_API_KEY: 'sk-1234567890',
    };

    const service = new AiUsageService(mockRunner, {
      safeCwd: '/safe/tmp/dir',
      sourceEnv: dirtyEnv,
    });

    const snapshot = await service.getSnapshot();

    // Exactly 3 allowlisted commands called
    expect(recordedCalls.length).toBe(3);
    const invoked = recordedCalls.map((c) => [c.command, c.args]);
    expect(invoked).toEqual(Object.values(COMMANDS));
    expect(invoked).toEqual([
      ['codex', ['--version']],
      ['agy', ['--version']],
      ['grok', ['--version']],
    ]);

    for (const call of recordedCalls) {
      expect(call.options.shell).toBe(false);
      expect(call.options.timeout).toBe(COMMAND_TIMEOUT_MS);
      expect(call.options.maxBuffer).toBe(MAX_COMMAND_OUTPUT_BYTES);
      expect(call.options.cwd).toBe('/safe/tmp/dir');
      expect(call.options.windowsHide).toBe(true);

      // Environment is strictly sanitized: PATH is kept, all secrets/HOME/cookies are redacted
      expect(call.options.env.PATH).toBe('/custom/bin:/usr/bin');
      expect(call.options.env.HOME).toBeUndefined();
      expect(call.options.env.USER).toBeUndefined();
      expect(call.options.env.JWT_SECRET).toBeUndefined();
      expect(call.options.env.DATABASE_URL).toBeUndefined();
      expect(call.options.env.COOKIE).toBeUndefined();
      expect(call.options.env.AUTH_TOKEN).toBeUndefined();
      expect(call.options.env.OPENAI_API_KEY).toBeUndefined();
      expect(Object.keys(call.options.env)).toEqual(['PATH']);
    }

    // Probes return null metrics on version success
    expect(snapshot.cards.length).toBe(3);
    for (const card of snapshot.cards) {
      expect(card.usedPercent).toBeNull();
      expect(card.remainingPercent).toBeNull();
      expect(card.resetAt).toBeNull();
      expect(card.windowLabel).toBeNull();
      expect(card.planOrTier).toBeNull();
      expect(card.sessionInputTokens).toBeNull();
      expect(card.sessionOutputTokens).toBeNull();
      expect(card.sessionTotalTokens).toBeNull();
      expect(typeof card.lastUpdated).toBe('string');
      expect(card.sourceStatus).toBe('UNAVAILABLE_NO_MACHINE_READABLE_USAGE');
    }
  });

  it('keeps each provider isolated when one or more probes fail', async () => {
    const mockRunner: CommandRunner = async (command) => {
      if (command === 'agy') {
        throw new Error('Command failed: agy not found in PATH');
      }
      return { stdout: 'v1.0.0', stderr: '' };
    };

    const service = new AiUsageService(mockRunner);
    const snapshot = await service.getSnapshot();

    const codexCard = snapshot.cards.find((c) => c.provider === 'codex');
    const agyCard = snapshot.cards.find((c) => c.provider === 'agy_gemini');
    const grokCard = snapshot.cards.find((c) => c.provider === 'grok');

    expect(codexCard?.sourceStatus).toBe('UNAVAILABLE_NO_MACHINE_READABLE_USAGE');
    expect(grokCard?.sourceStatus).toBe('UNAVAILABLE_NO_MACHINE_READABLE_USAGE');
    expect(agyCard?.sourceStatus).toBe('UNAVAILABLE');
    expect(agyCard?.lastUpdated).toBeNull();
  });

  it('makes stale state honest: successful version probe never marks stale on subsequent failure', async () => {
    let shouldFail = false;
    const mockRunner: CommandRunner = async () => {
      if (shouldFail) {
        throw new Error('Process exited with 1');
      }
      return { stdout: 'v2.0.0', stderr: '' };
    };

    const service = new AiUsageService(mockRunner, { cacheTtlMs: 0 });

    // Run 1: version probe succeeds
    const firstSnapshot = await service.getSnapshot();
    const firstCodex = firstSnapshot.cards.find((c) => c.provider === 'codex');
    expect(firstCodex?.sourceStatus).toBe('UNAVAILABLE_NO_MACHINE_READABLE_USAGE');

    // Run 2: probe now fails
    shouldFail = true;
    service.clearCache();
    const secondSnapshot = await service.getSnapshot();
    const secondCodex = secondSnapshot.cards.find((c) => c.provider === 'codex');

    // Must be UNAVAILABLE, never STALE!
    expect(secondCodex?.sourceStatus).toBe('UNAVAILABLE');
    expect(secondCodex?.usedPercent).toBeNull();
  });

  it('allows only actual sanitized available metrics to become stale', async () => {
    let shouldFail = false;
    const mockRunner: CommandRunner = async () => {
      if (shouldFail) {
        throw new Error('timeout');
      }
      return { stdout: 'v1', stderr: '' };
    };

    const service = new AiUsageService(mockRunner, { cacheTtlMs: 0 });

    // Explicitly record actual sanitized available metrics
    const availableCard = parseSanitizedUsagePayload(
      'codex',
      {
        usedPercent: 45,
        remainingPercent: 55,
        sessionTotalTokens: 1200,
        windowLabel: 'weekly',
        planOrTier: 'pro',
      },
      '2026-09-10T02:00:00.000Z'
    );
    expect(availableCard).not.toBeNull();
    service.setLastGoodUsage(availableCard!);

    // Next run fails
    shouldFail = true;
    service.clearCache();
    const snapshot = await service.getSnapshot();
    const codexCard = snapshot.cards.find((c) => c.provider === 'codex');

    expect(codexCard?.sourceStatus).toBe('STALE');
    expect(codexCard?.usedPercent).toBe(45);
    expect(codexCard?.remainingPercent).toBe(55);
    expect(codexCard?.sessionTotalTokens).toBe(1200);
    expect(codexCard?.windowLabel).toBe('weekly');
    expect(codexCard?.planOrTier).toBe('pro');
    expect(codexCard?.lastUpdated).toBe('2026-09-10T02:00:00.000Z');
  });

  it('deduplicates concurrent in-flight collections and serves from snapshot cache', async () => {
    let callCount = 0;
    const resolvers: Array<(value: { stdout: string; stderr: string }) => void> = [];

    const mockRunner: CommandRunner = () => {
      callCount++;
      return new Promise((resolve) => {
        resolvers.push(resolve);
      });
    };

    const service = new AiUsageService(mockRunner, { cacheTtlMs: 60_000 });

    // Trigger two concurrent snapshot collections
    const promise1 = service.getSnapshot();
    const promise2 = service.getSnapshot();

    // Both calls must return the exact same in-flight promise
    expect(promise1).toBe(promise2);

    // Resolve all pending provider runners
    for (const resolve of resolvers) {
      resolve({ stdout: 'v1.0.0', stderr: '' });
    }

    const [snap1, snap2] = await Promise.all([promise1, promise2]);
    expect(snap1).toBe(snap2);
    expect(callCount).toBe(3); // 3 providers, called exactly once

    // Subsequent call within cache TTL returns cached snapshot without re-running
    const snap3 = await service.getSnapshot();
    expect(snap3).toBe(snap1);
    expect(callCount).toBe(3);
  });
});

describe('Sanitized child environment helper', () => {
  it('allowlists PATH and strips HOME, auth tokens, database credentials, and cookies', () => {
    const sanitized = buildSanitizedChildEnv({
      PATH: '/bin:/usr/bin',
      HOME: '/home/ubuntu',
      COOKIE: 'sess=secret',
      DATABASE_PASSWORD: 'password123',
      JWT_SECRET: 'jwt-val',
      TOKEN: 'token-val',
    });

    expect(sanitized).toEqual({ PATH: '/bin:/usr/bin' });
  });

  it('provides a default safe PATH when PATH is absent', () => {
    const sanitized = buildSanitizedChildEnv({});
    expect(sanitized.PATH).toBe('/usr/bin:/bin:/usr/local/bin');
  });
});

describe('AI usage payload sanitization', () => {
  it('represents an unavailable provider without inventing metrics', () => {
    const card = unavailableCard('codex', null, 'UNAVAILABLE');
    expect(card.usedPercent).toBeNull();
    expect(card.remainingPercent).toBeNull();
    expect(card.sessionTotalTokens).toBeNull();
    expect(card.sourceStatus).toBe('UNAVAILABLE');
  });

  it('accepts bounded usage, reset time and session tokens with safe labels', () => {
    expect(
      parseSanitizedUsagePayload(
        'grok',
        {
          usedPercent: 100,
          remainingPercent: 0,
          resetAt: '2026-09-10T00:00:00Z',
          windowLabel: 'weekly',
          planOrTier: 'Pro (monthly)',
          sessionInputTokens: 10,
          sessionOutputTokens: 20,
          sessionTotalTokens: 30,
        },
        '2026-09-10T01:00:00Z'
      )
    ).toMatchObject({
      usedPercent: 100,
      remainingPercent: 0,
      resetAt: '2026-09-10T00:00:00.000Z',
      windowLabel: 'weekly',
      planOrTier: 'Pro (monthly)',
      sessionTotalTokens: 30,
      sourceStatus: 'AVAILABLE',
    });
  });

  it('fails closed for empty objects, non-objects, and objects without metric fields', () => {
    expect(parseSanitizedUsagePayload('codex', {}, '2026-09-10T00:00:00Z')).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: undefined, resetAt: undefined },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(parseSanitizedUsagePayload('codex', null, '2026-09-10T00:00:00Z')).toBeNull();
    expect(parseSanitizedUsagePayload('codex', 'bad', '2026-09-10T00:00:00Z')).toBeNull();
    expect(parseSanitizedUsagePayload('codex', [1, 2, 3], '2026-09-10T00:00:00Z')).toBeNull();
  });

  it('fails closed for sensitive, URL, and account-like labels', () => {
    // URLs and protocols
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, windowLabel: 'https://api.openai.com/v1' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, windowLabel: 'http://localhost:8080' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, windowLabel: 'www.example.com' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, windowLabel: '/var/secrets/key' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();

    // Email and account handles
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, windowLabel: 'user@example.com' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, windowLabel: '@admin' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();

    // Account-like prefixes
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, planOrTier: 'acct_123456' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, planOrTier: 'user:alice' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, planOrTier: 'org_enterprise' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();

    // Sensitive tokens / credentials
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, planOrTier: 'sk-abcdef123456' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, planOrTier: 'bearer access-token' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, windowLabel: 'my-secret-key' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, windowLabel: 'cookie-session' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { usedPercent: 50, windowLabel: 'password-reset' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
  });

  it('rejects out-of-range, unexpected keys, and invalid date formats', () => {
    expect(
      parseSanitizedUsagePayload('codex', { usedPercent: 101 }, '2026-09-10T00:00:00Z')
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload('codex', { usedPercent: -1 }, '2026-09-10T00:00:00Z')
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { accountEmail: 'private@example.test' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload('codex', { resetAt: 'not-a-date' }, '2026-09-10T00:00:00Z')
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload('codex', { sessionTotalTokens: -50 }, '2026-09-10T00:00:00Z')
    ).toBeNull();
  });

  it('allows safe labels like 5-hour, daily, Tier 1, and pay-as-you-go', () => {
    const card = parseSanitizedUsagePayload(
      'agy_gemini',
      {
        remainingPercent: 100,
        windowLabel: '5-hour',
        planOrTier: 'Tier 1',
      },
      '2026-09-10T01:00:00Z'
    );
    expect(card?.remainingPercent).toBe(100);
    expect(card?.windowLabel).toBe('5-hour');
    expect(card?.planOrTier).toBe('Tier 1');
    expect(card?.sourceStatus).toBe('AVAILABLE');
  });
});
