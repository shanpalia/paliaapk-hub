'use server';
/**
 * @fileOverview An AI agent that summarizes app descriptions into concise, feature-rich bullet points.
 *
 * - summarizeAppDescription - A function that handles the app description summarization process.
 * - AppDescriptionSummarizationInput - The input type for the summarizeAppDescription function.
 * - AppDescriptionSummarizationOutput - The return type for the summarizeAppDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AppDescriptionSummarizationInputSchema = z.object({
  appDescription: z
    .string()
    .describe('The long description of the app to be summarized.'),
});
export type AppDescriptionSummarizationInput = z.infer<
  typeof AppDescriptionSummarizationInputSchema
>;

const AppDescriptionSummarizationOutputSchema = z.object({
  summary: z.string().describe('A concise, bullet-point summary of the app.'),
});
export type AppDescriptionSummarizationOutput = z.infer<
  typeof AppDescriptionSummarizationOutputSchema
>;

export async function summarizeAppDescription(
  input: AppDescriptionSummarizationInput
): Promise<AppDescriptionSummarizationOutput> {
  return appDescriptionSummarizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'appDescriptionSummarizationPrompt',
  input: {schema: AppDescriptionSummarizationInputSchema},
  output: {schema: AppDescriptionSummarizationOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing app descriptions.
Your goal is to extract the key features and benefits from the provided app description and present them as a concise, bullet-point summary.

App Description: {{{appDescription}}}

Generate the summary in bullet points, focusing on what the app does and its main advantages.`,
});

const appDescriptionSummarizationFlow = ai.defineFlow(
  {
    name: 'appDescriptionSummarizationFlow',
    inputSchema: AppDescriptionSummarizationInputSchema,
    outputSchema: AppDescriptionSummarizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
