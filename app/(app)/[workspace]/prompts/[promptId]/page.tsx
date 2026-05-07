import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { RunPromptButton } from "@/components/prompts/run-prompt-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/workspaces";

type PromptDetailPageProps = {
  params: Promise<{ workspace: string; promptId: string }>;
};

type PromptRunWithResponse = {
  id: string;
  llm_id: string;
  ran_at: string | null;
  status: string;
  cost_usd: number | null;
  latency_ms: number | null;
  error: string | null;
  responses: { raw_text: string } | null;
};

export default async function PromptDetailPage({ params }: PromptDetailPageProps) {
  const { workspace: workspaceSlug, promptId } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: prompt }, { data: runs }] = await Promise.all([
    supabase
      .from("prompts")
      .select("id,text,country,status,tags")
      .eq("id", promptId)
      .eq("workspace_id", workspace.id)
      .single(),
    supabase
      .from("prompt_runs")
      .select("id,llm_id,ran_at,status,cost_usd,latency_ms,error,responses(raw_text)")
      .eq("prompt_id", promptId)
      .order("ran_at", { ascending: false }),
  ]);

  if (!prompt) {
    notFound();
  }

  const typedRuns = (runs ?? []) as PromptRunWithResponse[];

  return (
    <PageShell
      eyebrow={`Workspace / ${workspaceSlug}`}
      title="Detalle del prompt"
      description="Ejecuta manualmente el prompt y revisa la respuesta cruda guardada por cada LLM."
    >
      <div className="mb-6">
        <RunPromptButton promptId={prompt.id} />
      </div>

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

      <section className="mt-6 space-y-4">
        <h2 className="font-semibold text-xl tracking-tight">Respuestas por LLM</h2>
        {typedRuns.length > 0 ? (
          typedRuns.map((run) => (
            <article
              className="rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950"
              key={run.id}
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold">{run.llm_id}</h3>
                  <p className="text-muted-foreground text-sm">
                    {run.status} · {run.latency_ms ?? "--"} ms · $
                    {(run.cost_usd ?? 0).toLocaleString("es-ES", { maximumFractionDigits: 4 })}
                  </p>
                </div>
                <p className="text-muted-foreground text-sm">{run.ran_at ?? "Sin fecha"}</p>
              </div>
              {run.error ? <p className="mt-4 text-red-600 text-sm">{run.error}</p> : null}
              {run.responses?.raw_text ? (
                <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl bg-black/[0.03] p-4 text-sm leading-6 dark:bg-white/[0.06]">
                  {run.responses.raw_text}
                </pre>
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-black/15 p-8 text-muted-foreground dark:border-white/15">
            Todavia no hay ejecuciones para este prompt.
          </div>
        )}
      </section>
    </PageShell>
  );
}
