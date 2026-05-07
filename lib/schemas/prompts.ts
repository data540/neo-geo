import { z } from "zod";

export const promptStatusSchema = z.enum(["active", "paused", "archived"]);

export const createPromptSchema = z.object({
  workspaceId: z.string().uuid(),
  text: z.string().trim().min(10, "El prompt debe tener al menos 10 caracteres"),
  country: z.string().trim().length(2, "Usa un codigo de pais de 2 letras"),
  tags: z.string().trim().optional(),
  schedulePreset: z.enum(["daily", "six-hours", "manual"]),
  llmIds: z.array(z.string().min(1)).min(1, "Selecciona al menos un LLM"),
});

export const updatePromptStatusSchema = z.object({
  promptId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  status: z.enum(["active", "paused"]),
});

export function parseTags(value: string | undefined) {
  return Array.from(
    new Set(
      (value ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

export function scheduleCronFromPreset(
  preset: z.infer<typeof createPromptSchema>["schedulePreset"],
) {
  if (preset === "six-hours") {
    return "0 */6 * * *";
  }

  if (preset === "manual") {
    return null;
  }

  return "0 6 * * *";
}
