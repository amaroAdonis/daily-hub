# Feature: Tarefas

- **Fase:** 1
- **Status:** concluída

## Objetivo

Permitir registrar, concluir e organizar as atividades de um **dia** — a fatia
vertical que fixa o padrão (schema → Zod → módulo Nest → hooks na web → testes →
doc) replicado pelas demais features.

## Modelo de dados

Entidade `Task` em [`schema.prisma`](../../packages/db/prisma/schema.prisma):

- `title`, `description?`
- `date` (`@db.Date`) — dia ao qual a tarefa pertence
- `status` (`TODO | DOING | DONE`), `priority` (`LOW | MEDIUM | HIGH`)
- `order` — ordenação manual dentro do dia
- `completedAt?` — preenchido ao concluir, limpo ao reabrir
- `goalId?` — vínculo natural opcional com uma `Goal`

O modelo já existia desde a Fase 0; a Fase 1 não exigiu migração.

## Contrato da API

| Método | Rota             | Descrição                     | Body / Query                           |
| ------ | ---------------- | ----------------------------- | -------------------------------------- |
| GET    | `/api/tasks`     | Lista tarefas do usuário      | Query: `date?` (YYYY-MM-DD), `status?` |
| GET    | `/api/tasks/:id` | Detalha uma tarefa            | —                                      |
| POST   | `/api/tasks`     | Cria uma tarefa               | `createTaskSchema`                     |
| PATCH  | `/api/tasks/:id` | Atualiza (parcial) uma tarefa | `updateTaskSchema`                     |
| DELETE | `/api/tasks/:id` | Remove uma tarefa (204)       | —                                      |

Schemas Zod: [`packages/shared/src/schemas/tasks.ts`](../../packages/shared/src/schemas/tasks.ts).
Validação via `ZodValidationPipe`. Dias trafegam como `YYYY-MM-DD` e são
convertidos para meia-noite UTC ao gravar (`@db.Date`).

Modo single-user: o service resolve o usuário atual como o primeiro do banco
(criado pelo seed); centralizado para troca por auth real na Fase 8.

## UI (web)

`apps/web/src/features/tasks`:

- `api.ts` — funções HTTP tipadas sobre o cliente `lib/api`.
- `hooks.ts` — `useTasks`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`
  (TanStack Query, invalidando o cache de `tasks`).
- `components/` — `DayTasks` (lista do dia + contagem), `TaskComposer`
  (criação inline com prioridade) e `TaskItem` (concluir/reabrir e excluir).

A `App` renderiza `DayTasks` para o dia atual.

## Critérios de aceite

- [x] Listar tarefas de um dia.
- [x] Criar tarefa com título e prioridade.
- [x] Concluir/reabrir tarefa (status + `completedAt`).
- [x] Excluir tarefa.

## Testes

- [x] Unit (Vitest): `tasks.service.spec.ts` cobre listagem com filtro de dia,
      serialização de data, `completedAt` em transições de status, vínculo com
      meta e `NotFound`.
- [ ] E2E (Playwright): planejado para fase posterior.
