import { describe, expect, it } from 'bun:test';
import type { AppConfig } from '../../../infra/config/app.config';
import { MicrosoftOAuthService } from './microsoft-oauth.service';

function configured(): AppConfig {
  return {
    microsoftClientId: 'public-client-id',
    microsoftClientSecret: undefined,
    microsoftRedirectUri: undefined,
    microsoftAuthority: 'https://login.microsoftonline.com/organizations',
  } as AppConfig;
}

describe('Microsoft Outlook device-code login', () => {
  it('requires only a public client ID and returns only user-facing device flow fields', async () => {
    const service = new MicrosoftOAuthService(configured(), {} as never, {} as never);
    let capturedRequest: { cancel?: boolean } | null = null;

    (service as unknown as { publicClient: () => unknown }).publicClient = () => ({
      acquireTokenByDeviceCode: async (request: {
        cancel?: boolean;
        deviceCodeCallback: (response: {
          userCode: string;
          deviceCode: string;
          verificationUri: string;
          expiresIn: number;
          interval: number;
          message: string;
        }) => void;
      }) => {
        capturedRequest = request;
        request.deviceCodeCallback({
          userCode: 'ABCD-EFGH',
          deviceCode: 'MUST_NOT_FLOW_TO_BROWSER',
          verificationUri: 'https://microsoft.com/devicelogin',
          expiresIn: 900,
          interval: 5,
          message: 'Sign in',
        });
        return new Promise<never>(() => undefined);
      },
    });

    expect(service.isConfigured()).toBe(true);
    expect(service.isLegacyConfigured()).toBe(false);

    const flow = await service.startDeviceAuthorization('user-a');
    expect(flow).toMatchObject({
      status: 'WAITING_USER',
      verificationUri: 'https://microsoft.com/devicelogin',
      userCode: 'ABCD-EFGH',
      error: null,
    });
    expect(JSON.stringify(flow)).not.toContain('MUST_NOT_FLOW_TO_BROWSER');

    const same = await service.startDeviceAuthorization('user-a');
    expect(same.flowId).toBe(flow.flowId);
    expect(() => service.getDeviceAuthorization('user-b', flow.flowId)).toThrow('not found');

    service.cancelDeviceAuthorization('user-a', flow.flowId);
    expect(service.getDeviceAuthorization('user-a', flow.flowId).status).toBe('CANCELLED');
    expect(capturedRequest).toMatchObject({ cancel: true });
  });

  it('fails closed when the Microsoft client ID is missing', async () => {
    const service = new MicrosoftOAuthService(
      {
        microsoftClientId: undefined,
        microsoftClientSecret: undefined,
        microsoftRedirectUri: undefined,
        microsoftAuthority: 'https://login.microsoftonline.com/organizations',
      } as AppConfig,
      {} as never,
      {} as never
    );
    expect(service.isConfigured()).toBe(false);
    await expect(service.startDeviceAuthorization('user-a')).rejects.toThrow('not configured');
  });
});
