import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateLinkInput, EntityType, RelatedItem } from '@daily-hub/shared';
import { Prisma } from '@daily-hub/db';
import { PrismaService } from '../../prisma/prisma.service';
import { EntityResolverService } from './entity-resolver.service';
import { refKey } from './previews';

@Injectable()
export class LinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: EntityResolverService,
  ) {}

  /** Cria um vínculo dirigido entre dois itens e devolve o item alvo resolvido. */
  async create(userId: string, input: CreateLinkInput): Promise<RelatedItem> {
    const resolved = await this.resolver.resolve(userId, [
      { type: input.sourceType, id: input.sourceId },
      { type: input.targetType, id: input.targetId },
    ]);
    const target = resolved.get(refKey(input.targetType, input.targetId));
    if (!resolved.has(refKey(input.sourceType, input.sourceId)) || !target) {
      throw new BadRequestException('Item de origem ou destino inexistente');
    }

    try {
      const link = await this.prisma.entityLink.create({
        data: {
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          targetType: input.targetType,
          targetId: input.targetId,
          relation: input.relation,
        },
      });
      return { linkId: link.id, relation: link.relation, direction: 'outgoing', item: target };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Esses itens já estão vinculados');
      }
      throw error;
    }
  }

  async remove(userId: string, linkId: string): Promise<void> {
    const link = await this.prisma.entityLink.findUnique({ where: { id: linkId } });
    if (!link) throw new NotFoundException('Vínculo não encontrado');
    // Garante posse: a origem precisa ser uma entidade do usuário.
    const owns = await this.resolver.exists(userId, { type: link.sourceType, id: link.sourceId });
    if (!owns) throw new NotFoundException('Vínculo não encontrado');
    await this.prisma.entityLink.delete({ where: { id: linkId } });
  }

  /** Itens relacionados a uma entidade (vínculos nas duas direções). */
  async related(userId: string, entityType: EntityType, entityId: string): Promise<RelatedItem[]> {
    const links = await this.prisma.entityLink.findMany({
      where: {
        OR: [
          { sourceType: entityType, sourceId: entityId },
          { targetType: entityType, targetId: entityId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const others = links.map((link) => {
      const outgoing = link.sourceType === entityType && link.sourceId === entityId;
      return {
        linkId: link.id,
        relation: link.relation,
        direction: outgoing ? ('outgoing' as const) : ('incoming' as const),
        ref: outgoing
          ? { type: link.targetType, id: link.targetId }
          : { type: link.sourceType, id: link.sourceId },
      };
    });

    const resolved = await this.resolver.resolve(
      userId,
      others.map((o) => o.ref),
    );

    return others
      .map(({ linkId, relation, direction, ref }) => {
        const item = resolved.get(refKey(ref.type, ref.id));
        return item ? { linkId, relation, direction, item } : null;
      })
      .filter((value): value is RelatedItem => value !== null);
  }
}
