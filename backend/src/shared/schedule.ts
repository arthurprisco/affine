// Datas no formato das colunas `date` (AAAA-MM-DD) e o cronograma previsto das etapas de um lote.
import { totalDays, type DurationUnit } from "./duration.ts";

export function toISODate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Hoje, no fuso do servidor, em AAAA-MM-DD. */
export function todayISO(): string {
  return toISODate(new Date());
}

/**
 * Data prevista de cada etapa = dia em que ela termina, pelo tempo acumulado desde o início
 * (etapas curtas terminam no mesmo dia). Devolve as etapas na mesma ordem, com `plannedDate`.
 */
export function planBatchSteps<S extends { duration: number; durationUnit: DurationUnit }>(
  startDate: string,
  steps: S[],
): (S & { plannedDate: string })[] {
  return steps.map((s, i) => ({
    ...s,
    plannedDate: addDays(startDate, totalDays(steps.slice(0, i + 1))),
  }));
}

/** Etapa de lote com o mínimo que as regras de avanço precisam. */
type ScheduledStep = {
  id: string;
  duration: number;
  durationUnit: DurationUnit;
  plannedDate: string;
  completedAt: string | null;
  autoAdvance: boolean;
};

/**
 * Etapas automáticas que já deveriam ter terminado: a partir da etapa atual (primeira pendente),
 * enquanto forem automáticas com data prevista até hoje. Concluem na própria data prevista.
 * Para na primeira etapa manual ou futura, e não avança lote que ainda não começou.
 */
export function dueAutoSteps(startDate: string, steps: ScheduledStep[], today = todayISO()) {
  if (startDate > today) return [];
  const due: { id: string; completedAt: string }[] = [];
  for (const s of steps) {
    if (s.completedAt) continue;
    if (!s.autoAdvance || s.plannedDate > today) break;
    due.push({ id: s.id, completedAt: s.plannedDate });
  }
  return due;
}

/**
 * Nova data prevista das etapas pendentes, contada a partir da conclusão real da última etapa
 * concluída (ou do início do lote, se nenhuma foi). Devolve só as que mudaram.
 */
export function replanPending(startDate: string, steps: ScheduledStep[]) {
  const anchor = steps.findLast((s) => s.completedAt)?.completedAt ?? startDate;
  const pending = steps.filter((s) => !s.completedAt);
  return planBatchSteps(anchor, pending)
    .filter((s, i) => s.plannedDate !== pending[i]!.plannedDate)
    .map((s) => ({ id: s.id, plannedDate: s.plannedDate }));
}
