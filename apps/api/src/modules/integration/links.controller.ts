import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createLinkSchema,
  entityLinksQuery,
  type CreateLinkInput,
  type EntityLinksQuery,
} from '@daily-hub/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { LinksService } from './links.service';

@ApiTags('links')
@Controller('links')
export class LinksController {
  constructor(private readonly links: LinksService) {}

  /** Itens relacionados a uma entidade. */
  @Get()
  related(@Query(new ZodValidationPipe(entityLinksQuery)) query: EntityLinksQuery) {
    return this.links.related(query.entityType, query.entityId);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createLinkSchema)) input: CreateLinkInput) {
    return this.links.create(input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.links.remove(id);
  }
}
