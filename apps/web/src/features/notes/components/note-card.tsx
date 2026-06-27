import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { NoteDto } from '@daily-hub/shared';
import { fromDayString } from '../../calendar/dates';
import { useDeleteNote, useUpdateNote } from '../hooks';
import { NoteMarkdown } from './markdown';
import { NoteForm } from './note-form';

interface Props {
  note: NoteDto;
  /** Oculta o selo de data (ex.: dentro da visão de um dia específico). */
  hideDate?: boolean;
}

export function NoteCard({ note, hideDate = false }: Props) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateNote();
  const remove = useDeleteNote();

  if (editing) {
    return <NoteForm note={note} onClose={() => setEditing(false)} />;
  }

  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate font-display font-semibold">{note.title}</h3>
        <button
          type="button"
          aria-label={note.pinned ? 'Desafixar' : 'Fixar'}
          aria-pressed={note.pinned}
          onClick={() => update.mutate({ id: note.id, input: { pinned: !note.pinned } })}
          className={`shrink-0 text-sm ${note.pinned ? 'text-accent' : 'text-muted/50 hover:text-muted'}`}
        >
          ★
        </button>
      </div>

      {note.content.trim() && <NoteMarkdown content={note.content} />}

      <div className="mt-3 flex items-center gap-x-4 text-xs text-muted">
        {!hideDate && note.date && (
          <span>{format(fromDayString(note.date), "d 'de' MMM 'de' yyyy", { locale: ptBR })}</span>
        )}
        <span className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setEditing(true)} className="hover:text-primary">
            Editar
          </button>
          <button
            type="button"
            onClick={() => remove.mutate(note.id)}
            disabled={remove.isPending}
            className="hover:text-danger"
          >
            Excluir
          </button>
        </span>
      </div>
    </article>
  );
}
