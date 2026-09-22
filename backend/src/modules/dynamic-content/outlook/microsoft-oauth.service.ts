import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ConfidentialClientApplication,
  CryptoProvider,
  PublicClientApplication,
  type AuthenticationResult,
  type DeviceCodeRequest,
} from '@azure/msal-node';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { AppConfig } from '../../../infra/config/app.config';
import { TokenEncryptionService } from '../../../infra/security/token-encryption.service';

export const OUTLOOK_PROVIDER = 'microsoft_outlook_calendar';
export const OUTLOOK_SCOPES = ['openid', 'profile', 'offline_access', 'Calendars.Read'] as const;
const PENDING_STATE_TTL_MS = 10 * 60 * 1000;
const ACCESS_TOKEN_SKEW_MS = 2 * 60 * 1000;
const DEVICE_FLOW_TIMEOUT_SEC = 15 * 60;
const DEVICE_FLOW_START_WAIT_MS = 8_000;

interface PendingAuthorization {
  userId: string;
  codeVerifier: string;
  expiresAt: number;
}

export type OutlookDeviceFlowStatus =
  | 'STARTING'
  | 'WAITING_USER'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface OutlookDeviceFlow {
  flowId: string;
  status: OutlookDeviceFlowStatus;
  verificationUri: string | null;
  userCode: string | null;
  expiresAt: string;
  error: string | null;
}

interface OwnedDeviceFlow extends OutlookDeviceFlow {
  userId: string;
  createdAtMs: number;
  request: DeviceCodeRequest;
}

export interface OutlookConnectionStatus {
  connected: boolean;
  configured: boolean;
  accountEmail?: string;
  expiresAt?: string;
}

type TokenCacheClient = Pick<PublicClientApplication, 'getTokenCache'>;

@Injectable()
export class MicrosoftOAuthService {
  private readonly pending = new Map<string, PendingAuthorization>();
  private readonly deviceFlows = new Map<string, OwnedDeviceFlow>();
  private readonly crypto = new CryptoProvider();

  constructor(
    private readonly config: AppConfig,
    private readonly prisma: PrismaService,
    private readonly encryption: TokenEncryptionService
  ) {}

  isConfigured(): boolean {
    return Boolean(this.config.microsoftClientId);
  }

  isLegacyConfigured(): boolean {
    return Boolean(
      this.config.microsoftClientId &&
      this.config.microsoftClientSecret &&
      this.config.microsoftRedirectUri
    );
  }

  async startDeviceAuthorization(userId: string): Promise<OutlookDeviceFlow> {
    if (!this.isConfigured()) {
      throw new Error('Microsoft Outlook device login is not configured');
    }
    this.pruneDeviceFlows();

    const existing = [...this.deviceFlows.values()].find(
      (flow) =>
        flow.userId === userId &&
        (flow.status === 'STARTING' || flow.status === 'WAITING_USER') &&
        Date.parse(flow.expiresAt) > Date.now()
    );
    if (existing) return this.publicDeviceFlow(existing);

    const client = this.publicClient();
    const flowId = randomUUID();
    const createdAtMs = Date.now();
    let markReady: () => void = () => undefined;
    const ready = new Promise<void>((resolve) => {
      markReady = resolve;
    });

    const request: DeviceCodeRequest = {
      scopes: [...OUTLOOK_SCOPES],
      timeout: DEVICE_FLOW_TIMEOUT_SEC,
      deviceCodeCallback: (response) => {
        const current = this.deviceFlows.get(flowId);
        if (!current || current.status === 'CANCELLED') return;
        current.status = 'WAITING_USER';
        current.verificationUri = response.verificationUri;
        current.userCode = response.userCode;
        current.expiresAt = new Date(Date.now() + response.expiresIn * 1000).toISOString();
        markReady();
      },
    };
    const flow: OwnedDeviceFlow = {
      flowId,
      userId,
      createdAtMs,
      status: 'STARTING',
      verificationUri: null,
      userCode: null,
      expiresAt: new Date(createdAtMs + DEVICE_FLOW_TIMEOUT_SEC * 1000).toISOString(),
      error: null,
      request,
    };
    this.deviceFlows.set(flowId, flow);

    void client
      .acquireTokenByDeviceCode(request)
      .then(async (result) => {
        const current = this.deviceFlows.get(flowId);
        if (!current || current.status === 'CANCELLED') return;
        if (!result) {
          current.status = 'FAILED';
          current.error = 'Microsoft sign-in did not return a token';
          return;
        }
        await this.saveTokenResult(userId, result, client);
        current.status = 'COMPLETED';
        current.error = null;
      })
      .catch((error: unknown) => {
        const current = this.deviceFlows.get(flowId);
        if (!current || current.status === 'CANCELLED') return;
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        if (message.includes('expired')) {
          current.status = 'EXPIRED';
          current.error = 'Microsoft sign-in code expired';
        } else if (message.includes('cancel')) {
          current.status = 'CANCELLED';
          current.error = null;
        } else {
          current.status = 'FAILED';
          current.error = 'Microsoft company account sign-in failed';
        }
      })
      .finally(markReady);

    await Promise.race([
      ready,
      new Promise<void>((resolve) => setTimeout(resolve, DEVICE_FLOW_START_WAIT_MS)),
    ]);

    return this.publicDeviceFlow(this.deviceFlows.get(flowId) ?? flow);
  }

