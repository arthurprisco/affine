// Regras de negócio dos lotes. Não conhece Express: recebe dados já validados
// e lança AppError quando uma regra é violada.
import { AppError, notFound } from "../../errors/app-error.ts";
import * as RecipeModel from "../recipes/recipe.model.ts";
import * as BatchModel from "./batch.model.ts";
import type { BatchInput } from "./batch.schemas.ts";
import { planBatchSteps, todayISO } from "../../shared/schedule.ts";

const batchNotFound = () => notFound("Lote não encontrado.");

export function list(userId: string) {
  return BatchModel.findAllByUser(userId);
}

export async function getById(id: string, userId: string) {
  // lote de outro usuário também vira 404, para não revelar que ele existe
  const found = await BatchModel.findByIdForUser(id, userId);
  if (!found) throw batchNotFound();
  return found;
}

export async function create(userId: string, input: BatchInput) {
  const recipe = await RecipeModel.findByIdForUser(input.recipeId, userId);
  if (!recipe) throw notFound("Receita não encontrada.");
  if (recipe.archivedAt) {
    throw new AppError(
      409,
      "Esta receita está arquivada. Desarquive-a para cadastrar lotes.",
      "RECIPE_ARCHIVED",
    );
  }

  if (await BatchModel.existsCode(userId, input.code)) {
    throw new AppError(409, "Já existe um lote com esse código.", "BATCH_CODE_TAKEN");
  }

  // cópia das etapas: editar a receita depois não muda o histórico do lote
  const steps = planBatchSteps(input.startDate, recipe.steps).map((s) => ({
    stepId: s.id,
    position: s.position,
    name: s.name,
    duration: s.duration,
    durationUnit: s.durationUnit,
    plannedDate: s.plannedDate,
  }));

  const id = await BatchModel.insertWithSteps(
    {
      userId,
      recipeId: recipe.id,
      code: input.code,
      quantity: input.quantity,
      unit: input.unit,
      startDate: input.startDate,
      notes: input.notes ?? null,
    },
    steps,
  );
  return getById(id, userId);
}

export async function setStepCompleted(
  batchId: string,
  stepId: string,
  userId: string,
  completed: boolean,
) {
  const updated = await BatchModel.setStepCompletedAt(
    batchId,
    stepId,
    userId,
    completed ? todayISO() : null,
  );
  if (!updated) throw notFound("Etapa não encontrada.");
  return getById(batchId, userId);
}

export async function remove(id: string, userId: string) {
  if (!(await BatchModel.deleteById(id, userId))) throw batchNotFound();
}
