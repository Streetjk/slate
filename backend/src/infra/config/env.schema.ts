import { z } from 'zod';
import { DEFAULT_TTS_VOICE, TtsVoice } from 'shared';

const emptyStringToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const OptionalEnv = (schema: z.ZodString) =>
  z.preprocess(emptyStringToUndefined, schema.optional());

const DatabaseUrl = z.string().refine(
  (value) => {
    try {
      return new URL(value).protocol === 'mysql:';
    } catch {
      return false;
    }
  },
  { message: 'DATABASE_URL must be a mysql:// connection string' }
);

const JwtSecret = z.string().min(32).refine(hasReasonableSecretEntropy, {
  message: 'JWT_SECRET must contain at least 16 distinct bytes and 128 bits of estimated entropy',
});

const JwtExpiration = z.string().refine(
  (value) => {
    const text = value.trim();
    if (/^\d+$/.test(text)) return true;
    return /^\d+(?:\.\d+)?\s*(?:ms|s|m|h|d|w|y)$/i.test(text);
  },
  { message: 'JWT_EXPIRATION must be a number of seconds or a duration like 15m, 7d, or 1h' }
);

const BooleanEnv = z.union([z.boolean(), z.string()]).transform((value, ctx) => {
  if (typeof value === 'boolean') return value;
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
  ctx.addIssue({ code: 'custom', message: 'invalid boolean value' });
  return z.NEVER;
});

const TokenEncryptionKey = OptionalEnv(
  z.string().refine(isTokenEncryptionKey, {
    message: 'TOKEN_ENCRYPTION_KEY must be a 32-byte base64 or 64-character hex key',
  })
);

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: DatabaseUrl,
  JWT_SECRET: JwtSecret,
  JWT_EXPIRATION: JwtExpiration.default('7d'),
  BLOB_DIR: z.string().default('./blobs'),
  DB_ALLOW_PUBLIC_KEY_RETRIEVAL: BooleanEnv.default(false),
  QWEATHER_API_KEY: OptionalEnv(z.string().min(1)),
  QWEATHER_API_HOST: OptionalEnv(z.string().url()),
  AI_API_KEY: OptionalEnv(z.string().min(1)),
  AI_BASE_URL: OptionalEnv(z.string().url()),
  AI_MODEL: z.string().min(1).default('gpt-4o-mini'),
  TTS_API_KEY: OptionalEnv(z.string().min(1)),
  TTS_BASE_URL: OptionalEnv(z.string().url()),
  TTS_MODEL: z.string().min(1).default('mimo-v2.5-tts'),
  TTS_DEFAULT_VOICE: TtsVoice.default(DEFAULT_TTS_VOICE),
  GOOGLE_CLOUD_PROJECT: OptionalEnv(z.string().min(1)),
  GOOGLE_CLOUD_LOCATION: OptionalEnv(z.string().min(1)),
  GEMINI_AUTH_MODE: z.enum(['vertex_adc', 'developer_api_key']).default('vertex_adc'),
  GEMINI_API_KEY_FILE: OptionalEnv(z.string().min(1)),
  GEMINI_TEXT_MODEL: z.string().min(1).default('gemini-3.7-flash'),
  GEMINI_LIVE_MODEL: z.string().min(1).default('gemini-live-2.5-flash-native-audio'),
  GEMINI_LIVE_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().max(120_000).default(15_000),
  GOOGLE_CALENDAR_CLIENT_ID: OptionalEnv(z.string().min(1)),
  GOOGLE_CALENDAR_CLIENT_SECRET: OptionalEnv(z.string().min(1)),
  GOOGLE_CALENDAR_REDIRECT_URI: OptionalEnv(z.string().url()),
  GOOGLE_CALENDAR_ID: z.string().trim().min(1).default('primary'),
  MICROSOFT_CLIENT_ID: OptionalEnv(z.string().min(1)),
  MICROSOFT_CLIENT_SECRET: OptionalEnv(z.string().min(1)),
  MICROSOFT_REDIRECT_URI: OptionalEnv(z.string().url()),
  MICROSOFT_AUTHORITY: z.string().url().default('https://login.microsoftonline.com/common'),
  TOKEN_ENCRYPTION_KEY: TokenEncryptionKey,
  BACKGROUND_WORKERS: BooleanEnv.default(true),
});

export type EnvT = z.infer<typeof EnvSchema>;

function hasReasonableSecretEntropy(value: string): boolean {
  const bytes = new TextEncoder().encode(value);
  if (new Set(bytes).size < 16) return false;
  return estimatedShannonBits(bytes) >= 128;
}

function isTokenEncryptionKey(value: string): boolean {
  if (/^[0-9a-f]{64}$/i.test(value)) return true;
  try {
    return Buffer.from(value, 'base64').byteLength === 32;
  } catch {
    return false;
  }
}

function estimatedShannonBits(bytes: Uint8Array): number {
  const counts = new Map<number, number>();
  for (const byte of bytes) counts.set(byte, (counts.get(byte) ?? 0) + 1);
  let entropyPerByte = 0;
  for (const count of counts.values()) {
    const p = count / bytes.length;
    entropyPerByte -= p * Math.log2(p);
  }
  return entropyPerByte * bytes.length;
}
