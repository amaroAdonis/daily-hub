import { useRef, type ChangeEvent } from 'react';
import { Download, FileText, Paperclip, Trash2 } from 'lucide-react';
import type { EntityRef } from '@daily-hub/shared';
import { useAttachments, useDeleteAttachment, useUploadAttachment } from '../hooks';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Lista, envia e remove os anexos de uma entidade. Usada no Inspetor. */
export function EntityAttachments({ entityRef }: { entityRef: EntityRef }) {
  const { data: attachments, isLoading } = useAttachments(entityRef);
  const upload = useUploadAttachment(entityRef);
  const remove = useDeleteAttachment(entityRef);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) upload.mutate(file);
    event.target.value = ''; // permite reenviar o mesmo arquivo
  };

  const items = attachments ?? [];

  return (
    <div>
      {isLoading && <p className="text-xs text-muted">Carregando…</p>}

      {!isLoading && items.length === 0 && <p className="text-xs text-muted">Nenhum anexo.</p>}

      <ul className="flex flex-col gap-2">
        {items.map((att) => (
          <li key={att.id} className="flex items-center gap-3">
            {att.contentType.startsWith('image/') ? (
              <img
                src={att.url}
                alt={att.filename}
                className="h-10 w-10 shrink-0 rounded object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-bg text-muted">
                <FileText size={18} aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">{att.filename}</p>
              <p className="text-xs text-muted">{formatSize(att.size)}</p>
            </div>
            <a
              href={att.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Baixar ${att.filename}`}
              className="text-muted hover:text-primary"
            >
              <Download size={16} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => remove.mutate(att.id)}
              aria-label={`Excluir ${att.filename}`}
              className="text-muted hover:text-danger"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <input ref={inputRef} type="file" onChange={onPick} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={upload.isPending}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-primary hover:bg-bg disabled:opacity-60"
      >
        <Paperclip size={14} aria-hidden="true" />
        {upload.isPending ? 'Enviando…' : 'Anexar arquivo'}
      </button>
    </div>
  );
}
