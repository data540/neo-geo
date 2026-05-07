import { type NextRequest, NextResponse } from "next/server";
import { executePromptAcrossLlms } from "@/lib/prompts/execute-prompt-run";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RunRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RunRouteContext) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const results = await executePromptAcrossLlms(supabase, id);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Prompt no encontrado" }, { status: 404 });
  }
}
