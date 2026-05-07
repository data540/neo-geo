export type SourceDomainRow = {
  domain: string;
  citations: number;
  growthPct: number | null;
  isOwned: boolean;
  lastSeen: string | null;
};

export type SourceDetailPrompt = {
  id: string;
  text: string;
  llmId: string;
  ranAt: string | null;
  url: string;
  title: string | null;
};

export type SourceTrendPoint = {
  date: string;
  citations: number;
};
