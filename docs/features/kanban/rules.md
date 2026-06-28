# Kanban — Regras de Negócio

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#kanban)

## Mapeamento tipo → status

Cada fonte entra no quadro com seu `status` no eixo comum
([D005](../../DECISIONS.md#d005)):

| Tipo (`BoardItemType`) | Fonte de dados  | Campo de status | Observação                            |
| ---------------------- | --------------- | --------------- | ------------------------------------- |
| `TASK`                 | `useTasks`      | `task.status`   | já usava `TODO`/`DOING`/`DONE`        |
| `EVENT`                | `useEventsBase` | `event.status`  | `EventStatus` no mesmo eixo           |
| `GOAL`                 | `useGoals`      | `goal.status`   | migrado; `ARCHIVED` excluído (abaixo) |

## Mover coluna → mutation por tipo

Soltar um cartão na coluna `status` dispara o `PATCH` da entidade de origem:

| Tipo    | Hook de mutation | Chamada                        |
| ------- | ---------------- | ------------------------------ |
| `TASK`  | `useUpdateTask`  | `PATCH /tasks/:id { status }`  |
| `EVENT` | `useUpdateEvent` | `PATCH /events/:id { status }` |
| `GOAL`  | `useUpdateGoal`  | `PATCH /goals/:id { status }`  |

| Condição                      | Resultado                        |
| ----------------------------- | -------------------------------- |
| solta em coluna diferente     | move otimista + mutation + toast |
| solta na mesma coluna         | nada (sem mutation)              |
| solta fora de qualquer coluna | nada (`over` indefinido)         |

## Recorte de itens (visibilidade no quadro)

| Regra                         | Detalhe                                       |
| ----------------------------- | --------------------------------------------- |
| Meta `ARCHIVED`               | **excluída** do quadro                        |
| Item `DONE` recente           | aparece se `updatedAt` ≥ hoje − 30 dias       |
| Item `DONE` antigo (>30 dias) | **oculto** (`RECENT_DONE_DAYS` em `board.ts`) |
| Item `TODO`/`DOING`           | sempre visível                                |

## Cores por tipo

Identidade visual em `type-meta.ts` (`TYPE_META`):

| Tipo    | Rótulo      | Cor    | Ícone (`lucide-react`) |
| ------- | ----------- | ------ | ---------------------- |
| `TASK`  | Tarefa      | teal   | `CheckSquare`          |
| `EVENT` | Compromisso | índigo | `CalendarClock`        |
| `GOAL`  | Meta        | âmbar  | `Target`               |
