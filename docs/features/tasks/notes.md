# Tarefas — Notas Técnicas

## Contrato da API

| Método | Rota             | Descrição                     | Body / Query                           |
| ------ | ---------------- | ----------------------------- | -------------------------------------- |
| GET    | `/api/tasks`     | Lista tarefas do usuário      | Query: `date?` (YYYY-MM-DD), `status?` |
| GET    | `/api/tasks/:id` | Detalha uma tarefa            | —                                      |
| POST   | `/api/tasks`     | Cria uma tarefa               | `createTaskSchema`                     |
| PATCH  | `/api/tasks/:id` | Atualiza (parcial) uma tarefa | `updateTaskSchema`                     |
| DELETE | `/api/tasks/:id` | Remove uma tarefa (204)       | —                                      |

Schemas Zod: `packages/shared/src/schemas/tasks.ts`. Validação via
`ZodValidationPipe`.

## Modelo

Entidade `Task` em `packages/db/prisma/schema.prisma`: `title`, `description?`,
`date` (`@db.Date`), `status`, `priority`, `order`, `completedAt?`, `goalId?`.
O modelo já existia desde a Fase 0; a Fase 1 não exigiu migração.

## UI (web)

`apps/web/src/features/tasks`:

- `api.ts` — funções HTTP tipadas sobre `lib/api`.
- `hooks.ts` — `useTasks`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`
  (TanStack Query, invalidando o cache de `tasks`).
- `components/` — `DayTasks` (lista do dia + contagem), `TaskComposer` (criação
  inline com prioridade) e `TaskItem` (concluir/reabrir, excluir).

## Decisões e armadilhas

- **Datas em UTC:** `date` trafega como `YYYY-MM-DD` e grava à meia-noite UTC;
  serializa de volta no mesmo formato.
- **`completedAt` derivado do status:** gerenciado no service, não enviado pelo
  cliente.
- **Status comum:** rótulos/cores em `lib/status.ts` ([D005](../../DECISIONS.md#d005)).
