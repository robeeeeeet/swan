/**
 * Gemini AI Client
 * Server-side client for Google Gemini API
 */

import { GoogleGenAI } from '@google/genai';

// Lazy initialization of the Gemini client
let geminiClient: GoogleGenAI | null = null;

/**
 * Get or create the Gemini client instance
 * Uses singleton pattern to reuse the client across requests
 */
export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    geminiClient = new GoogleGenAI({ apiKey });
  }

  return geminiClient;
}

/**
 * Get the model name from environment or use default
 */
export function getModelName(): string {
  return process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash-exp';
}

/**
 * Generation configuration for coaching messages
 * Optimized for encouraging, concise responses
 */
export const COACHING_GENERATION_CONFIG = {
  temperature: 0.8,      // Slightly creative for varied responses
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 500,  // Keep responses concise
};

/**
 * Generation configuration for analytical content
 * More deterministic for consistent analysis
 */
export const ANALYSIS_GENERATION_CONFIG = {
  temperature: 0.3,      // More deterministic
  topP: 0.85,
  topK: 20,
  maxOutputTokens: 1000,
};

/**
 * Generate text content using Gemini
 */
export async function generateText(
  prompt: string,
  config: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
  } = COACHING_GENERATION_CONFIG
): Promise<string> {
  const client = getGeminiClient();
  const model = getModelName();

  try {
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: config.temperature,
        topP: config.topP,
        topK: config.topK,
        maxOutputTokens: config.maxOutputTokens,
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    return text.trim();
  } catch (error) {
    console.error('[Gemini] Error generating text:', error);
    throw error;
  }
}

/**
 * Generate coaching message with streaming support
 * Returns an async generator for real-time UI updates
 */
export async function* generateTextStream(
  prompt: string,
  config: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
  } = COACHING_GENERATION_CONFIG
): AsyncGenerator<string, void, unknown> {
  const client = getGeminiClient();
  const model = getModelName();

  try {
    const response = await client.models.generateContentStream({
      model,
      contents: prompt,
      config: {
        temperature: config.temperature,
        topP: config.topP,
        topK: config.topK,
        maxOutputTokens: config.maxOutputTokens,
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('[Gemini] Error generating stream:', error);
    throw error;
  }
}

/**
 * Check if Gemini API is properly configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
