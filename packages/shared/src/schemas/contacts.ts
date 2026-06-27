import { z } from 'zod';
import { id } from './common';

/** Payload para criar um contato. */
export const createContactSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome').max(200),
  email: z.string().trim().email('E-mail inválido').max(200).optional(),
  phone: z.string().trim().max(50).optional(),
  company: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
});
export type CreateContactInput = z.infer<typeof createContactSchema>;

/** Payload para atualizar um contato (todos os campos opcionais; `null` limpa). */
export const updateContactSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email('E-mail inválido').max(200).nullable(),
    phone: z.string().trim().max(50).nullable(),
    company: z.string().trim().max(200).nullable(),
    notes: z.string().trim().max(2000).nullable(),
  })
  .partial();
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

/** Filtros aceitos na listagem de contatos. */
export const listContactsQuery = z.object({
  /** Busca por nome, e-mail ou empresa. */
  search: z.string().trim().max(200).optional(),
});
export type ListContactsQuery = z.infer<typeof listContactsQuery>;

/** DTO de resposta de um contato. */
export const contactDto = z.object({
  id: id,
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ContactDto = z.infer<typeof contactDto>;
