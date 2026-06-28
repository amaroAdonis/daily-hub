import { format, parseISO } from 'date-fns';
import { CalendarPlus, Video } from 'lucide-react';
import type { EventOccurrence } from '@daily-hub/shared';
import { useDeleteEvent } from '../hooks';
import { googleCalendarUrl } from '../google-calendar';
import { ConnectionsButton } from '../../integration/components/connections-button';

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

      {occurrence.meetingUrl && (
        <a
          href={occurrence.meetingUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Entrar na reunião"
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
        >
          <Video size={14} strokeWidth={2} aria-hidden="true" />
          Entrar
        </a>
      )}

      <div className="flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <a
          href={googleCalendarUrl(occurrence)}
          target="_blank"
          rel="noreferrer"
          aria-label="Adicionar ao Google Agenda"
          title="Adicionar ao Google Agenda"
          className="rounded-md px-2 py-1 text-muted hover:text-primary"
        >
          <CalendarPlus size={14} strokeWidth={2} aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={() => onEdit(occurrence.eventId)}
          className="rounded-md px-2 py-1 text-xs text-muted hover:text-primary"
        >
          Editar
        </button>
        <ConnectionsButton
          type="EVENT"
          id={occurrence.eventId}
          title={occurrence.title}
          className="rounded-md px-2 py-1 text-xs text-muted hover:text-primary"
        />
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
