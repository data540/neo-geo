export type LlmOption = {
  id: string;
  name: string;
};

export type PromptTableRow = {
  id: string;
  text: string;
  country: string;
  status: "active" | "paused" | "archived";
  tags: string[];
  llmNames: string[];
  createdAt: string;
  brandPosition: number | null;
  sovPct: number | null;
  sentiment: "positive" | "neutral" | "negative" | null;
  brandConsistencyPct: number | null;
};
