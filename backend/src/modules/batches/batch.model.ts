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

/** Alteração em uma etapa de lote: só os campos presentes são gravados. */
export type StepChange = {
  batchId: string;
  id: string;
  completedAt?: string | null;
  notes?: string | null;
  plannedDate?: string;
  autoAdvance?: boolean;
};

/** Aplica as alterações numa transação, só em etapas de lotes do usuário. */
export async function applyStepChanges(userId: string, changes: StepChange[]): Promise<void> {
  if (!changes.length) return;
  await db.transaction(async (tx) => {
    for (const { batchId, id, ...fields } of changes) {
      const ownBatch = tx
        .select({ id: batch.id })
        .from(batch)
        .where(and(eq(batch.id, batchId), eq(batch.userId, userId)));
      await tx
        .update(batchStep)
        .set(fields)
        .where(
          and(
            eq(batchStep.id, id),
            eq(batchStep.batchId, batchId),
            inArray(batchStep.batchId, ownBatch),
          ),
        );
    }
  });
}

/** Apaga o lote (as etapas vão em cascata). Retorna false se não for do usuário. */
export async function deleteById(id: string, userId: string): Promise<boolean> {
  const deleted = await db
    .delete(batch)
    .where(and(eq(batch.id, id), eq(batch.userId, userId)))
    .returning({ id: batch.id });
  return deleted.length > 0;
}
