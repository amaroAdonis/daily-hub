# Dashboard do dia — Regras de Negócio

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#dia)

## Quais itens entram no dia

| Tipo           | Critério de inclusão no dia                                         | Fonte (web)                      |
| -------------- | ------------------------------------------------------------------- | -------------------------------- |
| Tarefa         | `date` igual ao dia                                                 | `useTasks({ date })`             |
| Nota           | `date` igual ao dia                                                 | `useNotes({ date })`             |
| Compromisso    | ocorrência no dia (eventos recorrentes têm a RRULE expandida)       | `useEventOccurrences({from,to})` |
| Meta (em foco) | `status` em `TODO`/`DOING` (não filtra por dia — objetivos à vista) | `useGoals({})`                   |
| Contato        | vinculado via `EntityLink` a uma atividade do dia                   | `useDayDetail(date)`             |
| Feriado        | data do feriado (BR/IE) igual ao dia                                | `useHolidays(ano)`               |

## Agrupamento da agenda por período

Os compromissos (não as tarefas/notas) são agrupados por período do dia. A faixa
sai da hora local do início da ocorrência.

| Período     | Critério                     | Ordem |
| ----------- | ---------------------------- | ----- |
| Dia inteiro | `allDay = true`              | 1     |
| Manhã       | hora de início `< 12`        | 2     |
| Tarde       | `12 ≤` hora de início `< 18` | 3     |
| Noite       | hora de início `≥ 18`        | 4     |

> Período sem itens **não é renderizado**. Lógica em
> `apps/web/src/features/events/components/day-events.tsx` (`PERIODS`/`periodOf`).

## Marcador "agora"

| Regra   | Detalhe                                                                 |
| ------- | ----------------------------------------------------------------------- |
| Hoje    | o dia atual recebe a pílula "hoje" no resumo (coral/`accent`)           |
| "agora" | marcador de linha do tempo previsto no redesenho — **ainda não** existe |

## Resumo do dia

| Contagem     | Como é calculada                                 |
| ------------ | ------------------------------------------------ |
| Compromissos | nº de ocorrências do dia                         |
| Tarefas      | `concluídas/total` (concluída = `status = DONE`) |
| Notas        | nº de notas com a data                           |
| Metas ativas | nº de metas em `TODO`/`DOING`                    |

## Contatos via EntityLink ([D003](../../DECISIONS.md#d003))

| Regra             | Detalhe                                                                               |
| ----------------- | ------------------------------------------------------------------------------------- |
| Lado da atividade | `EntityLink` que toca uma `TASK`/`NOTE`/`EVENT` do dia em qualquer lado               |
| Lado do contato   | o outro lado do link é `CONTACT`                                                      |
| Dedup             | um contato ligado a várias atividades aparece **uma vez**                             |
| Ordenação         | por `name` ascendente                                                                 |
| Isolamento        | apenas atividades e contatos do usuário autenticado ([D004](../../DECISIONS.md#d004)) |
| Vazio             | sem atividades ou sem vínculos → `contacts: []` (a seção some na UI)                  |
