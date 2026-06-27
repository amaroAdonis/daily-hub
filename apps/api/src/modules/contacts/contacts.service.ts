import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  ContactDto,
  CreateContactInput,
  ListContactsQuery,
  UpdateContactInput,
} from '@daily-hub/shared';
import type { Contact, Prisma } from '@daily-hub/db';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContactsService {
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

  private toDto(contact: Contact): ContactDto {
    return {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      notes: contact.notes,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    };
  }

  /** Contatos do usuário, ordenados por nome; filtra por nome/e-mail/empresa. */
  async list(query: ListContactsQuery): Promise<ContactDto[]> {
    const userId = await this.currentUserId();
    const where: Prisma.ContactWhereInput = { userId };
    if (query.search) {
      const contains = { contains: query.search, mode: 'insensitive' as const };
      where.OR = [{ name: contains }, { email: contains }, { company: contains }];
    }

    const contacts = await this.prisma.contact.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return contacts.map((contact) => this.toDto(contact));
  }

  async findOne(id: string): Promise<ContactDto> {
    const userId = await this.currentUserId();
    const contact = await this.prisma.contact.findFirst({ where: { id, userId } });
    if (!contact) throw new NotFoundException('Contato não encontrado');
    return this.toDto(contact);
  }

  async create(input: CreateContactInput): Promise<ContactDto> {
    const userId = await this.currentUserId();
    const contact = await this.prisma.contact.create({
      data: {
        userId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        notes: input.notes,
      },
    });
    return this.toDto(contact);
  }

  async update(id: string, input: UpdateContactInput): Promise<ContactDto> {
    const userId = await this.currentUserId();
    const existing = await this.prisma.contact.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Contato não encontrado');

    const contact = await this.prisma.contact.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        notes: input.notes,
      },
    });
    return this.toDto(contact);
  }

  async remove(id: string): Promise<void> {
    const userId = await this.currentUserId();
    const existing = await this.prisma.contact.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Contato não encontrado');
    await this.prisma.contact.delete({ where: { id } });
  }
}
