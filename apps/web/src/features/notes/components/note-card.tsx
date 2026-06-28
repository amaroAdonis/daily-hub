import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Pencil, Star, Trash2 } from 'lucide-react';
import type { NoteDto } from '@daily-hub/shared';
import { fromDayString } from '../../calendar/dates';
import { useDeleteNote, useUpdateNote } from '../hooks';
import { listItemMotion } from '../../../lib/motion';
import { NoteMarkdown } from './markdown';
import { NoteForm } from './note-form';
import { ConnectionsButton } from '../../integration/components/connections-button';

const actionBtn = 'rounded-md p-1 text-muted transition-colors hover:text-primary';

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
    <motion.article
      {...listItemMotion}
      className="group rounded-xl border border-border bg-surface p-4 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate font-display font-semibold">{note.title}</h3>
        <button
          type="button"
          aria-label={note.pinned ? 'Desafixar' : 'Fixar'}
          aria-pressed={note.pinned}
          onClick={() => update.mutate({ id: note.id, input: { pinned: !note.pinned } })}
          className={`shrink-0 transition-colors ${note.pinned ? 'text-accent' : 'text-muted/40 hover:text-muted'}`}
        >
          <Star
            size={16}
            strokeWidth={2}
            fill={note.pinned ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
      </div>

      {note.content.trim() && <NoteMarkdown content={note.content} />}

      <div className="mt-3 flex items-center gap-x-3 text-xs text-muted">
        {!hideDate && note.date && (
          <span>{format(fromDayString(note.date), "d 'de' MMM 'de' yyyy", { locale: ptBR })}</span>
        )}
        <span className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            aria-label="Editar nota"
            title="Editar"
            onClick={() => setEditing(true)}
            className={actionBtn}
          >
            <Pencil size={15} strokeWidth={2} aria-hidden="true" />
          </button>
          <ConnectionsButton type="NOTE" id={note.id} title={note.title} className={actionBtn} />
          <button
            type="button"
            aria-label="Excluir nota"
            title="Excluir"
            onClick={() => remove.mutate(note.id)}
            disabled={remove.isPending}
            className={`${actionBtn} hover:text-danger`}
          >
            <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
          </button>
        </span>
      </div>
    </motion.article>
  );
}
