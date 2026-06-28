# Contatos

- Prioridade: P1
- Status: Concluída
- Última atualização: 2026-06-28

## Visão Geral

Mantém uma agenda de **contatos** (pessoas) do usuário — nome, e-mail, telefone,
empresa e observações — com busca por texto. É a base para vincular pessoas a
outros itens do dia (eventos, notas) por meio da camada de
[Integração](../integration/README.md), introduzida na Fase 7.

A feature é um CRUD enxuto, isolado por usuário, com listagem ordenada por nome e
uma busca única que cobre nome, e-mail e empresa.

## Conceitos-Chave

- **Contato** — pessoa registrada (nome obrigatório; e-mail, telefone, empresa e
  observações opcionais). Ver [Glossário](../../GLOSSARY.md#contato).

## Requisitos (REQ-*)

### Modelo

- `REQ-CONTACTS-001` Todo contato tem `name` obrigatório.
- `REQ-CONTACTS-002` Contato tem campos opcionais `email`, `phone`, `company` e
  `notes`.
- `REQ-CONTACTS-003` Na atualização, enviar `null` em um campo opcional **limpa**
  o valor.

### Busca

- `REQ-CONTACTS-010` A listagem aceita um parâmetro `search` único.
- `REQ-CONTACTS-011` A busca casa por `name`, `email` **ou** `company`
  (case-insensitive, substring).

### Operações

- `REQ-CONTACTS-020` Listar contatos, sempre ordenados por `name` (ascendente).
- `REQ-CONTACTS-021` Detalhar um contato pelo `id`.
- `REQ-CONTACTS-022` Criar um contato.
- `REQ-CONTACTS-023` Atualizar parcialmente um contato.
- `REQ-CONTACTS-024` Excluir um contato (retorna `204`).

### Isolamento

- `REQ-CONTACTS-030` Operações restritas aos contatos do usuário autenticado
  ([D004](../../DECISIONS.md#d004)).

## Critérios de Aceite (AC-*)

### AC-CONTACTS-001 - Listar contatos ordenados por nome (REQ-CONTACTS-020)

- **Given** contatos cadastrados em ordem qualquer
- **When** chamo `GET /contacts`
- **Then** recebo apenas os contatos do usuário, ordenados por `name` ascendente

### AC-CONTACTS-002 - Buscar por nome, e-mail ou empresa (REQ-CONTACTS-010, REQ-CONTACTS-011)

- **Given** contatos com nomes, e-mails e empresas variados
- **When** chamo `GET /contacts?search=mentora`
- **Then** recebo os que casam o termo em `name`, `email` ou `company`,
  ignorando maiúsculas/minúsculas

### AC-CONTACTS-003 - Criar contato (REQ-CONTACTS-001, REQ-CONTACTS-022)

- **Given** um `name` válido (e campos opcionais)
- **When** envio `POST /contacts`
- **Then** o contato é criado vinculado ao usuário e retornado com seu `id`

### AC-CONTACTS-004 - Limpar campo opcional na atualização (REQ-CONTACTS-003, REQ-CONTACTS-023)

- **Given** um contato com `company` preenchido
- **When** envio `PATCH /contacts/:id` com `company: null`
- **Then** o campo é gravado como vazio (`null`)

### AC-CONTACTS-005 - Excluir contato (REQ-CONTACTS-024)

- **Given** um contato existente
- **When** envio `DELETE /contacts/:id`
- **Then** recebo `204` e o contato some das listagens

### AC-CONTACTS-006 - Isolamento por usuário (REQ-CONTACTS-030)

- **Given** um contato de outro usuário
- **When** tento acessá-lo, atualizá-lo ou excluí-lo pelo `id`
- **Then** recebo `404` (não vaza existência)

## Dependências

### Features relacionadas

- [Integração](../integration/README.md) — vincula contatos a eventos e notas
  via `EntityLink` (Fase 7); o card de contato abre o Inspetor pelo botão
  "Conexões".

### Serviços e contratos compartilhados

- `GET/POST/PATCH/DELETE /api/contacts` — ver [notes](notes.md).
- Schemas Zod `packages/shared/src/schemas/contacts.ts`.

## Cobertura de Testes

- `apps/api/src/modules/contacts/contacts.service.spec.ts` — listagem ordenada,
  busca (OR case-insensitive em nome/e-mail/empresa), criação vinculada ao
  usuário, `NotFound` ao atualizar inexistente e remoção.
- (Pendente) E2E (Playwright) — fase posterior.

## Rastreabilidade

- Decisões: [D004](../../DECISIONS.md#d004) (auth).
- Glossário: [Contato](../../GLOSSARY.md#contato).
- Modelo de dados: [`../../data-model.md`](../../data-model.md).

## Não Escopo

- Vínculo de contatos a eventos e notas — pertence à camada de
  [Integração](../integration/README.md) (Fase 7).
- Importação/exportação (vCard, CSV) e deduplicação.
- Foto/avatar enviado (o card usa a inicial do nome).

## Questões em Aberto

1. A busca deve cobrir também `phone` e `notes`?
