import type { SourceDetailPrompt, SourceTrendPoint } from "./types";

type SourceDetailPanelProps = {
  domain: string | null;
  prompts: SourceDetailPrompt[];
  trend: SourceTrendPoint[];
};

export function SourceDetailPanel({ domain, prompts, trend }: SourceDetailPanelProps) {
  if (!domain) {
    return (
      <aside className="rounded-3xl border border-dashed border-black/15 p-6 text-muted-foreground dark:border-white/15">
        Selecciona un dominio para ver prompts, ejemplos de citaciones y evolucion temporal.
      </aside>
    );
  }

  const maxCitations = Math.max(...trend.map((point) => point.citations), 1);

  return (
    <aside className="rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
      <div>
        <p className="text-muted-foreground text-sm">Dominio seleccionado</p>
        <h2 className="mt-1 break-all font-semibold text-2xl tracking-tight">{domain}</h2>
      </div>

      <section className="mt-6">
        <h3 className="font-semibold">Evolucion temporal</h3>
        <div className="mt-3 flex h-28 items-end gap-1">
          {trend.map((point) => (
            <div className="flex flex-1 flex-col items-center gap-2" key={point.date}>
              <div
                className="w-full rounded-t bg-foreground/80"
                style={{ height: `${Math.max(4, (point.citations / maxCitations) * 100)}%` }}
                title={`${point.date}: ${point.citations}`}
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-muted-foreground text-xs">Ultimos 14 dias</p>
      </section>

      <section className="mt-6">
        <h3 className="font-semibold">Prompts donde se cita</h3>
        <div className="mt-3 space-y-4">
          {prompts.length > 0 ? (
            prompts.map((prompt) => (
              <article
                className="border-black/5 border-b pb-4 last:border-0 dark:border-white/10"
                key={prompt.id}
              >
                <p className="font-medium text-sm leading-6">{prompt.text}</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {prompt.llmId} · {prompt.ranAt ?? "Sin fecha"}
                </p>
                <a
                  className="mt-2 block truncate text-muted-foreground text-xs hover:text-foreground"
                  href={prompt.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {prompt.title || prompt.url}
                </a>
              </article>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No hay ejemplos para este dominio.</p>
          )}
        </div>
      </section>
    </aside>
  );
}
