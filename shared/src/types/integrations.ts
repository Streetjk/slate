import { z } from 'zod';

const IsoDateTime = z.string().datetime({ offset: true });
const CalendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .superRefine((value, ctx) => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      !Number.isFinite(date.getTime()) ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      ctx.addIssue({ code: 'custom', message: 'invalid calendar date' });
    }
  });
const CalendarTemporalValue = z.union([IsoDateTime, CalendarDate]);

const CalendarEventFields = z.object({
  title: z.string().trim().min(1).max(256),
  start: CalendarTemporalValue,
  end: CalendarTemporalValue,
  allDay: z.boolean(),
  location: z.string().trim().min(1).max(256).optional(),
  timezone: z.string().trim().min(1).max(64).optional(),
});

const validateCalendarEventBounds = (
  event: z.infer<typeof CalendarEventFields>,
  ctx: z.RefinementCtx
) => {
  const isDate = (value: string) => CalendarDate.safeParse(value).success;

  if (event.allDay && (!isDate(event.start) || !isDate(event.end))) {
    ctx.addIssue({
      code: 'custom',
      path: ['allDay'],
      message: 'all-day events must use calendar dates',
    });
  }

  if (!event.allDay && (isDate(event.start) || isDate(event.end))) {
    ctx.addIssue({
      code: 'custom',
      path: ['allDay'],
      message: 'timed events must use ISO date-time values',
    });
  }

  const startTimestamp = Date.parse(event.start);
  const endTimestamp = Date.parse(event.end);

  if (!Number.isFinite(startTimestamp) || !Number.isFinite(endTimestamp)) {
    ctx.addIssue({
      code: 'custom',
      path: ['start'],
      message: 'event dates must be valid calendar values',
    });
  } else if (endTimestamp <= startTimestamp) {
    ctx.addIssue({
      code: 'custom',
      path: ['end'],
      message: 'event end must be after event start',
    });
  }
};

export const PricePeriod = z.enum(['daily', 'weekly', 'monthly']);
export type PricePeriodT = z.infer<typeof PricePeriod>;

export const PricePoint = z.object({
  timestamp: IsoDateTime,
  priceUsd: z.number().finite().nonnegative(),
});
export type PricePointT = z.infer<typeof PricePoint>;

export const PriceSeries = z.object({
  symbol: z.string().regex(/^[A-Z0-9._-]+\/[A-Z0-9._-]+$/),
  period: PricePeriod,
  points: z.array(PricePoint),
  fetchedAt: IsoDateTime,
  currentPriceUsd: z.number().finite().nonnegative().optional(),
  changePercent: z.number().finite().optional(),
});
export type PriceSeriesT = z.infer<typeof PriceSeries>;

export const CalendarEvent = CalendarEventFields.extend({
  id: z.string().trim().min(1).max(256),
}).superRefine(validateCalendarEventBounds);
export type CalendarEventT = z.infer<typeof CalendarEvent>;

export const ProposedCalendarEvent = CalendarEventFields.strict().superRefine(
  validateCalendarEventBounds
);
export type ProposedCalendarEventT = z.infer<typeof ProposedCalendarEvent>;

export const VoiceLanguage = z.enum(['en', 'ja']);
export type VoiceLanguageT = z.infer<typeof VoiceLanguage>;

export const VoiceTranscript = z.object({
  text: z.string(),
  language: VoiceLanguage,
  isFinal: z.boolean(),
  timestamp: IsoDateTime,
  confidence: z.number().finite().min(0).max(1).optional(),
});
export type VoiceTranscriptT = z.infer<typeof VoiceTranscript>;

export const AssistantRequest = z.object({
  requestId: z.string().trim().min(1).max(128),
  text: z.string().trim().min(1).max(8192),
  language: VoiceLanguage,
  conversationId: z.string().trim().min(1).max(128).optional(),
  enableWebSearch: z.boolean().default(false),
});
export type AssistantRequestT = z.infer<typeof AssistantRequest>;

export const AssistantToolName = z.enum([
  'web_search',
  'propose_google_calendar_event',
  'get_btc_price',
]);
export type AssistantToolNameT = z.infer<typeof AssistantToolName>;

const ToolCallId = z.string().trim().min(1).max(128);

export const WebSearchToolInput = z
  .object({
    query: z.string().trim().min(1).max(2048),
    language: VoiceLanguage.optional(),
    maxResults: z.number().int().min(1).max(10).optional(),
  })
  .strict();
export type WebSearchToolInputT = z.infer<typeof WebSearchToolInput>;

export const GetBtcPriceToolInput = z
  .object({
    period: PricePeriod.default('daily'),
  })
  .strict();
export type GetBtcPriceToolInputT = z.infer<typeof GetBtcPriceToolInput>;

export const ProposeGoogleCalendarEventToolInput = ProposedCalendarEvent;
export type ProposeGoogleCalendarEventToolInputT = z.infer<
  typeof ProposeGoogleCalendarEventToolInput
>;

export const AssistantToolRequest = z.discriminatedUnion('name', [
  z.object({ callId: ToolCallId, name: z.literal('web_search'), input: WebSearchToolInput }),
  z.object({
    callId: ToolCallId,
    name: z.literal('propose_google_calendar_event'),
    input: ProposeGoogleCalendarEventToolInput,
  }),
  z.object({
    callId: ToolCallId,
    name: z.literal('get_btc_price'),
    input: GetBtcPriceToolInput,
  }),
]);
export type AssistantToolRequestT = z.infer<typeof AssistantToolRequest>;

export const AssistantToolResult = z
  .object({
    callId: z.string().trim().min(1).max(128),
    name: AssistantToolName,
    ok: z.boolean(),
    output: z.unknown().optional(),
    error: z.string().trim().min(1).max(1024).optional(),
  })
  .superRefine((result, ctx) => {
    if (result.ok && result.error !== undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['error'],
        message: 'successful tool results cannot contain an error',
      });
    }
    if (!result.ok && result.error === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['error'],
        message: 'failed tool results must contain an error',
      });
    }
  });
export type AssistantToolResultT = z.infer<typeof AssistantToolResult>;

export const AssistantResponse = z.object({
  requestId: z.string().trim().min(1).max(128),
  text: z.string(),
  language: VoiceLanguage,
  toolRequests: z.array(AssistantToolRequest).default([]),
});
export type AssistantResponseT = z.infer<typeof AssistantResponse>;
