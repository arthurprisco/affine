// Camada HTTP das receitas: valida a requisição, chama o service e monta a resposta.
// Erros (ZodError, AppError) seguem para o errorHandler; o Express 5 repassa rejeições async.
import type { Request, Response } from "express";
import * as RecipeService from "./recipe.service.ts";
import {
  listRecipesQuerySchema,
  recipeInputSchema,
  recipeParamsSchema,
} from "./recipe.schemas.ts";

// requireAuth roda antes de todas as rotas do módulo, então req.user sempre existe aqui
const userId = (req: Request) => req.user!.id;
const recipeId = (req: Request) => recipeParamsSchema.parse(req.params).id;

export async function list(req: Request, res: Response) {
  const { archived } = listRecipesQuerySchema.parse(req.query);
  res.json(await RecipeService.list(userId(req), archived));
}

export async function getById(req: Request, res: Response) {
  res.json(await RecipeService.getById(recipeId(req), userId(req)));
}

export async function create(req: Request, res: Response) {
  const input = recipeInputSchema.parse(req.body);
  res.status(201).json(await RecipeService.create(userId(req), input));
}

export async function update(req: Request, res: Response) {
  const input = recipeInputSchema.parse(req.body);
  res.json(await RecipeService.update(recipeId(req), userId(req), input));
}

export async function archive(req: Request, res: Response) {
  res.json(await RecipeService.setArchived(recipeId(req), userId(req), true));
}

export async function unarchive(req: Request, res: Response) {
  res.json(await RecipeService.setArchived(recipeId(req), userId(req), false));
}

export async function remove(req: Request, res: Response) {
  await RecipeService.remove(recipeId(req), userId(req));
  res.status(204).end();
}
