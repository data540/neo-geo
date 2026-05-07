import { inngest } from "@/lib/inngest/client";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type PromptRunMetric = {
  prompt_id: string;
  llm_id: string;
  brand_mentioned: boolean | null;
  brand_position: number | null;
  brand_consistency_score: number | null;
  total_brands_mentioned: number | null;
  prompts: { workspace_id: string } | null;
};

function getTodayBucket() {
  return new Date().toISOString().slice(0, 10);
}

function average(values: number[]) {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

export const aggregateDailyMetrics = inngest.createFunction(
  { id: "aggregate-daily-metrics", triggers: [{ cron: "30 23 * * *" }] },
  async ({ step }) => {
    const date = getTodayBucket();

    const runs = await step.run("load-runs", async () => {
      const supabase = createSupabaseServiceClient();
      const { data, error } = await supabase
        .from("prompt_runs")
        .select(
          "prompt_id,llm_id,brand_mentioned,brand_position,brand_consistency_score,total_brands_mentioned,prompts(workspace_id)",
        )
        .eq("date_bucket", date)
        .eq("status", "success");

      if (error) {
        throw error;
      }

      return (data ?? []) as PromptRunMetric[];
    });

    await step.run("upsert-workspace-metrics", async () => {
      const supabase = createSupabaseServiceClient();
      const byWorkspace = new Map<string, PromptRunMetric[]>();

      for (const run of runs) {
        const workspaceId = run.prompts?.workspace_id;

        if (!workspaceId) {
          continue;
        }

        byWorkspace.set(workspaceId, [...(byWorkspace.get(workspaceId) ?? []), run]);
      }

      for (const [workspaceId, workspaceRuns] of byWorkspace) {
        const brandMentions = workspaceRuns.filter((run) => run.brand_mentioned).length;
        const totalBrandMentions = workspaceRuns.reduce(
          (sum, run) => sum + (run.total_brands_mentioned ?? 0),
          0,
        );
        const { error } = await supabase.from("daily_workspace_metrics").upsert({
          workspace_id: workspaceId,
          date,
          brand_mentions: brandMentions,
          total_runs: workspaceRuns.length,
          avg_position: average(
            workspaceRuns
              .map((run) => run.brand_position)
              .filter((position): position is number => typeof position === "number"),
          ),
          brand_consistency_pct:
            average(
              workspaceRuns
                .map((run) => run.brand_consistency_score)
                .filter((score): score is number => typeof score === "number"),
            ) ?? null,
          share_of_voice_pct:
            totalBrandMentions > 0 ? (brandMentions / totalBrandMentions) * 100 : 0,
        });

        if (error) {
          throw error;
        }
      }
    });

    await step.run("upsert-prompt-metrics", async () => {
      const supabase = createSupabaseServiceClient();
      const byPromptLlm = new Map<string, PromptRunMetric[]>();

      for (const run of runs) {
        const key = `${run.prompt_id}:${run.llm_id}`;
        byPromptLlm.set(key, [...(byPromptLlm.get(key) ?? []), run]);
      }

      for (const promptRuns of byPromptLlm.values()) {
        const firstRun = promptRuns[0];

        if (!firstRun) {
          continue;
        }

        const brandMentions = promptRuns.filter((run) => run.brand_mentioned).length;
        const totalBrandMentions = promptRuns.reduce(
          (sum, run) => sum + (run.total_brands_mentioned ?? 0),
          0,
        );
        const { error } = await supabase.from("daily_prompt_metrics").upsert({
          prompt_id: firstRun.prompt_id,
          llm_id: firstRun.llm_id,
          date,
          brand_mentioned_count: brandMentions,
          total_runs: promptRuns.length,
          avg_position: average(
            promptRuns
              .map((run) => run.brand_position)
              .filter((position): position is number => typeof position === "number"),
          ),
          sov_pct: totalBrandMentions > 0 ? (brandMentions / totalBrandMentions) * 100 : 0,
        });

        if (error) {
          throw error;
        }
      }
    });

    return { date, runs: runs.length };
  },
);
