import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { accessSync, constants, statSync } from 'node:fs';
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

  get developerApiKeyEnabled(): boolean {
    return this.cs.get('GEMINI_DEVELOPER_API_KEY_ENABLED', { infer: true }) ?? false;
  }

  get nodeEnv(): string {
    return this.cs.get('NODE_ENV', { infer: true }) ?? 'development';
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
      ? this.developerApiKeyEnabled &&
          this.nodeEnv !== 'production' &&
          this.hasUsableCredentialFile()
      : Boolean(this.project && this.location);
  }

  configurationErrorMessage(): string {
    return this.authMode === 'developer_api_key'
      ? 'Gemini runtime is not configured: evaluation-only Developer API mode requires a readable GEMINI_API_KEY_FILE and GEMINI_DEVELOPER_API_KEY_ENABLED=true outside production'
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

  private hasUsableCredentialFile(): boolean {
    if (!this.apiKeyFile) return false;
    try {
      const stats = statSync(this.apiKeyFile);
      if (!stats.isFile() || stats.size === 0) return false;
      accessSync(this.apiKeyFile, constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }
}
