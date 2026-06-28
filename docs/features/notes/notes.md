# Anotações — Notas Técnicas

## Contrato da API

| Método | Rota             | Descrição                                           | Body / Query                                            |
| ------ | ---------------- | --------------------------------------------------- | ------------------------------------------------------- |
| GET    | `/api/notes`     | Lista notas (fixadas primeiro, depois recentes)     | Query: `date?` (YYYY-MM-DD), `pinned?` (`true`/`false`) |
| GET    | `/api/notes/:id` | Detalha uma nota                                    | —                                                       |
| POST   | `/api/notes`     | Cria uma nota                                       | `createNoteSchema`                                      |
| PATCH  | `/api/notes/:id` | Atualiza (parcial) uma nota (`date: null` desanexa) | `updateNoteSchema`                                      |
| DELETE | `/api/notes/:id` | Remove uma nota (204)                               | —                                                       |

Ordenação: `pinned` desc, depois `updatedAt` desc. Schemas Zod:
`packages/shared/src/schemas/notes.ts`. Validação via `ZodValidationPipe`.

## Modelo

Entidade `Note` em `packages/db/prisma/schema.prisma`:

- `title` — obrigatório (1–200 caracteres).
- `content` — Markdown (até 50.000 caracteres; default vazio).
- `date?` — (`@db.Date`) dia opcional ao qual a nota fica anexada.
- `pinned` — fixa a nota no topo.

O modelo já existia desde a Fase 0; a Fase 5 não exigiu migração.

## UI (web)

`apps/web/src/features/notes`:

- `api.ts` — funções HTTP tipadas sobre `lib/api`.
- `hooks.ts` — `useNotes` e mutações de criar/atualizar/excluir (TanStack
  Query, invalidando o cache de `notes`).
- `components/`:
  - `Markdown` (`NoteMarkdown`) — render via `react-markdown`, com componentes
    estilizados em Tailwind (alinhados aos tokens de design).
  - `NoteForm` — título + conteúdo Markdown + dia + fixar.
  - `NoteCard` — render, fixar/desafixar (estrela), editar, excluir e botão
    "Conexões" (Inspetor da Integração).
  - `NotesPage` — filtro todas/fixadas + nova nota.
  - `DayNotes` — notas do dia, reaproveitando `NoteCard` (`hideDate`).

A visão de **dia** mostra as notas anexadas àquele dia, ao lado de compromissos
e tarefas. A seção **Notas** está na navegação do `AppShell`.

## Decisões e armadilhas

- **Datas em UTC:** `date` trafega como `YYYY-MM-DD` e grava à meia-noite UTC;
  serializa de volta no mesmo formato. `date: null` no PATCH desanexa.
- **Render seguro do Markdown:** `react-markdown` ignora HTML embutido por
  padrão (sem `rehype-raw`), evitando injeção via conteúdo da nota. Não habilitar
  HTML cru sem sanitização.
- **Anexo só a dias no modelo:** o campo `date` liga a nota a um **dia**. Anexar
  a outros itens (tarefas, metas, eventos, contatos) é responsabilidade da
  camada polimórfica da [Integração](../integration/README.md) (Fase 7), via
  `EntityLink`/tags — não há `noteId`/FKs espalhados.
- **Isolamento por usuário:** todas as queries filtram por `userId` do usuário
  autenticado; acesso a nota de outro usuário retorna `404` ([D004](../../DECISIONS.md#d004)).
