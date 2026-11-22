// Unidades de duração das etapas de produção e conversões aproximadas.

export const DURATION_UNITS = [
  "minutos",
  "horas",
  "dias",
  "semanas",
  "meses",
  "anos",
] as const;

export type DurationUnit = (typeof DURATION_UNITS)[number];

/** Rótulo exibido na interface (ex.: no Select de unidade). */
export const DURATION_UNIT_LABELS: Record<DurationUnit, string> = {
  minutos: "Minutos",
  horas: "Horas",
  dias: "Dias",
  semanas: "Semanas",
  meses: "Meses",
  anos: "Anos",
};

// Mês = 30 dias e ano = 365 dias: suficiente para estimativas de produção.
const MINUTES_PER_UNIT: Record<DurationUnit, number> = {
  minutos: 1,
  horas: 60,
  dias: 60 * 24,
  semanas: 60 * 24 * 7,
  meses: 60 * 24 * 30,
  anos: 60 * 24 * 365,
};

export function toMinutes(duration: number, unit: DurationUnit) {
  return duration * MINUTES_PER_UNIT[unit];
}

/** Formata um total em minutos na maior unidade entre dias, horas e minutos. */
export function formatTotalDuration(totalMinutes: number) {
  const days = Math.round(totalMinutes / MINUTES_PER_UNIT.dias);
  if (days >= 1) return `${days} ${days === 1 ? "dia" : "dias"}`;

  const hours = Math.round(totalMinutes / MINUTES_PER_UNIT.horas);
  if (hours >= 1) return `${hours} ${hours === 1 ? "hora" : "horas"}`;

  const minutes = Math.round(totalMinutes);
  return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
}
