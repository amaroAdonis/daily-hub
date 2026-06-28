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
  async list(userId: string, query: ListContactsQuery): Promise<ContactDto[]> {
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

  async findOne(userId: string, id: string): Promise<ContactDto> {
    const contact = await this.prisma.contact.findFirst({ where: { id, userId } });
    if (!contact) throw new NotFoundException('Contato não encontrado');
    return this.toDto(contact);
  }

  async create(userId: string, input: CreateContactInput): Promise<ContactDto> {
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

  async update(userId: string, id: string, input: UpdateContactInput): Promise<ContactDto> {
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

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.prisma.contact.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Contato não encontrado');
    await this.prisma.contact.delete({ where: { id } });
  }
}
