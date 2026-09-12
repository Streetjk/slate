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

  it('defers content validation to the runtime and rejects symlinked sources', () => {
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
      expect(whitespace.isConfigured()).toBe(true);

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

  it('fails closed for the production Node bridge without its dedicated opt-in', () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-production-node-'));
    const file = join(directory, 'gemini-api-key');
    try {
      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      const value = config({
        NODE_ENV: 'production',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: file,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_LIVE_RUNTIME: 'node_bridge',
        GEMINI_LIVE_MODEL: DEVELOPER_API_LIVE_MODEL,
      });

      expect(value.isConfigured()).toBe(false);
      expect(value.configurationErrorMessage()).toContain(
        'GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED=true'
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('requires the existing Developer API opt-in in production', () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-production-node-'));
    const file = join(directory, 'gemini-api-key');
    try {
      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      const value = config({
        NODE_ENV: 'production',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: file,
        GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_LIVE_RUNTIME: 'node_bridge',
        GEMINI_LIVE_MODEL: DEVELOPER_API_LIVE_MODEL,
      });

      expect(value.isConfigured()).toBe(false);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('accepts the exact production Node bridge only with both opt-ins', () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-production-node-'));
    const file = join(directory, 'gemini-api-key');
    try {
      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      const value = config({
        NODE_ENV: 'production',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: file,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_LIVE_RUNTIME: 'node_bridge',
        GEMINI_LIVE_MODEL: DEVELOPER_API_LIVE_MODEL,
        GEMINI_NODE_EXECUTABLE: 'node',
        GEMINI_NODE_BRIDGE_SCRIPT: './src/modules/assistant/gemini-live-node-bridge-runtime.mjs',
      });

      expect(value.isConfigured()).toBe(true);
      expect(value.nodeBridgeOptions()).toEqual({
        executable: 'node',
        script: './src/modules/assistant/gemini-live-node-bridge-runtime.mjs',
        authMode: 'developer_api_key',
        apiKeyFile: file,
      });
      expect(JSON.stringify(value.nodeBridgeOptions())).not.toContain('synthetic-key');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('keeps production Bun SDK plus Developer API blocked despite the production opt-in', () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-production-bun-'));
    const file = join(directory, 'gemini-api-key');
    try {
      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      const value = config({
        NODE_ENV: 'production',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: file,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_LIVE_RUNTIME: 'bun_sdk',
        GEMINI_LIVE_MODEL: DEVELOPER_API_LIVE_MODEL,
      });

      expect(value.isConfigured()).toBe(false);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('keeps production Node bridge closed for wrong auth, model, and credential', () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-production-matrix-'));
    const file = join(directory, 'gemini-api-key');
    const link = join(directory, 'gemini-api-key-link');
    try {
      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      const base = {
        NODE_ENV: 'production',
        GEMINI_API_KEY_FILE: file,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_LIVE_RUNTIME: 'node_bridge',
        GEMINI_LIVE_MODEL: DEVELOPER_API_LIVE_MODEL,
      };

      expect(config({ ...base, GEMINI_AUTH_MODE: 'vertex_adc' }).isConfigured()).toBe(false);
      expect(
        config({
          ...base,
          GEMINI_AUTH_MODE: 'developer_api_key',
          GEMINI_LIVE_MODEL: 'wrong-model',
        }).isConfigured()
      ).toBe(false);
      expect(
        config({
          ...base,
          GEMINI_AUTH_MODE: 'developer_api_key',
          GEMINI_API_KEY_FILE: '/run/secrets/missing-gemini-api-key',
        }).isConfigured()
      ).toBe(false);

      symlinkSync(file, link);
      expect(
        config({
          ...base,
          GEMINI_AUTH_MODE: 'developer_api_key',
          GEMINI_API_KEY_FILE: link,
        }).isConfigured()
      ).toBe(false);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('fails closed when production selects the Node Live bridge', () => {
    const value = config({
      NODE_ENV: 'production',
      GEMINI_AUTH_MODE: 'vertex_adc',
      GOOGLE_CLOUD_PROJECT: 'test-project',
      GOOGLE_CLOUD_LOCATION: 'australia-southeast1',
      GEMINI_LIVE_RUNTIME: 'node_bridge',
    });

    expect(value.isConfigured()).toBe(false);
    expect(value.configurationErrorMessage()).toContain(
      'GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED=true'
    );
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

  it('exposes only non-secret Node bridge options', () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-node-bridge-'));
    const file = join(directory, 'gemini-api-key');
    try {
      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      const value = config({
        NODE_ENV: 'test',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: file,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_LIVE_MODEL: DEVELOPER_API_LIVE_MODEL,
        GEMINI_LIVE_RUNTIME: 'node_bridge',
        GEMINI_NODE_EXECUTABLE: '/usr/local/bin/node',
        GEMINI_NODE_BRIDGE_SCRIPT: './bridge.mjs',
      });

      expect(value.liveRuntime).toBe('node_bridge');
      expect(value.nodeBridgeOptions()).toEqual({
        executable: '/usr/local/bin/node',
        script: './bridge.mjs',
        authMode: 'developer_api_key',
        apiKeyFile: file,
      });
      expect(JSON.stringify(value.nodeBridgeOptions())).not.toContain('synthetic-key');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('requires the exact approved model and Developer API mode for the Node bridge', () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-node-policy-'));
    const file = join(directory, 'gemini-api-key');
    try {
      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      const wrongModel = config({
        NODE_ENV: 'test',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: file,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_LIVE_RUNTIME: 'node_bridge',
        GEMINI_LIVE_MODEL: 'gemini-live-2.5-flash-native-audio',
      });
      expect(wrongModel.isConfigured()).toBe(false);
      expect(wrongModel.configurationErrorMessage()).toContain(DEVELOPER_API_LIVE_MODEL);

      const wrongAuth = config({
        NODE_ENV: 'test',
        GEMINI_AUTH_MODE: 'vertex_adc',
        GOOGLE_CLOUD_PROJECT: 'synthetic-project',
        GOOGLE_CLOUD_LOCATION: 'synthetic-location',
        GEMINI_LIVE_RUNTIME: 'node_bridge',
        GEMINI_LIVE_MODEL: DEVELOPER_API_LIVE_MODEL,
      });
      expect(wrongAuth.isConfigured()).toBe(false);

      const approved = config({
        NODE_ENV: 'test',
        GEMINI_AUTH_MODE: 'developer_api_key',
        GEMINI_API_KEY_FILE: file,
        GEMINI_DEVELOPER_API_KEY_ENABLED: true,
        GEMINI_LIVE_RUNTIME: 'node_bridge',
        GEMINI_LIVE_MODEL: DEVELOPER_API_LIVE_MODEL,
      });
      expect(approved.isConfigured()).toBe(true);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
