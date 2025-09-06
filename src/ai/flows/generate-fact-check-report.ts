'use server';
/**
 * @fileOverview Fact-check report generation flow.
 *
 * - generateFactCheckReport - Generates a fact-check report for a given claim.
 * - GenerateFactCheckReportInput - The input type for the generateFactCheckReport function.
 * - GenerateFactCheckReportOutput - The return type for the generateFactCheckReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFactCheckReportInputSchema = z.object({
  title: z.string().describe('The title of the claim.'),
  statement: z.string().describe('The full statement of the claim to be fact-checked.'),
  category: z.string().describe('The category of the claim (e.g., politics, science, health).'),
  sourceUrl: z.string().url().optional().describe('Optional URL providing additional context for the claim.'),
});
export type GenerateFactCheckReportInput = z.infer<typeof GenerateFactCheckReportInputSchema>;

const GenerateFactCheckReportOutputSchema = z.object({
  truthScore: z.number().describe('A numerical score (0-100) representing the truthfulness of the claim.'),
  verdict: z.string().describe('A concise verdict on the claim (e.g., True, False, Mostly True, Mostly False, Misleading).'),
  supportingSources: z.array(z.string()).describe('A list of URLs or references to credible sources supporting the verdict.'),
});
export type GenerateFactCheckReportOutput = z.infer<typeof GenerateFactCheckReportOutputSchema>;

export async function generateFactCheckReport(input: GenerateFactCheckReportInput): Promise<GenerateFactCheckReportOutput> {
  return generateFactCheckReportFlow(input);
}

const generateFactCheckReportPrompt = ai.definePrompt({
  name: 'generateFactCheckReportPrompt',
  input: {schema: GenerateFactCheckReportInputSchema},
  output: {schema: GenerateFactCheckReportOutputSchema},
  prompt: `You are an expert fact-checker. Analyze the following claim and generate a fact-check report.

Claim Title: {{{title}}}
Claim Statement: {{{statement}}}
Category: {{{category}}}
Source URL (if provided): {{{sourceUrl}}}

Based on your analysis, provide the following:

- TruthScore: A numerical score (0-100) representing the truthfulness of the claim. 100 means completely true and 0 means completely false.
- Verdict: A concise verdict on the claim (e.g., True, False, Mostly True, Mostly False, Misleading).
- SupportingSources: A list of URLs or references to credible sources supporting the verdict. Be very careful about which sources to trust. If no sources are found, you MUST return an empty array [].

Your response MUST be a valid JSON object that strictly adheres to the defined schema. Do not include any extra text or explanations outside of the JSON structure.`,
});

const generateFactCheckReportFlow = ai.defineFlow(
  {
    name: 'generateFactCheckReportFlow',
    inputSchema: GenerateFactCheckReportInputSchema,
    outputSchema: GenerateFactCheckReportOutputSchema,
  },
  async input => {
    const {output} = await generateFactCheckReportPrompt(input);
    if (!output) {
      throw new Error("The AI model failed to produce a valid report. Please try again.");
    }
    return output;
  }
);