  getDeviceAuthorization(userId: string, flowId: string): OutlookDeviceFlow {
    this.pruneDeviceFlows();
    return this.publicDeviceFlow(this.requireDeviceFlow(userId, flowId));
  }

  cancelDeviceAuthorization(userId: string, flowId: string): void {
    const flow = this.requireDeviceFlow(userId, flowId);
    flow.request.cancel = true;
    flow.status = 'CANCELLED';
    flow.error = null;
  }

  async createAuthorizationUrl(userId: string): Promise<string> {
    const client = this.confidentialClient();
    const { verifier, challenge } = await this.crypto.generatePkceCodes();
    const state = this.crypto.createNewGuid();
    this.pending.set(state, {
      userId,
      codeVerifier: verifier,
      expiresAt: Date.now() + PENDING_STATE_TTL_MS,
    });
    this.prunePending();
    return client.getAuthCodeUrl({
      scopes: [...OUTLOOK_SCOPES],
      redirectUri: this.redirectUri(),
      state,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
      prompt: 'select_account',
    });
  }

  async completeAuthorization(state: string, code: string): Promise<OutlookConnectionStatus> {
    const pending = this.pending.get(state);
    this.pending.delete(state);
    if (!pending || pending.expiresAt <= Date.now()) {
      throw new Error('Microsoft OAuth state is invalid or expired');
    }
    const client = this.confidentialClient();
    const result = await client.acquireTokenByCode({
      code,
      scopes: [...OUTLOOK_SCOPES],
      redirectUri: this.redirectUri(),
      codeVerifier: pending.codeVerifier,
      state,
    });
    return this.saveTokenResult(pending.userId, result, client);
  }

  async getConnectionStatus(userId: string): Promise<OutlookConnectionStatus> {
    const integration = await this.prisma.userIntegration.findUnique({
      where: { userId_provider: { userId, provider: OUTLOOK_PROVIDER } },
      select: { accountEmail: true, expiresAt: true },
    });
    if (!integration) return { connected: false, configured: this.isConfigured() };
    return {
      connected: true,
      configured: this.isConfigured(),
      ...(integration.accountEmail ? { accountEmail: integration.accountEmail } : {}),
      expiresAt: integration.expiresAt.toISOString(),
    };
  }

  async disconnect(userId: string): Promise<void> {
    await this.prisma.userIntegration.deleteMany({
      where: { userId, provider: OUTLOOK_PROVIDER },
    });
  }

