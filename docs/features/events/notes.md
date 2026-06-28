# Compromissos — Notas Técnicas

## Contrato da API

| Método | Rota               | Descrição                                           | Body / Query                     |
| ------ | ------------------ | --------------------------------------------------- | -------------------------------- |
| GET    | `/api/events`      | Ocorrências no intervalo (recorrência expandida)    | Query: `from`, `to` (YYYY-MM-DD) |
| GET    | `/api/events/base` | Compromissos **base** (sem expandir), para o Kanban | —                                |
| GET    | `/api/events/:id`  | Detalha um compromisso base                         | —                                |
| POST   | `/api/events`      | Cria um compromisso                                 | `createEventSchema`              |
| PATCH  | `/api/events/:id`  | Atualiza (parcial) um compromisso                   | `updateEventSchema`              |
| DELETE | `/api/events/:id`  | Remove um compromisso (204)                         | —                                |

`GET /events` retorna `EventOccurrence[]` (eventos recorrentes expandidos, cada
ocorrência referenciando o `eventId` base). `GET /events/base` retorna
`EventDto[]`. Schemas Zod: `packages/shared/src/schemas/events.ts`. Validação via
`ZodValidationPipe`. Lib [`rrule`](https://github.com/jakubroztocil/rrule) para a
expansão.

## Modelo

Entidade `Event` em `packages/db/prisma/schema.prisma`: `title`, `description?`,
`startsAt`, `endsAt`, `allDay`, `category` (`EventCategory`, default `OTHER`),
`status` (`EventStatus`, default `TODO`), `location?`, `meetingUrl?`,
`recurrence?` (RRULE), `reminderMin?`, `createdAt`, `updatedAt`, `userId`. Índice
`@@index([userId, startsAt])`.

O modelo é da Fase 0; a Fase 3 não exigiu migração. A Fase 11 adicionou
`meetingUrl` (migração `add_event_meeting_url`); `category`/`status` vieram com a
frente de UI/status comum.

## UI (web)

`apps/web/src/features/events`:

- `api.ts` — funções HTTP tipadas (`listOccurrences`, `listEventsBase`,
  `getEvent`, `createEvent`, `updateEvent`, `deleteEvent`) sobre `lib/api`.
- `hooks.ts` — `useEventOccurrences` (agrupa por dia local), `useEventsBase`,
  `useEvent` e mutações de criar/atualizar/excluir (TanStack Query).
- `recurrence.ts` — presets (Não se repete / Diariamente / Semanalmente /
  Mensalmente) ⇄ RRULE.
- `categories.ts` — paleta de cor por `EventCategory`.
- `google-calendar.ts` — monta a URL-template "Adicionar ao Google Agenda".
- `components/` — `EventForm` (criar/editar), `EventItem` (ocorrência com
  "Entrar"/Google Agenda/editar/excluir) e `DayEvents` (agenda do dia).

Integração no [Calendário](../calendar/README.md): `DayEvents` na visão de dia,
compromissos por coluna na semana e indicador de quantidade no mês.

## Decisões e armadilhas

- **Recorrência em UTC:** `rrule` expande mantendo o horário (UTC) do `startsAt`;
  determinístico para agenda single-user sem timezone. A web então agrupa pelo
  dia **local**.
- **Ordem de rotas `base` antes de `:id`:** `@Get('base')` é declarado **antes**
  de `@Get(':id')` no controller — caso contrário `base` cairia no parâmetro
  `:id`.
- **Limite de 92 dias:** `MAX_RANGE_DAYS` defende a expansão; intervalos maiores
  respondem `400`.
- **Edição da série:** editar uma ocorrência edita o evento base; sem exceção por
  ocorrência (ver Não Escopo no [README](README.md)).
- **`meetingUrl` e Google Agenda:** integrações leves sem OAuth
  ([D007](../../DECISIONS.md#d007)); a URL do Google é gerada no cliente
  (`google-calendar.ts`), com datas em UTC e fim exclusivo para dia inteiro.
- **Status comum:** rótulos/cores em `lib/status.ts` ([D005](../../DECISIONS.md#d005)).
