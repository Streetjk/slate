import { describe, expect, it } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { OutlookCalendarConfigPanel } from './OutlookCalendarConfig';
import { handleOutlookConnect } from '@/features/dynamic/query/outlook-queries';

describe('OutlookCalendarConfigPanel Connect button path', () => {
  it('initiates navigation on successful auth-url retrieval', async () => {
    const connectingStates: boolean[] = [];
    const errorMessages: Array<string | null> = [];
    const navigatedUrls: string[] = [];

    const mockAuthUrl =
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=123&scope=Calendars.Read';

    await handleOutlookConnect({
      setConnecting: (val) => connectingStates.push(val),
      setErrorMessage: (err) => errorMessages.push(err),
      onNavigate: (url) => navigatedUrls.push(url),
      connectFn: async (nav) => {
        nav?.(mockAuthUrl);
        return mockAuthUrl;
      },
    });

    expect(connectingStates).toEqual([true]);
    expect(errorMessages).toEqual([null]);
    expect(navigatedUrls).toEqual([mockAuthUrl]);
  });

  it('exposes a visible safe error and resets loading on auth-url failure (no silent no-op)', async () => {
    const connectingStates: boolean[] = [];
    const errorMessages: Array<string | null> = [];

    await handleOutlookConnect({
      setConnecting: (val) => connectingStates.push(val),
      setErrorMessage: (err) => errorMessages.push(err),
      connectFn: async () => {
        throw new Error('Microsoft OAuth is not configured');
      },
    });

    // Validates that loading was initiated then reset, and an error was surfaced (not silently ignored)
    expect(connectingStates).toEqual([true, false]);
    expect(errorMessages).toEqual([null, 'Microsoft OAuth is not configured']);
  });

  it('sanitizes errors containing private tokens, secrets, or account info', async () => {
    const connectingStates: boolean[] = [];
    const errorMessages: Array<string | null> = [];

    const leakedTokenError = new Error(
      'OAuth token Bearer eyJhbGciOi... secret=xyz failed for user@outlook.com'
    );

    await handleOutlookConnect({
      setConnecting: (val) => connectingStates.push(val),
      setErrorMessage: (err) => errorMessages.push(err),
      connectFn: async () => {
        throw leakedTokenError;
      },
    });

    expect(connectingStates).toEqual([true, false]);
    const finalError = errorMessages[errorMessages.length - 1];
    expect(finalError).toBe('Failed to connect Outlook');
    expect(finalError).not.toContain('Bearer');
    expect(finalError).not.toContain('secret');
    expect(finalError).not.toContain('@');
  });

  it('renders initial connect button and read-only agenda notice', () => {
    const html = renderToString(
      React.createElement(OutlookCalendarConfigPanel, {
        config: {
          type: 'outlook_calendar',
          tz: 'Australia/Perth',
          days_ahead: 7,
          max_events: 5,
          refresh_interval_sec: 600,
        },
        onChange: () => {},
      })
    );

    expect(html).toContain('Connect Outlook');
    expect(html).toContain('Outlook is read-only');
    expect(html).toContain('Australia/Perth');
  });
});
