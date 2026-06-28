# Contatos — Notas Técnicas

## Contrato da API

| Método | Rota                | Descrição                                | Body / Query          |
| ------ | ------------------- | ---------------------------------------- | --------------------- |
| GET    | `/api/contacts`     | Lista contatos (ordenados por nome)      | Query: `search?`      |
| GET    | `/api/contacts/:id` | Detalha um contato                       | —                     |
| POST   | `/api/contacts`     | Cria um contato                          | `createContactSchema` |
| PATCH  | `/api/contacts/:id` | Atualiza um contato (`null` limpa campo) | `updateContactSchema` |
| DELETE | `/api/contacts/:id` | Remove um contato (204)                  | —                     |

`search` filtra por nome, e-mail **ou** empresa (substring, case-insensitive).
Schemas Zod: `packages/shared/src/schemas/contacts.ts` — `createContactSchema`,
`updateContactSchema`, `listContactsQuery` e `contactDto`. Validação via
`ZodValidationPipe`.

A operação de busca não é uma rota separada: é o parâmetro `search` da própria
listagem (`ContactsService.list(userId, { search })`), que monta um
`where.OR` sobre `name`/`email`/`company`.

## Modelo

Entidade `Contact` em `packages/db/prisma/schema.prisma`:

- `name` (obrigatório), `email?`, `phone?`, `company?`, `notes?`, além de
  `createdAt`/`updatedAt` e do `userId` (isolamento).

O modelo já existia desde a Fase 0; a Fase 6 não exigiu migração. O service
serializa `createdAt`/`updatedAt` como ISO-8601 no DTO.

## UI (web)

`apps/web/src/features/contacts`:

- `api.ts` — funções HTTP tipadas sobre `lib/api`.
- `hooks.ts` — `useContacts` e mutações de criar/atualizar/excluir (TanStack
  Query, invalidando o cache de `contacts`).
- `components/` — `ContactsPage` (busca + novo contato + grade de cards),
  `ContactForm` (nome, e-mail, telefone, empresa, observações) e `ContactCard`
  (avatar com inicial, links `mailto:`/`tel:`, editar/excluir e botão
  "Conexões").

A seção **Contatos** integra a navegação do `AppShell`.

## Decisões e armadilhas

- **Isolamento por usuário:** todos os métodos recebem `userId` de
  `@CurrentUser('id')` e filtram por ele; acessar item de outro usuário retorna
  `404` (não vaza existência) — [D004](../../DECISIONS.md#d004).
- **`null` limpa, ausente mantém:** o `updateContactSchema` é `.partial()` com
  campos opcionais `.nullable()`; enviar `null` zera o campo, omitir mantém o
  valor atual.
- **Busca única:** um só parâmetro `search` cobre nome/e-mail/empresa via `OR`;
  `phone` e `notes` ficam de fora.
- **Vínculo a eventos/notas:** não é responsabilidade desta feature — depende da
  camada polimórfica `EntityLink` da [Integração](../integration/README.md)
  (Fase 7). O botão "Conexões" do `ContactCard` abre o Inspetor dessa camada.
