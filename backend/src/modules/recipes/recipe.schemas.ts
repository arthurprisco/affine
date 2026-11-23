import { z } from "zod";

const text = z.string().trim().min(1, "Obrigatório.");
const days = z.number().int("Deve ser um número inteiro.").min(1, "Mínimo de 1 dia.");

export const stepInputSchema = z.object({
  name: text,
  durationDays: days,
  description: text.nullish(),
});

/** Corpo do POST e do PUT: a receita completa, com as etapas na ordem de execução. */
export const recipeInputSchema = z.object({
  name: text,
  category: text,
  description: text.nullish(),
  shelfLifeDays: days,
  steps: z.array(stepInputSchema).min(1, "A receita precisa de pelo menos uma etapa."),
});

export const recipeParamsSchema = z.object({ id: text });

export const listRecipesQuerySchema = z.object({
  archived: z.enum(["true", "false"]).default("false").transform((v) => v === "true"),
});

export type RecipeInput = z.infer<typeof recipeInputSchema>;
