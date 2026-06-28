import type {
  CreateEventInput,
  EventDto,
  EventOccurrence,
  EventRangeQuery,
  UpdateEventInput,
} from '@daily-hub/shared';
import { api } from '../../lib/api';

export const listOccurrences = (range: EventRangeQuery) =>
  api<EventOccurrence[]>(`/events?from=${range.from}&to=${range.to}`);

/** Compromissos base (sem expandir recorrência), para o Kanban. */
export const listEventsBase = () => api<EventDto[]>('/events/base');

export const getEvent = (id: string) => api<EventDto>(`/events/${id}`);

export const createEvent = (input: CreateEventInput) =>
  api<EventDto>('/events', { method: 'POST', body: JSON.stringify(input) });

export const updateEvent = (id: string, input: UpdateEventInput) =>
  api<EventDto>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(input) });

export const deleteEvent = (id: string) => api<void>(`/events/${id}`, { method: 'DELETE' });
