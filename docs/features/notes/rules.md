# Anotações — Regras de Negócio

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#anotacao)

## Vínculo com o dia (`date`)

| Condição                          | Resultado                                                |
| --------------------------------- | -------------------------------------------------------- |
| nota criada/atualizada com `date` | fica anexada àquele dia                                  |
| nota sem `date`                   | existe de forma independente (não aparece em nenhum dia) |
| atualizar com `date: null`        | desanexa a nota do dia                                   |
| atualizar sem enviar `date`       | vínculo inalterado                                       |

## Listagem e ordenação

| Condição                            | Resultado                                                   |
| ----------------------------------- | ----------------------------------------------------------- |
| `date` informado                    | filtra notas anexadas àquele dia                            |
| `pinned` informado (`true`/`false`) | filtra por estado de fixação                                |
| sempre                              | ordena por `pinned` desc e, em empate, por `updatedAt` desc |

> Fixadas sempre vêm primeiro; dentro de cada grupo, as mais recentes no topo.

## Fixar

| Estado     | Evento    | Próximo estado   |
| ---------- | --------- | ---------------- |
| não fixada | fixar     | `pinned = true`  |
| fixada     | desafixar | `pinned = false` |

## Markdown

| Regra         | Detalhe                                                          |
| ------------- | ---------------------------------------------------------------- |
| Interpretação | `content` é tratado como Markdown                                |
| Render        | `react-markdown` com componentes Tailwind (web)                  |
| Segurança     | HTML embutido **não** é renderizado (padrão do `react-markdown`) |
| Limite        | `content` até 50.000 caracteres                                  |

## Dia e fuso

| Regra    | Detalhe                                         |
| -------- | ----------------------------------------------- |
| Trânsito | `date` trafega como `YYYY-MM-DD` (ou `null`)    |
| Gravação | convertido para meia-noite **UTC** (`@db.Date`) |
