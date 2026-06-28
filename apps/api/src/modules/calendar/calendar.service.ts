import { BadRequestException, Injectable } from '@nestjs/common';
import type { CalendarRangeQuery, DayDetail, DayDetailQuery, DaySummary } from '@daily-hub/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { expandRecurrence } from '../events/recurrence';

/** Limite defensivo do intervalo consultável de uma só vez (~12 semanas). */
const MAX_RANGE_DAYS = 92;

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  /** Converte um dia `YYYY-MM-DD` para meia-noite UTC, como exige `@db.Date`. */
  private toDate(day: string): Date {
    return new Date(`${day}T00:00:00.000Z`);
  }

  /**
   * Agrega, por dia do intervalo, o total de tarefas e quantas estão concluídas.
   * Retorna apenas os dias com pelo menos uma tarefa.
   */
  async summary(userId: string, range: CalendarRangeQuery): Promise<DaySummary[]> {
    const spanDays =
      (this.toDate(range.to).getTime() - this.toDate(range.from).getTime()) / 86_400_000 + 1;
    if (spanDays > MAX_RANGE_DAYS) {
      throw new BadRequestException(`Intervalo muito grande (máx. ${MAX_RANGE_DAYS} dias)`);
    }

    const where = {
      userId,
      date: { gte: this.toDate(range.from), lte: this.toDate(range.to) },
    };

    // Duas agregações no banco: total por dia e concluídas por dia.
    const [totals, dones] = await Promise.all([
      this.prisma.task.groupBy({ by: ['date'], where, _count: { _all: true } }),
      this.prisma.task.groupBy({
        by: ['date'],
        where: { ...where, status: 'DONE' },
        _count: { _all: true },
      }),
    ]);

    const doneByDate = new Map(
      dones.map((row) => [row.date.toISOString().slice(0, 10), row._count._all]),
    );

    return totals
      .map((row) => {
        const date = row.date.toISOString().slice(0, 10);
        return { date, total: row._count._all, done: doneByDate.get(date) ?? 0 };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Agrega o detalhe de um dia para o dashboard. Hoje reúne os **contatos
   * vinculados** (via `EntityLink`) às atividades do dia — tarefas e notas com
   * a data, e eventos (inclusive recorrentes) com ocorrência no dia.
   */
  async dayContacts(userId: string, query: DayDetailQuery): Promise<DayDetail> {
    const { date } = query;
    const dayMidnight = this.toDate(date);
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const [tasks, notes, singleEvents, recurringEvents] = await Promise.all([
      this.prisma.task.findMany({ where: { userId, date: dayMidnight }, select: { id: true } }),
      this.prisma.note.findMany({ where: { userId, date: dayMidnight }, select: { id: true } }),
      this.prisma.event.findMany({
        where: { userId, recurrence: null, startsAt: { lte: dayEnd }, endsAt: { gte: dayStart } },
        select: { id: true },
      }),
      this.prisma.event.findMany({
        where: { userId, recurrence: { not: null }, startsAt: { lte: dayEnd } },
        select: { id: true, recurrence: true, startsAt: true },
      }),
    ]);

    const taskIds = new Set(tasks.map((t) => t.id));
    const noteIds = new Set(notes.map((n) => n.id));
    const eventIds = new Set(singleEvents.map((e) => e.id));
    for (const event of recurringEvents) {
      const occ = expandRecurrence(event.recurrence!, event.startsAt, dayStart, dayEnd);
      if (occ.length > 0) eventIds.add(event.id);
    }

    const activityIds = [...taskIds, ...noteIds, ...eventIds];
    if (activityIds.length === 0) return { date, contacts: [] };

    // Liga-se a uma atividade do usuário em um dos lados e a um CONTACT no outro.
    const links = await this.prisma.entityLink.findMany({
      where: {
        OR: [
          { sourceType: 'CONTACT', targetId: { in: activityIds } },
          { targetType: 'CONTACT', sourceId: { in: activityIds } },
        ],
      },
    });

    const touchesActivity = (type: string, id: string): boolean =>
      (type === 'TASK' && taskIds.has(id)) ||
      (type === 'NOTE' && noteIds.has(id)) ||
      (type === 'EVENT' && eventIds.has(id));

    const contactIds = new Set<string>();
    for (const link of links) {
      if (link.sourceType === 'CONTACT' && touchesActivity(link.targetType, link.targetId)) {
        contactIds.add(link.sourceId);
      } else if (link.targetType === 'CONTACT' && touchesActivity(link.sourceType, link.sourceId)) {
        contactIds.add(link.targetId);
      }
    }

    if (contactIds.size === 0) return { date, contacts: [] };

    const contacts = await this.prisma.contact.findMany({
      where: { id: { in: [...contactIds] }, userId },
      orderBy: { name: 'asc' },
    });

    return {
      date,
      contacts: contacts.map((c) => ({
        id: c.id,
        name: c.name,
        company: c.company,
        email: c.email,
      })),
    };
  }
}
