import { GoogleGenAI } from "@google/genai";
import { dedupeCitations } from "@/lib/llm/citations";
import { calculateCostUsd } from "@/lib/llm/cost";
import { withLlmRetry } from "@/lib/llm/retry";
import type { LlmCitation, LlmRunner } from "@/lib/llm/types";

type GeminiGroundingChunk = {
  web?: {
    uri?: string;
    title?: string;
  };
};

type GeminiResponseLike = {
  text?: string;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
  candidates?: {
    groundingMetadata?: {
      groundingChunks?: GeminiGroundingChunk[];
    };
  }[];
};

function extractGeminiCitations(response: GeminiResponseLike) {
  const citations: LlmCitation[] = [];

  for (const candidate of response.candidates ?? []) {
    for (const chunk of candidate.groundingMetadata?.groundingChunks ?? []) {
      if (chunk.web?.uri) {
        citations.push({ url: chunk.web.uri, title: chunk.web.title });
      }
    }
  }

  return dedupeCitations(citations);
}

export const runGemini: LlmRunner = async ({ prompt, country, language }) => {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  return withLlmRetry(async () => {
    const response = (await client.models.generateContent({
      model: "gemini-3-flash-lite",
      contents: `Pais: ${country}\nIdioma: ${language}\n\n${prompt}`,
      config: { tools: [{ googleSearch: {} }] },
    })) as GeminiResponseLike;

    const tokensIn = response.usageMetadata?.promptTokenCount ?? 0;
    const tokensOut = response.usageMetadata?.candidatesTokenCount ?? 0;

    return {
      text: response.text ?? "",
      citations: extractGeminiCitations(response),
      rawJson: response,
      tokensIn,
      tokensOut,
      costUsd: calculateCostUsd("gemini-3-flash-lite", tokensIn, tokensOut),
    };
  });
};
