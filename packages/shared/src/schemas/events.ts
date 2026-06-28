import { z } from 'zod';
import { id } from './common';
import { dayString } from './tasks';

/** Instante no formato ISO 8601 (aceita `Z` ou offset). */
export const isoDateTime = z.string().datetime({ offset: true });

/**
 * Regra de recorrência (RFC 5545) sem o prefixo `RRULE:`. Nula = evento único.
 * Ex.: `FREQ=WEEKLY;BYDAY=MO`. A expansão em ocorrências é feita na API.
 */
export const recurrenceRule = z
  .string()
  .trim()
  .regex(/^FREQ=/, 'A recorrência deve começar com FREQ=');

/** Payload para criar um compromisso. */
export const createEventSchema = z
  .object({
    title: z.string().trim().min(1, 'Informe um título').max(200),
    description: z.string().trim().max(2000).optional(),
    startsAt: isoDateTime,
    endsAt: isoDateTime,
    allDay: z.boolean().optional(),
    location: z.string().trim().max(200).optional(),
    meetingUrl: z.string().trim().url('URL inválida').max(500).optional(),
    recurrence: recurrenceRule.optional(),
    reminderMin: z.number().int().min(0).max(40320).optional(),
  })
  .refine((event) => event.endsAt >= event.startsAt, {
    message: '`endsAt` deve ser maior ou igual a `startsAt`',
    path: ['endsAt'],
  });
export type CreateEventInput = z.infer<typeof createEventSchema>;

/** Payload para atualizar um compromisso (todos os campos opcionais). */
export const updateEventSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).nullable(),
    startsAt: isoDateTime,
    endsAt: isoDateTime,
    allDay: z.boolean(),
    location: z.string().trim().max(200).nullable(),
    meetingUrl: z.string().trim().url('URL inválida').max(500).nullable(),
    recurrence: recurrenceRule.nullable(),
    reminderMin: z.number().int().min(0).max(40320).nullable(),
  })
  .partial();
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

/** Intervalo de dias consultado para expandir ocorrências (`from`..`to`). */
export const eventRangeQuery = z
  .object({ from: dayString, to: dayString })
  .refine((range) => range.from <= range.to, {
    message: '`from` deve ser menor ou igual a `to`',
    path: ['from'],
  });
export type EventRangeQuery = z.infer<typeof eventRangeQuery>;

/** DTO de resposta de um compromisso (base, não expandido). */
export const eventDto = z.object({
  id: id,
  title: z.string(),
  description: z.string().nullable(),
  startsAt: z.string(),
  endsAt: z.string(),
  allDay: z.boolean(),
  location: z.string().nullable(),
  meetingUrl: z.string().nullable(),
  recurrence: z.string().nullable(),
  reminderMin: z.number().int().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type EventDto = z.infer<typeof eventDto>;

/**
 * Uma ocorrência de um compromisso dentro de um intervalo. Eventos recorrentes
 * geram várias ocorrências, todas referenciando o `eventId` base.
 */
export const eventOccurrenceDto = z.object({
  eventId: id,
  title: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  meetingUrl: z.string().nullable(),
  allDay: z.boolean(),
  start: z.string(),
  end: z.string(),
  recurring: z.boolean(),
});
export type EventOccurrence = z.infer<typeof eventOccurrenceDto>;
