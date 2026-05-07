"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { createPromptAction } from "@/lib/actions/prompts";
import { createPromptSchema } from "@/lib/schemas/prompts";
import type { LlmOption } from "./types";

type CreatePromptDialogProps = {
  workspaceId: string;
  workspaceSlug: string;
  llms: LlmOption[];
};

type CreatePromptFormValues = z.infer<typeof createPromptSchema>;

export function CreatePromptDialog({ workspaceId, workspaceSlug, llms }: CreatePromptDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePromptFormValues>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      workspaceId,
      text: "",
      country: "ES",
      tags: "",
      schedulePreset: "daily",
      llmIds: llms.slice(0, 2).map((llm) => llm.id),
    },
  });

  function submitPrompt(values: CreatePromptFormValues) {
    const formData = new FormData();
    formData.set("workspaceId", values.workspaceId);
    formData.set("workspaceSlug", workspaceSlug);
    formData.set("text", values.text);
    formData.set("country", values.country);
    formData.set("tags", values.tags ?? "");
    formData.set("schedulePreset", values.schedulePreset);

    for (const llmId of values.llmIds) {
      formData.append("llmIds", llmId);
    }

    startTransition(() => {
      void createPromptAction(formData);
    });
  }

  return (
    <>
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 font-medium text-background text-sm transition hover:opacity-90"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="size-4" />
        Anadir prompt
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="max-h-full w-full max-w-2xl overflow-auto rounded-3xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-2xl tracking-tight">Anadir prompt</h2>
                <p className="mt-2 text-muted-foreground text-sm">
                  Define una pregunta, pais, tags, LLMs y frecuencia de ejecucion.
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

            <form className="mt-6 space-y-5" onSubmit={handleSubmit(submitPrompt)}>
              <input type="hidden" {...register("workspaceId")} />

              <label className="block space-y-2">
                <span className="font-medium text-sm">Prompt</span>
                <textarea
                  className="min-h-32 w-full rounded-xl border border-black/10 bg-transparent px-3 py-3 outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
                  placeholder="Cuales son las mejores franquicias de comida en Espana?"
                  {...register("text")}
                />
                {errors.text ? (
                  <span className="text-red-600 text-sm">{errors.text.message}</span>
                ) : null}
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="font-medium text-sm">Pais</span>
                  <input
                    className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 uppercase outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
                    maxLength={2}
                    {...register("country")}
                  />
                  {errors.country ? (
                    <span className="text-red-600 text-sm">{errors.country.message}</span>
                  ) : null}
                </label>

                <label className="block space-y-2">
                  <span className="font-medium text-sm">Frecuencia</span>
                  <select
                    className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
                    {...register("schedulePreset")}
                  >
                    <option value="daily">Diario</option>
                    <option value="six-hours">Cada 6h</option>
                    <option value="manual">Manual</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-2">
                <span className="font-medium text-sm">Tags</span>
                <input
                  className="h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 outline-none transition focus:border-black dark:border-white/15 dark:focus:border-white"
                  placeholder="franquicias, comida rapida, espana"
                  {...register("tags")}
                />
                <span className="text-muted-foreground text-xs">Separados por coma.</span>
              </label>

              <fieldset className="space-y-3">
                <legend className="font-medium text-sm">LLMs</legend>
                <div className="grid gap-3 md:grid-cols-2">
                  {llms.map((llm) => (
                    <label
                      className="flex items-center gap-3 rounded-xl border border-black/10 px-3 py-3 text-sm dark:border-white/15"
                      key={llm.id}
                    >
                      <input
                        className="size-4"
                        type="checkbox"
                        value={llm.id}
                        {...register("llmIds")}
                      />
                      {llm.name}
                    </label>
                  ))}
                </div>
                {errors.llmIds ? (
                  <span className="text-red-600 text-sm">{errors.llmIds.message}</span>
                ) : null}
              </fieldset>

              <button
                className="h-11 w-full rounded-xl bg-foreground font-medium text-background transition hover:opacity-90 disabled:opacity-60"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Creando..." : "Crear prompt"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
