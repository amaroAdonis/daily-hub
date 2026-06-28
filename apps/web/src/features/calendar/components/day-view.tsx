import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarClock, CheckSquare, StickyNote } from 'lucide-react';
import { DayTasks } from '../../tasks/components/day-tasks';
import { DayEvents } from '../../events/components/day-events';
import { DayNotes } from '../../notes/components/day-notes';
import { useTasks } from '../../tasks/hooks';
import { useNotes } from '../../notes/hooks';
import { useEventOccurrences } from '../../events/hooks';
import { fromDayString, todayString } from '../dates';
import { DayContacts } from './day-contacts';

/** Uma contagem do resumo do dia (ícone + valor + rótulo). */
function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof CalendarClock;
  value: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted">
      <Icon size={15} strokeWidth={2} aria-hidden="true" />
      <span className="font-medium text-ink">{value}</span>
      {label}
    </span>
  );
}

/**
 * Dashboard do dia: resumo escaneável no topo e, abaixo, as atividades do dia
 * (compromissos, tarefas e notas, com CRUD inline) mais as pessoas vinculadas.
 * Reaproveita cada feature; as queries são compartilhadas via React Query.
 */
export function DayView({ day }: { day: string }) {
  const date = fromDayString(day);
  const isToday = day === todayString();

  // Mesmas queries dos sub-componentes (deduplicadas pela queryKey) — alimentam
  // só o resumo, sem custo extra de rede.
  const { data: tasks } = useTasks({ date: day });
  const { data: notes } = useNotes({ date: day });
  const { data: eventsByDay } = useEventOccurrences({ from: day, to: day });

  const eventCount = eventsByDay?.get(day)?.length ?? 0;
  const taskTotal = tasks?.length ?? 0;
  const taskDone = tasks?.filter((task) => task.status === 'DONE').length ?? 0;
  const noteCount = notes?.length ?? 0;

  return (
    <section className="max-w-4xl">
      <header className="mb-6">
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-lg font-semibold capitalize">
            {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h3>
          {isToday && (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
              hoje
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          <Stat
            icon={CalendarClock}
            value={String(eventCount)}
            label={eventCount === 1 ? 'compromisso' : 'compromissos'}
          />
          <Stat
            icon={CheckSquare}
            value={`${taskDone}/${taskTotal}`}
            label={taskTotal === 1 ? 'tarefa' : 'tarefas'}
          />
          <Stat
            icon={StickyNote}
            value={String(noteCount)}
            label={noteCount === 1 ? 'nota' : 'notas'}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <DayEvents date={day} />
          <DayTasks date={day} />
        </div>
        <div className="flex flex-col gap-6">
          <DayNotes date={day} />
          <DayContacts day={day} />
        </div>
      </div>
    </section>
  );
}
