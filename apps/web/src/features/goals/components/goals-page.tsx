import { useState } from 'react';
import { Target } from 'lucide-react';
import type { GoalStatus } from '@daily-hub/shared';
import { SkeletonList } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/ui/empty-state';
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
    <div className="mx-auto w-full max-w-[110rem]">
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
        <EmptyState
          icon={Target}
          title="Nenhuma meta ainda"
          description="Defina um objetivo e acompanhe o progresso por aqui."
          action={
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
            >
              Nova meta
            </button>
          }
        />
      )}

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2 xl:grid-cols-3">
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
