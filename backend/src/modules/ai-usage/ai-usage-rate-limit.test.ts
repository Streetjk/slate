import { describe, expect, it } from 'bun:test';
import type { ExecutionContext } from '@nestjs/common';
import { RateLimitedError } from '../../common/errors';
import { createRateLimitGuard } from '../../common/rate-limit/test-utils';
import { AI_USAGE_MAX_REQUESTS_PER_WINDOW, aiUsageRateLimit } from './ai-usage-rate-limit';

function context(ip = '127.0.0.1'): ExecutionContext {
  return {
    getHandler: () => context,
    getClass: () => Object,
    switchToHttp: () => ({
      getRequest: () => ({
        ip,
        headers: {},
        method: 'GET',
        url: '/api/v1/ai-usage',
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('aiUsageRateLimit', () => {
  it('allows requests up to maxPerWindow and limits the next', () => {
    const guard = createRateLimitGuard(aiUsageRateLimit);

    for (let i = 0; i < AI_USAGE_MAX_REQUESTS_PER_WINDOW; i++) {
      expect(guard.canActivate(context('10.0.0.1'))).toBe(true);
    }

    expect(() => guard.canActivate(context('10.0.0.1'))).toThrow(RateLimitedError);
  });

  it('isolates rate-limit buckets per client IP', () => {
    const guard = createRateLimitGuard(aiUsageRateLimit);

    for (let i = 0; i < AI_USAGE_MAX_REQUESTS_PER_WINDOW; i++) {
      expect(guard.canActivate(context('192.168.1.1'))).toBe(true);
    }

    expect(() => guard.canActivate(context('192.168.1.1'))).toThrow(RateLimitedError);
    expect(guard.canActivate(context('192.168.1.2'))).toBe(true);
  });
});
