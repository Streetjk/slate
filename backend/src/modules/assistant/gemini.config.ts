import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvT } from '../../infra/config/env.schema';

@Injectable()
export class GeminiConfig {
  constructor(private readonly cs: ConfigService<EnvT, true>) {}

  get project(): string | undefined {
    return this.cs.get('GOOGLE_CLOUD_PROJECT', { infer: true });
  }

  get location(): string | undefined {
    return this.cs.get('GOOGLE_CLOUD_LOCATION', { infer: true });
  }

  get textModel(): string {
    return this.cs.get('GEMINI_TEXT_MODEL', { infer: true });
  }

  get liveModel(): string {
    return this.cs.get('GEMINI_LIVE_MODEL', { infer: true });
  }

  get liveConnectTimeoutMs(): number {
    return this.cs.get('GEMINI_LIVE_CONNECT_TIMEOUT_MS', { infer: true });
  }

  isConfigured(): boolean {
    return Boolean(this.project && this.location);
  }
}
