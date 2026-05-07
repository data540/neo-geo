import { EmptyState } from "@/components/layout/empty-state";
import { PageShell } from "@/components/layout/page-shell";

type DashboardPageProps = {
  params: Promise<{ workspace: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { workspace } = await params;

  return (
    <PageShell
      eyebrow={`Workspace / ${workspace}`}
      title="Dashboard"
      description="Resumen ejecutivo de visibilidad de marca. Los KPIs reales se conectaran cuando existan ejecuciones de prompts."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["Brand Mentions", "Avg Position", "Brand Consistency", "Share of Voice"].map((label) => (
          <article
            className="rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950"
            key={label}
          >
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="mt-3 font-semibold text-3xl">--</p>
          </article>
        ))}
      </div>
      <div className="mt-6">
        <EmptyState
          title="Sin datos todavia"
          description="Cuando ejecutes prompts contra LLMs, aqui veras tendencias, fuentes principales y menciones recientes."
        />
      </div>
    </PageShell>
  );
}
