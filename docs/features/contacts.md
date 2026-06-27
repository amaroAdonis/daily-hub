# Feature: Contatos

- **Fase:** 6
- **Status:** concluída

## Objetivo

Manter uma agenda de **contatos** (pessoas), com busca — base para, na Fase 7,
vinculá-los a eventos e notas.

## Modelo de dados

Entidade `Contact` em [`schema.prisma`](../../packages/db/prisma/schema.prisma):

- `name` (obrigatório), `email?`, `phone?`, `company?`, `notes?`

Modelo já existente desde a Fase 0; a Fase 6 não exigiu migração.

> Vincular contatos a **eventos e notas** depende da camada polimórfica
> `EntityLink`, que é o foco da **Fase 7** (Integração).

## Contrato da API

| Método | Rota                | Descrição                                | Body / Query          |
| ------ | ------------------- | ---------------------------------------- | --------------------- |
| GET    | `/api/contacts`     | Lista contatos (ordenados por nome)      | Query: `search?`      |
| GET    | `/api/contacts/:id` | Detalha um contato                       | —                     |
| POST   | `/api/contacts`     | Cria um contato                          | `createContactSchema` |
| PATCH  | `/api/contacts/:id` | Atualiza um contato (`null` limpa campo) | `updateContactSchema` |
| DELETE | `/api/contacts/:id` | Remove um contato (204)                  | —                     |

`search` filtra por nome, e-mail ou empresa (case-insensitive). Schemas Zod em
[`packages/shared/src/schemas/contacts.ts`](../../packages/shared/src/schemas/contacts.ts).

## UI (web)

`apps/web/src/features/contacts`:

- `api.ts` / `hooks.ts` — `useContacts` e mutações de criar/atualizar/excluir.
- `components/` — `ContactForm` (nome, e-mail, telefone, empresa, observações),
  `ContactCard` (avatar com inicial, links `mailto:`/`tel:`, editar/excluir) e
  `ContactsPage` (busca + novo contato + grade de cards).

A seção **Contatos** entrou na navegação do `AppShell`, completando as cinco
seções de topo.

## Critérios de aceite

- [x] Criar, editar e excluir contatos.
- [x] Buscar por nome, e-mail ou empresa.
- [x] Navegar até a seção de Contatos.

## Testes

- [x] Unit (Vitest): `contacts.service.spec.ts` cobre listagem ordenada, busca
      (OR case-insensitive), criação vinculada ao usuário, `NotFound` e remoção.
- [ ] E2E (Playwright): planejado para fase posterior.
