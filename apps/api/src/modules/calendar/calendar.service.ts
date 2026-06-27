import { BadRequestException, Injectable } from '@nestjs/common';
import type { CalendarRangeQuery, DaySummary } from '@daily-hub/shared';
import { PrismaService } from '../../prisma/prisma.service';

/** Limite defensivo do intervalo consultável de uma só vez (~12 semanas). */
const MAX_RANGE_DAYS = 92;

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Modo single-user (até a Fase 8): resolve o usuário atual como o primeiro
   * do banco (criado pelo seed). Centralizado para troca por auth na Fase 8.
   */
  private async currentUserId(): Promise<string> {
    const user = await this.prisma.user.findFirstOrThrow({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    return user.id;
  }

  /** Converte um dia `YYYY-MM-DD` para meia-noite UTC, como exige `@db.Date`. */
  private toDate(day: string): Date {
    return new Date(`${day}T00:00:00.000Z`);
  }

  /**
   * Agrega, por dia do intervalo, o total de tarefas e quantas estão concluídas.
   * Retorna apenas os dias com pelo menos uma tarefa.
   */
  async summary(range: CalendarRangeQuery): Promise<DaySummary[]> {
    const spanDays =
      (this.toDate(range.to).getTime() - this.toDate(range.from).getTime()) / 86_400_000 + 1;
    if (spanDays > MAX_RANGE_DAYS) {
      throw new BadRequestException(`Intervalo muito grande (máx. ${MAX_RANGE_DAYS} dias)`);
    }

    const userId = await this.currentUserId();
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
}