  async getAccessToken(userId: string): Promise<string> {
    const integration = await this.prisma.userIntegration.findUnique({
      where: { userId_provider: { userId, provider: OUTLOOK_PROVIDER } },
    });
    if (!integration) throw new Error('Microsoft Outlook is not connected');

    if (integration.expiresAt.getTime() > Date.now() + ACCESS_TOKEN_SKEW_MS) {
      return this.encryption.decrypt(
        integration.encryptedAccessToken,
        this.associatedData(userId, 'access')
      );
    }

    try {
      const client = this.publicClient();
      client
        .getTokenCache()
        .deserialize(
          this.encryption.decrypt(
            integration.encryptedTokenCache,
            this.associatedData(userId, 'cache')
          )
        );
      const account = (await client.getTokenCache().getAllAccounts())[0];
      if (!account) throw new Error('Microsoft OAuth cache has no account');
      const result = await client.acquireTokenSilent({
        account,
        scopes: [...OUTLOOK_SCOPES],
      });
      if (!result) throw new Error('Microsoft OAuth refresh returned no token');
      await this.saveTokenResult(userId, result, client);
      return result.accessToken;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/invalid_grant|interaction_required|no account|refresh/i.test(message)) {
        await this.disconnect(userId);
      }
      throw new Error('Microsoft Outlook token refresh failed: ' + message, { cause: error });
    }
  }

  private async saveTokenResult(
    userId: string,
    result: AuthenticationResult,
    client: TokenCacheClient
  ): Promise<OutlookConnectionStatus> {
    if (!result.accessToken || !result.expiresOn) {
      throw new Error('Microsoft OAuth response did not contain an access token');
    }
    const tokenCache = client.getTokenCache().serialize();
    const expiresAt = result.expiresOn;
    await this.prisma.userIntegration.upsert({
      where: { userId_provider: { userId, provider: OUTLOOK_PROVIDER } },
      create: {
        userId,
        provider: OUTLOOK_PROVIDER,
        encryptedAccessToken: this.encryption.encrypt(
          result.accessToken,
          this.associatedData(userId, 'access')
        ),
        encryptedTokenCache: this.encryption.encrypt(
          tokenCache,
          this.associatedData(userId, 'cache')
        ),
        expiresAt,
        scopes: OUTLOOK_SCOPES.join(' '),
        accountEmail: result.account?.username ?? null,
      },
      update: {
        encryptedAccessToken: this.encryption.encrypt(
          result.accessToken,
          this.associatedData(userId, 'access')
        ),
        encryptedTokenCache: this.encryption.encrypt(
          tokenCache,
          this.associatedData(userId, 'cache')
        ),
        expiresAt,
        scopes: OUTLOOK_SCOPES.join(' '),
        accountEmail: result.account?.username ?? null,
      },
    });
    return {
      connected: true,
      configured: true,
      ...(result.account?.username ? { accountEmail: result.account.username } : {}),
      expiresAt: expiresAt.toISOString(),
    };
  }

  private publicClient(): PublicClientApplication {
    const clientId = this.config.microsoftClientId;
    if (!clientId) throw new Error('MICROSOFT_CLIENT_ID is not configured');
    return new PublicClientApplication({
      auth: {
        clientId,
        authority: this.config.microsoftAuthority,
      },
    });
  }

  private confidentialClient(): ConfidentialClientApplication {
    const clientId = this.config.microsoftClientId;
    const clientSecret = this.config.microsoftClientSecret;
    if (!clientId || !clientSecret) {
      throw new Error('Microsoft confidential-client OAuth is not configured');
    }
    return new ConfidentialClientApplication({
      auth: {
        clientId,
        clientSecret,
        authority: this.config.microsoftAuthority,
      },
    });
  }

  private redirectUri(): string {
    const uri = this.config.microsoftRedirectUri;
    if (!uri) throw new Error('MICROSOFT_REDIRECT_URI is not configured');
    return uri;
  }

  private associatedData(userId: string, kind: 'access' | 'cache'): string {
    return userId + ':' + OUTLOOK_PROVIDER + ':' + kind;
  }

  private requireDeviceFlow(userId: string, flowId: string): OwnedDeviceFlow {
    const flow = this.deviceFlows.get(flowId);
    if (!flow || flow.userId !== userId) throw new Error('Microsoft device login flow not found');
    return flow;
  }

  private publicDeviceFlow(flow: OwnedDeviceFlow): OutlookDeviceFlow {
    return {
      flowId: flow.flowId,
      status: flow.status,
      verificationUri: flow.verificationUri,
      userCode: flow.userCode,
      expiresAt: flow.expiresAt,
      error: flow.error,
    };
  }

  private prunePending(): void {
    const now = Date.now();
    for (const [state, value] of this.pending) {
      if (value.expiresAt <= now) this.pending.delete(state);
    }
  }

  private pruneDeviceFlows(): void {
    const now = Date.now();
    for (const [flowId, flow] of this.deviceFlows) {
      const expiry = Date.parse(flow.expiresAt);
      if (
        (Number.isFinite(expiry) && expiry + 60 * 60 * 1000 < now) ||
        flow.createdAtMs + 2 * 60 * 60 * 1000 < now
      ) {
        this.deviceFlows.delete(flowId);
      }
    }
  }
}
