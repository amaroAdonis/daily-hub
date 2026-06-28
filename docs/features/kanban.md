# Feature: Kanban

- **Fase:** pós-Fase 11 (frente de evolução de UI/produto)
- **Status:** concluída

## Objetivo

Um quadro único para controlar o **status** de **tarefas, compromissos e metas**
de uma vez — independente de dia/mês —, arrastando cartões entre **A fazer →
Em andamento → Concluído**.

## Status comum

O eixo `TODO` / `DOING` / `DONE` é compartilhado pelos três (`lib/status.ts`):

- **Tarefas** e **compromissos** já usam esse status.
- **Metas** foram **unificadas** ao mesmo eixo (migração `unify_goal_status`:
  `ACTIVE→DOING`, `ACHIEVED→DONE`); `ARCHIVED` permanece como estado à parte e
  fica **fora** do quadro.

## Modelo de dados / API

Sem modelo novo. O quadro agrega três fontes:

- `GET /tasks` — todas as tarefas.
- `GET /events/base` — **compromissos base** (sem expandir recorrência); criado
  para o quadro (a listagem por intervalo continua sendo de ocorrências).
- `GET /goals` — todas as metas (não arquivadas entram no quadro).

Mover um cartão dispara o `PATCH` da entidade correspondente
(`/tasks/:id`, `/events/:id`, `/goals/:id`) com o novo `status`.

## UI (web)

`apps/web/src/features/kanban`:

- `board.ts` — normaliza os três tipos em `BoardItem` (status comum); oculta metas
  arquivadas e concluídos com mais de **30 dias**.
- `components/kanban-card.tsx` — cartão arrastável (`@dnd-kit`) com ícone/cor por
  tipo: tarefa (prioridade), compromisso (categoria + horário), meta (progresso).
- `components/kanban-page.tsx` — três colunas (áreas de soltar), filtro por tipo
  (Tudo / Tarefas / Compromissos / Metas) e **move otimista** (o cartão troca de
  coluna na hora; reverte/limpa quando a mutação retorna) + toast.

Nova seção **Quadro** na navegação (`AppShell`/`App`).

## Critérios de aceite

- [x] Ver tarefas, compromissos e metas no mesmo quadro, por status.
- [x] Arrastar entre colunas muda e persiste o status (recarregar confirma).
- [x] Filtrar por tipo.
- [x] Coluna Concluído só com itens recentes; metas arquivadas fora.

## Testes

- [x] Unit (Vitest): `events.service.spec.ts` cobre `listBase`; specs de
      tasks/goals/events seguem verdes com o status unificado.
- [ ] E2E (Playwright): planejado para fase posterior.
