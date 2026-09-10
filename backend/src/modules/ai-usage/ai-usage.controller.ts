import { Controller, Get } from '@nestjs/common';
import { RateLimit } from '../../common/rate-limit/rate-limit-guard';
import { aiUsageRateLimit } from './ai-usage-rate-limit';
import { AiUsageService } from './ai-usage.service';
import type { AiUsageSnapshot } from './ai-usage.types';

@Controller('ai-usage')
export class AiUsageController {
  constructor(private readonly usage: AiUsageService) {}

  @RateLimit(aiUsageRateLimit)
  @Get()
  snapshot(): Promise<AiUsageSnapshot> {
    return this.usage.getSnapshot();
  }
}
