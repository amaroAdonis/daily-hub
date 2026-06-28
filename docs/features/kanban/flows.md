# Kanban — Fluxos

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#kanban)

## Índice

- Montar o quadro — três fontes normalizadas em `BoardItem`.
- Arrastar cartão entre colunas — update otimista → mutation por tipo → toast.

## Montar o quadro

```mermaid
flowchart TD
    A["useTasks / useEventsBase / useGoals"] --> B["buildBoard(tasks, events, goals)"]
    B --> C["Filtra: metas ARCHIVED fora;<br/>DONE só se recente (<=30d)"]
    C --> D["Aplica overrides otimistas + filtro por tipo"]
    D --> E["Distribui em 3 colunas por status"]
```

## Arrastar cartão entre colunas

```mermaid
flowchart TD
    A["Usuário solta o cartão numa coluna"] --> B{"over definido<br/>e coluna diferente?"}
    B -->|não| Z["Ignora (sem mutation)"]
    B -->|sim| C["setOverrides: cartão troca de coluna na hora"]
    C --> D{"item.type?"}
    D -->|TASK| E["updateTask.mutate(PATCH /tasks/:id)"]
    D -->|EVENT| F["updateEvent.mutate(PATCH /events/:id)"]
    D -->|GOAL| G["updateGoal.mutate(PATCH /goals/:id)"]
    E --> H["onSettled: limpa o override"]
    F --> H
    G --> H
    C --> T["toast: Movido para ..."]
```
