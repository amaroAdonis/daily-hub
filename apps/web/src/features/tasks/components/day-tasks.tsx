import { useEffect, useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CheckSquare } from 'lucide-react';
import type { TaskDto } from '@daily-hub/shared';
import { SkeletonList } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/ui/empty-state';
import { useTasks, useUpdateTask } from '../hooks';
import { TaskComposer } from './task-composer';
import { TaskItem } from './task-item';

/**
 * Lista de tarefas de um dia (`date` em YYYY-MM-DD), com criação inline,
 * contagem de concluídas e reordenação por arrastar (persiste `order`).
 */
export function DayTasks({ date }: { date: string }) {
  const { data: tasks, isLoading, isError } = useTasks({ date });
  const update = useUpdateTask();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Ordem local para o arrasto refletir na hora (otimista).
  const [ordered, setOrdered] = useState<TaskDto[]>([]);
  useEffect(() => {
    if (tasks) setOrdered(tasks);
  }, [tasks]);

  const done = tasks?.filter((task) => task.status === 'DONE').length ?? 0;
  const total = tasks?.length ?? 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((t) => t.id === active.id);
    const newIndex = ordered.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    next.forEach((task, index) => {
      if (task.order !== index) update.mutate({ id: task.id, input: { order: index } });
    });
  };

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-base font-semibold">Tarefas</h2>
        {total > 0 && (
          <span className="font-mono text-xs text-muted">
            {done}/{total} concluídas
          </span>
        )}
      </div>

      <TaskComposer date={date} />

      <div className="mt-4">
        {isLoading && <SkeletonList rows={4} />}
        {isError && (
          <p className="text-sm text-danger">
            Não foi possível carregar as tarefas. Suba a API e o Postgres.
          </p>
        )}
        {!isLoading && !isError && total === 0 && (
          <EmptyState
            icon={CheckSquare}
            title="Dia livre de tarefas"
            description="Adicione a primeira no campo acima e comece a organizar o seu dia."
          />
        )}
        {!isLoading && !isError && total > 0 && (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext
              items={ordered.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-2">
                {ordered.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </section>
  );
}
