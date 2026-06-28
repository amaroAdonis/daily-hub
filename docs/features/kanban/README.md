# Kanban

- Prioridade: P1
- Status: Concluída
- Última atualização: 2026-06-28

## Visão Geral

Quadro único para controlar o **status** de **tarefas, compromissos e metas** de
uma só vez — independente de dia/mês. Os três tipos são normalizados num item
comum (`BoardItem`) e distribuídos em três colunas (**A fazer → Em andamento →
Concluído**). Arrastar um cartão entre colunas dispara a mutation de status da
entidade certa, com atualização otimista.

É a camada que torna visível o **status comum** ([D005](../../DECISIONS.md#d005)):
sem ele, cada tipo teria um eixo de progresso próprio e o quadro não existiria.

## Conceitos-Chave

- **Kanban** — quadro único de tarefas, compromissos e metas por status. Ver
  [Glossário](../../GLOSSARY.md#kanban).
- **BoardItem** — item normalizado do quadro (`type` TASK/EVENT/GOAL + título +
  status + metadados). Ver [Glossário](../../GLOSSARY.md#board-item).
- **Status** — eixo comum A fazer/Em andamento/Concluído. Ver
  [Glossário](../../GLOSSARY.md#status).

## Requisitos (REQ-*)

### Normalização

- `REQ-KANBAN-001` Os três tipos (tarefa, compromisso, meta) são normalizados num
  `BoardItem` comum (`key`, `type`, `id`, `title`, `status` + a entidade
  original).
- `REQ-KANBAN-002` A `key` do cartão é `TIPO:id` (ex.: `TASK:abc`), única no
  quadro e usada pelo drag-and-drop.

### Colunas e status

- `REQ-KANBAN-003` O quadro tem exatamente **3 colunas**, uma por estágio do
  status comum: `TODO`, `DOING`, `DONE` ([D005](../../DECISIONS.md#d005)).
- `REQ-KANBAN-004` Cada coluna mostra a contagem de cartões.

### Drag-and-drop

- `REQ-KANBAN-005` Arrastar um cartão para outra coluna **persiste** o novo
  status na entidade de origem (mutation por tipo).
- `REQ-KANBAN-006` O movimento é **otimista**: o cartão troca de coluna na hora;
  o estado provisório é limpo quando a mutation retorna (`onSettled`).
- `REQ-KANBAN-007` Soltar na mesma coluna (ou fora de uma coluna) não dispara
  mutation.

### Identidade visual

- `REQ-KANBAN-008` Cada tipo tem cor e ícone próprios (Tarefa teal, Compromisso
  índigo, Meta âmbar), para distinção de relance.
- `REQ-KANBAN-009` O cartão exibe um metadado por tipo: prioridade (tarefa),
  data/hora ou "Dia inteiro" (compromisso), progresso (meta).

### Filtro

- `REQ-KANBAN-010` Filtro por tipo: **Tudo / Tarefas / Compromissos / Metas**.

### Recorte de itens

- `REQ-KANBAN-011` Metas com status `ARCHIVED` ficam **fora** do quadro.
- `REQ-KANBAN-012` Itens concluídos (`DONE`) só aparecem se atualizados nos
  últimos ~**30 dias** (`RECENT_DONE_DAYS`), para o quadro não inchar.

## Critérios de Aceite (AC-*)

### AC-KANBAN-001 - Ver os três tipos por status (REQ-KANBAN-001, REQ-KANBAN-003)

- **Given** tarefas, compromissos e metas com status variados
- **When** abro o quadro
- **Then** vejo os três tipos distribuídos nas colunas A fazer / Em andamento /
  Concluído, cada um com cor própria

### AC-KANBAN-002 - Arrastar persiste o status (REQ-KANBAN-005, REQ-KANBAN-006)

- **Given** um cartão de tarefa em "A fazer"
- **When** arrasto para "Concluído"
- **Then** o cartão muda de coluna imediatamente
- **And** a entidade recebe `PATCH status=DONE` e, ao recarregar, permanece em
  "Concluído"

### AC-KANBAN-003 - Mutation pela entidade certa (REQ-KANBAN-001, REQ-KANBAN-005)

- **Given** cartões de tipos diferentes
- **When** movo um cartão de compromisso
- **Then** a chamada é `PATCH /events/:id` (e não `/tasks` nem `/goals`)

### AC-KANBAN-004 - Soltar na mesma coluna não muda nada (REQ-KANBAN-007)

- **Given** um cartão em "Em andamento"
- **When** solto-o na mesma coluna
- **Then** nenhuma mutation é disparada

### AC-KANBAN-005 - Filtro por tipo (REQ-KANBAN-010)

- **Given** o quadro com os três tipos
- **When** seleciono o filtro "Metas"
- **Then** vejo apenas cartões de meta nas três colunas

### AC-KANBAN-006 - Metas arquivadas e concluídos antigos fora (REQ-KANBAN-011, REQ-KANBAN-012)

- **Given** uma meta `ARCHIVED` e uma tarefa `DONE` atualizada há mais de 30 dias
- **When** abro o quadro
- **Then** nenhum dos dois aparece

## Dependências

### Features relacionadas

- [Tarefas](../tasks/README.md) — fonte `TASK`; usa o `status` comum.
- [Compromissos](../events/README.md) — fonte `EVENT`; expõe `GET /events/base`.
- [Metas](../goals/README.md) — fonte `GOAL`; `ARCHIVED` fica fora do quadro.
- [Integração](../integration/README.md) — botão "Conexões" no cartão (Inspetor).

### Serviços e contratos compartilhados

- `GET /api/tasks`, `GET /api/events/base`, `GET /api/goals` (leitura) e
  `PATCH /api/{tasks,events,goals}/:id` (mover) — ver [notes](notes.md).
- Helper de status `apps/web/src/lib/status.ts`.

## Cobertura de Testes

- `apps/api/src/modules/events/events.service.spec.ts` — cobre `listBase`
  (compromissos base, sem expandir recorrência), que alimenta o quadro.
- Specs de tasks/goals/events seguem verdes com o status unificado.
- (Pendente) E2E (Playwright) do drag-and-drop — fase posterior.

## Rastreabilidade

- Decisões: [D005](../../DECISIONS.md#d005) (status comum),
  [D004](../../DECISIONS.md#d004) (isolamento por usuário).
- Glossário: [Kanban](../../GLOSSARY.md#kanban),
  [BoardItem](../../GLOSSARY.md#board-item), [Status](../../GLOSSARY.md#status).
- Modelo de dados: [`../../data-model.md`](../../data-model.md).

## Não Escopo

- Reordenação dentro da coluna (só o status muda, não a ordem).
- Coluna ou tratamento de metas `ARCHIVED` no quadro.
- Sync persistido do estado otimista entre abas / em tempo real.

## Questões em Aberto

1. A janela de "concluídos recentes" (30 dias) deveria ser configurável pelo
   usuário?
2. Vale uma coluna/filtro dedicado para metas arquivadas, fora do eixo de
   progresso?
