import { clientIp } from '../../common/http/client-ip';
import { type RateLimitGuardOptions } from '../../common/rate-limit/rate-limit-guard';
import { createRateLimit } from '../../common/rate-limit/rate-limit-options';

const INGEST_MAX_PER_WINDOW = 30;

export const weatherCitySearchRateLimit: RateLimitGuardOptions = createRateLimit(
  {},
  {
    key: (req) => `weather-city:${clientIp(req)}`,
    maxPerWindow: 30,
    message: 'City search is too frequent; try again later',
  }
);

export const ingestRateLimit: RateLimitGuardOptions = createRateLimit(
  {},
  {
    key: (req) => (req.params as { contentId?: string })?.contentId ?? '',
    maxPerWindow: INGEST_MAX_PER_WINDOW,
    message: `Maximum ${INGEST_MAX_PER_WINDOW} pushes per minute`,
  }
);
