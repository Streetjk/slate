import { Injectable } from '@nestjs/common';
import { CodeChallengeMethod } from 'google-auth-library';
import { google, type Auth } from 'googleapis';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AppConfig } from '../../infra/config/app.config';
import { TokenEncryptionService } from '../../infra/security/token-encryption.service';

export const GOOGLE_CALENDAR_PROVIDER = 'google_calendar';
export const GOOGLE_CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.events'] as const;

const PENDING_STATE_TTL_MS = 10 * 60 * 1000;
const ACCESS_TOKEN_SKEW_MS = 2 * 60 * 1000;

interface PendingAuthorization {
  userId: string;
  codeVerifier: string;
  expiresAt: number;
}

interface StoredCredentials {
  refresh_token: string;
  scope?: string;
  token_type?: string;
}

export interface GoogleCalendarConnectionStatus {
  connected: boolean;
  expiresAt?: string;
}

@Injectable()
export class GoogleCalendarOAuthService {
  private readonly pending = new Map<string, PendingAuthorization>();

  constructor(
    private readonly config: AppConfig,
    private readonly prisma: PrismaService,
    private readonly encryption: TokenEncryptionService
  ) {}

  createAuthorizationUrl(userId: string): string {
    const client = this.client();
    const state = randomBytes(32).toString('base64url');
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
    this.pending.set(state, {
      userId,
      codeVerifier,
      expiresAt: Date.now() + PENDING_STATE_TTL_MS,
    });
    this.prunePending();

    return client.generateAuthUrl({
      access_type: 'offline',
      include_granted_scopes: true,
      prompt: 'consent',
      scope: [...GOOGLE_CALENDAR_SCOPES],
      state,
      code_challenge: codeChallenge,
      code_challenge_method: CodeChallengeMethod.S256,
    });
  }

  async completeAuthorization(
    state: string,
    code: string
  ): Promise<GoogleCalendarConnectionStatus> {
    const pending = this.pending.get(state);
    this.pending.delete(state);
    if (!pending || pending.expiresAt <= Date.now()) {
      throw new Error('Google Calendar OAuth state is invalid or expired');
    }

    const client = this.client();
    const { tokens } = await client.getToken({ code, codeVerifier: pending.codeVerifier });
    if (!tokens.refresh_token) {
      throw new Error('Google OAuth did not return a refresh token; consent must be repeated');
    }
    client.setCredentials(tokens);
    await this.saveCredentials(pending.userId, client.credentials);
    return this.statusFromCredentials(client.credentials);
  }

  async getConnectionStatus(userId: string): Promise<GoogleCalendarConnectionStatus> {
    const integration = await this.prisma.userIntegration.findUnique({
      where: { userId_provider: { userId, provider: GOOGLE_CALENDAR_PROVIDER } },
      select: { expiresAt: true },
    });
    if (!integration) return { connected: false };
    return { connected: true, expiresAt: integration.expiresAt.toISOString() };
  }

  async disconnect(userId: string): Promise<void> {
    await this.prisma.userIntegration.deleteMany({
      where: { userId, provider: GOOGLE_CALENDAR_PROVIDER },
    });
  }

