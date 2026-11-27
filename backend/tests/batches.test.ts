import { describe, it, expect, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../src/app.ts";
import { db } from "../src/db/index.ts";
import { signedUpAgent } from "./helpers.ts";
import { addDays, planBatchSteps, todayISO } from "../src/shared/schedule.ts";

type Agent = Awaited<ReturnType<typeof signedUpAgent>>["agent"];

const recipeBody = {
  name: "Queijo Canastra",
  category: "Queijo",
  steps: [
    { name: "Coagulação", duration: 12, durationUnit: "horas" },
    { name: "Salga a seco", duration: 2, durationUnit: "dias" },
    { name: "Maturação", duration: 3, durationUnit: "semanas" },
  ],
};

async function createRecipe(agent: Agent, body: object = recipeBody) {
  const res = await agent.post("/api/recipes").send(body);
  expect(res.status).toBe(201);
  return res.body;
}

function batchBody(recipeId: string, overrides: object = {}) {
  return {
    recipeId,
    code: "2026QJ001",
    quantity: 20,
    unit: "un",
    startDate: "2026-01-10",
    ...overrides,
  };
}

async function createBatch(agent: Agent, overrides: object = {}) {
  const recipe = await createRecipe(agent);
  const res = await agent.post("/api/batches").send(batchBody(recipe.id, overrides));
  expect(res.status).toBe(201);
  return { recipe, batch: res.body };
}

afterAll(async () => {
  await db.$client.end();
});

describe("autenticação", () => {
  it.each([
    ["get", "/api/batches"],
    ["post", "/api/batches"],
    ["get", "/api/batches/qualquer-id"],
    ["delete", "/api/batches/qualquer-id"],
    ["patch", "/api/batches/qualquer-id/steps/qualquer-etapa"],
  ] as const)("%s %s sem sessão → 401", async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/batches", () => {
  it("cria o lote copiando as etapas da receita com as datas previstas", async () => {
    const { agent, userId } = await signedUpAgent();
    const { recipe, batch } = await createBatch(agent, { notes: "Tanque 2" });

    expect(batch).toMatchObject({
      userId,
      recipeId: recipe.id,
      code: "2026QJ001",
      quantity: 20,
      unit: "un",
      startDate: "2026-01-10",
      notes: "Tanque 2",
      recipe: { id: recipe.id, name: "Queijo Canastra", category: "Queijo" },
    });
    // 12 h → dia 1 (arredonda para cima); +2 dias → 3; +21 dias → 24
    expect(
      batch.steps.map((s: { position: number; name: string; plannedDate: string; completedAt: null }) => [
        s.position,
        s.name,
        s.plannedDate,
        s.completedAt,
      ]),
    ).toEqual([
      [1, "Coagulação", "2026-01-11", null],
      [2, "Salga a seco", "2026-01-13", null],
      [3, "Maturação", "2026-02-03", null],
    ]);
    expect(batch.steps[0]).toMatchObject({ duration: 12, durationUnit: "horas" });
  });

  it("recusa código repetido do mesmo usuário → 409", async () => {
    const { agent } = await signedUpAgent();
    const { recipe } = await createBatch(agent);
    const res = await agent.post("/api/batches").send(batchBody(recipe.id));

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("BATCH_CODE_TAKEN");
  });

  it("permite o mesmo código para outro usuário", async () => {
    const { agent } = await signedUpAgent();
    const outro = await signedUpAgent();
    await createBatch(agent);
    await createBatch(outro.agent);
  });

  it("recusa receita arquivada → 409", async () => {
    const { agent } = await signedUpAgent();
    const recipe = await createRecipe(agent);
    await agent.patch(`/api/recipes/${recipe.id}/archive`);
    const res = await agent.post("/api/batches").send(batchBody(recipe.id));

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("RECIPE_ARCHIVED");
  });

  it("recusa receita de outro usuário → 404", async () => {
    const { agent } = await signedUpAgent();
    const outro = await signedUpAgent();
    const recipe = await createRecipe(outro.agent);
    const res = await agent.post("/api/batches").send(batchBody(recipe.id));

    expect(res.status).toBe(404);
  });

  it.each([
    ["data inexistente", { startDate: "2026-02-30" }],
    ["data fora do formato", { startDate: "10/01/2026" }],
    ["quantidade zero", { quantity: 0 }],
    ["sem código", { code: "  " }],
  ])("recusa %s → 400", async (_caso, overrides) => {
    const { agent } = await signedUpAgent();
    const recipe = await createRecipe(agent);
    const res = await agent.post("/api/batches").send(batchBody(recipe.id, overrides));

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/batches", () => {
  it("lista só os lotes do próprio usuário, mais recentes primeiro", async () => {
    const { agent } = await signedUpAgent();
    const outro = await signedUpAgent();
    const recipe = await createRecipe(agent);
    await agent.post("/api/batches").send(batchBody(recipe.id, { code: "A" }));
    await agent
      .post("/api/batches")
      .send(batchBody(recipe.id, { code: "B", startDate: "2026-02-01" }));
    await createBatch(outro.agent, { code: "DO-OUTRO" });

    const res = await agent.get("/api/batches");

    expect(res.status).toBe(200);
    expect(res.body.map((b: { code: string }) => b.code)).toEqual(["B", "A"]);
    expect(res.body[0].steps).toHaveLength(3);
  });
});

describe("GET /api/batches/:id", () => {
  it("devolve o lote com etapas e receita", async () => {
    const { agent } = await signedUpAgent();
    const { batch } = await createBatch(agent);
    const res = await agent.get(`/api/batches/${batch.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(batch);
  });

  it("lote de outro usuário → 404", async () => {
    const { agent } = await signedUpAgent();
    const outro = await signedUpAgent();
    const { batch } = await createBatch(outro.agent);
    const res = await agent.get(`/api/batches/${batch.id}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });
});

type StepSpec = { name: string; duration: number; durationUnit: string; autoAdvance?: boolean };
type BatchStepBody = { id: string; name: string; plannedDate: string; completedAt: string | null; autoAdvance: boolean; notes: string | null };

const TODAY = todayISO();
const daysAgo = (n: number) => addDays(TODAY, -n);

let codeSeq = 0;

/** Lote de uma receita com as etapas dadas, começando em `startDate` (código único). */
async function batchWithSteps(agent: Agent, steps: StepSpec[], startDate: string) {
  const recipe = await createRecipe(agent, { ...recipeBody, steps });
  const code = `T${++codeSeq}`;
  const res = await agent.post("/api/batches").send(batchBody(recipe.id, { startDate, code }));
  expect(res.status).toBe(201);
  return res.body as { id: string; steps: BatchStepBody[] };
}

function patchStep(agent: Agent, batchId: string, stepId: string, body: object) {
  return agent.patch(`/api/batches/${batchId}/steps/${stepId}`).send(body);
}

const manual = (name: string, duration = 1): StepSpec => ({ name, duration, durationUnit: "dias" });
const auto = (name: string, duration = 1): StepSpec => ({ ...manual(name, duration), autoAdvance: true });

describe("PATCH /api/batches/:id/steps/:stepId", () => {
  it("conclui a etapa atual com a data de hoje e a observação, e desfaz", async () => {
    const { agent } = await signedUpAgent();
    const batch = await batchWithSteps(agent, [manual("Salga"), manual("Embalar")], daysAgo(5));
    const [first] = batch.steps;

    const done = await patchStep(agent, batch.id, first!.id, { completed: true, notes: "  pH 5,2 " });
    expect(done.status).toBe(200);
    expect(done.body.steps[0]).toMatchObject({ completedAt: TODAY, notes: "pH 5,2" });
    expect(done.body.steps[1].completedAt).toBeNull();

    const undone = await patchStep(agent, batch.id, first!.id, { completed: false });
    expect(undone.status).toBe(200);
    // a observação fica guardada para quando a etapa for concluída de novo
    expect(undone.body.steps[0]).toMatchObject({ completedAt: null, notes: "pH 5,2" });
  });

  it("recalcula as pendentes a partir da conclusão real e volta ao plano ao desfazer", async () => {
    const { agent } = await signedUpAgent();
    const start = daysAgo(10);
    const batch = await batchWithSteps(agent, [manual("Salga", 2), manual("Maturação", 7)], start);
    // previsto: salga em start+2, maturação em start+9; a salga é concluída hoje (8 dias de atraso)
    expect(batch.steps[1]!.plannedDate).toBe(addDays(start, 9));

    const done = await patchStep(agent, batch.id, batch.steps[0]!.id, { completed: true });
    expect(done.body.steps[1].plannedDate).toBe(addDays(TODAY, 7));

    const undone = await patchStep(agent, batch.id, batch.steps[0]!.id, { completed: false });
    expect(undone.body.steps.map((s: BatchStepBody) => s.plannedDate)).toEqual(
      planBatchSteps(start, [manual("Salga", 2), manual("Maturação", 7)] as never).map((s) => s.plannedDate),
    );
  });

  it("exige a ordem: concluir a seguinte ou desfazer a anterior → 409 STEP_OUT_OF_ORDER", async () => {
    const { agent } = await signedUpAgent();
    const batch = await batchWithSteps(agent, [manual("A"), manual("B"), manual("C")], daysAgo(5));
    const [a, b] = batch.steps;

    const skip = await patchStep(agent, batch.id, b!.id, { completed: true });
    expect(skip.status).toBe(409);
    expect(skip.body.code).toBe("STEP_OUT_OF_ORDER");

    await patchStep(agent, batch.id, a!.id, { completed: true });
    await patchStep(agent, batch.id, b!.id, { completed: true });
    const undoFirst = await patchStep(agent, batch.id, a!.id, { completed: false });
    expect(undoFirst.status).toBe(409);
    expect(undoFirst.body.code).toBe("STEP_OUT_OF_ORDER");
  });

  it.each([
    ["concluir duas vezes", "STEP_ALREADY_COMPLETED", true],
    ["desfazer etapa pendente", "STEP_NOT_COMPLETED", false],
  ])("recusa %s → 409", async (_caso, code, completed) => {
    const { agent } = await signedUpAgent();
    const batch = await batchWithSteps(agent, [manual("A"), manual("B")], daysAgo(5));
    const stepId = batch.steps[0]!.id;
    if (completed) await patchStep(agent, batch.id, stepId, { completed: true });

    const res = await patchStep(agent, batch.id, stepId, { completed });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe(code);
  });

  it("lote que ainda não começou → 409 BATCH_NOT_STARTED", async () => {
    const { agent } = await signedUpAgent();
    const batch = await batchWithSteps(agent, [manual("A")], addDays(TODAY, 3));
    const res = await patchStep(agent, batch.id, batch.steps[0]!.id, { completed: true });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("BATCH_NOT_STARTED");
  });

  it("etapa de lote de outro usuário → 404", async () => {
    const { agent } = await signedUpAgent();
    const outro = await signedUpAgent();
    const { batch } = await createBatch(outro.agent);
    const res = await patchStep(agent, batch.id, batch.steps[0].id, { completed: true });

    expect(res.status).toBe(404);
  });

  it("recusa corpo sem `completed` → 400", async () => {
    const { agent } = await signedUpAgent();
    const { batch } = await createBatch(agent);
    const res = await patchStep(agent, batch.id, batch.steps[0].id, {});

    expect(res.status).toBe(400);
  });
});

describe("avanço automático", () => {
  it("o lote copia autoAdvance da receita", async () => {
    const { agent } = await signedUpAgent();
    const batch = await batchWithSteps(agent, [manual("Salga"), auto("Maturar", 30)], addDays(TODAY, 1));

    expect(batch.steps.map((s) => s.autoAdvance)).toEqual([false, true]);
  });

  it("conclui sozinha, em cadeia, as automáticas vencidas, na data prevista, até a próxima manual", async () => {
    const { agent } = await signedUpAgent();
    const start = daysAgo(10);
    const batch = await batchWithSteps(
      agent,
      [auto("Descanso", 1), auto("Maturar", 2), manual("Embalar", 1), auto("Envelhecer", 1)],
      start,
    );
    const res = await agent.get(`/api/batches/${batch.id}`);

    expect(res.body.steps.map((s: BatchStepBody) => s.completedAt)).toEqual([
      addDays(start, 1),
      addDays(start, 3),
      null,
      null,
    ]);
  });

  it("não avança se a etapa atual é manual, nem antes de a data chegar", async () => {
    const { agent } = await signedUpAgent();
    const pendingManual = await batchWithSteps(agent, [manual("Salga"), auto("Maturar")], daysAgo(10));
    const notYet = await batchWithSteps(agent, [auto("Maturar", 30)], daysAgo(1));

    const list = await agent.get("/api/batches");
    const byId = new Map(list.body.map((b: { id: string; steps: BatchStepBody[] }) => [b.id, b.steps]));
    expect((byId.get(pendingManual.id) as BatchStepBody[])[1]!.completedAt).toBeNull();
    expect((byId.get(notYet.id) as BatchStepBody[])[0]!.completedAt).toBeNull();
  });

  it("concluir a manual libera a automática seguinte, reprevista a partir de hoje", async () => {
    const { agent } = await signedUpAgent();
    const batch = await batchWithSteps(agent, [manual("Salga"), auto("Maturar", 5)], daysAgo(10));

    const done = await patchStep(agent, batch.id, batch.steps[0]!.id, { completed: true });
    expect(done.body.steps[1]).toMatchObject({ completedAt: null, plannedDate: addDays(TODAY, 5) });
  });

  it("desfazer uma automática a torna manual neste lote e ela não volta a concluir sozinha", async () => {
    const { agent } = await signedUpAgent();
    const batch = await batchWithSteps(agent, [auto("Maturar", 2), manual("Embalar")], daysAgo(10));
    const maturar = (await agent.get(`/api/batches/${batch.id}`)).body.steps[0];
    expect(maturar.completedAt).toBe(addDays(daysAgo(10), 2));

    const undone = await patchStep(agent, batch.id, maturar.id, { completed: false });
    expect(undone.body.steps[0]).toMatchObject({ completedAt: null, autoAdvance: false });

    const again = await agent.get(`/api/batches/${batch.id}`);
    expect(again.body.steps[0].completedAt).toBeNull();
  });

  it("a automática atual pode ser concluída antes, manualmente", async () => {
    const { agent } = await signedUpAgent();
    const batch = await batchWithSteps(agent, [auto("Maturar", 30), manual("Embalar")], daysAgo(1));
    const res = await patchStep(agent, batch.id, batch.steps[0]!.id, { completed: true });

    expect(res.body.steps[0].completedAt).toBe(TODAY);
    expect(res.body.steps[1].plannedDate).toBe(addDays(TODAY, 1));
  });
});

describe("DELETE /api/batches/:id", () => {
  it("exclui o lote e libera a exclusão da receita", async () => {
    const { agent } = await signedUpAgent();
    const { recipe, batch } = await createBatch(agent);

    // com lote, a receita não pode ser excluída
    expect((await agent.delete(`/api/recipes/${recipe.id}`)).status).toBe(409);

    expect((await agent.delete(`/api/batches/${batch.id}`)).status).toBe(204);
    expect((await agent.get(`/api/batches/${batch.id}`)).status).toBe(404);
    expect((await agent.delete(`/api/recipes/${recipe.id}`)).status).toBe(204);
  });

  it("lote de outro usuário → 404 e continua existindo", async () => {
    const { agent } = await signedUpAgent();
    const outro = await signedUpAgent();
    const { batch } = await createBatch(outro.agent);

    expect((await agent.delete(`/api/batches/${batch.id}`)).status).toBe(404);
    expect((await outro.agent.get(`/api/batches/${batch.id}`)).status).toBe(200);
  });
});
