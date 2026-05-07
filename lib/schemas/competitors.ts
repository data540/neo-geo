import { z } from "zod";

export const createCompetitorSchema = z.object({
  workspaceId: z.string().uuid(),
  workspaceSlug: z.string().min(1),
  name: z.string().trim().min(2, "Introduce el nombre del competidor"),
  aliases: z.string().trim().optional(),
  domain: z.string().trim().optional(),
});

export function parseAliases(value: string | undefined) {
  return Array.from(
    new Set(
      (value ?? "")
        .split(",")
        .map((alias) => alias.trim())
        .filter(Boolean),
    ),
  );
}
