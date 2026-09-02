import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
    const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-config-'));
    const file = join(directory, 'gemini-api-key');
    try {
      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      const value = config({
        NODE_ENV: 'test',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: file,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
      });

      expect(value.isConfigured()).toBe(true);
      expect(value.clientOptions()).toEqual({ apiKeyFile: file });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('fails closed when Developer API mode has no runtime credential file', () => {
    const value = config({
      NODE_ENV: 'test',
      GEMINI_AUTH_MODE: 'developer_api_key',
      GEMINI_DEVELOPER_API_KEY_ENABLED: true,
      GEMINI_API_KEY_FILE: '/run/secrets/missing-gemini-api-key',
    });

    expect(value.isConfigured()).toBe(false);
    expect(value.configurationErrorMessage()).toContain('readable');
  });

  it('fails closed for Developer API mode in production even with a readable file', () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-production-'));
    const file = join(directory, 'gemini-api-key');
    try {
      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      const value = config({
        NODE_ENV: 'production',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: file,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
      });

      expect(value.isConfigured()).toBe(false);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('fails closed when Developer API evaluation mode is not explicitly enabled', () => {
    const value = config({
      NODE_ENV: 'test',
      GEMINI_AUTH_MODE: 'developer_api_key',
      GEMINI_API_KEY_FILE: '/run/secrets/gemini-api-key',
    });

    expect(value.isConfigured()).toBe(false);
    expect(value.configurationErrorMessage()).toContain('evaluation-only');
  });
});
