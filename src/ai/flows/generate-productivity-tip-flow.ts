
'use server';
/**
 * @fileOverview Genera un consejo de productividad basado en la entrada del usuario.
 *
 * - generateProductivityTip - Una función para generar un consejo de productividad.
 * - GenerateProductivityTipInput - El tipo de entrada para la función generateProductivityTip.
 * - GenerateProductivityTipOutput - El tipo de retorno para la función generateProductivityTip.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateProductivityTipInputSchema = z.object({
  userInput: z.string().describe('La tarea actual del usuario, su estado de ánimo o el desafío de productividad que enfrenta. Por ejemplo: "Necesito terminar un informe", "Me siento desmotivado", "Procrastinando en un proyecto grande".'),
});
export type GenerateProductivityTipInput = z.infer<typeof GenerateProductivityTipInputSchema>;

const GenerateProductivityTipOutputSchema = z.object({
  tip: z.string().describe('Un consejo de productividad corto, procesable y motivador. Debe ser conciso y alentador.'),
});
export type GenerateProductivityTipOutput = z.infer<typeof GenerateProductivityTipOutputSchema>;

export async function generateProductivityTip(input: GenerateProductivityTipInput): Promise<GenerateProductivityTipOutput> {
  return productivityTipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productivityTipPrompt',
  input: {schema: GenerateProductivityTipInputSchema},
  output: {schema: GenerateProductivityTipOutputSchema},
  prompt: `Eres un coach de productividad amigable y alentador con un amor por el pixel art y los juegos retro.
Dada la tarea o el sentimiento actual de un usuario, proporciona un consejo de productividad breve, procesable y motivador.
Mantenlo conciso (1-2 frases), como una pista útil en un juego.

Situación del usuario: {{{userInput}}}

Proporciona solo el consejo.`,
});

const productivityTipFlow = ai.defineFlow(
  {
    name: 'productivityTipFlow',
    inputSchema: GenerateProductivityTipInputSchema,
    outputSchema: GenerateProductivityTipOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('No se pudo generar un consejo de productividad.');
    }
    return output;
  }
);
