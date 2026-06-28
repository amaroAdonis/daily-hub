# Feature: Metas

- **Fase:** 4
- **Status:** concluída

## Objetivo

Definir **metas** com progresso, horizonte e prazo, organizá-las em **sub-metas**
e **vincular tarefas** a elas — dando direção de médio/longo prazo ao dia a dia.

## Modelo de dados

Entidade `Goal` em [`schema.prisma`](../../packages/db/prisma/schema.prisma):

- `title`, `description?`
- `horizon` (`SHORT | MEDIUM | LONG`), `status` (`TODO | DOING | DONE | ARCHIVED`
  — eixo unificado com tarefas/compromissos para o Kanban; `ARCHIVED` é à parte)
- `progress` (0–100, manual), `targetDate?` (`@db.Date`)
- `parentId?` — auto-relação para sub-metas (`onDelete: SetNull`)
- `tasks` — `Task.goalId` vincula tarefas (`onDelete: SetNull`)

Modelo já existente desde a Fase 0; a Fase 4 não exigiu migração.

## Contrato da API

| Método | Rota             | Descrição                                      | Body / Query       |
| ------ | ---------------- | ---------------------------------------------- | ------------------ |
| GET    | `/api/goals`     | Metas de topo com sub-metas e stats de tarefas | Query: `status?`   |
| GET    | `/api/goals/:id` | Detalha uma meta (com sub-metas)               | —                  |
| POST   | `/api/goals`     | Cria uma meta                                  | `createGoalSchema` |
| PATCH  | `/api/goals/:id` | Atualiza uma meta                              | `updateGoalSchema` |
| DELETE | `/api/goals/:id` | Remove uma meta (204)                          | —                  |

`GET /goals` retorna `GoalWithChildren[]`: metas de topo (`parentId = null`) com
suas sub-metas (um nível) e `taskStats` (`{ total, done }`) agregadas por meta.
Schemas Zod em [`packages/shared/src/schemas/goals.ts`](../../packages/shared/src/schemas/goals.ts).

**Vínculo de tarefas:** o filtro `goalId` foi adicionado a `GET /tasks`, e
`updateTaskSchema` passou a aceitar `goalId: null` para **desvincular**. Assim a
feature reaproveita o módulo de Tarefas, sem endpoint próprio.

## UI (web)

`apps/web/src/features/goals`:

- `api.ts` / `hooks.ts` — `useGoals` e mutações de criar/atualizar/excluir.
- `labels.ts` — rótulos de horizonte e status.
- `components/` — `GoalsPage` (filtro por status + nova meta), `GoalForm`
  (criar/editar: horizonte, status, progresso, prazo, meta-pai), `GoalCard`
  (barra de progresso, badges, sub-metas aninhadas, ações) e `GoalTasks`
  (tarefas vinculadas: criar/concluir/desvincular).

**Navegação:** o `AppShell` ganhou navegação real entre as seções **Hoje**,
**Agenda** e **Metas** (estado em `App`); Notas e Contatos ficam desabilitadas
até as Fases 5 e 6.

## Critérios de aceite

- [x] Criar, editar e excluir metas.
- [x] Definir progresso, horizonte, status e prazo.
- [x] Criar sub-metas (hierarquia de um nível).
- [x] Vincular/criar e desvincular tarefas de uma meta; ver `done/total`.
- [x] Navegar até a seção de Metas.

## Testes

- [x] Unit (Vitest): `goals.service.spec.ts` cobre listagem com filhos e stats,
      criação com `targetDate`, vínculo com meta-pai (connect/disconnect),
      rejeição de auto-referência e `NotFound`.
- [ ] E2E (Playwright): planejado para fase posterior.
