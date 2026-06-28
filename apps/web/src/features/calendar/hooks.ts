import { useQuery } from '@tanstack/react-query';
import type { CalendarRangeQuery, DaySummary } from '@daily-hub/shared';
import { getCalendarSummary, getDayDetail } from './api';

export const calendarKeys = {
  summary: (range: CalendarRangeQuery) => ['calendar', 'summary', range] as const,
  day: (date: string) => ['calendar', 'day', date] as const,
};

/**
 * Agregação diária do intervalo, indexada por `YYYY-MM-DD` para consulta O(1)
 * por célula do calendário.
 */
export function useCalendarSummary(range: CalendarRangeQuery) {
  return useQuery({
    queryKey: calendarKeys.summary(range),
    queryFn: () => getCalendarSummary(range),
    select: (rows: DaySummary[]) => new Map(rows.map((row) => [row.date, row])),
  });
}

/** Detalhe agregado de um dia (contatos vinculados às atividades). */
export function useDayDetail(date: string) {
  return useQuery({
    queryKey: calendarKeys.day(date),
    queryFn: () => getDayDetail(date),
  });
}
