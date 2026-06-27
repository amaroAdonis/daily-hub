# Roadmap

Cada fase entrega algo utilizável **e documentado**. A estratégia é construir
uma fatia vertical completa primeiro (Tarefas), fixar o padrão, replicar nas
demais features e, por fim, a camada de integração.

> Legenda: ✅ concluída · 🔜 próxima · ⬜ planejada

## ✅ Fase 0 — Fundação

Monorepo, tooling, Docker + Postgres, Prisma, pacote `shared`, esqueleto de API
(NestJS) e web (Vite + Tailwind + tokens), layout base, healthcheck, CI.
Docs: README, ARCHITECTURE, data-model, design-system, conventions, ADRs.

**Entregue:** ambiente roda com `pnpm dev`; web mostra status da API.

## ✅ Fase 1 — Tarefas (fatia vertical modelo)

CRUD completo de atividades ponta a ponta, vinculadas a uma data.
Define o padrão (schema → Zod → módulo Nest → hooks na web → testes → doc) que
todas as outras features seguem.

- [x] Schemas Zod de Task em `packages/shared`
- [x] Módulo `tasks` na API (controller + service + testes)
- [x] Feature `tasks` na web (lista do dia, criar/editar/concluir)
- [x] `docs/features/tasks.md`

**Entregue:** lista do dia com criar, concluir/reabrir e excluir tarefas.

## ✅ Fase 2 — Calendário / Agenda (o hub)

Visões mês/semana/dia, navegação por data, agregando as tarefas do dia.

- [x] Endpoint de agregação diária na API (`GET /calendar/summary`)
- [x] Feature `calendar` na web (visões mês/semana/dia + navegação por data)
- [x] `docs/features/calendar.md`

**Entregue:** hub com visões de mês/semana/dia, navegação e indicadores de
tarefas por dia (o dia atual em destaque).

## ✅ Fase 3 — Compromissos / Eventos

Eventos com horário, local e recorrência, renderizados no calendário.

- [x] Schemas Zod de Event em `packages/shared`
- [x] Módulo `events` na API (CRUD + ocorrências com recorrência expandida)
- [x] Feature `events` na web (criar/editar/excluir + presets de recorrência)
- [x] Integração no calendário (dia, semana e mês)
- [x] `docs/features/events.md`

**Entregue:** compromissos com horário/local/recorrência, expandidos em
ocorrências e renderizados nas três visões do calendário.

## ✅ Fase 4 — Metas

Metas com progresso e sub-metas; vincular tarefas a metas.

- [x] Schemas Zod de Goal em `packages/shared`
- [x] Módulo `goals` na API (CRUD + sub-metas + stats de tarefas)
- [x] Vínculo de tarefas (filtro `goalId` + desvincular)
- [x] Feature `goals` na web (progresso, sub-metas, tarefas vinculadas)
- [x] Navegação entre seções (Hoje / Agenda / Metas)
- [x] `docs/features/goals.md`

**Entregue:** metas com progresso/horizonte/prazo, sub-metas e tarefas
vinculadas, numa seção própria navegável.

## ✅ Fase 5 — Anotações

Notas em Markdown, anexáveis a dias e a outros itens.

- [x] Schemas Zod de Note em `packages/shared`
- [x] Módulo `notes` na API (CRUD + filtros por dia/fixadas)
- [x] Feature `notes` na web (Markdown, fixar, anexar a dias)
- [x] Integração na visão de dia + seção Notas na navegação
- [x] `docs/features/notes.md`

**Entregue:** notas em Markdown, fixáveis e anexáveis a dias (anexo a outros
itens fica para a Fase 7).

## ✅ Fase 6 — Contatos

CRUD de contatos, vinculáveis a eventos e notas.

- [x] Schemas Zod de Contact em `packages/shared`
- [x] Módulo `contacts` na API (CRUD + busca)
- [x] Feature `contacts` na web (busca + grade de cards)
- [x] Seção Contatos na navegação
- [x] `docs/features/contacts.md`

**Entregue:** CRUD de contatos com busca. O vínculo a eventos e notas entra na
Fase 7.

## 🔜 Fase 7 — Integração (Links + Tags + Busca)

`EntityLink` e `Tagging` na prática: painel de "itens relacionados", tags e
busca global. É aqui que tudo se conecta de fato.

## ⬜ Fase 8 — Autenticação, dashboard e polish

Auth, página inicial agregando o dia, lembretes, tema claro/escuro.

## ⬜ Fase 9 — Deploy e vitrine

Deploy (web + api + Postgres gerenciado), seed de demonstração, screenshots,
README voltado a recrutadores e link de demo ao vivo.
