import { describe, expect, it } from 'bun:test';
import { AssistantToolName } from 'shared';
import { OUTLOOK_SCOPES } from './microsoft-oauth.service';

describe('Outlook and Gemini security boundary', () => {
  it('has no Microsoft or Outlook capability in the assistant tool registry', () => {
    expect(AssistantToolName.options).toEqual([
      'web_search',
      'propose_google_calendar_event',
      'get_btc_price',
    ]);
    expect(AssistantToolName.options.some((name) => /microsoft|outlook/i.test(name))).toBe(false);
  });

  it('requests only delegated read-only Outlook calendar scopes', () => {
    expect(OUTLOOK_SCOPES).toEqual(['openid', 'profile', 'offline_access', 'Calendars.Read']);
    expect(OUTLOOK_SCOPES.some((scope) => /readwrite|shared|mail|files/i.test(scope))).toBe(false);
  });
});
