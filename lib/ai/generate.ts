import "server-only";
import type { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, AI_MODEL } from "@/lib/ai/client";

type SystemParam = Anthropic.MessageCreateParamsNonStreaming["system"];

async function runStructured<S extends z.ZodType>({
  schema,
  system,
  messages,
  maxTokens = 4096,
}: {
  schema: S;
  system: SystemParam;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
}): Promise<z.infer<S>> {
  const message = await anthropic.messages.parse({
    model: AI_MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { format: zodOutputFormat(schema) },
  });

  if (!message.parsed_output) {
    throw new Error("La génération IA n'a pas pu être analysée.");
  }

  return message.parsed_output;
}

// Génération en un tour : un prompt unique, une réponse structurée.
export function generateStructured<S extends z.ZodType>(params: {
  schema: S;
  system: SystemParam;
  prompt: string;
  maxTokens?: number;
}) {
  const { prompt, ...rest } = params;
  return runStructured({ ...rest, messages: [{ role: "user", content: prompt }] });
}

// Génération avec historique de conversation (conseiller).
export function generateStructuredChat<S extends z.ZodType>(params: {
  schema: S;
  system: SystemParam;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
}) {
  return runStructured(params);
}
