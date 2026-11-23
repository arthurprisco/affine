import { expect } from "@jest/globals";
import request from "supertest";
import app from "../src/app.ts";

export const PASSWORD = "senha-segura-123";

let seq = 0;
/** Email único por teste, para os casos não dependerem uns dos outros. */
export function uniqueEmail(): string {
  seq += 1;
  return `teste${seq}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@affine.test`;
}

/** Cadastra um usuário e devolve um agent já autenticado (cookie de sessão salvo). */
export async function signedUpAgent(email = uniqueEmail(), name = "Maria Queijeira") {
  const agent = request.agent(app);
  const res = await agent
    .post("/api/auth/sign-up/email")
    .send({ name, email, password: PASSWORD });
  expect(res.status).toBe(200);
  return { agent, email, name, userId: res.body.user.id as string };
}
