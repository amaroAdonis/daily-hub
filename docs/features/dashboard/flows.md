# Dashboard do dia — Fluxos

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#dia)

## Índice

- Login → calendário → abrir o dashboard de um dia (composição + `GET /calendar/day`).
- Criar um item inline no dashboard (reaproveita o CRUD da feature).

## Login → calendário → dashboard do dia

```mermaid
flowchart TD
    A["Login bem-sucedido"] --> B["Landing: calendário do mês"]
    B --> C["Usuário clica numa célula de dia"]
    C --> D["App fixa visão=dia e data; renderiza DayView"]
    D --> E["Queries compartilhadas: useTasks / useNotes / useEventOccurrences / useGoals"]
    D --> F["useDayDetail(date) → GET /calendar/day?date="]
    F --> G["API: dayContacts agrega atividades do dia<br/>e resolve contatos via EntityLink"]
    E --> H["Resumo + zonas (compromissos por período, tarefas, notas, metas)"]
    G --> I["Pessoas do dia (some se vazio)"]
    H --> J["Dashboard renderizado"]
    I --> J
```

## Criar item inline no dashboard

```mermaid
flowchart TD
    A["Usuário clica em 'Adicionar' numa zona"] --> B["Form inline da feature<br/>(EventForm / TaskComposer / NoteForm)"]
    B --> C["POST na feature de origem (events / tasks / notes)"]
    C --> D["API valida (Zod) e grava para o usuário autenticado"]
    D --> E["Invalida o cache da feature (TanStack Query)"]
    E --> F["A zona re-renderiza com o novo item"]
    F --> G["Resumo atualiza (mesma queryKey compartilhada)"]
```
