// Regras de negócio dos lotes. Não conhece Express: recebe dados já validados
// e lança AppError quando uma regra é violada.
import { AppError, notFound } from "../../errors/app-error.ts";
import * as RecipeModel from "../recipes/recipe.model.ts";
import * as BatchModel from "./batch.model.ts";
import type { BatchInput, StepCompletionInput } from "./batch.schemas.ts";
import {
  dueAutoSteps,
  planBatchSteps,
  replanPending,
  todayISO,
} from "../../shared/schedule.ts";

const batchNotFound = () => notFound("Lote não encontrado.");

type LoadedBatch = NonNullable<Awaited<ReturnType<typeof BatchModel.findByIdForUser>>>;

/**
 * Conclui as etapas automáticas que já venceram (não há agendador: o avanço é aplicado
 * na leitura). Devolve true se gravou alguma coisa, para quem chamou reler os lotes.
 */
async function advanceDueSteps(userId: string, batches: LoadedBatch[]) {
  const today = todayISO();
  const changes = batches.flatMap((b) =>
    dueAutoSteps(b.startDate, b.steps, today).map((due) => ({ batchId: b.id, ...due })),
  );
  await BatchModel.applyStepChanges(userId, changes);
  return changes.length > 0;
}

export async function list(userId: string) {
  const batches = await BatchModel.findAllByUser(userId);
  if (await advanceDueSteps(userId, batches)) return BatchModel.findAllByUser(userId);
  return batches;
}

export async function getById(id: string, userId: string) {
  // lote de outro usuário também vira 404, para não revelar que ele existe
  const found = await BatchModel.findByIdForUser(id, userId);
  if (!found) throw batchNotFound();
  if (await advanceDueSteps(userId, [found])) {
    return (await BatchModel.findByIdForUser(id, userId))!;
  }
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
    autoAdvance: s.autoAdvance,
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

const conflict = (message: string, code: string) => new AppError(409, message, code);

/**
 * Conclui (com a data de hoje) ou desfaz uma etapa, sempre em ordem: só a etapa atual pode ser
 * concluída e só a última concluída pode ser desfeita. Depois, as pendentes são reprevistas a
 * partir da conclusão real da anterior.
 */
export async function setStepCompleted(
  batchId: string,
  stepId: string,
  userId: string,
  { completed, notes }: StepCompletionInput,
) {
  const found = await getById(batchId, userId);
  const index = found.steps.findIndex((s) => s.id === stepId);
  if (index < 0) throw notFound("Etapa não encontrada.");
  const target = found.steps[index]!;
  const today = todayISO();

  const change: BatchModel.StepChange = { batchId, id: stepId };
  if (completed) {
    if (found.startDate > today) {
      throw conflict("O lote ainda não começou.", "BATCH_NOT_STARTED");
    }
    if (target.completedAt) {
      throw conflict("Esta etapa já foi concluída.", "STEP_ALREADY_COMPLETED");
    }
    if (found.steps.findIndex((s) => !s.completedAt) !== index) {
      throw conflict("Conclua as etapas anteriores primeiro.", "STEP_OUT_OF_ORDER");
    }
    change.completedAt = today;
    if (notes !== undefined) change.notes = notes?.trim() || null;
  } else {
    if (!target.completedAt) {
      throw conflict("Esta etapa ainda não foi concluída.", "STEP_NOT_COMPLETED");
    }
    if (found.steps.findLastIndex((s) => s.completedAt) !== index) {
      throw conflict("Desfaça as etapas seguintes primeiro.", "STEP_OUT_OF_ORDER");
    }
    change.completedAt = null;
    // sem isso a próxima leitura concluiria a etapa de novo; a partir daqui ela espera confirmação
    if (target.autoAdvance) change.autoAdvance = false;
  }

  const steps = found.steps.map((s) =>
    s.id === stepId
      ? { ...s, completedAt: change.completedAt ?? null, autoAdvance: change.autoAdvance ?? s.autoAdvance }
      : s,
  );
  const replanned = replanPending(found.startDate, steps).map((r) => ({ batchId, ...r }));

  await BatchModel.applyStepChanges(userId, [change, ...replanned]);
  return getById(batchId, userId);
}

export async function remove(id: string, userId: string) {
  if (!(await BatchModel.deleteById(id, userId))) throw batchNotFound();
}
