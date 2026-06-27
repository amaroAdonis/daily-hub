import { format, parseISO } from 'date-fns';
import type { EventOccurrence } from '@daily-hub/shared';
import { useDeleteEvent } from '../hooks';

interface Props {
  occurrence: EventOccurrence;
  onEdit: (eventId: string) => void;
}

export function EventItem({ occurrence, onEdit }: Props) {
  const remove = useDeleteEvent();

  const time = occurrence.allDay
    ? 'Dia inteiro'
    : `${format(parseISO(occurrence.start), 'HH:mm')}–${format(parseISO(occurrence.end), 'HH:mm')}`;

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
      <span className="w-24 shrink-0 font-mono text-xs text-muted">{time}</span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm text-ink">
          {occurrence.title}
          {occurrence.recurring && (
            <span title="Compromisso recorrente" aria-label="recorrente" className="text-muted">
              ↻
            </span>
          )}
        </p>
        {occurrence.location && (
          <p className="truncate text-xs text-muted">{occurrence.location}</p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(occurrence.eventId)}
          className="rounded-md px-2 py-1 text-xs text-muted hover:text-primary"
        >
          Editar
        </button>
        <button
          type="button"
          aria-label="Excluir compromisso"
          onClick={() => remove.mutate(occurrence.eventId)}
          disabled={remove.isPending}
          className="rounded-md px-2 py-1 text-xs text-muted hover:text-danger"
        >
          Excluir
        </button>
      </div>
    </li>
  );
}
