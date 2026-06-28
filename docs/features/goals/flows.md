# Metas — Fluxos

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#meta)

## Índice

- Criar meta e vincular tarefas — progresso (`taskStats`) recalculado na leitura.
- Ciclo de status — A fazer → Em andamento → Concluído (+ arquivar).

## Criar meta → vincular tarefas → progresso recalculado

```mermaid
flowchart TD
    A["Usuário cria meta no GoalForm"] --> B["POST /goals (title, horizon, progress, targetDate)"]
    B --> C["API valida (Zod) e grava a meta"]
    C --> D["GoalTasks: criar/vincular tarefa (goalId)"]
    D --> E["POST/PATCH /tasks com goalId"]
    E --> F["GET /goals agrega taskStats (done/total) por goalId"]
    F --> G["GoalCard re-renderiza com done/total atualizado"]
```

## Ciclo de status

```mermaid
flowchart LR
    A["TODO"] -->|iniciar| B["DOING"]
    B -->|concluir| C["DONE"]
    C -->|reabrir| A
    A -.->|arquivar| D["ARCHIVED"]
    B -.->|arquivar| D
    C -.->|arquivar| D
```

> `ARCHIVED` é um destino à parte, fora do ciclo do Kanban (A fazer → Em
> andamento → Concluído) e fora das "metas em foco" do dia.
