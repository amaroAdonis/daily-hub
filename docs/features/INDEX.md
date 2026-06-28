# Índice de Features

Catálogo navegável das features do Daily Hub. Cada feature tem uma **pasta**
(`features/<feature>/`) com quatro documentos: visão geral e requisitos
(`README.md`), regras de negócio (`rules.md`), fluxos (`flows.md`) e notas
técnicas (`notes.md`).

## Convenção de IDs

Rastreabilidade do requisito ao código e aos testes, via identificadores estáveis:

| Tipo                   | Formato             | Exemplo         | Onde vive                                   |
| ---------------------- | ------------------- | --------------- | ------------------------------------------- |
| Requisito funcional    | `REQ-<FEATURE>-NNN` | `REQ-TASKS-001` | `<feature>/README.md` → Requisitos          |
| Critério de aceite     | `AC-<FEATURE>-NNN`  | `AC-TASKS-001`  | `<feature>/README.md` → Critérios de Aceite |
| Decisão de arquitetura | `D00N`              | `D002`          | [`../DECISIONS.md`](../DECISIONS.md)        |

`<FEATURE>` é o nome da pasta em maiúsculas (`tasks` → `TASKS`). `NNN` é
sequencial de 3 dígitos por feature. Todo `AC-*` referencia ao menos um `REQ-*`.

## Catálogo

| Feature                           | Prioridade | Status    | Pasta                                   | Fluxos                        | Regras                        | Notas                         |
| --------------------------------- | ---------- | --------- | --------------------------------------- | ----------------------------- | ----------------------------- | ----------------------------- |
| Tarefas                           | P0         | Concluída | [`tasks/`](tasks/README.md)             | [flows](tasks/flows.md)       | [rules](tasks/rules.md)       | [notes](tasks/notes.md)       |
| Calendário / Agenda               | P0         | Concluída | [`calendar/`](calendar/README.md)       | [flows](calendar/flows.md)    | [rules](calendar/rules.md)    | [notes](calendar/notes.md)    |
| Compromissos / Eventos            | P0         | Concluída | [`events/`](events/README.md)           | [flows](events/flows.md)      | [rules](events/rules.md)      | [notes](events/notes.md)      |
| Metas                             | P0         | Concluída | [`goals/`](goals/README.md)             | [flows](goals/flows.md)       | [rules](goals/rules.md)       | [notes](goals/notes.md)       |
| Anotações                         | P1         | Concluída | [`notes/`](notes/README.md)             | [flows](notes/flows.md)       | [rules](notes/rules.md)       | [notes](notes/notes.md)       |
| Contatos                          | P1         | Concluída | [`contacts/`](contacts/README.md)       | [flows](contacts/flows.md)    | [rules](contacts/rules.md)    | [notes](contacts/notes.md)    |
| Integração (Links + Tags + Busca) | P0         | Concluída | [`integration/`](integration/README.md) | [flows](integration/flows.md) | [rules](integration/rules.md) | [notes](integration/notes.md) |
| Autenticação + Perfil             | P0         | Concluída | [`auth/`](auth/README.md)               | [flows](auth/flows.md)        | [rules](auth/rules.md)        | [notes](auth/notes.md)        |
| Dashboard do dia                  | P0         | Concluída | [`dashboard/`](dashboard/README.md)     | [flows](dashboard/flows.md)   | [rules](dashboard/rules.md)   | [notes](dashboard/notes.md)   |
| Anexos                            | P1         | Concluída | [`attachments/`](attachments/README.md) | [flows](attachments/flows.md) | [rules](attachments/rules.md) | [notes](attachments/notes.md) |
| Kanban                            | P1         | Concluída | [`kanban/`](kanban/README.md)           | [flows](kanban/flows.md)      | [rules](kanban/rules.md)      | [notes](kanban/notes.md)      |

> Prioridade: `P0` núcleo do produto · `P1` alto valor · `P2` refinamento.
> Status: `Concluída` · `Em desenvolvimento` · `Planejada`.

## Regras de governança

1. Toda feature nova nasce de uma cópia de [`_template/`](_template/README.md) e
   é registrada na tabela acima.
2. Todo requisito recebe um `REQ-<FEATURE>-NNN` e é rastreável até o código.
3. Todo critério de aceite recebe um `AC-<FEATURE>-NNN` no formato
   Given/When/Then e referencia ao menos um `REQ-*`.
4. Conceitos de domínio citados numa feature têm âncora no
   [Glossário](../GLOSSARY.md); termos novos são adicionados lá.
5. Fluxos relevantes são descritos em `flows.md` com diagrama **Mermaid**;
   fluxos complexos ganham um arquivo próprio em `<feature>/flows/`.
6. Regras de negócio e máquinas de estado vivem em `rules.md`, em tabelas.
7. Decisões estruturais vão para [`../DECISIONS.md`](../DECISIONS.md) (`D00N`) e
   são citadas por ID onde se aplicam.
8. O modelo de dados canônico é o [`schema.prisma`](../../packages/db/prisma/schema.prisma);
   `notes.md` e [`../data-model.md`](../data-model.md) explicam o porquê.
9. Padrões de código, commits e a definição de pronto estão em
   [`../conventions.md`](../conventions.md).
10. Ao concluir uma fase, atualizar o status nesta tabela e em
    [`../ROADMAP.md`](../ROADMAP.md).
