import type { FunctionDeclaration, Tool } from '@google/genai';
import type { AssistantToolNameT } from 'shared';

export const GEMINI_ASSISTANT_TOOL_NAMES = [
  'web_search',
  'propose_google_calendar_event',
  'get_btc_price',
] as const satisfies readonly AssistantToolNameT[];

const proposeCalendarEventSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'start', 'end', 'allDay'],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 256 },
    start: { type: 'string', description: 'ISO 8601 date-time or YYYY-MM-DD for all-day events' },
    end: { type: 'string', description: 'ISO 8601 date-time or YYYY-MM-DD for all-day events' },
    allDay: { type: 'boolean' },
    location: { type: 'string', minLength: 1, maxLength: 256 },
    timezone: { type: 'string', minLength: 1, maxLength: 64 },
  },
} as const;

export const GEMINI_FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'propose_google_calendar_event',
    description:
      'Propose a Google Calendar event for user confirmation. Never create or modify an event directly.',
    parametersJsonSchema: proposeCalendarEventSchema,
  },
  {
    name: 'get_btc_price',
    description: 'Request a cached BTC/USD series for a supported display period.',
    parametersJsonSchema: {
      type: 'object',
      additionalProperties: false,
      properties: { period: { type: 'string', enum: ['daily', 'weekly', 'monthly'] } },
    },
  },
];

export function buildGeminiToolRegistry(enableWebSearch: boolean): Tool[] {
  const tools: Tool[] = [{ functionDeclarations: GEMINI_FUNCTION_DECLARATIONS }];
  if (enableWebSearch) tools.unshift({ googleSearch: {} });
  return tools;
}

export function isGeminiToolName(value: string): value is AssistantToolNameT {
  return (GEMINI_ASSISTANT_TOOL_NAMES as readonly string[]).includes(value);
}
