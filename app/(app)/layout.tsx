import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { logoutAction } from "@/lib/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WorkspaceOption } from "@/lib/workspace";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspaces(id, name)")
    .eq("user_id", userData.user.id);

  const workspaces =
    memberships?.flatMap((membership) => {
      const workspace = membership.workspaces;
      return workspace?.id && workspace.name ? [{ id: workspace.id, name: workspace.name }] : [];
    }) ?? [];

  if (workspaces.length === 0) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[280px_1fr]">
      <AppSidebar
        workspaces={workspaces satisfies WorkspaceOption[]}
        userEmail={userData.user.email ?? "Usuario"}
        logoutAction={logoutAction}
      />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
