# Tarefas — Fluxos

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#tarefa)

## Índice

- Criar tarefa no dia — composição inline e atualização da lista.
- Concluir/reabrir — ciclo de status e `completedAt`.

## Criar tarefa no dia

```mermaid
flowchart TD
    A["Usuário digita no TaskComposer"] --> B["POST /tasks (date, title, priority)"]
    B --> C["API valida (Zod) e grava com status=TODO"]
    C --> D["Invalida cache de tasks (TanStack Query)"]
    D --> E["DayTasks re-renderiza com a nova tarefa"]
```

## Concluir / reabrir

```mermaid
flowchart LR
    A["TODO"] -->|iniciar| B["DOING"]
    B -->|concluir → grava completedAt| C["DONE"]
    C -->|reabrir → limpa completedAt| A
```
