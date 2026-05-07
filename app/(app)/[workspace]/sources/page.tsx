import { notFound } from "next/navigation";
import { EmptyState } from "@/components/layout/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { SourceDetailPanel } from "@/components/sources/source-detail-panel";
import { SourcesTable } from "@/components/sources/sources-table";
import type {
  SourceDetailPrompt,
  SourceDomainRow,
  SourceTrendPoint,
} from "@/components/sources/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/workspaces";

type SourcesPageProps = {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ domain?: string }>;
};

type WorkspaceData = {
  domain: string | null;
};

type SourceWithRun = {
  id: string;
  domain: string;
  url: string;
  title: string | null;
  is_owned: boolean | null;
  prompt_runs: {
    llm_id: string;
    ran_at: string | null;
    prompts: {
      id: string;
      text: string;
    } | null;
  } | null;
};

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function toDateKey(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10);
}

function calculateGrowth(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

function isOwnedDomain(source: SourceWithRun, workspaceDomain: string | null) {
  if (source.is_owned) {
    return true;
  }

  if (!workspaceDomain) {
    return false;
  }

  return source.domain === workspaceDomain.replace(/^www\./, "");
}

function buildTrend(sources: SourceWithRun[], domain: string): SourceTrendPoint[] {
  const points: SourceTrendPoint[] = [];

  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = dateDaysAgo(offset);
    const key = toDateKey(date);
    points.push({
      date: key,
      citations: sources.filter(
        (source) =>
          source.domain === domain &&
          source.prompt_runs?.ran_at &&
          toDateKey(source.prompt_runs.ran_at) === key,
      ).length,
    });
  }

  return points;
}

export default async function SourcesPage({ params, searchParams }: SourcesPageProps) {
  const { workspace: workspaceSlug } = await params;
  const { domain: selectedDomain } = await searchParams;
  const workspace = await getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: prompts }, { data: workspaceData }] = await Promise.all([
    supabase.from("prompts").select("id").eq("workspace_id", workspace.id),
    supabase.from("workspaces").select("domain").eq("id", workspace.id).single(),
  ]);
  const promptIds = (prompts ?? []).map((prompt) => prompt.id);

  if (promptIds.length === 0) {
    return (
      <PageShell
        eyebrow={`Workspace / ${workspaceSlug}`}
        title="Sources"
        description="Analiza dominios citados por los LLMs y separa fuentes propias de terceros."
      >
        <EmptyState
          title="Sin prompts todavia"
          description="Crea y ejecuta prompts para empezar a capturar sources citadas por los LLMs."
        />
      </PageShell>
    );
  }

  const { data } = await supabase
    .from("sources")
    .select(
      "id,domain,url,title,is_owned,prompt_runs!inner(llm_id,ran_at,prompt_id,prompts(id,text))",
    )
    .in("prompt_runs.prompt_id", promptIds);
  const sources = (data ?? []) as SourceWithRun[];
  const workspaceDomain =
    ((workspaceData as WorkspaceData | null)?.domain ?? null)?.replace(/^www\./, "") ?? null;
  const nowStart = dateDaysAgo(30).toISOString();
  const previousStart = dateDaysAgo(60).toISOString();
  const byDomain = new Map<string, SourceWithRun[]>();

  for (const source of sources) {
    byDomain.set(source.domain, [...(byDomain.get(source.domain) ?? []), source]);
  }

  const rows: SourceDomainRow[] = Array.from(byDomain.entries())
    .map(([domain, domainSources]) => {
      const current = domainSources.filter(
        (source) => source.prompt_runs?.ran_at && source.prompt_runs.ran_at >= nowStart,
      ).length;
      const previous = domainSources.filter(
        (source) =>
          source.prompt_runs?.ran_at &&
          source.prompt_runs.ran_at >= previousStart &&
          source.prompt_runs.ran_at < nowStart,
      ).length;

      return {
        domain,
        citations: domainSources.length,
        growthPct: calculateGrowth(current, previous),
        isOwned: domainSources.some((source) => isOwnedDomain(source, workspaceDomain)),
        lastSeen:
          domainSources
            .map((source) => source.prompt_runs?.ran_at)
            .filter((ranAt): ranAt is string => typeof ranAt === "string")
            .sort()
            .at(-1) ?? null,
      };
    })
    .sort((a, b) => b.citations - a.citations);
  const selectedSources = selectedDomain
    ? sources.filter((source) => source.domain === selectedDomain)
    : [];
  const detailPrompts: SourceDetailPrompt[] = selectedSources.slice(0, 10).map((source) => ({
    id: source.id,
    text: source.prompt_runs?.prompts?.text ?? "Prompt sin texto",
    llmId: source.prompt_runs?.llm_id ?? "LLM",
    ranAt: source.prompt_runs?.ran_at ?? null,
    url: source.url,
    title: source.title,
  }));
  const trend = selectedDomain ? buildTrend(sources, selectedDomain) : [];

  return (
    <PageShell
      eyebrow={`Workspace / ${workspaceSlug}`}
      title="Sources"
      description="Analiza dominios citados por los LLMs y separa fuentes propias de terceros."
    >
      {rows.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <SourcesTable rows={rows} selectedDomain={selectedDomain} workspaceSlug={workspaceSlug} />
          <SourceDetailPanel
            domain={selectedDomain ?? null}
            prompts={detailPrompts}
            trend={trend}
          />
        </div>
      ) : (
        <EmptyState
          title="Sin fuentes citadas"
          description="Ejecuta prompts con web search para guardar URLs y dominios citados por los LLMs."
        />
      )}
    </PageShell>
  );
}
