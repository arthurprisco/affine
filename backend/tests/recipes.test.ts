import { describe, it, expect, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../src/app.ts";
import { db } from "../src/db/index.ts";
import { batch } from "../src/db/schema/production-schema.ts";
import { signedUpAgent } from "./helpers.ts";

type Agent = Awaited<ReturnType<typeof signedUpAgent>>["agent"];

const canastra = {
  name: "Queijo Canastra",
  category: "queijo",
  description: "Leite cru, casca amarelada.",
  steps: [
    { name: "Coagulação", duration: 1, durationUnit: "dias" },
    { name: "Salga a seco", duration: 2, durationUnit: "dias" },
    { name: "Maturação", duration: 19, durationUnit: "dias", description: "Viragem diária." },
  ],
};

async function createRecipe(agent: Agent, body: object = canastra) {
  const res = await agent.post("/api/recipes").send(body);
  expect(res.status).toBe(201);
  return res.body;
}

afterAll(async () => {
  await db.$client.end();
});

describe("autenticação", () => {
  it.each([
    ["get", "/api/recipes"],
    ["post", "/api/recipes"],
    ["get", "/api/recipes/qualquer-id"],
    ["put", "/api/recipes/qualquer-id"],
    ["delete", "/api/recipes/qualquer-id"],
    ["patch", "/api/recipes/qualquer-id/archive"],
  ] as const)("%s %s sem sessão → 401", async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHORIZED");
  });
});

describe("POST /api/recipes", () => {
  it("cria a receita com etapas em ordem e maturação calculada", async () => {
    const { agent, userId } = await signedUpAgent();
    const recipe = await createRecipe(agent);

    expect(recipe).toMatchObject({
      name: "Queijo Canastra",
      category: "queijo",
      maturationDays: 22,
      archivedAt: null,
      userId,
    });
    expect(recipe.steps.map((s: { position: number; name: string }) => [s.position, s.name])).toEqual([
      [1, "Coagulação"],
      [2, "Salga a seco"],
      [3, "Maturação"],
    ]);
  });

  it("guarda a unidade e arredonda a maturação para cima em dias", async () => {
    const { agent } = await signedUpAgent();
    const recipe = await createRecipe(agent, {
      ...canastra,
      steps: [
        { name: "Aquecer o leite", duration: 30, durationUnit: "minutos" },
        { name: "Prensar", duration: 12, durationUnit: "horas" },
        { name: "Salmoura", duration: 2, durationUnit: "semanas" },
      ],
    });

    // 30 min + 12 h + 14 dias = 14 dias e 12h30 → 15 dias
    expect(recipe.maturationDays).toBe(15);
    expect(recipe.steps[0]).toMatchObject({ duration: 30, durationUnit: "minutos" });
  });

  it("ignora maturationDays enviado pelo cliente", async () => {
    const { agent } = await signedUpAgent();
    const recipe = await createRecipe(agent, { ...canastra, maturationDays: 999 });
    expect(recipe.maturationDays).toBe(22);
  });

  it.each([
    ["sem etapas", { ...canastra, steps: [] }],
    ["sem nome", { ...canastra, name: "  " }],
    ["duração não inteira", { ...canastra, steps: [{ name: "X", duration: 1.5, durationUnit: "dias" }] }],
    ["etapa com duração zero", { ...canastra, steps: [{ name: "X", duration: 0, durationUnit: "dias" }] }],
    ["unidade inválida", { ...canastra, steps: [{ name: "X", duration: 1, durationUnit: "décadas" }] }],
    ["etapa sem unidade", { ...canastra, steps: [{ name: "X", duration: 1 }] }],
  ])("recusa %s → 400", async (_caso, body) => {
    const { agent } = await signedUpAgent();
    const res = await agent.post("/api/recipes").send(body);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
    expect(res.body.issues.length).toBeGreaterThan(0);
  });

  it("recusa JSON malformado → 400", async () => {
    const { agent } = await signedUpAgent();
    const res = await agent
      .post("/api/recipes")
      .set("Content-Type", "application/json")
      .send("{ name: ");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_JSON");
  });
});

