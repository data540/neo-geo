import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-black/10 border-b bg-white px-6 py-5 dark:border-white/10 dark:bg-zinc-950 lg:border-r lg:border-b-0">
        <Link className="font-semibold text-xl tracking-tight" href="/onboarding">
          neo-geo
        </Link>
        <div className="mt-6">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
            Workspace
          </p>
          <select className="mt-2 h-10 w-full rounded-xl border border-black/10 bg-transparent px-3 text-sm dark:border-white/15">
            {memberships?.map((membership) => {
              const workspace = membership.workspaces;
              return workspace?.id ? (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ) : null;
            })}
          </select>
        </div>
        <nav className="mt-8 grid gap-2 text-sm">
          <Link className="rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10" href="#">
            Dashboard
          </Link>
          <Link className="rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10" href="#">
            Prompts
          </Link>
          <Link className="rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10" href="#">
            Sources
          </Link>
          <Link className="rounded-xl px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10" href="#">
            Competidores
          </Link>
        </nav>
        <form action={logoutAction} className="mt-8">
          <button className="text-muted-foreground text-sm hover:text-foreground" type="submit">
            Cerrar sesion
          </button>
        </form>
      </aside>
      <main>{children}</main>
    </div>
  );
}
