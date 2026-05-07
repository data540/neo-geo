import { inngest } from "@/lib/inngest/client";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

type ScheduledPrompt = {
  id: string;
  prompt_llms: { llm_id: string }[];
};

export const runScheduledPrompts = inngest.createFunction(
  { id: "run-scheduled-prompts", triggers: [{ cron: "0 */6 * * *" }] },
  async ({ step }) => {
    const prompts = await step.run("load-active-prompts", async () => {
      const supabase = createSupabaseServiceClient();
      const { data, error } = await supabase
        .from("prompts")
        .select("id,prompt_llms(llm_id)")
        .eq("status", "active");

      if (error) {
        throw error;
      }

      return (data ?? []) as ScheduledPrompt[];
    });

    const events = prompts.flatMap((prompt: ScheduledPrompt) =>
      prompt.prompt_llms.map((promptLlm) => ({
        name: "prompt.run.requested" as const,
        data: {
          prompt_id: prompt.id,
          llm_id: promptLlm.llm_id,
        },
      })),
    );

    if (events.length > 0) {
      await step.sendEvent("dispatch-prompt-runs", events);
    }

    return { dispatched: events.length };
  },
);
