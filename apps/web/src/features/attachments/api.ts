import type {
  AttachmentDto,
  CreateAttachmentInput,
  ListAttachmentsQuery,
  PresignUploadDto,
  PresignUploadInput,
} from '@daily-hub/shared';
import { api } from '../../lib/api';

export const presignUpload = (input: PresignUploadInput) =>
  api<PresignUploadDto>('/attachments/presign', { method: 'POST', body: JSON.stringify(input) });

export const createAttachment = (input: CreateAttachmentInput) =>
  api<AttachmentDto>('/attachments', { method: 'POST', body: JSON.stringify(input) });

export const listAttachments = (query: ListAttachmentsQuery) =>
  api<AttachmentDto[]>(`/attachments?entityType=${query.entityType}&entityId=${query.entityId}`);

export const deleteAttachment = (id: string) =>
  api<void>(`/attachments/${id}`, { method: 'DELETE' });
