import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EntityResolverService } from './entity-resolver.service';
import type { PrismaService } from '../../prisma/prisma.service';

function makePrisma() {
  return {
    task: { findMany: vi.fn().mockResolvedValue([]) },
    goal: { findMany: vi.fn().mockResolvedValue([]) },
    note: { findMany: vi.fn().mockResolvedValue([]) },
    event: { findMany: vi.fn().mockResolvedValue([]) },
    contact: { findMany: vi.fn().mockResolvedValue([]) },
  };
}

describe('EntityResolverService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: EntityResolverService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new EntityResolverService(prisma as unknown as PrismaService);
  });

  it('resolve referências de tipos distintos em previews', async () => {
    prisma.task.findMany.mockResolvedValue([
      { id: 't1', title: 'Estudar', date: new Date('2026-06-28T00:00:00.000Z') },
    ]);
    prisma.contact.findMany.mockResolvedValue([
      { id: 'c1', name: 'Mentora', company: 'Tech', email: null },
    ]);

    const map = await service.resolve('user-1', [
      { type: 'TASK', id: 't1' },
      { type: 'CONTACT', id: 'c1' },
    ]);

    expect(map.get('TASK:t1')).toEqual({
      type: 'TASK',
      id: 't1',
      title: 'Estudar',
      subtitle: '2026-06-28',
    });
    expect(map.get('CONTACT:c1')).toMatchObject({ title: 'Mentora', subtitle: 'Tech' });
    // Escopo do usuário aplicado na query.
    expect(prisma.task.findMany.mock.calls[0]![0].where).toEqual({
      userId: 'user-1',
      id: { in: ['t1'] },
    });
  });

  it('exists retorna false quando a entidade não pertence ao usuário', async () => {
    const ok = await service.exists('user-1', { type: 'TASK', id: 'ausente' });
    expect(ok).toBe(false);
  });
});
