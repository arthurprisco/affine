// Povoa o banco de desenvolvimento com dados de demonstração.
// Uso: npm run db:reset (ou npm run db:seed num banco recém-migrado).
// As datas são relativas a hoje, para sempre haver lotes em todos os estados.
import { auth } from "../../auth.ts";
import { db } from "./index.ts";
import { recipe, step, batch, batchStep } from "./schema/production-schema.ts";

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

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function toISODate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const TODAY = fromToday(0);
const YEAR = today.getFullYear();

// ---------- dados ----------

type RecipeSeed = {
  key: string;
  name: string;
  category: string;
  description: string;
  shelfLifeDays: number;
  steps: { name: string; durationDays: number; description?: string }[];
};

type BatchSeed = {
  recipeKey: string;
  code: string;
  quantity: number;
  unit: string;
  /** Início do lote em dias a partir de hoje (negativo = passado). */
  startOffset: number;
  notes?: string;
  /** Deixa a primeira etapa vencida sem concluir, simulando atraso. */
  delayed?: boolean;
};

const demoRecipes: RecipeSeed[] = [
  {
    key: "canastra",
    name: "Queijo Canastra",
    category: "queijo",
    description: "Queijo de leite cru da Serra da Canastra, casca amarelada.",
    shelfLifeDays: 60,
    steps: [
      { name: "Coagulação", durationDays: 1 },
      { name: "Enformagem e prensagem", durationDays: 1 },
      { name: "Salga a seco", durationDays: 2 },
      { name: "Viragem diária", durationDays: 10 },
      { name: "Maturação final", durationDays: 8 },
    ],
  },
  {
    key: "gouda",
    name: "Queijo Gouda",
    category: "queijo",
    description: "Massa lavada, parafinado, sabor amanteigado.",
    shelfLifeDays: 90,
    steps: [
      { name: "Coagulação", durationDays: 1 },
      { name: "Prensagem", durationDays: 1 },
      { name: "Salmoura", durationDays: 3 },
      { name: "Secagem", durationDays: 5 },
      { name: "Parafinação", durationDays: 1 },
      { name: "Maturação", durationDays: 34 },
    ],
  },
  {
    key: "parmesao",
    name: "Queijo Parmesão",
    category: "queijo",
    description: "Massa cozida e prensada, maturação longa.",
    shelfLifeDays: 365,
    steps: [
      { name: "Coagulação", durationDays: 1 },
      { name: "Cozimento da massa", durationDays: 1 },
      { name: "Prensagem", durationDays: 2 },
      { name: "Salmoura", durationDays: 20 },
      { name: "Viragem semanal", durationDays: 30 },
      { name: "Maturação", durationDays: 120 },
      { name: "Limpeza e embalagem", durationDays: 6 },
    ],
  },
  {
    key: "tinto",
    name: "Vinho Tinto Seco",
    category: "vinho",
    description: "Corte de Cabernet Sauvignon e Merlot.",
    shelfLifeDays: 730,
    steps: [
      { name: "Desengace e esmagamento", durationDays: 1 },
      { name: "Fermentação alcoólica", durationDays: 10 },
      { name: "Prensagem", durationDays: 1 },
      { name: "Fermentação malolática", durationDays: 28 },
      { name: "Trasfega", durationDays: 2 },
      { name: "Estágio em barrica", durationDays: 70 },
      { name: "Engarrafamento", durationDays: 8 },
    ],
  },
];

