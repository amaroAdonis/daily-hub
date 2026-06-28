# Feature: Autenticação + Perfil

- **Fase:** 8
- **Status:** concluída

## Objetivo

Encerrar o modo single-user: cada pessoa tem sua conta (cadastro aberto, e-mail +
senha) e vê apenas os próprios dados. Inclui uma tela de **perfil** (Settings).

## Modelo de dados

Campos adicionados ao `User` em
[`schema.prisma`](../../packages/db/prisma/schema.prisma) (migração
`add_user_auth_fields`):

- `passwordHash` (obrigatório, argon2 — nunca trafega para o cliente)
- `occupation?` — cargo/ocupação exibido no perfil
- `avatarUrl?` — URL externa de avatar (upload real fica para a Fase 10)

## Autenticação

- Senha em hash com **argon2**; token **JWT** assinado com `API_JWT_SECRET`
  (validade `API_JWT_EXPIRES_IN`, padrão `7d`).
- `JwtAuthGuard` global (via `APP_GUARD`): **todas as rotas exigem token**,
  exceto as marcadas com `@Public()` (cadastro, login, health).
- A `JwtStrategy` (passport-jwt) anexa o usuário à requisição; os controllers o
  acessam com `@CurrentUser('id')`. Isso substituiu o antigo `currentUserId()`
  ("primeiro do banco") em todos os 9 services.

## Contrato da API

| Método | Rota                 | Descrição                         | Body / Auth           |
| ------ | -------------------- | --------------------------------- | --------------------- |
| POST   | `/api/auth/register` | Cria conta e retorna token + user | `registerSchema`      |
| POST   | `/api/auth/login`    | Autentica e retorna token + user  | `loginSchema`         |
| GET    | `/api/auth/me`       | Perfil do usuário autenticado     | Bearer                |
| PATCH  | `/api/auth/me`       | Atualiza nome/ocupação/avatar     | `updateProfileSchema` |

`register`/`login` retornam `authResponseDto` (`{ token, user }`); `user` segue o
`userDto` (sem `passwordHash`). Schemas Zod em
[`packages/shared/src/schemas/auth.ts`](../../packages/shared/src/schemas/auth.ts).

## UI (web)

- `lib/api.ts` envia `Authorization: Bearer <token>` e, em `401` de sessão,
  dispara o logout (via `lib/auth-token.ts`).
- `contexts/auth.tsx` — `AuthProvider`/`useAuth`: hidrata a sessão por `GET
/auth/me`, expõe `login`/`register`/`logout`/`setUser`. Token em `localStorage`.
- `features/auth/components/auth-page.tsx` — porta de entrada (entrar/criar conta).
- `features/settings/components/settings-page.tsx` — perfil (nome, ocupação,
  avatar; e-mail somente leitura) via `PATCH /auth/me`.
- `App.tsx` faz o gate (splash → auth → app); `AppShell` ganhou rodapé com
  `Avatar`, nome, ocupação e **Sair**, e a seção **Configurações**.

## Critérios de aceite

- [x] Cadastrar, entrar e sair; sessão persiste ao recarregar (localStorage).
- [x] Rotas de dados exigem token (401 sem ele); cadastro/login/health públicos.
- [x] Cada usuário vê apenas os próprios dados (services usam `@CurrentUser`).
- [x] Editar o perfil reflete no avatar/nome da sidebar.

## Testes

- [x] Unit (Vitest): `auth.service.spec.ts` cobre cadastro com hash, e-mail
      normalizado, rejeição de e-mail duplicado, login válido/ inválido e DTO sem
      `passwordHash`. Os 9 services migrados seguem verdes com `userId` explícito.
- [ ] E2E (Playwright): planejado para fase posterior.

> **Nota de ambiente:** rodar a API via `nest start` no Node 22.18+ exige um
> ajuste no consumo de `@daily-hub/shared` (hoje servido como `.ts` sem build);
> a validação de backend foi feita pelos testes unitários. Ver issue de setup.
