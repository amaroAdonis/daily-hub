import type { CalendarRangeQuery, DaySummary } from '@daily-hub/shared';
import { api } from '../../lib/api';

export const getCalendarSummary = (range: CalendarRangeQuery) =>
  api<DaySummary[]>(`/calendar/summary?from=${range.from}&to=${range.to}`);
