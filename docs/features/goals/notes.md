# Metas — Notas Técnicas

## Contrato da API

| Método | Rota             | Descrição                                 | Body / Query       |
| ------ | ---------------- | ----------------------------------------- | ------------------ |
| GET    | `/api/goals`     | Metas de topo com sub-metas e `taskStats` | Query: `status?`   |
| GET    | `/api/goals/:id` | Detalha uma meta (com sub-metas)          | —                  |
| POST   | `/api/goals`     | Cria uma meta                             | `createGoalSchema` |
| PATCH  | `/api/goals/:id` | Atualiza (parcial) uma meta               | `updateGoalSchema` |
| DELETE | `/api/goals/:id` | Remove uma meta (204)                     | —                  |

`GET /goals` retorna `GoalWithChildren[]`: metas de topo (`parentId = null`) com
suas sub-metas (um nível, `children`) e `taskStats` (`{ total, done }`) agregadas
por meta. Schemas Zod: `packages/shared/src/schemas/goals.ts`. Validação via
`ZodValidationPipe`.

**Vínculo de tarefas (sem endpoint próprio).** A feature reaproveita o módulo de
Tarefas:

| Ação                       | Rota                                | Observação                       |
| -------------------------- | ----------------------------------- | -------------------------------- |
| Listar tarefas de uma meta | `GET /tasks?goalId=<id>`            | filtro em `GET /tasks`           |
| Desvincular tarefa         | `PATCH /tasks/:id` (`goalId: null`) | `updateTaskSchema` aceita `null` |

## Modelo

Entidade `Goal` em `packages/db/prisma/schema.prisma`: `title`, `description?`,
`horizon` (`SHORT`/`MEDIUM`/`LONG`), `status` (`TODO`/`DOING`/`DONE`/`ARCHIVED`),
`progress` (0–100), `targetDate?` (`@db.Date`), `parentId?` (auto-relação para
sub-metas, `onDelete: SetNull`), `tasks` (`Task.goalId`, `onDelete: SetNull`).
O modelo já existia desde a Fase 0; a Fase 4 não exigiu migração de estrutura.

`taskStats` não é coluna: é derivado em runtime por
`prisma.task.groupBy({ by: ['goalId'] })` (total e `status = DONE`).

## UI (web)

`apps/web/src/features/goals`:

- `api.ts` — funções HTTP tipadas sobre `lib/api`.
- `hooks.ts` — `useGoals` e mutações de criar/atualizar/excluir (TanStack Query).
- `labels.ts` — rótulos de horizonte (`HORIZON_LABEL`) e status (`STATUS_LABEL`).
- `components/` — `GoalsPage` (filtro por status + nova meta), `GoalForm`
  (criar/editar: horizonte, status, progresso, prazo, meta-pai), `GoalCard`
  (barra de progresso, badges, sub-metas aninhadas, ações), `GoalTasks` (tarefas
  vinculadas: criar/concluir/desvincular) e `DayGoals` ("metas em foco" do
  dashboard do dia: filtra `TODO`/`DOING`, ordena por prazo, mostra `done/total`).

## Decisões e armadilhas

- **Status comum (migração de enum):** o status das metas foi unificado ao eixo
  comum. O enum antigo `ACTIVE`/`ACHIEVED`/`ARCHIVED` virou
  `TODO`/`DOING`/`DONE`/`ARCHIVED` (`ACTIVE→DOING`, `ACHIEVED→DONE`); `ARCHIVED`
  permanece, mas fica **fora** do Kanban e das "metas em foco"
  ([D005](../../DECISIONS.md#d005)). Rótulos/cores centralizados em
  `apps/web/src/lib/status.ts`.
- **`progress` manual vs. `taskStats` derivado:** `progress` (0–100) é definido
  pelo usuário; `taskStats` é calculado das tarefas vinculadas e apenas exibido.
  São independentes — concluir tarefas não move `progress` automaticamente.
- **Datas em UTC:** `targetDate` trafega como `YYYY-MM-DD` e grava à meia-noite
  UTC; serializa de volta no mesmo formato.
- **Exclusão não cascateia:** sub-metas e tarefas vinculadas têm
  `onDelete: SetNull` — viram órfãs em vez de serem apagadas.
