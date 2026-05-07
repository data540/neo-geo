import { z } from "zod";

export const authSchema = z.object({
  email: z.string().trim().email("Introduce un email valido"),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres"),
});

export const workspaceSchema = z.object({
  brandName: z.string().trim().min(2, "Introduce el nombre de la marca"),
  domain: z.string().trim().optional(),
  country: z.string().trim().length(2, "Usa un codigo de pais de 2 letras"),
  brandStatement: z.string().trim().optional(),
});

export function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
