import { format, parseISO } from 'date-fns';
import { CalendarPlus, Pencil, Repeat, Trash2, Video } from 'lucide-react';
import type { EventOccurrence } from '@daily-hub/shared';
import { useDeleteEvent } from '../hooks';
import { googleCalendarUrl } from '../google-calendar';
import { ConnectionsButton } from '../../integration/components/connections-button';

const actionBtn =
  'rounded-md p-1 text-muted opacity-0 transition-all hover:text-primary focus-visible:opacity-100 group-hover:opacity-100';

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
    <li className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-card transition-shadow hover:shadow-card-hover">
      <span className="w-24 shrink-0 font-mono text-xs text-muted">{time}</span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm text-ink">
          <span className="truncate">{occurrence.title}</span>
          {occurrence.recurring && (
            <Repeat
              size={12}
              strokeWidth={2}
              className="shrink-0 text-muted"
              aria-label="Compromisso recorrente"
            />
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

      <div className="flex shrink-0 items-center gap-0.5">
        <a
          href={googleCalendarUrl(occurrence)}
          target="_blank"
          rel="noreferrer"
          aria-label="Adicionar ao Google Agenda"
          title="Adicionar ao Google Agenda"
          className={actionBtn}
        >
          <CalendarPlus size={15} strokeWidth={2} aria-hidden="true" />
        </a>
        <button
          type="button"
          aria-label="Editar compromisso"
          title="Editar"
          onClick={() => onEdit(occurrence.eventId)}
          className={actionBtn}
        >
          <Pencil size={15} strokeWidth={2} aria-hidden="true" />
        </button>
        <ConnectionsButton
          type="EVENT"
          id={occurrence.eventId}
          title={occurrence.title}
          className={actionBtn}
        />
        <button
          type="button"
          aria-label="Excluir compromisso"
          title="Excluir"
          onClick={() => remove.mutate(occurrence.eventId)}
          disabled={remove.isPending}
          className={`${actionBtn} hover:text-danger`}
        >
          <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
