# Roadmap

Cada fase entrega algo utilizável **e documentado**. A estratégia é construir
uma fatia vertical completa primeiro (Tarefas), fixar o padrão, replicar nas
demais features e, por fim, a camada de integração.

> Legenda: ✅ concluída · 🔜 próxima · ⬜ planejada

## ✅ Fase 0 — Fundação

Monorepo, tooling, Docker + Postgres, Prisma, pacote `shared`, esqueleto de API
(NestJS) e web (Vite + Tailwind + tokens), layout base, healthcheck, CI.
Docs: PROJECT_BRIEF, ARCHITECTURE, data-model, design-system, conventions,
DECISIONS.

**Entregue:** ambiente roda com `pnpm dev`; web mostra status da API.

## ✅ Fase 1 — Tarefas (fatia vertical modelo)

CRUD completo de atividades ponta a ponta, vinculadas a uma data.
Define o padrão (schema → Zod → módulo Nest → hooks na web → testes → doc) que
todas as outras features seguem.

- [x] Schemas Zod de Task em `packages/shared`
- [x] Módulo `tasks` na API (controller + service + testes)
- [x] Feature `tasks` na web (lista do dia, criar/editar/concluir)
- [x] `docs/features/tasks/`

**Entregue:** lista do dia com criar, concluir/reabrir e excluir tarefas.

## ✅ Fase 2 — Calendário / Agenda (o hub)

Visões mês/semana/dia, navegação por data, agregando as tarefas do dia.

- [x] Endpoint de agregação diária na API (`GET /calendar/summary`)
- [x] Feature `calendar` na web (visões mês/semana/dia + navegação por data)
- [x] `docs/features/calendar/`

**Entregue:** hub com visões de mês/semana/dia, navegação e indicadores de
tarefas por dia (o dia atual em destaque).

## ✅ Fase 3 — Compromissos / Eventos

Eventos com horário, local e recorrência, renderizados no calendário.

- [x] Schemas Zod de Event em `packages/shared`
- [x] Módulo `events` na API (CRUD + ocorrências com recorrência expandida)
- [x] Feature `events` na web (criar/editar/excluir + presets de recorrência)
- [x] Integração no calendário (dia, semana e mês)
- [x] `docs/features/events/`

**Entregue:** compromissos com horário/local/recorrência, expandidos em
ocorrências e renderizados nas três visões do calendário.

## ✅ Fase 4 — Metas

Metas com progresso e sub-metas; vincular tarefas a metas.

- [x] Schemas Zod de Goal em `packages/shared`
- [x] Módulo `goals` na API (CRUD + sub-metas + stats de tarefas)
- [x] Vínculo de tarefas (filtro `goalId` + desvincular)
- [x] Feature `goals` na web (progresso, sub-metas, tarefas vinculadas)
- [x] Navegação entre seções (Hoje / Agenda / Metas)
- [x] `docs/features/goals/`

**Entregue:** metas com progresso/horizonte/prazo, sub-metas e tarefas
vinculadas, numa seção própria navegável.

## ✅ Fase 5 — Anotações

Notas em Markdown, anexáveis a dias e a outros itens.

- [x] Schemas Zod de Note em `packages/shared`
- [x] Módulo `notes` na API (CRUD + filtros por dia/fixadas)
- [x] Feature `notes` na web (Markdown, fixar, anexar a dias)
- [x] Integração na visão de dia + seção Notas na navegação
- [x] `docs/features/notes/`

**Entregue:** notas em Markdown, fixáveis e anexáveis a dias (anexo a outros
itens fica para a Fase 7).

## ✅ Fase 6 — Contatos

CRUD de contatos, vinculáveis a eventos e notas.

- [x] Schemas Zod de Contact em `packages/shared`
- [x] Módulo `contacts` na API (CRUD + busca)
- [x] Feature `contacts` na web (busca + grade de cards)
- [x] Seção Contatos na navegação
- [x] `docs/features/contacts/`

**Entregue:** CRUD de contatos com busca. O vínculo a eventos e notas entra na
Fase 7.

## ✅ Fase 7 — Integração (Links + Tags + Busca)

`EntityLink` e `Tagging` na prática: painel de "itens relacionados", tags e
busca global. É aqui que tudo se conecta de fato.

