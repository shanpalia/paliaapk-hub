import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * @fileOverview Secure Genkit initialization.
 * - Uses environment variables for API keys (GOOGLE_GENAI_API_KEY).
 * - Centralized AI instance for the PaliaAPK Hub.
 */

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
