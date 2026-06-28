import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createLinkSchema,
  entityLinksQuery,
  type CreateLinkInput,
  type EntityLinksQuery,
} from '@daily-hub/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentUser } from '../../common/current-user.decorator';
import { LinksService } from './links.service';

@ApiTags('links')
@Controller('links')
export class LinksController {
  constructor(private readonly links: LinksService) {}

  /** Itens relacionados a uma entidade. */
  @Get()
  related(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(entityLinksQuery)) query: EntityLinksQuery,
  ) {
    return this.links.related(userId, query.entityType, query.entityId);
  }

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createLinkSchema)) input: CreateLinkInput,
  ) {
    return this.links.create(userId, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.links.remove(userId, id);
  }
}
