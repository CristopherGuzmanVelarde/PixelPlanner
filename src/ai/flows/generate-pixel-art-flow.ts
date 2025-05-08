
'use server';
/**
 * @fileOverview Genera iconos de pixel art basados en una indicación de texto.
 *
 * - generatePixelArtIcon - Una función para generar un icono de pixel art.
 * - GeneratePixelArtIconInput - El tipo de entrada para la función generatePixelArtIcon.
 * - GeneratePixelArtIconOutput - El tipo de retorno para la función generatePixelArtIcon.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePixelArtIconInputSchema = z.object({
  prompt: z.string().describe('Una indicación de texto para generar un icono de pixel art. Esto se usará para crear una representación de pixel art visualmente simple.'),
});
export type GeneratePixelArtIconInput = z.infer<typeof GeneratePixelArtIconInputSchema>;

const GeneratePixelArtIconOutputSchema = z.object({
  iconDataUri: z.string().describe("El icono de pixel art generado como un URI de datos. Formato esperado: 'data:image/png;base64,<datos_codificados>'."),
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
    // Construir una indicación más específica para la generación de pixel art
    const imagePrompt = `Genera una imagen pequeña, simple e icónica de estilo pixel art de 4 u 8 bits (por ejemplo, resolución de 32x32 o 64x64 píxeles) adecuada como icono de tarea, basada en el tema: "${input.prompt}". El icono debe ser claro, fácilmente reconocible en tamaños pequeños y usar una paleta de colores limitada característica del pixel art. El fondo debe ser transparente o de un color sólido simple que no distraiga si la transparencia no es soportada directamente por la generación. Evita detalles complejos.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // IMPORTANTE: Modelo específico para generación de imágenes
      prompt: imagePrompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT'], // DEBE proporcionar tanto TEXTO como IMAGEN
      },
    });

    if (!media || !media.url) {
      throw new Error('La generación de imágenes falló o no devolvió una URL de medio.');
    }
    
    // Se espera que media.url sea un URI de datos como 'data:image/png;base64,....'
    return { iconDataUri: media.url };
  }
);
