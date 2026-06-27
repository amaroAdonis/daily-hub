import { rrulestr } from 'rrule';

/**
 * Expande uma regra RRULE (sem o prefixo `RRULE:`) nas datas de início de
 * ocorrência dentro da janela `[from, to]` (inclusiva).
 *
 * O `rrule` opera em UTC: as ocorrências mantêm o mesmo horário (em UTC) do
 * `dtstart`, o que é determinístico para uma agenda single-user sem timezone.
 */
export function expandRecurrence(rule: string, dtstart: Date, from: Date, to: Date): Date[] {
  const rrule = rrulestr(rule, { dtstart });
  return rrule.between(from, to, true);
}
