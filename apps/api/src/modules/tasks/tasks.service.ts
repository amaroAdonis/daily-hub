import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateTaskInput, ListTasksQuery, TaskDto, UpdateTaskInput } from '@daily-hub/shared';
import type { Prisma, Task } from '@daily-hub/db';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /** Converte um dia `YYYY-MM-DD` para meia-noite UTC, como exige `@db.Date`. */
  private toDate(day: string): Date {
    return new Date(`${day}T00:00:00.000Z`);
  }

  /** Serializa a entidade Prisma para o DTO de resposta (datas como string). */
  private toDto(task: Task): TaskDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      date: task.date.toISOString().slice(0, 10),
      status: task.status,
      priority: task.priority,
      order: task.order,
      goalId: task.goalId,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  async list(userId: string, query: ListTasksQuery): Promise<TaskDto[]> {
    const where: Prisma.TaskWhereInput = { userId };
    if (query.date) where.date = this.toDate(query.date);
    if (query.status) where.status = query.status;
    if (query.goalId) where.goalId = query.goalId;

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return tasks.map((task) => this.toDto(task));
  }

  async findOne(userId: string, id: string): Promise<TaskDto> {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return this.toDto(task);
  }

  async create(userId: string, input: CreateTaskInput): Promise<TaskDto> {
    const task = await this.prisma.task.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        date: this.toDate(input.date),
        status: input.status,
        priority: input.priority,
        order: input.order,
        goalId: input.goalId,
        completedAt: input.status === 'DONE' ? new Date() : null,
      },
    });
    return this.toDto(task);
  }

  async update(userId: string, id: string, input: UpdateTaskInput): Promise<TaskDto> {
    // Garante que a tarefa pertence ao usuário antes de atualizar.
    const existing = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Tarefa não encontrada');

    const data: Prisma.TaskUpdateInput = {
      title: input.title,
      description: input.description,
      date: input.date ? this.toDate(input.date) : undefined,
      status: input.status,
      priority: input.priority,
      order: input.order,
    };

    // Reconcilia goalId (vínculo natural opcional) quando informado.
    if (input.goalId !== undefined) {
      data.goal = input.goalId ? { connect: { id: input.goalId } } : { disconnect: true };
    }

    // Mantém `completedAt` coerente com transições de status.
    if (input.status && input.status !== existing.status) {
      data.completedAt = input.status === 'DONE' ? new Date() : null;
    }

    const task = await this.prisma.task.update({ where: { id }, data });
    return this.toDto(task);
  }

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Tarefa não encontrada');
    await this.prisma.task.delete({ where: { id } });
  }
}
