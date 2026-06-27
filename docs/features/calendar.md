# Feature: Calendário / Agenda

- **Fase:** 2
- **Status:** concluída

## Objetivo

Dar ao usuário o **hub temporal** da agenda: navegar por data em visões de
mês, semana e dia, vendo de relance o que cada dia concentra. É o que costura as
features ao eixo do dia.

## Modelo de dados

Não introduz modelo próprio — é uma camada de **agregação/visualização** sobre
`Task` (`packages/db/prisma/schema.prisma`). Nas próximas fases o calendário
passa a agregar também `Event` (Fase 3) e demais itens com eixo temporal.

## Contrato da API

| Método | Rota                    | Descrição                           | Body / Query                     |
| ------ | ----------------------- | ----------------------------------- | -------------------------------- |
| GET    | `/api/calendar/summary` | Agrega tarefas por dia no intervalo | Query: `from`, `to` (YYYY-MM-DD) |

`summary` retorna `DaySummary[]` (`{ date, total, done }`), apenas para os dias
com ao menos uma tarefa. O intervalo é limitado a 92 dias. Schemas Zod em
[`packages/shared/src/schemas/calendar.ts`](../../packages/shared/src/schemas/calendar.ts).

As visões de **dia** e **semana** reaproveitam o endpoint de tarefas
(`GET /api/tasks?date=`); o `summary` alimenta os indicadores da grade do mês.

## UI (web)

`apps/web/src/features/calendar`:

- `dates.ts` — utilitários de data (date-fns): grade do mês, dias da semana,
  intervalo por visão e navegação (semana começa no domingo).
- `api.ts` / `hooks.ts` — `useCalendarSummary` (indexa o resultado por dia em
  um `Map` para consulta O(1) por célula).
- `components/`:
  - `CalendarPage` — estado de visão + data de referência; clicar um dia
    aprofunda para a visão de dia.
  - `CalendarHeader` — navegação (anterior/hoje/próximo) e alternador de visão.
  - `MonthView` — grade 6×7 com indicadores de tarefas; o dia atual recebe o
    âmbar (`accent`).
  - `WeekView` — sete colunas com as tarefas de cada dia (compactas).
  - `DayView` — cabeçalho da data + a feature de Tarefas (`DayTasks`).

A `App` renderiza `CalendarPage` dentro do `AppShell`.

## Critérios de aceite

- [x] Alternar entre visões de mês, semana e dia.
- [x] Navegar para o período anterior/seguinte e voltar para hoje.
- [x] Ver, na grade do mês, quantas tarefas (e quantas concluídas) cada dia tem.
- [x] Destacar o dia atual.
- [x] Clicar um dia abre a visão de dia com as tarefas daquele dia.

## Testes

- [x] Unit (Vitest): `calendar.service.spec.ts` cobre a agregação por dia
      (total/concluídas), a conversão do intervalo para UTC, o limite de
      intervalo e o caso vazio.
- [ ] E2E (Playwright): planejado para fase posterior.
