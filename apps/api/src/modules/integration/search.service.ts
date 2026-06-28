import { Injectable } from '@nestjs/common';
import type { EntityPreview } from '@daily-hub/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { contactPreview, eventPreview, goalPreview, notePreview, taskPreview } from './previews';

/** Máximo de resultados por tipo de entidade. */
const PER_TYPE = 5;

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /** Busca textual nas cinco entidades, devolvendo previews uniformes. */
  async search(userId: string, q: string): Promise<EntityPreview[]> {
    const contains = { contains: q, mode: 'insensitive' as const };

    const [tasks, goals, notes, events, contacts] = await Promise.all([
      this.prisma.task.findMany({
        where: { userId, title: contains },
        select: { id: true, title: true, date: true },
        take: PER_TYPE,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.goal.findMany({
        where: { userId, title: contains },
        select: { id: true, title: true, progress: true },
        take: PER_TYPE,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.note.findMany({
        where: { userId, OR: [{ title: contains }, { content: contains }] },
        select: { id: true, title: true, date: true },
        take: PER_TYPE,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.event.findMany({
        where: { userId, title: contains },
        select: { id: true, title: true, startsAt: true },
        take: PER_TYPE,
        orderBy: { startsAt: 'desc' },
      }),
      this.prisma.contact.findMany({
        where: { userId, OR: [{ name: contains }, { email: contains }, { company: contains }] },
        select: { id: true, name: true, company: true, email: true },
        take: PER_TYPE,
        orderBy: { name: 'asc' },
      }),
    ]);

    return [
      ...tasks.map(taskPreview),
      ...goals.map(goalPreview),
      ...notes.map(notePreview),
      ...events.map(eventPreview),
      ...contacts.map(contactPreview),
    ];
  }
}
