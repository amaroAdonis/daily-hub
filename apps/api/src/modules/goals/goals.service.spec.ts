import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GoalsService } from './goals.service';
import type { PrismaService } from '../../prisma/prisma.service';

function makePrisma() {
  return {
    goal: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    task: { groupBy: vi.fn().mockResolvedValue([]) },
  };
}

function goalRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'goal-1',
    title: 'Publicar o portfólio',
    description: null,
    horizon: 'MEDIUM',
    status: 'ACTIVE',
    progress: 20,
    targetDate: null,
    parentId: null,
    createdAt: new Date('2026-05-01T10:00:00.000Z'),
    updatedAt: new Date('2026-05-01T10:00:00.000Z'),
    userId: 'user-1',
    ...overrides,
  };
}

describe('GoalsService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: GoalsService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new GoalsService(prisma as unknown as PrismaService);
  });

  it('lista metas de topo com filhos e estatísticas de tarefas', async () => {
    prisma.goal.findMany.mockResolvedValue([
      { ...goalRow(), children: [goalRow({ id: 'child-1', parentId: 'goal-1' })] },
    ]);
    prisma.task.groupBy
      .mockResolvedValueOnce([
        { goalId: 'goal-1', _count: { _all: 4 } },
        { goalId: 'child-1', _count: { _all: 2 } },
      ])
      .mockResolvedValueOnce([{ goalId: 'goal-1', _count: { _all: 1 } }]);

    const result = await service.list('user-1', {});

    expect(prisma.goal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1', parentId: null } }),
    );
    expect(result[0]!.taskStats).toEqual({ total: 4, done: 1 });
    expect(result[0]!.children[0]!.taskStats).toEqual({ total: 2, done: 0 });
  });

  it('cria uma meta convertendo a data-alvo para meia-noite UTC', async () => {
    prisma.goal.create.mockResolvedValue(goalRow());

    await service.create('user-1', { title: 'Nova meta', targetDate: '2026-12-31' });

    const data = prisma.goal.create.mock.calls[0]![0].data;
    expect(data.userId).toBe('user-1');
    expect(data.targetDate).toEqual(new Date('2026-12-31T00:00:00.000Z'));
  });

  it('reconcilia o vínculo com a meta-pai via connect/disconnect', async () => {
    prisma.goal.findFirst.mockResolvedValue(goalRow());
    prisma.goal.update.mockResolvedValue(goalRow({ parentId: 'parent-1' }));

    await service.update('user-1', 'goal-1', { parentId: 'parent-1' });
    expect(prisma.goal.update.mock.calls[0]![0].data.parent).toEqual({
      connect: { id: 'parent-1' },
    });
  });

  it('rejeita tornar a meta sua própria sub-meta', async () => {
    prisma.goal.findFirst.mockResolvedValue(goalRow());

    await expect(service.update('user-1', 'goal-1', { parentId: 'goal-1' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.goal.update).not.toHaveBeenCalled();
  });

  it('lança NotFound ao remover meta inexistente', async () => {
    prisma.goal.findFirst.mockResolvedValue(null);

    await expect(service.remove('user-1', 'nope')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.goal.delete).not.toHaveBeenCalled();
  });
});
