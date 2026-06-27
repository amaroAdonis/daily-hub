import type { Priority, TaskDto } from '@daily-hub/shared';
import { useDeleteTask, useUpdateTask } from '../hooks';

const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

const PRIORITY_DOT: Record<Priority, string> = {
  LOW: 'bg-muted',
  MEDIUM: 'bg-primary',
  HIGH: 'bg-danger',
};

export function TaskItem({ task }: { task: TaskDto }) {
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const done = task.status === 'DONE';

  const toggle = () => update.mutate({ id: task.id, input: { status: done ? 'TODO' : 'DONE' } });

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? 'Reabrir tarefa' : 'Concluir tarefa'}
        onClick={toggle}
        disabled={update.isPending}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          done ? 'border-success bg-success text-surface' : 'border-border hover:border-primary'
        }`}
      >
        {done && (
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden>
            <path
              d="M3.5 8.5l3 3 6-6.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm ${done ? 'text-muted line-through' : 'text-ink'}`}>
          {task.title}
        </p>
        {task.description && <p className="truncate text-xs text-muted">{task.description}</p>}
      </div>

      <span
        className="flex items-center gap-1.5 text-xs text-muted"
        title={`Prioridade ${PRIORITY_LABEL[task.priority]}`}
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${PRIORITY_DOT[task.priority]}`}
          aria-hidden
        />
        {PRIORITY_LABEL[task.priority]}
      </span>

      <button
        type="button"
        aria-label="Excluir tarefa"
        onClick={() => remove.mutate(task.id)}
        disabled={remove.isPending}
        className="rounded-md px-2 py-1 text-xs text-muted opacity-0 transition-opacity hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
      >
        Excluir
      </button>
    </li>
  );
}
