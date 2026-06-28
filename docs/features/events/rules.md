# Compromissos — Regras de Negócio

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#compromisso)

## Recorrência e expansão

| Regra      | Detalhe                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| Formato    | `recurrence` guarda uma [RRULE](../../GLOSSARY.md#rrule) (RFC 5545) **sem** o prefixo `RRULE:` (ex.: `FREQ=WEEKLY`) |
| Nula       | `recurrence = null` ⇒ evento único (não expande)                                                                    |
| Expansão   | feita na API via lib `rrule` (`rrulestr` + `between(from, to, true)`), inclusiva nas bordas                         |
| Fuso       | expandida em **UTC**, mantendo o horário (UTC) do `startsAt` — determinística para agenda sem timezone              |
| Duração    | cada ocorrência preserva a duração do evento base (`end = start + (endsAt − startsAt)`)                             |
| Referência | toda ocorrência referencia o `eventId` base e marca `recurring: true`                                               |

## Intervalo consultável

| Regra       | Detalhe                                                                                 |
| ----------- | --------------------------------------------------------------------------------------- |
| Janela      | da meia-noite UTC de `from` ao fim do dia (`23:59:59.999Z`) de `to`                     |
| Limite      | máximo **92 dias**; acima disso a API responde `400` (`BadRequest`)                     |
| Únicos      | incluídos quando intersectam a janela (`startsAt ≤ windowEnd` e `endsAt ≥ windowStart`) |
| Recorrentes | considerados quando `startsAt ≤ windowEnd`, depois expandidos                           |
| Ordenação   | ocorrências retornadas ordenadas por `start` (ISO, ascendente)                          |

## Agrupamento na web

| Regra         | Detalhe                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| Por dia local | a web agrupa as ocorrências pelo dia **local** de início (como o usuário as vê na grade), via `useEventOccurrences` |
| Consulta      | mapa `dia → ocorrências[]` para leitura O(1) por célula do calendário                                               |

## Edição da série

| Ação                  | Efeito                                                                         |
| --------------------- | ------------------------------------------------------------------------------ |
| Editar uma ocorrência | edita o **compromisso base** (a série inteira) — não há exceção por ocorrência |
| Excluir               | remove o compromisso base e todas as suas ocorrências                          |

## Categorias

| Categoria (`EventCategory`) | Rótulo (web)    |
| --------------------------- | --------------- |
| `WORK`                      | Trabalho        |
| `PERSONAL`                  | Pessoal         |
| `HEALTH`                    | Saúde           |
| `SOCIAL`                    | Social          |
| `STUDY`                     | Estudos         |
| `OTHER`                     | Outro (default) |

> Cada categoria tem paleta de cor própria (`dot`/`pill`/`bar` em
> `features/events/categories.ts`), distinta do teal/coral de marca.

## Status (`EventStatus`)

| Estado  | Evento   | Próximo estado |
| ------- | -------- | -------------- |
| `TODO`  | iniciar  | `DOING`        |
| `DOING` | concluir | `DONE`         |
| `DONE`  | reabrir  | `TODO`         |

> Mesmo eixo de tarefas e metas ([D005](../../DECISIONS.md#d005)); rótulos/cores
> em `lib/status.ts`. O [Kanban](../kanban/README.md) move entre as três colunas.
