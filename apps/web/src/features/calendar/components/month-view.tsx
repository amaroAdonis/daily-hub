import { useMemo } from 'react';
import { format, isSameMonth, parseISO } from 'date-fns';
import { useCalendarSummary } from '../hooks';
import { useEventOccurrences } from '../../events/hooks';
import { useNotes } from '../../notes/hooks';
import { monthGridDays, rangeForView, toDayString, todayString } from '../dates';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MAX_PILLS = 3;

interface Props {
  reference: Date;
  onSelectDay: (day: string) => void;
}

export function MonthView({ reference, onSelectDay }: Props) {
  const days = monthGridDays(reference);
  const weeks = days.length / 7;
  const range = rangeForView('month', reference);
  const { data: summary, isError } = useCalendarSummary(range);
  const { data: eventsByDay } = useEventOccurrences(range);
  const { data: notes } = useNotes({});
  const today = todayString();

  const notesByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const note of notes ?? []) {
      if (note.date) map.set(note.date, (map.get(note.date) ?? 0) + 1);
    }
    return map;
  }, [notes]);

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {isError && (
        <p className="mb-3 text-sm text-danger">
          Não foi possível carregar o resumo do mês. Suba a API e o Postgres.
        </p>
      )}
      <div
        className="grid flex-1 grid-cols-7 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-card"
        style={{ gridTemplateRows: `auto repeat(${weeks}, minmax(0, 1fr))` }}
      >
        {WEEKDAYS.map((label, i) => (
          <div
            key={label}
            className={`bg-surface py-2 text-center text-xs font-medium ${
              i === 0 || i === 6 ? 'text-muted/70' : 'text-muted'
            }`}
          >
            {label}
          </div>
        ))}

        {days.map((day, i) => {
          const key = toDayString(day);
          const inMonth = isSameMonth(day, reference);
          const isToday = key === today;
          const isWeekend = i % 7 === 0 || i % 7 === 6;
          const stats = summary?.get(key);
          const events = eventsByDay?.get(key) ?? [];
          const noteCount = notesByDay.get(key) ?? 0;
          const pendingTasks = stats ? stats.total - stats.done : 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(key)}
              className={`flex flex-col gap-1 p-2 text-left transition-colors hover:bg-bg ${
                isWeekend ? 'bg-bg/50' : 'bg-surface'
              } ${inMonth ? '' : 'text-muted/50'}`}
            >
              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-sm ${
                  isToday ? 'bg-accent font-semibold text-surface' : ''
                }`}
              >
                {day.getDate()}
              </span>

              <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                {events.slice(0, MAX_PILLS).map((occ) => (
                  <span
                    key={`${occ.eventId}-${occ.start}`}
                    className="flex items-center gap-1 truncate rounded-md bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
                    title={occ.title}
                  >
                    {!occ.allDay && (
                      <span className="shrink-0 font-mono text-[10px] opacity-80">
                        {format(parseISO(occ.start), 'HH:mm')}
                      </span>
                    )}
                    <span className="truncate">{occ.title}</span>
                  </span>
                ))}
                {events.length > MAX_PILLS && (
                  <span className="px-1.5 text-xs text-muted">
                    +{events.length - MAX_PILLS} mais
                  </span>
                )}

                {(pendingTasks > 0 || (stats && stats.done > 0) || noteCount > 0) && (
                  <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-0.5 px-0.5 text-xs text-muted">
                    {stats && stats.done === stats.total && stats.total > 0 && (
                      <span className="text-success">{stats.total} ✓</span>
                    )}
                    {pendingTasks > 0 && (
                      <span className="flex items-center gap-1">
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full bg-muted"
                          aria-hidden
                        />
                        {pendingTasks} {pendingTasks === 1 ? 'tarefa' : 'tarefas'}
                      </span>
                    )}
                    {noteCount > 0 && (
                      <span className="flex items-center gap-1">
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full bg-accent/70"
                          aria-hidden
                        />
                        {noteCount} {noteCount === 1 ? 'nota' : 'notas'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
