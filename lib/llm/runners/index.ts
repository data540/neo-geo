import type { LlmRunner, SupportedLlmId } from "../types";
import { runAnthropic } from "./anthropic";
import { runGemini } from "./gemini";
import { runOpenAI } from "./openai";
import { runPerplexity } from "./perplexity";

export const llmRunners: Record<SupportedLlmId, LlmRunner> = {
  "openai-gpt-5": runOpenAI,
  "anthropic-haiku-4-5": runAnthropic,
  "gemini-3-flash-lite": runGemini,
  "perplexity-sonar-pro": runPerplexity,
};

export function getLlmRunner(llmId: string) {
  return llmRunners[llmId as SupportedLlmId] ?? null;
}
