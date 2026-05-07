import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/workspaces";

type PromptDetailPageProps = {
  params: Promise<{ workspace: string; promptId: string }>;
};

export default async function PromptDetailPage({ params }: PromptDetailPageProps) {
  const { workspace: workspaceSlug, promptId } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const { data: prompt } = await supabase
    .from("prompts")
    .select("id,text,country,status,tags")
    .eq("id", promptId)
    .eq("workspace_id", workspace.id)
    .single();

  if (!prompt) {
    notFound();
  }

  return (
    <PageShell
      eyebrow={`Workspace / ${workspaceSlug}`}
      title="Detalle del prompt"
      description="El drawer con respuestas completas, marcas detectadas y sources se conectara en PR 5 tras runners LLM."
    >
      <article className="rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
        <p className="text-muted-foreground text-sm">Prompt</p>
        <h2 className="mt-2 font-semibold text-2xl tracking-tight">{prompt.text}</h2>
        <dl className="mt-6 grid gap-4 text-sm md:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Pais</dt>
            <dd className="mt-1 font-medium">{prompt.country}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Estado</dt>
            <dd className="mt-1 font-medium">{prompt.status}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tags</dt>
            <dd className="mt-1 font-medium">{prompt.tags?.join(", ") || "--"}</dd>
          </div>
        </dl>
      </article>
    </PageShell>
  );
}
