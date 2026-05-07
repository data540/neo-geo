import OpenAI from "openai";
import { logger } from "@/lib/logger";

function cosineSimilarity(a: number[], b: number[]) {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < length; index += 1) {
    const valueA = a[index] ?? 0;
    const valueB = b[index] ?? 0;
    dot += valueA * valueB;
    magnitudeA += valueA * valueA;
    magnitudeB += valueB * valueB;
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

async function createEmbedding(client: OpenAI, input: string) {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });

  return response.data[0]?.embedding ?? [];
}

export async function computeBrandConsistency(brandStatement: string | null, context: string) {
  if (!brandStatement || !process.env.OPENAI_API_KEY) {
    return null;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const [statementEmbedding, contextEmbedding] = await Promise.all([
      createEmbedding(client, brandStatement),
      createEmbedding(client, context),
    ]);

    return Math.max(0, Math.min(1, cosineSimilarity(statementEmbedding, contextEmbedding)));
  } catch (error) {
    logger.warn({ error }, "No se pudo calcular consistencia de marca");
    return null;
  }
}
