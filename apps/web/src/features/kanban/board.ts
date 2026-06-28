import type { EventDto, GoalDto, TaskDto } from '@daily-hub/shared';
import type { ProgressStatus } from '../../lib/status';

export type BoardItemType = 'TASK' | 'EVENT' | 'GOAL';

/** Item normalizado do quadro: une tarefa, compromisso e meta sob um status comum. */
export interface BoardItem {
  key: string;
  type: BoardItemType;
  id: string;
  title: string;
  status: ProgressStatus;
  task?: TaskDto;
  event?: EventDto;
  goal?: GoalDto;
}

/** Concluídos só contam no quadro se atualizados nos últimos N dias. */
const RECENT_DONE_DAYS = 30;

function isVisible(status: ProgressStatus, updatedAt: string, cutoff: number): boolean {
  return status !== 'DONE' || new Date(updatedAt).getTime() >= cutoff;
}

/**
 * Monta os cartões do quadro a partir das três fontes. Metas arquivadas ficam
 * de fora; concluídos antigos (>30d) também, para o quadro não inchar.
 */
export function buildBoard(tasks: TaskDto[], events: EventDto[], goals: GoalDto[]): BoardItem[] {
  const cutoff = Date.now() - RECENT_DONE_DAYS * 86_400_000;
  const items: BoardItem[] = [];

  for (const task of tasks) {
    if (isVisible(task.status, task.updatedAt, cutoff)) {
      items.push({
        key: `TASK:${task.id}`,
        type: 'TASK',
        id: task.id,
        title: task.title,
        status: task.status,
        task,
      });
    }
  }
  for (const event of events) {
    if (isVisible(event.status, event.updatedAt, cutoff)) {
      items.push({
        key: `EVENT:${event.id}`,
        type: 'EVENT',
        id: event.id,
        title: event.title,
        status: event.status,
        event,
      });
    }
  }
  for (const goal of goals) {
    if (goal.status === 'ARCHIVED') continue;
    const status = goal.status as ProgressStatus;
    if (isVisible(status, goal.updatedAt, cutoff)) {
      items.push({
        key: `GOAL:${goal.id}`,
        type: 'GOAL',
        id: goal.id,
        title: goal.title,
        status,
        goal,
      });
    }
  }

  return items;
}
