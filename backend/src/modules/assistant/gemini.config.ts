import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvT } from '../../infra/config/env.schema';
import type { GeminiClientOptions } from './gemini.client';

export type GeminiAuthMode = 'vertex_adc' | 'developer_api_key';

@Injectable()
export class GeminiConfig {
  constructor(private readonly cs: ConfigService<EnvT, true>) {}

  get project(): string | undefined {
    return this.cs.get('GOOGLE_CLOUD_PROJECT', { infer: true });
  }

  get location(): string | undefined {
    return this.cs.get('GOOGLE_CLOUD_LOCATION', { infer: true });
  }

  get authMode(): GeminiAuthMode {
    return this.cs.get('GEMINI_AUTH_MODE', { infer: true });
  }

  get apiKeyFile(): string | undefined {
    return this.cs.get('GEMINI_API_KEY_FILE', { infer: true });
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
    return this.authMode === 'developer_api_key'
      ? Boolean(this.apiKeyFile)
      : Boolean(this.project && this.location);
  }

  configurationErrorMessage(): string {
    return this.authMode === 'developer_api_key'
      ? 'Gemini runtime is not configured: GEMINI_API_KEY_FILE is required for developer_api_key mode'
      : 'Gemini runtime is not configured: GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION are required for vertex_adc mode';
  }

  clientOptions(): GeminiClientOptions {
    if (this.authMode === 'developer_api_key') {
      if (!this.apiKeyFile) {
        throw new Error('Gemini runtime credential file is not configured');
      }
      return { apiKeyFile: this.apiKeyFile };
    }
    if (!this.project || !this.location) {
      throw new Error('Gemini OAuth/ADC project and location are not configured');
    }
    return { vertexai: true, project: this.project, location: this.location };
  }
}
