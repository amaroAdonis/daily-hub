# Feature: Anotações

- **Fase:** 5
- **Status:** concluída

## Objetivo

Registrar **notas em Markdown**, fixar as importantes e **anexá-las a um dia**
da agenda — um espaço livre para ideias que conversa com o eixo do dia.

## Modelo de dados

Entidade `Note` em [`schema.prisma`](../../packages/db/prisma/schema.prisma):

- `title`, `content` (Markdown, default `""`)
- `date?` (`@db.Date`) — dia opcional ao qual a nota fica anexada
- `pinned` — fixa a nota no topo

Modelo já existente desde a Fase 0; a Fase 5 não exigiu migração.

> Anexar notas a **outros itens** (não só a dias) depende da camada polimórfica
> `EntityLink`, que é o foco da **Fase 7** (Integração).

## Contrato da API

| Método | Rota             | Descrição                                 | Body / Query              |
| ------ | ---------------- | ----------------------------------------- | ------------------------- |
| GET    | `/api/notes`     | Lista notas (fixadas primeiro, recentes)  | Query: `date?`, `pinned?` |
| GET    | `/api/notes/:id` | Detalha uma nota                          | —                         |
| POST   | `/api/notes`     | Cria uma nota                             | `createNoteSchema`        |
| PATCH  | `/api/notes/:id` | Atualiza uma nota (`date: null` desanexa) | `updateNoteSchema`        |
| DELETE | `/api/notes/:id` | Remove uma nota (204)                     | —                         |

Ordenação: `pinned desc`, depois `updatedAt desc`. Schemas Zod em
[`packages/shared/src/schemas/notes.ts`](../../packages/shared/src/schemas/notes.ts).

## UI (web)

`apps/web/src/features/notes`:

- `api.ts` / `hooks.ts` — `useNotes` e mutações de criar/atualizar/excluir.
- `components/` — `Markdown` (render seguro via `react-markdown`, estilizado com
  Tailwind), `NoteForm` (título + conteúdo Markdown + dia + fixar), `NoteCard`
  (render, fixar/desafixar, editar, excluir), `NotesPage` (filtro todas/fixadas
  - nova nota) e `DayNotes` (notas do dia, reaproveitando `NoteCard`).

Integração: a visão de **dia** mostra as notas anexadas àquele dia, ao lado de
compromissos e tarefas. A seção **Notas** entrou na navegação do `AppShell`.

## Critérios de aceite

- [x] Criar, editar e excluir notas em Markdown.
- [x] Fixar/desafixar notas (fixadas aparecem primeiro).
- [x] Anexar uma nota a um dia e vê-la na visão de dia.
- [x] Render seguro do Markdown.

## Testes

- [x] Unit (Vitest): `notes.service.spec.ts` cobre ordenação (fixadas primeiro),
      filtro por dia, criação anexada a um dia, desanexar (`date: null`) e
      `NotFound`.
- [ ] E2E (Playwright): planejado para fase posterior.
