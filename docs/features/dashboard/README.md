# Dashboard do dia

- Prioridade: P0
- Status: Concluída
- Última atualização: 2026-06-28

## Visão Geral

Faz o **dia** ser a experiência central do produto. O calendário do mês é a
landing pós-login; ao clicar num dia, abre um **dashboard rico** que reúne tudo
daquele dia num só lugar — compromissos, tarefas, notas, metas em foco e as
**pessoas** (contatos) vinculadas às atividades.

Não é uma feature com modelo próprio: é uma **camada de composição** sobre as
features existentes. As atividades são apresentadas em **agenda por períodos**
(Manhã / Tarde / Noite) e cada zona reaproveita o CRUD inline da sua feature
de origem. A única agregação nova no servidor é o detalhe do dia
(`GET /calendar/day`), que resolve os contatos vinculados às atividades do dia.

O dashboard vive na feature `calendar` na web
(`apps/web/src/features/calendar/components/day-view.tsx`) e é servido pelo
`CalendarModule` na API.

## Conceitos-Chave

- **Dia** — unidade central; o dashboard agrega tudo cujo campo temporal cai no
  dia. Ver [Glossário](../../GLOSSARY.md#dia).
- **Resumo / summary** — agregação por dia (contagens de tarefas, eventos,
  notas). Ver [Glossário](../../GLOSSARY.md#resumo-do-dia).
- **Inspetor** — drawer de conexões aberto pelo botão "Conexões" em cada item.
  Ver [Glossário](../../GLOSSARY.md#inspetor).

## Requisitos (REQ-*)

### Agregação do dia

- `REQ-DASHBOARD-001` O dashboard de um dia reúne as **atividades** daquele dia:
  compromissos, tarefas e notas.
- `REQ-DASHBOARD-002` Exibe uma barra de **resumo** escaneável no topo
  (contagem de compromissos, tarefas concluídas/totais, notas e metas ativas).
- `REQ-DASHBOARD-003` Eventos recorrentes entram no dia quando têm **ocorrência**
  nele (recorrência RRULE expandida).
- `REQ-DASHBOARD-004` O dia atual é destacado (marcador "hoje").

### Agenda por períodos

- `REQ-DASHBOARD-010` Os compromissos são agrupados por **período**: Dia inteiro,
  Manhã, Tarde e Noite.
- `REQ-DASHBOARD-011` Períodos sem nenhum item não aparecem.

### CRUD inline

- `REQ-DASHBOARD-020` Criar, editar e excluir tarefas, compromissos e notas
  **inline** no dashboard, reusando o CRUD de cada feature.
- `REQ-DASHBOARD-021` Toda alteração reflete na barra de resumo (queries
  compartilhadas via cache).

### Metas em foco

- `REQ-DASHBOARD-030` Exibe as **metas ativas** (`TODO`/`DOING`), com prazo mais
  próximo primeiro, com progresso compacto.

### Contatos vinculados

- `REQ-DASHBOARD-040` "Pessoas do dia" lista os **contatos vinculados** às
  atividades do dia, via `EntityLink` ([D003](../../DECISIONS.md#d003)).
- `REQ-DASHBOARD-041` A lista de pessoas some quando não há nenhum contato
  vinculado, para não poluir o dashboard.

### Feriados

- `REQ-DASHBOARD-050` Exibe os **feriados** nacionais (BR/IE) do dia, quando há.

### Navegação e isolamento

- `REQ-DASHBOARD-060` O calendário do mês é a **landing** pós-login; a sidebar
  oferece "Hoje" (atalho para o dashboard do dia atual) e "Agenda" (mês).
- `REQ-DASHBOARD-061` Todas as agregações são restritas ao usuário autenticado
  ([D004](../../DECISIONS.md#d004)).

## Critérios de Aceite (AC-*)

### AC-DASHBOARD-001 - Abrir o dashboard de um dia (REQ-DASHBOARD-001, REQ-DASHBOARD-060)

- **Given** o calendário do mês aberto como landing
- **When** clico numa célula de dia
- **Then** o dashboard daquele dia abre com resumo, atividades e pessoas

### AC-DASHBOARD-002 - Resumo do dia (REQ-DASHBOARD-002, REQ-DASHBOARD-021)

- **Given** um dia com compromissos, tarefas e notas
- **When** o dashboard renderiza
- **Then** a barra de resumo mostra as contagens de cada tipo
- **And** ao criar/concluir um item inline, as contagens atualizam

### AC-DASHBOARD-003 - Agenda por períodos (REQ-DASHBOARD-010, REQ-DASHBOARD-011)

- **Given** compromissos em horários distintos do dia
- **When** vejo a zona de compromissos
- **Then** estão agrupados em Dia inteiro / Manhã / Tarde / Noite
- **And** períodos vazios não aparecem

### AC-DASHBOARD-004 - Ocorrência recorrente no dia (REQ-DASHBOARD-003)

- **Given** um compromisso recorrente cuja regra cai no dia
- **When** abro o dashboard desse dia
- **Then** a ocorrência aparece, ainda que o evento base seja de outra data

### AC-DASHBOARD-005 - Pessoas do dia (REQ-DASHBOARD-040, REQ-DASHBOARD-041)

- **Given** um contato vinculado (via `EntityLink`) a uma tarefa do dia
- **When** chamo `GET /calendar/day?date=YYYY-MM-DD`
- **Then** o contato vem na lista (deduplicado entre atividades)
- **And** um dia sem atividades/vínculos retorna `contacts: []`

### AC-DASHBOARD-006 - Atalho "Hoje" (REQ-DASHBOARD-060)

- **Given** o app em qualquer visão
- **When** clico em "Hoje" na sidebar
- **Then** abre o dashboard do dia atual, com o marcador "hoje"

### AC-DASHBOARD-007 - Isolamento por usuário (REQ-DASHBOARD-061)

- **Given** atividades e contatos de outro usuário no mesmo dia
- **When** chamo `GET /calendar/day`
- **Then** recebo apenas os dados do usuário autenticado

## Dependências

### Features relacionadas

- [Tarefas](../tasks/README.md) — zona de tarefas e contagem do resumo.
- [Compromissos](../events/README.md) — agenda por períodos e ocorrências.
- [Anotações](../notes/README.md) — zona de notas do dia.
- [Metas](../goals/README.md) — "Metas em foco".
- [Contatos](../contacts/README.md) — "Pessoas do dia".
- [Integração](../integration/README.md) — `EntityLink` e Inspetor (Conexões).
- [Calendário](../calendar/README.md) — hospeda o dashboard e o `summary`.

### Serviços e contratos compartilhados

- `GET /api/calendar/day?date=` — detalhe do dia (contatos vinculados). Ver
  [notes](notes.md).
- `GET /api/calendar/summary` — agregação de tarefas para o mês (Fase 2).
- Schemas Zod `packages/shared/src/schemas/calendar.ts` (`dayDetailDto`,
  `dayDetailQuery`).

## Cobertura de Testes

- `apps/api/src/modules/calendar/calendar.service.spec.ts` — cobre `dayContacts`:
  contato vinculado a uma tarefa do dia, dedup entre atividades e dia sem
  atividades.
- Smoke HTTP: `GET /api/calendar/day?date=<hoje>` retorna o contato do seed
  vinculado à nota do dia.
- (Pendente) E2E (Playwright) — fase posterior.

## Rastreabilidade

- Decisões: [D003](../../DECISIONS.md#d003) (links/tags polimórficos —
  contatos vinculados), [D004](../../DECISIONS.md#d004) (auth).
- Glossário: [Dia](../../GLOSSARY.md#dia),
  [Resumo](../../GLOSSARY.md#resumo-do-dia),
  [Inspetor](../../GLOSSARY.md#inspetor).
- Modelo de dados: [`../../data-model.md`](../../data-model.md).
- Roadmap: Fase 9 (Dashboard do dia).

## Não Escopo

- **Marcador de "agora"** na agenda por períodos: direção visual prevista em
  `docs/design-system/redesign.md`, ainda não implementada.
- Modelo de dados próprio: o dashboard não cria entidade — compõe as existentes.
- "Pessoas do dia" agrega só **contatos** (não outros tipos de vínculo).

## Questões em Aberto {#questoes-em-aberto}

1. O `GET /calendar/day` deve passar a agregar também eventos/tarefas/notas
   (hoje compostos no cliente) para reduzir round-trips?
2. O marcador de "agora" entra como parte do redesenho de UI ou como fase
   própria?
