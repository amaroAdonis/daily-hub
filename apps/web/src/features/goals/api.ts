import type {
  CreateGoalInput,
  GoalDto,
  GoalWithChildren,
  ListGoalsQuery,
  UpdateGoalInput,
} from '@daily-hub/shared';
import { api } from '../../lib/api';

export const listGoals = (query: ListGoalsQuery = {}) => {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  const qs = params.toString();
  return api<GoalWithChildren[]>(`/goals${qs ? `?${qs}` : ''}`);
};

export const createGoal = (input: CreateGoalInput) =>
  api<GoalDto>('/goals', { method: 'POST', body: JSON.stringify(input) });

export const updateGoal = (id: string, input: UpdateGoalInput) =>
  api<GoalDto>(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(input) });

export const deleteGoal = (id: string) => api<void>(`/goals/${id}`, { method: 'DELETE' });
