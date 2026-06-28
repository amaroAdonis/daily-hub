# Dashboard do dia — Notas Técnicas

## Contrato da API

| Método | Rota                    | Descrição                               | Query               |
| ------ | ----------------------- | --------------------------------------- | ------------------- |
| GET    | `/api/calendar/day`     | Detalhe do dia: contatos vinculados     | `date` (YYYY-MM-DD) |
| GET    | `/api/calendar/summary` | Agregação de tarefas no intervalo (mês) | `from`, `to`        |

Schemas Zod: `packages/shared/src/schemas/calendar.ts` (`dayDetailQuery`,
`dayDetailDto`, `calendarRangeQuery`, `daySummary`). Validação via
`ZodValidationPipe`. `userId` vem de `@CurrentUser('id')`
([D004](../../DECISIONS.md#d004)).

### `GET /calendar/day` — o que `dayContacts` faz

Em `apps/api/src/modules/calendar/calendar.service.ts`:

1. Reúne os ids das **atividades do dia**: tarefas e notas com `date` = o dia;
   eventos não-recorrentes que se sobrepõem ao dia; eventos recorrentes cuja
   `recurrence` (RRULE) expande para uma ocorrência no dia (`expandRecurrence`).
2. Busca os `EntityLink` que tocam essas atividades de um lado e um `CONTACT` do
   outro (`sourceType/targetType = CONTACT`).
3. Resolve os contatos (dedup) direto via Prisma e os retorna ordenados por
   `name`. Sem atividades ou sem vínculos → `{ date, contacts: [] }`.

> Decisão de acoplamento: a agregação fala direto com o Prisma — **não** importa
> `EventsModule`/`IntegrationModule` — mantendo o `CalendarModule` enxuto.

## Modelo

Sem modelo novo. O dashboard compõe entidades existentes (`Task`, `Note`,
`Event`, `Goal`, `Contact`) e usa os `EntityLink` (`packages/db/prisma/schema.prisma`)
para "Pessoas do dia". O `summary` agrega `Task` por dia.

## Composição na web

`apps/web/src/features/calendar` hospeda o dashboard:

- `components/day-view.tsx` (`DayView`) — orquestra o dashboard: barra de resumo
  - zonas em grid de largura cheia. As queries de resumo são **as mesmas** dos
    sub-componentes (deduplicadas pela `queryKey`), sem custo extra de rede.
- `components/day-contacts.tsx` (`DayContacts`) — "Pessoas do dia" via
  `useDayDetail`; cada item abre o Inspetor pelo `ConnectionsButton`.
- `components/day-holidays.tsx` (`DayHolidays`) — faixa de feriados BR/IE.
- `hooks.ts` — `useDayDetail` (`GET /calendar/day`) e `useCalendarSummary`.

Zonas reaproveitadas de cada feature (CRUD inline):

- `features/events/components/day-events.tsx` (`DayEvents`) — agenda por período.
- `features/tasks/components/day-tasks.tsx` (`DayTasks`).
- `features/notes/components/day-notes.tsx` (`DayNotes`).
- `features/goals/components/day-goals.tsx` (`DayGoals`) — "Metas em foco".

## Decisões e armadilhas

- **Contatos vinculados via `EntityLink` ([D003](../../DECISIONS.md#d003)):** a
  agregação inspeciona ambos os lados do link (origem ou destino pode ser o
  `CONTACT`) e deduplica contatos ligados a mais de uma atividade do dia.
- **Fuso / UTC:** `date` trafega como `YYYY-MM-DD` e é convertido para
  **meia-noite UTC** (`@db.Date`) ao consultar. Na web, o período (Manhã/Tarde/
  Noite) usa a **hora local** do início da ocorrência — pode divergir do UTC.
- **Recorrência:** eventos recorrentes só entram no dia se a RRULE expandir uma
  ocorrência nele (`expandRecurrence`); o evento base pode ser de outra data.
- **Resumo sem rede extra:** o `DayView` chama as mesmas queries das zonas para
  as contagens; o TanStack Query reaproveita o cache pela `queryKey`.
- **Composição no cliente:** eventos e notas do mês são compostos no cliente; o
  `summary` (Fase 2) agrega só tarefas. Unificar no servidor é
  [questão em aberto](README.md).
