import OpenAI from "openai";
import { dedupeCitations } from "@/lib/llm/citations";
import { calculateCostUsd } from "@/lib/llm/cost";
import { withLlmRetry } from "@/lib/llm/retry";
import type { LlmCitation, LlmRunner } from "@/lib/llm/types";

type PerplexityResponse = OpenAI.Chat.Completions.ChatCompletion & {
  search_results?: { url?: string; title?: string }[];
};

function extractPerplexityCitations(response: PerplexityResponse) {
  const citations: LlmCitation[] = [];

  for (const result of response.search_results ?? []) {
    if (result.url) {
      citations.push({ url: result.url, title: result.title });
    }
  }

  return dedupeCitations(citations);
}

export const runPerplexity: LlmRunner = async ({ prompt, country, language }) => {
  const client = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: "https://api.perplexity.ai",
  });

  return withLlmRetry(async () => {
    const response = (await client.chat.completions.create({
      model: "sonar-pro",
      messages: [
        {
          role: "user",
          content: `Pais: ${country}\nIdioma: ${language}\n\n${prompt}`,
        },
      ],
    })) as PerplexityResponse;

    const tokensIn = response.usage?.prompt_tokens ?? 0;
    const tokensOut = response.usage?.completion_tokens ?? 0;

    return {
      text: response.choices[0]?.message.content ?? "",
      citations: extractPerplexityCitations(response),
      rawJson: response,
      tokensIn,
      tokensOut,
      costUsd: calculateCostUsd("perplexity-sonar-pro", tokensIn, tokensOut),
    };
  });
};
