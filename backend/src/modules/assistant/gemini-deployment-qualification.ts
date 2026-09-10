import { accessSync, closeSync, constants, lstatSync, openSync, statSync } from 'node:fs';
import { DEVELOPER_API_LIVE_MODEL } from './gemini.config';

export const APPROVED_GEMINI_LIVE_MODEL = DEVELOPER_API_LIVE_MODEL;
export const APPROVED_GEMINI_AUTH_MODE = 'developer_api_key';
export const APPROVED_GEMINI_LIVE_RUNTIME = 'node_bridge';
export const APPROVED_GEMINI_API_KEY_FILE = '/run/secrets/gemini_api_key';
export const APPROVED_GEMINI_NODE_EXECUTABLE = 'node';
export const APPROVED_GEMINI_NODE_BRIDGE_SCRIPT =
  './src/modules/assistant/gemini-live-node-bridge-runtime.mjs';

/**
 * Validates boolean environment variables against the project convention.
 * Matches BooleanEnv in backend/src/infra/config/env.schema.ts:
 * truthy values are 'true', '1', 'yes', 'y', 'on' (case-insensitive, trimmed).
 */
export function isProjectConventionTruthy(value: string): boolean {
  return ['true', '1', 'yes', 'y', 'on'].includes(value.trim().toLowerCase());
}

export interface QualificationKeyStatus {
  name: string;
  status: 'PRESENT_VALID' | 'MISSING' | 'INVALID';
}

export interface QualificationResult {
  pass: boolean;
  keys: QualificationKeyStatus[];
  secretMountStatus:
    | 'PRESENT_VALID'
    | 'MISSING'
    | 'INVALID_PERMISSIONS'
    | 'INVALID_SYMLINK'
    | 'INVALID_SIZE';
  summaryLines: string[];
}

export interface QualificationOptions {
  env?: Record<string, string | undefined>;
  secretPath?: string;
  expectedApiKeyFile?: string;
  expectedNodeExecutable?: string;
  expectedNodeBridgeScript?: string;
  checkWritable?: boolean;
}

