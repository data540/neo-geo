import { EmptyState } from "@/components/layout/empty-state";
import { PageShell } from "@/components/layout/page-shell";

type SourcesPageProps = {
  params: Promise<{ workspace: string }>;
};

export default async function SourcesPage({ params }: SourcesPageProps) {
  const { workspace } = await params;

  return (
    <PageShell
      eyebrow={`Workspace / ${workspace}`}
      title="Sources"
      description="Analiza dominios citados por los LLMs y separa fuentes propias de terceros."
    >
      <EmptyState
        title="Sin fuentes citadas"
        description="Las fuentes apareceran cuando integremos runners LLM y guardemos citaciones nativas por ejecucion."
      />
    </PageShell>
  );
}