  async getAuthenticatedClient(userId: string): Promise<Auth.OAuth2Client> {
    const integration = await this.prisma.userIntegration.findUnique({
      where: { userId_provider: { userId, provider: GOOGLE_CALENDAR_PROVIDER } },
    });
    if (!integration) throw new Error('Google Calendar is not connected');

    const stored = this.readStoredCredentials(
      this.encryption.decrypt(integration.encryptedTokenCache, this.associatedData(userId, 'cache'))
    );
    const client = this.client();
    const accessToken = this.encryption.decrypt(
      integration.encryptedAccessToken,
      this.associatedData(userId, 'access')
    );
    client.setCredentials({
      refresh_token: stored.refresh_token,
      ...(stored.scope ? { scope: stored.scope } : {}),
      ...(stored.token_type ? { token_type: stored.token_type } : {}),
      access_token: accessToken,
      expiry_date: integration.expiresAt.getTime(),
    });

    if (integration.expiresAt.getTime() <= Date.now() + ACCESS_TOKEN_SKEW_MS) {
      try {
        const refreshed = await client.getAccessToken();
        if (!refreshed.token) throw new Error('Google OAuth refresh returned no access token');
        await this.saveCredentials(userId, client.credentials);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/invalid_grant|invalid_token|unauthorized|revoked/i.test(message)) {
          await this.disconnect(userId);
        }
        throw new Error(`Google Calendar token refresh failed: ${message}`, { cause: error });
      }
    }
    return client;
  }

  private async saveCredentials(
    userId: string,
    credentials: Auth.Credentials
  ): Promise<GoogleCalendarConnectionStatus> {
    const accessToken = credentials.access_token;
    const expiryDate = credentials.expiry_date;
    const refreshToken = credentials.refresh_token;
    if (
      !accessToken ||
      expiryDate === undefined ||
      expiryDate === null ||
      !Number.isFinite(expiryDate) ||
      expiryDate <= Date.now()
    ) {
      throw new Error('Google OAuth response did not contain a valid access token');
    }
    if (!refreshToken) throw new Error('Google OAuth credentials have no refresh token');

    const stored: StoredCredentials = {
      refresh_token: refreshToken,
      ...(credentials.scope ? { scope: credentials.scope } : {}),
      ...(credentials.token_type ? { token_type: credentials.token_type } : {}),
    };
    const expiresAt = new Date(expiryDate);
    await this.prisma.userIntegration.upsert({
      where: { userId_provider: { userId, provider: GOOGLE_CALENDAR_PROVIDER } },
      create: {
        userId,
        provider: GOOGLE_CALENDAR_PROVIDER,
        encryptedAccessToken: this.encryption.encrypt(
          accessToken,
          this.associatedData(userId, 'access')
        ),
        encryptedTokenCache: this.encryption.encrypt(
          JSON.stringify(stored),
          this.associatedData(userId, 'cache')
        ),
        expiresAt,
        scopes: GOOGLE_CALENDAR_SCOPES.join(' '),
      },
      update: {
        encryptedAccessToken: this.encryption.encrypt(
          accessToken,
          this.associatedData(userId, 'access')
        ),
        encryptedTokenCache: this.encryption.encrypt(
          JSON.stringify(stored),
          this.associatedData(userId, 'cache')
        ),
        expiresAt,
        scopes: GOOGLE_CALENDAR_SCOPES.join(' '),
      },
    });
    return this.statusFromCredentials(credentials);
  }

  private readStoredCredentials(value: string): StoredCredentials {
    try {
      const parsed = JSON.parse(value) as Partial<StoredCredentials>;
      if (typeof parsed.refresh_token !== 'string' || parsed.refresh_token.length === 0) {
        throw new Error('missing refresh token');
      }
      return {
        refresh_token: parsed.refresh_token,
        ...(typeof parsed.scope === 'string' ? { scope: parsed.scope } : {}),
        ...(typeof parsed.token_type === 'string' ? { token_type: parsed.token_type } : {}),
      };
    } catch (error) {
      throw new Error('Google Calendar credentials are invalid', { cause: error });
    }
  }

  private statusFromCredentials(credentials: Auth.Credentials): GoogleCalendarConnectionStatus {
    if (
      credentials.expiry_date === undefined ||
      credentials.expiry_date === null ||
      !Number.isFinite(credentials.expiry_date)
    ) {
      throw new Error('Google OAuth credentials have no expiry time');
    }
    return { connected: true, expiresAt: new Date(credentials.expiry_date).toISOString() };
  }

  private client(): Auth.OAuth2Client {
    const clientId = this.config.googleCalendarClientId;
    const clientSecret = this.config.googleCalendarClientSecret;
    const redirectUri = this.config.googleCalendarRedirectUri;
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Google Calendar OAuth is not configured');
    }
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  private associatedData(userId: string, kind: 'access' | 'cache'): string {
    return `${userId}:${GOOGLE_CALENDAR_PROVIDER}:${kind}`;
  }

  private prunePending(): void {
    const now = Date.now();
    for (const [state, value] of this.pending) {
      if (value.expiresAt <= now) this.pending.delete(state);
    }
  }
}
