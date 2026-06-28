# Integração — Notas Técnicas

O módulo `apps/api/src/modules/integration` reúne quatro peças: o
`EntityResolverService` (resolução de refs em previews), e três pares
controller+service para **busca**, **tags/taggings** e **links**.

## Contrato da API

Validação via `ZodValidationPipe` com schemas de
`packages/shared/src/schemas/integration.ts`. Todas as rotas operam no escopo do
usuário autenticado (`@CurrentUser('id')`).

### Busca

| Método | Rota          | Descrição                         | Body / Query           |
| ------ | ------------- | --------------------------------- | ---------------------- |
| GET    | `/api/search` | Busca textual nas cinco entidades | Query: `q` (1–100 ch.) |

Devolve `EntityPreview[]`, até 5 por tipo, case-insensitive.

### Tags

| Método | Rota                  | Descrição                              | Body / Query      |
| ------ | --------------------- | -------------------------------------- | ----------------- |
| GET    | `/api/tags`           | Lista tags (com `count` de uso)        | —                 |
| POST   | `/api/tags`           | Cria tag (`409` se nome duplicado)     | `createTagSchema` |
| DELETE | `/api/tags/:id`       | Remove tag (taggings em cascata) (204) | —                 |
| GET    | `/api/tags/:id/items` | Itens marcados com a tag (previews)    | —                 |

### Taggings

| Método | Rota                | Descrição                          | Body / Query                    |
| ------ | ------------------- | ---------------------------------- | ------------------------------- |
| GET    | `/api/tags/entity`  | Tags de uma entidade               | Query: `entityType`, `entityId` |
| POST   | `/api/tags/apply`   | Aplica tag a um item (idempotente) | `taggingInput`                  |
| POST   | `/api/tags/unapply` | Remove tag de um item              | `taggingInput`                  |

`apply`/`unapply` devolvem as tags atuais do item (`TagDto[]`).

### Links

| Método | Rota             | Descrição                                 | Body / Query                    |
| ------ | ---------------- | ----------------------------------------- | ------------------------------- |
| GET    | `/api/links`     | Itens relacionados (mão dupla)            | Query: `entityType`, `entityId` |
| POST   | `/api/links`     | Cria vínculo entre dois itens (`409` dup) | `createLinkSchema`              |
| DELETE | `/api/links/:id` | Remove vínculo pelo `linkId` (204)        | —                               |

`GET /links` devolve `RelatedItem[]` (`linkId`, `relation`, `direction`,
`item`); `POST /links` devolve o `RelatedItem` resolvido (`direction: outgoing`).

### Resolver (interno)

| Peça                    | Papel                                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| `EntityResolverService` | Traduz `EntityRef[]` → `Map<refKey, EntityPreview>`, escopo do usuário |
| `resolve()`             | Agrupa refs por tipo; uma query por tabela (sem N+1)                   |
| `exists()`              | Conveniência: a ref resolve? (usado por tags/links na validação)       |

Não é exposto por rota; busca, tags e links o injetam. Mappers em
`apps/api/src/modules/integration/previews.ts`.

## Padrão polimórfico

`Tagging` e `EntityLink` (em `packages/db/prisma/schema.prisma`) guardam o alvo
como par `(entityType, entityId)` em vez de FK — uma tabela liga **qualquer item
a qualquer item** sem explosão de tabelas de junção ([D003](../../DECISIONS.md#d003)).
O preço é não ter integridade referencial via FK no alvo: ela é validada na
camada de serviço (`resolver.exists` antes de criar; descarte de refs não
resolvidas ao listar). Ver [rules](rules.md) e [`../../data-model.md`](../../data-model.md).

## UI (web)

`apps/web/src/features/integration`:

- `api.ts` / `hooks.ts` — funções HTTP tipadas e hooks TanStack Query (`useSearch`,
  `useTags`, `useTagItems`, `useEntityTags`, `useRelatedItems` e mutations de
  tag/link). As mutations de tag fazem `setQueryData` das tags do item +
  invalidam a lista global; as de link invalidam os relacionados.
- `inspector-context.tsx` — `InspectorProvider` + `useInspector`: um **único**
  drawer (`EntityInspector`) montado no topo da árvore, aberto com um preview.
- `components/entity-inspector.tsx` — o drawer: `EntityTags` (tags do item) +
  `RelatedItems` (relacionados, com busca para vincular) + seção de Anexos.
- `components/connections-button.tsx` — `ConnectionsButton`, presente nos cards
  das cinco features; abre o Inspetor do item.
- `components/command-palette.tsx` — overlay `⌘K`/`Ctrl+K`: busca global
  navegável por teclado; Enter abre o Inspetor.
- `components/search-page.tsx` — seção **Buscar**: busca global + navegação por
  tag.
- `entity-meta.ts` — `ENTITY_LABEL` (rótulo PT-BR por tipo).

## Decisões e armadilhas

- **Polimorfismo sem FK ([D003](../../DECISIONS.md#d003)):** integridade vive no
  service. Sempre validar a existência do alvo antes de criar tagging/link e
  descartar refs não resolvidas ao listar.
- **Refs `{type, id}` como contrato único:** busca, tags e links falam a mesma
  língua via `EntityRef`/`EntityPreview`. `refKey(type, id)` (`"TYPE:id"`) é a
  chave estável que indexa o `Map` do resolver.
- **Isolamento por usuário ([D004](../../DECISIONS.md#d004)):** toda query do
  resolver filtra por `userId`; itens de outro usuário simplesmente não resolvem.
- **Idempotência:** `apply` usa `createMany` com `skipDuplicates`; reaplicar uma
  tag não duplica nem erra.
- **Autovínculo / duplicidade:** autovínculo é barrado no Zod (`createLinkSchema`)
  e a duplicidade no banco (`@@unique` → `P2002` → `409`).
