import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';
import type { PrismaService } from '../../prisma/prisma.service';

function makePrisma() {
  return {
    user: { findFirstOrThrow: vi.fn().mockResolvedValue({ id: 'user-1' }) },
    note: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

function noteRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'note-1',
    title: 'Ideias',
    content: '- Uma\n- Duas',
    date: null,
    pinned: false,
    createdAt: new Date('2026-06-01T10:00:00.000Z'),
    updatedAt: new Date('2026-06-01T10:00:00.000Z'),
    userId: 'user-1',
    ...overrides,
  };
}

describe('NotesService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: NotesService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new NotesService(prisma as unknown as PrismaService);
  });

  it('lista notas fixadas primeiro e depois pelas mais recentes', async () => {
    prisma.note.findMany.mockResolvedValue([noteRow({ pinned: true })]);

    const result = await service.list({});

    expect(prisma.note.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    });
    expect(result[0]!.pinned).toBe(true);
  });

  it('filtra por dia convertendo para meia-noite UTC', async () => {
    prisma.note.findMany.mockResolvedValue([]);

    await service.list({ date: '2026-06-28' });

    expect(prisma.note.findMany.mock.calls[0]![0].where.date).toEqual(
      new Date('2026-06-28T00:00:00.000Z'),
    );
  });

  it('cria nota anexada a um dia', async () => {
    prisma.note.create.mockResolvedValue(noteRow({ date: new Date('2026-06-28T00:00:00.000Z') }));

    const dto = await service.create({ title: 'Nota', date: '2026-06-28' });

    expect(prisma.note.create.mock.calls[0]![0].data.date).toEqual(
      new Date('2026-06-28T00:00:00.000Z'),
    );
    expect(dto.date).toBe('2026-06-28');
  });

  it('desanexa a nota de um dia ao receber date nulo', async () => {
    prisma.note.findFirst.mockResolvedValue(
      noteRow({ date: new Date('2026-06-28T00:00:00.000Z') }),
    );
    prisma.note.update.mockResolvedValue(noteRow());

    await service.update('note-1', { date: null });

    expect(prisma.note.update.mock.calls[0]![0].data.date).toBeNull();
  });

  it('lança NotFound ao remover nota inexistente', async () => {
    prisma.note.findFirst.mockResolvedValue(null);

    await expect(service.remove('nope')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.note.delete).not.toHaveBeenCalled();
  });
});
