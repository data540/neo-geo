const providerCosts: Record<string, { input: number; output: number }> = {
  "openai-gpt-5": { input: 1.25, output: 10 },
  "anthropic-haiku-4-5": { input: 1, output: 5 },
  "gemini-3-flash-lite": { input: 0.1, output: 0.4 },
  "perplexity-sonar-pro": { input: 3, output: 15 },
};

export function calculateCostUsd(llmId: string, tokensIn: number, tokensOut: number) {
  const cost = providerCosts[llmId];

  if (!cost) {
    return 0;
  }

  return (tokensIn / 1_000_000) * cost.input + (tokensOut / 1_000_000) * cost.output;
}
