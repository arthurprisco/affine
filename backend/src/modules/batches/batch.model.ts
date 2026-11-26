// Camada de acesso a dados dos lotes: só consultas Drizzle, sem regra de negócio.
// Toda leitura/escrita filtra por userId, para que um usuário nunca alcance dados de outro.
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { batch, batchStep } from "../../db/schema/production-schema.ts";

export type BatchRow = typeof batch.$inferInsert;
export type BatchStepRow = Omit<typeof batchStep.$inferInsert, "batchId">;

const withDetails = {
  steps: { orderBy: { position: "asc" } },
  recipe: { columns: { id: true, name: true, category: true } },
} as const;

export function findAllByUser(userId: string) {
  return db.query.batch.findMany({
    where: { userId },
    with: withDetails,
    orderBy: { startDate: "desc", createdAt: "desc" },
  });
}

export function findByIdForUser(id: string, userId: string) {
  return db.query.batch.findFirst({ where: { id, userId }, with: withDetails });
}

export async function existsCode(userId: string, code: string): Promise<boolean> {
  const found = await db.query.batch.findFirst({
    where: { userId, code },
    columns: { id: true },
  });
  return !!found;
}

export async function insertWithSteps(data: BatchRow, steps: BatchStepRow[]): Promise<string> {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(batch).values(data).returning({ id: batch.id });
    await tx.insert(batchStep).values(steps.map((s) => ({ ...s, batchId: created!.id })));
    return created!.id;
  });
}

/** Marca/desmarca uma etapa. Retorna false se a etapa não for de um lote do usuário. */
export async function setStepCompletedAt(
  batchId: string,
  stepId: string,
  userId: string,
  completedAt: string | null,
): Promise<boolean> {
  const ownBatch = db
    .select({ id: batch.id })
    .from(batch)
    .where(and(eq(batch.id, batchId), eq(batch.userId, userId)));

  const updated = await db
    .update(batchStep)
    .set({ completedAt })
    .where(
      and(
        eq(batchStep.id, stepId),
        eq(batchStep.batchId, batchId),
        inArray(batchStep.batchId, ownBatch),
      ),
    )
    .returning({ id: batchStep.id });
  return updated.length > 0;
}

/** Apaga o lote (as etapas vão em cascata). Retorna false se não for do usuário. */
export async function deleteById(id: string, userId: string): Promise<boolean> {
  const deleted = await db
    .delete(batch)
    .where(and(eq(batch.id, id), eq(batch.userId, userId)))
    .returning({ id: batch.id });
  return deleted.length > 0;
}
