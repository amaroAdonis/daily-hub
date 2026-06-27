import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import type {
  CreateEventInput,
  EventOccurrence,
  EventRangeQuery,
  UpdateEventInput,
} from '@daily-hub/shared';
import { toDayString } from '../calendar/dates';
import { createEvent, deleteEvent, getEvent, listOccurrences, updateEvent } from './api';

export const eventKeys = {
  all: ['events'] as const,
  range: (range: EventRangeQuery) => ['events', 'range', range] as const,
  detail: (id: string) => ['events', 'detail', id] as const,
};

/**
 * Ocorrências do intervalo, agrupadas pelo dia **local** de início (é assim
 * que o usuário as vê na grade), para consulta O(1) por célula.
 */
export function useEventOccurrences(range: EventRangeQuery) {
  return useQuery({
    queryKey: eventKeys.range(range),
    queryFn: () => listOccurrences(range),
    select: (rows: EventOccurrence[]) => {
      const byDay = new Map<string, EventOccurrence[]>();
      for (const occ of rows) {
        const day = toDayString(parseISO(occ.start));
        const bucket = byDay.get(day);
        if (bucket) bucket.push(occ);
        else byDay.set(day, [occ]);
      }
      return byDay;
    },
  });
}

export function useEvent(id: string | null) {
  return useQuery({
    queryKey: eventKeys.detail(id ?? ''),
    queryFn: () => getEvent(id!),
    enabled: id !== null,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEventInput }) => updateEvent(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}
