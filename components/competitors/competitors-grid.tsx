import { CompetitorCard } from "./competitor-card";
import type { CompetitorCardData } from "./types";

type CompetitorsGridProps = {
  competitors: CompetitorCardData[];
};

export function CompetitorsGrid({ competitors }: CompetitorsGridProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {competitors.map((competitor) => (
        <CompetitorCard competitor={competitor} key={competitor.id} />
      ))}
    </div>
  );
}
