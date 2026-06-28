# Tarefas — Regras de Negócio

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#tarefa)

## Conclusão e `completedAt`

| Transição de status     | Efeito em `completedAt`         |
| ----------------------- | ------------------------------- |
| `TODO`/`DOING` → `DONE` | preenchido com o instante atual |
| `DONE` → `TODO`/`DOING` | limpo (`null`)                  |
| sem mudança de status   | inalterado                      |

## Máquina de estado: status da tarefa

| Estado  | Evento   | Próximo estado |
| ------- | -------- | -------------- |
| `TODO`  | iniciar  | `DOING`        |
| `DOING` | concluir | `DONE`         |
| `DONE`  | reabrir  | `TODO`         |

> Na UI, a pílula de status clica e cicla nesta ordem (`NEXT_STATUS` em
> `lib/status.ts`). O Kanban move entre as três colunas.

## Listagem e ordenação

| Condição           | Resultado                       |
| ------------------ | ------------------------------- |
| `date` informado   | filtra tarefas daquele dia      |
| `status` informado | filtra por status               |
| sempre             | ordena por `order` (ascendente) |

## Dia e fuso

| Regra    | Detalhe                                         |
| -------- | ----------------------------------------------- |
| Trânsito | `date` trafega como `YYYY-MM-DD`                |
| Gravação | convertido para meia-noite **UTC** (`@db.Date`) |
