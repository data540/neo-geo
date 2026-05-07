import Anthropic from "@anthropic-ai/sdk";
import { dedupeCitations } from "@/lib/llm/citations";
import { calculateCostUsd } from "@/lib/llm/cost";
import { withLlmRetry } from "@/lib/llm/retry";
import type { LlmCitation, LlmRunner } from "@/lib/llm/types";

type AnthropicContentBlock = {
  type: string;
  text?: string;
  citations?: { url?: string; title?: string }[];
};

function extractAnthropicText(content: AnthropicContentBlock[]) {
  return content
    .filter((block) => block.type === "text" && block.text)
    .map((block) => block.text)
    .join("\n");
}

function extractAnthropicCitations(content: AnthropicContentBlock[]) {
  const citations: LlmCitation[] = [];

  for (const block of content) {
    for (const citation of block.citations ?? []) {
      if (citation.url) {
        citations.push({ url: citation.url, title: citation.title });
      }
    }
  }

  return dedupeCitations(citations);
}

export const runAnthropic: LlmRunner = async ({ prompt, country, language }) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  return withLlmRetry(async () => {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1600,
      messages: [
        {
          role: "user",
          content: `Pais: ${country}\nIdioma: ${language}\n\n${prompt}`,
        },
      ],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    });

    const content = response.content as AnthropicContentBlock[];
    const tokensIn = response.usage.input_tokens ?? 0;
    const tokensOut = response.usage.output_tokens ?? 0;

    return {
      text: extractAnthropicText(content),
      citations: extractAnthropicCitations(content),
      rawJson: response,
      tokensIn,
      tokensOut,
      costUsd: calculateCostUsd("anthropic-haiku-4-5", tokensIn, tokensOut),
    };
  });
};
