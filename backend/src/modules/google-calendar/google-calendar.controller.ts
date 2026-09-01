import { Body, Controller, Delete, Get, HttpCode, Post, Query } from '@nestjs/common';
import { CurrentUser, Public } from '../../common/nest/decorators/auth-context.decorators';
import type { WebUserContext } from '../../common/nest/auth-context';
import { GoogleCalendarConfirmationDto } from './dto/google-calendar-confirmation.dto';
import { ProposeGoogleCalendarEventDto } from './dto/propose-google-calendar-event.dto';
import { GoogleCalendarConfirmationService } from './google-calendar-confirmation.service';
import { GoogleCalendarOAuthService } from './google-calendar-oauth.service';
import { GoogleCalendarWriteService } from './google-calendar-write.service';

@Controller('integrations/google/calendar')
export class GoogleCalendarController {
  constructor(
    private readonly oauth: GoogleCalendarOAuthService,
    private readonly confirmations: GoogleCalendarConfirmationService,
    private readonly writes: GoogleCalendarWriteService
  ) {}

  @Get('auth-url')
  authorizationUrl(@CurrentUser() user: WebUserContext): { url: string } {
    return { url: this.oauth.createAuthorizationUrl(user.userId) };
  }

  @Public()
  @Get('callback')
  async callback(
    @Query('state') state: string | undefined,
    @Query('code') code: string | undefined,
    @Query('error') error: string | undefined
  ): Promise<{ connected: boolean }> {
    if (error) throw new Error('Google Calendar OAuth authorization was denied');
    if (!state || !code) throw new Error('Google Calendar OAuth callback is missing state or code');
    return this.oauth.completeAuthorization(state, code);
  }

  @Get('status')
  status(@CurrentUser() user: WebUserContext) {
    return this.oauth.getConnectionStatus(user.userId);
  }

  @Delete('connection')
  @HttpCode(204)
  async disconnect(@CurrentUser() user: WebUserContext): Promise<void> {
    await this.oauth.disconnect(user.userId);
  }

  @Post('proposals')
  createProposal(@CurrentUser() user: WebUserContext, @Body() body: ProposeGoogleCalendarEventDto) {
    return this.confirmations.create(user.userId, body);
  }

  @Post('confirm')
  confirm(@CurrentUser() user: WebUserContext, @Body() body: GoogleCalendarConfirmationDto) {
    return this.writes.createConfirmedCalendarEvent(user.userId, body.ticket);
  }

  @Post('cancel')
  @HttpCode(204)
  async cancel(
    @CurrentUser() user: WebUserContext,
    @Body() body: GoogleCalendarConfirmationDto
  ): Promise<void> {
    await this.confirmations.cancel(user.userId, body.ticket);
  }
}
