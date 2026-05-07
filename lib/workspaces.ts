import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toWorkspaceSlug, type WorkspaceOption } from "@/lib/workspace";

export const getUserWorkspaces = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return [];
  }

  const { data } = await supabase
    .from("workspace_members")
    .select("workspaces(id, name)")
    .eq("user_id", userData.user.id);

  return (
    data?.flatMap((membership) => {
      const workspace = membership.workspaces;
      return workspace?.id && workspace.name ? [{ id: workspace.id, name: workspace.name }] : [];
    }) ?? []
  );
});

export async function getWorkspaceBySlug(slug: string): Promise<WorkspaceOption | null> {
  const workspaces = await getUserWorkspaces();
  return workspaces.find((workspace) => toWorkspaceSlug(workspace.name) === slug) ?? null;
}
