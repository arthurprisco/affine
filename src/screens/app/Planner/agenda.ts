// Agenda: etapas dos lotes agrupadas pelo dia previsto (`plannedDate`).
import type { Batch, BatchStep } from "../../../api/batches";
import { startOfToday } from "../../../shared/batch";
import { toISODate } from "../../../shared/date";

export type AgendaItem = {
  batch: Batch;
  step: BatchStep;
  /** Pendente com o dia previsto já passado. */
  late: boolean;
};

/** Marcador do dia no calendário: atrasada > pendente > só concluídas. */
export type DayMarker = "late" | "pending" | "done";

const byBatchAndPosition = (a: AgendaItem, b: AgendaItem) =>
  a.batch.code.localeCompare(b.batch.code) || a.step.position - b.step.position;

/** Todas as etapas (pendentes e concluídas) indexadas por dia AAAA-MM-DD. */
export function buildAgenda(batches: Batch[], today = startOfToday()) {
  const todayISO = toISODate(today);
  const days = new Map<string, AgendaItem[]>();

  for (const batch of batches) {
    for (const step of batch.steps) {
      const item = {
        batch,
        step,
        late: !step.completedAt && step.plannedDate < todayISO,
      };
      const list = days.get(step.plannedDate);
      if (list) list.push(item);
      else days.set(step.plannedDate, [item]);
    }
  }

  for (const list of days.values()) list.sort(byBatchAndPosition);
  return days;
}

/** Etapas pendentes de dias anteriores a hoje, da mais antiga para a mais recente. */
export function overdueItems(agenda: Map<string, AgendaItem[]>) {
  return [...agenda.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([, items]) => items.filter((item) => item.late));
}

export function dayMarker(items: AgendaItem[] | undefined): DayMarker | null {
  if (!items?.length) return null;
  if (items.some((item) => item.late)) return "late";
  if (items.some((item) => !item.step.completedAt)) return "pending";
  return "done";
}
