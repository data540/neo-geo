import { notFound } from "next/navigation";
import { AddCompetitorDialog } from "@/components/competitors/add-competitor-dialog";
import { CompetitorsGrid } from "@/components/competitors/competitors-grid";
import { SovStackedChart } from "@/components/competitors/sov-stacked-chart";
import type { CompetitorCardData, CompetitorSovPoint } from "@/components/competitors/types";
import { EmptyState } from "@/components/layout/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/workspaces";

type CompetitorsPageProps = {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

type BrandRow = {
  id: string;
  name: string;
  aliases: string[] | null;
  domain: string | null;
  is_own: boolean | null;
};

type MentionMetric = {
  brand_id: string;
  position: number | null;
  sentiment: string | null;
  sentiment_score: number | null;
  prompt_runs: {
    ran_at: string | null;
    prompt_id: string;
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

function average(values: number[]) {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function sentimentLabel(score: number | null) {
  if (score === null) {
    return "--";
  }

  if (score > 0.2) {
    return "Positivo";
  }

  if (score < -0.2) {
    return "Negativo";
  }

  return "Neutral";
}

function buildSparkline(mentions: MentionMetric[], brandId: string) {
  const values: { date: string; value: number }[] = [];

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = toDateKey(dateDaysAgo(offset));
    values.push({
      date,
      value: mentions.filter(
        (mention) =>
          mention.brand_id === brandId &&
          mention.prompt_runs?.ran_at &&
          toDateKey(mention.prompt_runs.ran_at) === date,
      ).length,
    });
  }

  return values;
}

function buildSovTrend(mentions: MentionMetric[], brands: BrandRow[]) {
  const points: CompetitorSovPoint[] = [];

  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = toDateKey(dateDaysAgo(offset));
    const dayMentions = mentions.filter(
      (mention) => mention.prompt_runs?.ran_at && toDateKey(mention.prompt_runs.ran_at) === date,
    );
    const point: CompetitorSovPoint = { date: date.slice(5) };

    for (const brand of brands) {
      point[brand.name] = dayMentions.filter((mention) => mention.brand_id === brand.id).length;
    }

    points.push(point);
  }

  return points;
}

export default async function CompetitorsPage({ params, searchParams }: CompetitorsPageProps) {
  const { workspace: workspaceSlug } = await params;
  const messages = await searchParams;
  const workspace = await getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: brands }, { data: prompts }] = await Promise.all([
    supabase
      .from("brands")
      .select("id,name,aliases,domain,is_own")
      .eq("workspace_id", workspace.id)
      .eq("is_tracked", true)
      .order("is_own", { ascending: false })
      .order("name", { ascending: true }),
    supabase.from("prompts").select("id").eq("workspace_id", workspace.id),
  ]);
  const brandRows = (brands ?? []) as BrandRow[];
  const promptIds = (prompts ?? []).map((prompt) => prompt.id);
  const since = dateDaysAgo(30).toISOString();
  const { data: mentionsData } =
    promptIds.length > 0
      ? await supabase
          .from("mentions")
          .select("brand_id,position,sentiment,sentiment_score,prompt_runs!inner(ran_at,prompt_id)")
          .in("prompt_runs.prompt_id", promptIds)
          .gte("prompt_runs.ran_at", since)
      : { data: [] };
  const mentions = (mentionsData ?? []) as MentionMetric[];
  const totalMentions = mentions.length;
  const competitors: CompetitorCardData[] = brandRows.map((brand) => {
    const brandMentions = mentions.filter((mention) => mention.brand_id === brand.id);
    const avgSentiment = average(
      brandMentions
        .map((mention) => mention.sentiment_score)
        .filter((score): score is number => typeof score === "number"),
    );

    return {
      id: brand.id,
      name: brand.name,
      domain: brand.domain,
      aliases: brand.aliases ?? [],
      mentions: brandMentions.length,
      sovPct: totalMentions > 0 ? (brandMentions.length / totalMentions) * 100 : 0,
      avgPosition: average(
        brandMentions
          .map((mention) => mention.position)
          .filter((position): position is number => typeof position === "number"),
      ),
      avgSentiment,
      sentimentLabel: sentimentLabel(avgSentiment),
      sparkline: buildSparkline(mentions, brand.id),
      isOwn: brand.is_own ?? false,
    };
  });
  const chartData = buildSovTrend(mentions, brandRows);

  return (
    <PageShell
      eyebrow={`Workspace / ${workspaceSlug}`}
      title="Competidores"
      description="Compara menciones, SOV, posicion media y sentimiento frente a otras marcas."
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
        <AddCompetitorDialog workspaceId={workspace.id} workspaceSlug={workspaceSlug} />
      </div>

      {competitors.length > 0 ? (
        <div className="space-y-6">
          <SovStackedChart data={chartData} brandNames={brandRows.map((brand) => brand.name)} />
          <CompetitorsGrid competitors={competitors} />
        </div>
      ) : (
        <EmptyState
          title="Sin competidores configurados"
          description="Anade competidores para empezar a comparar menciones y Share of Voice frente a FoodBox."
        />
      )}
    </PageShell>
  );
}
