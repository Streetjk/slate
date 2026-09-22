import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import ical, { type ParameterValue, type VEvent } from 'node-ical';
import { CalendarEvent, type CalendarEventT, type OutlookCalendarConfigT } from 'shared';
import { ValidationError } from '../../../common/errors';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { TokenEncryptionService } from '../../../infra/security/token-encryption.service';

export const OUTLOOK_ICS_PROVIDER = 'microsoft_outlook_ics';
const MAX_ICS_BYTES = 16 * 1024 * 1024;
const MAX_ICS_COMPONENTS = 10_000;
const FETCH_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;
// Exchange Online can reject published ICS requests from non-browser clients with
// OwaBasicUnsupportedException/HTTP 500 while serving the same URL to browsers.
const OUTLOOK_ICS_USER_AGENT =
  'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const ICS_EXPIRES_AT = new Date('2100-01-01T00:00:00.000Z');
const ALLOWED_OUTLOOK_ICS_HOSTS = [
  'outlook.office365.com',
  'outlook.office.com',
  'outlook.live.com',
  'calendar.live.com',
] as const;

export interface OutlookIcsStatus {
  connected: boolean;
  updatedAt?: string;
}

interface IcsConnection {
  url: string;
  updatedAt: Date;
}

@Injectable()
export class OutlookIcsService {
  private readonly logger = new Logger(OutlookIcsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: TokenEncryptionService
  ) {}

  async status(userId: string): Promise<OutlookIcsStatus> {
    const integration = await this.prisma.userIntegration.findUnique({
      where: { userId_provider: { userId, provider: OUTLOOK_ICS_PROVIDER } },
      select: { updatedAt: true },
    });
    return integration
      ? { connected: true, updatedAt: integration.updatedAt.toISOString() }
      : { connected: false };
  }

  async connect(userId: string, rawUrl: string): Promise<OutlookIcsStatus> {
    const url = validateOutlookIcsUrl(rawUrl);
    try {
      const body = await fetchIcsText(url);
      parseOutlookIcs(
        body,
        {
          type: 'outlook_calendar',
          tz: 'Australia/Perth',
          days_ahead: 7,
          max_events: 20,
          refresh_interval_sec: 600,
        },
        new Date()
      );
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      const reason = outlookIcsFailureMessage(error);
      this.logger.warn('Outlook ICS connection validation failed: ' + reason);
      throw new ValidationError(reason);
    }

    await this.prisma.userIntegration.upsert({
      where: { userId_provider: { userId, provider: OUTLOOK_ICS_PROVIDER } },
      create: {
        userId,
        provider: OUTLOOK_ICS_PROVIDER,
        encryptedAccessToken: this.encryption.encrypt(
          url.toString(),
          this.associatedData(userId, 'url')
        ),
        encryptedTokenCache: this.encryption.encrypt('ics-v1', this.associatedData(userId, 'meta')),
        expiresAt: ICS_EXPIRES_AT,
        scopes: 'ics:read',
        accountEmail: null,
      },
      update: {
        encryptedAccessToken: this.encryption.encrypt(
          url.toString(),
          this.associatedData(userId, 'url')
        ),
        encryptedTokenCache: this.encryption.encrypt('ics-v1', this.associatedData(userId, 'meta')),
        expiresAt: ICS_EXPIRES_AT,
        scopes: 'ics:read',
        accountEmail: null,
      },
    });
    await this.armOutlookRefresh(userId);
    return this.status(userId);
  }

  async disconnect(userId: string): Promise<void> {
    await this.prisma.userIntegration.deleteMany({
      where: { userId, provider: OUTLOOK_ICS_PROVIDER },
    });
    await this.armOutlookRefresh(userId);
  }

  async connection(userId: string): Promise<IcsConnection | null> {
    const integration = await this.prisma.userIntegration.findUnique({
      where: { userId_provider: { userId, provider: OUTLOOK_ICS_PROVIDER } },
      select: { encryptedAccessToken: true, updatedAt: true },
    });
    if (!integration) return null;
    const url = this.encryption.decrypt(
      integration.encryptedAccessToken,
      this.associatedData(userId, 'url')
    );
    validateOutlookIcsUrl(url);
    return { url, updatedAt: integration.updatedAt };
  }

