import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateNoteInput, ListNotesQuery, NoteDto, UpdateNoteInput } from '@daily-hub/shared';
import type { Note, Prisma } from '@daily-hub/db';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotesService {
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

  /** Converte um dia `YYYY-MM-DD` para meia-noite UTC, como exige `@db.Date`. */
  private toDate(day: string): Date {
    return new Date(`${day}T00:00:00.000Z`);
  }

  private toDto(note: Note): NoteDto {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      date: note.date ? note.date.toISOString().slice(0, 10) : null,
      pinned: note.pinned,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  /** Notas do usuário, fixadas primeiro e depois pelas mais recentes. */
  async list(query: ListNotesQuery): Promise<NoteDto[]> {
    const userId = await this.currentUserId();
    const where: Prisma.NoteWhereInput = { userId };
    if (query.date) where.date = this.toDate(query.date);
    if (query.pinned !== undefined) where.pinned = query.pinned;

    const notes = await this.prisma.note.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    });
    return notes.map((note) => this.toDto(note));
  }

  async findOne(id: string): Promise<NoteDto> {
    const userId = await this.currentUserId();
    const note = await this.prisma.note.findFirst({ where: { id, userId } });
    if (!note) throw new NotFoundException('Nota não encontrada');
    return this.toDto(note);
  }

  async create(input: CreateNoteInput): Promise<NoteDto> {
    const userId = await this.currentUserId();
    const note = await this.prisma.note.create({
      data: {
        userId,
        title: input.title,
        content: input.content,
        date: input.date ? this.toDate(input.date) : undefined,
        pinned: input.pinned,
      },
    });
    return this.toDto(note);
  }

  async update(id: string, input: UpdateNoteInput): Promise<NoteDto> {
    const userId = await this.currentUserId();
    const existing = await this.prisma.note.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Nota não encontrada');

    const data: Prisma.NoteUpdateInput = {
      title: input.title,
      content: input.content,
      pinned: input.pinned,
    };
    if (input.date !== undefined) {
      data.date = input.date ? this.toDate(input.date) : null;
    }

    const note = await this.prisma.note.update({ where: { id }, data });
    return this.toDto(note);
  }

  async remove(id: string): Promise<void> {
    const userId = await this.currentUserId();
    const existing = await this.prisma.note.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Nota não encontrada');
    await this.prisma.note.delete({ where: { id } });
  }
}