export function qualifyGeminiDeploymentConfig(
  options: QualificationOptions = {}
): QualificationResult {
  const env = options.env ?? process.env;
  const keys: QualificationKeyStatus[] = [];

  // 1. GEMINI_AUTH_MODE
  const authMode = env.GEMINI_AUTH_MODE;
  if (!authMode) {
    keys.push({ name: 'GEMINI_AUTH_MODE', status: 'MISSING' });
  } else if (authMode === APPROVED_GEMINI_AUTH_MODE) {
    keys.push({ name: 'GEMINI_AUTH_MODE', status: 'PRESENT_VALID' });
  } else {
    keys.push({ name: 'GEMINI_AUTH_MODE', status: 'INVALID' });
  }

  // 2. GEMINI_DEVELOPER_API_KEY_ENABLED
  const devKeyEnabled = env.GEMINI_DEVELOPER_API_KEY_ENABLED;
  if (!devKeyEnabled) {
    keys.push({ name: 'GEMINI_DEVELOPER_API_KEY_ENABLED', status: 'MISSING' });
  } else if (isProjectConventionTruthy(devKeyEnabled)) {
    keys.push({ name: 'GEMINI_DEVELOPER_API_KEY_ENABLED', status: 'PRESENT_VALID' });
  } else {
    keys.push({ name: 'GEMINI_DEVELOPER_API_KEY_ENABLED', status: 'INVALID' });
  }

  // 3. GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED
  const prodDevKeyEnabled = env.GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED;
  if (!prodDevKeyEnabled) {
    keys.push({ name: 'GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED', status: 'MISSING' });
  } else if (isProjectConventionTruthy(prodDevKeyEnabled)) {
    keys.push({ name: 'GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED', status: 'PRESENT_VALID' });
  } else {
    keys.push({ name: 'GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED', status: 'INVALID' });
  }

  // 4. GEMINI_LIVE_RUNTIME
  const liveRuntime = env.GEMINI_LIVE_RUNTIME;
  if (!liveRuntime) {
    keys.push({ name: 'GEMINI_LIVE_RUNTIME', status: 'MISSING' });
  } else if (liveRuntime === APPROVED_GEMINI_LIVE_RUNTIME) {
    keys.push({ name: 'GEMINI_LIVE_RUNTIME', status: 'PRESENT_VALID' });
  } else {
    keys.push({ name: 'GEMINI_LIVE_RUNTIME', status: 'INVALID' });
  }

  // 5. GEMINI_LIVE_MODEL
  const liveModel = env.GEMINI_LIVE_MODEL;
  if (!liveModel) {
    keys.push({ name: 'GEMINI_LIVE_MODEL', status: 'MISSING' });
  } else if (liveModel === APPROVED_GEMINI_LIVE_MODEL) {
    keys.push({ name: 'GEMINI_LIVE_MODEL', status: 'PRESENT_VALID' });
  } else {
    keys.push({ name: 'GEMINI_LIVE_MODEL', status: 'INVALID' });
  }

  // 6. GEMINI_API_KEY_FILE
  const expectedApiKeyFile = options.expectedApiKeyFile ?? APPROVED_GEMINI_API_KEY_FILE;
  const apiKeyFile = env.GEMINI_API_KEY_FILE;
  if (!apiKeyFile || apiKeyFile.trim() === '') {
    keys.push({ name: 'GEMINI_API_KEY_FILE', status: 'MISSING' });
  } else if (apiKeyFile === expectedApiKeyFile) {
    keys.push({ name: 'GEMINI_API_KEY_FILE', status: 'PRESENT_VALID' });
  } else {
    keys.push({ name: 'GEMINI_API_KEY_FILE', status: 'INVALID' });
  }

  // 7. GEMINI_NODE_EXECUTABLE
  const expectedNodeExecutable = options.expectedNodeExecutable ?? APPROVED_GEMINI_NODE_EXECUTABLE;
  const nodeExec = env.GEMINI_NODE_EXECUTABLE;
  if (!nodeExec || nodeExec.trim() === '') {
    keys.push({ name: 'GEMINI_NODE_EXECUTABLE', status: 'MISSING' });
  } else if (nodeExec === expectedNodeExecutable) {
    keys.push({ name: 'GEMINI_NODE_EXECUTABLE', status: 'PRESENT_VALID' });
  } else {
    keys.push({ name: 'GEMINI_NODE_EXECUTABLE', status: 'INVALID' });
  }

  // 8. GEMINI_NODE_BRIDGE_SCRIPT
  const expectedNodeBridgeScript =
    options.expectedNodeBridgeScript ?? APPROVED_GEMINI_NODE_BRIDGE_SCRIPT;
  const bridgeScript = env.GEMINI_NODE_BRIDGE_SCRIPT;
  if (!bridgeScript || bridgeScript.trim() === '') {
    keys.push({ name: 'GEMINI_NODE_BRIDGE_SCRIPT', status: 'MISSING' });
  } else if (bridgeScript === expectedNodeBridgeScript) {
    keys.push({ name: 'GEMINI_NODE_BRIDGE_SCRIPT', status: 'PRESENT_VALID' });
  } else {
    keys.push({ name: 'GEMINI_NODE_BRIDGE_SCRIPT', status: 'INVALID' });
  }

  // Secret mount validation
  let secretMountStatus: QualificationResult['secretMountStatus'];
  const targetSecretPath = options.secretPath ?? apiKeyFile ?? APPROVED_GEMINI_API_KEY_FILE;

  try {
    const isSymlink = lstatSync(targetSecretPath).isSymbolicLink();
    if (isSymlink) {
      secretMountStatus = 'INVALID_SYMLINK';
    } else {
      const stats = statSync(targetSecretPath);
      if (!stats.isFile() || stats.size === 0 || stats.size > 4096) {
        secretMountStatus = 'INVALID_SIZE';
      } else if ((stats.mode & 0o077) !== 0) {
        secretMountStatus = 'INVALID_PERMISSIONS';
      } else {
        accessSync(targetSecretPath, constants.R_OK);

        // Read-only check: verify file can be opened read-only
        let descriptor: number | undefined;
        try {
          if (typeof constants.O_NOFOLLOW === 'number') {
            descriptor = openSync(targetSecretPath, constants.O_RDONLY | constants.O_NOFOLLOW);
          } else {
            descriptor = openSync(targetSecretPath, constants.O_RDONLY);
          }
          secretMountStatus = 'PRESENT_VALID';
        } finally {
          if (descriptor !== undefined) {
            closeSync(descriptor);
          }
        }
      }
    }
  } catch {
    secretMountStatus = 'MISSING';
  }

  const allKeysValid = keys.every((k) => k.status === 'PRESENT_VALID');
  const secretValid = secretMountStatus === 'PRESENT_VALID';
  const pass = allKeysValid && secretValid;

  const summaryLines: string[] = [
    ...keys.map((k) => `${k.name}=${k.status}`),
    `GEMINI_SECRET_MOUNT_READONLY=${secretMountStatus}`,
    `GEMINI_CONFIG_QUALIFICATION=${pass ? 'PASS' : 'FAIL'}`,
  ];

  return {
    pass,
    keys,
    secretMountStatus,
    summaryLines,
  };
}

if (import.meta.main) {
  const result = qualifyGeminiDeploymentConfig();
  for (const line of result.summaryLines) {
    console.log(line);
  }
  if (!result.pass) {
    process.exit(1);
  }
}
