import { z } from "zod";
import { DURATION_UNITS } from "../../shared/duration.ts";

const text = z.string().trim().min(1, "Obrigatório.");
const positiveInt = z.number().int("Deve ser um número inteiro.").min(1, "Mínimo de 1.");

export const stepInputSchema = z.object({
  name: text,
  duration: positiveInt,
  durationUnit: z.enum(DURATION_UNITS),
  description: text.nullish(),
  /** Conclui sozinha na data prevista (etapas de espera, como maturar). */
  autoAdvance: z.boolean().default(false),
});

/** Corpo do POST e do PUT: a receita completa, com as etapas na ordem de execução. */
export const recipeInputSchema = z.object({
  name: text,
  category: text,
  description: text.nullish(),
  steps: z.array(stepInputSchema).min(1, "A receita precisa de pelo menos uma etapa."),
});

export const recipeParamsSchema = z.object({ id: text });

export const listRecipesQuerySchema = z.object({
  archived: z.enum(["true", "false"]).default("false").transform((v) => v === "true"),
});

export type RecipeInput = z.infer<typeof recipeInputSchema>;
