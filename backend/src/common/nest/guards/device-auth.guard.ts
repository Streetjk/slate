import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { DeviceSecretAuthCacheService } from '../../../infra/auth/device-secret-auth-cache.service';
import { AuthError } from '../../errors';
import { CURRENT_DEVICE_KEY, type DeviceContext } from '../auth-context';
import { extractDeviceSecret } from './http-token';

export const VOICE_CONFIG_RESPONSE_CLASS_LOGGED_KEY = Symbol('VoiceConfigResponseClassLogged');

export function isVoiceConfigRequest(url?: string): boolean {
  if (!url) return false;
  return url.includes('devices/current/voice/config') || url.includes('voice/config');
}

@Injectable()
export class DeviceAuthGuard implements CanActivate {
  private readonly logger = new Logger(DeviceAuthGuard.name);

  constructor(private readonly deviceSecrets: DeviceSecretAuthCacheService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<
      FastifyRequest & {
        [CURRENT_DEVICE_KEY]?: DeviceContext;
        [VOICE_CONFIG_RESPONSE_CLASS_LOGGED_KEY]?: boolean;
      }
    >();
    const isVoiceConfig = isVoiceConfigRequest(req?.url ?? req?.raw?.url);
    if (isVoiceConfig) {
      this.logger.log('VOICE_CONFIG_AUTH_ATTEMPT=YES');
    }
    const secret = extractDeviceSecret(req);
    if (!secret) {
      if (isVoiceConfig) {
        this.logger.log('VOICE_CONFIG_AUTH_RESULT=REJECT');
        this.logger.log('VOICE_CONFIG_RESPONSE_CLASS=4xx');
        req[VOICE_CONFIG_RESPONSE_CLASS_LOGGED_KEY] = true;
      }
      throw new AuthError('设备认证失败');
    }
    const device = await this.deviceSecrets.authenticate(secret);
    if (!device) {
      if (isVoiceConfig) {
        this.logger.log('VOICE_CONFIG_AUTH_RESULT=REJECT');
        this.logger.log('VOICE_CONFIG_RESPONSE_CLASS=4xx');
        req[VOICE_CONFIG_RESPONSE_CLASS_LOGGED_KEY] = true;
      }
      throw new AuthError('设备认证失败');
    }
    if (isVoiceConfig) {
      this.logger.log('VOICE_CONFIG_AUTH_RESULT=PASS');
    }
    req[CURRENT_DEVICE_KEY] = device;
    return true;
  }
}
