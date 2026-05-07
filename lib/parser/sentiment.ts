import OpenAI from "openai";
import { z } from "zod";
import { logger } from "@/lib/logger";

export type MentionSentiment = {
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  reason: string;
};

const sentimentSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  score: z.number().min(-1).max(1),
  reason: z.string().optional().default(""),
});

export async function computeSentiment(context: string): Promise<MentionSentiment> {
  if (!process.env.OPENAI_API_KEY) {
    return { sentiment: "neutral", score: 0, reason: "OPENAI_API_KEY no configurada" };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-5-nano",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Clasifica el sentimiento hacia la marca en el contexto. Responde solo JSON con {"sentiment":"positive|neutral|negative","score":number,"reason":"string"}.',
        },
        { role: "user", content: context },
      ],
    });

    const content = response.choices[0]?.message.content ?? "{}";
    return sentimentSchema.parse(JSON.parse(content));
  } catch (error) {
    logger.warn({ error }, "No se pudo calcular sentimiento");
    return { sentiment: "neutral", score: 0, reason: "Fallback por error de clasificacion" };
  }
}
