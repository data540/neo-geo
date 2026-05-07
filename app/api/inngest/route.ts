import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { aggregateDailyMetrics } from "@/lib/inngest/functions/aggregate-daily-metrics";
import { executePromptRunFunction } from "@/lib/inngest/functions/execute-prompt-run";
import { runScheduledPrompts } from "@/lib/inngest/functions/run-scheduled-prompts";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runScheduledPrompts, executePromptRunFunction, aggregateDailyMetrics],
});
