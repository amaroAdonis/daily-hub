import { useState, type FormEvent } from 'react';
import type { NoteDto } from '@daily-hub/shared';
import { useCreateNote, useUpdateNote } from '../hooks';

interface Props {
  /** Quando presente, edita a nota; caso contrário, cria. */
  note?: NoteDto;
  /** Dia ao qual anexar a nota ao criar (opcional). */
  defaultDate?: string;
  onClose: () => void;
}

export function NoteForm({ note, defaultDate, onClose }: Props) {
  const isEdit = Boolean(note);
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [date, setDate] = useState(note?.date ?? defaultDate ?? '');
  const [pinned, setPinned] = useState(note?.pinned ?? false);

  const create = useCreateNote();
  const update = useUpdateNote();
  const pending = create.isPending || update.isPending;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const onSuccess = () => onClose();
    if (isEdit && note) {
      update.mutate(
        { id: note.id, input: { title: trimmed, content, date: date || null, pinned } },
        { onSuccess },
      );
    } else {
      create.mutate(
        { title: trimmed, content: content || undefined, date: date || undefined, pinned },
        { onSuccess },
      );
    }
  };

  const field =
    'rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:border-primary';

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da nota"
        aria-label="Título"
        autoFocus
        className={field}
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escreva em Markdown…"
        aria-label="Conteúdo"
        rows={6}
        className={`${field} font-mono`}
      />
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-muted">
          Anexar ao dia
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Dia"
            className={field}
          />
        </label>
        <label className="flex items-center gap-1.5 text-sm text-muted">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          Fixar
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-2 text-sm text-muted hover:text-ink"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending || !title.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isEdit ? 'Salvar' : 'Criar nota'}
        </button>
      </div>
    </form>
  );
}
