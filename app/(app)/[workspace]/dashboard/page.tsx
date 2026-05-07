import { notFound } from "next/navigation";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  MentionsAreaChart,
  type MentionsChartPoint,
} from "@/components/dashboard/mentions-area-chart";
import { RecentMentions } from "@/components/dashboard/recent-mentions";
import { TopSources } from "@/components/dashboard/top-sources";
import { PageShell } from "@/components/layout/page-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/workspaces";

type DashboardPageProps = {
  params: Promise<{ workspace: string }>;
};

type PromptRunRow = {
  id: string;
  llm_id: string;
  ran_at: string | null;
  brand_mentioned: boolean | null;
  brand_position: number | null;
  brand_consistency_score: number | null;
  total_brands_mentioned: number | null;
};

type SourceRow = {
  domain: string;
};

type MentionRow = {
  id: string;
  sentiment: string | null;
  brands: { name: string } | null;
  prompt_runs: {
    llm_id: string;
    ran_at: string | null;
    prompts: { text: string } | null;
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

function formatNumber(value: number) {
  return value.toLocaleString("es-ES");
}

function formatPct(value: number | null) {
  return value === null ? "--" : `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`;
}

function formatPosition(value: number | null) {
  return value === null ? "--" : `#${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })}`;
}

function average(values: number[]) {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function deltaPct(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? "0%" : "+100%";
  }

  const delta = ((current - previous) / previous) * 100;
  const prefix = delta > 0 ? "+" : "";
  return `${prefix}${delta.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`;
}

function buildTrendData(runs: PromptRunRow[]) {
  const llmIds = Array.from(new Set(runs.map((run) => run.llm_id))).sort();
  const points: MentionsChartPoint[] = [];

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = dateDaysAgo(offset);
    const key = toDateKey(date);
    const point: MentionsChartPoint = { date: key.slice(5) };

    for (const llmId of llmIds) {
      point[llmId] = runs.filter(
        (run) =>
          run.llm_id === llmId &&
          run.brand_mentioned &&
          run.ran_at &&
          toDateKey(run.ran_at) === key,
      ).length;
    }

    points.push(point);
  }

  return { points, llmIds };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const { data: prompts } = await supabase
    .from("prompts")
    .select("id")
    .eq("workspace_id", workspace.id);
  const promptIds = (prompts ?? []).map((prompt) => prompt.id);

  if (promptIds.length === 0) {
    return (
      <PageShell
        eyebrow={`Workspace / ${workspaceSlug}`}
        title="Dashboard"
        description="Resumen ejecutivo de visibilidad de marca. Crea prompts para empezar a medir resultados."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            delta="--"
            description="Sin ejecuciones todavia"
            title="Brand Mentions"
            value="0/0"
          />
          <KpiCard
            delta="--"
            description="Sin posiciones detectadas"
            title="Avg Position"
            value="--"
          />
          <KpiCard
            delta="--"
            description="Sin statement comparado"
            title="Brand Consistency"
            value="--"
          />
          <KpiCard
            delta="--"
            description="Sin menciones competidoras"
            title="Share of Voice"
            value="--"
          />
        </div>
      </PageShell>
    );
  }

  const currentStart = dateDaysAgo(30).toISOString();
  const previousStart = dateDaysAgo(60).toISOString();
  const [
    { data: currentRuns },
    { data: previousRuns },
    { data: sources },
    { data: recentMentions },
  ] = await Promise.all([
    supabase
      .from("prompt_runs")
      .select(
        "id,llm_id,ran_at,brand_mentioned,brand_position,brand_consistency_score,total_brands_mentioned",
      )
      .in("prompt_id", promptIds)
      .gte("ran_at", currentStart)
      .eq("status", "success"),
    supabase
      .from("prompt_runs")
      .select("brand_mentioned,brand_position,brand_consistency_score,total_brands_mentioned")
      .in("prompt_id", promptIds)
      .gte("ran_at", previousStart)
      .lt("ran_at", currentStart)
      .eq("status", "success"),
    supabase
      .from("sources")
      .select("domain,prompt_runs!inner(prompt_id)")
      .in("prompt_runs.prompt_id", promptIds),
    supabase
      .from("mentions")
      .select("id,sentiment,brands(name),prompt_runs!inner(llm_id,ran_at,prompt_id,prompts(text))")
      .in("prompt_runs.prompt_id", promptIds)
      .order("id", { ascending: false })
      .limit(10),
  ]);

  const current = (currentRuns ?? []) as PromptRunRow[];
  const previous = (previousRuns ?? []) as Pick<
    PromptRunRow,
    "brand_mentioned" | "brand_position" | "brand_consistency_score" | "total_brands_mentioned"
  >[];
  const brandMentions = current.filter((run) => run.brand_mentioned).length;
  const previousBrandMentions = previous.filter((run) => run.brand_mentioned).length;
  const avgPosition = average(
    current
      .map((run) => run.brand_position)
      .filter((position): position is number => typeof position === "number"),
  );
  const previousAvgPosition = average(
    previous
      .map((run) => run.brand_position)
      .filter((position): position is number => typeof position === "number"),
  );
  const consistency = average(
    current
      .map((run) => run.brand_consistency_score)
      .filter((score): score is number => typeof score === "number")
      .map((score) => score * 100),
  );
  const previousConsistency = average(
    previous
      .map((run) => run.brand_consistency_score)
      .filter((score): score is number => typeof score === "number")
      .map((score) => score * 100),
  );
  const totalTrackedMentions = current.reduce(
    (sum, run) => sum + (run.total_brands_mentioned ?? 0),
    0,
  );
  const previousTrackedMentions = previous.reduce(
    (sum, run) => sum + (run.total_brands_mentioned ?? 0),
    0,
  );
  const sov = totalTrackedMentions > 0 ? (brandMentions / totalTrackedMentions) * 100 : null;
  const previousSov =
    previousTrackedMentions > 0 ? (previousBrandMentions / previousTrackedMentions) * 100 : null;
  const trend = buildTrendData(current);
  const sourceCounts = new Map<string, number>();

  for (const source of (sources ?? []) as SourceRow[]) {
    sourceCounts.set(source.domain, (sourceCounts.get(source.domain) ?? 0) + 1);
  }

  const topSources = Array.from(sourceCounts.entries())
    .map(([domain, citations]) => ({ domain, citations }))
    .sort((a, b) => b.citations - a.citations)
    .slice(0, 5);
  const mentions = ((recentMentions ?? []) as MentionRow[]).map((mention) => ({
    id: mention.id,
    brand: mention.brands?.name ?? "Marca",
    prompt: mention.prompt_runs?.prompts?.text ?? "Prompt sin texto",
    llmId: mention.prompt_runs?.llm_id ?? "LLM",
    sentiment: mention.sentiment,
    ranAt: mention.prompt_runs?.ran_at ?? null,
  }));

  return (
    <PageShell
      eyebrow={`Workspace / ${workspaceSlug}`}
      title="Dashboard"
      description="Resumen ejecutivo de visibilidad de marca en respuestas de LLMs."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          delta={deltaPct(brandMentions, previousBrandMentions)}
          description="Menciones de marca propia frente a ejecuciones totales."
          title="Brand Mentions"
          value={`${formatNumber(brandMentions)}/${formatNumber(current.length)}`}
        />
        <KpiCard
          delta={
            avgPosition && previousAvgPosition ? deltaPct(previousAvgPosition, avgPosition) : "--"
          }
          description="Posicion media de la primera mencion de marca."
          title="Avg Position"
          value={formatPosition(avgPosition)}
        />
        <KpiCard
          delta={
            consistency !== null && previousConsistency !== null
              ? deltaPct(consistency, previousConsistency)
              : "--"
          }
          description="Similitud media entre contexto y statement de marca."
          title="Brand Consistency"
          value={formatPct(consistency)}
        />
        <KpiCard
          delta={sov !== null && previousSov !== null ? deltaPct(sov, previousSov) : "--"}
          description="Menciones propias sobre total de marcas trackeadas."
          title="Share of Voice"
          value={formatPct(sov)}
        />
      </div>

      <div className="mt-6">
        <MentionsAreaChart data={trend.points} llmIds={trend.llmIds} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <TopSources sources={topSources} />
        <RecentMentions mentions={mentions} />
      </div>
    </PageShell>
  );
}
