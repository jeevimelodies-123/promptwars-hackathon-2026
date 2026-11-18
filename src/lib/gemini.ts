import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(apiKey && apiKey.trim().length > 5);

export const getGeminiClient = () => {
  if (!isGeminiConfigured) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getGeminiModel = (modelName: string = 'gemini-1.5-flash') => {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({ model: modelName });
};

/**
 * Safely cleans LLM markdown codeblocks (e.g. ```json ... ```) to parse JSON
 */
export function cleanAndParseJson<T>(rawText: string, fallback: T): T {
  try {
    let clean = rawText.trim();
    // Remove markdown codeblock wrapper
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean.trim()) as T;
  } catch (err) {
    console.warn('Failed to parse JSON from AI response, returning fallback:', err);
    return fallback;
  }
}
