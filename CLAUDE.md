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
- **Autenticação (Fase 8):** há auth JWT (argon2 + passport-jwt) com
  `JwtAuthGuard` global. Rotas exigem token, salvo as marcadas com `@Public()`
  (cadastro, login, health). Os services recebem `userId` como primeiro
  parâmetro, vindo de `@CurrentUser('id')` no controller — não há mais
  resolução "primeiro do banco". Cadastro é aberto (multiusuário).
- **Datas de dia:** campos de "dia" (`@db.Date`) trafegam como `YYYY-MM-DD`;
  converta para meia-noite UTC ao gravar e serialize de volta no mesmo formato.
- O web **não** deve importar `@daily-hub/db` (Prisma) — apenas `@daily-hub/shared`.
- **`@daily-hub/shared` tem build (dist CJS):** o pacote compila para `dist` via
  `tsconfig.build.json` e o `package.json` aponta para lá. Isso é necessário
  porque a API (`nest start`) roda em Node puro e o Node 22+ trataria o source
  `.ts` como ESM (quebrando imports relativos sem extensão). O `turbo.json` tem
  `dependsOn: ["^build"]` em `dev/build/typecheck/test`, então o shared é
  construído antes. Ao editar o shared, rode seu `build` (ou `dev` em watch).

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
- **Fase 5 (Anotações): concluída.** Módulo `notes` na API (CRUD + filtros por
  dia/fixadas) e feature `notes` na web (Markdown via `react-markdown`, fixar,
  anexar a dias). Seção Notas navegável e integrada à visão de dia. Anexo a
  outros itens fica para a Fase 7.
- **Fase 6 (Contatos): concluída.** Módulo `contacts` na API (CRUD + busca) e
  feature `contacts` na web.
- **Fase 7 (Integração): concluída.** Módulo `integration` na API (busca global,
  tags/taggings e links polimórficos), apoiado no `EntityResolverService` que
  traduz refs `{type,id}` em previews. Na web, um Inspetor (drawer) reúne tags e
  itens relacionados de qualquer entidade, aberto pelo botão "Conexões" nos
  cards e pela seção Buscar. É a camada que conecta tudo.
- **Fase 8 (Autenticação + Perfil): concluída.** `AuthModule` na API (cadastro/
  login com argon2 + JWT, `JwtAuthGuard` global, `@Public()`/`@CurrentUser()`);
  fim do single-user (os 9 services recebem `userId` do usuário autenticado).
  Na web: contexto de auth, token Bearer no `lib/api`, telas de login/cadastro,
  app protegido e tela de Settings (avatar por iniciais/URL). Inclui os P0 de UX
  (fontes `@fontsource`, ícones `lucide-react`, toasts `sonner`, skeletons).
- **Fase 9 (Dashboard do dia): concluída.** Navegação unificada: o calendário é
  a landing pós-login (estado de visão/data no `App`, `CalendarPage` controlado);
  a sidebar tem "Hoje" (atalho para o dashboard do dia atual) e "Agenda". Clicar
  num dia abre o dashboard (`DayView`): resumo escaneável + eventos/tarefas/notas
  com CRUD inline + "Pessoas do dia" (contatos vinculados via `GET /calendar/day`,
  agregados por `EntityLink`). O mês indica tarefas, compromissos e notas.
- **Próxima a construir: Fase 10 — Anexos.**
- Plano completo das fases em `docs/ROADMAP.md`.

## Ao trabalhar

- Rode `pnpm typecheck` e `pnpm test` após mudanças relevantes.
- Ao concluir uma fase, atualize `docs/ROADMAP.md` e crie/atualize
  `docs/features/<feature>.md`.
- Commits em Conventional Commits (`feat`, `fix`, `docs`, `refactor`, `test`,
  `chore`...).
