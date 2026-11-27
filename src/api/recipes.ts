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
  /** Etapa de espera: no lote, conclui sozinha na data prevista. */
  autoAdvance: boolean;
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
    autoAdvance: boolean;
  }[];
};

export const RECIPE_CATEGORIES = ["Queijo", "Vinho", "Embutido", "Outro"];

export const recipeKeys = {
  all: ["recipes"] as const,
  list: () => [...recipeKeys.all, "list"] as const,
  detail: (id: string) => [...recipeKeys.all, "detail", id] as const,
};

/** Receitas ativas do usuário logado. */
export function useRecipes() {
  return useQuery({
    queryKey: recipeKeys.list(),
    queryFn: () => api<Recipe[]>("/api/recipes"),
  });
}

/**
 * Uma receita pelo id. Abre já preenchida com o item da lista em cache
 * (`placeholderData`) e atualiza em segundo plano.
 */
export function useRecipe(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => api<Recipe>(`/api/recipes/${encodeURIComponent(id)}`),
    placeholderData: () =>
      queryClient
        .getQueryData<Recipe[]>(recipeKeys.list())
        ?.find((recipe) => recipe.id === id),
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

/** Substitui os dados e as etapas de uma receita (PUT). */
export function useUpdateRecipe(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecipeInput) =>
      api<Recipe>(`/api/recipes/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: input,
      }),
    onSuccess: (recipe) => {
      queryClient.setQueryData(recipeKeys.detail(id), recipe);
      return queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}

/**
 * Exclui uma receita. Só a lista é invalidada: o detalhe ainda está montado
 * até a tela voltar, e recarregá-lo daria 404.
 */
export function useDeleteRecipe(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api<void>(`/api/recipes/${encodeURIComponent(id)}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.setQueryData<Recipe[]>(recipeKeys.list(), (list) =>
        list?.filter((recipe) => recipe.id !== id),
      );
      return queryClient.invalidateQueries({ queryKey: recipeKeys.list() });
    },
  });
}
