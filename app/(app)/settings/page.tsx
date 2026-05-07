import { PageShell } from "@/components/layout/page-shell";

export default function SettingsPage() {
  return (
    <PageShell
      eyebrow="Cuenta"
      title="Ajustes"
      description="Configuracion general de la cuenta y preferencias de producto."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
          <h2 className="font-semibold text-xl tracking-tight">Tema</h2>
          <p className="mt-2 text-muted-foreground text-sm leading-6">
            Usa el boton del sidebar para alternar entre modo claro y oscuro.
          </p>
        </article>
        <article className="rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
          <h2 className="font-semibold text-xl tracking-tight">Workspaces</h2>
          <p className="mt-2 text-muted-foreground text-sm leading-6">
            La gestion avanzada de miembros y plan se implementara despues del MVP inicial.
          </p>
        </article>
      </div>
    </PageShell>
  );
}
