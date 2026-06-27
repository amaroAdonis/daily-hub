import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import type { PrismaService } from '../../prisma/prisma.service';

function makePrisma() {
  return {
    user: { findFirstOrThrow: vi.fn().mockResolvedValue({ id: 'user-1' }) },
    contact: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

function contactRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'contact-1',
    name: 'Mentora de carreira',
    email: 'mentora@exemplo.dev',
    phone: null,
    company: null,
    notes: null,
    createdAt: new Date('2026-06-01T10:00:00.000Z'),
    updatedAt: new Date('2026-06-01T10:00:00.000Z'),
    userId: 'user-1',
    ...overrides,
  };
}

describe('ContactsService', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: ContactsService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new ContactsService(prisma as unknown as PrismaService);
  });

  it('lista contatos do usuário ordenados por nome', async () => {
    prisma.contact.findMany.mockResolvedValue([contactRow()]);

    const result = await service.list({});

    expect(prisma.contact.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { name: 'asc' },
    });
    expect(result[0]!.email).toBe('mentora@exemplo.dev');
  });

  it('busca por nome, e-mail ou empresa (case-insensitive)', async () => {
    prisma.contact.findMany.mockResolvedValue([]);

    await service.list({ search: 'mentora' });

    const where = prisma.contact.findMany.mock.calls[0]![0].where;
    expect(where.OR).toEqual([
      { name: { contains: 'mentora', mode: 'insensitive' } },
      { email: { contains: 'mentora', mode: 'insensitive' } },
      { company: { contains: 'mentora', mode: 'insensitive' } },
    ]);
  });

  it('cria um contato vinculado ao usuário atual', async () => {
    prisma.contact.create.mockResolvedValue(contactRow());

    await service.create({ name: 'Mentora de carreira', email: 'mentora@exemplo.dev' });

    expect(prisma.contact.create.mock.calls[0]![0].data).toMatchObject({
      userId: 'user-1',
      name: 'Mentora de carreira',
    });
  });

  it('lança NotFound ao atualizar contato inexistente', async () => {
    prisma.contact.findFirst.mockResolvedValue(null);

    await expect(service.update('nope', { name: 'x' })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.contact.update).not.toHaveBeenCalled();
  });

  it('remove um contato existente do usuário', async () => {
    prisma.contact.findFirst.mockResolvedValue(contactRow());
    prisma.contact.delete.mockResolvedValue(contactRow());

    await service.remove('contact-1');

    expect(prisma.contact.delete).toHaveBeenCalledWith({ where: { id: 'contact-1' } });
  });
});
