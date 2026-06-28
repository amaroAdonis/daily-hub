# Tarefas

- Prioridade: P0
- Status: Concluída
- Última atualização: 2026-06-28

## Visão Geral

Permite registrar, concluir e organizar as **atividades de um dia**. É a fatia
vertical modelo do projeto: fixou o padrão (schema → Zod → módulo Nest → hooks na
web → testes → doc) que todas as demais features replicam.

A tarefa é o eixo central da agenda: pertence a uma data, tem prioridade e
status, pode ser ordenada manualmente dentro do dia e vinculada a uma meta.

## Conceitos-Chave

- **Tarefa** — atividade de um dia. Ver [Glossário](../../GLOSSARY.md#tarefa).
- **Status** — eixo A fazer/Em andamento/Concluído. Ver
  [Glossário](../../GLOSSARY.md#status).
- **Prioridade** — `LOW`/`MEDIUM`/`HIGH`. Ver
  [Glossário](../../GLOSSARY.md#prioridade).

## Requisitos (REQ-*)

### Modelo

- `REQ-TASKS-001` Toda tarefa pertence a um **dia** (`date`, `@db.Date`).
- `REQ-TASKS-002` Tarefa tem `title` obrigatório e `description` opcional.
- `REQ-TASKS-003` Tarefa tem `priority` (`LOW`/`MEDIUM`/`HIGH`).
- `REQ-TASKS-004` Tarefa tem `status` (`TODO`/`DOING`/`DONE`).
- `REQ-TASKS-005` Tarefa tem `order` para ordenação manual dentro do dia.
- `REQ-TASKS-006` Tarefa pode ter vínculo opcional a uma meta (`goalId`).

### Operações

- `REQ-TASKS-010` Listar tarefas, filtrando por `date` e/ou `status`.
- `REQ-TASKS-011` Criar tarefa com título e prioridade.
- `REQ-TASKS-012` Atualizar parcialmente uma tarefa.
- `REQ-TASKS-013` Excluir uma tarefa.
- `REQ-TASKS-014` Concluir/reabrir: ao concluir, gravar `completedAt`; ao
  reabrir, limpá-lo.

### Isolamento

- `REQ-TASKS-020` Operações restritas às tarefas do usuário autenticado
  ([D004](../../DECISIONS.md#d004)).

## Critérios de Aceite (AC-*)

### AC-TASKS-001 - Listar tarefas de um dia (REQ-TASKS-001, REQ-TASKS-010)

- **Given** tarefas em datas diferentes
- **When** chamo `GET /tasks?date=YYYY-MM-DD`
- **Then** recebo apenas as do dia informado, ordenadas por `order`

### AC-TASKS-002 - Criar tarefa (REQ-TASKS-002, REQ-TASKS-003, REQ-TASKS-011)

- **Given** um título e uma prioridade válidos
- **When** envio `POST /tasks`
- **Then** a tarefa é criada com `status = TODO` e retornada com seu `id`

### AC-TASKS-003 - Concluir e reabrir (REQ-TASKS-004, REQ-TASKS-014)

- **Given** uma tarefa em `TODO`
- **When** atualizo seu `status` para `DONE`
- **Then** `completedAt` é preenchido
- **And** ao voltar para `TODO`/`DOING`, `completedAt` é limpo

### AC-TASKS-004 - Excluir (REQ-TASKS-013)

- **Given** uma tarefa existente
- **When** envio `DELETE /tasks/:id`
- **Then** recebo `204` e a tarefa some das listagens

### AC-TASKS-005 - Isolamento por usuário (REQ-TASKS-020)

- **Given** uma tarefa de outro usuário
- **When** tento acessá-la pelo `id`
- **Then** recebo `404` (não vaza existência)

## Dependências

### Features relacionadas

- [Metas](../goals/README.md) — `goalId` vincula a tarefa a uma meta.
- [Calendário](../calendar/README.md) — agrega as tarefas do dia.
- [Kanban](../kanban/README.md) — usa o `status` comum.

### Serviços e contratos compartilhados

- `GET/POST/PATCH/DELETE /api/tasks` — ver [notes](notes.md).
- Schemas Zod `packages/shared/src/schemas/tasks.ts`.

## Cobertura de Testes

- `apps/api/src/modules/tasks/tasks.service.spec.ts` — listagem com filtro de
  dia, serialização de data, `completedAt` em transições, vínculo com meta e
  `NotFound`.
- (Pendente) E2E (Playwright) — fase posterior.

## Rastreabilidade

- Decisões: [D004](../../DECISIONS.md#d004) (auth), [D005](../../DECISIONS.md#d005) (status comum).
- Glossário: [Tarefa](../../GLOSSARY.md#tarefa), [Status](../../GLOSSARY.md#status).
- Modelo de dados: [`../../data-model.md`](../../data-model.md).

## Não Escopo

- Reordenação por drag-and-drop na UI (campo `order` existe; DnD pendente — ver
  [BACKLOG](../../BACKLOG.md)).
- Subtarefas / checklists.

## Questões em Aberto

1. Reordenação manual (DnD) na lista do dia entra em qual frente?
