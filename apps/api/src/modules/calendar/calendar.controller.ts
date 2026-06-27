import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { calendarRangeQuery, type CalendarRangeQuery } from '@daily-hub/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CalendarService } from './calendar.service';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  /** Agregação diária de tarefas no intervalo, para os indicadores do calendário. */
  @Get('summary')
  summary(@Query(new ZodValidationPipe(calendarRangeQuery)) range: CalendarRangeQuery) {
    return this.calendar.summary(range);
  }
}