- [x] Schemas Zod de integração em `packages/shared`
- [x] Módulo `integration` na API (resolvedor + busca + tags + links)
- [x] Feature `integration` na web (Inspetor de conexões + busca global)
- [x] Botão "Conexões" nos cards das cinco features
- [x] `docs/features/integration/`

**Entregue:** busca global, tags transversais e vínculos polimórficos entre
itens, acessíveis de qualquer card e da seção Buscar.

> A partir daqui o roadmap foi **revisado** (2026-06-28) para incorporar a visão
> de produto: login, perfil, dashboard do dia, anexos e integrações externas.
> Decisões registradas: auth própria (NestJS + JWT, e-mail/senha, multiusuário
> com cadastro aberto); anexos em storage S3-compatível (MinIO local / R2 em
> prod); integrações começando simples (link de reunião + add-to-Google por URL).
> O polimento visual segue em [`BACKLOG.md`](BACKLOG.md) — os itens P0
> (fontes, ícones, toasts, skeletons) entram junto da Fase 8.

## ✅ Fase 8 — Autenticação + Perfil

Login próprio e fim do modo single-user.

- [x] `User` ganha `passwordHash`, `occupation`, `avatarUrl` (migração)
- [x] `AuthModule`: cadastro/login, hash com argon2, JWT, `JwtAuthGuard` global
      e `@CurrentUser()`
- [x] Trocar o `currentUserId` ("primeiro do banco") pelo usuário autenticado em
      todos os services
- [x] Web: tela de login/cadastro, contexto de auth, token no `lib/api`, app
      protegido
- [x] Tela de **Settings** do perfil (avatar por iniciais/URL, nome, e-mail,
      ocupação)
- [x] Itens **P0** do UX backlog (fontes + ícones + toasts + skeletons)
- [x] `docs/features/auth/`

**Entregue:** autenticação JWT (cadastro/login/logout), dados isolados por
usuário, perfil editável e a primeira camada de identidade visual (fontes,
ícones, toasts e skeletons).

## ✅ Fase 9 — Dashboard do dia

Calendário do mês como visão inicial; clicar num dia abre um dashboard rico.

- [x] Agrega do dia: compromissos, tarefas, notas e **contatos vinculados** às
      atividades (via `EntityLink` da Fase 7) — `GET /calendar/day`
- [x] Criar/editar **inline** qualquer item a partir do dashboard
- [x] Calendário do mês como landing pós-login (navegação unificada; "Hoje" vira
      atalho para o dashboard do dia atual)

**Entregue:** o calendário é a porta de entrada; clicar num dia abre o dashboard
(resumo escaneável + compromissos/tarefas/notas com CRUD inline + "Pessoas do
dia"). O mês indica tarefas, compromissos e notas.

## ✅ Fase 10 — Anexos

Documentos e imagens em notas, compromissos e tarefas.

- [x] MinIO no `docker-compose` (R2/S3 em produção)
- [x] Modelo `Attachment` **polimórfico** (`entityType` + `entityId`)
- [x] Upload por URL assinada (web → storage direto; API registra metadados)
- [x] UI de anexar/visualizar nos itens e no dashboard (seção no Inspetor)

**Entregue:** anexos S3-compatíveis (MinIO) em tarefas, compromissos e notas,
com upload/download por URL assinada e UI no Inspetor. Detalhes em
[`features/attachments/`](features/attachments/README.md).

## ✅ Fase 11 — Integrações externas (leves)

- [x] `Event.meetingUrl` + botão "entrar na reunião"
- [x] Link "adicionar ao Google Agenda" (via URL, sem OAuth)
- [ ] (Futuro) OAuth + sync real do Google Calendar — fase própria, se quisermos

**Entregue:** compromissos com link de reunião ("Entrar") e exportação para o
Google Agenda por URL-template, sem OAuth.

## ✅ Fase 12 — Deploy e demo ao vivo

Deploy (web + api + Postgres + storage gerenciados), seed de demonstração,
screenshots, README e link de demo ao vivo. Inclui o restante do
[`BACKLOG.md`](BACKLOG.md) (P1/P2) e tema claro/escuro.

> **Ordem definida:** o **polimento de UI/UX vem antes do deploy**, para a demo
> ao vivo nascer com a aparência final. A direção de deploy (Railway Hobby +
> Cloudflare R2, web como serviço separado, Dockerfiles) está registrada em
> [`deploy.md`](deploy.md) — planejada, a executar ao final.
