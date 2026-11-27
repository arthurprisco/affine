import { z } from "zod";

const text = z.string().trim().min(1, "Obrigatório.");

/** Data AAAA-MM-DD que existe no calendário (recusa 2026-02-30). */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD.")
  .refine((value) => {
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(y!, m! - 1, d!);
    return date.getFullYear() === y && date.getMonth() === m! - 1 && date.getDate() === d;
  }, "Data inválida.");

/** Corpo do POST. As etapas não vêm do cliente: são copiadas da receita. */
export const batchInputSchema = z.object({
  recipeId: text,
  code: text.max(40, "Máximo de 40 caracteres."),
  quantity: z.number().positive("Deve ser maior que zero."),
  unit: text,
  startDate: isoDate,
  notes: text.nullish(),
});

export const batchParamsSchema = z.object({ id: text });

export const batchStepParamsSchema = z.object({ id: text, stepId: text });

export const stepCompletionSchema = z.object({
  completed: z.boolean(),
  /** Observação da conclusão (ex.: "pH 5,2"). Ignorada ao desfazer. */
  notes: z.string().trim().max(500, "Máximo de 500 caracteres.").nullish(),
});

export type StepCompletionInput = z.infer<typeof stepCompletionSchema>;

export type BatchInput = z.infer<typeof batchInputSchema>;
