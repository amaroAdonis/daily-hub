# Integração (Links + Tags + Busca)

- Prioridade: P0
- Status: Concluída
- Última atualização: 2026-06-28

## Visão Geral

A camada que **conecta tudo**. Onde tarefas, metas, notas, compromissos e
contatos eram cinco CRUDs isolados, a Integração os interliga por três
mecanismos transversais:

- **Busca global** — pesquisa textual sobre todas as entidades de uma só vez.
- **Tags** — etiquetas reutilizáveis aplicáveis a qualquer item, agrupando itens
  de tipos diferentes sob um mesmo rótulo.
- **Links** — vínculos dirigidos entre dois itens quaisquer (ex.: uma nota
  ligada a um compromisso, uma tarefa ligada a um contato).

A peça-chave que torna isso possível com um contrato único é o
`EntityResolverService`: ele traduz uma **ref** polimórfica `{type, id}` em um
**preview** uniforme (`{type, id, title, subtitle}`), sempre no escopo do
usuário. Busca, tags e links reusam-no — é o que permite listar e relacionar
itens heterogêneos sem explosão de código.

Na web, tudo isso aflora em dois pontos de entrada: o **Inspetor** (drawer
aberto pelo botão "Conexões" em qualquer card) e a **busca** (seção Buscar +
command palette `⌘K`). É o requisito central do produto: o "Hub" do Daily Hub.

## Conceitos-Chave

