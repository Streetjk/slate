import { describe, expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  qualifyGeminiDeploymentConfig,
  APPROVED_GEMINI_AUTH_MODE,
  APPROVED_GEMINI_LIVE_MODEL,
  APPROVED_GEMINI_LIVE_RUNTIME,
  APPROVED_GEMINI_API_KEY_FILE,
  APPROVED_GEMINI_NODE_EXECUTABLE,
  APPROVED_GEMINI_NODE_BRIDGE_SCRIPT,
  isProjectConventionTruthy,
} from './gemini-deployment-qualification';

describe('qualifyGeminiDeploymentConfig', () => {
  const SECRET_CONTENT = 'super-secret-api-key-value-12345';

  function createValidEnv(): Record<string, string> {
    return {
      GEMINI_AUTH_MODE: APPROVED_GEMINI_AUTH_MODE,
      GEMINI_DEVELOPER_API_KEY_ENABLED: 'true',
      GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED: 'true',
      GEMINI_LIVE_RUNTIME: APPROVED_GEMINI_LIVE_RUNTIME,
      GEMINI_LIVE_MODEL: APPROVED_GEMINI_LIVE_MODEL,
      GEMINI_API_KEY_FILE: APPROVED_GEMINI_API_KEY_FILE,
      GEMINI_NODE_EXECUTABLE: APPROVED_GEMINI_NODE_EXECUTABLE,
      GEMINI_NODE_BRIDGE_SCRIPT: APPROVED_GEMINI_NODE_BRIDGE_SCRIPT,
    };
  }

  it('passes qualification when all approved keys and a valid read-only secret file are present', () => {
    const dir = mkdtempSync(join(tmpdir(), 'slate-qualify-pass-'));
    const secretPath = join(dir, 'gemini_api_key');
    try {
      writeFileSync(secretPath, SECRET_CONTENT, { mode: 0o600 });
      const env = createValidEnv();

      const result = qualifyGeminiDeploymentConfig({ env, secretPath });
      expect(result.pass).toBe(true);
      expect(result.secretMountStatus).toBe('PRESENT_VALID');

      // Verify all approved keys are reported as PRESENT_VALID
      const expectedKeys = [
        'GEMINI_AUTH_MODE',
        'GEMINI_DEVELOPER_API_KEY_ENABLED',
        'GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED',
        'GEMINI_LIVE_RUNTIME',
        'GEMINI_LIVE_MODEL',
        'GEMINI_API_KEY_FILE',
        'GEMINI_NODE_EXECUTABLE',
        'GEMINI_NODE_BRIDGE_SCRIPT',
      ];
      for (const keyName of expectedKeys) {
        const found = result.keys.find((k) => k.name === keyName);
        expect(found).toBeDefined();
        expect(found!.status).toBe('PRESENT_VALID');
      }

      // Verify summary lines format
      expect(result.summaryLines).toContain('GEMINI_CONFIG_QUALIFICATION=PASS');
      expect(result.summaryLines).toContain('GEMINI_SECRET_MOUNT_READONLY=PRESENT_VALID');

      // Security check: ensure the secret content never appears in any output line
      for (const line of result.summaryLines) {
        expect(line).not.toContain(SECRET_CONTENT);
        // Ensure format is strictly KEY=STATUS
        expect(/^[A-Z0-9_]+=[A-Z0-9_]+$/.test(line)).toBe(true);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('fails closed when required keys are missing individually', () => {
    const dir = mkdtempSync(join(tmpdir(), 'slate-qualify-missing-'));
    const secretPath = join(dir, 'gemini_api_key');
    try {
      writeFileSync(secretPath, SECRET_CONTENT, { mode: 0o600 });

      const requiredKeys = [
        'GEMINI_AUTH_MODE',
        'GEMINI_DEVELOPER_API_KEY_ENABLED',
        'GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED',
        'GEMINI_LIVE_RUNTIME',
        'GEMINI_LIVE_MODEL',
        'GEMINI_API_KEY_FILE',
        'GEMINI_NODE_EXECUTABLE',
        'GEMINI_NODE_BRIDGE_SCRIPT',
      ];

      for (const missingKey of requiredKeys) {
        const env = createValidEnv();
        delete env[missingKey];

        const result = qualifyGeminiDeploymentConfig({ env, secretPath });
        expect(result.pass).toBe(false);
        const status = result.keys.find((k) => k.name === missingKey);
        expect(status).toBeDefined();
        expect(status!.status).toBe('MISSING');
        expect(result.summaryLines).toContain(`${missingKey}=MISSING`);
        expect(result.summaryLines).toContain('GEMINI_CONFIG_QUALIFICATION=FAIL');
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('fails closed when configuration keys have unapproved values (wrong path, executable, script, model, auth)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'slate-qualify-invalid-'));
    const secretPath = join(dir, 'gemini_api_key');
    try {
      writeFileSync(secretPath, SECRET_CONTENT, { mode: 0o600 });

      // Test unapproved model
      const badModelEnv = createValidEnv();
      badModelEnv.GEMINI_LIVE_MODEL = 'gemini-1.5-flash';
      expect(qualifyGeminiDeploymentConfig({ env: badModelEnv, secretPath }).pass).toBe(false);
      expect(
        qualifyGeminiDeploymentConfig({ env: badModelEnv, secretPath }).keys.find(
          (k) => k.name === 'GEMINI_LIVE_MODEL'
        )?.status
      ).toBe('INVALID');

      // Test unapproved auth mode
      const badAuthEnv = createValidEnv();
      badAuthEnv.GEMINI_AUTH_MODE = 'vertex_adc';
      expect(qualifyGeminiDeploymentConfig({ env: badAuthEnv, secretPath }).pass).toBe(false);
      expect(
        qualifyGeminiDeploymentConfig({ env: badAuthEnv, secretPath }).keys.find(
          (k) => k.name === 'GEMINI_AUTH_MODE'
        )?.status
      ).toBe('INVALID');

      // Test unapproved runtime
      const badRuntimeEnv = createValidEnv();
      badRuntimeEnv.GEMINI_LIVE_RUNTIME = 'bun_sdk';
      expect(qualifyGeminiDeploymentConfig({ env: badRuntimeEnv, secretPath }).pass).toBe(false);
      expect(
        qualifyGeminiDeploymentConfig({ env: badRuntimeEnv, secretPath }).keys.find(
          (k) => k.name === 'GEMINI_LIVE_RUNTIME'
        )?.status
      ).toBe('INVALID');

      // Test wrong API key file path
      const badPathEnv = createValidEnv();
      badPathEnv.GEMINI_API_KEY_FILE = '/etc/passwd';
      expect(qualifyGeminiDeploymentConfig({ env: badPathEnv, secretPath }).pass).toBe(false);
      expect(
        qualifyGeminiDeploymentConfig({ env: badPathEnv, secretPath }).keys.find(
          (k) => k.name === 'GEMINI_API_KEY_FILE'
        )?.status
      ).toBe('INVALID');

      // Test wrong node executable
      const badNodeEnv = createValidEnv();
      badNodeEnv.GEMINI_NODE_EXECUTABLE = 'python3';
      expect(qualifyGeminiDeploymentConfig({ env: badNodeEnv, secretPath }).pass).toBe(false);
      expect(
        qualifyGeminiDeploymentConfig({ env: badNodeEnv, secretPath }).keys.find(
          (k) => k.name === 'GEMINI_NODE_EXECUTABLE'
        )?.status
      ).toBe('INVALID');

      // Test wrong node bridge script
      const badScriptEnv = createValidEnv();
      badScriptEnv.GEMINI_NODE_BRIDGE_SCRIPT = './bad-script.mjs';
      expect(qualifyGeminiDeploymentConfig({ env: badScriptEnv, secretPath }).pass).toBe(false);
      expect(
        qualifyGeminiDeploymentConfig({ env: badScriptEnv, secretPath }).keys.find(
          (k) => k.name === 'GEMINI_NODE_BRIDGE_SCRIPT'
        )?.status
      ).toBe('INVALID');

      // Test disabled developer API keys
      const devDisabledEnv = createValidEnv();
      devDisabledEnv.GEMINI_DEVELOPER_API_KEY_ENABLED = 'false';
      expect(qualifyGeminiDeploymentConfig({ env: devDisabledEnv, secretPath }).pass).toBe(false);

      const prodDevDisabledEnv = createValidEnv();
      prodDevDisabledEnv.GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED = 'false';
      expect(qualifyGeminiDeploymentConfig({ env: prodDevDisabledEnv, secretPath }).pass).toBe(
        false
      );

      // Verify privacy: ensure no invalid paths or raw values leak into summaryLines
      const invalidResult = qualifyGeminiDeploymentConfig({ env: badPathEnv, secretPath });
      for (const line of invalidResult.summaryLines) {
        expect(line).not.toContain('/etc/passwd');
        expect(/^[A-Z0-9_]+=[A-Z0-9_]+$/.test(line)).toBe(true);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('normalizes booleans per project convention (accepts true, 1, yes, y, on)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'slate-qualify-bool-'));
    const secretPath = join(dir, 'gemini_api_key');
    try {
      writeFileSync(secretPath, SECRET_CONTENT, { mode: 0o600 });

      const truthyValues = ['true', '1', 'yes', 'y', 'on', 'TRUE', ' Yes '];
      for (const val of truthyValues) {
        expect(isProjectConventionTruthy(val)).toBe(true);
        const env = createValidEnv();
        env.GEMINI_DEVELOPER_API_KEY_ENABLED = val;
        env.GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED = val;
        const res = qualifyGeminiDeploymentConfig({ env, secretPath });
        expect(res.keys.find((k) => k.name === 'GEMINI_DEVELOPER_API_KEY_ENABLED')?.status).toBe(
          'PRESENT_VALID'
        );
        expect(
          res.keys.find((k) => k.name === 'GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED')?.status
        ).toBe('PRESENT_VALID');
      }

      const falsyValues = ['false', '0', 'no', 'n', 'off', 'arbitrary', ''];
      for (const val of falsyValues) {
        expect(isProjectConventionTruthy(val)).toBe(false);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('fails closed when the secret file is missing, symlinked, overly permissive, or empty', () => {
    const dir = mkdtempSync(join(tmpdir(), 'slate-qualify-secret-'));
    try {
      const env = createValidEnv();

      // 1. Missing secret file
      const missingPath = join(dir, 'nonexistent_key');
      const missingResult = qualifyGeminiDeploymentConfig({ env, secretPath: missingPath });
      expect(missingResult.pass).toBe(false);
      expect(missingResult.secretMountStatus).toBe('MISSING');
      expect(missingResult.summaryLines).toContain('GEMINI_SECRET_MOUNT_READONLY=MISSING');

      // 2. Symlinked secret file
      const realSecret = join(dir, 'real_secret');
      const symlinkPath = join(dir, 'symlink_secret');
      writeFileSync(realSecret, SECRET_CONTENT, { mode: 0o600 });
      symlinkSync(realSecret, symlinkPath);
      const symlinkResult = qualifyGeminiDeploymentConfig({ env, secretPath: symlinkPath });
      expect(symlinkResult.pass).toBe(false);
      expect(symlinkResult.secretMountStatus).toBe('INVALID_SYMLINK');

      // 3. Overly permissive file permissions (world/group accessible e.g. 0o644)
      const permissiveSecret = join(dir, 'permissive_secret');
      writeFileSync(permissiveSecret, SECRET_CONTENT, { mode: 0o644 });
      const permissiveResult = qualifyGeminiDeploymentConfig({ env, secretPath: permissiveSecret });
      expect(permissiveResult.pass).toBe(false);
      expect(permissiveResult.secretMountStatus).toBe('INVALID_PERMISSIONS');

      // 4. Empty secret file (0 bytes)
      const emptySecret = join(dir, 'empty_secret');
      writeFileSync(emptySecret, '', { mode: 0o600 });
      const emptyResult = qualifyGeminiDeploymentConfig({ env, secretPath: emptySecret });
      expect(emptyResult.pass).toBe(false);
      expect(emptyResult.secretMountStatus).toBe('INVALID_SIZE');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

const WRAPPER_SCRIPT_PATH = join(
  import.meta.dir,
  '../../../../scripts/qualify-gemini-deployment.sh'
);

describe('qualify-gemini-deployment.sh wrapper', () => {
  it('fails closed and exits nonzero when run with unconfigured environment (cannot false-PASS)', () => {
    const res = spawnSync('bash', [WRAPPER_SCRIPT_PATH], {
      env: { PATH: process.env.PATH },
    });
    expect(res.status).toBe(1);
    const stdout = res.stdout.toString();
    expect(stdout).toContain('GEMINI_CONFIG_QUALIFICATION=FAIL');
    expect(stdout).toContain('GEMINI_AUTH_MODE=MISSING');
    expect(stdout).toContain('GEMINI_LIVE_MODEL=MISSING');
    expect(stdout).toContain('GEMINI_SECRET_MOUNT_READONLY=MISSING');
    expect(stdout).not.toContain('GEMINI_CONFIG_QUALIFICATION=PASS');
  });

  it('fails closed and exits nonzero when configuration contains unapproved values (cannot false-PASS)', () => {
    const res = spawnSync('bash', [WRAPPER_SCRIPT_PATH], {
      env: {
        PATH: process.env.PATH,
        GEMINI_AUTH_MODE: 'vertex_adc',
        GEMINI_LIVE_MODEL: 'gemini-1.5-flash',
      },
    });
    expect(res.status).toBe(1);
    const stdout = res.stdout.toString();
    expect(stdout).toContain('GEMINI_CONFIG_QUALIFICATION=FAIL');
    expect(stdout).toContain('GEMINI_AUTH_MODE=INVALID');
    expect(stdout).toContain('GEMINI_LIVE_MODEL=INVALID');
    expect(stdout).not.toContain('GEMINI_CONFIG_QUALIFICATION=PASS');
  });

  it('fails closed and exits nonzero when secret file mount is missing despite valid approved keys', () => {
    const res = spawnSync('bash', [WRAPPER_SCRIPT_PATH], {
      env: {
        PATH: process.env.PATH,
        GEMINI_AUTH_MODE: APPROVED_GEMINI_AUTH_MODE,
        GEMINI_DEVELOPER_API_KEY_ENABLED: 'true',
        GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED: 'true',
        GEMINI_LIVE_RUNTIME: APPROVED_GEMINI_LIVE_RUNTIME,
        GEMINI_LIVE_MODEL: APPROVED_GEMINI_LIVE_MODEL,
        GEMINI_API_KEY_FILE: APPROVED_GEMINI_API_KEY_FILE,
        GEMINI_NODE_EXECUTABLE: APPROVED_GEMINI_NODE_EXECUTABLE,
        GEMINI_NODE_BRIDGE_SCRIPT: APPROVED_GEMINI_NODE_BRIDGE_SCRIPT,
      },
    });
    expect(res.status).toBe(1);
    const stdout = res.stdout.toString();
    expect(stdout).toContain('GEMINI_SECRET_MOUNT_READONLY=MISSING');
    expect(stdout).toContain('GEMINI_CONFIG_QUALIFICATION=FAIL');
    expect(stdout).not.toContain('GEMINI_CONFIG_QUALIFICATION=PASS');
  });

  it('fails closed and exits nonzero when Bun is not available in PATH (even if Node is available)', () => {
    const paths = (process.env.PATH || '').split(':');
    const nodeDir =
      paths.find((d) => existsSync(join(d, 'node')) && !existsSync(join(d, 'bun'))) || '';
    const res = spawnSync('bash', [WRAPPER_SCRIPT_PATH], {
      env: {
        PATH: nodeDir ? `${nodeDir}:/usr/bin:/bin` : '/usr/bin:/bin',
      },
    });
    expect(res.status).toBe(1);
    const stderr = res.stderr.toString();
    expect(stderr).toContain('GEMINI_CONFIG_QUALIFICATION=FAIL');
    expect(stderr).toContain('ERROR: bun not found for qualification runner');
    expect(res.stdout.toString()).not.toContain('GEMINI_CONFIG_QUALIFICATION=PASS');
  });

  it('never prints or leaks secret values or canary payloads in wrapper output', () => {
    const canary = 'test-secret-canary-payload-xyz987';
    const fakePath = '/tmp/fake-secret-key-file-canary';
    const res = spawnSync('bash', [WRAPPER_SCRIPT_PATH], {
      env: {
        PATH: process.env.PATH,
        GEMINI_DUMMY_SECRET_CANARY: canary,
        GEMINI_API_KEY_FILE: fakePath,
      },
    });
    expect(res.status).toBe(1);
    const combinedOutput = res.stdout.toString() + res.stderr.toString();
    expect(combinedOutput).not.toContain(canary);
    expect(combinedOutput).not.toContain(fakePath);

    // Verify stdout lines strictly follow KEY=STATUS pattern
    const lines = res.stdout.toString().trim().split('\n');
    for (const line of lines) {
      expect(/^[A-Z0-9_]+=[A-Z0-9_]+$/.test(line)).toBe(true);
    }
  });
});
