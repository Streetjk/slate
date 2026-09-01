import { GoogleGenAI, type GoogleGenAIOptions } from '@google/genai';

export type GeminiClient = Pick<GoogleGenAI, 'models' | 'live'>;
export type GeminiClientFactory = (options: GoogleGenAIOptions) => GeminiClient;

export const createGeminiClient: GeminiClientFactory = (options) => new GoogleGenAI(options);
