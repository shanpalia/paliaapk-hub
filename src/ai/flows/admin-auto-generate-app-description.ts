'use server';
/**
 * @fileOverview A professional Genkit flow for generating structured, SEO-optimized app descriptions.
 *
 * - adminAutoGenerateAppDescription - Generates detailed hub metadata.
 * - AdminAutoGenerateAppDescriptionInput - Input parameters.
 * - AdminAutoGenerateAppDescriptionOutput - Detailed structured output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminAutoGenerateAppDescriptionInputSchema = z.object({
  appName: z.string().describe('The name of the application.'),
  appVersion: z.string().describe('The version number of the application.'),
  category: z.string().describe('The category of the application.'),
  developer: z.string().describe('The name of the developer or organization.'),
  keywords: z.string().optional().describe('Comma-separated keywords to influence SEO.'),
});
export type AdminAutoGenerateAppDescriptionInput = z.infer<
  typeof AdminAutoGenerateAppDescriptionInputSchema
>;

const AdminAutoGenerateAppDescriptionOutputSchema = z.object({
  fullDescription:
    z.string().describe('The complete, formatted hub description including highlights, features, and installation info.'),
  seoSummary:
    z.string().describe('A 160-character SEO meta-description.'),
  versionChangelog:
    z.string().describe('A detailed changelog for the version.'),
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
  prompt: `You are an elite app store copywriter and SEO specialist for PaliaAPK Hub.
Generate a professional, high-converting description for:

App: {{{appName}}}
Version: {{{appVersion}}}
Category: {{{category}}}
Developer: {{{developer}}}
{{#if keywords}}Target Keywords: {{{keywords}}}{{/if}}

---

**Output Requirements:**

1. **fullDescription**: A comprehensive hub description formatted with HTML/Markdown.
   - **Opening**: A compelling hook about the app's value proposition.
   - **Highlights Section**: 3-5 key unique selling points.
   - **Features List**: A detailed bulleted list of core functionalities.
   - **Installation Guide**: Clear steps for installing the APK on Android.
   - **Technical Information**: Mention version {{{appVersion}}} and minimum requirements.

2. **seoSummary**: A punchy, SEO-optimized summary under 160 characters.

3. **versionChangelog**: A professional "What's New" section for version {{{appVersion}}}.

Style: Professional, trustworthy, and technically precise. Avoid marketing fluff; focus on utility and security.`,
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
