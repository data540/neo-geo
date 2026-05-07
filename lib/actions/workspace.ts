"use server";

import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";
import { getStringValue, workspaceSchema } from "@/lib/schemas/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toWorkspaceSlug } from "@/lib/workspace";

function cleanOptionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createWorkspaceAction(formData: FormData) {
  const parsed = workspaceSchema.safeParse({
    brandName: getStringValue(formData, "brandName"),
    domain: getStringValue(formData, "domain"),
    country: getStringValue(formData, "country").toUpperCase(),
    brandStatement: getStringValue(formData, "brandStatement"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos no validos";
    redirect(`/onboarding?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/login?error=Inicia sesion para crear tu workspace");
  }

  const workspaceName = parsed.data.brandName;
  const workspaceSlug = toWorkspaceSlug(workspaceName) || "workspace";
  const workspaceId = crypto.randomUUID();
  const domain = cleanOptionalValue(parsed.data.domain ?? "");
  const brandStatement = cleanOptionalValue(parsed.data.brandStatement ?? "");

  const { error: workspaceError } = await supabase.from("workspaces").insert({
    id: workspaceId,
    name: workspaceName,
    brand_name: workspaceName,
    domain,
    brand_statement: brandStatement,
    default_country: parsed.data.country,
    owner_id: userData.user.id,
  });

  if (workspaceError) {
    logger.error({ error: workspaceError }, "Error creando workspace");
    redirect("/onboarding?error=No hemos podido crear el workspace");
  }

  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspaceId,
    user_id: userData.user.id,
    role: "owner",
  });

  if (memberError) {
    logger.error({ error: memberError }, "Error creando owner del workspace");
    redirect("/onboarding?error=No hemos podido asignarte como owner");
  }

  const { error: brandError } = await supabase.from("brands").insert({
    workspace_id: workspaceId,
    name: workspaceName,
    domain,
    is_own: true,
    category: "own",
  });

  if (brandError) {
    logger.warn({ error: brandError }, "Workspace creado sin marca propia inicial");
  }

  redirect(`/${workspaceSlug}/dashboard`);
}
