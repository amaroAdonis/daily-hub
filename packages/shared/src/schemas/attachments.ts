import { z } from 'zod';
import { entityType, id } from './common';

/** Limite de tamanho por arquivo (10 MB). */
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

/** Pedido de URL assinada para upload. */
export const presignUploadSchema = z.object({
  entityType,
  entityId: id,
  filename: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(150),
  size: z.number().int().positive().max(MAX_ATTACHMENT_SIZE, 'Arquivo acima de 10 MB'),
});
export type PresignUploadInput = z.infer<typeof presignUploadSchema>;

/** Resposta do presign: para onde enviar (PUT) e a chave gerada. */
export const presignUploadDto = z.object({
  uploadUrl: z.string(),
  key: z.string(),
});
export type PresignUploadDto = z.infer<typeof presignUploadDto>;

/** Registro dos metadados após o upload concluído. */
export const createAttachmentSchema = z.object({
  entityType,
  entityId: id,
  key: z.string().min(1),
  filename: z.string().trim().min(1).max(255),
});
export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;

/** Filtro de listagem de anexos de uma entidade. */
export const listAttachmentsQuery = z.object({
  entityType,
  entityId: id,
});
export type ListAttachmentsQuery = z.infer<typeof listAttachmentsQuery>;

/** DTO de resposta de um anexo (com URL assinada de download). */
export const attachmentDto = z.object({
  id,
  entityType,
  entityId: id,
  filename: z.string(),
  contentType: z.string(),
  size: z.number().int(),
  createdAt: z.string(),
  url: z.string(),
});
export type AttachmentDto = z.infer<typeof attachmentDto>;
