# CLAUDE.md

Orientações para o Claude Code trabalhar neste repositório. Leia também
`docs/ROADMAP.md`, `docs/ARCHITECTURE.md` e `docs/data-model.md`.

## Visão geral

Daily Hub é uma agenda pessoal centrada no **dia**: tarefas, metas, anotações,
compromissos e contatos — todos interligados. É um projeto de portfólio
fullstack TypeScript (monorepo).

## Stack

- Monorepo: pnpm workspaces + Turborepo
- Frontend (`apps/web`): React + Vite, TanStack Query, Tailwind CSS
- Backend (`apps/api`): NestJS (um módulo por feature), Swagger em `/api/docs`
- Validação: Zod, com schemas compartilhados em `packages/shared`
- Banco/ORM: PostgreSQL + Prisma (`packages/db`)
- Testes: Vitest
- Qualidade: ESLint, Prettier, Husky, Commitlint, GitHub Actions

## Estrutura

```
apps/web        # React + Vite (frontend)
apps/api        # NestJS (backend)
packages/db     # schema Prisma + cliente
packages/shared # schemas Zod e tipos compartilhados
packages/config # presets de tsconfig
docs/           # documentação (roadmap, arquitetura, features, ADRs)
```

## Comandos

```bash
pnpm dev          # sobe web + api em watch
pnpm build        # build de todos os pacotes
pnpm lint         # ESLint
pnpm typecheck    # checagem de tipos
pnpm test         # testes
pnpm db:generate  # gera o Prisma Client
pnpm db:migrate   # cria/aplica migrations
pnpm db:seed      # popula dados de exemplo
pnpm db:studio    # abre o Prisma Studio
```

O Postgres local sobe com `docker compose up -d` (porta 5432; ambiente via
Colima). O `.env` fica na **raiz** (criado a partir de `.env.example`).

## Padrão por feature (replicar sempre)

Toda feature segue esta sequência, de ponta a ponta:

1. Modelo em `packages/db/prisma/schema.prisma` (migração se necessário).
2. Schemas Zod em `packages/shared/src/schemas/<feature>.ts` (input + DTO de
   resposta), exportados em `packages/shared/src/index.ts`.
3. Módulo NestJS em `apps/api/src/modules/<feature>` (controller + service +
   `*.spec.ts`), registrado em `apps/api/src/app.module.ts`.
4. Feature na web em `apps/web/src/features/<feature>` (api + hooks de TanStack
   Query + componentes).
5. Doc em `docs/features/<feature>.md` (use `docs/features/_template.md`).

Web e API são organizados **por feature** e se espelham.

## Decisões e armadilhas do setup (importante)

- **Prisma + .env:** os scripts de `packages/db` usam `dotenv-cli` para carregar
  `../../.env` (ex.: `dotenv -e ../../.env -- prisma migrate dev`). Sem isso o
  Prisma não acha `DATABASE_URL`. Mantenha esse padrão.
- **Validação só com Zod:** o `ValidationPipe` nativo do Nest foi removido do
  `main.ts`. Use sempre o `ZodValidationPipe` (`apps/api/src/common`) com os
  schemas de `@daily-hub/shared`. Não introduza `class-validator`.
- **Modo single-user (até a Fase 8):** ainda não há autenticação. Os services
  resolvem o usuário atual como o primeiro do banco (criado pelo `seed`). Deixe
  isso comentado e centralizado para facilitar a troca por auth real na Fase 8.
- **Datas de dia:** campos de "dia" (`@db.Date`) trafegam como `YYYY-MM-DD`;
  converta para meia-noite UTC ao gravar e serialize de volta no mesmo formato.
- O web **não** deve importar `@daily-hub/db` (Prisma) — apenas `@daily-hub/shared`.

## Design

Direção visual "luz do dia, foco calmo". Tokens (cores e tipografia) em
`apps/web/src/styles/index.css` e `apps/web/tailwind.config.ts`, documentados em
`docs/design-system.md`. O âmbar (`accent`) é reservado para destacar o dia
atual. Evitar clichês de UI gerada por IA.

## Estado atual

- **Fase 0 (Fundação): concluída.** Ambiente roda do banco à interface; os dois
  ajustes acima (dotenv-cli e Zod) já estão aplicados.
- **Fase 1 (Tarefas): concluída.** Fatia vertical modelo: schemas Zod em
  `shared`, módulo `tasks` na API (com specs), feature `tasks` na web (lista do
  dia, criar/concluir/excluir) e `docs/features/tasks.md`.
- **Fase 2 (Calendário / Agenda): concluída.** Camada de agregação/visualização
  sobre Tarefas: módulo `calendar` na API (`GET /calendar/summary`) e feature
  `calendar` na web (visões mês/semana/dia + navegação). Sem modelo novo no
  banco.
- **Fase 3 (Compromissos / Eventos): concluída.** Módulo `events` na API (CRUD +
  `GET /events?from&to` com recorrência RRULE expandida via lib `rrule`) e
  feature `events` na web, renderizada nas três visões do calendário.
- **Fase 4 (Metas): concluída.** Módulo `goals` na API (CRUD + sub-metas +
  stats de tarefas), vínculo de tarefas (`GET /tasks?goalId` + `goalId: null`
  para desvincular) e feature `goals` na web. O `AppShell` agora navega entre
  Hoje / Agenda / Metas (estado em `App`, sem router).
- **Próxima a construir: Fase 5 — Anotações.**
- Plano completo das 9 fases em `docs/ROADMAP.md`.

## Ao trabalhar

- Rode `pnpm typecheck` e `pnpm test` após mudanças relevantes.
- Ao concluir uma fase, atualize `docs/ROADMAP.md` e crie/atualize
  `docs/features/<feature>.md`.
- Commits em Conventional Commits (`feat`, `fix`, `docs`, `refactor`, `test`,
  `chore`...).
