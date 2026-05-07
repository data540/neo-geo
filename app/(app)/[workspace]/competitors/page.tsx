import { EmptyState } from "@/components/layout/empty-state";
import { PageShell } from "@/components/layout/page-shell";

type CompetitorsPageProps = {
  params: Promise<{ workspace: string }>;
};

export default async function CompetitorsPage({ params }: CompetitorsPageProps) {
  const { workspace } = await params;

  return (
    <PageShell
      eyebrow={`Workspace / ${workspace}`}
      title="Competidores"
      description="Compara menciones, SOV, posicion media y sentimiento frente a otras marcas."
    >
      <EmptyState
        title="Sin competidores configurados"
        description="En el PR 10 anadiremos el grid de marcas competidoras y comparativas de Share of Voice."
      />
    </PageShell>
  );
}
