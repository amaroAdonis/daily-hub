# Feature: <Nome>

- **Fase:** <n>
- **Status:** planejada | em andamento | concluída

## Objetivo

Uma frase: que problema do usuário esta feature resolve.

## Modelo de dados

Entidades/campos envolvidos (referência ao `schema.prisma`).

## Contrato da API

| Método | Rota       | Descrição | Body / Query |
| ------ | ---------- | --------- | ------------ |
| GET    | `/api/...` |           |              |
| POST   | `/api/...` |           |              |

Schemas Zod: `packages/shared/src/schemas/<feature>.ts`.

## UI (web)

Telas e componentes em `apps/web/src/features/<feature>`.

## Critérios de aceite

- [ ] ...

## Testes

- [ ] Unit/integração (Vitest): ...
- [ ] E2E (Playwright): ...
