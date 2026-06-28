# <Nome da feature> — Notas Técnicas

<!--
  Detalhes de implementação, padrões, endpoints, armadilhas. Tópicos por tema.
  Remova estes comentários ao preencher.
-->

## Contrato da API

| Método | Rota             | Descrição | Body / Query |
| ------ | ---------------- | --------- | ------------ |
| GET    | `/api/<feature>` | …         | …            |

Schemas Zod: `packages/shared/src/schemas/<feature>.ts`.

## UI (web)

`apps/web/src/features/<feature>`: componentes e hooks principais.

## Decisões e armadilhas

- Ponto técnico relevante (ex.: datas em UTC, ordem de rotas, build do shared).
