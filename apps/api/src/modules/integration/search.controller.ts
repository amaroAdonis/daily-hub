import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { searchQuery, type SearchQuery } from '@daily-hub/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentUser } from '../../common/current-user.decorator';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  /** Busca global nas cinco entidades. */
  @Get()
  query(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(searchQuery)) { q }: SearchQuery,
  ) {
    return this.search.search(userId, q);
  }
}
