# Compromissos — Fluxos

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#compromisso)

## Índice

- Expandir ocorrências num intervalo — único vs. recorrente, limite de 92 dias.
- Entrar na reunião / Adicionar ao Google Agenda — integrações leves sem OAuth.

## Expandir ocorrências num intervalo

```mermaid
flowchart TD
    A["GET /events?from&to"] --> B["Janela UTC: from 00:00 .. to 23:59.999"]
    B --> C{"span > 92 dias?"}
    C -->|sim| D["400 BadRequest"]
    C -->|não| E["Busca únicos que intersectam a janela"]
    C -->|não| F["Busca recorrentes com startsAt ≤ windowEnd"]
    E --> G["Ocorrência única (recurring=false)"]
    F --> H["expandRecurrence (rrule.between em UTC)"]
    H --> I["Para cada start: end = start + duração base"]
    G --> J["Ordena por start (ISO) e retorna EventOccurrence[]"]
    I --> J
```

## Entrar na reunião / Adicionar ao Google Agenda

```mermaid
flowchart TD
    A["EventItem (ocorrência)"] --> B{"tem meetingUrl?"}
    B -->|sim| C["Botão 'Entrar' abre meetingUrl em nova aba"]
    B -->|não| D["Sem botão de reunião"]
    A --> E["Botão 'Adicionar ao Google Agenda'"]
    E --> F["googleCalendarUrl(occurrence)"]
    F --> G["Datas em UTC; dia inteiro com fim exclusivo; meetingUrl nos detalhes"]
    G --> H["Abre calendar.google.com/render?action=TEMPLATE&... (sem OAuth)"]
```
