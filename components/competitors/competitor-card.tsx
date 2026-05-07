import type { CompetitorCardData } from "./types";

type CompetitorCardProps = {
  competitor: CompetitorCardData;
};

function formatPct(value: number) {
  return `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`;
}

function formatPosition(value: number | null) {
  return value === null ? "--" : `#${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })}`;
}

export function CompetitorCard({ competitor }: CompetitorCardProps) {
  const maxSparkline = Math.max(...competitor.sparkline.map((point) => point.value), 1);

  return (
    <article className="rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
            {competitor.isOwn ? "Marca propia" : "Competidor"}
          </p>
          <h2 className="mt-2 font-semibold text-2xl tracking-tight">{competitor.name}</h2>
          <p className="mt-1 text-muted-foreground text-sm">{competitor.domain ?? "Sin dominio"}</p>
        </div>
        <span className="rounded-full bg-black/5 px-3 py-1 text-xs dark:bg-white/10">
          {formatPct(competitor.sovPct)} SOV
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Mentions</p>
          <p className="mt-1 font-semibold text-xl">
            {competitor.mentions.toLocaleString("es-ES")}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Avg Position</p>
          <p className="mt-1 font-semibold text-xl">{formatPosition(competitor.avgPosition)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Sentiment</p>
          <p className="mt-1 font-semibold text-xl">{competitor.sentimentLabel}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Aliases</p>
          <p className="mt-1 truncate font-semibold text-xl">{competitor.aliases.length}</p>
        </div>
      </div>

      <div className="mt-6 flex h-12 items-end gap-1">
        {competitor.sparkline.map((point) => (
          <div
            className="flex-1 rounded-t bg-foreground/80"
            key={`${competitor.id}-${point.date}`}
            style={{ height: `${Math.max(4, (point.value / maxSparkline) * 100)}%` }}
          />
        ))}
      </div>
      <p className="mt-2 text-muted-foreground text-xs">Sparkline 30d</p>
    </article>
  );
}
