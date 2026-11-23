import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  date,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema.ts";
import { DURATION_UNITS } from "../../shared/duration.ts";

export const durationUnit = pgEnum("duration_unit", DURATION_UNITS);

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

/**
 * Receita de produto (ex.: Queijo Canastra). Com lotes, é arquivada em vez de apagada.
 * `maturation_days` = soma das etapas convertida em dias, arredondada para cima.
 */
export const recipe = pgTable(
  "recipe",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    maturationDays: integer("maturation_days").notNull(),
    archivedAt: timestamp("archived_at"),
    ...timestamps,
  },
  (table) => [index("recipe_userId_idx").on(table.userId)],
);

/** Etapa-modelo de uma receita, em ordem (`position`). */
export const step = pgTable(
  "step",
  {
    id: id(),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipe.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    name: text("name").notNull(),
    duration: integer("duration").notNull(),
    durationUnit: durationUnit("duration_unit").notNull(),
    description: text("description"),
  },
  (table) => [unique("step_recipe_position_uq").on(table.recipeId, table.position)],
);

/** Lote produzido a partir de uma receita. Status é derivado de batch_step + expiration_date. */
export const batch = pgTable(
  "batch",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipe.id, { onDelete: "restrict" }),
    code: text("code").notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2, mode: "number" }).notNull(),
    unit: text("unit").notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    expirationDate: date("expiration_date", { mode: "string" }).notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    unique("batch_user_code_uq").on(table.userId, table.code),
    index("batch_userId_idx").on(table.userId),
    index("batch_recipeId_idx").on(table.recipeId),
  ],
);

/**
 * Etapa executada de um lote. Copia nome/ordem/duração (+ unidade) da etapa-modelo na criação
 * do lote, para que editar a receita não altere o histórico.
 */
export const batchStep = pgTable(
  "batch_step",
  {
    id: id(),
    batchId: text("batch_id")
      .notNull()
      .references(() => batch.id, { onDelete: "cascade" }),
    stepId: text("step_id").references(() => step.id, { onDelete: "set null" }),
    position: integer("position").notNull(),
    name: text("name").notNull(),
    duration: integer("duration").notNull(),
    durationUnit: durationUnit("duration_unit").notNull(),
    plannedDate: date("planned_date", { mode: "string" }).notNull(),
    completedAt: date("completed_at", { mode: "string" }),
    notes: text("notes"),
  },
  (table) => [unique("batch_step_batch_position_uq").on(table.batchId, table.position)],
);
