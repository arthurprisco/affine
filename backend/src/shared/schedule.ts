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
