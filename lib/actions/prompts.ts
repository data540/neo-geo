"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";
import {
  createPromptSchema,
  parseTags,
  scheduleCronFromPreset,
  updatePromptStatusSchema,
} from "@/lib/schemas/prompts";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toWorkspaceSlug } from "@/lib/workspace";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createPromptAction(formData: FormData) {
  const workspaceSlug = getStringValue(formData, "workspaceSlug");
  const parsed = createPromptSchema.safeParse({
    workspaceId: getStringValue(formData, "workspaceId"),
    text: getStringValue(formData, "text"),
    country: getStringValue(formData, "country").toUpperCase(),
    tags: getStringValue(formData, "tags"),
    schedulePreset: getStringValue(formData, "schedulePreset"),
    llmIds: formData.getAll("llmIds").filter((value): value is string => typeof value === "string"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "No hemos podido crear el prompt";
    redirect(`/${workspaceSlug}/prompts?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", parsed.data.workspaceId)
    .single();

  const redirectSlug = workspace?.name ? toWorkspaceSlug(workspace.name) : workspaceSlug;

  const { data: prompt, error: promptError } = await supabase
    .from("prompts")
    .insert({
      workspace_id: parsed.data.workspaceId,
      text: parsed.data.text,
      country: parsed.data.country,
      tags: parseTags(parsed.data.tags),
      schedule_cron: scheduleCronFromPreset(parsed.data.schedulePreset),
      status: parsed.data.schedulePreset === "manual" ? "paused" : "active",
    })
    .select("id")
    .single();

  if (promptError || !prompt) {
    logger.error({ error: promptError }, "Error creando prompt");
    redirect(`/${redirectSlug}/prompts?error=No hemos podido crear el prompt`);
  }

  const { error: llmsError } = await supabase.from("prompt_llms").insert(
    parsed.data.llmIds.map((llmId) => ({
      prompt_id: prompt.id,
      llm_id: llmId,
    })),
  );

  if (llmsError) {
    logger.error({ error: llmsError }, "Error asignando LLMs al prompt");
    redirect(`/${redirectSlug}/prompts?error=El prompt se creo, pero no hemos podido asignar LLMs`);
  }

  revalidatePath(`/${redirectSlug}/prompts`);
  redirect(`/${redirectSlug}/prompts?message=Prompt creado`);
}

export async function updatePromptStatusAction(formData: FormData) {
  const parsed = updatePromptStatusSchema.safeParse({
    promptId: getStringValue(formData, "promptId"),
    workspaceSlug: getStringValue(formData, "workspaceSlug"),
    status: getStringValue(formData, "status"),
  });

  if (!parsed.success) {
    redirect("/onboarding");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("prompts")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.promptId);

  if (error) {
    logger.error({ error }, "Error actualizando estado del prompt");
    redirect(`/${parsed.data.workspaceSlug}/prompts?error=No hemos podido actualizar el estado`);
  }

  revalidatePath(`/${parsed.data.workspaceSlug}/prompts`);
}
