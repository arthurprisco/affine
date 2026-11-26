// Camada HTTP dos lotes: valida a requisição, chama o service e monta a resposta.
// Erros (ZodError, AppError) seguem para o errorHandler; o Express 5 repassa rejeições async.
import type { Request, Response } from "express";
import * as BatchService from "./batch.service.ts";
import {
  batchInputSchema,
  batchParamsSchema,
  batchStepParamsSchema,
  stepCompletionSchema,
} from "./batch.schemas.ts";

// requireAuth roda antes de todas as rotas do módulo, então req.user sempre existe aqui
const userId = (req: Request) => req.user!.id;
const batchId = (req: Request) => batchParamsSchema.parse(req.params).id;

export async function list(req: Request, res: Response) {
  res.json(await BatchService.list(userId(req)));
}

export async function getById(req: Request, res: Response) {
  res.json(await BatchService.getById(batchId(req), userId(req)));
}

export async function create(req: Request, res: Response) {
  const input = batchInputSchema.parse(req.body);
  res.status(201).json(await BatchService.create(userId(req), input));
}

export async function setStepCompleted(req: Request, res: Response) {
  const { id, stepId } = batchStepParamsSchema.parse(req.params);
  const { completed } = stepCompletionSchema.parse(req.body);
  res.json(await BatchService.setStepCompleted(id, stepId, userId(req), completed));
}

export async function remove(req: Request, res: Response) {
  await BatchService.remove(batchId(req), userId(req));
  res.status(204).end();
}
