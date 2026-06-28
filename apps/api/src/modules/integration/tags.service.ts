import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateTagInput, EntityPreview, TagDto, TaggingInput } from '@daily-hub/shared';
import { Prisma } from '@daily-hub/db';
import { PrismaService } from '../../prisma/prisma.service';
import { EntityResolverService } from './entity-resolver.service';
import { refKey } from './previews';

type TagWithCount = { id: string; name: string; color: string; _count: { taggings: number } };

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: EntityResolverService,
  ) {}

  private toDto(tag: TagWithCount): TagDto {
    return { id: tag.id, name: tag.name, color: tag.color, count: tag._count.taggings };
  }

  async list(userId: string): Promise<TagDto[]> {
    const tags = await this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { taggings: true } } },
    });
    return tags.map((tag) => this.toDto(tag));
  }

  async create(userId: string, input: CreateTagInput): Promise<TagDto> {
    try {
      const tag = await this.prisma.tag.create({
        data: { userId, name: input.name, color: input.color },
        include: { _count: { select: { taggings: true } } },
      });
      return this.toDto(tag);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma tag com esse nome');
      }
      throw error;
    }
  }

  async remove(userId: string, id: string): Promise<void> {
    const tag = await this.prisma.tag.findFirst({ where: { id, userId } });
    if (!tag) throw new NotFoundException('Tag não encontrada');
    // As taggings caem em cascata (onDelete: Cascade no schema).
    await this.prisma.tag.delete({ where: { id } });
  }

  /** Tags aplicadas a uma entidade. */
  async entityTags(
    userId: string,
    entityType: TaggingInput['entityType'],
    entityId: string,
  ): Promise<TagDto[]> {
    const taggings = await this.prisma.tagging.findMany({
      where: { entityType, entityId, tag: { userId } },
      include: { tag: { include: { _count: { select: { taggings: true } } } } },
      orderBy: { tag: { name: 'asc' } },
    });
    return taggings.map((tagging) => this.toDto(tagging.tag));
  }

  /** Aplica uma tag a uma entidade (idempotente) e devolve as tags do item. */
  async apply(userId: string, input: TaggingInput): Promise<TagDto[]> {
    const tag = await this.prisma.tag.findFirst({ where: { id: input.tagId, userId } });
    if (!tag) throw new NotFoundException('Tag não encontrada');

    const exists = await this.resolver.exists(userId, {
      type: input.entityType,
      id: input.entityId,
    });
    if (!exists) throw new BadRequestException('Item inexistente');

    await this.prisma.tagging.createMany({
      data: [{ tagId: input.tagId, entityType: input.entityType, entityId: input.entityId }],
      skipDuplicates: true,
    });
    return this.entityTags(userId, input.entityType, input.entityId);
  }

  /** Remove uma tag de uma entidade e devolve as tags restantes do item. */
  async unapply(userId: string, input: TaggingInput): Promise<TagDto[]> {
    const tag = await this.prisma.tag.findFirst({ where: { id: input.tagId, userId } });
    if (!tag) throw new NotFoundException('Tag não encontrada');

    await this.prisma.tagging.deleteMany({
      where: { tagId: input.tagId, entityType: input.entityType, entityId: input.entityId },
    });
    return this.entityTags(userId, input.entityType, input.entityId);
  }

  /** Itens marcados com uma tag, resolvidos em previews. */
  async items(userId: string, tagId: string): Promise<EntityPreview[]> {
    const tag = await this.prisma.tag.findFirst({ where: { id: tagId, userId } });
    if (!tag) throw new NotFoundException('Tag não encontrada');

    const taggings = await this.prisma.tagging.findMany({
      where: { tagId },
      orderBy: { createdAt: 'desc' },
    });
    const resolved = await this.resolver.resolve(
      userId,
      taggings.map((t) => ({ type: t.entityType, id: t.entityId })),
    );
    return taggings
      .map((t) => resolved.get(refKey(t.entityType, t.entityId)))
      .filter((preview): preview is EntityPreview => preview !== undefined);
  }
}
