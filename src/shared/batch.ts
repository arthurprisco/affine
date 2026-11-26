// Situação de um lote, derivada das etapas e da data atual (a API não guarda status).
// Lotes não têm vencimento: são produtos maturados, quanto mais envelhecidos, melhor.
import type { Batch } from "../api/batches";
import { fromISODate } from "./date";

export type BatchStatus = "planejado" | "em_maturacao" | "atrasado" | "pronto";

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  planejado: "Planejado",
  em_maturacao: "Em maturação",
  atrasado: "Etapa atrasada",
  pronto: "Pronto",
};

export const BATCH_UNIT_LABELS: Record<string, string> = {
  un: "unidades",
  kg: "kg",
  L: "litros",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Hoje à meia-noite (horário local). */
export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** Dias inteiros de `from` até a data ISO (negativo = já passou). */
export function daysUntil(iso: string, from = startOfToday()) {
  return Math.round((fromISODate(iso).getTime() - from.getTime()) / MS_PER_DAY);
}

export function completedCount(batch: Batch) {
  return batch.steps.filter((step) => step.completedAt).length;
}

/** Primeira etapa ainda pendente, na ordem do lote. */
export function currentStep(batch: Batch) {
  return batch.steps.find((step) => !step.completedAt) ?? null;
}

/** Previsão de término = data prevista da última etapa. */
export function expectedEnd(batch: Batch) {
  return batch.steps.at(-1)?.plannedDate ?? batch.startDate;
}

export function batchStatus(batch: Batch, today = startOfToday()): BatchStatus {
  const pending = currentStep(batch);
  if (!pending) return "pronto";
  if (daysUntil(batch.startDate, today) > 0) return "planejado";
  if (daysUntil(pending.plannedDate, today) < 0) return "atrasado";
  return "em_maturacao";
}

/** Dias de maturação decorridos e o total previsto (do início à última etapa). */
export function maturationProgress(batch: Batch, today = startOfToday()) {
  const total = Math.max(
    daysUntil(expectedEnd(batch), fromISODate(batch.startDate)),
    1,
  );
  const elapsed = Math.min(
    Math.max(-daysUntil(batch.startDate, today), 0),
    total,
  );
  return { elapsed, total, ratio: elapsed / total };
}

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

/** Prazo de uma etapa pendente ("Atrasada há 2 dias", "Prevista para hoje"...). */
export function stepDueLabel(plannedDate: string, today = startOfToday()) {
  const days = daysUntil(plannedDate, today);
  if (days < 0) return `Atrasada há ${plural(-days, "dia", "dias")}`;
  if (days === 0) return "Prevista para hoje";
  if (days === 1) return "Prevista para amanhã";
  return `Prevista em ${days} dias`;
}

/** Texto do badge de prazo do lote: atraso da etapa atual, início ou previsão de ficar pronto. */
export function batchDeadlineLabel(batch: Batch, today = startOfToday()) {
  const status = batchStatus(batch, today);
  const pending = currentStep(batch);
  if (status === "pronto" || !pending) return "Pronto";
  if (status === "atrasado") return stepDueLabel(pending.plannedDate, today);
  if (status === "planejado") {
    return `Começa em ${plural(daysUntil(batch.startDate, today), "dia", "dias")}`;
  }
  const days = daysUntil(expectedEnd(batch), today);
  return days <= 0
    ? "Fica pronto hoje"
    : `Pronto em ${plural(days, "dia", "dias")}`;
}
