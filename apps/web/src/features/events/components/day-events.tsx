import { useState } from 'react';
import { useEvent, useEventOccurrences } from '../hooks';
import { EventForm } from './event-form';
import { EventItem } from './event-item';

/**
 * Compromissos de um dia (`date` em YYYY-MM-DD): lista das ocorrências, com
 * criação e edição inline. Editar abre a série inteira do compromisso.
 */
export function DayEvents({ date }: { date: string }) {
  const { data: byDay, isLoading, isError } = useEventOccurrences({ from: date, to: date });
  const [composing, setComposing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: editingEvent } = useEvent(editingId);

  const occurrences = byDay?.get(date) ?? [];

  const startEdit = (eventId: string) => {
    setComposing(false);
    setEditingId(eventId);
  };
  const closeForm = () => {
    setComposing(false);
    setEditingId(null);
  };

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold">Compromissos</h2>
        {!composing && !editingId && (
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="text-sm font-medium text-primary hover:opacity-80"
          >
            + Adicionar
          </button>
        )}
      </div>

      {composing && <EventForm defaultDate={date} onClose={closeForm} />}
      {editingId && editingEvent && (
        <EventForm defaultDate={date} event={editingEvent} onClose={closeForm} />
      )}

      <div className="mt-3">
        {isLoading && <p className="text-sm text-muted">Carregando…</p>}
        {isError && (
          <p className="text-sm text-danger">
            Não foi possível carregar os compromissos. Suba a API e o Postgres.
          </p>
        )}
        {!isLoading && !isError && occurrences.length === 0 && !composing && (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
            Nenhum compromisso para este dia.
          </p>
        )}
        {occurrences.length > 0 && (
          <ul className="flex flex-col gap-2">
            {occurrences.map((occ) => (
              <EventItem key={`${occ.eventId}-${occ.start}`} occurrence={occ} onEdit={startEdit} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
