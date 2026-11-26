import { describe, it, expect, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../src/app.ts";
import { db } from "../src/db/index.ts";
import { signedUpAgent } from "./helpers.ts";

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

async function createRecipe(agent: Agent) {
  const res = await agent.post("/api/recipes").send(recipeBody);
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

describe("PATCH /api/batches/:id/steps/:stepId", () => {
  it("conclui e desfaz uma etapa", async () => {
    const { agent } = await signedUpAgent();
    const { batch } = await createBatch(agent);
    const stepId = batch.steps[0].id;

    const done = await agent
      .patch(`/api/batches/${batch.id}/steps/${stepId}`)
      .send({ completed: true });
    expect(done.status).toBe(200);
    expect(done.body.steps[0].completedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(done.body.steps[1].completedAt).toBeNull();

    const undone = await agent
      .patch(`/api/batches/${batch.id}/steps/${stepId}`)
      .send({ completed: false });
    expect(undone.body.steps[0].completedAt).toBeNull();
  });

  it("etapa de lote de outro usuário → 404", async () => {
    const { agent } = await signedUpAgent();
    const outro = await signedUpAgent();
    const { batch } = await createBatch(outro.agent);
    const res = await agent
      .patch(`/api/batches/${batch.id}/steps/${batch.steps[0].id}`)
      .send({ completed: true });

    expect(res.status).toBe(404);
  });

  it("recusa corpo sem `completed` → 400", async () => {
    const { agent } = await signedUpAgent();
    const { batch } = await createBatch(agent);
    const res = await agent.patch(`/api/batches/${batch.id}/steps/${batch.steps[0].id}`).send({});

    expect(res.status).toBe(400);
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
