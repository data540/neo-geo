import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "neo-geo",
  name: "neo-geo",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export type PromptRunRequestedEvent = {
  name: "prompt.run.requested";
  data: {
    prompt_id: string;
    llm_id: string;
  };
};
