import { Controller, Get } from '@nestjs/common';
import { AiUsageService } from './ai-usage.service';
import type { AiUsageSnapshot } from './ai-usage.types';

@Controller('ai-usage')
export class AiUsageController {
  constructor(private readonly usage: AiUsageService) {}

  @Get()
  snapshot(): Promise<AiUsageSnapshot> {
    return this.usage.getSnapshot();
  }
}
