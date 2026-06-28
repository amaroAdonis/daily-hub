import { useState } from 'react';
import { parseISO } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { CalendarClock, Plus } from 'lucide-react';
import type { EventOccurrence } from '@daily-hub/shared';
import { SkeletonList } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/ui/empty-state';
import { useEvent, useEventOccurrences } from '../hooks';
import { EventForm } from './event-form';
import { EventItem } from './event-item';

/** Períodos do dia, na ordem em que aparecem. */
const PERIODS = [
  { key: 'allday', label: 'Dia inteiro' },
  { key: 'morning', label: 'Manhã' },
  { key: 'afternoon', label: 'Tarde' },
  { key: 'evening', label: 'Noite' },
] as const;

type PeriodKey = (typeof PERIODS)[number]['key'];

function periodOf(occ: EventOccurrence): PeriodKey {
  if (occ.allDay) return 'allday';
  const hour = parseISO(occ.start).getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Compromissos de um dia agrupados por período (Manhã/Tarde/Noite), com criação
 * e edição inline. Editar abre a série inteira do compromisso.
 */
export function DayEvents({ date }: { date: string }) {
  const { data: byDay, isLoading, isError } = useEventOccurrences({ from: date, to: date });
  const [composing, setComposing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: editingEvent } = useEvent(editingId);

  const occurrences = byDay?.get(date) ?? [];
  const groups = PERIODS.map((period) => ({
    ...period,
    items: occurrences.filter((occ) => periodOf(occ) === period.key),
  })).filter((group) => group.items.length > 0);

  const startEdit = (eventId: string) => {
    setComposing(false);
    setEditingId(eventId);
  };
  const closeForm = () => {
    setComposing(false);
    setEditingId(null);
  };

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">Compromissos</h2>
        {!composing && !editingId && (
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
          <EventForm defaultDate={date} onClose={closeForm} />
        </div>
      )}
      {editingId && editingEvent && (
        <div className="mb-3">
          <EventForm defaultDate={date} event={editingEvent} onClose={closeForm} />
        </div>
      )}

      {isLoading && <SkeletonList rows={3} />}
      {isError && (
        <p className="text-sm text-danger">
          Não foi possível carregar os compromissos. Suba a API e o Postgres.
        </p>
      )}
      {!isLoading && !isError && occurrences.length === 0 && !composing && (
        <EmptyState
          icon={CalendarClock}
          title="Sem compromissos"
          description="Nada agendado para este dia."
        />
      )}

      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <div key={group.key}>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              {group.label}
            </p>
            <ul className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {group.items.map((occ) => (
                  <EventItem
                    key={`${occ.eventId}-${occ.start}`}
                    occurrence={occ}
                    onEdit={startEdit}
                  />
                ))}
              </AnimatePresence>
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
