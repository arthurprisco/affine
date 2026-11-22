import { jest, describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../src/app.ts";
import { db } from "../src/db/index.ts";

const PASSWORD = "senha-segura-123";

let seq = 0;
/** Email único por teste, para os casos não dependerem uns dos outros. */
function uniqueEmail(): string {
  seq += 1;
  return `teste${seq}-${Date.now()}@affine.test`;
}

/** Cadastra um usuário e devolve um agent já autenticado (cookie de sessão salvo). */
async function signedUpAgent(email = uniqueEmail(), name = "Maria Queijeira") {
  const agent = request.agent(app);
  const res = await agent
    .post("/api/auth/sign-up/email")
    .send({ name, email, password: PASSWORD });
  expect(res.status).toBe(200);
  return { agent, email, name };
}

beforeAll(() => {
  // Better Auth loga um warn em cada caso de erro esperado (senha errada etc.)
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(async () => {
  jest.restoreAllMocks();
  await db.$client.end();
});

describe("POST /api/auth/sign-up/email", () => {
  it("cria o usuário e já abre a sessão", async () => {
    const email = uniqueEmail();
    const res = await request(app)
      .post("/api/auth/sign-up/email")
      .send({ name: "Maria Queijeira", email, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ name: "Maria Queijeira", email });
    expect(res.body.token).toEqual(expect.any(String));
    expect(String(res.headers["set-cookie"])).toContain("better-auth.session_token");
  });

  it("recusa email já cadastrado", async () => {
    const { email } = await signedUpAgent();
    const res = await request(app)
      .post("/api/auth/sign-up/email")
      .send({ name: "Outra", email, password: PASSWORD });

    expect(res.status).toBe(422);
  });

  it("recusa senha curta", async () => {
    const res = await request(app)
      .post("/api/auth/sign-up/email")
      .send({ name: "Maria", email: uniqueEmail(), password: "123" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/sign-in/email", () => {
  it("autentica com email e senha corretos", async () => {
    const { email } = await signedUpAgent();
    const res = await request(app)
      .post("/api/auth/sign-in/email")
      .send({ email, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
    expect(String(res.headers["set-cookie"])).toContain("better-auth.session_token");
  });

  it("recusa senha errada", async () => {
    const { email } = await signedUpAgent();
    const res = await request(app)
      .post("/api/auth/sign-in/email")
      .send({ email, password: "senha-errada-123" });

    expect(res.status).toBe(401);
  });

  it("recusa email inexistente", async () => {
    const res = await request(app)
      .post("/api/auth/sign-in/email")
      .send({ email: uniqueEmail(), password: PASSWORD });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/get-session", () => {
  it("devolve usuário e sessão quando autenticado", async () => {
    const { agent, email } = await signedUpAgent();
    const res = await agent.get("/api/auth/get-session");

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
    expect(res.body.session.token).toEqual(expect.any(String));
  });

  it("devolve null sem sessão", async () => {
    const res = await request(app).get("/api/auth/get-session");

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });
});

describe("POST /api/auth/sign-out", () => {
  it("encerra a sessão", async () => {
    const { agent } = await signedUpAgent();

    const res = await agent.post("/api/auth/sign-out").send({});
    expect(res.status).toBe(200);

    const session = await agent.get("/api/auth/get-session");
    expect(session.body).toBeNull();
  });
});

describe("POST /api/auth/update-user", () => {
  it("altera o nome do usuário logado", async () => {
    const { agent } = await signedUpAgent();

    const res = await agent.post("/api/auth/update-user").send({ name: "Maria Silva" });
    expect(res.status).toBe(200);

    const session = await agent.get("/api/auth/get-session");
    expect(session.body.user.name).toBe("Maria Silva");
  });

  it("exige sessão", async () => {
    const res = await request(app).post("/api/auth/update-user").send({ name: "X" });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/change-email", () => {
  it("troca o email sem verificação", async () => {
    const { agent } = await signedUpAgent();
    const newEmail = uniqueEmail();

    const res = await agent.post("/api/auth/change-email").send({ newEmail });
    expect(res.status).toBe(200);

    const session = await agent.get("/api/auth/get-session");
    expect(session.body.user.email).toBe(newEmail);
  });

  it("exige sessão", async () => {
    const res = await request(app)
      .post("/api/auth/change-email")
      .send({ newEmail: uniqueEmail() });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/change-password", () => {
  it("troca a senha e o login passa a usar a nova", async () => {
    const { agent, email } = await signedUpAgent();
    const newPassword = "nova-senha-456";

    const res = await agent
      .post("/api/auth/change-password")
      .send({ currentPassword: PASSWORD, newPassword });
    expect(res.status).toBe(200);

    const oldLogin = await request(app)
      .post("/api/auth/sign-in/email")
      .send({ email, password: PASSWORD });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post("/api/auth/sign-in/email")
      .send({ email, password: newPassword });
    expect(newLogin.status).toBe(200);
  });

  it("recusa senha atual errada", async () => {
    const { agent } = await signedUpAgent();
    const res = await agent
      .post("/api/auth/change-password")
      .send({ currentPassword: "nao-e-essa-123", newPassword: "nova-senha-456" });

    expect(res.status).toBe(400);
  });
});

describe("CORS", () => {
  it("responde ao preflight das rotas de auth", async () => {
    const res = await request(app)
      .options("/api/auth/sign-in/email")
      .set("Origin", "http://192.168.0.10:8081")
      .set("Access-Control-Request-Method", "POST");

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });
});
