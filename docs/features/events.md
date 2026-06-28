# Feature: Compromissos / Eventos

- **Fase:** 3
- **Status:** concluída

## Objetivo

Registrar compromissos com **horário, local e recorrência** e vê-los
**renderizados no calendário**, ao lado das tarefas, em todas as visões.

## Modelo de dados

Entidade `Event` em [`schema.prisma`](../../packages/db/prisma/schema.prisma):

- `title`, `description?`
- `startsAt` / `endsAt` (instantes; `endsAt ≥ startsAt`)
- `allDay`, `location?`
- `meetingUrl?` — link da reunião para "entrar na reunião" (Fase 11).
- `recurrence?` — regra **RRULE** (RFC 5545) sem o prefixo `RRULE:`. Nula =
  evento único.
- `reminderMin?` — minutos antes do início para lembrete.

Modelo da Fase 0; a Fase 3 não exigiu migração. A Fase 11 adicionou `meetingUrl`
(migração `add_event_meeting_url`).

## Contrato da API

| Método | Rota              | Descrição                                        | Body / Query                     |
| ------ | ----------------- | ------------------------------------------------ | -------------------------------- |
| GET    | `/api/events`     | Ocorrências no intervalo (recorrência expandida) | Query: `from`, `to` (YYYY-MM-DD) |
| GET    | `/api/events/:id` | Detalha um compromisso (base)                    | —                                |
| POST   | `/api/events`     | Cria um compromisso                              | `createEventSchema`              |
| PATCH  | `/api/events/:id` | Atualiza um compromisso                          | `updateEventSchema`              |
| DELETE | `/api/events/:id` | Remove um compromisso (204)                      | —                                |

`GET /events` retorna `EventOccurrence[]`: eventos recorrentes são **expandidos**
em ocorrências (cada uma referenciando o `eventId` base) via biblioteca
[`rrule`](https://github.com/jakubroztocil/rrule). Intervalo limitado a 92 dias.
Schemas Zod em [`packages/shared/src/schemas/events.ts`](../../packages/shared/src/schemas/events.ts).

### Decisões e simplificações

- **Recorrência em UTC:** o `rrule` expande mantendo o horário (em UTC) do
  `startsAt`, determinístico para uma agenda single-user sem timezone.
- **Agrupamento por dia local:** a web agrupa as ocorrências pelo dia _local_ de
  início — é como o usuário as vê na grade.
- **Edição da série:** editar uma ocorrência edita o **compromisso base** (a
  série inteira). Exceções por ocorrência ficam para uma fase futura.

## UI (web)

`apps/web/src/features/events`:

- `recurrence.ts` — presets de recorrência (não repete / diário / semanal /
  mensal) ⇄ RRULE.
- `api.ts` / `hooks.ts` — `useEventOccurrences` (agrupa por dia local), `useEvent`
  e mutações de criar/atualizar/excluir.
- `components/` — `EventForm` (criar/editar: data + horários ou dia inteiro,
  local, recorrência, lembrete), `EventItem` (ocorrência com editar/excluir) e
  `DayEvents` (agenda de compromissos de um dia).

Integração no calendário (`features/calendar`):

- **Dia:** `DayEvents` acima das tarefas.
- **Semana:** compromissos do dia em cada coluna.
- **Mês:** indicador de quantidade de compromissos por célula.

### Integrações externas leves (Fase 11)

- **Entrar na reunião:** quando o evento tem `meetingUrl`, o `EventItem` mostra um
  botão "Entrar" que abre o link em nova aba.
- **Adicionar ao Google Agenda:** `google-calendar.ts` monta a URL-template do
  Google Calendar para a ocorrência (datas em UTC; dia inteiro com fim exclusivo;
  `meetingUrl` nos detalhes) — sem OAuth. Sync real do Google fica para o futuro.

## Critérios de aceite

- [x] Criar compromisso com horário, local, recorrência e lembrete.
- [x] Editar e excluir compromisso.
- [x] Eventos recorrentes expandidos em ocorrências no intervalo.
- [x] Compromissos renderizados nas visões de dia, semana e mês.

## Testes

- [x] Unit (Vitest): `events.service.spec.ts` cobre CRUD, serialização ISO,
      `NotFound`, expansão semanal (horário/duração preservados) e limite de
      intervalo.
- [ ] E2E (Playwright): planejado para fase posterior.
