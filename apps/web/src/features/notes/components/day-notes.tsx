import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNotes } from '../hooks';
import { NoteCard } from './note-card';
import { NoteForm } from './note-form';

/** Notas anexadas a um dia (`date` em YYYY-MM-DD), com criação inline. */
export function DayNotes({ date }: { date: string }) {
  const { data: notes, isError } = useNotes({ date });
  const [composing, setComposing] = useState(false);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">Notas</h2>
        {!composing && (
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Plus size={15} strokeWidth={2.5} aria-hidden="true" />
            Adicionar
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
        <AnimatePresence initial={false}>
          {notes?.map((note) => (
            <NoteCard key={note.id} note={note} hideDate />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
