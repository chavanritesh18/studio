'use server';
/**
 * @fileOverview An ingredient identification AI agent.
 *
 * - identifyIngredients - A function that handles the ingredient identification process.
 * - IdentifyIngredientsInput - The input type for the identifyIngredients function.
 * - IdentifyIngredientsOutput - The return type for the identifyIngredients function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IdentifyIngredientsInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the ingredients photo.'),
});
export type IdentifyIngredientsInput = z.infer<typeof IdentifyIngredientsInputSchema>;

const IdentifyIngredientsOutputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients identified in the photo.'),
});
export type IdentifyIngredientsOutput = z.infer<typeof IdentifyIngredientsOutputSchema>;

export async function identifyIngredients(input: IdentifyIngredientsInput): Promise<IdentifyIngredientsOutput> {
  return identifyIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyIngredientsPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the ingredients photo.'),
    }),
  },
  output: {
    schema: z.object({
      ingredients: z.array(z.string()).describe('A list of ingredients identified in the photo.'),
    }),
  },
  prompt: `You are an expert chef specializing in ingredient identification.

You will use the photo to identify the ingredients and return a list of ingredients.

Ingredients Photo: {{media url=photoUrl}}`,
});

const identifyIngredientsFlow = ai.defineFlow<
  typeof IdentifyIngredientsInputSchema,
  typeof IdentifyIngredientsOutputSchema
>({
  name: 'identifyIngredientsFlow',
  inputSchema: IdentifyIngredientsInputSchema,
  outputSchema: IdentifyIngredientsOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
}
);
