
'use server';
/**
 * @fileOverview Generates pixel art icons based on a text prompt.
 *
 * - generatePixelArtIcon - A function to generate a pixel art icon.
 * - GeneratePixelArtIconInput - The input type for the generatePixelArtIcon function.
 * - GeneratePixelArtIconOutput - The return type for the generatePixelArtIcon function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePixelArtIconInputSchema = z.object({
  prompt: z.string().describe('A text prompt to generate a pixel art icon from. This will be used to create a visually simple pixel art representation.'),
});
export type GeneratePixelArtIconInput = z.infer<typeof GeneratePixelArtIconInputSchema>;

const GeneratePixelArtIconOutputSchema = z.object({
  iconDataUri: z.string().describe("The generated pixel art icon as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GeneratePixelArtIconOutput = z.infer<typeof GeneratePixelArtIconOutputSchema>;

export async function generatePixelArtIcon(input: GeneratePixelArtIconInput): Promise<GeneratePixelArtIconOutput> {
  return generatePixelArtIconFlow(input);
}

const generatePixelArtIconFlow = ai.defineFlow(
  {
    name: 'generatePixelArtIconFlow',
    inputSchema: GeneratePixelArtIconInputSchema,
    outputSchema: GeneratePixelArtIconOutputSchema,
  },
  async (input) => {
    // Construct a more specific prompt for pixel art generation
    const imagePrompt = `Generate a small, simple, iconic 4-bit or 8-bit pixel art style image (e.g., 32x32 or 64x64 pixels resolution) suitable as a task icon, based on the theme: "${input.prompt}". The icon should be clear, easily recognizable at small sizes, and use a limited color palette characteristic of pixel art. The background should be transparent or a simple, non-distracting solid color if transparency is not directly supported by the generation. Avoid complex details.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Specific model for image generation
      prompt: imagePrompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT'], // MUST provide both TEXT and IMAGE
        // You could add more specific config if the model supports, e.g., targetSize, but let's keep it simple.
        // Forcing aspect ratio or size here might be model-dependent.
        // The prompt itself guides the style and simplicity.
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or did not return a media URL.');
    }
    
    // The media.url is expected to be a data URI like 'data:image/png;base64,....'
    return { iconDataUri: media.url };
  }
);
