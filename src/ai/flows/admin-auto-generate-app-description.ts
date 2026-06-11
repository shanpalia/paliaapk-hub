'use server';
/**
 * @fileOverview A Genkit flow for administrators to automatically generate app descriptions and version changelogs.
 *
 * - adminAutoGenerateAppDescription - A function to trigger the AI-powered generation of app details.
 * - AdminAutoGenerateAppDescriptionInput - The input type for the generation function.
 * - AdminAutoGenerateAppDescriptionOutput - The return type for the generation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminAutoGenerateAppDescriptionInputSchema = z.object({
  appName: z.string().describe('The name of the application.'),
  appVersion: z.string().describe('The version number of the application.'),
  featureSummary:
    z.string().describe('A brief summary of the key features and updates for this app version.'),
});
export type AdminAutoGenerateAppDescriptionInput = z.infer<
  typeof AdminAutoGenerateAppDescriptionInputSchema
>;

const AdminAutoGenerateAppDescriptionOutputSchema = z.object({
  appDescription:
    z.string().describe('A comprehensive, engaging, and SEO-friendly app description.'),
  versionChangelog:
    z.string()
      .describe(
        'A detailed changelog for the specified app version, highlighting new features, improvements, and bug fixes.'
      ),
});
export type AdminAutoGenerateAppDescriptionOutput = z.infer<
  typeof AdminAutoGenerateAppDescriptionOutputSchema
>;

export async function adminAutoGenerateAppDescription(
  input: AdminAutoGenerateAppDescriptionInput
): Promise<AdminAutoGenerateAppDescriptionOutput> {
  return adminAutoGenerateAppDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminAutoGenerateAppDescriptionPrompt',
  input: {schema: AdminAutoGenerateAppDescriptionInputSchema},
  output: {schema: AdminAutoGenerateAppDescriptionOutputSchema},
  prompt: `You are an expert app content writer, skilled in creating compelling app descriptions and clear, detailed version changelogs for app stores. Your goal is to help an admin efficiently populate app details.

Based on the following information, generate a comprehensive app description and a detailed version changelog.

App Name: {{{appName}}}
App Version: {{{appVersion}}}
Feature Summary: {{{featureSummary}}}

---

**App Description Guidelines:**
- Be engaging and highlight the app's core value proposition.
- Include keywords relevant to the app's functionality.
- Structure with clear paragraphs and potentially bullet points for readability.
- Explain what the app does, who it's for, and why users should download it.
- Keep it concise but informative, aiming for 200-400 words.

**Version Changelog Guidelines (for version {{{appVersion}}}):**
- List new features, improvements, and bug fixes introduced in this version.
- Use clear, action-oriented language.
- Format as a bulleted list.
- Be specific about changes where possible, based on the feature summary.
- The changelog should only cover the specific version provided.

Ensure the output is in JSON format as per the specified schema for 'appDescription' and 'versionChangelog'.`,
});

const adminAutoGenerateAppDescriptionFlow = ai.defineFlow(
  {
    name: 'adminAutoGenerateAppDescriptionFlow',
    inputSchema: AdminAutoGenerateAppDescriptionInputSchema,
    outputSchema: AdminAutoGenerateAppDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
