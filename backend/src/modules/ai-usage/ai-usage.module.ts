import { Module } from '@nestjs/common';
import { AiUsageAuthFlowService } from './ai-usage-auth-flow.service';
import { AiUsageController } from './ai-usage.controller';
import { AiUsageService } from './ai-usage.service';

@Module({
  controllers: [AiUsageController],
  providers: [AiUsageService, AiUsageAuthFlowService],
})
export class AiUsageModule {}
