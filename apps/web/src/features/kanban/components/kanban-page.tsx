import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { PROGRESS_STATUS, type ProgressStatus } from '../../../lib/status';
import { SkeletonList } from '../../../components/ui/skeleton';
import { useTasks, useUpdateTask } from '../../tasks/hooks';
import { useEventsBase, useUpdateEvent } from '../../events/hooks';
import { useGoals, useUpdateGoal } from '../../goals/hooks';
import { buildBoard, type BoardItem, type BoardItemType } from '../board';
import { KanbanCard } from './kanban-card';

const COLUMNS: ProgressStatus[] = ['TODO', 'DOING', 'DONE'];

const TYPE_FILTERS: { value: 'ALL' | BoardItemType; label: string }[] = [
  { value: 'ALL', label: 'Tudo' },
  { value: 'TASK', label: 'Tarefas' },
  { value: 'EVENT', label: 'Compromissos' },
  { value: 'GOAL', label: 'Metas' },
];

function KanbanColumn({ status, items }: { status: ProgressStatus; items: BoardItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = PROGRESS_STATUS[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl border p-3 transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-border bg-bg/40'
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <span className={`inline-block h-2 w-2 rounded-full ${meta.dot}`} aria-hidden />
          {meta.label}
        </span>
        <span className="font-mono text-xs text-muted">{items.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {items.map((item) => (
          <KanbanCard key={item.key} item={item} />
        ))}
        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted">
            Arraste itens para cá
          </p>
        )}
      </div>
    </div>
  );
}

export function KanbanPage() {
  const { data: tasks, isLoading: lt } = useTasks({});
  const { data: events, isLoading: le } = useEventsBase();
  const { data: goals, isLoading: lg } = useGoals({});
  const updateTask = useUpdateTask();
  const updateEvent = useUpdateEvent();
  const updateGoal = useUpdateGoal();

  // Move imediato (otimista) enquanto a mutação não retorna.
  const [overrides, setOverrides] = useState<Record<string, ProgressStatus>>({});
  const [filter, setFilter] = useState<'ALL' | BoardItemType>('ALL');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const items = useMemo(() => {
    const board = buildBoard(tasks ?? [], events ?? [], goals ?? []);
    return board
      .map((item) => (overrides[item.key] ? { ...item, status: overrides[item.key]! } : item))
      .filter((item) => filter === 'ALL' || item.type === filter);
  }, [tasks, events, goals, overrides, filter]);

  const handleDragEnd = (event: DragEndEvent) => {
    const target = event.over?.id as ProgressStatus | undefined;
    const key = event.active.id as string;
    if (!target) return;
    const item = items.find((i) => i.key === key);
    if (!item || item.status === target) return;

    setOverrides((o) => ({ ...o, [key]: target }));
    const onSettled = () =>
      setOverrides((o) => {
        const next = { ...o };
        delete next[key];
        return next;
      });

    const input = { status: target } as const;
    if (item.type === 'TASK') updateTask.mutate({ id: item.id, input }, { onSettled });
    else if (item.type === 'EVENT') updateEvent.mutate({ id: item.id, input }, { onSettled });
    else updateGoal.mutate({ id: item.id, input }, { onSettled });

    toast.success(`Movido para "${PROGRESS_STATUS[target].label}"`);
  };

  const isLoading = lt || le || lg;

  return (
    <div className="mx-auto w-full max-w-[110rem]">
      <div className="mb-5 flex items-center rounded-xl border border-border p-0.5" role="tablist">
        {TYPE_FILTERS.map((option) => (
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

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {COLUMNS.map((status) => (
            <SkeletonList key={status} rows={3} />
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            {COLUMNS.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                items={items.filter((item) => item.status === status)}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}
