import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import type { Priority, TaskDto } from '@daily-hub/shared';
import { useDeleteTask, useUpdateTask } from '../hooks';
import { listItemMotion } from '../../../lib/motion';
import { ConnectionsButton } from '../../integration/components/connections-button';

const PRIORITY: Record<Priority, { label: string; pill: string; dot: string }> = {
  HIGH: { label: 'Alta', pill: 'bg-danger/10 text-danger', dot: 'bg-danger' },
  MEDIUM: { label: 'Média', pill: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  LOW: { label: 'Baixa', pill: 'bg-muted/15 text-muted', dot: 'bg-muted' },
};

const actionBtn =
  'rounded-md p-1 text-muted opacity-0 transition-all hover:text-primary focus-visible:opacity-100 group-hover:opacity-100';

export function TaskItem({ task }: { task: TaskDto }) {
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const done = task.status === 'DONE';
  const priority = PRIORITY[task.priority];

  const toggle = () => update.mutate({ id: task.id, input: { status: done ? 'TODO' : 'DONE' } });

  return (
    <motion.li
      {...listItemMotion}
      className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? 'Reabrir tarefa' : 'Concluir tarefa'}
        onClick={toggle}
        disabled={update.isPending}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all active:scale-90 ${
          done ? 'border-success bg-success text-surface' : 'border-border hover:border-primary'
        }`}
      >
        {done && (
          <svg viewBox="0 0 16 16" className="h-3 w-3 animate-fade-in" fill="none" aria-hidden>
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
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${priority.pill}`}
      >
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${priority.dot}`} aria-hidden />
        {priority.label}
      </span>

      <div className="flex shrink-0 items-center gap-0.5">
        <ConnectionsButton type="TASK" id={task.id} title={task.title} className={actionBtn} />
        <button
          type="button"
          aria-label="Excluir tarefa"
          title="Excluir"
          onClick={() => remove.mutate(task.id)}
          disabled={remove.isPending}
          className={`${actionBtn} hover:text-danger`}
        >
          <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </motion.li>
  );
}
