"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { createCompetitorAction } from "@/lib/actions/competitors";

type AddCompetitorDialogProps = {
  workspaceId: string;
  workspaceSlug: string;
};

export function AddCompetitorDialog({ workspaceId, workspaceSlug }: AddCompetitorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 font-medium text-background text-sm transition hover:opacity-90"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="size-4" />
        Anadir competidor
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-2xl tracking-tight">Anadir competidor</h2>
                <p className="mt-2 text-muted-foreground text-sm">
                  Registra una marca competidora para medir menciones y Share of Voice.
                </p>
              </div>
              <button
                className="rounded-lg px-2 py-1 text-muted-foreground text-sm hover:text-foreground"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Cerrar
              </button>
            </div>

            <form
              action={(formData) => {
                startTransition(() => {
                  void createCompetitorAction(formData);
                });
              }}
              className="mt-6 space-y-5"
            >
              <input name="workspaceId" type="hidden" value={workspaceId} />
              <input name="workspaceSlug" type="hidden" value={workspaceSlug} />

              <label className="block space-y-2">
                <span className="font-medium text-sm">Nombre</span>
                <input
                  className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
                  name="name"
                  placeholder="BurgerMax"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="font-medium text-sm">Aliases</span>
                <input
                  className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
                  name="aliases"
                  placeholder="Burger Max, BM"
                />
                <span className="text-muted-foreground text-xs">Separados por coma.</span>
              </label>

              <label className="block space-y-2">
                <span className="font-medium text-sm">Dominio</span>
                <input
                  className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
                  name="domain"
                  placeholder="burgermax.es"
                />
              </label>

              <button
                className="h-11 w-full rounded-xl bg-foreground font-medium text-background transition hover:opacity-90 disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Creando..." : "Crear competidor"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
