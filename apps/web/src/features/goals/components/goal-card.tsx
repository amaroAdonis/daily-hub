import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { GoalDto, GoalStatus } from '@daily-hub/shared';
import { fromDayString } from '../../calendar/dates';
import { useDeleteGoal } from '../hooks';
import { HORIZON_LABEL, STATUS_LABEL } from '../labels';
import { GoalForm } from './goal-form';
import { GoalTasks } from './goal-tasks';
import { ConnectionsButton } from '../../integration/components/connections-button';

const STATUS_STYLE: Record<GoalStatus, string> = {
  TODO: 'bg-slate-400/10 text-slate-600',
  DOING: 'bg-amber-500/10 text-amber-700',
  DONE: 'bg-emerald-500/10 text-emerald-700',
  ARCHIVED: 'bg-bg text-muted',
};

interface Props {
  goal: GoalDto;
  subGoals?: GoalDto[];
  parentOptions: { id: string; title: string }[];
  isChild?: boolean;
}

export function GoalCard({ goal, subGoals = [], parentOptions, isChild = false }: Props) {
  const [editing, setEditing] = useState(false);
  const [addingSub, setAddingSub] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const remove = useDeleteGoal();

  if (editing) {
    return (
      <div className={isChild ? '' : 'rounded-xl border border-border bg-surface p-1'}>
        <GoalForm goal={goal} parentOptions={parentOptions} onClose={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <article
      className={`rounded-xl border border-border bg-surface p-4 ${isChild ? 'border-dashed' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display font-semibold">{goal.title}</h3>
          {goal.description && <p className="mt-0.5 text-sm text-muted">{goal.description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[goal.status]}`}>
            {STATUS_LABEL[goal.status]}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{HORIZON_LABEL[goal.horizon]}</span>
          <span className="font-mono">{goal.progress}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg">
          <div className="h-full rounded-full bg-primary" style={{ width: `${goal.progress}%` }} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <button
          type="button"
          onClick={() => setShowTasks((v) => !v)}
          className="hover:text-ink"
          aria-expanded={showTasks}
        >
          {goal.taskStats.done}/{goal.taskStats.total} tarefas {showTasks ? '▾' : '▸'}
        </button>
        {goal.targetDate && (
          <span>
            Prazo:{' '}
            {format(fromDayString(goal.targetDate), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
          </span>
        )}
        <span className="ml-auto flex items-center gap-2">
          {!isChild && (
            <button type="button" onClick={() => setAddingSub(true)} className="hover:text-primary">
              + Sub-meta
            </button>
          )}
          <button type="button" onClick={() => setEditing(true)} className="hover:text-primary">
            Editar
          </button>
          <ConnectionsButton type="GOAL" id={goal.id} title={goal.title} />
          <button
            type="button"
            onClick={() => remove.mutate(goal.id)}
            disabled={remove.isPending}
            className="hover:text-danger"
          >
            Excluir
          </button>
        </span>
      </div>

      {showTasks && <GoalTasks goalId={goal.id} />}

      {(subGoals.length > 0 || addingSub) && (
        <div className="mt-3 flex flex-col gap-2 border-l-2 border-border pl-3">
          {addingSub && (
            <GoalForm
              defaultParentId={goal.id}
              parentOptions={parentOptions}
              onClose={() => setAddingSub(false)}
            />
          )}
          {subGoals.map((child) => (
            <GoalCard key={child.id} goal={child} parentOptions={parentOptions} isChild />
          ))}
        </div>
      )}
    </article>
  );
}
