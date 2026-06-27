import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateEventInput,
  EventDto,
  EventOccurrence,
  EventRangeQuery,
  UpdateEventInput,
} from '@daily-hub/shared';
import type { Event, Prisma } from '@daily-hub/db';
import { PrismaService } from '../../prisma/prisma.service';
import { expandRecurrence } from './recurrence';

/** Limite defensivo do intervalo de ocorrências consultável de uma vez. */
const MAX_RANGE_DAYS = 92;

@Injectable()
export class EventsService {
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

  /** Serializa a entidade Prisma para o DTO de resposta (datas em ISO). */
  private toDto(event: Event): EventDto {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      allDay: event.allDay,
      location: event.location,
      recurrence: event.recurrence,
      reminderMin: event.reminderMin,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  }

  private toOccurrence(event: Event, start: Date, end: Date, recurring: boolean): EventOccurrence {
    return {
      eventId: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      allDay: event.allDay,
      start: start.toISOString(),
      end: end.toISOString(),
      recurring,
    };
  }

  async findOne(id: string): Promise<EventDto> {
    const userId = await this.currentUserId();
    const event = await this.prisma.event.findFirst({ where: { id, userId } });
    if (!event) throw new NotFoundException('Compromisso não encontrado');
    return this.toDto(event);
  }

  async create(input: CreateEventInput): Promise<EventDto> {
    const userId = await this.currentUserId();
    const event = await this.prisma.event.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        allDay: input.allDay,
        location: input.location,
        recurrence: input.recurrence,
        reminderMin: input.reminderMin,
      },
    });
    return this.toDto(event);
  }

  async update(id: string, input: UpdateEventInput): Promise<EventDto> {
    const userId = await this.currentUserId();
    const existing = await this.prisma.event.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Compromisso não encontrado');

    const data: Prisma.EventUpdateInput = {
      title: input.title,
      description: input.description,
      allDay: input.allDay,
      location: input.location,
      recurrence: input.recurrence,
      reminderMin: input.reminderMin,
    };
    if (input.startsAt) data.startsAt = new Date(input.startsAt);
    if (input.endsAt) data.endsAt = new Date(input.endsAt);

    const event = await this.prisma.event.update({ where: { id }, data });
    return this.toDto(event);
  }

  async remove(id: string): Promise<void> {
    const userId = await this.currentUserId();
    const existing = await this.prisma.event.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Compromisso não encontrado');
    await this.prisma.event.delete({ where: { id } });
  }

  /**
   * Lista as ocorrências de compromissos no intervalo, expandindo eventos
   * recorrentes. A janela vai da meia-noite UTC de `from` ao fim do dia de `to`.
   */
  async occurrences(range: EventRangeQuery): Promise<EventOccurrence[]> {
    const windowStart = new Date(`${range.from}T00:00:00.000Z`);
    const windowEnd = new Date(`${range.to}T23:59:59.999Z`);
    const spanDays = (windowEnd.getTime() - windowStart.getTime()) / 86_400_000;
    if (spanDays > MAX_RANGE_DAYS) {
      throw new BadRequestException(`Intervalo muito grande (máx. ${MAX_RANGE_DAYS} dias)`);
    }

    const userId = await this.currentUserId();
    const [single, recurring] = await Promise.all([
      // Únicos que intersectam a janela.
      this.prisma.event.findMany({
        where: {
          userId,
          recurrence: null,
          startsAt: { lte: windowEnd },
          endsAt: { gte: windowStart },
        },
      }),
      // Recorrentes cuja primeira ocorrência não é posterior à janela.
      this.prisma.event.findMany({
        where: { userId, recurrence: { not: null }, startsAt: { lte: windowEnd } },
      }),
    ]);

    const occurrences: EventOccurrence[] = single.map((event) =>
      this.toOccurrence(event, event.startsAt, event.endsAt, false),
    );

    for (const event of recurring) {
      const durationMs = event.endsAt.getTime() - event.startsAt.getTime();
      const starts = expandRecurrence(event.recurrence!, event.startsAt, windowStart, windowEnd);
      for (const start of starts) {
        const end = new Date(start.getTime() + durationMs);
        occurrences.push(this.toOccurrence(event, start, end, true));
      }
    }

    return occurrences.sort((a, b) => a.start.localeCompare(b.start));
  }
}
