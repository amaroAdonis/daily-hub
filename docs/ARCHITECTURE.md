# Arquitetura

## Visão geral

Daily Hub é um monorepo TypeScript com dois aplicativos (web e api) e três
pacotes compartilhados. A escolha por separar frontend e backend (em vez de um
monolito Next.js) é deliberada: demonstra design de API explícito, código
compartilhado disciplinado e separação clara de responsabilidades. Ver
[D002](DECISIONS.md#d002).

```
┌──────────────┐      HTTP/JSON      ┌──────────────┐     Prisma     ┌────────────┐
│  apps/web    │  ───────────────▶   │  apps/api    │  ───────────▶  │ PostgreSQL │
│  React+Vite  │   (REST /api/*)     │   NestJS     │                └────────────┘
└──────┬───────┘                     └──────┬───────┘
       │                                    │
       │        packages/shared (Zod)       │
       └──────────────┬─────────────────────┘
                      │ tipos e validação compartilhados
              packages/db (Prisma Client e schema)
```

## Pacotes

- **apps/web** — SPA em React. Estado de servidor com TanStack Query; estilo com
  Tailwind sobre tokens em CSS variables. Organizado por **feature** em
  `src/features/<feature>`, espelhando os módulos da API.
- **apps/api** — NestJS. Cada feature é um **módulo** (`src/modules/<feature>`)
  com controller + service. `PrismaModule` é global; `HealthModule` valida a
  conexão. Documentação OpenAPI automática em `/api/docs`.
- **packages/shared** — Schemas Zod e tipos usados pelos dois lados. É a fonte
  única de verdade da forma dos dados na fronteira da API.
- **packages/db** — Schema Prisma e cliente. Exporta uma instância única do
  `PrismaClient` e todos os tipos/enums gerados.
- **packages/config** — Presets de `tsconfig` para Node e React.

## Fluxo de uma feature (padrão a partir da Fase 1)

1. Definir/atualizar o modelo em `packages/db/prisma/schema.prisma`.
2. Criar os schemas Zod em `packages/shared/src/schemas/<feature>.ts`
   (request e response), derivando os tipos a partir deles.
3. Implementar o módulo NestJS em `apps/api/src/modules/<feature>`
   (controller usando `ZodValidationPipe`, service usando `PrismaService`).
4. Consumir na web em `apps/web/src/features/<feature>` (hooks de TanStack
   Query sobre `lib/api.ts`).
5. Escrever testes (Vitest) e documentar a feature em
   `docs/features/<feature>/` (ver [features/INDEX.md](features/INDEX.md)).

Esse padrão garante type-safety da borda do banco até a UI, com validação em
um único lugar.

## Decisões registradas

Todas as decisões estruturais ficam em [`DECISIONS.md`](DECISIONS.md), citáveis
por ID (`D00N`). Destaques: [D002](DECISIONS.md#d002) (monorepo React + NestJS),
[D003](DECISIONS.md#d003) (links/tags polimórficos), [D004](DECISIONS.md#d004)
(auth JWT) e [D009](DECISIONS.md#d009) (build CJS do `shared`).
