import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createTaskSchema,
  listTasksQuery,
  updateTaskSchema,
  type CreateTaskInput,
  type ListTasksQuery,
  type UpdateTaskInput,
} from '@daily-hub/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(@Query(new ZodValidationPipe(listTasksQuery)) query: ListTasksQuery) {
    return this.tasks.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasks.findOne(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createTaskSchema)) input: CreateTaskInput) {
    return this.tasks.create(input);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) input: UpdateTaskInput,
  ) {
    return this.tasks.update(id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.tasks.remove(id);
  }
}
