import { z } from 'zod';
import { id } from './common';
import { dayString } from './tasks';

/** Horizonte da meta, espelhando o enum `GoalHorizon` do Prisma. */
export const goalHorizon = z.enum(['SHORT', 'MEDIUM', 'LONG']);
export type GoalHorizon = z.infer<typeof goalHorizon>;

/** Status da meta (eixo comum A fazer/Em andamento/Concluído + arquivada). */
export const goalStatus = z.enum(['TODO', 'DOING', 'DONE', 'ARCHIVED']);
export type GoalStatus = z.infer<typeof goalStatus>;

/** Payload para criar uma meta. */
export const createGoalSchema = z.object({
  title: z.string().trim().min(1, 'Informe um título').max(200),
  description: z.string().trim().max(2000).optional(),
  horizon: goalHorizon.optional(),
  status: goalStatus.optional(),
  progress: z.number().int().min(0).max(100).optional(),
  targetDate: dayString.optional(),
  parentId: id.optional(),
});
export type CreateGoalInput = z.infer<typeof createGoalSchema>;

/** Payload para atualizar uma meta (todos os campos opcionais). */
export const updateGoalSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).nullable(),
    horizon: goalHorizon,
    status: goalStatus,
    progress: z.number().int().min(0).max(100),
    targetDate: dayString.nullable(),
    parentId: id.nullable(),
  })
  .partial();
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

/** Filtros aceitos na listagem de metas. */
export const listGoalsQuery = z.object({
  status: goalStatus.optional(),
});
export type ListGoalsQuery = z.infer<typeof listGoalsQuery>;

/** Progresso derivado das tarefas vinculadas a uma meta. */
export const goalTaskStats = z.object({
  total: z.number().int(),
  done: z.number().int(),
});
export type GoalTaskStats = z.infer<typeof goalTaskStats>;

/** DTO de resposta de uma meta (sem filhos). */
export const goalDto = z.object({
  id: id,
  title: z.string(),
  description: z.string().nullable(),
  horizon: goalHorizon,
  status: goalStatus,
  progress: z.number().int(),
  targetDate: dayString.nullable(),
  parentId: id.nullable(),
  taskStats: goalTaskStats,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type GoalDto = z.infer<typeof goalDto>;

/** Meta de topo com suas sub-metas (um nível). */
export const goalWithChildrenDto = goalDto.extend({
  children: z.array(goalDto),
});
export type GoalWithChildren = z.infer<typeof goalWithChildrenDto>;
