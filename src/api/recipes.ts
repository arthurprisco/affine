// Receitas: tipos da API (/api/recipes) e hooks do TanStack Query.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { DurationUnit } from "../shared/duration";

export type Step = {
  id: string;
  recipeId: string;
  position: number;
  name: string;
  duration: number;
  durationUnit: DurationUnit;
  description: string | null;
};

export type Recipe = {
  id: string;
  userId: string;
  name: string;
  category: string;
  description: string | null;
  /** Soma das etapas em dias, arredondada para cima (calculada pela API). */
  maturationDays: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  steps: Step[];
};

/** Corpo do POST/PUT: as etapas vão na ordem de execução. */
export type RecipeInput = {
  name: string;
  category: string;
  description?: string;
  steps: {
    name: string;
    duration: number;
    durationUnit: DurationUnit;
    description?: string;
  }[];
};

export const RECIPE_CATEGORIES = ["Queijo", "Vinho", "Embutido", "Outro"];

export const recipeKeys = {
  all: ["recipes"] as const,
  list: () => [...recipeKeys.all, "list"] as const,
};

/** Receitas ativas do usuário logado. */
export function useRecipes() {
  return useQuery({
    queryKey: recipeKeys.list(),
    queryFn: () => api<Recipe[]>("/api/recipes"),
  });
}

/** Cria uma receita e atualiza a lista. */
export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecipeInput) =>
      api<Recipe>("/api/recipes", { method: "POST", body: input }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: recipeKeys.all }),
  });
}
