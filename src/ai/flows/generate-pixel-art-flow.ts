
'use server';
/**
 * @fileOverview Genera iconos de pixel art basados en una indicación de texto.
 *
 * - generatePixelArtIconFromPrompt - Una función para generar un icono de pixel art.
 * - GeneratePixelArtIconInput - El tipo de entrada para la función generatePixelArtIconFromPrompt.
 * - GeneratePixelArtIconOutput - El tipo de retorno para la función generatePixelArtIconFromPrompt.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePixelArtIconInputSchema = z.object({
  prompt: z.string().describe('Una indicación de texto concisa que describe el tema principal del icono de pixel art. Por ejemplo: "libro", "manzana roja", "cohete espacial".'),
});
export type GeneratePixelArtIconInput = z.infer<typeof GeneratePixelArtIconInputSchema>;

const GeneratePixelArtIconOutputSchema = z.object({
  iconDataUri: z.string().describe("El icono de pixel art generado como un URI de datos. Formato esperado: 'data:image/png;base64,<datos_codificados>'."),
});
export type GeneratePixelArtIconOutput = z.infer<typeof GeneratePixelArtIconOutputSchema>;

export async function generatePixelArtIconFromPrompt(input: GeneratePixelArtIconInput): Promise<GeneratePixelArtIconOutput> {
  return generatePixelArtIconFlow(input);
}

const generatePixelArtIconFlow = ai.defineFlow(
  {
    name: 'generatePixelArtIconFlow',
    inputSchema: GeneratePixelArtIconInputSchema,
    outputSchema: GeneratePixelArtIconOutputSchema,
  },
  async (input) => {
    // Prompt refinado para ser más directo y específico.
    const imagePrompt = `Crea un icono pixel art de 32x32 píxeles para una tarea con el tema: "${input.prompt}". El estilo debe ser simple, claro, icónico, evocando el arte de 8 bits. Utiliza una paleta de colores limitada y asegúrate de que el fondo sea transparente. El diseño debe ser estrictamente pixelado, sin anti-aliasing ni efectos de suavizado. Debe ser fácilmente reconocible como un icono pequeño.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', 
      prompt: imagePrompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT'], 
         safetySettings: [ 
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE', 
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      },
    });

    if (!media || !media.url) {
      console.error('Error en la respuesta de generación de imagen:', media);
      throw new Error('La generación de imágenes falló o no devolvió una URL de medio válida.');
    }
    
    return { iconDataUri: media.url };
  }
);
