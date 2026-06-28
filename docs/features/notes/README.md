# Anotações

- Prioridade: P1
- Status: Concluída
- Última atualização: 2026-06-28

## Visão Geral

Registra **notas em Markdown** — um espaço livre para ideias, lembretes e
rascunhos. Cada nota pode ser **fixada** para ficar em destaque e, opcionalmente,
**anexada a um dia** da agenda, conversando com o eixo do dia (aparece na visão
de dia ao lado de compromissos e tarefas).

Uma nota não precisa pertencer a um dia: existe de forma independente. A
listagem traz as fixadas primeiro e depois as mais recentes. O conteúdo é
renderizado com `react-markdown` (HTML embutido é ignorado por padrão).

## Conceitos-Chave

- **Anotação** — texto em Markdown, opcionalmente ligado a um dia. Ver
  [Glossário](../../GLOSSARY.md#anotacao).
- **Fixada** — marca que mantém a nota em destaque, no topo da lista. Ver
  [Glossário](../../GLOSSARY.md#fixada).
- **Dia** — campo temporal opcional (`date`) ao qual a nota fica anexada. Ver
  [Glossário](../../GLOSSARY.md#dia).

## Requisitos (REQ-*)

### Modelo

- `REQ-NOTES-001` Toda nota tem `title` obrigatório.
- `REQ-NOTES-002` Toda nota tem `content` em **Markdown** (opcional, default
  vazio).
- `REQ-NOTES-003` Nota tem `pinned` (booleano) que a destaca no topo.
- `REQ-NOTES-004` Nota tem `date` **opcional** (`@db.Date`) — pode existir sem
  estar anexada a nenhum dia.

### Markdown

- `REQ-NOTES-010` O `content` é interpretado como Markdown e renderizado na web.
- `REQ-NOTES-011` HTML embutido no Markdown **não** é renderizado (render seguro
  por padrão do `react-markdown`).

### Fixar

- `REQ-NOTES-020` Fixar/desafixar alterna o campo `pinned`.
- `REQ-NOTES-021` Notas fixadas aparecem antes das demais na listagem.

### Anexar a um dia

- `REQ-NOTES-030` Criar ou atualizar uma nota informando `date` a anexa àquele
  dia.
- `REQ-NOTES-031` Atualizar com `date: null` **desanexa** a nota do dia.
- `REQ-NOTES-032` As notas anexadas a um dia aparecem na visão de dia
  ([Dashboard](../dashboard/README.md)).

### Filtros

- `REQ-NOTES-040` Listar filtrando por `date` (notas de um dia específico).
- `REQ-NOTES-041` Listar filtrando por `pinned` (`true`/`false`).

### Operações

- `REQ-NOTES-050` Criar uma nota.
- `REQ-NOTES-051` Detalhar uma nota pelo `id`.
- `REQ-NOTES-052` Atualizar parcialmente uma nota.
- `REQ-NOTES-053` Excluir uma nota.

### Isolamento

- `REQ-NOTES-060` Operações restritas às notas do usuário autenticado
  ([D004](../../DECISIONS.md#d004)).

## Critérios de Aceite (AC-*)

### AC-NOTES-001 - Criar nota em Markdown (REQ-NOTES-001, REQ-NOTES-002, REQ-NOTES-050)

- **Given** um título válido e um `content` em Markdown
- **When** envio `POST /notes`
- **Then** a nota é criada e retornada com seu `id`

### AC-NOTES-002 - Fixadas primeiro (REQ-NOTES-021, REQ-NOTES-040)

- **Given** notas fixadas e não fixadas
- **When** chamo `GET /notes`
- **Then** recebo as fixadas antes das demais, e dentro de cada grupo por
  `updatedAt` decrescente

### AC-NOTES-003 - Filtrar notas de um dia (REQ-NOTES-004, REQ-NOTES-040)

- **Given** notas em dias diferentes e notas sem dia
- **When** chamo `GET /notes?date=YYYY-MM-DD`
- **Then** recebo apenas as anexadas àquele dia

### AC-NOTES-004 - Anexar e desanexar de um dia (REQ-NOTES-030, REQ-NOTES-031)

- **Given** uma nota anexada a um dia
- **When** atualizo com `date: null`
- **Then** a nota é desanexada (`date` fica nulo) e some das listagens daquele
  dia

### AC-NOTES-005 - Render seguro do Markdown (REQ-NOTES-010, REQ-NOTES-011)

- **Given** uma nota com HTML embutido no `content`
- **When** ela é renderizada na web
- **Then** o Markdown é exibido formatado e o HTML embutido **não** é executado

### AC-NOTES-006 - Excluir (REQ-NOTES-053)

- **Given** uma nota existente
- **When** envio `DELETE /notes/:id`
- **Then** recebo `204` e a nota some das listagens

### AC-NOTES-007 - Isolamento por usuário (REQ-NOTES-060)

- **Given** uma nota de outro usuário
- **When** tento acessá-la pelo `id`
- **Then** recebo `404` (não vaza existência)

## Dependências

### Features relacionadas

- [Dashboard do dia](../dashboard/README.md) — exibe as notas anexadas ao dia.
- [Integração](../integration/README.md) — anexar notas a **outros itens** (não
  só a dias) usa a camada polimórfica `EntityLink`/tags (Fase 7); o `NoteCard`
  abre o Inspetor pelo botão "Conexões".

### Serviços e contratos compartilhados

- `GET/POST/PATCH/DELETE /api/notes` — ver [notes](notes.md).
- Schemas Zod `packages/shared/src/schemas/notes.ts`.

## Cobertura de Testes

- `apps/api/src/modules/notes/notes.service.spec.ts` — ordenação (fixadas
  primeiro), filtro por dia com conversão para meia-noite UTC, criação anexada a
  um dia, desanexar (`date: null`) e `NotFound`.
- (Pendente) E2E (Playwright) — fase posterior.

## Rastreabilidade

- Decisões: [D004](../../DECISIONS.md#d004) (auth).
- Glossário: [Anotação](../../GLOSSARY.md#anotacao),
  [Fixada](../../GLOSSARY.md#fixada), [Dia](../../GLOSSARY.md#dia).
- Modelo de dados: [`../../data-model.md`](../../data-model.md).

## Não Escopo

- Anexar notas a outros itens além de dias — via [Integração](../integration/README.md)
  (Fase 7), não pelo modelo `Note`.
- Histórico de versões / edição colaborativa.
- Anexos de arquivo na nota (cobertos pela feature de Anexos).

## Questões em Aberto

1. Vale oferecer uma busca textual dedicada ao `content` das notas (hoje a busca
   global vem da Integração)?
