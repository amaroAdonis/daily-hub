# Feature: Dashboard do dia

- **Fase:** 9
- **Status:** concluída

## Objetivo

Fazer o **dia** ser a experiência central: o calendário do mês é a porta de
entrada e, ao clicar num dia, abre um dashboard que reúne tudo daquele dia —
compromissos, tarefas, notas e as **pessoas** (contatos) vinculadas às
atividades — com criação/edição inline.

## Modelo de dados

Sem modelo novo. A agregação de "pessoas do dia" usa os `EntityLink`
(`schema.prisma`) que ligam um `CONTACT` a uma `TASK`/`NOTE`/`EVENT` do dia.

## Contrato da API

| Método | Rota                      | Descrição                           | Query  |
| ------ | ------------------------- | ----------------------------------- | ------ |
| GET    | `/api/calendar/day?date=` | Detalhe do dia: contatos vinculados | `date` |

`CalendarService.dayContacts` reúne os ids das atividades do dia — tarefas e
notas com a data e eventos (inclusive recorrentes, via `expandRecurrence`) com
ocorrência no dia —, busca os `EntityLink` que tocam essas atividades de um lado
e um `CONTACT` do outro, e resolve os contatos (dedup) direto via Prisma — sem
acoplar `EventsModule`/`IntegrationModule`. Schemas em
[`packages/shared/src/schemas/calendar.ts`](../../packages/shared/src/schemas/calendar.ts)
(`dayDetailDto`, `dayDetailQuery`).

O `GET /calendar/summary` (Fase 2) segue agregando tarefas; eventos e notas no
calendário do mês são compostos no cliente.

## UI (web)

- **Navegação unificada**: o calendário é a landing pós-login. O estado de
  visão/data vive no `App`; o `CalendarPage` é controlado. A sidebar tem **Hoje**
  (atalho que abre o dashboard do dia atual) e **Agenda** (mês), com o item ativo
  derivado do estado.
- **Dashboard** (`features/calendar/components/day-view.tsx`): resumo escaneável
  no topo (compromissos · tarefas M/N · notas — via `useTasks`/`useNotes`/
  `useEventOccurrences`, deduplicadas com os sub-componentes), as atividades em
  duas zonas (`DayEvents` + `DayTasks` | `DayNotes` + `DayContacts`) com CRUD
  inline reaproveitado, e **"Pessoas do dia"** (`day-contacts.tsx` +
  `useDayDetail`) com o botão Conexões abrindo o Inspetor.
- **Mês** (`month-view.tsx`): além de tarefas e compromissos, passa a indicar
  **notas** por dia (contagem client-side via `useNotes`).

## Critérios de aceite

- [x] Login abre no calendário do mês (landing).
- [x] O mês indica tarefas, compromissos e notas por dia.
- [x] Clicar num dia abre o dashboard (resumo + atividades + pessoas).
- [x] Criar/editar tarefas, eventos e notas inline no dashboard.
- [x] "Pessoas do dia" lista os contatos vinculados às atividades do dia.
- [x] Atalho "Hoje" abre o dashboard do dia atual.

## Testes

- [x] Unit (Vitest): `calendar.service.spec.ts` cobre `dayContacts` (contato
      vinculado a uma tarefa do dia, dedup entre atividades, dia sem atividades).
- [x] Smoke test HTTP: `GET /api/calendar/day?date=<hoje>` retorna o contato do
      seed vinculado à nota do dia.
- [ ] E2E (Playwright): planejado para fase posterior.
