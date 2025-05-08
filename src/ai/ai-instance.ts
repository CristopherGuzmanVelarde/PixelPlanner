import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './src/ai/prompts', // Adjusted path assuming prompts would be inside src/ai/prompts
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY, // Ensure this line is correct
    }),
  ],
  model: 'googleai/gemini-2.0-flash', // Default model for text generation
});
