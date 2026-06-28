import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { PrismaService } from '../../prisma/prisma.service';

/** Monta um mock mínimo do PrismaService usado pelo TasksService. */
function makePrisma() {
  return {
    task: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

/** Fixture de uma Task como o Prisma a retornaria. */
function taskRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'task-1',
    title: 'Estudar',
    description: null,
    date: new Date('2026-06-28T00:00:00.000Z'),
    status: 'TODO',
    priority: 'MEDIUM',
    order: 0,
    goalId: null,
    completedAt: null,
    createdAt: new Date('2026-06-28T10:00:00.000Z'),
    updatedAt: new Date('2026-06-28T10:00:00.000Z'),
    userId: 'user-1',
    ...overrides,
  };
}

describe('TasksService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: TasksService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new TasksService(prisma as unknown as PrismaService);
  });

  it('lista tarefas do usuário filtrando por dia e serializa a data como YYYY-MM-DD', async () => {
    prisma.task.findMany.mockResolvedValue([taskRow()]);

    const result = await service.list('user-1', { date: '2026-06-28' });

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', date: new Date('2026-06-28T00:00:00.000Z') },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.date).toBe('2026-06-28');
    expect(result[0]!.completedAt).toBeNull();
  });

  it('cria uma tarefa convertendo o dia para meia-noite UTC', async () => {
    prisma.task.create.mockResolvedValue(taskRow());

    await service.create('user-1', { title: 'Estudar', date: '2026-06-28' });

    const args = prisma.task.create.mock.calls[0]![0];
    expect(args.data.userId).toBe('user-1');
    expect(args.data.date).toEqual(new Date('2026-06-28T00:00:00.000Z'));
    expect(args.data.completedAt).toBeNull();
  });

  it('marca completedAt ao criar já como DONE', async () => {
    prisma.task.create.mockResolvedValue(taskRow({ status: 'DONE' }));

    await service.create('user-1', { title: 'Pronto', date: '2026-06-28', status: 'DONE' });

    const args = prisma.task.create.mock.calls[0]![0];
    expect(args.data.completedAt).toBeInstanceOf(Date);
  });

  it('preenche completedAt ao concluir e limpa ao reabrir', async () => {
    prisma.task.findFirst.mockResolvedValue(taskRow({ status: 'TODO' }));
    prisma.task.update.mockResolvedValue(taskRow({ status: 'DONE' }));

    await service.update('user-1', 'task-1', { status: 'DONE' });
    expect(prisma.task.update.mock.calls[0]![0].data.completedAt).toBeInstanceOf(Date);

    prisma.task.findFirst.mockResolvedValue(taskRow({ status: 'DONE' }));
    prisma.task.update.mockResolvedValue(taskRow({ status: 'TODO' }));

    await service.update('user-1', 'task-1', { status: 'TODO' });
    expect(prisma.task.update.mock.calls[1]![0].data.completedAt).toBeNull();
  });

  it('reconcilia o vínculo com a meta via connect/disconnect', async () => {
    prisma.task.findFirst.mockResolvedValue(taskRow());
    prisma.task.update.mockResolvedValue(taskRow({ goalId: 'goal-1' }));

    await service.update('user-1', 'task-1', { goalId: 'goal-1' });
    expect(prisma.task.update.mock.calls[0]![0].data.goal).toEqual({
      connect: { id: 'goal-1' },
    });
  });

  it('lança NotFound ao atualizar tarefa inexistente', async () => {
    prisma.task.findFirst.mockResolvedValue(null);

    await expect(service.update('user-1', 'nope', { title: 'x' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it('remove uma tarefa existente do usuário', async () => {
    prisma.task.findFirst.mockResolvedValue(taskRow());
    prisma.task.delete.mockResolvedValue(taskRow());

    await service.remove('user-1', 'task-1');

    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task-1' } });
  });
});
