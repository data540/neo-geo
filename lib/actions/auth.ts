"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";
import { authSchema, getStringValue } from "@/lib/schemas/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function encodedMessage(type: "error" | "message", text: string) {
  return `${type}=${encodeURIComponent(text)}`;
}

export async function loginAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
  });

  if (!parsed.success) {
    redirect(
      `/login?${encodedMessage("error", parsed.error.issues[0]?.message ?? "Datos no validos")}`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    logger.warn({ error }, "Error en login");
    redirect(`/login?${encodedMessage("error", "No hemos podido iniciar sesion")}`);
  }

  redirect("/onboarding");
}

export async function registerAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
  });

  if (!parsed.success) {
    redirect(
      `/register?${encodedMessage("error", parsed.error.issues[0]?.message ?? "Datos no validos")}`,
    );
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    logger.warn({ error }, "Error en registro");
    redirect(`/register?${encodedMessage("error", "No hemos podido crear la cuenta")}`);
  }

  redirect(
    `/login?${encodedMessage("message", "Cuenta creada. Revisa tu email si Supabase pide confirmacion.")}`,
  );
}

export async function loginWithGoogleAction() {
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error || !data.url) {
    logger.warn({ error }, "Error iniciando OAuth con Google");
    redirect(`/login?${encodedMessage("error", "Google OAuth no esta configurado todavia")}`);
  }

  redirect(data.url);
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
