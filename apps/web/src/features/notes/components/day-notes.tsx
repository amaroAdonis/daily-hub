import { useState } from 'react';
import { useNotes } from '../hooks';
import { NoteCard } from './note-card';
import { NoteForm } from './note-form';

/** Notas anexadas a um dia (`date` em YYYY-MM-DD), com criação inline. */
export function DayNotes({ date }: { date: string }) {
  const { data: notes, isError } = useNotes({ date });
  const [composing, setComposing] = useState(false);

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold">Notas</h2>
        {!composing && (
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="text-sm font-medium text-primary hover:opacity-80"
          >
            + Adicionar
          </button>
        )}
      </div>

      {composing && (
        <div className="mb-3">
          <NoteForm defaultDate={date} onClose={() => setComposing(false)} />
        </div>
      )}

      {isError && <p className="text-sm text-danger">Não foi possível carregar as notas do dia.</p>}
      {!isError && notes?.length === 0 && !composing && (
        <p className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted">
          Nenhuma nota anexada a este dia.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {notes?.map((note) => (
          <NoteCard key={note.id} note={note} hideDate />
        ))}
      </div>
    </section>
  );
}
