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
import { EventsService } from './events.service';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  /** Ocorrências (com recorrência expandida) no intervalo `from`..`to`. */
  @Get()
  occurrences(@Query(new ZodValidationPipe(eventRangeQuery)) range: EventRangeQuery) {
    return this.events.occurrences(range);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.events.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createEventSchema)) input: CreateEventInput) {
    return this.events.create(input);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEventSchema)) input: UpdateEventInput,
  ) {
    return this.events.update(id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.events.remove(id);
  }
}
