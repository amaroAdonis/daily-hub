import { useState, type FormEvent } from 'react';
import { useCreateTask, useTasks, useUpdateTask } from '../../tasks/hooks';
import { todayString } from '../../calendar/dates';

/**
 * Tarefas vinculadas a uma meta: cria (já vinculada, para hoje), conclui/reabre
 * e desvincula. Reaproveita a feature de Tarefas (filtro `goalId`).
 */
export function GoalTasks({ goalId }: { goalId: string }) {
  const { data: tasks } = useTasks({ goalId });
  const create = useCreateTask();
  const update = useUpdateTask();
  const [title, setTitle] = useState('');

  const add = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    create.mutate(
      { title: trimmed, date: todayString(), goalId },
      { onSuccess: () => setTitle('') },
    );
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      <ul className="flex flex-col gap-1">
        {tasks?.map((task) => {
          const done = task.status === 'DONE';
          return (
            <li key={task.id} className="group flex items-center gap-2 text-sm">
              <button
                type="button"
                role="checkbox"
                aria-checked={done}
                aria-label={done ? 'Reabrir tarefa' : 'Concluir tarefa'}
                onClick={() =>
                  update.mutate({ id: task.id, input: { status: done ? 'TODO' : 'DONE' } })
                }
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                  done ? 'border-success bg-success text-surface' : 'border-border'
                }`}
              >
                {done ? '✓' : ''}
              </button>
              <span className={`flex-1 truncate ${done ? 'text-muted line-through' : ''}`}>
                {task.title}
              </span>
              <button
                type="button"
                onClick={() => update.mutate({ id: task.id, input: { goalId: null } })}
                className="text-xs text-muted opacity-0 hover:text-danger group-hover:opacity-100"
              >
                Desvincular
              </button>
            </li>
          );
        })}
      </ul>

      <form onSubmit={add} className="mt-2 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Vincular nova tarefa (hoje)…"
          aria-label="Nova tarefa da meta"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none placeholder:text-muted focus-visible:border-primary"
        />
        <button
          type="submit"
          disabled={create.isPending || !title.trim()}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-primary hover:bg-bg disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>
    </div>
  );
}
