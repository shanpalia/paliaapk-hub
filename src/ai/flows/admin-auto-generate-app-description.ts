'use server';
/**
 * @fileOverview A professional Genkit flow for generating structured, SEO-optimized app descriptions.
 * Includes robust error mapping and health diagnostics for administrative terminals.
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
    z.string().describe('The complete, formatted hub description including highlights and features.'),
  seoSummary:
    z.string().describe('A 160-character SEO meta-description.'),
  versionChangelog:
    z.string().describe('A detailed changelog for the version.'),
});
export type AdminAutoGenerateAppDescriptionOutput = z.infer<
  typeof AdminAutoGenerateAppDescriptionOutputSchema
>;

/**
 * Validates the API connection status.
 */
export async function checkAiHealth(): Promise<{ status: 'connected' | 'invalid_key' | 'quota_exceeded' | 'unavailable'; message: string }> {
  try {
    const healthPrompt = ai.definePrompt({
      name: 'healthCheck',
      input: { schema: z.void() },
      prompt: 'Respond with "ok"',
    });
    await healthPrompt();
    return { status: 'connected', message: 'Intelligence Node: ONLINE' };
  } catch (error: any) {
    const msg = error.message || '';
    if (msg.includes('401') || msg.includes('API key')) return { status: 'invalid_key', message: 'Protocol Error: Invalid Credentials' };
    if (msg.includes('429')) return { status: 'quota_exceeded', message: 'Traffic Error: Quota Exceeded' };
    return { status: 'unavailable', message: 'Network Error: Service Unreachable' };
  }
}

/**
 * Server-side function to generate optimized hub content.
 */
export async function adminAutoGenerateAppDescription(
  input: AdminAutoGenerateAppDescriptionInput
): Promise<AdminAutoGenerateAppDescriptionOutput> {
  try {
    const {output} = await prompt(input);
    if (!output) throw new Error("AI failed to generate content.");
    return output;
  } catch (error: any) {
    console.group("AI Distribution Fault Trace");
    console.error("Context:", input);
    console.error("Error Detail:", error.message || error);
    console.groupEnd();
    
    // Pass specific error messages up to the terminal
    const msg = error.message || '';
    if (msg.includes('401')) throw new Error("AUTH_FAULT: Invalid API Key.");
    if (msg.includes('429')) throw new Error("QUOTA_FAULT: API rate limit reached.");
    
    throw new Error("AI service temporarily unavailable.");
  }
}

const prompt = ai.definePrompt({
  name: 'adminAutoGenerateAppDescriptionPrompt',
  input: {schema: AdminAutoGenerateAppDescriptionInputSchema},
  output: {schema: AdminAutoGenerateAppDescriptionOutputSchema},
  prompt: `You are an elite app store copywriter for PaliaAPK Hub.
Generate a professional, high-converting description for:

App: {{{appName}}}
Version: {{{appVersion}}}
Category: {{{category}}}
Developer: {{{developer}}}
{{#if keywords}}Target Keywords: {{{keywords}}}{{/if}}

---

**Output Requirements:**

1. **fullDescription**: A comprehensive overview and features list.
   - Start with a compelling hook.
   - Include a "Core Features" section with bullet points.
   - Include a "Installation Protocol" section for APK side-loading.

2. **seoSummary**: A punchy, SEO-optimized summary under 160 characters.

3. **versionChangelog**: A professional "What's New" section for version {{{appVersion}}}.

Style: Professional, trustworthy, and technical.`,
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
