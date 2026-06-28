import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LinksService } from './links.service';
import { EntityResolverService } from './entity-resolver.service';
import type { PrismaService } from '../../prisma/prisma.service';

function makePrisma() {
  return {
    entityLink: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    task: { findMany: vi.fn().mockResolvedValue([]) },
    goal: { findMany: vi.fn().mockResolvedValue([]) },
    note: { findMany: vi.fn().mockResolvedValue([]) },
    event: { findMany: vi.fn().mockResolvedValue([]) },
    contact: { findMany: vi.fn().mockResolvedValue([]) },
  };
}

describe('LinksService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: LinksService;

  beforeEach(() => {
    prisma = makePrisma();
    const resolver = new EntityResolverService(prisma as unknown as PrismaService);
    service = new LinksService(prisma as unknown as PrismaService, resolver);
  });

  it('cria um vínculo e devolve o item alvo resolvido', async () => {
    prisma.task.findMany.mockResolvedValue([
      { id: 't1', title: 'T', date: new Date('2026-06-28T00:00:00.000Z') },
    ]);
    prisma.note.findMany.mockResolvedValue([{ id: 'n1', title: 'Nota', date: null }]);
    prisma.entityLink.create.mockResolvedValue({ id: 'link-1', relation: 'relacionado' });

    const result = await service.create('user-1', {
      sourceType: 'TASK',
      sourceId: 't1',
      targetType: 'NOTE',
      targetId: 'n1',
      relation: 'relacionado',
    });

    expect(result).toEqual({
      linkId: 'link-1',
      relation: 'relacionado',
      direction: 'outgoing',
      item: { type: 'NOTE', id: 'n1', title: 'Nota', subtitle: null },
    });
  });

  it('lista itens relacionados nas duas direções', async () => {
    prisma.entityLink.findMany.mockResolvedValue([
      {
        id: 'link-1',
        sourceType: 'TASK',
        sourceId: 't1',
        targetType: 'NOTE',
        targetId: 'n1',
        relation: null,
        createdAt: new Date(),
      },
    ]);
    prisma.note.findMany.mockResolvedValue([{ id: 'n1', title: 'Nota', date: null }]);

    const result = await service.related('user-1', 'TASK', 't1');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ linkId: 'link-1', direction: 'outgoing' });
    expect(result[0]!.item).toMatchObject({ type: 'NOTE', title: 'Nota' });
  });
});
