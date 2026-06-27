import { useTasks } from '../hooks';
import { TaskComposer } from './task-composer';
import { TaskItem } from './task-item';

/**
 * Lista de tarefas de um dia (`date` no formato YYYY-MM-DD), com criação
 * inline e contagem de concluídas. É a primeira tela real da agenda.
 */
export function DayTasks({ date }: { date: string }) {
  const { data: tasks, isLoading, isError } = useTasks({ date });

  const done = tasks?.filter((task) => task.status === 'DONE').length ?? 0;
  const total = tasks?.length ?? 0;

  return (
    <section className="max-w-2xl">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold">Tarefas do dia</h2>
        {total > 0 && (
          <span className="font-mono text-xs text-muted">
            {done}/{total} concluídas
          </span>
        )}
      </div>

      <TaskComposer date={date} />

      <div className="mt-4">
        {isLoading && <p className="text-sm text-muted">Carregando…</p>}
        {isError && (
          <p className="text-sm text-danger">
            Não foi possível carregar as tarefas. Suba a API e o Postgres.
          </p>
        )}
        {!isLoading && !isError && total === 0 && (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            Nenhuma tarefa para hoje. Que tal começar adicionando uma?
          </p>
        )}
        {!isLoading && !isError && total > 0 && (
          <ul className="flex flex-col gap-2">
            {tasks?.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
