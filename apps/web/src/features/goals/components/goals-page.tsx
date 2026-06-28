import { useState } from 'react';
import type { GoalStatus } from '@daily-hub/shared';
import { SkeletonList } from '../../../components/ui/skeleton';
import { useGoals } from '../hooks';
import { STATUS_OPTIONS } from '../labels';
import { GoalCard } from './goal-card';
import { GoalForm } from './goal-form';

type Filter = GoalStatus | 'ALL';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  ...STATUS_OPTIONS.map((o) => ({ value: o.value as Filter, label: o.label })),
];

export function GoalsPage() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [creating, setCreating] = useState(false);
  const { data: goals, isLoading, isError } = useGoals(filter === 'ALL' ? {} : { status: filter });

  const parentOptions = (goals ?? []).map((goal) => ({ id: goal.id, title: goal.title }));

  return (
    <div className="max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center rounded-xl border border-border p-0.5" role="tablist">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              role="tab"
              aria-selected={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                filter === option.value
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
          >
            Nova meta
          </button>
        )}
      </div>

      {creating && (
        <div className="mb-4">
          <GoalForm parentOptions={parentOptions} onClose={() => setCreating(false)} />
        </div>
      )}

      {isLoading && <SkeletonList rows={4} />}
      {isError && (
        <p className="text-sm text-danger">
          Não foi possível carregar as metas. Suba a API e o Postgres.
        </p>
      )}
      {!isLoading && !isError && goals?.length === 0 && !creating && (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          Nenhuma meta ainda. Que tal definir a primeira?
        </p>
      )}

      <div className="flex flex-col gap-3">
        {goals?.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            subGoals={goal.children}
            parentOptions={parentOptions}
          />
        ))}
      </div>
    </div>
  );
}
