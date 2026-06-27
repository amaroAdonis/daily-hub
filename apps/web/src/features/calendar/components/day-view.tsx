import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayTasks } from '../../tasks/components/day-tasks';
import { DayEvents } from '../../events/components/day-events';
import { DayNotes } from '../../notes/components/day-notes';
import { fromDayString, todayString } from '../dates';

/**
 * Visão do dia: a agenda da data reúne compromissos (Fase 3), tarefas (Fase 1)
 * e notas anexadas ao dia (Fase 5), reaproveitando cada feature.
 */
export function DayView({ day }: { day: string }) {
  const date = fromDayString(day);
  const isToday = day === todayString();

  return (
    <section>
      <div className="mb-4 flex items-baseline gap-2">
        <h3 className="font-display text-base font-semibold capitalize">
          {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </h3>
        {isToday && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
            hoje
          </span>
        )}
      </div>
      <DayEvents date={day} />
      <DayTasks date={day} />
      <DayNotes date={day} />
    </section>
  );
}
