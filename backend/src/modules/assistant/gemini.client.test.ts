import { describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createGeminiClient,
  GeminiCredentialError,
  readGeminiApiKeyFile,
  safeGeminiErrorCategory,
} from './gemini.client';

function withTempDirectory(callback: (directory: string) => void): void {
  const directory = mkdtempSync(join(tmpdir(), 'slate-gemini-'));
  try {
    callback(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe('Gemini runtime credential loading', () => {
  it('loads a valid runtime credential without putting its value in client options', () => {
    withTempDirectory((directory) => {
      const path = join(directory, 'gemini-api-key');
      writeFileSync(path, 'synthetic-test-key\n', { mode: 0o600 });

      expect(() => readGeminiApiKeyFile(path)).not.toThrow();
      expect(() => createGeminiClient({ apiKeyFile: path })).not.toThrow();
    });
  });

  it.each([
    ['missing', 'missing-key'],
    ['empty', 'empty-key'],
    ['whitespace-only', 'whitespace-key'],
    ['directory', '.'],
  ])('fails closed for a %s credential source', (_label, relativePath) => {
    withTempDirectory((directory) => {
      const path = join(directory, relativePath);
      if (relativePath !== '.') writeFileSync(path, '   \n', { mode: 0o600 });

      expect(() => readGeminiApiKeyFile(path)).toThrow(GeminiCredentialError);
      expect(() => readGeminiApiKeyFile(path)).toThrow(
        'Gemini runtime credential could not be loaded'
      );
    });
  });

  it('does not include credential material or the file path in the load error', () => {
    withTempDirectory((directory) => {
      const path = join(directory, 'empty-key');
      const secret = 'synthetic-secret-value';
      writeFileSync(path, ` ${secret} `, { mode: 0o600 });
      writeFileSync(path, ' \n', { mode: 0o600 });

      let message = '';
      try {
        readGeminiApiKeyFile(path);
      } catch (error) {
        message = error instanceof Error ? error.message : String(error);
      }

      expect(message).not.toContain(secret);
      expect(message).not.toContain(path);
    });
  });

  it('maps runtime failures to an allowlisted non-secret category', () => {
    expect(safeGeminiErrorCategory(new GeminiCredentialError('synthetic secret'))).toBe(
      'credential'
    );
    expect(
      safeGeminiErrorCategory(Object.assign(new Error('synthetic timeout'), { name: 'AbortError' }))
    ).toBe('timeout');
    expect(safeGeminiErrorCategory(new Error('synthetic provider detail'))).toBe('unknown');
  });
});
