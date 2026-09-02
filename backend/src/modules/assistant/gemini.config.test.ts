import { describe, expect, it } from 'bun:test';
import { GeminiConfig } from './gemini.config';

function config(values: Record<string, unknown>): GeminiConfig {
  return new GeminiConfig({
    get: (key: string) => values[key],
  } as never);
}

describe('GeminiConfig', () => {
  it('keeps Vertex ADC as the default-compatible client mode', () => {
    const value = config({
      GEMINI_AUTH_MODE: 'vertex_adc',
      GOOGLE_CLOUD_PROJECT: 'test-project',
      GOOGLE_CLOUD_LOCATION: 'australia-southeast1',
    });

    expect(value.isConfigured()).toBe(true);
    expect(value.clientOptions()).toEqual({
      vertexai: true,
      project: 'test-project',
      location: 'australia-southeast1',
    });
  });

  it('selects Developer API mode only when explicitly configured with a file reference', () => {
    const value = config({
      GEMINI_AUTH_MODE: 'developer_api_key',
      GEMINI_API_KEY_FILE: '/run/secrets/gemini_api_key',
    });

    expect(value.isConfigured()).toBe(true);
    expect(value.clientOptions()).toEqual({ apiKeyFile: '/run/secrets/gemini_api_key' });
  });

  it('fails closed when Developer API mode has no runtime credential file', () => {
    const value = config({ GEMINI_AUTH_MODE: 'developer_api_key' });

    expect(value.isConfigured()).toBe(false);
    expect(() => value.clientOptions()).toThrow('runtime credential file is not configured');
    expect(value.configurationErrorMessage()).toContain('developer_api_key');
  });
});
