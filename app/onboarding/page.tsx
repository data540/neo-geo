import { redirect } from "next/navigation";
import { createWorkspaceAction } from "@/lib/actions/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toWorkspaceSlug } from "@/lib/workspace";

type OnboardingPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspaces(id, name)")
    .eq("user_id", userData.user.id)
    .limit(1);

  const existingWorkspace = memberships?.[0]?.workspaces;

  if (existingWorkspace?.name) {
    const slug = toWorkspaceSlug(existingWorkspace.name);

    redirect(`/${slug || "workspace"}/dashboard`);
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <section className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.22em]">
            Onboarding
          </p>
          <h1 className="mt-4 font-semibold text-4xl tracking-tight sm:text-5xl">
            Configura tu primer workspace
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-8">
            Usaremos estos datos para detectar menciones de marca, calcular consistencia y separar
            fuentes propias de terceros.
          </p>
        </div>

        <form
          action={createWorkspaceAction}
          className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950"
        >
          {params.error ? (
            <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {params.error}
            </p>
          ) : null}

          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="font-medium text-sm">Marca principal</span>
              <input
                className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
                name="brandName"
                placeholder="FoodBox"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="font-medium text-sm">Dominio</span>
              <input
                className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
                name="domain"
                placeholder="foodbox.es"
              />
            </label>

            <label className="block space-y-2">
              <span className="font-medium text-sm">Pais por defecto</span>
              <input
                className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 uppercase outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
                name="country"
                defaultValue="ES"
                maxLength={2}
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="font-medium text-sm">Declaracion de marca</span>
              <textarea
                className="min-h-28 w-full rounded-xl border border-black/10 bg-transparent px-3 py-3 outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
                name="brandStatement"
                placeholder="FoodBox es una cadena de franquicias de comida..."
              />
            </label>
          </div>

          <button
            className="mt-8 h-11 w-full rounded-xl bg-foreground font-medium text-background transition hover:opacity-90"
            type="submit"
          >
            Crear workspace
          </button>
        </form>
      </section>
    </main>
  );
}
