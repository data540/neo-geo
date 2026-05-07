import { notFound } from "next/navigation";
import { EmptyState } from "@/components/layout/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { CreatePromptDialog } from "@/components/prompts/create-prompt-dialog";
import { PromptsTable } from "@/components/prompts/prompts-table";
import type { LlmOption, PromptTableRow } from "@/components/prompts/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/workspaces";

type PromptsPageProps = {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

type PromptWithLlms = {
  id: string;
  text: string;
  country: string | null;
  status: string | null;
  tags: string[] | null;
  created_at: string | null;
  prompt_llms: { llm_providers: { name: string } | null }[];
};

function normalizePromptStatus(status: string | null): PromptTableRow["status"] {
  if (status === "paused" || status === "archived") {
    return status;
  }

  return "active";
}

export default async function PromptsPage({ params, searchParams }: PromptsPageProps) {
  const { workspace: workspaceSlug } = await params;
  const messages = await searchParams;
  const workspace = await getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: prompts }, { data: llms }] = await Promise.all([
    supabase
      .from("prompts")
      .select("id,text,country,status,tags,created_at,prompt_llms(llm_providers(name))")
      .eq("workspace_id", workspace.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false }),
    supabase
      .from("llm_providers")
      .select("id,name")
      .eq("enabled", true)
      .order("name", { ascending: true }),
  ]);

  const rows: PromptTableRow[] = ((prompts ?? []) as PromptWithLlms[]).map((prompt) => ({
    id: prompt.id,
    text: prompt.text,
    country: prompt.country ?? "ES",
    status: normalizePromptStatus(prompt.status),
    tags: prompt.tags ?? [],
    llmNames: prompt.prompt_llms.flatMap((promptLlm) =>
      promptLlm.llm_providers?.name ? [promptLlm.llm_providers.name] : [],
    ),
    createdAt: prompt.created_at ?? "",
    brandPosition: null,
    sovPct: null,
    sentiment: null,
    brandConsistencyPct: null,
  }));

  const llmOptions: LlmOption[] = (llms ?? []).map((llm) => ({ id: llm.id, name: llm.name }));

  return (
    <PageShell
      eyebrow={`Workspace / ${workspaceSlug}`}
      title="Prompts"
      description="Gestiona las preguntas que neo-geo ejecutara en ChatGPT, Claude, Gemini y Perplexity."
    >
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          {messages.error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {messages.error}
            </p>
          ) : null}
          {messages.message ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm">
              {messages.message}
            </p>
          ) : null}
        </div>
        <CreatePromptDialog
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          llms={llmOptions}
        />
      </div>

      {rows.length > 0 ? (
        <PromptsTable rows={rows} workspaceSlug={workspaceSlug} />
      ) : (
        <EmptyState
          title="Todavia no hay prompts"
          description="Crea tu primer prompt para empezar a medir menciones, posicion, sentimiento y fuentes citadas por LLM."
        />
      )}
    </PageShell>
  );
}
