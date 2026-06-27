import { z } from 'zod';

/** Enum de tipos de entidade, espelhando o enum do Prisma. */
export const entityType = z.enum(['TASK', 'GOAL', 'NOTE', 'EVENT', 'CONTACT']);
export type EntityType = z.infer<typeof entityType>;

/** Identificador (cuid). */
export const id = z.string().min(1);

/** Parâmetros padrão de paginação para listagens. */
export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof pagination>;

/** Formato padronizado de erro retornado pela API. */
export const apiError = z.object({
  statusCode: z.number(),
  message: z.string(),
  errors: z.record(z.array(z.string())).optional(),
});
export type ApiError = z.infer<typeof apiError>;
