import { describe, expect, it } from 'bun:test';
import type { PrismaService } from '../../infra/prisma/prisma.service';
import type { TokenEncryptionService } from '../../infra/security/token-encryption.service';
import {
  GOOGLE_CALENDAR_SCOPES,
  GoogleCalendarOAuthService,
} from './google-calendar-oauth.service';

function setup(expiryAt = new Date(Date.now() + 60 * 60 * 1000)) {
  const values = new Map<string, string>();
  const prisma = {
    userIntegration: {
      findUnique: async () => ({
        encryptedAccessToken: 'encrypted-access',
        encryptedTokenCache: 'encrypted-cache',
        expiresAt: expiryAt,
      }),
      upsert: async () => undefined,
      deleteMany: async () => undefined,
    },
  } as unknown as PrismaService;
  const encryption = {
    encrypt: (value: string, associatedData: string) => {
      values.set(`${associatedData}:${value}`, value);
      return `encrypted:${value}`;
    },
    decrypt: (value: string) => {
      if (value === 'encrypted-access') return 'access-token';
      if (value === 'encrypted-cache') return JSON.stringify({ refresh_token: 'refresh-token' });
      throw new Error('unexpected encrypted value');
    },
  } as unknown as TokenEncryptionService;
  const config = {
    googleCalendarClientId: 'client-id',
    googleCalendarClientSecret: 'client-secret',
    googleCalendarRedirectUri: 'https://example.test/google/callback',
  } as never;
  return { service: new GoogleCalendarOAuthService(config, prisma, encryption), values };
}

describe('GoogleCalendarOAuthService', () => {
  it('creates an offline PKCE authorization URL with the minimal event scope', () => {
    const { service } = setup();
    const url = new URL(service.createAuthorizationUrl('user-a'));
    expect(url.hostname).toBe('accounts.google.com');
    expect(url.searchParams.get('access_type')).toBe('offline');
    expect(url.searchParams.get('prompt')).toBe('consent');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('scope')).toBe(GOOGLE_CALENDAR_SCOPES[0]);
    expect(url.searchParams.has('client_secret')).toBe(false);
  });

  it('restores an encrypted user credential without exposing tokens in the API', async () => {
    const { service } = setup();
    const client = await service.getAuthenticatedClient('user-a');
    expect(client.credentials).toMatchObject({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
  });

  it('fails closed when OAuth configuration is absent', () => {
    const unconfigured = new GoogleCalendarOAuthService(
      {
        googleCalendarClientId: undefined,
        googleCalendarClientSecret: undefined,
        googleCalendarRedirectUri: undefined,
      },
      {} as PrismaService,
      {} as TokenEncryptionService
    ) as GoogleCalendarOAuthService;
    expect(() => unconfigured.createAuthorizationUrl('user-a')).toThrow('not configured');
  });
});
