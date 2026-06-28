import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateGoalInput, ListGoalsQuery, UpdateGoalInput } from '@daily-hub/shared';
import { createGoal, deleteGoal, listGoals, updateGoal } from './api';

export const goalKeys = {
  all: ['goals'] as const,
  list: (query: ListGoalsQuery) => ['goals', 'list', query] as const,
};

export function useGoals(query: ListGoalsQuery = {}) {
  return useQuery({
    queryKey: goalKeys.list(query),
    queryFn: () => listGoals(query),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) => createGoal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
      toast.success('Meta criada.');
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalInput }) => updateGoal(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: goalKeys.all }),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
      toast.success('Meta excluída.');
    },
  });
}
