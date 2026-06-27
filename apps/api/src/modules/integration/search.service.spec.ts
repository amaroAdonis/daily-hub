import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchService } from './search.service';
import type { PrismaService } from '../../prisma/prisma.service';

function makePrisma() {
  return {
    user: { findFirstOrThrow: vi.fn().mockResolvedValue({ id: 'user-1' }) },
    task: { findMany: vi.fn().mockResolvedValue([]) },
    goal: { findMany: vi.fn().mockResolvedValue([]) },
    note: { findMany: vi.fn().mockResolvedValue([]) },
    event: { findMany: vi.fn().mockResolvedValue([]) },
    contact: { findMany: vi.fn().mockResolvedValue([]) },
  };
}

describe('SearchService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: SearchService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new SearchService(prisma as unknown as PrismaService);
  });

  it('agrega previews das cinco entidades, na ordem por tipo', async () => {
    prisma.task.findMany.mockResolvedValue([
      { id: 't1', title: 'Portfólio', date: new Date('2026-06-28T00:00:00.000Z') },
    ]);
    prisma.contact.findMany.mockResolvedValue([
      { id: 'c1', name: 'Portfólio Co', company: null, email: 'p@x.dev' },
    ]);

    const result = await service.search('port');

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ type: 'TASK', title: 'Portfólio' });
    expect(result[1]).toMatchObject({
      type: 'CONTACT',
      title: 'Portfólio Co',
      subtitle: 'p@x.dev',
    });
    // Busca case-insensitive por título nas tarefas.
    expect(prisma.task.findMany.mock.calls[0]![0].where).toMatchObject({
      userId: 'user-1',
      title: { contains: 'port', mode: 'insensitive' },
    });
  });
});
