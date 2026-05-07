type TopSource = {
  domain: string;
  citations: number;
};

type TopSourcesProps = {
  sources: TopSource[];
};

export function TopSources({ sources }: TopSourcesProps) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
      <h2 className="font-semibold text-xl tracking-tight">Top sources</h2>
      <div className="mt-4 space-y-3">
        {sources.length > 0 ? (
          sources.map((source) => (
            <div className="flex items-center justify-between gap-4 text-sm" key={source.domain}>
              <span className="truncate font-medium">{source.domain}</span>
              <span className="text-muted-foreground">
                {source.citations.toLocaleString("es-ES")} citas
              </span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">Aun no hay fuentes citadas.</p>
        )}
      </div>
    </section>
  );
}
