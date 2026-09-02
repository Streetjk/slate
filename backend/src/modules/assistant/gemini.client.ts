import { readFileSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';

export type GeminiClient = Pick<GoogleGenAI, 'models' | 'live'>;
export type GeminiClientOptions =
  | {
      vertexai: true;
      project: string;
      location: string;
    }
  | {
      apiKeyFile: string;
    };
export type GeminiClientFactory = (options: GeminiClientOptions) => GeminiClient;

export const GEMINI_CLIENT_FACTORY = Symbol('GeminiClientFactory');

export const createGeminiClient: GeminiClientFactory = (options) => {
  try {
    if ('apiKeyFile' in options) {
      return new GoogleGenAI({ apiKey: readGeminiApiKeyFile(options.apiKeyFile) });
    }
    return new GoogleGenAI(options);
  } catch {
    if ('apiKeyFile' in options) {
      throw new GeminiCredentialError('Gemini client could not be initialized');
    }
    throw new GeminiCredentialError('Gemini OAuth/ADC client could not be initialized');
  }
};

export function readGeminiApiKeyFile(filePath: string): string {
  try {
    const value = readFileSync(filePath, 'utf8').trim();
    if (!value) throw new Error('empty credential');
    return value;
  } catch {
    throw new GeminiCredentialError('Gemini runtime credential could not be loaded');
  }
}

export class GeminiCredentialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiCredentialError';
  }
}
