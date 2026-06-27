import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { EventOccurrence } from '@daily-hub/shared';
import { useTasks } from '../../tasks/hooks';
import { useEventOccurrences } from '../../events/hooks';
import { rangeForView, toDayString, todayString, weekDays } from '../dates';

interface Props {
  reference: Date;
  onSelectDay: (day: string) => void;
}

/** Coluna de um dia da semana: compromissos e tarefas em formato compacto. */
function WeekDayColumn({
  day,
  events,
  onSelect,
}: {
  day: Date;
  events: EventOccurrence[];
  onSelect: (day: string) => void;
}) {
  const key = toDayString(day);
  const isToday = key === todayString();
  const { data: tasks } = useTasks({ date: key });
  const isEmpty = events.length === 0 && !tasks?.length;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => onSelect(key)}
        className="border-b border-border px-3 py-2 text-left hover:bg-bg"
      >
        <span className="text-xs capitalize text-muted">
          {format(day, 'EEE', { locale: ptBR })}
        </span>
        <span
          className={`ml-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-sm ${
            isToday ? 'bg-accent font-semibold text-surface' : ''
          }`}
        >
          {day.getDate()}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-1 p-2">
        {events.map((occ) => (
          <div key={`${occ.eventId}-${occ.start}`} className="flex items-center gap-1.5 text-xs">
            <span className="shrink-0 font-mono text-muted">
              {occ.allDay ? '·' : format(parseISO(occ.start), 'HH:mm')}
            </span>
            <span className="truncate text-primary">{occ.title}</span>
          </div>
        ))}

        {tasks?.map((task) => {
          const done = task.status === 'DONE';
          return (
            <div key={task.id} className="flex items-center gap-1.5 text-xs">
              <span
                className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                  done ? 'bg-success' : 'bg-muted'
                }`}
                aria-hidden
              />
              <span className={`truncate ${done ? 'text-muted line-through' : 'text-ink'}`}>
                {task.title}
              </span>
            </div>
          );
        })}

        {isEmpty && <span className="px-1 py-2 text-xs text-muted/70">—</span>}
      </div>
    </div>
  );
}

export function WeekView({ reference, onSelectDay }: Props) {
  const { data: eventsByDay } = useEventOccurrences(rangeForView('week', reference));

  return (
    <section className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {weekDays(reference).map((day) => {
        const key = toDayString(day);
        return (
          <WeekDayColumn
            key={key}
            day={day}
            events={eventsByDay?.get(key) ?? []}
            onSelect={onSelectDay}
          />
        );
      })}
    </section>
  );
}
