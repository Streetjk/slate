import { Injectable } from '@nestjs/common';
import {
  ConfidentialClientApplication,
  CryptoProvider,
  type AuthenticationResult,
} from '@azure/msal-node';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { AppConfig } from '../../../infra/config/app.config';
import { TokenEncryptionService } from '../../../infra/security/token-encryption.service';

export const OUTLOOK_PROVIDER = 'microsoft_outlook_calendar';
export const OUTLOOK_SCOPES = ['openid', 'profile', 'offline_access', 'Calendars.Read'] as const;
const PENDING_STATE_TTL_MS = 10 * 60 * 1000;
const ACCESS_TOKEN_SKEW_MS = 2 * 60 * 1000;

interface PendingAuthorization {
  userId: string;
  codeVerifier: string;
  expiresAt: number;
}

export interface OutlookConnectionStatus {
  connected: boolean;
  accountEmail?: string;
  expiresAt?: string;
}

@Injectable()
export class MicrosoftOAuthService {
  private readonly pending = new Map<string, PendingAuthorization>();
  private readonly crypto = new CryptoProvider();

  constructor(
    private readonly config: AppConfig,
    private readonly prisma: PrismaService,
    private readonly encryption: TokenEncryptionService
  ) {}

  async createAuthorizationUrl(userId: string): Promise<string> {
    const client = this.client();
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
    const client = this.client();
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
    if (!integration) return { connected: false };
    return {
      connected: true,
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
      const client = this.client();
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
      throw new Error(`Microsoft Outlook token refresh failed: ${message}`, { cause: error });
    }
  }

  private async saveTokenResult(
    userId: string,
    result: AuthenticationResult,
    client: ConfidentialClientApplication
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
      ...(result.account?.username ? { accountEmail: result.account.username } : {}),
      expiresAt: expiresAt.toISOString(),
    };
  }

  private client(): ConfidentialClientApplication {
    const clientId = this.config.microsoftClientId;
    const clientSecret = this.config.microsoftClientSecret;
    if (!clientId || !clientSecret) {
      throw new Error('Microsoft OAuth is not configured');
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
    return `${userId}:${OUTLOOK_PROVIDER}:${kind}`;
  }

  private prunePending(): void {
    const now = Date.now();
    for (const [state, value] of this.pending) {
      if (value.expiresAt <= now) this.pending.delete(state);
    }
  }
}
