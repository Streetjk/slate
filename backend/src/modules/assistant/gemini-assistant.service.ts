import { Inject, Injectable, Logger } from '@nestjs/common';
import type { GenerateContentResponse } from '@google/genai';
import {
  AssistantRequest,
  AssistantResponse,
  AssistantToolRequest,
  type AssistantRequestT,
  type AssistantResponseT,
} from 'shared';
import { GeminiConfig } from './gemini.config';
import {
  createGeminiClient,
  GEMINI_CLIENT_FACTORY,
  safeGeminiErrorCategory,
  type GeminiClientFactory,
} from './gemini.client';
import { buildGeminiToolRegistry, isGeminiToolName } from './gemini-tool-registry';
import { GeminiConfigurationError } from './gemini-live.service';

const SYSTEM_INSTRUCTION =
  'You are the Slate assistant on a monochrome NOTE4. Answer concisely in the requested language, English or Japanese. Never access, request, summarize, or expose Outlook or Microsoft calendar data. Google Calendar requests must remain proposals until an independent confirmation flow confirms them. You do not have shell, filesystem, arbitrary HTTP, email, or database access.';

@Injectable()
export class GeminiAssistantService {
  private readonly logger = new Logger(GeminiAssistantService.name);

  constructor(
    private readonly config: GeminiConfig,
    @Inject(GEMINI_CLIENT_FACTORY)
    private readonly clientFactory: GeminiClientFactory = createGeminiClient
  ) {}

  isConfigured(): boolean {
    return this.config.isConfigured();
  }

  async answer(input: AssistantRequestT): Promise<AssistantResponseT> {
    const request = AssistantRequest.parse(input);
    if (!this.config.isConfigured()) {
      throw new GeminiConfigurationError(this.config.configurationErrorMessage());
    }

    let client: ReturnType<GeminiClientFactory>;
    try {
      client = this.clientFactory(this.config.clientOptions());
    } catch (error) {
      this.logger.warn(`Gemini client initialization failed: ${safeGeminiErrorCategory(error)}`);
      throw new GeminiConfigurationError('Gemini runtime client could not be initialized');
    }
    let response: GenerateContentResponse;
    try {
      response = await client.models.generateContent({
        model: this.config.textModel,
        contents: [{ role: 'user', parts: [{ text: request.text }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: buildGeminiToolRegistry(request.enableWebSearch),
        },
      });
    } catch (error) {
      this.logger.warn(`Gemini answer failed: ${safeGeminiErrorCategory(error)}`);
      throw new GeminiRequestError('Gemini answer request failed');
    }

    const toolRequests = (response.functionCalls ?? []).map((call) => {
      const name = call.name;
      if (!name || !isGeminiToolName(name) || name === 'web_search') {
        throw new GeminiProtocolError(
          `Gemini returned a forbidden tool call: ${name ?? '(missing)'}`
        );
      }
      return AssistantToolRequest.parse({
        callId: call.id ?? crypto.randomUUID(),
        name,
        input: call.args ?? {},
      });
    });

    return AssistantResponse.parse({
      requestId: request.requestId,
      text: response.text ?? '',
      language: request.language,
      toolRequests,
    });
  }
}

export class GeminiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiRequestError';
  }
}

export class GeminiProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiProtocolError';
  }
}
