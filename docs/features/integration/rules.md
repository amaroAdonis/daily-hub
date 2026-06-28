# Integração — Regras de Negócio

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#busca-global)

## Tipos de entidade suportados

`EntityType` (`packages/shared/src/schemas/common.ts`) define o universo de itens
que podem ser buscados, taggeados, vinculados e resolvidos em preview.

| Tipo      | Rótulo (UI) | Tabela    | `title` do preview | `subtitle` do preview    |
| --------- | ----------- | --------- | ------------------ | ------------------------ |
| `TASK`    | Tarefa      | `Task`    | `title`            | `date` (YYYY-MM-DD)      |
| `GOAL`    | Meta        | `Goal`    | `title`            | `progress` (`NN%`)       |
| `NOTE`    | Nota        | `Note`    | `title`            | `date` (YYYY-MM-DD ou —) |
| `EVENT`   | Compromisso | `Event`   | `title`            | `startsAt` (YYYY-MM-DD)  |
| `CONTACT` | Contato     | `Contact` | `name`             | `company` ou `email`     |

> Os mappers ficam em `apps/api/src/modules/integration/previews.ts`; a UI usa
> `ENTITY_LABEL` em `apps/web/src/features/integration/entity-meta.ts`.

## Integridade sem FK (validada no service) — [D003](../../DECISIONS.md#d003)

`Tagging` e `EntityLink` são polimórficos: `(entityType, entityId)` /
`(sourceType, sourceId)`/`(targetType, targetId)` **não têm chave estrangeira**
para o alvo. A integridade é garantida na camada de serviço.

| Operação            | Validação no service                                                  |
| ------------------- | --------------------------------------------------------------------- |
| Aplicar tag         | `resolver.exists` confirma o item antes de criar a tagging            |
| Criar link          | resolve `source` **e** `target`; erra se algum não existe             |
| Remover link        | a `source` precisa pertencer ao usuário (posse)                       |
| Listar (tags/links) | refs não resolvidas são descartadas (não viram preview vazio)         |
| Tag → taggings      | exclusão de tag cascateia as taggings (`onDelete: Cascade` no schema) |

## Relação dirigida `source → target`

`EntityLink` é **dirigido**, mas a navegação é de mão dupla.

| Regra                 | Detalhe                                                            |
| --------------------- | ------------------------------------------------------------------ |
| Direção               | gravada como `source → target`; `relation` (rótulo livre) opcional |
| Autovínculo           | proibido (`source == target`) — barrado no Zod, não chega ao banco |
| Duplicidade           | mesmo par/direção é rejeitado (`409`, `P2002`)                     |
| Consulta `related`    | busca onde a entidade é `source` **ou** `target`                   |
| `direction` devolvida | `outgoing` se a entidade é a origem; `incoming` se é o destino     |

## Dedup e preview via `EntityResolver`

| Regra                | Detalhe                                                             |
| -------------------- | ------------------------------------------------------------------- |
| Agrupamento por tipo | refs são agrupadas por `type`; cada tabela é consultada **uma vez** |
| Chave estável        | `refKey(type, id)` = `"TYPE:id"` indexa o `Map` de resultados       |
| Escopo               | toda query filtra por `userId` ([D004](../../DECISIONS.md#d004))    |
| Idempotência da tag  | `createMany` com `skipDuplicates` — reaplicar não duplica           |
