"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";
import { createCompetitorSchema, parseAliases } from "@/lib/schemas/competitors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function cleanOptionalValue(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export async function createCompetitorAction(formData: FormData) {
  const workspaceSlug = getStringValue(formData, "workspaceSlug") || "onboarding";
  const parsed = createCompetitorSchema.safeParse({
    workspaceId: getStringValue(formData, "workspaceId"),
    workspaceSlug,
    name: getStringValue(formData, "name"),
    aliases: getStringValue(formData, "aliases"),
    domain: getStringValue(formData, "domain"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "No hemos podido crear el competidor";
    redirect(`/${workspaceSlug}/competitors?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("brands").insert({
    workspace_id: parsed.data.workspaceId,
    name: parsed.data.name,
    aliases: parseAliases(parsed.data.aliases),
    domain: cleanOptionalValue(parsed.data.domain),
    category: "competitor",
    is_own: false,
    is_tracked: true,
  });

  if (error) {
    logger.error({ error }, "Error creando competidor");
    redirect(`/${parsed.data.workspaceSlug}/competitors?error=No hemos podido crear el competidor`);
  }

  revalidatePath(`/${parsed.data.workspaceSlug}/competitors`);
  redirect(`/${parsed.data.workspaceSlug}/competitors?message=Competidor creado`);
}
