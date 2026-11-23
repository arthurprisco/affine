// Regras de negócio das receitas. Não conhece Express: recebe dados já validados
// e lança AppError quando uma regra é violada.
import { AppError, notFound } from "../../errors/app-error.ts";
import * as RecipeModel from "./recipe.model.ts";
import type { RecipeInput } from "./recipe.schemas.ts";
import { totalDays } from "../../shared/duration.ts";

const recipeNotFound = () => notFound("Receita não encontrada.");

/** Converte o corpo da requisição nas linhas de receita/etapas que o model grava. */
function toRows(input: RecipeInput) {
  const steps = input.steps.map((s, i) => ({
    position: i + 1,
    name: s.name,
    duration: s.duration,
    durationUnit: s.durationUnit,
    description: s.description ?? null,
  }));

  return {
    recipe: {
      name: input.name,
      category: input.category,
      description: input.description ?? null,
      // a maturação é sempre a soma das etapas em dias (arredondada para cima); o cliente não envia
      maturationDays: totalDays(steps),
    },
    steps,
  };
}

export function list(userId: string, archived: boolean) {
  return RecipeModel.findAllByUser(userId, archived);
}

export async function getById(id: string, userId: string) {
  // receita de outro usuário também vira 404, para não revelar que ela existe
  const found = await RecipeModel.findByIdForUser(id, userId);
  if (!found) throw recipeNotFound();
  return found;
}

export async function create(userId: string, input: RecipeInput) {
  const rows = toRows(input);
  const id = await RecipeModel.insertWithSteps({ ...rows.recipe, userId }, rows.steps);
  return getById(id, userId);
}

export async function update(id: string, userId: string, input: RecipeInput) {
  const rows = toRows(input);
  const updated = await RecipeModel.updateWithSteps(id, userId, rows.recipe, rows.steps);
  if (!updated) throw recipeNotFound();
  return getById(id, userId);
}

export async function setArchived(id: string, userId: string, archived: boolean) {
  const updated = await RecipeModel.setArchivedAt(id, userId, archived ? new Date() : null);
  if (!updated) throw recipeNotFound();
  return getById(id, userId);
}

export async function remove(id: string, userId: string) {
  await getById(id, userId);

  if ((await RecipeModel.countBatches(id)) > 0) {
    throw new AppError(
      409,
      "Esta receita já tem lotes e não pode ser excluída. Arquive-a em vez disso.",
      "RECIPE_HAS_BATCHES",
    );
  }

  await RecipeModel.deleteById(id, userId);
}
