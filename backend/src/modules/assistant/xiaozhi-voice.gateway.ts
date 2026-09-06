import { Injectable, Logger } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { WebSocket } from 'ws';
import { DeviceSecretAuthCacheService } from '../../infra/auth/device-secret-auth-cache.service';
import { extractDeviceSecret } from '../../common/nest/guards/http-token';
import { GeminiLiveService } from './gemini-live.service';
import { XiaozhiVoiceSession, type VoiceCalendarActions } from './xiaozhi-voice-session';
import { GoogleCalendarConfirmationService } from '../google-calendar/google-calendar-confirmation.service';
import { GoogleCalendarWriteService } from '../google-calendar/google-calendar-write.service';

@Injectable()
export class XiaozhiVoiceGateway {
  private readonly logger = new Logger(XiaozhiVoiceGateway.name);

  constructor(
    private readonly devices: DeviceSecretAuthCacheService,
    private readonly live: GeminiLiveService,
    private readonly calendarConfirmations: GoogleCalendarConfirmationService,
    private readonly calendarWrites: GoogleCalendarWriteService
  ) {}

  async handle(socket: WebSocket, request: FastifyRequest): Promise<void> {
    this.logger.log('VOICE_WS_UPGRADE_ATTEMPT=YES');
    const secret = extractDeviceSecret(request);
    const device = secret ? await this.devices.authenticate(secret) : null;
    if (!device) {
      this.logger.log('VOICE_WS_AUTH_RESULT=REJECT');
      this.logger.log('VOICE_WS_ACCEPTED=NO');
      socket.close(1008, 'device authentication failed');
      return;
    }
    this.logger.log('VOICE_WS_AUTH_RESULT=PASS');
    this.logger.log('VOICE_WS_ACCEPTED=YES');
    const calendar = device.ownerUserId ? this.calendarActions(device.ownerUserId) : undefined;
    new XiaozhiVoiceSession(socket, this.live, undefined, calendar).start();
  }

  private calendarActions(userId: string): VoiceCalendarActions {
    return {
      propose: (proposal) => this.calendarConfirmations.create(userId, proposal),
      confirm: (ticket) => this.calendarWrites.createConfirmedCalendarEvent(userId, ticket),
      cancel: (ticket) => this.calendarConfirmations.cancel(userId, ticket),
    };
  }
}
