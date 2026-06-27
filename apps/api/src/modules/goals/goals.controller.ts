import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createGoalSchema,
  listGoalsQuery,
  updateGoalSchema,
  type CreateGoalInput,
  type ListGoalsQuery,
  type UpdateGoalInput,
} from '@daily-hub/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { GoalsService } from './goals.service';

@ApiTags('goals')
@Controller('goals')
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Get()
  list(@Query(new ZodValidationPipe(listGoalsQuery)) query: ListGoalsQuery) {
    return this.goals.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.goals.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createGoalSchema)) input: CreateGoalInput) {
    return this.goals.create(input);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateGoalSchema)) input: UpdateGoalInput,
  ) {
    return this.goals.update(id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.goals.remove(id);
  }
}