const demoBatches: BatchSeed[] = [
  // Canastra: 22 dias de maturação + 60 de validade
  { recipeKey: "canastra", code: "QJ101", quantity: 20, unit: "unidades", startOffset: -70 }, // pronto
  { recipeKey: "canastra", code: "QJ102", quantity: 20, unit: "unidades", startOffset: -20 }, // maturando, quase pronto
  { recipeKey: "canastra", code: "QJ103", quantity: 12, unit: "unidades", startOffset: -78, notes: "Vender primeiro." }, // vence em 4 dias
  { recipeKey: "canastra", code: "QJ104", quantity: 25, unit: "unidades", startOffset: 5 }, // planejado
  { recipeKey: "canastra", code: "QJ105", quantity: 18, unit: "unidades", startOffset: 0 }, // começa hoje
  // Gouda: 45 + 90
  { recipeKey: "gouda", code: "GD201", quantity: 15, unit: "unidades", startOffset: -30 }, // maturando
  { recipeKey: "gouda", code: "GD202", quantity: 8, unit: "unidades", startOffset: -140 }, // vencido
  { recipeKey: "gouda", code: "GD203", quantity: 10, unit: "unidades", startOffset: -10, delayed: true, notes: "Salmoura atrasada." }, // atrasado
  // Parmesão: 180 + 365
  { recipeKey: "parmesao", code: "PR301", quantity: 6, unit: "unidades", startOffset: -100 }, // maturando
  { recipeKey: "parmesao", code: "PR302", quantity: 6, unit: "unidades", startOffset: -2 }, // em produção
  // Vinho tinto: 120 + 730
  { recipeKey: "tinto", code: "VT401", quantity: 220, unit: "L", startOffset: -60 }, // em estágio
  { recipeKey: "tinto", code: "VT402", quantity: 180, unit: "L", startOffset: -125 }, // pronto
];

const otherRecipes: RecipeSeed[] = [
  {
    key: "frescal",
    name: "Queijo Minas Frescal",
    category: "queijo",
    description: "Queijo fresco, sem maturação.",
    shelfLifeDays: 10,
    steps: [
      { name: "Coagulação", durationDays: 1 },
      { name: "Salga e embalagem", durationDays: 1 },
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
  const recipeIds = new Map<string, string>();
  const recipeSteps = new Map<string, (typeof step.$inferSelect)[]>();
  const maturation = new Map<string, number>();
  const shelfLife = new Map<string, number>();

  for (const r of recipes) {
    const maturationDays = r.steps.reduce((sum, s) => sum + s.durationDays, 0);
    const [created] = await tx
      .insert(recipe)
      .values({
        userId,
        name: r.name,
        category: r.category,
        description: r.description,
        maturationDays,
        shelfLifeDays: r.shelfLifeDays,
      })
      .returning();
    const steps = await tx
      .insert(step)
      .values(r.steps.map((s, i) => ({ ...s, recipeId: created!.id, position: i + 1 })))
      .returning();

    recipeIds.set(r.key, created!.id);
    recipeSteps.set(r.key, steps.sort((a, b) => a.position - b.position));
    maturation.set(r.key, maturationDays);
    shelfLife.set(r.key, r.shelfLifeDays);
  }

  for (const b of batches) {
    const startDate = fromToday(b.startOffset);
    const [created] = await tx
      .insert(batch)
      .values({
        userId,
        recipeId: recipeIds.get(b.recipeKey)!,
        code: `${YEAR}${b.code}`,
        quantity: b.quantity,
        unit: b.unit,
        startDate,
        expirationDate: addDays(
          startDate,
          maturation.get(b.recipeKey)! + shelfLife.get(b.recipeKey)!,
        ),
        notes: b.notes ?? null,
      })
      .returning();

    // Cópia das etapas da receita: data prevista = fim acumulado de cada etapa.
    let plannedDate = startDate;
    const rows = recipeSteps.get(b.recipeKey)!.map((s) => {
      plannedDate = addDays(plannedDate, s.durationDays);
      return {
        batchId: created!.id,
        stepId: s.id,
        position: s.position,
        name: s.name,
        durationDays: s.durationDays,
        plannedDate,
        completedAt: plannedDate <= TODAY ? plannedDate : null,
      };
    });

    if (b.delayed) {
      // a última etapa com prazo já vencido fica pendente, e as seguintes também
      const overdue = rows.findLastIndex((r) => r.plannedDate < TODAY);
      if (overdue >= 0) rows.slice(overdue).forEach((r) => (r.completedAt = null));
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
