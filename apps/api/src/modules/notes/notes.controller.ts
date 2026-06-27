import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createNoteSchema,
  listNotesQuery,
  updateNoteSchema,
  type CreateNoteInput,
  type ListNotesQuery,
  type UpdateNoteInput,
} from '@daily-hub/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { NotesService } from './notes.service';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  list(@Query(new ZodValidationPipe(listNotesQuery)) query: ListNotesQuery) {
    return this.notes.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notes.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createNoteSchema)) input: CreateNoteInput) {
    return this.notes.create(input);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateNoteSchema)) input: UpdateNoteInput,
  ) {
    return this.notes.update(id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.notes.remove(id);
  }
}
