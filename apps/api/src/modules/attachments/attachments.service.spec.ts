import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import type { PrismaService } from '../../prisma/prisma.service';
import type { EntityResolverService } from '../integration/entity-resolver.service';
import type { StorageService } from './storage.service';

function makePrisma() {
  return {
    attachment: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  };
}

function makeResolver() {
  return { exists: vi.fn().mockResolvedValue(true) };
}

function makeStorage() {
  return {
    presignPut: vi.fn().mockResolvedValue('https://minio/put'),
    presignGet: vi.fn().mockResolvedValue('https://minio/get'),
    stat: vi.fn(),
    delete: vi.fn(),
  };
}

function attachmentRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'att-1',
    entityType: 'TASK',
    entityId: 'task-1',
    key: 'user-1/uuid-foto.png',
    filename: 'foto.png',
    contentType: 'image/png',
    size: 1024,
    createdAt: new Date('2026-06-28T10:00:00.000Z'),
    userId: 'user-1',
    ...overrides,
  };
}

describe('AttachmentsService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let resolver: ReturnType<typeof makeResolver>;
  let storage: ReturnType<typeof makeStorage>;
  let service: AttachmentsService;

  beforeEach(() => {
    prisma = makePrisma();
    resolver = makeResolver();
    storage = makeStorage();
    service = new AttachmentsService(
      prisma as unknown as PrismaService,
      resolver as unknown as EntityResolverService,
      storage as unknown as StorageService,
    );
  });

  it('gera URL e chave prefixada pelo usuário no presign', async () => {
    const result = await service.presignUpload('user-1', {
      entityType: 'TASK',
      entityId: 'task-1',
      filename: 'foto.png',
      contentType: 'image/png',
      size: 1024,
    });

    expect(result.uploadUrl).toBe('https://minio/put');
    expect(result.key.startsWith('user-1/')).toBe(true);
    expect(storage.presignPut).toHaveBeenCalledWith(result.key, 'image/png');
  });

  it('rejeita presign em entidade que não é do usuário', async () => {
    resolver.exists.mockResolvedValue(false);

    await expect(
      service.presignUpload('user-1', {
        entityType: 'TASK',
        entityId: 'alheia',
        filename: 'x.png',
        contentType: 'image/png',
        size: 10,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(storage.presignPut).not.toHaveBeenCalled();
  });

  it('recusa registrar chave fora do prefixo do usuário', async () => {
    await expect(
      service.create('user-1', {
        entityType: 'TASK',
        entityId: 'task-1',
        key: 'outro/uuid-foto.png',
        filename: 'foto.png',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(storage.stat).not.toHaveBeenCalled();
  });

  it('recusa registrar quando o upload não está no storage', async () => {
    storage.stat.mockResolvedValue(null);

    await expect(
      service.create('user-1', {
        entityType: 'TASK',
        entityId: 'task-1',
        key: 'user-1/uuid-foto.png',
        filename: 'foto.png',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.attachment.create).not.toHaveBeenCalled();
  });

  it('registra o anexo com tamanho e tipo reais do storage', async () => {
    storage.stat.mockResolvedValue({ size: 2048, contentType: 'image/png' });
    prisma.attachment.create.mockResolvedValue(attachmentRow({ size: 2048 }));

    const result = await service.create('user-1', {
      entityType: 'TASK',
      entityId: 'task-1',
      key: 'user-1/uuid-foto.png',
      filename: 'foto.png',
    });

    expect(prisma.attachment.create.mock.calls[0]![0].data).toMatchObject({
      userId: 'user-1',
      size: 2048,
      contentType: 'image/png',
    });
    expect(result.url).toBe('https://minio/get');
  });

  it('remove o anexo do storage e do banco', async () => {
    prisma.attachment.findFirst.mockResolvedValue(attachmentRow());
    prisma.attachment.delete.mockResolvedValue(attachmentRow());

    await service.remove('user-1', 'att-1');

    expect(storage.delete).toHaveBeenCalledWith('user-1/uuid-foto.png');
    expect(prisma.attachment.delete).toHaveBeenCalledWith({ where: { id: 'att-1' } });
  });
});
