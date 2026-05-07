"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type RunPromptButtonProps = {
  promptId: string;
};

export function RunPromptButton({ promptId }: RunPromptButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runPrompt() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/prompts/${promptId}/run`, { method: "POST" });
      const body = (await response.json()) as { error?: string; results?: { status: string }[] };

      if (!response.ok) {
        setMessage(body.error ?? "No hemos podido ejecutar el prompt");
        return;
      }

      const successCount =
        body.results?.filter((result) => result.status === "success").length ?? 0;
      setMessage(`Ejecucion completada: ${successCount} LLM(s) con exito`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-1">
      <button
        className="inline-flex items-center gap-2 font-medium text-sm hover:underline disabled:opacity-60"
        type="button"
        onClick={runPrompt}
        disabled={isPending}
      >
        <Play className="size-3.5" />
        {isPending ? "Ejecutando" : "Ejecutar ahora"}
      </button>
      {message ? <p className="max-w-48 text-muted-foreground text-xs">{message}</p> : null}
    </div>
  );
}
