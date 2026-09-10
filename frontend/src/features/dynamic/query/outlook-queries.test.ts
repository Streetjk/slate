import { afterEach, describe, expect, it } from 'bun:test';
import { api } from '@/lib/http';
import { beginOutlookConnection, getSafeOutlookAuthErrorMessage } from './outlook-queries';

const originalGet = api.get;

afterEach(() => {
  api.get = originalGet;
});

describe('outlook-queries', () => {
  describe('getSafeOutlookAuthErrorMessage', () => {
    it('returns a clean error message for standard failure responses', () => {
      expect(
        getSafeOutlookAuthErrorMessage({
          response: { data: { message: 'Microsoft OAuth is not configured' } },
        })
      ).toBe('Microsoft OAuth is not configured');

      expect(
        getSafeOutlookAuthErrorMessage({
          response: { data: { error: '服务器内部错误' } },
        })
      ).toBe('服务器内部错误');

      expect(getSafeOutlookAuthErrorMessage(new Error('Network Error'))).toBe('Network Error');
    });

    it('sanitizes and redacts errors containing bearer tokens or secrets', () => {
      const tokenError = new Error('Invalid authorization Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6');
      expect(getSafeOutlookAuthErrorMessage(tokenError)).toBe('Failed to connect Outlook');

      const secretError = {
        response: { data: { message: 'Failed with secret=supersecretvalue' } },
      };
      expect(getSafeOutlookAuthErrorMessage(secretError)).toBe('Failed to connect Outlook');

      const tokenParamError = new Error('access_token expired');
      expect(getSafeOutlookAuthErrorMessage(tokenParamError)).toBe('Failed to connect Outlook');
    });

    it('sanitizes and redacts errors containing account emails or private Outlook URLs', () => {
      const emailError = new Error('Account user@example.com cannot access mailbox');
      expect(getSafeOutlookAuthErrorMessage(emailError)).toBe('Failed to connect Outlook');

      const graphError = new Error('Graph error at https://graph.microsoft.com/v1.0/me/calendars');
      expect(getSafeOutlookAuthErrorMessage(graphError)).toBe('Failed to connect Outlook');
    });

    it('returns fallback for empty or unknown error structures', () => {
      expect(getSafeOutlookAuthErrorMessage(null)).toBe('Failed to connect Outlook');
      expect(getSafeOutlookAuthErrorMessage(undefined)).toBe('Failed to connect Outlook');
      expect(getSafeOutlookAuthErrorMessage({})).toBe('Failed to connect Outlook');
    });
  });

  describe('beginOutlookConnection', () => {
    it('initiates navigation with valid authorization URL from backend', async () => {
      const mockAuthUrl =
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=cid&response_type=code&scope=Calendars.Read';
      api.get = (async () => ({ data: { url: mockAuthUrl } })) as unknown as typeof api.get;

      const navigatedUrls: string[] = [];
      const result = await beginOutlookConnection((url) => navigatedUrls.push(url));

      expect(result).toBe(mockAuthUrl);
      expect(navigatedUrls).toEqual([mockAuthUrl]);
    });

    it('rejects and does not navigate when auth-url response is missing', async () => {
      api.get = (async () => ({ data: {} })) as unknown as typeof api.get;

      const navigatedUrls: string[] = [];
      await expect(beginOutlookConnection((url) => navigatedUrls.push(url))).rejects.toThrow(
        'No authorization URL returned'
      );

      expect(navigatedUrls).toEqual([]);
    });

    it('propagates api errors and aborts navigation initiation', async () => {
      api.get = (async () => {
        throw new Error('Endpoint 500 internal server error');
      }) as unknown as typeof api.get;

      const navigatedUrls: string[] = [];
      await expect(beginOutlookConnection((url) => navigatedUrls.push(url))).rejects.toThrow(
        'Endpoint 500 internal server error'
      );

      expect(navigatedUrls).toEqual([]);
    });
  });
});
