import { Injectable } from '@nestjs/common';
import type { EntityPreview, EntityRef, EntityType } from '@daily-hub/shared';
import { PrismaService } from '../../prisma/prisma.service';
import {
  contactPreview,
  eventPreview,
  goalPreview,
  notePreview,
  refKey,
  taskPreview,
} from './previews';

/**
 * Resolve referências polimórficas `{type, id}` em previews exibíveis,
 * sempre no escopo do usuário. É a espinha dorsal da camada de integração:
 * busca, tags e links convertem refs em itens por aqui.
 */
@Injectable()
export class EntityResolverService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(userId: string, refs: EntityRef[]): Promise<Map<string, EntityPreview>> {
    const idsByType = new Map<EntityType, string[]>();
    for (const ref of refs) {
      const bucket = idsByType.get(ref.type);
      if (bucket) bucket.push(ref.id);
      else idsByType.set(ref.type, [ref.id]);
    }

    const result = new Map<string, EntityPreview>();
    const add = (preview: EntityPreview) => result.set(refKey(preview.type, preview.id), preview);

    await Promise.all(
      [...idsByType.entries()].map(async ([type, ids]) => {
        switch (type) {
          case 'TASK': {
            const rows = await this.prisma.task.findMany({
              where: { userId, id: { in: ids } },
              select: { id: true, title: true, date: true },
            });
            rows.forEach((row) => add(taskPreview(row)));
            break;
          }
          case 'GOAL': {
            const rows = await this.prisma.goal.findMany({
              where: { userId, id: { in: ids } },
              select: { id: true, title: true, progress: true },
            });
            rows.forEach((row) => add(goalPreview(row)));
            break;
          }
          case 'NOTE': {
            const rows = await this.prisma.note.findMany({
              where: { userId, id: { in: ids } },
              select: { id: true, title: true, date: true },
            });
            rows.forEach((row) => add(notePreview(row)));
            break;
          }
          case 'EVENT': {
            const rows = await this.prisma.event.findMany({
              where: { userId, id: { in: ids } },
              select: { id: true, title: true, startsAt: true },
            });
            rows.forEach((row) => add(eventPreview(row)));
            break;
          }
          case 'CONTACT': {
            const rows = await this.prisma.contact.findMany({
              where: { userId, id: { in: ids } },
              select: { id: true, name: true, company: true, email: true },
            });
            rows.forEach((row) => add(contactPreview(row)));
            break;
          }
        }
      }),
    );

    return result;
  }

  /** Verifica se uma entidade existe e pertence ao usuário. */
  async exists(userId: string, ref: EntityRef): Promise<boolean> {
    const resolved = await this.resolve(userId, [ref]);
    return resolved.has(refKey(ref.type, ref.id));
  }
}
