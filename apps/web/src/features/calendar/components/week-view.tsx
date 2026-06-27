import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTasks } from '../../tasks/hooks';
import { toDayString, todayString, weekDays } from '../dates';

interface Props {
  reference: Date;
  onSelectDay: (day: string) => void;
}

/** Coluna de um dia da semana: tarefas em formato compacto (read-only). */
function WeekDayColumn({ day, onSelect }: { day: Date; onSelect: (day: string) => void }) {
  const key = toDayString(day);
  const isToday = key === todayString();
  const { data: tasks } = useTasks({ date: key });

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

      <ul className="flex flex-1 flex-col gap-1 p-2">
        {tasks?.length ? (
          tasks.map((task) => {
            const done = task.status === 'DONE';
            return (
              <li key={task.id} className="flex items-center gap-1.5 text-xs">
                <span
                  className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                    done ? 'bg-success' : 'bg-primary'
                  }`}
                  aria-hidden
                />
                <span className={`truncate ${done ? 'text-muted line-through' : 'text-ink'}`}>
                  {task.title}
                </span>
              </li>
            );
          })
        ) : (
          <li className="px-1 py-2 text-xs text-muted/70">—</li>
        )}
      </ul>
    </div>
  );
}

export function WeekView({ reference, onSelectDay }: Props) {
  return (
    <section className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {weekDays(reference).map((day) => (
        <WeekDayColumn key={toDayString(day)} day={day} onSelect={onSelectDay} />
      ))}
    </section>
  );
}
