import { useDraggable } from '@dnd-kit/core';
import { format, parseISO } from 'date-fns';
import type { Priority } from '@daily-hub/shared';
import { ConnectionsButton } from '../../integration/components/connections-button';
import type { BoardItem } from '../board';
import { TYPE_META } from '../type-meta';

const PRIORITY: Record<Priority, { label: string; pill: string; dot: string }> = {
  HIGH: { label: 'Alta', pill: 'bg-danger/10 text-danger', dot: 'bg-danger' },
  MEDIUM: { label: 'Média', pill: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  LOW: { label: 'Baixa', pill: 'bg-muted/15 text-muted', dot: 'bg-muted' },
};

export function KanbanCard({ item }: { item: BoardItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.key,
  });
  const type = TYPE_META[item.type];
  const TypeIcon = type.icon;

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group touch-none rounded-xl border border-l-4 border-border ${type.bar} bg-surface p-3 shadow-card transition-shadow hover:shadow-card-hover ${
        isDragging ? 'cursor-grabbing opacity-60' : 'cursor-grab'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${type.badge}`}
        >
          <TypeIcon size={12} strokeWidth={2} aria-hidden="true" />
          {type.label}
        </span>
        <ConnectionsButton
          type={item.type}
          id={item.id}
          title={item.title}
          className="rounded-md p-1 text-muted opacity-0 transition-all hover:text-primary focus-visible:opacity-100 group-hover:opacity-100"
        />
      </div>

      <p className="mt-1 line-clamp-2 text-sm font-medium text-ink">{item.title}</p>

      {item.task && (
        <span
          className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY[item.task.priority].pill}`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${PRIORITY[item.task.priority].dot}`}
            aria-hidden
          />
          {PRIORITY[item.task.priority].label}
        </span>
      )}

      {item.event && (
        <p className="mt-2 font-mono text-xs text-muted">
          {item.event.allDay
            ? 'Dia inteiro'
            : format(parseISO(item.event.startsAt), 'd MMM · HH:mm')}
        </p>
      )}

      {item.goal && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              {item.goal.taskStats.done}/{item.goal.taskStats.total} tarefas
            </span>
            <span className="font-mono">{item.goal.progress}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${item.goal.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
