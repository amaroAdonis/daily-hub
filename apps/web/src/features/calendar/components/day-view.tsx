import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DayTasks } from '../../tasks/components/day-tasks';
import { fromDayString, todayString } from '../dates';

/**
 * Visão do dia: a agenda da data agrega, por ora, as tarefas (Eventos entram
 * na Fase 3). Reaproveita a feature de Tarefas para criar/concluir/excluir.
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
      <DayTasks date={day} />
    </section>
  );
}
