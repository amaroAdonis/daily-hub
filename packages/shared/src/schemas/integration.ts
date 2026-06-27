import { z } from 'zod';
import { entityType, id } from './common';

// ----------------------------------------------------------------------------
//  Referências polimórficas e previews
// ----------------------------------------------------------------------------

/** Referência a uma entidade qualquer pelo par (tipo, id). */
export const entityRef = z.object({ type: entityType, id });
export type EntityRef = z.infer<typeof entityRef>;

/** Representação leve e uniforme de uma entidade, para listas e resultados. */
export const entityPreview = z.object({
  type: entityType,
  id,
  title: z.string(),
  subtitle: z.string().nullable(),
});
export type EntityPreview = z.infer<typeof entityPreview>;

// ----------------------------------------------------------------------------
//  Busca global
// ----------------------------------------------------------------------------

export const searchQuery = z.object({ q: z.string().trim().min(1).max(100) });
export type SearchQuery = z.infer<typeof searchQuery>;

// ----------------------------------------------------------------------------
//  Tags / Taggings
// ----------------------------------------------------------------------------

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida (use #rrggbb)');

export const createTagSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome').max(50),
  color: hexColor.optional(),
});
export type CreateTagInput = z.infer<typeof createTagSchema>;

export const updateTagSchema = z
  .object({ name: z.string().trim().min(1).max(50), color: hexColor })
  .partial();
export type UpdateTagInput = z.infer<typeof updateTagSchema>;

export const tagDto = z.object({
  id,
  name: z.string(),
  color: z.string(),
  /** Quantidade de itens marcados com a tag. */
  count: z.number().int(),
});
export type TagDto = z.infer<typeof tagDto>;

/** Aplica/remove uma tag a uma entidade. */
export const taggingInput = z.object({
  tagId: id,
  entityType,
  entityId: id,
});
export type TaggingInput = z.infer<typeof taggingInput>;

/** Consulta as tags aplicadas a uma entidade. */
export const entityTagsQuery = z.object({ entityType, entityId: id });
export type EntityTagsQuery = z.infer<typeof entityTagsQuery>;

// ----------------------------------------------------------------------------
//  Links (EntityLink)
// ----------------------------------------------------------------------------

export const createLinkSchema = z
  .object({
    sourceType: entityType,
    sourceId: id,
    targetType: entityType,
    targetId: id,
    relation: z.string().trim().max(50).optional(),
  })
  .refine((link) => !(link.sourceType === link.targetType && link.sourceId === link.targetId), {
    message: 'Um item não pode se vincular a si mesmo',
    path: ['targetId'],
  });
export type CreateLinkInput = z.infer<typeof createLinkSchema>;

/** Consulta os itens relacionados a uma entidade. */
export const entityLinksQuery = z.object({ entityType, entityId: id });
export type EntityLinksQuery = z.infer<typeof entityLinksQuery>;

/** Um item relacionado a uma entidade (resolvido), com o id do link. */
export const relatedItem = z.object({
  linkId: id,
  relation: z.string().nullable(),
  direction: z.enum(['outgoing', 'incoming']),
  item: entityPreview,
});
export type RelatedItem = z.infer<typeof relatedItem>;
