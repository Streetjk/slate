import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import type { WebUserContext } from '../../common/nest/auth-context';
import { CurrentUser } from '../../common/nest/decorators/auth-context.decorators';
import { RateLimit } from '../../common/rate-limit/rate-limit-guard';
import { AiUsageAuthFlowService } from './ai-usage-auth-flow.service';
import { aiUsageRateLimit } from './ai-usage-rate-limit';
import { AiUsageService } from './ai-usage.service';
import type { AiUsageDeviceAuthFlow, AiUsageSnapshot } from './ai-usage.types';

@Controller('ai-usage')
export class AiUsageController {
  constructor(
    private readonly usage: AiUsageService,
    private readonly authFlow: AiUsageAuthFlowService
  ) {}

  @RateLimit(aiUsageRateLimit)
  @Get()
  async snapshot(): Promise<AiUsageSnapshot> {
    return this.authFlow.enrichSnapshot(await this.usage.getSnapshot());
  }

  @RateLimit(aiUsageRateLimit)
  @Post('oauth/device/:provider')
  startDeviceAuth(
    @CurrentUser() user: WebUserContext,
    @Param('provider') provider: string
  ): Promise<AiUsageDeviceAuthFlow> {
    return this.authFlow.start(user.userId, provider);
  }

  @RateLimit(aiUsageRateLimit)
  @Get('oauth/device/flows/:flowId')
  deviceAuthStatus(
    @CurrentUser() user: WebUserContext,
    @Param('flowId') flowId: string
  ): Promise<AiUsageDeviceAuthFlow> {
    return this.authFlow.status(user.userId, flowId);
  }

  @RateLimit(aiUsageRateLimit)
  @Delete('oauth/device/flows/:flowId')
  @HttpCode(204)
  cancelDeviceAuth(
    @CurrentUser() user: WebUserContext,
    @Param('flowId') flowId: string
  ): Promise<void> {
    return this.authFlow.cancel(user.userId, flowId);
  }
}
