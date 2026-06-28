import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Target } from 'lucide-react';
import { fromDayString } from '../../calendar/dates';
import { ConnectionsButton } from '../../integration/components/connections-button';
import { useGoals } from '../hooks';

const MAX_GOALS = 5;

/**
 * Metas em foco no dashboard do dia: as ativas, com prazo mais próximo primeiro,
 * mostrando progresso de forma compacta. Mantém os objetivos à vista ao planejar.
 */
export function DayGoals() {
  const { data: goals } = useGoals({});

  const items = (goals ?? [])
    .filter((goal) => goal.status === 'TODO' || goal.status === 'DOING')
    .sort((a, b) => {
      if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
      if (a.targetDate) return -1;
      if (b.targetDate) return 1;
      return b.progress - a.progress;
    })
    .slice(0, MAX_GOALS);

  return (
    <section>
      <h2 className="mb-3 font-display text-base font-semibold">Metas em foco</h2>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          Nenhuma meta ativa. Defina um objetivo para guiar os seus dias.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((goal) => (
            <li
              key={goal.id}
              className="group rounded-xl border border-border bg-surface p-3 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Target
                    size={14}
                    strokeWidth={2}
                    className="shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm font-medium text-ink">{goal.title}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-muted">{goal.progress}%</span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>

              <div className="mt-2 flex items-center gap-x-3 text-xs text-muted">
                <span>
                  {goal.taskStats.done}/{goal.taskStats.total} tarefas
                </span>
                {goal.targetDate && (
                  <span>
                    {format(fromDayString(goal.targetDate), "d 'de' MMM", { locale: ptBR })}
                  </span>
                )}
                <ConnectionsButton
                  type="GOAL"
                  id={goal.id}
                  title={goal.title}
                  className="ml-auto rounded-md p-1 text-muted opacity-0 transition-all hover:text-primary focus-visible:opacity-100 group-hover:opacity-100"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
