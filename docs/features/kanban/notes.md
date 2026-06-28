# Kanban — Notas Técnicas

## Fontes de dados

O quadro não tem modelo nem módulo próprio: agrega três fontes existentes na
web, via hooks de TanStack Query.

| Fonte             | Hook            | Rota                   | Observação                         |
| ----------------- | --------------- | ---------------------- | ---------------------------------- |
| Tarefas           | `useTasks({})`  | `GET /api/tasks`       | todas as tarefas do usuário        |
| Compromissos base | `useEventsBase` | `GET /api/events/base` | **base**, sem expandir recorrência |
| Metas             | `useGoals({})`  | `GET /api/goals`       | não arquivadas entram no quadro    |

`GET /events/base` foi criado para o quadro: a listagem por intervalo
(`GET /events?from&to`) devolve **ocorrências** expandidas (RRULE), que não
servem a um quadro de status. A base devolve um cartão por compromisso.

Mover um cartão dispara o `PATCH` da entidade (`/tasks/:id`, `/events/:id`,
`/goals/:id`) com o novo `status`. Não há endpoint de quadro.

## Normalização — `BoardItem`

`board.ts` exporta `buildBoard(tasks, events, goals): BoardItem[]`, que une os
três tipos sob a forma comum:

```ts
interface BoardItem {
  key: string; // "TIPO:id" (ex.: "TASK:abc") — id do drag-and-drop
  type: 'TASK' | 'EVENT' | 'GOAL';
  id: string;
  title: string;
  status: ProgressStatus; // TODO | DOING | DONE
  task?: TaskDto;
  event?: EventDto;
  goal?: GoalDto; // a entidade original
}
```

Recortes aplicados em `buildBoard`:

- metas com `status === 'ARCHIVED'` são puladas;
- itens `DONE` só entram se `updatedAt` for dos últimos `RECENT_DONE_DAYS`
  (= 30) dias (`isVisible`).

## UI (web)

`apps/web/src/features/kanban`:

- `board.ts` — `buildBoard` + tipo `BoardItem` (normalização e recortes).
- `type-meta.ts` — `TYPE_META`: cor/ícone/rótulo por tipo (teal/índigo/âmbar).
- `components/kanban-page.tsx` — três colunas (`useDroppable`), filtro por tipo,
  `DndContext` (`@dnd-kit/core`, `PointerSensor` com `distance: 8`), **override
  otimista** por `key` (limpo em `onSettled`) e toast por status.
- `components/kanban-card.tsx` — cartão arrastável (`useDraggable`), badge do
  tipo + metadado por tipo (prioridade / data-hora / progresso) e botão
  "Conexões" (Inspetor da integração).

Estado provisório: `overrides: Record<key, ProgressStatus>` move o cartão na
hora; a mutation roda em paralelo e o override é removido no `onSettled`,
deixando o cache da query como fonte da verdade.

## Decisões e armadilhas

- **Status comum ([D005](../../DECISIONS.md#d005)):** o quadro depende do eixo
  único `TODO`/`DOING`/`DONE`. Metas foram migradas de `ACTIVE/ACHIEVED` para
  esse eixo (`ARCHIVED` continua à parte, fora do quadro).
- **Helper `lib/status.ts`:** `ProgressStatus`, `PROGRESS_STATUS` (rótulos/cores)
  e `STATUS_TOAST` (cores do toast) ficam centralizados; o quadro reusa tudo.
- **Cores por tipo em `type-meta.ts`:** mantêm a identidade visual consistente
  com o resto do app (não duplicar cores soltas nos componentes).
- **`@dnd-kit`:** `activationConstraint: { distance: 8 }` evita disparar drag em
  cliques; `touch-none` no cartão libera o gesto em telas de toque.
