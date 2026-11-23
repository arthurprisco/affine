// Camada de acesso a dados das receitas: só consultas Drizzle, sem regra de negócio.
// Toda leitura/escrita filtra por userId, para que um usuário nunca alcance dados de outro.
import { and, count, eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { batch, recipe, step } from "../../db/schema/production-schema.ts";

export type RecipeRow = typeof recipe.$inferInsert;
export type StepRow = Omit<typeof step.$inferInsert, "recipeId">;

const withOrderedSteps = { steps: { orderBy: { position: "asc" } } } as const;

export function findAllByUser(userId: string, archived: boolean) {
  return db.query.recipe.findMany({
    where: { userId, archivedAt: archived ? { isNotNull: true } : { isNull: true } },
    with: withOrderedSteps,
    orderBy: { name: "asc" },
  });
}

export function findByIdForUser(id: string, userId: string) {
  return db.query.recipe.findFirst({
    where: { id, userId },
    with: withOrderedSteps,
  });
}

export async function insertWithSteps(data: RecipeRow, steps: StepRow[]): Promise<string> {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(recipe).values(data).returning({ id: recipe.id });
    await tx.insert(step).values(steps.map((s) => ({ ...s, recipeId: created!.id })));
    return created!.id;
  });
}

/** Atualiza a receita e substitui todas as etapas. Retorna false se a receita não for do usuário. */
export async function updateWithSteps(
  id: string,
  userId: string,
  data: Partial<RecipeRow>,
  steps: StepRow[],
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const updated = await tx
      .update(recipe)
      .set(data)
      .where(and(eq(recipe.id, id), eq(recipe.userId, userId)))
      .returning({ id: recipe.id });
    if (updated.length === 0) return false;

    // batch_step guarda cópia das etapas e step_id vira null, então recriar é seguro
    await tx.delete(step).where(eq(step.recipeId, id));
    await tx.insert(step).values(steps.map((s) => ({ ...s, recipeId: id })));
    return true;
  });
}

export async function setArchivedAt(
  id: string,
  userId: string,
  archivedAt: Date | null,
): Promise<boolean> {
  const updated = await db
    .update(recipe)
    .set({ archivedAt })
    .where(and(eq(recipe.id, id), eq(recipe.userId, userId)))
    .returning({ id: recipe.id });
  return updated.length > 0;
}

export async function deleteById(id: string, userId: string): Promise<void> {
  await db.delete(recipe).where(and(eq(recipe.id, id), eq(recipe.userId, userId)));
}

export async function countBatches(recipeId: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(batch)
    .where(eq(batch.recipeId, recipeId));
  return row?.total ?? 0;
}
