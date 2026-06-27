import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '@daily-hub/db';
import { TagsService } from './tags.service';
import { EntityResolverService } from './entity-resolver.service';
import type { PrismaService } from '../../prisma/prisma.service';

function makePrisma() {
  return {
    user: { findFirstOrThrow: vi.fn().mockResolvedValue({ id: 'user-1' }) },
    tag: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), delete: vi.fn() },
    tagging: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn(), deleteMany: vi.fn() },
    task: { findMany: vi.fn().mockResolvedValue([]) },
    goal: { findMany: vi.fn().mockResolvedValue([]) },
    note: { findMany: vi.fn().mockResolvedValue([]) },
    event: { findMany: vi.fn().mockResolvedValue([]) },
    contact: { findMany: vi.fn().mockResolvedValue([]) },
  };
}

describe('TagsService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: TagsService;

  beforeEach(() => {
    prisma = makePrisma();
    const resolver = new EntityResolverService(prisma as unknown as PrismaService);
    service = new TagsService(prisma as unknown as PrismaService, resolver);
  });

  it('lista tags com a contagem de uso', async () => {
    prisma.tag.findMany.mockResolvedValue([
      { id: 'tag-1', name: 'portfolio', color: '#0ea5a4', _count: { taggings: 3 } },
    ]);

    const result = await service.list();

    expect(result[0]).toEqual({ id: 'tag-1', name: 'portfolio', color: '#0ea5a4', count: 3 });
  });

  it('rejeita tag com nome duplicado', async () => {
    prisma.tag.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: '5' }),
    );

    await expect(service.create({ name: 'portfolio' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('aplica a tag de forma idempotente e devolve as tags do item', async () => {
    prisma.tag.findFirst.mockResolvedValue({ id: 'tag-1', name: 'x', color: '#000000' });
    prisma.task.findMany.mockResolvedValue([
      { id: 't1', title: 'T', date: new Date('2026-06-28T00:00:00.000Z') },
    ]);
    prisma.tagging.findMany.mockResolvedValue([
      { tag: { id: 'tag-1', name: 'x', color: '#000000', _count: { taggings: 1 } } },
    ]);

    const result = await service.apply({ tagId: 'tag-1', entityType: 'TASK', entityId: 't1' });

    expect(prisma.tagging.createMany).toHaveBeenCalledWith({
      data: [{ tagId: 'tag-1', entityType: 'TASK', entityId: 't1' }],
      skipDuplicates: true,
    });
    expect(result).toEqual([{ id: 'tag-1', name: 'x', color: '#000000', count: 1 }]);
  });
});
