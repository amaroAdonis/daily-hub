# Calendário / Agenda — Notas Técnicas

## Contrato da API

| Método | Rota                    | Descrição                                        | Body / Query                     |
| ------ | ----------------------- | ------------------------------------------------ | -------------------------------- |
| GET    | `/api/calendar/summary` | Agrega tarefas por dia no intervalo              | Query: `from`, `to` (YYYY-MM-DD) |
| GET    | `/api/calendar/day`     | Detalhe agregado de um dia (contatos vinculados) | Query: `date` (YYYY-MM-DD)       |

`summary` retorna `DaySummary[]` (`{ date, total, done }`), apenas para dias com
ao menos uma tarefa; intervalo limitado a 92 dias (`400` acima disso). `day`
retorna `DayDetail` (`{ date, contacts }`). Schemas Zod:
`packages/shared/src/schemas/calendar.ts` (`calendarRangeQuery`, `daySummaryDto`,
`dayDetailQuery`, `dayDetailDto`, `dayContactDto`). Validação via
`ZodValidationPipe`.

## Modelo

**Não há entidade nova** — o calendário é uma camada de **agregação/
visualização** sobre `Task`, `Event`, `Note` e `Contact`
([`../../data-model.md`](../../data-model.md)). O detalhe do dia atravessa o
`EntityLink` polimórfico ([D003](../../DECISIONS.md#d003)) para resolver as
"Pessoas do dia". O service em `apps/api/src/modules/calendar` reaproveita
`expandRecurrence` do módulo de [Compromissos](../events/README.md) para os
eventos recorrentes.

## UI (web)

`apps/web/src/features/calendar`:

- `dates.ts` — utilitários de data (date-fns): grade do mês, dias da semana,
  intervalo por visão e navegação (semana começa no domingo).
- `holidays.ts` — `useHolidays(year)`: feriados BR/IE via Nager.Date, cache
  infinito.
- `api.ts` / `hooks.ts` — `useCalendarSummary` (indexa o resultado por dia num
  `Map` para consulta O(1) por célula) e `useDayDetail`.
- `components/`:
  - `CalendarPage` — recebe visão/referência do `App` (controlado); clicar um
    dia aprofunda para a visão de dia.
  - `CalendarHeader` — navegação (anterior/hoje/próximo) e alternador de visão.
  - `MonthView` — grade 6×7 com indicadores (tarefas, compromissos, notas,
    feriados); o dia atual recebe o âmbar (`accent`).
  - `WeekView` — sete colunas com compromissos e tarefas de cada dia (compactos).
  - `DayView` — dashboard: barra de resumo + zonas (compromissos, tarefas/metas,
    notas/pessoas), reaproveitando cada feature; entrada animada (framer-motion).
  - `DayHolidays` — faixa de feriados do dia (some se não houver).
  - `DayContacts` — "Pessoas do dia" via `useDayDetail`.

A `App` controla a visão/data e renderiza `CalendarPage` dentro do `AppShell`;
o calendário é a landing pós-login (a sidebar "Hoje" abre o dia atual).

## Decisões e armadilhas

- **Datas em UTC vs. local:** no banco os dias são filtrados à meia-noite **UTC**
  (`@db.Date`); na web os `Date` são construídos em **horário local** a partir de
  `YYYY-MM-DD`. Manter a conversão consistente para não deslocar o dia.
- **Limite de 92 dias:** salvaguarda contra intervalos enormes; a web já envia o
  intervalo alinhado à grade visível, bem abaixo do limite.
- **Resumo omite dias vazios:** a resposta não traz dias sem tarefa; a web
  preenche com zero ao indexar no `Map`.
- **Feriados (Nager.Date):** API pública sem chave; falha de rede vira lista
  vazia (não quebra a visão). Cache infinito por ano. A grade do mês cobre dois
  anos nas bordas (jan/dez). BR usa nome local (PT); IE usa o nome internacional
  (o local vem em gaélico).
- **Pessoas do dia:** considera eventos recorrentes expandindo a RRULE no dia; o
  `CONTACT` pode estar em qualquer lado do `EntityLink` e é deduplicado.
- **Isolamento:** todas as agregações filtram por `userId` do usuário autenticado
  ([D004](../../DECISIONS.md#d004)).
