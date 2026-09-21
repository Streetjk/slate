import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser, Public } from '../../../common/nest/decorators/auth-context.decorators';
import type { WebUserContext } from '../../../common/nest/auth-context';
import { ServiceUnavailableError } from '../../../common/errors';
import { MicrosoftOAuthService } from './microsoft-oauth.service';

@Controller('integrations/microsoft/calendar')
export class OutlookController {
  constructor(private readonly oauth: MicrosoftOAuthService) {}

  @Post('device')
  async startDeviceAuthorization(@CurrentUser() user: WebUserContext) {
    if (!this.oauth.isConfigured()) {
      throw new ServiceUnavailableError(
        'Microsoft Outlook device login requires MICROSOFT_CLIENT_ID'
      );
    }
    return this.oauth.startDeviceAuthorization(user.userId);
  }

  @Get('device/:flowId')
  deviceAuthorizationStatus(@CurrentUser() user: WebUserContext, @Param('flowId') flowId: string) {
    return this.oauth.getDeviceAuthorization(user.userId, flowId);
  }

  @Delete('device/:flowId')
  cancelDeviceAuthorization(
    @CurrentUser() user: WebUserContext,
    @Param('flowId') flowId: string
  ): { cancelled: true } {
    this.oauth.cancelDeviceAuthorization(user.userId, flowId);
    return { cancelled: true };
  }

  @Get('auth-url')
  async authorizationUrl(@CurrentUser() user: WebUserContext): Promise<{ url: string }> {
    if (!this.oauth.isLegacyConfigured()) {
      throw new ServiceUnavailableError(
        'Legacy Microsoft callback OAuth is not configured on this Slate server'
      );
    }
    return { url: await this.oauth.createAuthorizationUrl(user.userId) };
  }

  @Public()
  @Get('callback')
  async callback(
    @Query('state') state: string | undefined,
    @Query('code') code: string | undefined,
    @Query('error') error: string | undefined
  ): Promise<{ connected: boolean }> {
    if (error) throw new Error(`Microsoft OAuth authorization failed: ${error}`);
    if (!state || !code) throw new Error('Microsoft OAuth callback is missing state or code');
    const result = await this.oauth.completeAuthorization(state, code);
    return { connected: result.connected };
  }

  @Get('status')
  status(@CurrentUser() user: WebUserContext) {
    return this.oauth.getConnectionStatus(user.userId);
  }
}
