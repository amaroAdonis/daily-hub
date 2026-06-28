# Metas

- Prioridade: P0
- Status: Concluída
- Última atualização: 2026-06-28

## Visão Geral

Permite definir **metas** com progresso, horizonte e prazo, organizá-las em
**sub-metas** e **vincular tarefas** a elas — dando direção de médio/longo prazo
ao dia a dia. As metas são o eixo de propósito da agenda: cada tarefa pode
apontar para uma meta, e o quanto a meta avança é lido a partir dessas tarefas.

O `status` da meta integra o **eixo comum** A fazer/Em andamento/Concluído
compartilhado com tarefas e compromissos (mais um estado `ARCHIVED` próprio das
metas), o que permite que ela apareça no Kanban unificado
([D005](../../DECISIONS.md#d005)).

## Conceitos-Chave

- **Meta** — objetivo com progresso, horizonte e status. Ver
  [Glossário](../../GLOSSARY.md#meta).
- **Sub-meta** — meta filha de outra meta, via `parentId`. Ver
  [Glossário](../../GLOSSARY.md#sub-meta).
- **Horizonte** — janela temporal (`SHORT`/`MEDIUM`/`LONG`). Ver
  [Glossário](../../GLOSSARY.md#horizonte).
- **Status** — eixo comum A fazer/Em andamento/Concluído (+ `ARCHIVED`). Ver
  [Glossário](../../GLOSSARY.md#status).
- **Tarefa** — atividade vinculável a uma meta via `goalId`. Ver
  [Glossário](../../GLOSSARY.md#tarefa).

## Requisitos (REQ-*)

### Modelo

- `REQ-GOALS-001` Meta tem `title` obrigatório e `description` opcional.
- `REQ-GOALS-002` Meta tem `horizon` (`SHORT`/`MEDIUM`/`LONG`).
- `REQ-GOALS-003` Meta tem `progress` inteiro de 0 a 100.
- `REQ-GOALS-004` Meta tem `targetDate` opcional (`@db.Date`, dia `YYYY-MM-DD`).

### Sub-metas

- `REQ-GOALS-010` Meta pode ter uma meta-pai (`parentId`), formando uma
  hierarquia de **um nível** (auto-relação, `onDelete: SetNull`).
- `REQ-GOALS-011` Uma meta não pode ser sua própria sub-meta (`parentId == id`
  é rejeitado).

### Progresso e estatísticas

- `REQ-GOALS-020` Cada meta expõe `taskStats` (`{ total, done }`) agregando as
  tarefas vinculadas a ela.
- `REQ-GOALS-021` O campo `progress` é manual (definido pelo usuário) e é
  distinto de `taskStats`, que é derivado das tarefas.

### Vínculo de tarefas

- `REQ-GOALS-030` Tarefas se vinculam a uma meta por `Task.goalId`, listáveis
  via `GET /tasks?goalId` (sem endpoint próprio em metas).
- `REQ-GOALS-031` Desvincular uma tarefa = enviar `goalId: null` em
  `PATCH /tasks/:id`.

### Status unificado

- `REQ-GOALS-040` `status` usa o eixo comum `TODO`/`DOING`/`DONE` mais
  `ARCHIVED` ([D005](../../DECISIONS.md#d005)).
- `REQ-GOALS-041` Metas `ARCHIVED` ficam fora do Kanban e fora das "metas em
  foco" do dashboard do dia.

### Operações

- `REQ-GOALS-050` Listar metas de topo (`parentId = null`) com sub-metas e
  `taskStats`, filtrando opcionalmente por `status`.
- `REQ-GOALS-051` Detalhar uma meta por `id` (com sub-metas).
- `REQ-GOALS-052` Criar, atualizar (parcial) e excluir metas.

### Isolamento

- `REQ-GOALS-060` Operações restritas às metas do usuário autenticado
  ([D004](../../DECISIONS.md#d004)).

## Critérios de Aceite (AC-*)

### AC-GOALS-001 - Listar metas com sub-metas e stats (REQ-GOALS-010, REQ-GOALS-020, REQ-GOALS-050)

- **Given** metas de topo, sub-metas e tarefas vinculadas
- **When** chamo `GET /goals`
- **Then** recebo apenas as metas de topo (`parentId = null`), cada uma com seus
  `children` (um nível) e `taskStats` (`{ total, done }`)

### AC-GOALS-002 - Criar meta (REQ-GOALS-001, REQ-GOALS-002, REQ-GOALS-052)

- **Given** um título válido
- **When** envio `POST /goals` com `horizon`, `progress` e `targetDate`
- **Then** a meta é criada e retornada com seu `id`

### AC-GOALS-003 - Rejeitar auto-referência (REQ-GOALS-011)

- **Given** uma meta existente
- **When** envio `PATCH /goals/:id` com `parentId` igual ao próprio `id`
- **Then** recebo `400` (uma meta não pode ser sua própria sub-meta)

### AC-GOALS-004 - Vincular e desvincular tarefas (REQ-GOALS-030, REQ-GOALS-031)

- **Given** uma tarefa e uma meta
- **When** atualizo a tarefa com `goalId` da meta e depois com `goalId: null`
- **Then** ela passa a aparecer em `GET /tasks?goalId` e depois deixa de aparecer

### AC-GOALS-005 - Status arquivado fora do Kanban (REQ-GOALS-040, REQ-GOALS-041)

- **Given** uma meta com `status = ARCHIVED`
- **When** o Kanban e as "metas em foco" do dia são montados
- **Then** a meta arquivada não aparece em nenhum deles

### AC-GOALS-006 - Isolamento por usuário (REQ-GOALS-060)

- **Given** uma meta de outro usuário
- **When** tento acessá-la pelo `id`
- **Then** recebo `404` (não vaza existência)

## Dependências

### Features relacionadas

- [Tarefas](../tasks/README.md) — `goalId` vincula a tarefa a uma meta; a feature
  reaproveita o módulo de Tarefas para o vínculo.
- [Kanban](../kanban/README.md) — agrega metas pelo `status` comum.

### Serviços e contratos compartilhados

- `GET/POST/PATCH/DELETE /api/goals` — ver [notes](notes.md).
- `GET /tasks?goalId` e `goalId: null` (desvincular) — ver
  [Tarefas](../tasks/notes.md).
- Schemas Zod `packages/shared/src/schemas/goals.ts`.

## Cobertura de Testes

- `apps/api/src/modules/goals/goals.service.spec.ts` — listagem com filhos e
  `taskStats`, criação com `targetDate`, vínculo de meta-pai
  (connect/disconnect), rejeição de auto-referência e `NotFound`.
- (Pendente) E2E (Playwright) — fase posterior.

## Rastreabilidade

- Decisões: [D004](../../DECISIONS.md#d004) (auth),
  [D005](../../DECISIONS.md#d005) (status comum).
- Glossário: [Meta](../../GLOSSARY.md#meta),
  [Sub-meta](../../GLOSSARY.md#sub-meta),
  [Horizonte](../../GLOSSARY.md#horizonte), [Status](../../GLOSSARY.md#status).
- Modelo de dados: [`../../data-model.md`](../../data-model.md).

## Não Escopo

- Cálculo automático de `progress` a partir das tarefas (hoje `progress` é
  manual e `taskStats` é apenas exibido).
- Hierarquia de mais de um nível (sub-sub-metas).
- Reordenação manual de metas.

## Questões em Aberto

1. `progress` deve passar a ser derivado de `taskStats` (automático) ou continua
   manual?
2. Metas `ARCHIVED` precisam de uma seção própria de consulta na UI?
