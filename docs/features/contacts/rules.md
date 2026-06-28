# Contatos — Regras de Negócio

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#contato)

## Busca (`search`)

Um único parâmetro `search` filtra a listagem. Quando ausente, lista todos os
contatos do usuário.

| Campo casado | Tipo de match               |
| ------------ | --------------------------- |
| `name`       | substring, case-insensitive |
| `email`      | substring, case-insensitive |
| `company`    | substring, case-insensitive |

> Os três são combinados por **OR**: basta casar em um deles. `phone` e `notes`
> não entram na busca.

## Ordenação

| Condição | Resultado                      |
| -------- | ------------------------------ |
| sempre   | ordena por `name` (ascendente) |

## Atualização parcial

| Valor enviado no campo opcional | Efeito                 |
| ------------------------------- | ---------------------- |
| ausente                         | inalterado             |
| string                          | grava o novo valor     |
| `null`                          | limpa o campo (`null`) |

> `name` não aceita `null`: quando enviado, deve ter ao menos 1 caractere.
