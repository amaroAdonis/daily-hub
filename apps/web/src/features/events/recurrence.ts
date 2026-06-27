/**
 * Presets de recorrência expostos na UI. Mapeiam para RRULEs simples (o
 * servidor expande qualquer RRULE; aqui limitamos às opções comuns).
 */
export type RecurrencePreset = 'none' | 'daily' | 'weekly' | 'monthly';

export const RECURRENCE_OPTIONS: { value: RecurrencePreset; label: string }[] = [
  { value: 'none', label: 'Não se repete' },
  { value: 'daily', label: 'Diariamente' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'monthly', label: 'Mensalmente' },
];

const PRESET_TO_RULE: Record<Exclude<RecurrencePreset, 'none'>, string> = {
  daily: 'FREQ=DAILY',
  weekly: 'FREQ=WEEKLY',
  monthly: 'FREQ=MONTHLY',
};

export function presetToRule(preset: RecurrencePreset): string | null {
  return preset === 'none' ? null : PRESET_TO_RULE[preset];
}

/** Deriva o preset a partir de uma RRULE armazenada (fallback para `weekly`). */
export function ruleToPreset(rule: string | null): RecurrencePreset {
  if (!rule) return 'none';
  if (rule.includes('FREQ=DAILY')) return 'daily';
  if (rule.includes('FREQ=MONTHLY')) return 'monthly';
  return 'weekly';
}
