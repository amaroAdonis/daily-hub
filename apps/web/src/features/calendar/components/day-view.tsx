import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayTasks } from '../../tasks/components/day-tasks';
import { DayEvents } from '../../events/components/day-events';
import { fromDayString, todayString } from '../dates';

/**
 * Visão do dia: a agenda da data reúne os compromissos (Fase 3) e as tarefas
 * (Fase 1), reaproveitando ambas as features.
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
    </section>
  );
}