  async listCalendarView(
    userId: string,
    config: OutlookCalendarConfigT,
    now: Date
  ): Promise<CalendarEventT[]> {
    const connection = await this.connection(userId);
    if (!connection) throw new Error('Outlook ICS feed is not connected');
    const body = await fetchIcsText(new URL(connection.url));
    return parseOutlookIcs(body, config, now);
  }

  private async armOutlookRefresh(userId: string): Promise<void> {
    await this.prisma.content.updateMany({
      where: {
        dynamicType: 'outlook_calendar',
        group: { ownerUserId: userId },
      },
      data: {
        dynamicRefreshDueAt: new Date(0),
        dynamicRefreshLeaseUntil: null,
      },
    });
  }

  private associatedData(userId: string, kind: 'url' | 'meta'): string {
    return userId + ':' + OUTLOOK_ICS_PROVIDER + ':' + kind;
  }
}

function outlookIcsFailureMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const http = message.match(/HTTP\s+(\d{3})/i);
  if (http?.[1]) {
    return (
      'Outlook ICS feed returned HTTP ' +
      http[1] +
      '. Check that you copied the published ICS link, not the HTML sharing link.'
    );
  }
  if (/redirected too many times/i.test(message)) {
    return 'Outlook ICS feed redirected too many times. The published link may have expired or changed.';
  }
  if (
    /must be a Microsoft Outlook published calendar URL|must use HTTPS|must not contain URL credentials|must end in \.ics/i.test(
      message
    )
  ) {
    return message;
  }
  if (/too large|too many items/i.test(message)) {
    return 'Outlook ICS feed is too large for Slate to validate safely.';
  }
  if (/not a calendar/i.test(message)) {
    return 'The Outlook link did not return an ICS calendar. Check that you copied the .ics link rather than the HTML link.';
  }
  if (/abort|timeout|timed out/i.test(message)) {
    return 'Slate timed out while fetching the Outlook ICS feed. Please try again.';
  }
  if (/ENOTFOUND|EAI_AGAIN|ECONNREFUSED|network|fetch failed/i.test(message)) {
    return 'Slate could not reach the Outlook ICS feed from the Orange Pi.';
  }
  return 'Slate fetched the Outlook ICS feed, but could not parse it. The feed format may need a compatibility fix.';
}

export function validateOutlookIcsUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new ValidationError('Invalid Outlook ICS URL');
  }
  if (url.protocol !== 'https:') throw new ValidationError('Outlook ICS URL must use HTTPS');
  if (url.username || url.password) {
    throw new ValidationError('Outlook ICS URL must not contain URL credentials');
  }
  const host = url.hostname.toLowerCase();
  const allowed = ALLOWED_OUTLOOK_ICS_HOSTS.some(
    (base) => host === base || host.endsWith('.' + base)
  );
  if (!allowed) {
    throw new ValidationError('ICS feed must be a Microsoft Outlook published calendar URL');
  }
  url.hash = '';
  return url;
}

async function fetchIcsText(initialUrl: URL): Promise<string> {
  let current = validateOutlookIcsUrl(initialUrl.toString());
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(current, {
        method: 'GET',
        headers: {
          accept: 'text/calendar, text/plain;q=0.9, */*;q=0.1',
          'user-agent': OUTLOOK_ICS_USER_AGENT,
        },
        redirect: 'manual',
        signal: controller.signal,
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location || redirect === MAX_REDIRECTS) {
          throw new Error('Outlook ICS feed redirected too many times');
        }
        current = validateOutlookIcsUrl(new URL(location, current).toString());
        continue;
      }
      if (!response.ok) throw new Error('Outlook ICS feed returned HTTP ' + response.status);
      const declaredLength = Number(response.headers.get('content-length') ?? '0');
      if (Number.isFinite(declaredLength) && declaredLength > MAX_ICS_BYTES) {
        throw new Error('Outlook ICS feed is too large');
      }
      const text = await readResponseTextWithLimit(response, MAX_ICS_BYTES);
      if (!text.includes('BEGIN:VCALENDAR') || !text.includes('END:VCALENDAR')) {
        throw new Error('Outlook ICS feed is not a calendar');
      }
      return text;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error('Outlook ICS feed could not be fetched');
}

