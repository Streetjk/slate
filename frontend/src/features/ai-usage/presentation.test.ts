// Bun executes this focused test directly; the frontend package intentionally
// does not ship Bun's test types to the browser build.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { describe, expect, it } from 'bun:test';
import { presentAiUsageCard } from './presentation';
import type { AiUsageCard } from './query/ai-usage-queries';

const baseCard: AiUsageCard = {
  provider: 'zai',
  usedPercent: null,
  remainingPercent: null,
  resetAt: null,
  windowLabel: null,
  planOrTier: null,
  sessionInputTokens: null,
  sessionOutputTokens: null,
  sessionTotalTokens: null,
  lastUpdated: null,
  sourceStatus: 'UNAVAILABLE_NO_MACHINE_READABLE_USAGE',
  capability: { binaryPresent: true, version: 'glm-5.3-flash (Z.ai)', probeCommand: 'glm53' },
  source: 'version_probe',
  usageSupported: false,
  quotaSource: 'unsupported',
  availability: 'UNAVAILABLE_NO_MACHINE_READABLE_USAGE',
  freshness: 'fresh',
  probedAt: '2026-09-14T00:00:00.000Z',
  staleAfter: null,
  error: null,
  unknownQuotaFields: {},
  auth: {
    mode: 'api_key',
    status: 'LOCAL_AUTH_PRESENT',
    source: 'local_metadata',
    loginCommand: 'glm53',
    loginHint: 'Z.ai uses the configured local API key.',
    checkedAt: '2026-09-14T00:00:00.000Z',
  },
};

describe('AI usage presentation', () => {
  it('renders Z.ai and distinguishes capability probes from quota data', () => {
    const presented = presentAiUsageCard(baseCard);
    expect(presented.providerLabel).toBe('Z.ai');
    expect(presented.sourceLabel).toBe('CLI capability probe');
    expect(presented.availabilityLabel).toBe('Quota unavailable');
    expect(presented.versionLabel).toBe('glm-5.3-flash (Z.ai)');
    expect(presented.usedLabel).toBe('Unavailable');
    expect(presented.authStatusLabel).toBe('API key detected');
    expect(presented.authModeLabel).toBe('API key');
    expect(presented.loginCommand).toBe('glm53');
  });

  it('renders OAuth not-detected state without inventing account details', () => {
    const presented = presentAiUsageCard({
      ...baseCard,
      auth: { ...baseCard.auth, status: 'NOT_DETECTED' },
    });
    expect(presented.authStatusLabel).toBe('No API key detected');
    expect(JSON.stringify(presented)).not.toContain('@');
  });

  it('renders stale and error states without inventing metrics', () => {
    const stale = presentAiUsageCard({ ...baseCard, sourceStatus: 'STALE', freshness: 'stale' });
    const error = presentAiUsageCard({
      ...baseCard,
      sourceStatus: 'ERROR',
      availability: 'ERROR',
      freshness: 'error',
    });
    expect(stale.statusLabel).toBe('Stale');
    expect(stale.freshnessLabel).toBe('Stale');
    expect(error.statusLabel).toBe('Error');
    expect(error.availabilityLabel).toBe('Error');
    expect(error.remainingLabel).toBe('Unavailable');
  });

  it('maps sanitized metrics and unsupported capability sources without collapsing them', () => {
    const sanitized = presentAiUsageCard({
      ...baseCard,
      source: 'sanitized_metrics',
      sourceStatus: 'AVAILABLE',
      availability: 'AVAILABLE',
      freshness: 'fresh',
      usageSupported: true,
      quotaWindows: [
        {
          label: '5h',
          usedPercent: 0,
          remainingPercent: 100,
          resetAt: null,
        },
        {
          label: 'Weekly',
          usedPercent: 13,
          remainingPercent: 87,
          resetAt: '2026-09-23T08:07:43.983Z',
        },
      ],
      sessionTotalTokens: 30,
    });
    const unsupported = presentAiUsageCard({
      ...baseCard,
      source: 'none',
      sourceStatus: 'UNAVAILABLE',
      availability: 'UNSUPPORTED',
      freshness: 'fresh',
    });
    const missing = presentAiUsageCard({
      ...baseCard,
      source: 'none',
      sourceStatus: 'UNAVAILABLE',
      availability: 'BINARY_MISSING',
      freshness: 'fresh',
    });

    expect(sanitized.sourceLabel).toBe('Sanitized metrics');
    expect(sanitized.sessionTokensLabel).toBe('30');
    expect(sanitized.quotaWindows.map((window) => window.label)).toEqual(['5h', 'Weekly']);
    expect(sanitized.quotaWindows[1]?.usedLabel).toBe('13%');
    expect(unsupported.sourceLabel).toBe('No source');
    expect(unsupported.availabilityLabel).toBe('Unsupported');
    expect(missing.availabilityLabel).toBe('CLI unavailable');
  });
});
