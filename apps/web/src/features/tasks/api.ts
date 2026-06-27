import type { CreateTaskInput, ListTasksQuery, TaskDto, UpdateTaskInput } from '@daily-hub/shared';
import { api } from '../../lib/api';

/** Monta a query string a partir dos filtros de listagem. */
function toQueryString(query: ListTasksQuery): string {
  const params = new URLSearchParams();
  if (query.date) params.set('date', query.date);
  if (query.status) params.set('status', query.status);
  if (query.goalId) params.set('goalId', query.goalId);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const listTasks = (query: ListTasksQuery = {}) =>
  api<TaskDto[]>(`/tasks${toQueryString(query)}`);

export const createTask = (input: CreateTaskInput) =>
  api<TaskDto>('/tasks', { method: 'POST', body: JSON.stringify(input) });

export const updateTask = (id: string, input: UpdateTaskInput) =>
  api<TaskDto>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) });

export const deleteTask = (id: string) => api<void>(`/tasks/${id}`, { method: 'DELETE' });
