import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

/** Semana começando no domingo, como nos calendários brasileiros. */
const WEEK_OPTS = { weekStartsOn: 0 } as const;

/** Dia no formato `YYYY-MM-DD` (a forma trafegada na API). */
export const toDayString = (date: Date): string => format(date, 'yyyy-MM-dd');

/** Constrói um `Date` local a partir de `YYYY-MM-DD` (meia-noite local). */
export const fromDayString = (day: string): Date => {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year!, month! - 1, date!);
};

export const todayString = (): string => toDayString(new Date());

/** Grade do mês: do início da semana do dia 1 ao fim da semana do último dia. */
export function monthGridDays(reference: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(reference), WEEK_OPTS),
    end: endOfWeek(endOfMonth(reference), WEEK_OPTS),
  });
}

/** Os sete dias da semana que contém `reference`. */
export function weekDays(reference: Date): Date[] {
  const start = startOfWeek(reference, WEEK_OPTS);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Intervalo `from`/`to` (inclusivo) cobrindo a grade visível de cada visão. */
export function rangeForView(view: 'month' | 'week' | 'day', reference: Date) {
  if (view === 'month') {
    const days = monthGridDays(reference);
    return { from: toDayString(days[0]!), to: toDayString(days[days.length - 1]!) };
  }
  if (view === 'week') {
    const days = weekDays(reference);
    return { from: toDayString(days[0]!), to: toDayString(days[6]!) };
  }
  const day = toDayString(reference);
  return { from: day, to: day };
}

/** Avança/retrocede a data de referência conforme a visão atual. */
export function shiftReference(
  view: 'month' | 'week' | 'day',
  reference: Date,
  direction: 1 | -1,
): Date {
  if (view === 'month') return addMonths(reference, direction);
  if (view === 'week') return addWeeks(reference, direction);
  return addDays(reference, direction);
}