- **Tag** — etiqueta reutilizável aplicável a qualquer entidade. Ver
  [Glossário](../../GLOSSARY.md#tag).
- **Tagging** — associação polimórfica `(tagId, entityType, entityId)` entre uma
  tag e uma entidade. Ver [Glossário](../../GLOSSARY.md#tagging).
- **EntityLink** — relação dirigida polimórfica
  `(sourceType, sourceId) → (targetType, targetId)` com `relation` opcional. Ver
  [Glossário](../../GLOSSARY.md#entitylink).
- **Ref (`{type, id}`)** — referência a uma entidade qualquer, resolvida em
  preview pelo `EntityResolverService`. Ver [Glossário](../../GLOSSARY.md#ref).
- **Busca global** — pesquisa transversal sobre todas as entidades. Ver
  [Glossário](../../GLOSSARY.md#busca-global).
- **Inspetor** — drawer que reúne tags e itens relacionados de qualquer
  entidade. Ver [Glossário](../../GLOSSARY.md#inspetor).

## Requisitos (REQ-*)

### Tags e taggings

- `REQ-INTEGRATION-001` Tag pertence ao usuário, tem `name` (único por usuário) e
  `color` opcional.
- `REQ-INTEGRATION-002` Listar tags do usuário com a contagem de itens marcados
  (`count`).
- `REQ-INTEGRATION-003` Criar tag; nome duplicado é rejeitado (`409`).
- `REQ-INTEGRATION-004` Excluir tag; suas taggings caem em cascata.
- `REQ-INTEGRATION-005` Aplicar uma tag a um item é **idempotente** (aplicar de
  novo não duplica).
- `REQ-INTEGRATION-006` Remover uma tag de um item; ambas as operações devolvem
  as tags atuais do item.
- `REQ-INTEGRATION-007` Listar os itens marcados com uma tag, resolvidos em
  previews.

### Links polimórficos

- `REQ-INTEGRATION-010` Vincular **dois itens quaisquer** dos cinco tipos, com
  `relation` (rótulo livre) opcional.
- `REQ-INTEGRATION-011` Um item não pode se vincular a si mesmo.
- `REQ-INTEGRATION-012` Vínculo duplicado (mesmo par/direção) é rejeitado
  (`409`).
- `REQ-INTEGRATION-013` Listar os itens relacionados a uma entidade nas **duas
  direções** (`outgoing`/`incoming`), com o `linkId` para remoção.
- `REQ-INTEGRATION-014` Remover um vínculo pelo seu `linkId`.

### Resolução de refs e previews

- `REQ-INTEGRATION-020` `EntityResolverService` traduz refs `{type, id}` em
  previews uniformes `{type, id, title, subtitle}`, consultando a tabela certa
  por tipo.
- `REQ-INTEGRATION-021` A resolução agrupa refs por tipo e consulta cada tabela
  uma única vez (sem N+1).
- `REQ-INTEGRATION-022` Refs que não resolvem (item inexistente ou de outro
  usuário) são silenciosamente descartadas das listas.

### Busca global

- `REQ-INTEGRATION-030` Buscar por texto nas cinco entidades, devolvendo previews
  uniformes (`title`/`content` de notas; `name`/`email`/`company` de contatos).
- `REQ-INTEGRATION-031` Busca é case-insensitive e limitada a até 5 resultados
  por tipo.

### Inspetor e Conexões

- `REQ-INTEGRATION-040` Botão "Conexões" disponível nos cards das cinco features,
  abrindo o Inspetor daquele item.
- `REQ-INTEGRATION-041` O Inspetor exibe, para a entidade aberta, suas tags e
  seus itens relacionados, ambos editáveis ali mesmo.

### Command palette

- `REQ-INTEGRATION-050` Command palette acionável por `⌘K`/`Ctrl+K`, com busca
  global em overlay, navegável por teclado (setas/Enter/Esc).
- `REQ-INTEGRATION-051` Selecionar um resultado abre o Inspetor daquele item.

### Isolamento

- `REQ-INTEGRATION-060` Toda operação (busca, tags, links, resolução) é restrita
  às entidades do usuário autenticado ([D004](../../DECISIONS.md#d004)).

## Critérios de Aceite (AC-*)

### AC-INTEGRATION-001 - Buscar itens de qualquer tipo (REQ-INTEGRATION-030, REQ-INTEGRATION-031)

- **Given** itens de tipos diferentes cujo texto contém "reunião"
- **When** chamo `GET /search?q=reunião`
- **Then** recebo previews uniformes das cinco entidades, até 5 por tipo, sem
  diferença de maiúsculas

### AC-INTEGRATION-002 - Aplicar tag é idempotente (REQ-INTEGRATION-005, REQ-INTEGRATION-006)

- **Given** uma tag e um item do usuário
- **When** chamo `POST /tags/apply` duas vezes para o mesmo par
- **Then** o item fica com a tag uma só vez
- **And** a resposta traz as tags atuais do item

### AC-INTEGRATION-003 - Navegar por tag (REQ-INTEGRATION-007)

- **Given** uma tag aplicada a uma tarefa, uma nota e um contato
- **When** chamo `GET /tags/:id/items`
- **Then** recebo os três itens resolvidos em previews

### AC-INTEGRATION-004 - Vincular dois itens, ver nas duas direções (REQ-INTEGRATION-010, REQ-INTEGRATION-013)

- **Given** uma nota e um compromisso do usuário
- **When** crio um link nota→compromisso e consulto `GET /links` para cada um
- **Then** o compromisso aparece como `outgoing` na nota
- **And** a nota aparece como `incoming` no compromisso

### AC-INTEGRATION-005 - Não vincular a si mesmo (REQ-INTEGRATION-011)

- **Given** um item qualquer
- **When** tento vinculá-lo a si mesmo (`source == target`)
- **Then** recebo erro de validação (Zod) e o link não é criado

### AC-INTEGRATION-006 - Refs inexistentes somem das listas (REQ-INTEGRATION-022)

- **Given** uma tagging cujo item foi excluído
- **When** o resolver tenta resolvê-la
- **Then** ela é descartada da lista de itens (não vira preview vazio)

### AC-INTEGRATION-007 - Abrir o Inspetor de um card (REQ-INTEGRATION-040, REQ-INTEGRATION-041)

- **Given** um card de tarefa na web
- **When** clico em "Conexões"
- **Then** o Inspetor abre carregando as tags e os relacionados daquela tarefa

### AC-INTEGRATION-008 - Command palette abre o Inspetor (REQ-INTEGRATION-050, REQ-INTEGRATION-051)

- **Given** o app aberto
- **When** pressiono `⌘K`, digito um termo e seleciono um resultado com Enter
- **Then** o Inspetor abre para o item escolhido

### AC-INTEGRATION-009 - Isolamento por usuário (REQ-INTEGRATION-060)

- **Given** um item de outro usuário
- **When** tento taggeá-lo, vinculá-lo ou resolvê-lo
- **Then** a operação falha (`item inexistente`) ou o item é descartado da lista

## Dependências

### Features relacionadas

A Integração é transversal: opera sobre **todas** as features de entidade.

- [Tarefas](../tasks/README.md) — tipo `TASK`.
- [Metas](../goals/README.md) — tipo `GOAL`.
- [Anotações](../notes/README.md) — tipo `NOTE`.
- [Compromissos](../events/README.md) — tipo `EVENT`.
- [Contatos](../contacts/README.md) — tipo `CONTACT`.
- [Anexos](../attachments/README.md) — reusa o `EntityResolverService` e aparece
  como uma seção do Inspetor.

### Serviços e contratos compartilhados

- `GET /api/search`, `GET/POST/DELETE /api/tags` (+ `entity`/`apply`/`unapply`/
  `:id/items`), `GET/POST/DELETE /api/links` — ver [notes](notes.md).
- Schemas Zod `packages/shared/src/schemas/integration.ts`.
- `EntityType` em `packages/shared/src/schemas/common.ts`
  (`TASK`/`GOAL`/`NOTE`/`EVENT`/`CONTACT`).

## Cobertura de Testes

- `apps/api/src/modules/integration/entity-resolver.service.spec.ts` — resolução
  polimórfica por tipo, escopo de usuário, descarte de refs não resolvidas.
- `apps/api/src/modules/integration/search.service.spec.ts` — agregação da busca
  nas cinco entidades, limite por tipo, case-insensitive.
- `apps/api/src/modules/integration/tags.service.spec.ts` — idempotência do
  `apply`, cascata no `remove`, conflito de nome, itens por tag.
- `apps/api/src/modules/integration/links.service.spec.ts` — vínculo nas duas
  direções, conflito de duplicidade, posse no `remove`.
- (Pendente) E2E (Playwright) — fase posterior.

## Rastreabilidade

- Decisões: [D003](../../DECISIONS.md#d003) (links/tags polimórficos),
  [D004](../../DECISIONS.md#d004) (auth / isolamento por usuário).
- Glossário: [Tag](../../GLOSSARY.md#tag), [Tagging](../../GLOSSARY.md#tagging),
  [EntityLink](../../GLOSSARY.md#entitylink), [Ref](../../GLOSSARY.md#ref),
  [Busca global](../../GLOSSARY.md#busca-global),
  [Inspetor](../../GLOSSARY.md#inspetor).
- Modelo de dados: [`../../data-model.md`](../../data-model.md) (camada de links).

## Não Escopo

- Edição de tag (renomear/recolorir): o schema `updateTagSchema` existe, mas não
  há endpoint `PATCH /tags/:id` exposto.
- Busca com ranking/relevância ou paginação além do limite por tipo.
- Sugestão automática de links ou tags (sem heurística/IA).

## Questões em Aberto

1. Expor edição de tag (`PATCH /tags/:id`) ou manter só criar/excluir?
2. A busca deve cobrir o conteúdo de mais campos (ex.: descrição de tarefa,
   local de evento)?
