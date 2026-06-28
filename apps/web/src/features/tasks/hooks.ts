import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from '@daily-hub/shared';
import { createTask, deleteTask, listTasks, updateTask } from './api';

/** Chaves de cache da feature de tarefas. */
export const taskKeys = {
  all: ['tasks'] as const,
  list: (query: ListTasksQuery) => ['tasks', 'list', query] as const,
};

export function useTasks(query: ListTasksQuery) {
  return useQuery({
    queryKey: taskKeys.list(query),
    queryFn: () => listTasks(query),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success('Tarefa criada.');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => updateTask(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success('Tarefa excluída.');
    },
  });
}
