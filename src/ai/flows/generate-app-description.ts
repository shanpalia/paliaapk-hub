'use server';
/**
 * @fileOverview An AI agent that generates professional app descriptions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDescriptionInputSchema = z.object({
  appName: z.string().describe('The name of the application.'),
  version: z.string().describe('The version of the application.'),
  category: z.string().describe('The category of the application.'),
});
export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;

const GenerateDescriptionOutputSchema = z.object({
  description: z.string().describe('A professional app store description.'),
});
export type GenerateDescriptionOutput = z.infer<typeof GenerateDescriptionOutputSchema>;

export async function generateAppDescription(input: GenerateDescriptionInput): Promise<GenerateDescriptionOutput> {
  return generateDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDescriptionPrompt',
  input: {schema: GenerateDescriptionInputSchema},
  output: {schema: GenerateDescriptionOutputSchema},
  prompt: `You are a professional copywriter for a mobile app store.
Generate a compelling, professional, and concise description for the following app:

App Name: {{{appName}}}
Version: {{{version}}}
Category: {{{category}}}

The description should highlight key features and benefits, encouraging users to download it. Avoid jargon and keep it under 100 words.`,
});

const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
