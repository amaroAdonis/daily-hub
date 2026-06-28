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
import { CurrentUser } from '../../common/current-user.decorator';
import { TagsService } from './tags.service';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tags: TagsService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.tags.list(userId);
  }

  /** Tags aplicadas a uma entidade. */
  @Get('entity')
  entityTags(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(entityTagsQuery)) query: EntityTagsQuery,
  ) {
    return this.tags.entityTags(userId, query.entityType, query.entityId);
  }

  /** Itens marcados com a tag. */
  @Get(':id/items')
  items(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.tags.items(userId, id);
  }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createTagSchema)) input: CreateTagInput,
  ) {
    return this.tags.create(userId, input);
  }

  /** Aplica uma tag a uma entidade. */
  @Post('apply')
  apply(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(taggingInput)) input: TaggingInput,
  ) {
    return this.tags.apply(userId, input);
  }

  /** Remove uma tag de uma entidade. */
  @Post('unapply')
  unapply(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(taggingInput)) input: TaggingInput,
  ) {
    return this.tags.unapply(userId, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.tags.remove(userId, id);
  }
}
