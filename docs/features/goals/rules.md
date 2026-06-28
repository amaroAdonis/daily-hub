# Metas — Regras de Negócio

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#meta)

## Progresso a partir das tarefas vinculadas

| Campo             | Origem   | Detalhe                                            |
| ----------------- | -------- | -------------------------------------------------- |
| `progress`        | manual   | inteiro 0–100, definido pelo usuário no formulário |
| `taskStats.total` | derivado | nº de tarefas com `goalId` da meta                 |
| `taskStats.done`  | derivado | dessas, as com `status = DONE`                     |

> `taskStats` é agregado por `task.groupBy({ by: ['goalId'] })` no service e
> apenas **exibido** (ex.: `done/total`); não altera `progress` automaticamente.

## Sub-metas (auto-relação via `parentId`)

| Regra           | Detalhe                                                             |
| --------------- | ------------------------------------------------------------------- |
| Hierarquia      | um nível: meta de topo (`parentId = null`) → sub-metas (`children`) |
| Listagem        | `GET /goals` retorna só as de topo, cada uma com seus `children`    |
| Auto-referência | `parentId == id` é rejeitado (`400`)                                |
| Exclusão        | sub-metas têm `onDelete: SetNull` — viram órfãs (topo), não somem   |

## Estados de status

| Estado     | Rótulo       | No Kanban?                                     |
| ---------- | ------------ | ---------------------------------------------- |
| `TODO`     | A fazer      | sim                                            |
| `DOING`    | Em andamento | sim                                            |
| `DONE`     | Concluído    | sim                                            |
| `ARCHIVED` | Arquivada    | **não** (fora do quadro e das "metas em foco") |

> Eixo comum com tarefas/compromissos ([D005](../../DECISIONS.md#d005)); rótulos
> em `apps/web/src/features/goals/labels.ts`.

## Vínculo de tarefas

| Ação              | Como                                          |
| ----------------- | --------------------------------------------- |
| Vincular          | tarefa criada/atualizada com `goalId` da meta |
| Listar vinculadas | `GET /tasks?goalId=<id>`                      |
| Desvincular       | `PATCH /tasks/:id` com `goalId: null`         |

## Dia e fuso

| Regra    | Detalhe                                         |
| -------- | ----------------------------------------------- |
| Trânsito | `targetDate` trafega como `YYYY-MM-DD`          |
| Gravação | convertido para meia-noite **UTC** (`@db.Date`) |
