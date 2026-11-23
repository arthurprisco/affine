// Unidades de duração das etapas e conversões. Mantenha em sincronia com
// src/shared/duration.ts do app (mesmas unidades e mesmos fatores).

export const DURATION_UNITS = [
  "minutos",
  "horas",
  "dias",
  "semanas",
  "meses",
  "anos",
] as const;

export type DurationUnit = (typeof DURATION_UNITS)[number];

// Mês = 30 dias e ano = 365 dias: suficiente para estimativas de produção.
const MINUTES_PER_UNIT: Record<DurationUnit, number> = {
  minutos: 1,
  horas: 60,
  dias: 60 * 24,
  semanas: 60 * 24 * 7,
  meses: 60 * 24 * 30,
  anos: 60 * 24 * 365,
};

const MINUTES_PER_DAY = MINUTES_PER_UNIT.dias;

export function toMinutes(duration: number, unit: DurationUnit): number {
  return duration * MINUTES_PER_UNIT[unit];
}

/** Total de dias de uma sequência de etapas, arredondado para cima (30 min → 1 dia). */
export function totalDays(steps: { duration: number; durationUnit: DurationUnit }[]): number {
  const minutes = steps.reduce((sum, s) => sum + toMinutes(s.duration, s.durationUnit), 0);
  return Math.ceil(minutes / MINUTES_PER_DAY);
}
