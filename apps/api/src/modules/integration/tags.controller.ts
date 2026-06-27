import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createTagSchema,
  entityTagsQuery,
  taggingInput,
  type CreateTagInput,
  type EntityTagsQuery,
  type TaggingInput,
} from '@daily-hub/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { TagsService } from './tags.service';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tags: TagsService) {}

  @Get()
  list() {
    return this.tags.list();
  }

  /** Tags aplicadas a uma entidade. */
  @Get('entity')
  entityTags(@Query(new ZodValidationPipe(entityTagsQuery)) query: EntityTagsQuery) {
    return this.tags.entityTags(query.entityType, query.entityId);
  }

  /** Itens marcados com a tag. */
  @Get(':id/items')
  items(@Param('id') id: string) {
    return this.tags.items(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createTagSchema)) input: CreateTagInput) {
    return this.tags.create(input);
  }

  /** Aplica uma tag a uma entidade. */
  @Post('apply')
  apply(@Body(new ZodValidationPipe(taggingInput)) input: TaggingInput) {
    return this.tags.apply(input);
  }

  /** Remove uma tag de uma entidade. */
  @Post('unapply')
  unapply(@Body(new ZodValidationPipe(taggingInput)) input: TaggingInput) {
    return this.tags.unapply(input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.tags.remove(id);
  }
}
