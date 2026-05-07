"use client";

import { Bot, Database, LayoutDashboard, Settings, Swords } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { toWorkspaceSlug, type WorkspaceOption } from "@/lib/workspace";

type AppSidebarProps = {
  workspaces: WorkspaceOption[];
  userEmail: string;
  logoutAction: () => Promise<void>;
};

const workspaceNavItems = [
  { label: "Dashboard", href: "dashboard", icon: LayoutDashboard },
  { label: "Prompts", href: "prompts", icon: Bot },
  { label: "Sources", href: "sources", icon: Database },
  { label: "Competidores", href: "competitors", icon: Swords },
];

export function AppSidebar({ workspaces, userEmail, logoutAction }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const firstWorkspaceSlug = toWorkspaceSlug(workspaces[0]?.name ?? "workspace") || "workspace";
  const currentWorkspaceSlug = pathname.split("/").filter(Boolean)[0] ?? firstWorkspaceSlug;
  const currentWorkspace =
    workspaces.find((workspace) => toWorkspaceSlug(workspace.name) === currentWorkspaceSlug) ??
    workspaces[0];

  return (
    <aside className="flex border-black/10 border-b bg-white px-5 py-4 dark:border-white/10 dark:bg-zinc-950 lg:min-h-screen lg:flex-col lg:border-r lg:border-b-0">
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            className="font-semibold text-xl tracking-tight"
            href={`/${firstWorkspaceSlug}/dashboard`}
          >
            neo-geo
          </Link>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>

        <div>
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
            Workspace
          </p>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 text-sm outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
            value={currentWorkspace?.id ?? ""}
            onChange={(event) => {
              const nextWorkspace = workspaces.find(
                (workspace) => workspace.id === event.target.value,
              );

              if (nextWorkspace) {
                router.push(`/${toWorkspaceSlug(nextWorkspace.name) || "workspace"}/dashboard`);
              }
            }}
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>

        <nav className="grid gap-1 text-sm">
          {workspaceNavItems.map((item) => {
            const href = `/${currentWorkspaceSlug}/${item.href}`;
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10",
                )}
                href={href}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
              pathname === "/settings"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10",
            )}
            href="/settings"
          >
            <Settings className="size-4" />
            Ajustes
          </Link>
        </nav>
      </div>

      <div className="mt-auto hidden space-y-4 pt-8 lg:block">
        <ThemeToggle />
        <div className="rounded-2xl border border-black/10 p-3 text-sm dark:border-white/10">
          <p className="truncate font-medium">{userEmail}</p>
          <form action={logoutAction} className="mt-3">
            <button className="text-muted-foreground text-sm hover:text-foreground" type="submit">
              Cerrar sesion
            </button>
          </form>
        </div>
      </div>

      <form action={logoutAction} className="mt-2 lg:hidden">
        <button className="text-muted-foreground text-sm hover:text-foreground" type="submit">
          Cerrar sesion
        </button>
      </form>
    </aside>
  );
}
