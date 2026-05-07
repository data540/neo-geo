import { EmptyState } from "@/components/layout/empty-state";
import { PageShell } from "@/components/layout/page-shell";

type PromptsPageProps = {
  params: Promise<{ workspace: string }>;
};

export default async function PromptsPage({ params }: PromptsPageProps) {
  const { workspace } = await params;

  return (
    <PageShell
      eyebrow={`Workspace / ${workspace}`}
      title="Prompts"
      description="Gestiona las preguntas que neo-geo ejecutara en ChatGPT, Claude, Gemini y Perplexity."
    >
      <EmptyState
        title="Todavia no hay prompts"
        description="En el PR 4 anadiremos el CRUD, filtros por estado y tags, y el dialogo para crear prompts."
      />
    </PageShell>
  );
}
