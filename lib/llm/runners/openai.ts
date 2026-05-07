import OpenAI from "openai";
import { dedupeCitations } from "@/lib/llm/citations";
import { calculateCostUsd } from "@/lib/llm/cost";
import { withLlmRetry } from "@/lib/llm/retry";
import type { LlmCitation, LlmRunner } from "@/lib/llm/types";

type OpenAIAnnotation = {
  type?: string;
  url?: string;
  title?: string;
  url_citation?: {
    url?: string;
    title?: string;
  };
};

type OpenAIOutputItem = {
  content?: { text?: string; annotations?: OpenAIAnnotation[] }[];
};

function extractOpenAICitations(response: unknown) {
  const output =
    typeof response === "object" && response !== null && "output" in response
      ? response.output
      : [];
  const items = Array.isArray(output) ? (output as OpenAIOutputItem[]) : [];
  const citations: LlmCitation[] = [];

  for (const item of items) {
    for (const content of item.content ?? []) {
      for (const annotation of content.annotations ?? []) {
        const citation = annotation.url_citation;
        const url = citation?.url ?? annotation.url;

        if (url) {
          citations.push({ url, title: citation?.title ?? annotation.title });
        }
      }
    }
  }

  return dedupeCitations(citations);
}

export const runOpenAI: LlmRunner = async ({ prompt, country, language }) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  return withLlmRetry(async () => {
    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: `Pais: ${country}\nIdioma: ${language}\n\n${prompt}`,
      tools: [{ type: "web_search" }],
    });

    const tokensIn = response.usage?.input_tokens ?? 0;
    const tokensOut = response.usage?.output_tokens ?? 0;

    return {
      text: response.output_text ?? "",
      citations: extractOpenAICitations(response),
      rawJson: response,
      tokensIn,
      tokensOut,
      costUsd: calculateCostUsd("openai-gpt-5", tokensIn, tokensOut),
    };
  });
};
