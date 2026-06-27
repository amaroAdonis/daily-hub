import { z } from 'zod';
import { id } from './common';

/** Status de uma tarefa, espelhando o enum `TaskStatus` do Prisma. */
export const taskStatus = z.enum(['TODO', 'DOING', 'DONE']);
export type TaskStatus = z.infer<typeof taskStatus>;

/** Prioridade, espelhando o enum `Priority` do Prisma. */
export const priority = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export type Priority = z.infer<typeof priority>;

/** Dia no formato `YYYY-MM-DD` (campo `@db.Date`). */
export const dayString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD');

/** Payload para criar uma tarefa. */
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Informe um título').max(200),
  description: z.string().trim().max(2000).optional(),
  date: dayString,
  status: taskStatus.optional(),
  priority: priority.optional(),
  order: z.number().int().min(0).optional(),
  goalId: id.optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/** Payload para atualizar uma tarefa (todos os campos opcionais). */
export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/** Filtros aceitos na listagem de tarefas. */
export const listTasksQuery = z.object({
  date: dayString.optional(),
  status: taskStatus.optional(),
});
export type ListTasksQuery = z.infer<typeof listTasksQuery>;

/** DTO de resposta de uma tarefa (datas serializadas como string). */
export const taskDto = z.object({
  id: id,
  title: z.string(),
  description: z.string().nullable(),
  date: dayString,
  status: taskStatus,
  priority: priority,
  order: z.number().int(),
  goalId: id.nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TaskDto = z.infer<typeof taskDto>;
