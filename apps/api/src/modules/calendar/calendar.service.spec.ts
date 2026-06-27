import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import type { PrismaService } from '../../prisma/prisma.service';

function makePrisma() {
  return {
    user: { findFirstOrThrow: vi.fn().mockResolvedValue({ id: 'user-1' }) },
    task: { groupBy: vi.fn() },
  };
}

describe('CalendarService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: CalendarService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new CalendarService(prisma as unknown as PrismaService);
  });

  it('agrega total e concluídas por dia, ordenando por data', async () => {
    // 1ª chamada: totais; 2ª chamada: concluídas.
    prisma.task.groupBy
      .mockResolvedValueOnce([
        { date: new Date('2026-06-10T00:00:00.000Z'), _count: { _all: 3 } },
        { date: new Date('2026-06-02T00:00:00.000Z'), _count: { _all: 1 } },
      ])
      .mockResolvedValueOnce([{ date: new Date('2026-06-10T00:00:00.000Z'), _count: { _all: 2 } }]);

    const result = await service.summary({ from: '2026-06-01', to: '2026-06-30' });

    expect(result).toEqual([
      { date: '2026-06-02', total: 1, done: 0 },
      { date: '2026-06-10', total: 3, done: 2 },
    ]);
    // O filtro de intervalo é convertido para meia-noite UTC.
    const where = prisma.task.groupBy.mock.calls[0]![0].where;
    expect(where.date.gte).toEqual(new Date('2026-06-01T00:00:00.000Z'));
    expect(where.date.lte).toEqual(new Date('2026-06-30T00:00:00.000Z'));
  });

  it('rejeita intervalos maiores que o limite', async () => {
    await expect(service.summary({ from: '2026-01-01', to: '2026-12-31' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.task.groupBy).not.toHaveBeenCalled();
  });

  it('retorna vazio quando não há tarefas no intervalo', async () => {
    prisma.task.groupBy.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const result = await service.summary({ from: '2026-06-01', to: '2026-06-07' });

    expect(result).toEqual([]);
  });
});
