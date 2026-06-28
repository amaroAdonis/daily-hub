import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AttachmentDto,
  CreateAttachmentInput,
  ListAttachmentsQuery,
  PresignUploadDto,
  PresignUploadInput,
} from '@daily-hub/shared';
import type { Attachment } from '@daily-hub/db';
import { PrismaService } from '../../prisma/prisma.service';
import { EntityResolverService } from '../integration/entity-resolver.service';
import { StorageService } from './storage.service';

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: EntityResolverService,
    private readonly storage: StorageService,
  ) {}

  private async toDto(attachment: Attachment): Promise<AttachmentDto> {
    return {
      id: attachment.id,
      entityType: attachment.entityType,
      entityId: attachment.entityId,
      filename: attachment.filename,
      contentType: attachment.contentType,
      size: attachment.size,
      createdAt: attachment.createdAt.toISOString(),
      url: await this.storage.presignGet(attachment.key),
    };
  }

  /** Garante que a entidade alvo existe e pertence ao usuário. */
  private async assertOwnsEntity(userId: string, entityType: string, entityId: string) {
    const owns = await this.resolver.exists(userId, {
      type: entityType as never,
      id: entityId,
    });
    if (!owns) throw new NotFoundException('Item não encontrado');
  }

  /** Gera a URL assinada de upload e a chave do objeto (prefixada pelo usuário). */
  async presignUpload(userId: string, input: PresignUploadInput): Promise<PresignUploadDto> {
    await this.assertOwnsEntity(userId, input.entityType, input.entityId);

    const safeName = input.filename.replace(/[^\w.-]+/g, '_').slice(-100);
    const key = `${userId}/${randomUUID()}-${safeName}`;
    const uploadUrl = await this.storage.presignPut(key, input.contentType);
    return { uploadUrl, key };
  }

  /** Registra o anexo após o upload, confirmando-o no storage. */
  async create(userId: string, input: CreateAttachmentInput): Promise<AttachmentDto> {
    await this.assertOwnsEntity(userId, input.entityType, input.entityId);

    // A chave precisa pertencer ao prefixo do próprio usuário.
    if (!input.key.startsWith(`${userId}/`)) {
      throw new ForbiddenException('Chave de anexo inválida');
    }

    // Confirma que o upload de fato ocorreu e usa os metadados reais do storage.
    const stat = await this.storage.stat(input.key);
    if (!stat) throw new BadRequestException('Upload não encontrado no storage');

    const attachment = await this.prisma.attachment.create({
      data: {
        userId,
        entityType: input.entityType,
        entityId: input.entityId,
        key: input.key,
        filename: input.filename,
        contentType: stat.contentType,
        size: stat.size,
      },
    });
    return this.toDto(attachment);
  }

  /** Anexos de uma entidade do usuário, mais recentes primeiro. */
  async list(userId: string, query: ListAttachmentsQuery): Promise<AttachmentDto[]> {
    const attachments = await this.prisma.attachment.findMany({
      where: { userId, entityType: query.entityType, entityId: query.entityId },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(attachments.map((attachment) => this.toDto(attachment)));
  }

  async remove(userId: string, id: string): Promise<void> {
    const attachment = await this.prisma.attachment.findFirst({ where: { id, userId } });
    if (!attachment) throw new NotFoundException('Anexo não encontrado');

    await this.storage.delete(attachment.key);
    await this.prisma.attachment.delete({ where: { id } });
  }
}
