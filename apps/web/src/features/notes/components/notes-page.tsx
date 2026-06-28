import { useState } from 'react';
import { Skeleton } from '../../../components/ui/skeleton';
import { useNotes } from '../hooks';
import { NoteCard } from './note-card';
import { NoteForm } from './note-form';

type Filter = 'all' | 'pinned';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pinned', label: 'Fixadas' },
];

export function NotesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [creating, setCreating] = useState(false);
  const { data: notes, isLoading, isError } = useNotes(filter === 'pinned' ? { pinned: true } : {});

  return (
    <div className="max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center rounded-xl border border-border p-0.5" role="tablist">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              role="tab"
              aria-selected={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                filter === option.value
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
          >
            Nova nota
          </button>
        )}
      </div>

      {creating && (
        <div className="mb-4">
          <NoteForm onClose={() => setCreating(false)} />
        </div>
      )}

      {isLoading && (
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          role="status"
          aria-label="Carregando"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}
      {isError && (
        <p className="text-sm text-danger">
          Não foi possível carregar as notas. Suba a API e o Postgres.
        </p>
      )}
      {!isLoading && !isError && notes?.length === 0 && !creating && (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          Nenhuma nota ainda. Registre a primeira ideia.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {notes?.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
