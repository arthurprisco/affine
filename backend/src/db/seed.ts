// Povoa o banco de desenvolvimento com dados de demonstração.
// Uso: npm run db:reset (ou npm run db:seed num banco recém-migrado).
// As datas são relativas a hoje, para sempre haver lotes em todos os estados.
import { auth } from "../../auth.ts";
import { db } from "./index.ts";
import { recipe, step, batch, batchStep } from "./schema/production-schema.ts";
import { totalDays, type DurationUnit } from "../shared/duration.ts";
import { planBatchSteps, toISODate } from "../shared/schedule.ts";

const PASSWORD = "affine123";

// ---------- datas ----------

const today = new Date();
today.setHours(0, 0, 0, 0);

/** Data `days` dias a partir de hoje (negativo = passado), em YYYY-MM-DD. */
function fromToday(days: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

const TODAY = fromToday(0);
const YEAR = today.getFullYear();

// ---------- dados ----------

/** `auto` = etapa de espera, que avança sozinha na data prevista. */
type StepSeed = [name: string, duration: number, unit: DurationUnit, auto?: "auto"];

type RecipeSeed = {
  key: string;
  name: string;
  category: string;
  description?: string;
  steps: StepSeed[];
};

type BatchSeed = {
  recipeKey: string;
  code: string;
  quantity: number;
  unit: string;
  /** Início do lote em dias a partir de hoje (negativo = passado). */
  startOffset: number;
  notes?: string;
  /** Deixa a última etapa com prazo já passado (e as seguintes) sem concluir, simulando atraso. */
  delayed?: boolean;
};

// Mesmas receitas da antiga maquete do app (RecipesContext).
const demoRecipes: RecipeSeed[] = [
  {
    key: "canastra",
    name: "Queijo Canastra",
    category: "Queijo",
    description: "Queijo de leite cru da Serra da Canastra, casca amarelada.",
    steps: [
      ["Aquecer o leite a 35 °C", 30, "minutos"],
      ["Adicionar pingo e coalho", 40, "minutos"],
      ["Cortar a coalhada", 15, "minutos"],
      ["Enformar e prensar", 12, "horas"],
      ["Salgar e maturar", 22, "dias"],
    ],
  },
  {
    key: "minas",
    name: "Queijo Minas Padrão",
    category: "Queijo",
    steps: [
      ["Pasteurizar o leite", 30, "minutos"],
      ["Coagular", 45, "minutos"],
      ["Enformar", 2, "horas"],
      ["Maturar", 20, "dias", "auto"],
    ],
  },
  {
    key: "parmesao",
    name: "Parmesão Artesanal",
    category: "Queijo",
    description: "Massa cozida e prensada, maturação longa.",
    steps: [
      ["Coagular", 30, "minutos"],
      ["Cozinhar a massa", 1, "horas"],
      ["Prensar", 1, "dias"],
      ["Salmoura", 2, "semanas"],
      ["Maturar", 6, "meses", "auto"],
      ["Virar periodicamente", 6, "meses"],
    ],
  },
  {
    key: "tinto",
    name: "Vinho Tinto Seco",
    category: "Vinho",
    description: "Corte de Cabernet Sauvignon e Merlot.",
    steps: [
      ["Desengaçar e esmagar", 3, "horas"],
      ["Fermentar", 2, "semanas", "auto"],
      ["Prensar", 1, "dias"],
      ["Envelhecer", 1, "anos", "auto"],
    ],
  },
  {
    key: "rose",
    name: "Vinho Rosé",
    category: "Vinho",
    steps: [
      ["Esmagar", 2, "horas"],
      ["Maceração curta", 12, "horas"],
      ["Fermentar", 3, "semanas", "auto"],
      ["Engarrafar", 1, "dias"],
    ],
  },
];

const demoBatches: BatchSeed[] = [
  // Canastra: 23 dias de maturação
  { recipeKey: "canastra", code: "QJ101", quantity: 20, unit: "unidades", startOffset: -70 }, // pronto
  { recipeKey: "canastra", code: "QJ102", quantity: 20, unit: "unidades", startOffset: -20 }, // maturando, quase pronto
  { recipeKey: "canastra", code: "QJ103", quantity: 12, unit: "unidades", startOffset: -79, notes: "Vender primeiro." }, // pronto há mais tempo
  { recipeKey: "canastra", code: "QJ104", quantity: 25, unit: "unidades", startOffset: 5 }, // planejado
  { recipeKey: "canastra", code: "QJ105", quantity: 18, unit: "unidades", startOffset: 0 }, // começa hoje
  // Minas Padrão: 21 dias
  { recipeKey: "minas", code: "MP201", quantity: 15, unit: "unidades", startOffset: -30 }, // pronto
  { recipeKey: "minas", code: "MP202", quantity: 8, unit: "unidades", startOffset: -70 }, // pronto
  { recipeKey: "minas", code: "MP203", quantity: 10, unit: "unidades", startOffset: -10, delayed: true, notes: "Enformagem atrasada." }, // atrasado
  // Parmesão: 376 dias
  { recipeKey: "parmesao", code: "PR301", quantity: 6, unit: "unidades", startOffset: -100 }, // maturando
  { recipeKey: "parmesao", code: "PR302", quantity: 6, unit: "unidades", startOffset: -2 }, // em produção
  // Vinhos
  { recipeKey: "tinto", code: "VT401", quantity: 220, unit: "L", startOffset: -60 }, // envelhecendo
  { recipeKey: "rose", code: "VR402", quantity: 180, unit: "L", startOffset: -40 }, // pronto
];

const otherRecipes: RecipeSeed[] = [
  {
    key: "frescal",
    name: "Queijo Minas Frescal",
    category: "Queijo",
    description: "Queijo fresco, sem maturação.",
    steps: [
      ["Coagular", 40, "minutos"],
      ["Salgar e embalar", 2, "horas"],
    ],
  },
];

const otherBatches: BatchSeed[] = [
  { recipeKey: "frescal", code: "MF501", quantity: 30, unit: "unidades", startOffset: -1 },
  { recipeKey: "frescal", code: "MF502", quantity: 30, unit: "unidades", startOffset: -9 },
];

// ---------- inserção ----------

async function createUser(name: string, email: string): Promise<string> {
  const { user } = await auth.api.signUpEmail({
    body: { name, email, password: PASSWORD },
  });
  return user.id;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function seedUserData(
  tx: Tx,
  userId: string,
  recipes: RecipeSeed[],
  batches: BatchSeed[],
) {
  const byKey = new Map<
    string,
    { id: string; steps: (typeof step.$inferSelect)[] }
  >();

  for (const r of recipes) {
    const stepRows = r.steps.map(([name, duration, durationUnit, auto], i) => ({
      position: i + 1,
      name,
      duration,
      durationUnit,
      autoAdvance: auto === "auto",
    }));
    const maturationDays = totalDays(stepRows);

    const [created] = await tx
      .insert(recipe)
      .values({
        userId,
        name: r.name,
        category: r.category,
        description: r.description ?? null,
        maturationDays,
      })
      .returning();
    const steps = await tx
      .insert(step)
      .values(stepRows.map((s) => ({ ...s, recipeId: created!.id })))
      .returning();

    byKey.set(r.key, {
      id: created!.id,
      steps: steps.sort((a, b) => a.position - b.position),
    });
  }

  for (const b of batches) {
    const r = byKey.get(b.recipeKey)!;
    const startDate = fromToday(b.startOffset);
    const [created] = await tx
      .insert(batch)
      .values({
        userId,
        recipeId: r.id,
        code: `${YEAR}${b.code}`,
        quantity: b.quantity,
        unit: b.unit,
        startDate,
        notes: b.notes ?? null,
      })
      .returning();

    // Cópia das etapas da receita, com a mesma regra de data prevista da API.
    const rows = planBatchSteps(startDate, r.steps).map((s) => {
      const plannedDate = s.plannedDate;
      return {
        batchId: created!.id,
        stepId: s.id,
        position: s.position,
        name: s.name,
        duration: s.duration,
        durationUnit: s.durationUnit,
        autoAdvance: s.autoAdvance,
        plannedDate,
        completedAt: plannedDate <= TODAY ? plannedDate : null,
      };
    });

    if (b.delayed) {
      // a última etapa com prazo já passado fica pendente, e as seguintes também
      const overdue = rows.findLastIndex((row) => row.plannedDate < TODAY);
      if (overdue >= 0) rows.slice(overdue).forEach((row) => (row.completedAt = null));
    }

    await tx.insert(batchStep).values(rows);
  }
}

const demoId = await createUser("Usuário Demo", "demo@affine.dev");
const otherId = await createUser("Outro Produtor", "outro@affine.dev");

await db.transaction(async (tx) => {
  await seedUserData(tx, demoId, demoRecipes, demoBatches);
  await seedUserData(tx, otherId, otherRecipes, otherBatches);
});

await db.$client.end();

console.log(
  `Seed concluído. Login: demo@affine.dev ou outro@affine.dev / senha ${PASSWORD}`,
);
