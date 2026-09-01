import 'reflect-metadata';
import { describe, expect, it } from 'bun:test';
import { AssistantController } from './assistant.controller';

describe('AssistantController', () => {
  it('forwards the already validated request to the OAuth-backed service', async () => {
    const request = {
      requestId: 'request-1',
      text: 'Hello',
      language: 'en' as const,
      enableWebSearch: false,
    };
    const response = {
      requestId: 'request-1',
      text: 'Hi',
      language: 'en' as const,
      toolRequests: [],
    };
    let received: unknown;
    const controller = new AssistantController({
      answer: async (value: unknown) => {
        received = value;
        return response;
      },
    } as never);

    await expect(controller.answer(request)).resolves.toEqual(response);
    expect(received).toBe(request);
  });
});
