import { Module } from '@nestjs/common';
import { EntityResolverService } from './entity-resolver.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { LinksController } from './links.controller';
import { LinksService } from './links.service';

/**
 * Camada de integração (Fase 7): busca global, tags transversais e links
 * polimórficos entre itens. Tudo apoiado no EntityResolverService, que traduz
 * referências `{type, id}` em previews exibíveis.
 */
@Module({
  controllers: [SearchController, TagsController, LinksController],
  providers: [EntityResolverService, SearchService, TagsService, LinksService],
  // Reusado pelo AttachmentsModule para validar a posse da entidade.
  exports: [EntityResolverService],
})
export class IntegrationModule {}
