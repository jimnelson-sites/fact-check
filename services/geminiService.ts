
import { GoogleGenAI } from "@google/genai";
import type { FactCheckResult } from '../types';
import { SYSTEM_PROMPT } from '../constants';

// This is a placeholder. In a real environment, the API key would be
// securely managed and accessed via process.env.API_KEY.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. The app will not function correctly without a valid API key.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Cleans the raw text response from the model to extract the JSON object.
 * @param rawText - The raw string response from the Gemini API.
 * @returns A clean JSON string.
 */
function cleanResponse(rawText: string): string {
  // The model may wrap the JSON in markdown code blocks.
  const cleaned = rawText.replace(/^```json\s*|```$/g, '').trim();
  return cleaned;
}

/**
 * Sends a claim to the Gemini API for fact-checking.
 * @param claim - The user's claim to be fact-checked.
 * @returns A promise that resolves to a FactCheckResult object.
 */
export const factCheck = async (claim: string): Promise<FactCheckResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: claim,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // Lower temperature for more factual, less creative responses
      },
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Received an empty response from the API.");
    }
    
    const cleanedJson = cleanResponse(rawJson);
    const result: FactCheckResult = JSON.parse(cleanedJson);

    // Basic validation of the parsed object
    if (!result.answer || !result.confidence || !result.sources) {
        throw new Error("API response is missing required fields.");
    }

    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("The configured API key is invalid. Please check your configuration.");
    }
    throw new Error("Failed to get a valid fact-check from the service. The model may have returned an unexpected format.");
  }
};
