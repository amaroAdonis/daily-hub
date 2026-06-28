import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { EntityRef } from '@daily-hub/shared';
import { createAttachment, deleteAttachment, listAttachments, presignUpload } from './api';

export const attachmentKeys = {
  list: (ref: EntityRef) => ['attachments', ref.type, ref.id] as const,
};

export function useAttachments(ref: EntityRef) {
  return useQuery({
    queryKey: attachmentKeys.list(ref),
    queryFn: () => listAttachments({ entityType: ref.type, entityId: ref.id }),
  });
}

/**
 * Orquestra o upload por URL assinada: pede o presign, envia o arquivo direto
 * ao storage (PUT) e registra os metadados na API.
 */
export function useUploadAttachment(ref: EntityRef) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const contentType = file.type || 'application/octet-stream';
      const { uploadUrl, key } = await presignUpload({
        entityType: ref.type,
        entityId: ref.id,
        filename: file.name,
        contentType,
        size: file.size,
      });
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file,
      });
      if (!res.ok) throw new Error('Falha ao enviar o arquivo ao storage');
      return createAttachment({ entityType: ref.type, entityId: ref.id, key, filename: file.name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(ref) });
      toast.success('Anexo enviado.');
    },
  });
}

export function useDeleteAttachment(ref: EntityRef) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(ref) });
      toast.success('Anexo removido.');
    },
  });
}
