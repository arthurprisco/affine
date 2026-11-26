// Lotes: tipos da API (/api/batches) e hooks do TanStack Query.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { DurationUnit } from "../shared/duration";
import { recipeKeys } from "./recipes";

/** Etapa executada do lote: cópia da etapa da receita no momento da criação. */
export type BatchStep = {
  id: string;
  batchId: string;
  stepId: string | null;
  position: number;
  name: string;
  duration: number;
  durationUnit: DurationUnit;
  /** AAAA-MM-DD: dia previsto para a etapa terminar. */
  plannedDate: string;
  /** AAAA-MM-DD, ou `null` enquanto pendente. */
  completedAt: string | null;
  notes: string | null;
};

export type Batch = {
  id: string;
  userId: string;
  recipeId: string;
  code: string;
  quantity: number;
  unit: string;
  /** AAAA-MM-DD */
  startDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  recipe: { id: string; name: string; category: string };
  steps: BatchStep[];
};

/** Corpo do POST: as etapas são copiadas da receita pela API. */
export type BatchInput = {
  recipeId: string;
  code: string;
  quantity: number;
  unit: string;
  startDate: string;
  notes?: string;
};

export const batchKeys = {
  all: ["batches"] as const,
  list: () => [...batchKeys.all, "list"] as const,
  detail: (id: string) => [...batchKeys.all, "detail", id] as const,
};

/** Lotes do usuário logado, mais recentes primeiro. */
export function useBatches() {
  return useQuery({
    queryKey: batchKeys.list(),
    queryFn: () => api<Batch[]>("/api/batches"),
  });
}

/**
 * Um lote pelo id. Abre já preenchido com o item da lista em cache
 * (`placeholderData`) e atualiza em segundo plano.
 */
export function useBatch(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: batchKeys.detail(id),
    queryFn: () => api<Batch>(`/api/batches/${encodeURIComponent(id)}`),
    placeholderData: () =>
      queryClient
        .getQueryData<Batch[]>(batchKeys.list())
        ?.find((batch) => batch.id === id),
  });
}

/** Cria um lote. Invalida também as receitas: com lote, elas não podem mais ser excluídas. */
export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BatchInput) =>
      api<Batch>("/api/batches", { method: "POST", body: input }),
    onSuccess: (batch) => {
      queryClient.setQueryData(batchKeys.detail(batch.id), batch);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: batchKeys.all }),
        queryClient.invalidateQueries({ queryKey: recipeKeys.all }),
      ]);
    },
  });
}
