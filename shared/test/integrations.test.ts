import { describe, expect, test } from 'bun:test';
import {
  AssistantRequest,
  AssistantResponse,
  AssistantToolName,
  AssistantToolRequest,
  AssistantToolResult,
  CalendarEvent,
  PricePoint,
  PriceSeries,
  ProposedCalendarEvent,
  VoiceTranscript,
} from '../src/types/integrations.js';

const timedStart = '2026-09-04T15:00:00+08:00';
const timedEnd = '2026-09-04T16:00:00+08:00';

describe('shared integration contracts', () => {
  test('accepts a normalized BTC price series', () => {
    const result = PriceSeries.safeParse({
      symbol: 'BTC/USD',
      period: 'weekly',
      points: [{ timestamp: timedStart, priceUsd: 100_000 }],
      fetchedAt: timedStart,
      currentPriceUsd: 100_000,
      changePercent: 1.25,
    });

    expect(result.success).toBe(true);
  });

  test('rejects invalid price and unsupported period values', () => {
    expect(
      PriceSeries.safeParse({
        symbol: 'BTC/USD',
        period: 'hourly',
        points: [{ timestamp: timedStart, priceUsd: -1 }],
        fetchedAt: timedStart,
      }).success
    ).toBe(false);

    expect(
      PricePoint.safeParse({ timestamp: timedStart, priceUsd: Number.POSITIVE_INFINITY }).success
    ).toBe(false);
  });

  test('accepts timed and all-day normalized calendar events', () => {
    expect(
      CalendarEvent.safeParse({
        id: 'outlook-1',
        title: 'Team meeting',
        start: timedStart,
        end: timedEnd,
        allDay: false,
        timezone: 'Australia/Perth',
      }).success
    ).toBe(true);

    expect(
      CalendarEvent.safeParse({
        id: 'outlook-2',
        title: 'Public holiday',
        start: '2026-09-07',
        end: '2026-09-08',
        allDay: true,
      }).success
    ).toBe(true);
  });

  test('rejects reversed or mixed-shape calendar events', () => {
    expect(
      CalendarEvent.safeParse({
        id: 'bad-1',
        title: 'Invalid',
        start: timedEnd,
        end: timedStart,
        allDay: false,
      }).success
    ).toBe(false);

    expect(
      CalendarEvent.safeParse({
        id: 'bad-2',
        title: 'Invalid date',
        start: '2026-13-45',
        end: '2026-13-46',
        allDay: true,
      }).success
    ).toBe(false);

    expect(
      ProposedCalendarEvent.safeParse({
        title: 'Invalid',
        start: timedStart,
        end: timedEnd,
        allDay: true,
      }).success
    ).toBe(false);
  });

  test('keeps voice and assistant contracts within the approved tool vocabulary', () => {
    expect(
      VoiceTranscript.safeParse({
        text: 'Add dentist appointment',
        language: 'en',
        isFinal: true,
        timestamp: timedStart,
        confidence: 0.99,
      }).success
    ).toBe(true);

    expect(
      VoiceTranscript.safeParse({
        text: 'Boundary confidence',
        language: 'ja',
        isFinal: false,
        timestamp: timedStart,
        confidence: 0,
      }).success
    ).toBe(true);
    expect(
      VoiceTranscript.safeParse({
        text: 'Invalid confidence',
        language: 'en',
        isFinal: true,
        timestamp: timedStart,
        confidence: 1.01,
      }).success
    ).toBe(false);

    expect(
      AssistantRequest.parse({
        requestId: 'request-1',
        text: 'What is the weather?',
        language: 'en',
      }).enableWebSearch
    ).toBe(false);

    expect(
      AssistantToolRequest.safeParse({
        callId: 'call-1',
        name: 'outlook',
        input: {},
      }).success
    ).toBe(false);

    for (const name of AssistantToolName.options) {
      expect(
        AssistantToolRequest.safeParse({ callId: `call-${name}`, name, input: {} }).success
      ).toBe(true);
    }

    expect(
      AssistantResponse.parse({
        requestId: 'request-2',
        text: 'Done',
        language: 'en',
      }).toolRequests
    ).toEqual([]);

    expect(
      AssistantToolResult.safeParse({
        callId: 'call-success',
        name: 'web_search',
        ok: true,
        output: { result: 'ok' },
      }).success
    ).toBe(true);
    expect(
      AssistantToolResult.safeParse({
        callId: 'call-failure',
        name: 'web_search',
        ok: false,
        error: 'upstream timeout',
      }).success
    ).toBe(true);
    expect(
      AssistantToolResult.safeParse({
        callId: 'call-ambiguous',
        name: 'web_search',
        ok: false,
      }).success
    ).toBe(false);
    expect(
      AssistantToolResult.safeParse({
        callId: 'call-contradictory',
        name: 'web_search',
        ok: true,
        error: 'unexpected error',
      }).success
    ).toBe(false);
  });
});