describe("GET /api/recipes", () => {
  it("lista só as receitas ativas do próprio usuário, em ordem alfabética", async () => {
    const { agent } = await signedUpAgent();
    const outro = await signedUpAgent();
    await createRecipe(agent, { ...canastra, name: "Gouda" });
    await createRecipe(agent, { ...canastra, name: "Brie" });
    const arquivada = await createRecipe(agent, { ...canastra, name: "Antiga" });
    await agent.patch(`/api/recipes/${arquivada.id}/archive`);
    await createRecipe(outro.agent, { ...canastra, name: "Do outro" });

    const res = await agent.get("/api/recipes");

    expect(res.status).toBe(200);
    expect(res.body.map((r: { name: string }) => r.name)).toEqual(["Brie", "Gouda"]);
    expect(res.body[0].steps).toHaveLength(3);
  });

  it("?archived=true lista só as arquivadas", async () => {
    const { agent } = await signedUpAgent();
    await createRecipe(agent, { ...canastra, name: "Ativa" });
    const arquivada = await createRecipe(agent, { ...canastra, name: "Arquivada" });
    await agent.patch(`/api/recipes/${arquivada.id}/archive`);

    const res = await agent.get("/api/recipes?archived=true");

    expect(res.body.map((r: { name: string }) => r.name)).toEqual(["Arquivada"]);
  });

  it("recusa valor inválido em ?archived → 400", async () => {
    const { agent } = await signedUpAgent();
    const res = await agent.get("/api/recipes?archived=talvez");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/recipes/:id", () => {
  it("devolve a receita com as etapas", async () => {
    const { agent } = await signedUpAgent();
    const created = await createRecipe(agent);

    const res = await agent.get(`/api/recipes/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(created);
  });

  it("404 para id inexistente", async () => {
    const { agent } = await signedUpAgent();
    const res = await agent.get("/api/recipes/nao-existe");

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });
});

describe("PUT /api/recipes/:id", () => {
  it("substitui os dados e as etapas, recalculando a maturação", async () => {
    const { agent } = await signedUpAgent();
    const created = await createRecipe(agent);

    const res = await agent.put(`/api/recipes/${created.id}`).send({
      name: "Canastra Real",
      category: "queijo",
      steps: [
        { name: "Coagulação", duration: 1, durationUnit: "dias" },
        { name: "Maturação longa", duration: 40, durationUnit: "dias" },
      ],
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: created.id,
      name: "Canastra Real",
      description: null,
      maturationDays: 41,
    });
    expect(res.body.steps.map((s: { name: string }) => s.name)).toEqual([
      "Coagulação",
      "Maturação longa",
    ]);
  });

  it("404 para id inexistente", async () => {
    const { agent } = await signedUpAgent();
    const res = await agent.put("/api/recipes/nao-existe").send(canastra);
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/recipes/:id/archive e /unarchive", () => {
  it("arquiva e desarquiva", async () => {
    const { agent } = await signedUpAgent();
    const created = await createRecipe(agent);

    const archived = await agent.patch(`/api/recipes/${created.id}/archive`);
    expect(archived.status).toBe(200);
    expect(archived.body.archivedAt).toEqual(expect.any(String));

    const unarchived = await agent.patch(`/api/recipes/${created.id}/unarchive`);
    expect(unarchived.status).toBe(200);
    expect(unarchived.body.archivedAt).toBeNull();
  });
});

describe("DELETE /api/recipes/:id", () => {
  it("exclui receita sem lotes → 204", async () => {
    const { agent } = await signedUpAgent();
    const created = await createRecipe(agent);

    const res = await agent.delete(`/api/recipes/${created.id}`);
    expect(res.status).toBe(204);

    const after = await agent.get(`/api/recipes/${created.id}`);
    expect(after.status).toBe(404);
  });

  it("recusa excluir receita com lotes → 409", async () => {
    const { agent, userId } = await signedUpAgent();
    const created = await createRecipe(agent);
    await db.insert(batch).values({
      userId,
      recipeId: created.id,
      code: "TESTE001",
      quantity: 10,
      unit: "unidades",
      startDate: "2026-01-01",
    });

    const res = await agent.delete(`/api/recipes/${created.id}`);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("RECIPE_HAS_BATCHES");
  });
});

describe("isolamento entre usuários", () => {
  it("receita de outro usuário responde 404 em todas as rotas e não é alterada", async () => {
    const dono = await signedUpAgent();
    const intruso = await signedUpAgent();
    const recipe = await createRecipe(dono.agent);
    const path = `/api/recipes/${recipe.id}`;

    expect((await intruso.agent.get(path)).status).toBe(404);
    expect((await intruso.agent.put(path).send({ ...canastra, name: "Hackeado" })).status).toBe(404);
    expect((await intruso.agent.patch(`${path}/archive`)).status).toBe(404);
    expect((await intruso.agent.delete(path)).status).toBe(404);

    const original = await dono.agent.get(path);
    expect(original.body).toEqual(recipe);
  });
});
