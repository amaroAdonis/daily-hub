import { z } from 'zod';
import { id } from './common';
import { dayString } from './tasks';

/** Payload para criar uma anotação. */
export const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'Informe um título').max(200),
  /** Conteúdo em Markdown. */
  content: z.string().max(50000).optional(),
  /** Dia opcional ao qual a nota fica anexada. */
  date: dayString.optional(),
  pinned: z.boolean().optional(),
});
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/** Payload para atualizar uma anotação (todos os campos opcionais). */
export const updateNoteSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    content: z.string().max(50000),
    date: dayString.nullable(),
    pinned: z.boolean(),
  })
  .partial();
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

/** Filtros aceitos na listagem de anotações. */
export const listNotesQuery = z.object({
  date: dayString.optional(),
  pinned: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});
export type ListNotesQuery = z.infer<typeof listNotesQuery>;

/** DTO de resposta de uma anotação. */
export const noteDto = z.object({
  id: id,
  title: z.string(),
  content: z.string(),
  date: dayString.nullable(),
  pinned: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type NoteDto = z.infer<typeof noteDto>;
