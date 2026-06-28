# Calendário / Agenda — Fluxos

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#resumo-do-dia)

## Índice

- Navegar e renderizar uma visão — referência + intervalo + agregação.
- Clicar um dia abre o dashboard — aprofundamento mês/semana → dia.
- Detalhe do dia (Pessoas do dia) — atividades → `EntityLink` → contatos.

## Navegar e renderizar uma visão

```mermaid
flowchart TD
    A["Usuário escolhe visão / navega"] --> B["App atualiza referência + visão"]
    B --> C["rangeForView calcula from/to da grade visível"]
    C --> D["GET /calendar/summary (tarefas por dia)"]
    C --> E["GET /events (ocorrências) + notas + feriados (Nager.Date)"]
    D --> F["summary indexado por dia (Map O(1))"]
    F --> G["Renderiza grade com indicadores"]
    E --> G
```

## Clicar um dia abre o dashboard

```mermaid
flowchart LR
    A["MonthView / WeekView"] -->|clica célula| B["selectDay(day)"]
    B --> C["referência = day; visão = 'day'"]
    C --> D["DayView (dashboard do dia)"]
    D --> E["Eventos · Tarefas · Notas · Metas · Pessoas · Feriados"]
```

## Detalhe do dia (Pessoas do dia)

```mermaid
flowchart TD
    A["GET /calendar/day?date"] --> B["Coleta atividades do dia"]
    B --> B1["Tarefas/Notas com a data"]
    B --> B2["Eventos únicos que sobrepõem o dia"]
    B --> B3["Eventos recorrentes: RRULE com ocorrência no dia"]
    B1 --> C{"alguma atividade?"}
    B2 --> C
    B3 --> C
    C -->|não| Z["retorna contacts: []"]
    C -->|sim| D["EntityLink: CONTACT ligado a alguma atividade"]
    D --> E["Deduplica contactIds"]
    E --> F["Contatos do usuário, ordenados por nome"]
```
