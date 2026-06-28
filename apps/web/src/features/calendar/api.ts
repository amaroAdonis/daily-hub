import type { CalendarRangeQuery, DayDetail, DaySummary } from '@daily-hub/shared';
import { api } from '../../lib/api';

export const getCalendarSummary = (range: CalendarRangeQuery) =>
  api<DaySummary[]>(`/calendar/summary?from=${range.from}&to=${range.to}`);

export const getDayDetail = (date: string) => api<DayDetail>(`/calendar/day?date=${date}`);
