import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEVELOPER_API_LIVE_MODEL, GeminiConfig } from './gemini.config';

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
        GEMINI_LIVE_MODEL: DEVELOPER_API_LIVE_MODEL,
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

  it('rejects Developer API evaluation when the approved Live model is not selected', () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-model-'));
    const file = join(directory, 'gemini-api-key');
    try {
      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      const value = config({
        NODE_ENV: 'test',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: file,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
      });

      expect(value.isConfigured()).toBe(false);
      expect(() => value.clientOptions()).toThrow();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('accepts Developer API evaluation only for the approved Live model', () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-model-'));
    const file = join(directory, 'gemini-api-key');
    try {
      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      const value = config({
        NODE_ENV: 'test',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: file,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_LIVE_MODEL: DEVELOPER_API_LIVE_MODEL,
      });

      expect(value.isConfigured()).toBe(true);
      expect(value.clientOptions()).toEqual({ apiKeyFile: file });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('fails closed for whitespace-only and symlinked credential sources', () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-file-'));
    const file = join(directory, 'gemini-api-key');
    const link = join(directory, 'gemini-api-key-link');
    try {
      writeFileSync(file, ' \n', { mode: 0o600 });
      const whitespace = config({
        NODE_ENV: 'test',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: file,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_LIVE_MODEL: DEVELOPER_API_LIVE_MODEL,
      });
      expect(whitespace.isConfigured()).toBe(false);

      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      // Replace the disposable file with a symlink using the test runtime API.
      symlinkSync(file, link);
      const symlinked = config({
        NODE_ENV: 'test',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: link,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_LIVE_MODEL: DEVELOPER_API_LIVE_MODEL,
      });
      expect(symlinked.isConfigured()).toBe(false);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
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
