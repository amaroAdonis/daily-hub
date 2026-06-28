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
import { CurrentUser } from '../../common/current-user.decorator';
import { GoalsService } from './goals.service';

@ApiTags('goals')
@Controller('goals')
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(listGoalsQuery)) query: ListGoalsQuery,
  ) {
    return this.goals.list(userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.goals.findOne(userId, id);
  }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createGoalSchema)) input: CreateGoalInput,
  ) {
    return this.goals.create(userId, input);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateGoalSchema)) input: UpdateGoalInput,
  ) {
    return this.goals.update(userId, id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.goals.remove(userId, id);
  }
}
