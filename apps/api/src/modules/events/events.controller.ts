import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createEventSchema,
  eventRangeQuery,
  updateEventSchema,
  type CreateEventInput,
  type EventRangeQuery,
  type UpdateEventInput,
} from '@daily-hub/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentUser } from '../../common/current-user.decorator';
import { EventsService } from './events.service';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  /** Ocorrências (com recorrência expandida) no intervalo `from`..`to`. */
  @Get()
  occurrences(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(eventRangeQuery)) range: EventRangeQuery,
  ) {
    return this.events.occurrences(userId, range);
  }

  /** Compromissos base (sem expandir recorrência), para o quadro Kanban. */
  @Get('base')
  listBase(@CurrentUser('id') userId: string) {
    return this.events.listBase(userId);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.events.findOne(userId, id);
  }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createEventSchema)) input: CreateEventInput,
  ) {
    return this.events.create(userId, input);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEventSchema)) input: UpdateEventInput,
  ) {
    return this.events.update(userId, id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.events.remove(userId, id);
  }
}
