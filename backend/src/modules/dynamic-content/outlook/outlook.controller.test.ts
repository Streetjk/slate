import 'reflect-metadata';
import { describe, expect, it } from 'bun:test';
import type { WebUserContext } from '../../../common/nest/auth-context';
import { OutlookController } from './outlook.controller';
import { OUTLOOK_SCOPES } from './microsoft-oauth.service';

describe('OutlookController', () => {
  const testUser: WebUserContext = {
    userId: 'user-c7-test',
    email: 'user@example.com',
  } as WebUserContext;

  it('generates an authorization URL preserving the auth route and user context', async () => {
    let capturedUserId = '';
    const mockAuthUrl =
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=cid&scope=Calendars.Read';

    const mockOAuthService = {
      createAuthorizationUrl: async (userId: string) => {
        capturedUserId = userId;
        return mockAuthUrl;
      },
    };

    const controller = new OutlookController(mockOAuthService as never);
    const result = await controller.authorizationUrl(testUser);

    expect(capturedUserId).toBe('user-c7-test');
    expect(result).toEqual({ url: mockAuthUrl });
  });

  it('preserves read-only Calendars.Read scope without write or mailbox permissions', () => {
    expect(OUTLOOK_SCOPES).toEqual(['openid', 'profile', 'offline_access', 'Calendars.Read']);
    expect(OUTLOOK_SCOPES.includes('Calendars.Read')).toBe(true);
    expect(OUTLOOK_SCOPES.some((scope) => /write|mail|files|notes|contacts/i.test(scope))).toBe(
      false
    );
  });

  it('fails safely when OAuth is unconfigured without exposing secrets or tokens', async () => {
    const mockOAuthService = {
      createAuthorizationUrl: async () => {
        throw new Error('Microsoft OAuth is not configured');
      },
    };

    const controller = new OutlookController(mockOAuthService as never);
    await expect(controller.authorizationUrl(testUser)).rejects.toThrow(
      'Microsoft OAuth is not configured'
    );
  });

  it('handles callback failure without leaking private Outlook credentials', async () => {
    const mockOAuthService = {
      completeAuthorization: async () => {
        throw new Error('Microsoft OAuth state is invalid or expired');
      },
    };

    const controller = new OutlookController(mockOAuthService as never);
    await expect(controller.callback('state123', 'code123', 'access_denied')).rejects.toThrow(
      'Microsoft OAuth authorization failed: access_denied'
    );

    await expect(controller.callback(undefined, undefined, undefined)).rejects.toThrow(
      'Microsoft OAuth callback is missing state or code'
    );
  });
});
