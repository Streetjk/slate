import { Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { WebSocket } from 'ws';
import { DeviceSecretAuthCacheService } from '../../infra/auth/device-secret-auth-cache.service';
import { extractDeviceSecret } from '../../common/nest/guards/http-token';
import { GeminiLiveService } from './gemini-live.service';
import { XiaozhiVoiceSession } from './xiaozhi-voice-session';

@Injectable()
export class XiaozhiVoiceGateway {
  constructor(
    private readonly devices: DeviceSecretAuthCacheService,
    private readonly live: GeminiLiveService
  ) {}

  async handle(socket: WebSocket, request: FastifyRequest): Promise<void> {
    const secret = extractDeviceSecret(request);
    const device = secret ? await this.devices.authenticate(secret) : null;
    if (!device) {
      socket.close(1008, 'device authentication failed');
      return;
    }
    new XiaozhiVoiceSession(socket, this.live).start();
  }
}
