export type CompetitorCardData = {
  id: string;
  name: string;
  domain: string | null;
  aliases: string[];
  mentions: number;
  sovPct: number;
  avgPosition: number | null;
  avgSentiment: number | null;
  sentimentLabel: string;
  sparkline: { date: string; value: number }[];
  isOwn: boolean;
};

export type CompetitorSovPoint = {
  date: string;
  [brandName: string]: string | number;
};
