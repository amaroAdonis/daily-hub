import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import type { PrismaService } from '../../prisma/prisma.service';

function makePrisma() {
  return {
    event: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

function eventRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'event-1',
    title: 'Reunião',
    description: null,
    startsAt: new Date('2026-06-01T13:00:00.000Z'),
    endsAt: new Date('2026-06-01T14:00:00.000Z'),
    allDay: false,
    location: null,
    recurrence: null,
    reminderMin: null,
    createdAt: new Date('2026-05-01T10:00:00.000Z'),
    updatedAt: new Date('2026-05-01T10:00:00.000Z'),
    userId: 'user-1',
    ...overrides,
  };
}

describe('EventsService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: EventsService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new EventsService(prisma as unknown as PrismaService);
  });

  it('cria um compromisso convertendo as datas ISO em Date', async () => {
    prisma.event.create.mockResolvedValue(eventRow());

    await service.create('user-1', {
      title: 'Reunião',
      startsAt: '2026-06-01T13:00:00.000Z',
      endsAt: '2026-06-01T14:00:00.000Z',
    });

    const data = prisma.event.create.mock.calls[0]![0].data;
    expect(data.userId).toBe('user-1');
    expect(data.startsAt).toEqual(new Date('2026-06-01T13:00:00.000Z'));
  });

  it('serializa o DTO com datas em ISO', async () => {
    prisma.event.findFirst.mockResolvedValue(eventRow());

    const dto = await service.findOne('user-1', 'event-1');

    expect(dto.startsAt).toBe('2026-06-01T13:00:00.000Z');
    expect(dto.allDay).toBe(false);
  });

  it('lança NotFound ao remover compromisso inexistente', async () => {
    prisma.event.findFirst.mockResolvedValue(null);

    await expect(service.remove('user-1', 'nope')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.event.delete).not.toHaveBeenCalled();
  });

  it('retorna ocorrência única quando o evento não é recorrente', async () => {
    prisma.event.findMany
      .mockResolvedValueOnce([eventRow()]) // únicos
      .mockResolvedValueOnce([]); // recorrentes

    const result = await service.occurrences('user-1', { from: '2026-06-01', to: '2026-06-07' });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      eventId: 'event-1',
      recurring: false,
      start: '2026-06-01T13:00:00.000Z',
      end: '2026-06-01T14:00:00.000Z',
    });
  });

  it('expande um evento semanal preservando horário e duração', async () => {
    prisma.event.findMany
      .mockResolvedValueOnce([]) // únicos
      .mockResolvedValueOnce([eventRow({ recurrence: 'FREQ=WEEKLY', id: 'rec-1' })]); // recorrentes

    // Segunda 01/06 a 30/06: ocorrências semanais em 01, 08, 15, 22, 29.
    const result = await service.occurrences('user-1', { from: '2026-06-01', to: '2026-06-30' });

    expect(result).toHaveLength(5);
    expect(result.every((occ) => occ.recurring && occ.eventId === 'rec-1')).toBe(true);
    expect(result.map((occ) => occ.start)).toEqual([
      '2026-06-01T13:00:00.000Z',
      '2026-06-08T13:00:00.000Z',
      '2026-06-15T13:00:00.000Z',
      '2026-06-22T13:00:00.000Z',
      '2026-06-29T13:00:00.000Z',
    ]);
    // Duração de 1h preservada em cada ocorrência.
    expect(result[0]!.end).toBe('2026-06-01T14:00:00.000Z');
  });

  it('rejeita intervalos maiores que o limite', async () => {
    await expect(
      service.occurrences('user-1', { from: '2026-01-01', to: '2026-12-31' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.event.findMany).not.toHaveBeenCalled();
  });
});
