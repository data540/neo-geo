import { inngest } from "@/lib/inngest/client";
import { executePromptRun } from "@/lib/prompts/execute-prompt-run";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type PromptWithLlms = {
  id: string;
  workspace_id: string;
  text: string;
  country: string | null;
  language: string | null;
  prompt_llms: { llm_id: string }[];
};

export const executePromptRunFunction = inngest.createFunction(
  {
    id: "execute-prompt-run",
    triggers: [{ event: "prompt.run.requested" }],
    concurrency: {
      limit: 5,
      key: "event.data.llm_id",
    },
  },
  async ({ event, step }) => {
    const eventData = event.data as { prompt_id: string; llm_id: string };
    const prompt = await step.run("load-prompt", async () => {
      const supabase = createSupabaseServiceClient();
      const { data, error } = await supabase
        .from("prompts")
        .select("id,workspace_id,text,country,language,prompt_llms(llm_id)")
        .eq("id", eventData.prompt_id)
        .single();

      if (error || !data) {
        throw error ?? new Error("Prompt no encontrado");
      }

      return data as PromptWithLlms;
    });

    return step.run("execute-prompt", async () => {
      const supabase = createSupabaseServiceClient();
      return executePromptRun(supabase, prompt, eventData.llm_id);
    });
  },
);
