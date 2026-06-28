import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import type { PrismaService } from '../../prisma/prisma.service';

function makePrisma() {
  return {
    task: { groupBy: vi.fn(), findMany: vi.fn() },
    note: { findMany: vi.fn() },
    event: { findMany: vi.fn() },
    entityLink: { findMany: vi.fn() },
    contact: { findMany: vi.fn() },
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

    const result = await service.summary('user-1', { from: '2026-06-01', to: '2026-06-30' });

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
    await expect(
      service.summary('user-1', { from: '2026-01-01', to: '2026-12-31' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.task.groupBy).not.toHaveBeenCalled();
  });

  it('retorna vazio quando não há tarefas no intervalo', async () => {
    prisma.task.groupBy.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const result = await service.summary('user-1', { from: '2026-06-01', to: '2026-06-07' });

    expect(result).toEqual([]);
  });

  describe('dayContacts', () => {
    function mockNoActivities() {
      prisma.task.findMany.mockResolvedValue([]);
      prisma.note.findMany.mockResolvedValue([]);
      // event.findMany é chamado 2x (únicos e recorrentes).
      prisma.event.findMany.mockResolvedValue([]);
    }

    it('reúne os contatos vinculados às atividades do dia', async () => {
      prisma.task.findMany.mockResolvedValue([{ id: 'task-1' }]);
      prisma.note.findMany.mockResolvedValue([]);
      prisma.event.findMany.mockResolvedValue([]);
      prisma.entityLink.findMany.mockResolvedValue([
        { sourceType: 'CONTACT', sourceId: 'contact-1', targetType: 'TASK', targetId: 'task-1' },
      ]);
      prisma.contact.findMany.mockResolvedValue([
        { id: 'contact-1', name: 'Mentora', company: 'Acme', email: 'm@ex.dev' },
      ]);

      const result = await service.dayContacts('user-1', { date: '2026-06-28' });

      expect(result.date).toBe('2026-06-28');
      expect(result.contacts).toEqual([
        { id: 'contact-1', name: 'Mentora', company: 'Acme', email: 'm@ex.dev' },
      ]);
      expect(prisma.contact.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['contact-1'] }, userId: 'user-1' },
        orderBy: { name: 'asc' },
      });
    });

    it('deduplica o contato vinculado a mais de uma atividade do dia', async () => {
      prisma.task.findMany.mockResolvedValue([{ id: 'task-1' }]);
      prisma.note.findMany.mockResolvedValue([{ id: 'note-1' }]);
      prisma.event.findMany.mockResolvedValue([]);
      prisma.entityLink.findMany.mockResolvedValue([
        { sourceType: 'CONTACT', sourceId: 'contact-1', targetType: 'TASK', targetId: 'task-1' },
        { sourceType: 'NOTE', sourceId: 'note-1', targetType: 'CONTACT', targetId: 'contact-1' },
      ]);
      prisma.contact.findMany.mockResolvedValue([
        { id: 'contact-1', name: 'Mentora', company: null, email: null },
      ]);

      const result = await service.dayContacts('user-1', { date: '2026-06-28' });

      expect(prisma.contact.findMany.mock.calls[0]![0].where.id.in).toEqual(['contact-1']);
      expect(result.contacts).toHaveLength(1);
    });

    it('retorna vazio quando o dia não tem atividades', async () => {
      mockNoActivities();

      const result = await service.dayContacts('user-1', { date: '2026-06-28' });

      expect(result).toEqual({ date: '2026-06-28', contacts: [] });
      expect(prisma.entityLink.findMany).not.toHaveBeenCalled();
    });
  });
});
