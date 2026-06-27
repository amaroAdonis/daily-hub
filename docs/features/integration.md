# Feature: Integração (Links + Tags + Busca)

- **Fase:** 7
- **Status:** concluída

## Objetivo

Conectar tudo: **busca global**, **tags** transversais e **links** entre itens
de qualquer tipo. É a camada que transforma cinco CRUDs isolados num sistema
coeso — o requisito central do produto.

## Modelo de dados

Usa as entidades polimórficas já existentes ([`schema.prisma`](../../packages/db/prisma/schema.prisma)):

- **`Tag`** + **`Tagging`** — etiqueta reutilizável aplicável a qualquer item
  via `(entityType, entityId)`.
- **`EntityLink`** — vínculo dirigido entre dois itens quaisquer
  `(sourceType, sourceId) → (targetType, targetId)` com `relation` opcional.

Sem FKs para os alvos (são polimórficas); a integridade é garantida na camada de
serviço. Ver [ADR 0003](../adr/0003-links-polimorficos.md).

### O resolvedor (peça-chave)

`EntityResolverService` traduz referências `{ type, id }` em **previews**
uniformes (`{ type, id, title, subtitle }`), sempre no escopo do usuário,
consultando a tabela certa por tipo. Busca, tags e links reusam-no — é o que
permite listar/relacionar itens heterogêneos com um contrato único.

## Contrato da API

| Método | Rota                  | Descrição                                      |
| ------ | --------------------- | ---------------------------------------------- |
| GET    | `/api/search?q=`      | Busca textual nas cinco entidades              |
| GET    | `/api/tags`           | Lista tags (com contagem de uso)               |
| POST   | `/api/tags`           | Cria tag                                       |
| DELETE | `/api/tags/:id`       | Remove tag (taggings em cascata)               |
| GET    | `/api/tags/:id/items` | Itens marcados com a tag (previews)            |
| GET    | `/api/tags/entity`    | Tags de uma entidade (`entityType`,`entityId`) |
| POST   | `/api/tags/apply`     | Aplica tag a um item (idempotente)             |
| POST   | `/api/tags/unapply`   | Remove tag de um item                          |
| GET    | `/api/links`          | Itens relacionados (`entityType`,`entityId`)   |
| POST   | `/api/links`          | Cria vínculo entre dois itens                  |
| DELETE | `/api/links/:id`      | Remove vínculo                                 |

Schemas Zod em [`packages/shared/src/schemas/integration.ts`](../../packages/shared/src/schemas/integration.ts).
A busca e os relacionados devolvem `EntityPreview`; `apply`/`unapply` devolvem as
tags atuais do item; criar link devolve o `RelatedItem` resolvido.

## UI (web)

`apps/web/src/features/integration`:

- `entity-resolver` (API) → previews; `api.ts`/`hooks.ts` cobrem busca, tags e
  links.
- `InspectorProvider` + `useInspector` — um **drawer único** (montado no topo)
  que mostra, para qualquer entidade, suas **tags** (`EntityTags`) e seus
  **itens relacionados** (`RelatedItems`, com busca para vincular).
- `ConnectionsButton` — presente nos cards das cinco features (tarefa, meta,
  nota, compromisso, contato), abrindo o Inspetor daquele item.
- `SearchPage` — seção **Buscar**: busca global + navegação por tag (clicar uma
  tag lista seus itens). Resultados abrem o Inspetor.

## Critérios de aceite

- [x] Buscar itens de qualquer tipo por texto.
- [x] Criar tags e aplicá-las/removê-las de qualquer item; navegar por tag.
- [x] Vincular dois itens quaisquer e ver o painel de relacionados (mão dupla).
- [x] Integração acessível a partir de qualquer card (Conexões) e da busca.

## Testes

- [x] Unit (Vitest): `entity-resolver`, `search`, `tags` e `links` specs cobrem
      resolução polimórfica, agregação da busca, idempotência de tags e vínculos
      nas duas direções.
- [ ] E2E (Playwright): planejado para fase posterior.