async function readResponseTextWithLimit(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return '';

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error('Outlook ICS feed is too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const buffer = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8').decode(buffer);
}

export function parseOutlookIcs(
  body: string,
  config: OutlookCalendarConfigT,
  now: Date
): CalendarEventT[] {
  const parsed = ical.sync.parseICS(body);
  const components = Object.values(parsed);
  if (components.length > MAX_ICS_COMPONENTS)
    throw new Error('Outlook ICS feed has too many items');

  const from = now;
  const to = new Date(now.getTime() + config.days_ahead * 24 * 60 * 60 * 1000);
  const events: CalendarEventT[] = [];

  for (const component of components) {
    if (!component || component.type !== 'VEVENT') continue;
    const event = component as VEvent;
    if (event.status === 'CANCELLED') continue;

    if (event.rrule) {
      let instances;
      try {
        instances = ical.expandRecurringEvent(event, {
          from,
          to,
          includeOverrides: true,
          excludeExdates: true,
          expandOngoing: true,
        });
      } catch {
        continue;
      }
      for (const instance of instances) {
        if (instance.event.status === 'CANCELLED') continue;
        const normalized = normalizeIcsEvent(
          instance.event,
          instance.start,
          instance.end,
          instance.isFullDay,
          config.tz
        );
        if (normalized && overlapsRange(normalized, from, to)) events.push(normalized);
      }
      continue;
    }

    const allDay = event.datetype === 'date' || event.start.dateOnly === true;
    const end = event.end ?? defaultEnd(event.start, allDay);
    const normalized = normalizeIcsEvent(event, event.start, end, allDay, config.tz);
    if (normalized && overlapsRange(normalized, from, to)) events.push(normalized);
  }

  const deduped = new Map<string, CalendarEventT>();
  for (const event of events) deduped.set(event.id, event);
  return [...deduped.values()]
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, config.max_events);
}

function normalizeIcsEvent(
  event: VEvent,
  start: Date,
  end: Date,
  allDay: boolean,
  timezone: string
): CalendarEventT | null {
  const title = parameterText(event.summary) ?? 'Untitled event';
  const location = parameterText(event.location);
  const startValue = allDay ? dateOnly(start) : start.toISOString();
  const endValue = allDay ? dateOnly(end) : end.toISOString();
  const id = stableEventId(event.uid, startValue);

  const parsed = CalendarEvent.safeParse({
    id,
    title: title.slice(0, 256),
    start: startValue,
    end: endValue,
    allDay,
    ...(location ? { location: location.slice(0, 256) } : {}),
    timezone,
  });
  return parsed.success ? parsed.data : null;
}

function parameterText(value: ParameterValue | undefined): string | null {
  const raw = typeof value === 'string' ? value : value?.val;
  if (typeof raw !== 'string') return null;
  const text = raw.trim();
  return text || null;
}

function defaultEnd(start: Date, allDay: boolean): Date {
  return new Date(start.getTime() + (allDay ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000));
}

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function overlapsRange(event: CalendarEventT, from: Date, to: Date): boolean {
  const start = Date.parse(event.start);
  const end = Date.parse(event.end);
  return (
    Number.isFinite(start) && Number.isFinite(end) && end > from.getTime() && start < to.getTime()
  );
}

function stableEventId(uid: string, start: string): string {
  return (
    'ics:' +
    createHash('sha256')
      .update(uid + '|' + start)
      .digest('hex')
      .slice(0, 40)
  );
}
