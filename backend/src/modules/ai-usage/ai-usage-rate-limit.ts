import { clientIp } from '../../common/http/client-ip';
import { type RateLimitGuardOptions } from '../../common/rate-limit/rate-limit-guard';
import { createRateLimit } from '../../common/rate-limit/rate-limit-options';

export const AI_USAGE_MAX_REQUESTS_PER_WINDOW = 30;

export const aiUsageRateLimit: RateLimitGuardOptions = createRateLimit(
  {},
  {
    key: (req) => `ai-usage:${clientIp(req)}`,
    maxPerWindow: AI_USAGE_MAX_REQUESTS_PER_WINDOW,
    message: 'AI usage requests are too frequent; try again later',
  }
);
