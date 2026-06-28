import { useMemo } from 'react';
import { isSameMonth } from 'date-fns';
import { useCalendarSummary } from '../hooks';
import { useEventOccurrences } from '../../events/hooks';
import { useNotes } from '../../notes/hooks';
import { monthGridDays, rangeForView, toDayString, todayString } from '../dates';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Props {
  reference: Date;
  onSelectDay: (day: string) => void;
}

export function MonthView({ reference, onSelectDay }: Props) {
  const days = monthGridDays(reference);
  const range = rangeForView('month', reference);
  const { data: summary, isError } = useCalendarSummary(range);
  const { data: eventsByDay } = useEventOccurrences(range);
  const { data: notes } = useNotes({});
  const today = todayString();

  // Contagem de notas por dia (notas sem data são ignoradas no calendário).
  const notesByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const note of notes ?? []) {
      if (note.date) map.set(note.date, (map.get(note.date) ?? 0) + 1);
    }
    return map;
  }, [notes]);

  return (
    <section>
      {isError && (
        <p className="mb-3 text-sm text-danger">
          Não foi possível carregar o resumo do mês. Suba a API e o Postgres.
        </p>
      )}
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
        {WEEKDAYS.map((label) => (
          <div key={label} className="bg-surface py-2 text-center text-xs font-medium text-muted">
            {label}
          </div>
        ))}

        {days.map((day) => {
          const key = toDayString(day);
          const inMonth = isSameMonth(day, reference);
          const isToday = key === today;
          const stats = summary?.get(key);
          const eventCount = eventsByDay?.get(key)?.length ?? 0;
          const noteCount = notesByDay.get(key) ?? 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(key)}
              className={`flex min-h-[5rem] flex-col bg-surface p-2 text-left transition-colors hover:bg-bg ${
                inMonth ? '' : 'text-muted/60'
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-sm ${
                  isToday ? 'bg-accent font-semibold text-surface' : ''
                }`}
              >
                {day.getDate()}
              </span>
              <span className="mt-auto flex flex-col gap-0.5 pt-1 text-xs text-muted">
                {eventCount > 0 && (
                  <span className="flex items-center gap-1 text-primary">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
                      aria-hidden
                    />
                    {eventCount} {eventCount === 1 ? 'compromisso' : 'compromissos'}
                  </span>
                )}
                {stats &&
                  (stats.done === stats.total ? (
                    <span className="text-success">{stats.total} ✓</span>
                  ) : (
                    <span>
                      {stats.total} {stats.total === 1 ? 'tarefa' : 'tarefas'}
                      {stats.done > 0 && <span className="text-success"> · {stats.done} ✓</span>}
                    </span>
                  ))}
                {noteCount > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted" aria-hidden />
                    {noteCount} {noteCount === 1 ? 'nota' : 'notas'}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
