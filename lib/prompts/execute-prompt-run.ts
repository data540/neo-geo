import type { SupabaseClient } from "@supabase/supabase-js";
import { getDomainFromUrl } from "@/lib/llm/citations";
import { getLlmRunner } from "@/lib/llm/runners";
import { logger } from "@/lib/logger";
import { type BrandForDetection, detectBrands } from "@/lib/parser/brand-detection";
import { computeBrandConsistency } from "@/lib/parser/consistency";
import { computeSentiment } from "@/lib/parser/sentiment";
import type { Database, Json } from "@/types/database";

type PromptWithLlms = {
  id: string;
  workspace_id: string;
  text: string;
  country: string | null;
  language: string | null;
  prompt_llms: { llm_id: string }[];
};

type BrandRow = BrandForDetection & {
  isOwn: boolean;
};

export type PromptRunExecutionResult = {
  llmId: string;
  status: "success" | "error";
  responseId?: string;
  citations?: number;
  error?: string;
};

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Error desconocido";
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export async function executePromptRun(
  supabase: SupabaseClient<Database>,
  prompt: PromptWithLlms,
  llmId: string,
): Promise<PromptRunExecutionResult> {
  const runner = getLlmRunner(llmId);
  const startedAt = Date.now();

  if (!runner) {
    return { llmId, status: "error", error: "Runner no soportado" };
  }

  const [{ data: brands }, { data: workspace }] = await Promise.all([
    supabase
      .from("brands")
      .select("id,name,aliases,is_own")
      .eq("workspace_id", prompt.workspace_id)
      .eq("is_tracked", true),
    supabase.from("workspaces").select("brand_statement").eq("id", prompt.workspace_id).single(),
  ]);
  const brandRows: BrandRow[] = (brands ?? []).map((brand) => ({
    id: brand.id,
    name: brand.name,
    aliases: brand.aliases ?? [],
    isOwn: brand.is_own ?? false,
  }));
  const ownBrandIds = new Set(brandRows.filter((brand) => brand.isOwn).map((brand) => brand.id));

  try {
    const runResult = await runner({
      prompt: prompt.text,
      country: prompt.country ?? "ES",
      language: prompt.language ?? "es-ES",
    });

    const { data: response, error: responseError } = await supabase
      .from("responses")
      .insert({
        raw_text: runResult.text,
        raw_json: toJson(runResult.rawJson),
        tokens_in: runResult.tokensIn,
        tokens_out: runResult.tokensOut,
      })
      .select("id")
      .single();

    if (responseError || !response) {
      throw responseError ?? new Error("No se pudo guardar la respuesta");
    }

    const { data: promptRun, error: runError } = await supabase
      .from("prompt_runs")
      .upsert(
        {
          prompt_id: prompt.id,
          llm_id: llmId,
          status: "success",
          response_id: response.id,
          cost_usd: runResult.costUsd,
          latency_ms: Date.now() - startedAt,
          error: null,
        },
        { onConflict: "prompt_id,llm_id,date_bucket" },
      )
      .select("id")
      .single();

    if (runError || !promptRun) {
      throw runError ?? new Error("No se pudo guardar la ejecucion");
    }

    await Promise.all([
      supabase.from("mentions").delete().eq("prompt_run_id", promptRun.id),
      supabase.from("sources").delete().eq("prompt_run_id", promptRun.id),
    ]);

    const detections = detectBrands(runResult.text, brandRows);
    const enrichedMentions = await Promise.all(
      detections.map(async (detection) => {
        const [sentiment, consistency] = await Promise.all([
          computeSentiment(detection.context),
          ownBrandIds.has(detection.brandId)
            ? computeBrandConsistency(workspace?.brand_statement ?? null, detection.context)
            : Promise.resolve(null),
        ]);

        return { detection, sentiment, consistency };
      }),
    );

    if (enrichedMentions.length > 0) {
      const { error: mentionsError } = await supabase.from("mentions").insert(
        enrichedMentions.map(({ detection, sentiment }) => ({
          prompt_run_id: promptRun.id,
          brand_id: detection.brandId,
          position: detection.position,
          context: detection.context,
          sentiment: sentiment.sentiment,
          sentiment_score: sentiment.score,
          detected_via: detection.detectedVia,
        })),
      );

      if (mentionsError) {
        logger.warn({ error: mentionsError }, "No se pudieron guardar menciones");
      }
    }

    const ownMentions = enrichedMentions.filter(({ detection }) =>
      ownBrandIds.has(detection.brandId),
    );
    const firstOwnMention = ownMentions[0];
    const consistencyScores = ownMentions
      .map(({ consistency }) => consistency)
      .filter((score): score is number => typeof score === "number");
    const avgConsistency =
      consistencyScores.length > 0
        ? consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length
        : null;

    await supabase
      .from("prompt_runs")
      .update({
        brand_mentioned: ownMentions.length > 0,
        brand_position: firstOwnMention?.detection.position ?? null,
        brand_sentiment: firstOwnMention?.sentiment.sentiment ?? null,
        brand_consistency_score: avgConsistency,
        total_brands_mentioned: new Set(enrichedMentions.map(({ detection }) => detection.brandId))
          .size,
      })
      .eq("id", promptRun.id);

    if (runResult.citations.length > 0) {
      const { error: sourcesError } = await supabase.from("sources").insert(
        runResult.citations.map((citation) => ({
          prompt_run_id: promptRun.id,
          url: citation.url,
          domain: getDomainFromUrl(citation.url),
          title: citation.title,
        })),
      );

      if (sourcesError) {
        logger.warn({ error: sourcesError }, "No se pudieron guardar sources");
      }
    }

    return {
      llmId,
      status: "success",
      responseId: response.id,
      citations: runResult.citations.length,
    };
  } catch (error) {
    logger.error({ error, llmId }, "Error ejecutando prompt");

    await supabase.from("prompt_runs").upsert(
      {
        prompt_id: prompt.id,
        llm_id: llmId,
        status: "error",
        latency_ms: Date.now() - startedAt,
        error: toErrorMessage(error),
      },
      { onConflict: "prompt_id,llm_id,date_bucket" },
    );

    return { llmId, status: "error", error: toErrorMessage(error) };
  }
}

export async function executePromptAcrossLlms(
  supabase: SupabaseClient<Database>,
  promptId: string,
) {
  const { data: prompt, error } = await supabase
    .from("prompts")
    .select("id,workspace_id,text,country,language,prompt_llms(llm_id)")
    .eq("id", promptId)
    .single();

  if (error || !prompt) {
    throw error ?? new Error("Prompt no encontrado");
  }

  const typedPrompt = prompt as PromptWithLlms;
  const results = [];

  for (const promptLlm of typedPrompt.prompt_llms) {
    results.push(await executePromptRun(supabase, typedPrompt, promptLlm.llm_id));
  }

  return results;
}
