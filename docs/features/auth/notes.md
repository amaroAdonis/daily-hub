# Autenticação + Perfil — Notas Técnicas

## Contrato da API

| Método | Rota                 | Descrição                         | Body / Auth                    |
| ------ | -------------------- | --------------------------------- | ------------------------------ |
| POST   | `/api/auth/register` | Cria conta e retorna token + user | `registerSchema` · `@Public()` |
| POST   | `/api/auth/login`    | Autentica e retorna token + user  | `loginSchema` · `@Public()`    |
| GET    | `/api/auth/me`       | Perfil do usuário autenticado     | Bearer                         |
| PATCH  | `/api/auth/me`       | Atualiza nome/ocupação/avatar     | `updateProfileSchema` · Bearer |

`register`/`login` retornam `authResponseDto` (`{ token, user }`); `me` retorna
`userDto`. Schemas Zod em `packages/shared/src/schemas/auth.ts`, validados pelo
`ZodValidationPipe`. O perfil é gerido pelo próprio controller de auth (não há
módulo `users` separado); o avatar usa URL externa (sem upload).

Configuração do JWT (em `auth.module.ts`): segredo `API_JWT_SECRET` e validade
`API_JWT_EXPIRES_IN` (padrão `7d`). A `JwtStrategy` extrai o token do header
`Authorization: Bearer`, com `ignoreExpiration: false`.

## Modelo

Entidade `User` em `packages/db/prisma/schema.prisma` (migração
`add_user_auth_fields`):

- `id` (cuid), `email` (`@unique`), `name`
- `passwordHash` — argon2; **nunca** trafega para o cliente
- `occupation?` — cargo/ocupação exibido no perfil
- `avatarUrl?` — URL externa de avatar (upload real fica para a Fase 10)
- `createdAt`, `updatedAt`
- relações: `tasks`, `goals`, `notes`, `events`, `contacts`, `tags`,
  `attachments` (todas escopadas por usuário)

O `userDto` projeta o usuário sem `passwordHash` e serializa `createdAt` como
ISO string.

## Componentes da API

- `auth.controller.ts` — rotas acima; `@Public()` em register/login,
  `@CurrentUser('id')` em me/updateProfile.
- `auth.service.ts` — `register`, `login`, `getProfile`, `updateProfile`; hash e
  verificação argon2; assina o JWT (`{ sub, email }`); projeta o `userDto`.
- `jwt.strategy.ts` — `JwtStrategy` (passport-jwt); `validate` devolve
  `{ id, email }` anexado a `req.user`.
- `common/jwt-auth.guard.ts` — `JwtAuthGuard` global; libera handlers marcados
  com `@Public()` lendo a metadata via `Reflector`.
- `common/public.decorator.ts` — `@Public()` (`SetMetadata('isPublic', true)`).
- `common/current-user.decorator.ts` — `@CurrentUser()` / `@CurrentUser('id')`.
- `auth.module.ts` — registra `JwtModule` (async, via `ConfigService`),
  `PassportModule`, e o guard global por `{ provide: APP_GUARD, useClass:
JwtAuthGuard }`.

## UI (web)

- `lib/auth-token.ts` — `get/set/clearToken` no `localStorage`
  (`daily-hub.token`) e o canal `onUnauthorized`/`notifyUnauthorized` (fica fora
  do `lib/api` para evitar dependência circular com o contexto).
- `lib/api.ts` — injeta `Authorization: Bearer <token>` quando há token; em `401`
  **com token presente** chama `notifyUnauthorized()` (sessão expirada → logout).
- `contexts/auth.tsx` — `AuthProvider`/`useAuth`: hidrata por `GET /auth/me`,
  expõe `login`/`register`/`logout`/`setUser`; `status` em
  `loading`/`authenticated`/`unauthenticated`.
- `features/auth/api.ts` — `register`, `login`, `getMe`, `updateProfile`.
- `features/auth/components/auth-page.tsx` — porta de entrada (entrar/criar
  conta).
- `features/settings/` — `hooks.ts` (`useUpdateProfile`, reflete no contexto via
  `setUser`) e `components/settings-page.tsx` (nome, ocupação, avatar; e-mail
  somente leitura).
- `App.tsx` faz o gate (splash → auth → app); o `AppShell` mostra avatar, nome,
  ocupação e **Sair**, mais a seção **Configurações**.

## Decisões e armadilhas

- **localStorage + Bearer** ([D004](../../DECISIONS.md#d004)): token no
  `localStorage`, enviado como `Bearer`. Simples e suficiente para a demo; sem
  cookies `httpOnly` nem refresh tokens (anotado como evolução possível). O `401`
  só desloga quando havia token — login/cadastro falhos só mostram o erro.
- **Fim do single-user**: a antiga resolução "primeiro do banco"
  (`currentUserId()`) foi substituída pelo usuário autenticado
  (`@CurrentUser('id')`) em **todos os 9 services** de domínio, que agora recebem
  o `userId` como primeiro parâmetro e escopam todas as queries por ele.
- **Mensagem de login genérica**: e-mail inexistente e senha incorreta retornam
  o mesmo `401` (não revela qual dos dois falhou).
- **Build CJS do shared** ([D009](../../DECISIONS.md#d009)): esta fase descobriu
  que, no Node 22.18+, `nest start` quebrava (`ERR_MODULE_NOT_FOUND`) ao importar
  `@daily-hub/shared` servido como `.ts`. A correção foi compilar o `shared` para
  `dist` (CommonJS) e adicionar `dependsOn: ["^build"]` na task `dev` do Turbo —
  editar o shared durante o `dev` exige seu watch.
- **`API_JWT_SECRET` em dev**: cai no fallback `dev-secret-change-me` se não
  definido — definir um segredo real em produção.
