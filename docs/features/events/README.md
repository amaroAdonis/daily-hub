# Compromissos / Eventos

- Prioridade: P0
- Status: Concluída
- Última atualização: 2026-06-28

## Visão Geral

Registra **compromissos** com horário, local e recorrência opcional, e os
renderiza no calendário ao lado das tarefas, em todas as visões (dia, semana,
mês). Eventos recorrentes são descritos por uma regra **RRULE** e a API os
**expande em ocorrências** dentro do intervalo consultado.

A feature também carrega as integrações externas leves (sem OAuth): "Entrar na
reunião" a partir do `meetingUrl` e "Adicionar ao Google Agenda" via URL-template
montada no cliente.

## Conceitos-Chave

- **Compromisso** — evento com horário, local e recorrência opcional. Ver
  [Glossário](../../GLOSSARY.md#compromisso).
- **Ocorrência** — instância de um compromisso num intervalo; recorrentes são
  expandidos em várias, cada uma referenciando o `eventId` base. Ver
  [Glossário](../../GLOSSARY.md#ocorrencia).
- **RRULE** — regra de recorrência (RFC 5545) guardada sem o prefixo `RRULE:`.
  Ver [Glossário](../../GLOSSARY.md#rrule).
- **Categoria de evento** — classificação com paleta de cor própria. Ver
  [Glossário](../../GLOSSARY.md#categoria-de-evento).
- **Status** — eixo comum A fazer/Em andamento/Concluído. Ver
  [Glossário](../../GLOSSARY.md#status).

## Requisitos (REQ-*)

### Modelo

- `REQ-EVENTS-001` Compromisso tem `title` obrigatório e `description` opcional.
- `REQ-EVENTS-002` Compromisso tem `startsAt` e `endsAt` (instantes), com
  `endsAt ≥ startsAt`.
- `REQ-EVENTS-003` Compromisso tem `allDay` (dia inteiro) e `location` opcional.
- `REQ-EVENTS-004` Compromisso tem `category` ([Categoria de evento](../../GLOSSARY.md#categoria-de-evento),
  default `OTHER`) e `status` ([Status](../../GLOSSARY.md#status), default `TODO`).
- `REQ-EVENTS-005` Compromisso tem `reminderMin` opcional (minutos antes do
  início, 0..40320).

### Recorrência

- `REQ-EVENTS-010` `recurrence` opcional guarda uma [RRULE](../../GLOSSARY.md#rrule)
  (RFC 5545) sem o prefixo `RRULE:`; nula = evento único.
- `REQ-EVENTS-011` A API expande eventos recorrentes em [ocorrências](../../GLOSSARY.md#ocorrencia)
  dentro do intervalo, preservando horário e duração do evento base.
- `REQ-EVENTS-012` A expansão é feita em **UTC** (determinística para agenda sem
  timezone) e cada ocorrência referencia o `eventId` base.
- `REQ-EVENTS-013` O intervalo consultável de ocorrências é limitado a **92
  dias** (`400` acima disso).

### Categorias

- `REQ-EVENTS-020` `category` assume um dos valores `WORK`/`PERSONAL`/`HEALTH`/
  `SOCIAL`/`STUDY`/`OTHER`, cada um com paleta de cor própria na web.

### Integrações leves

- `REQ-EVENTS-030` Compromisso tem `meetingUrl` opcional; quando presente, a UI
  oferece "Entrar na reunião" ([D007](../../DECISIONS.md#d007)).
- `REQ-EVENTS-031` A web monta uma URL-template do Google Calendar para uma
  ocorrência ("Adicionar ao Google Agenda"), sem OAuth ([D007](../../DECISIONS.md#d007)).

### Operações

- `REQ-EVENTS-040` Listar ocorrências de um intervalo (`GET /events?from&to`,
  recorrência expandida).
- `REQ-EVENTS-041` Listar compromissos **base** (sem expandir recorrência), para
  o [Kanban](../kanban/README.md) (`GET /events/base`).
- `REQ-EVENTS-042` Detalhar um compromisso base por `id`.
- `REQ-EVENTS-043` Criar um compromisso.
- `REQ-EVENTS-044` Atualizar parcialmente um compromisso; editar uma ocorrência
  edita o compromisso **base** (a série inteira).
- `REQ-EVENTS-045` Excluir um compromisso (204).

### Isolamento

- `REQ-EVENTS-050` Operações restritas aos compromissos do usuário autenticado
  ([D004](../../DECISIONS.md#d004)).

## Critérios de Aceite (AC-*)

### AC-EVENTS-001 - Criar compromisso (REQ-EVENTS-001, REQ-EVENTS-002, REQ-EVENTS-043)

- **Given** título, `startsAt` e `endsAt` válidos (`endsAt ≥ startsAt`)
- **When** envio `POST /events`
- **Then** o compromisso é criado com `category=OTHER` e `status=TODO` por
  padrão e retornado com seu `id`

### AC-EVENTS-002 - Rejeitar fim antes do início (REQ-EVENTS-002)

- **Given** um payload com `endsAt` anterior a `startsAt`
- **When** envio `POST /events`
- **Then** recebo `400` com erro em `endsAt`

### AC-EVENTS-003 - Expandir evento recorrente (REQ-EVENTS-010, REQ-EVENTS-011, REQ-EVENTS-012)

- **Given** um evento com `recurrence=FREQ=WEEKLY` e um intervalo `from`..`to`
- **When** chamo `GET /events?from&to`
- **Then** recebo uma ocorrência por semana dentro do intervalo, cada uma com o
  mesmo horário/duração e referenciando o `eventId` base

### AC-EVENTS-004 - Limite de intervalo (REQ-EVENTS-013)

- **Given** um intervalo maior que 92 dias
- **When** chamo `GET /events?from&to`
- **Then** recebo `400` (intervalo muito grande)

### AC-EVENTS-005 - Listar base para o Kanban (REQ-EVENTS-041)

- **Given** eventos únicos e recorrentes do usuário
- **When** chamo `GET /events/base`
- **Then** recebo os compromissos base (sem expandir recorrência), ordenados por
  `startsAt` desc

### AC-EVENTS-006 - Editar série pela ocorrência (REQ-EVENTS-044)

- **Given** uma ocorrência de um evento recorrente
- **When** atualizo o compromisso pelo `eventId` (`PATCH /events/:id`)
- **Then** a alteração vale para toda a série

### AC-EVENTS-007 - Excluir (REQ-EVENTS-045)

- **Given** um compromisso existente
- **When** envio `DELETE /events/:id`
- **Then** recebo `204` e ele some das listagens

### AC-EVENTS-008 - Isolamento por usuário (REQ-EVENTS-050)

- **Given** um compromisso de outro usuário
- **When** tento acessá-lo pelo `id`
- **Then** recebo `404` (não vaza existência)

## Dependências

### Features relacionadas

- [Calendário](../calendar/README.md) — renderiza as ocorrências nas visões
  dia/semana/mês e agrega o dia.
- [Contatos](../contacts/README.md) — pessoas vinculáveis a um compromisso.
- [Kanban](../kanban/README.md) — consome `GET /events/base` e o `status` comum.

### Serviços e contratos compartilhados

- `GET /events?from&to`, `GET /events/base`, `GET/POST/PATCH/DELETE /api/events`
  — ver [notes](notes.md).
- Schemas Zod `packages/shared/src/schemas/events.ts`.
- Biblioteca [`rrule`](https://github.com/jakubroztocil/rrule) para expansão.

## Cobertura de Testes

- `apps/api/src/modules/events/events.service.spec.ts` — criação com conversão
  ISO→Date, serialização ISO no DTO, persistência de `meetingUrl`, `NotFound` em
  remoção, listagem base, ocorrência única, expansão semanal (horário/duração
  preservados) e limite de intervalo.
- (Pendente) E2E (Playwright) — fase posterior.

## Rastreabilidade

- Decisões: [D004](../../DECISIONS.md#d004) (auth), [D005](../../DECISIONS.md#d005)
  (status comum), [D007](../../DECISIONS.md#d007) (integrações leves sem OAuth).
- Glossário: [Compromisso](../../GLOSSARY.md#compromisso),
  [Ocorrência](../../GLOSSARY.md#ocorrencia), [RRULE](../../GLOSSARY.md#rrule),
  [Categoria de evento](../../GLOSSARY.md#categoria-de-evento),
  [Status](../../GLOSSARY.md#status), [Feriado](../../GLOSSARY.md#feriado).
- Modelo de dados: [`../../data-model.md`](../../data-model.md).

## Não Escopo

- **Exceções por ocorrência** (editar/cancelar uma única instância da série) —
  editar uma ocorrência edita o evento base.
- **Sync real com o Google** (OAuth, push) — apenas URL-template no cliente
  ([D007](../../DECISIONS.md#d007)).
- Suporte a timezone por evento — expansão é determinística em UTC.

## Questões em Aberto

1. Exceções por ocorrência (RDATE/EXDATE) entram em qual frente?
2. Lembretes (`reminderMin`) hoje são metadados; quem dispara a notificação?
