import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser, Public } from '../../../common/nest/decorators/auth-context.decorators';
import type { WebUserContext } from '../../../common/nest/auth-context';
import { MicrosoftOAuthService } from './microsoft-oauth.service';

@Controller('integrations/microsoft/calendar')
export class OutlookController {
  constructor(private readonly oauth: MicrosoftOAuthService) {}

  @Get('auth-url')
  async authorizationUrl(@CurrentUser() user: WebUserContext): Promise<{ url: string }> {
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
