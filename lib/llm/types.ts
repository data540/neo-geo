export type LlmCitation = {
  url: string;
  title?: string;
};

export type LlmRunResult = {
  text: string;
  citations: LlmCitation[];
  rawJson: unknown;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
};

export type LlmRunnerParams = {
  prompt: string;
  country: string;
  language: string;
};

export type LlmRunner = (params: LlmRunnerParams) => Promise<LlmRunResult>;

export type SupportedLlmId =
  | "openai-gpt-5"
  | "anthropic-haiku-4-5"
  | "gemini-3-flash-lite"
  | "perplexity-sonar-pro";
