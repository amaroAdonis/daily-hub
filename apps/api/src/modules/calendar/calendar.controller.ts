import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  calendarRangeQuery,
  dayDetailQuery,
  type CalendarRangeQuery,
  type DayDetailQuery,
} from '@daily-hub/shared';
import { CurrentUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CalendarService } from './calendar.service';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  /** Agregação diária de tarefas no intervalo, para os indicadores do calendário. */
  @Get('summary')
  summary(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(calendarRangeQuery)) range: CalendarRangeQuery,
  ) {
    return this.calendar.summary(userId, range);
  }

  /** Detalhe agregado de um dia (dashboard): contatos vinculados às atividades. */
  @Get('day')
  day(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(dayDetailQuery)) query: DayDetailQuery,
  ) {
    return this.calendar.dayContacts(userId, query);
  }
}
