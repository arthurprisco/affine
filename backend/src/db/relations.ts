import { defineRelations } from "drizzle-orm";
import { user, session, account } from "./schema/auth-schema.ts";
import { recipe, step, batch, batchStep } from "./schema/production-schema.ts";

export const relations = defineRelations(
  { user, session, account, recipe, step, batch, batchStep },
  (r) => ({
    user: {
      session: r.many.session(),
      account: r.many.account(),
      recipes: r.many.recipe(),
      batches: r.many.batch(),
    },
    session: {
      user: r.one.user({ from: r.session.userId, to: r.user.id, optional: false }),
    },
    account: {
      user: r.one.user({ from: r.account.userId, to: r.user.id, optional: false }),
    },
    recipe: {
      user: r.one.user({ from: r.recipe.userId, to: r.user.id, optional: false }),
      steps: r.many.step(),
      batches: r.many.batch(),
    },
    step: {
      recipe: r.one.recipe({ from: r.step.recipeId, to: r.recipe.id, optional: false }),
    },
    batch: {
      user: r.one.user({ from: r.batch.userId, to: r.user.id, optional: false }),
      recipe: r.one.recipe({ from: r.batch.recipeId, to: r.recipe.id, optional: false }),
      steps: r.many.batchStep(),
    },
    batchStep: {
      batch: r.one.batch({ from: r.batchStep.batchId, to: r.batch.id, optional: false }),
      step: r.one.step({ from: r.batchStep.stepId, to: r.step.id }),
    },
  }),
);
