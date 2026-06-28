import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateGoalInput,
  GoalDto,
  GoalTaskStats,
  GoalWithChildren,
  ListGoalsQuery,
  UpdateGoalInput,
} from '@daily-hub/shared';
import type { Goal, Prisma } from '@daily-hub/db';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Converte um dia `YYYY-MM-DD` para meia-noite UTC, como exige `@db.Date`. */
  private toDate(day: string): Date {
    return new Date(`${day}T00:00:00.000Z`);
  }

  /** Total e concluídas das tarefas vinculadas a cada meta informada. */
  private async taskStatsByGoal(goalIds: string[]): Promise<Map<string, GoalTaskStats>> {
    const stats = new Map<string, GoalTaskStats>();
    if (goalIds.length === 0) return stats;

    const [totals, dones] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['goalId'],
        where: { goalId: { in: goalIds } },
        _count: { _all: true },
      }),
      this.prisma.task.groupBy({
        by: ['goalId'],
        where: { goalId: { in: goalIds }, status: 'DONE' },
        _count: { _all: true },
      }),
    ]);

    const doneByGoal = new Map(dones.map((row) => [row.goalId, row._count._all]));
    for (const row of totals) {
      if (!row.goalId) continue;
      stats.set(row.goalId, { total: row._count._all, done: doneByGoal.get(row.goalId) ?? 0 });
    }
    return stats;
  }

  private toDto(goal: Goal, stats: Map<string, GoalTaskStats>): GoalDto {
    return {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      horizon: goal.horizon,
      status: goal.status,
      progress: goal.progress,
      targetDate: goal.targetDate ? goal.targetDate.toISOString().slice(0, 10) : null,
      parentId: goal.parentId,
      taskStats: stats.get(goal.id) ?? { total: 0, done: 0 },
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
    };
  }

  /** Metas de topo (sem pai) com suas sub-metas e estatísticas de tarefas. */
  async list(userId: string, query: ListGoalsQuery): Promise<GoalWithChildren[]> {
    const where: Prisma.GoalWhereInput = { userId, parentId: null };
    if (query.status) where.status = query.status;

    const goals = await this.prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: { children: { orderBy: { createdAt: 'asc' } } },
    });

    const allIds = goals.flatMap((goal) => [goal.id, ...goal.children.map((child) => child.id)]);
    const stats = await this.taskStatsByGoal(allIds);

    return goals.map((goal) => ({
      ...this.toDto(goal, stats),
      children: goal.children.map((child) => this.toDto(child, stats)),
    }));
  }

  async findOne(userId: string, id: string): Promise<GoalWithChildren> {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
      include: { children: { orderBy: { createdAt: 'asc' } } },
    });
    if (!goal) throw new NotFoundException('Meta não encontrada');

    const stats = await this.taskStatsByGoal([goal.id, ...goal.children.map((c) => c.id)]);
    return {
      ...this.toDto(goal, stats),
      children: goal.children.map((child) => this.toDto(child, stats)),
    };
  }

  async create(userId: string, input: CreateGoalInput): Promise<GoalDto> {
    const goal = await this.prisma.goal.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        horizon: input.horizon,
        status: input.status,
        progress: input.progress,
        targetDate: input.targetDate ? this.toDate(input.targetDate) : undefined,
        parentId: input.parentId,
      },
    });
    return this.toDto(goal, new Map());
  }

  async update(userId: string, id: string, input: UpdateGoalInput): Promise<GoalDto> {
    const existing = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Meta não encontrada');
    if (input.parentId === id) {
      throw new BadRequestException('Uma meta não pode ser sua própria sub-meta');
    }

    const data: Prisma.GoalUpdateInput = {
      title: input.title,
      description: input.description,
      horizon: input.horizon,
      status: input.status,
      progress: input.progress,
    };
    if (input.targetDate !== undefined) {
      data.targetDate = input.targetDate ? this.toDate(input.targetDate) : null;
    }
    if (input.parentId !== undefined) {
      data.parent = input.parentId ? { connect: { id: input.parentId } } : { disconnect: true };
    }

    const goal = await this.prisma.goal.update({ where: { id }, data });
    const stats = await this.taskStatsByGoal([goal.id]);
    return this.toDto(goal, stats);
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.prisma.goal.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Meta não encontrada');
    // Sub-metas e tarefas vinculadas têm onDelete: SetNull (viram órfãs, não somem).
    await this.prisma.goal.delete({ where: { id } });
  }
}
