import { z } from 'zod';
import { id } from './common';
import { dayString } from './tasks';

/**
 * Intervalo de dias consultado pelas visões do calendário (`from`..`to`,
 * inclusivos). A web envia o intervalo já alinhado à grade visível.
 */
export const calendarRangeQuery = z
  .object({
    from: dayString,
    to: dayString,
  })
  .refine((range) => range.from <= range.to, {
    message: '`from` deve ser menor ou igual a `to`',
    path: ['from'],
  });
export type CalendarRangeQuery = z.infer<typeof calendarRangeQuery>;

/**
 * Agregação das tarefas de um dia, usada para os indicadores do calendário.
 * Dias sem tarefas são omitidos da resposta; a web preenche com zero.
 */
export const daySummaryDto = z.object({
  date: dayString,
  total: z.number().int(),
  done: z.number().int(),
});
export type DaySummary = z.infer<typeof daySummaryDto>;

/** Consulta o detalhe agregado de um único dia (dashboard). */
export const dayDetailQuery = z.object({
  date: dayString,
});
export type DayDetailQuery = z.infer<typeof dayDetailQuery>;

/** Contato vinculado (via EntityLink) a alguma atividade do dia. */
export const dayContactDto = z.object({
  id: id,
  name: z.string(),
  company: z.string().nullable(),
  email: z.string().nullable(),
});
export type DayContact = z.infer<typeof dayContactDto>;

/** Agregação do dia para o dashboard. Hoje reúne as pessoas vinculadas. */
export const dayDetailDto = z.object({
  date: dayString,
  contacts: z.array(dayContactDto),
});
export type DayDetail = z.infer<typeof dayDetailDto>;
