# Autenticação + Perfil

- Prioridade: P0
- Status: Concluída
- Última atualização: 2026-06-28

## Visão Geral

Encerra o modo **single-user**: cada pessoa tem sua conta (cadastro aberto, por
e-mail + senha) e vê apenas os próprios dados. A senha é guardada em hash
(argon2) e a sessão é um **JWT** enviado como `Bearer` em todas as requisições.
Um `JwtAuthGuard` global protege a API inteira — só rotas marcadas com
`@Public()` (cadastro, login, health) dispensam token.

É a camada que torna o app multiusuário: substituiu a antiga resolução "primeiro
do banco" pelo usuário autenticado (`@CurrentUser('id')`) em todos os 9 services
de domínio, dando isolamento de dados por usuário. Inclui ainda uma tela de
**perfil** (Settings) com nome, ocupação e avatar.

## Conceitos-Chave

- **Single-user** — modo anterior à Fase 8 (usuário = primeiro do banco),
  substituído por esta feature. Ver
  [Glossário](../../GLOSSARY.md#single-user).
- **Usuário** (`User`) — conta com `email`, `name`, `passwordHash`, `occupation?`
  e `avatarUrl?`.
- **JWT / Bearer** — token assinado que carrega `sub` (id) + `email`, enviado no
  header `Authorization`.
- **Rota pública** — handler marcado com `@Public()`, isento do guard global.

## Requisitos (REQ-*)

### Cadastro

- `REQ-AUTH-001` Qualquer pessoa pode criar conta com `name`, `email` e
  `password` (cadastro aberto, multiusuário).
- `REQ-AUTH-002` O `email` é normalizado para minúsculas e é único; cadastro com
  e-mail já existente é rejeitado.
- `REQ-AUTH-003` A senha tem no mínimo 8 caracteres (validação Zod).
- `REQ-AUTH-004` O cadastro retorna imediatamente `token` + `user` (sessão já
  iniciada).

### Login

- `REQ-AUTH-010` Login autentica por `email` + `password` e retorna `token` +
  `user`.
- `REQ-AUTH-011` Credenciais inválidas (e-mail inexistente ou senha incorreta)
  retornam `401` com mensagem genérica, sem distinguir os casos.

### Hash e segurança

- `REQ-AUTH-020` A senha é gravada em hash com **argon2**; o texto puro nunca é
  persistido.
- `REQ-AUTH-021` O `passwordHash` nunca trafega para o cliente — toda resposta
  usa o `userDto` público.

### JWT e guard global

- `REQ-AUTH-030` O token é um JWT assinado com `API_JWT_SECRET`, validade
  `API_JWT_EXPIRES_IN` (padrão `7d`).
- `REQ-AUTH-031` Um `JwtAuthGuard` global (via `APP_GUARD`) protege **todas** as
  rotas por padrão.
- `REQ-AUTH-032` A `JwtStrategy` (passport-jwt) valida o token e anexa o usuário
  à requisição, exposto por `@CurrentUser()`.

### Rotas públicas

- `REQ-AUTH-040` Cadastro, login e health são marcados com `@Public()` e
  acessíveis sem token.
- `REQ-AUTH-041` Requisição a rota protegida sem token (ou com token inválido)
  retorna `401`.

### Perfil / Settings

- `REQ-AUTH-050` `GET /auth/me` retorna o perfil do usuário autenticado.
- `REQ-AUTH-051` `PATCH /auth/me` atualiza parcialmente `name`, `occupation` e
  `avatarUrl`; o `email` é somente leitura.
- `REQ-AUTH-052` Na web, salvar o perfil reflete imediatamente no avatar/nome da
  sidebar (estado do contexto de auth).

### Isolamento de dados por usuário

- `REQ-AUTH-060` Os services de domínio recebem o `userId` do usuário
  autenticado e restringem todas as operações aos dados desse usuário
  ([D004](../../DECISIONS.md#d004)).
- `REQ-AUTH-061` A sessão persiste entre recargas: o token fica no
  `localStorage` e a sessão é re-hidratada por `GET /auth/me` no boot.

## Critérios de Aceite (AC-*)

### AC-AUTH-001 - Cadastrar inicia sessão (REQ-AUTH-001, REQ-AUTH-004)

- **Given** `name`, `email` e `password` (≥8 chars) válidos
- **When** envio `POST /auth/register`
- **Then** recebo `{ token, user }` e o `user` não contém `passwordHash`

### AC-AUTH-002 - E-mail duplicado é rejeitado (REQ-AUTH-002)

- **Given** um e-mail já cadastrado (em qualquer caixa)
- **When** tento cadastrar de novo com o mesmo e-mail
- **Then** recebo `409 Conflict` e nenhum usuário novo é criado

### AC-AUTH-003 - Login com senha correta (REQ-AUTH-010, REQ-AUTH-020)

- **Given** uma conta existente
- **When** envio `POST /auth/login` com a senha correta
- **Then** o argon2 confere o hash e recebo `{ token, user }`

### AC-AUTH-004 - Login inválido não vaza o motivo (REQ-AUTH-011)

- **Given** um e-mail inexistente **ou** uma senha incorreta
- **When** envio `POST /auth/login`
- **Then** recebo `401` com a mesma mensagem genérica nos dois casos

### AC-AUTH-005 - Rota protegida exige token (REQ-AUTH-031, REQ-AUTH-041)

- **Given** uma rota de dados (não `@Public()`)
- **When** a chamo sem `Authorization: Bearer`
- **Then** recebo `401`

### AC-AUTH-006 - Rotas públicas dispensam token (REQ-AUTH-040)

- **Given** as rotas de cadastro, login e health
- **When** as chamo sem token
- **Then** respondem normalmente (sem `401`)

### AC-AUTH-007 - Editar o perfil (REQ-AUTH-051, REQ-AUTH-052)

- **Given** o usuário autenticado
- **When** envio `PATCH /auth/me` com novo `name`/`occupation`/`avatarUrl`
- **Then** recebo o `userDto` atualizado e o `email` permanece inalterado

### AC-AUTH-008 - Isolamento por usuário (REQ-AUTH-060)

- **Given** dois usuários com dados próprios
- **When** cada um lista suas tarefas/notas/etc.
- **Then** vê apenas os próprios itens (services usam `@CurrentUser('id')`)

### AC-AUTH-009 - Sessão persiste e expira (REQ-AUTH-061)

- **Given** um token salvo no `localStorage`
- **When** recarrego a página
- **Then** a sessão é re-hidratada por `GET /auth/me`
- **And** se o token estiver expirado/inválido (`401` com token), a sessão local
  é encerrada (logout)

## Dependências

### Features relacionadas

- Todas as features de domínio ([Tarefas](../tasks/README.md),
  [Metas](../goals/README.md), [Notas](../notes/README.md),
  [Compromissos](../events/README.md), [Contatos](../contacts/README.md),
  [Anexos](../attachments/README.md), [Integração](../integration/README.md))
  dependem desta para o `userId` autenticado.

### Serviços e contratos compartilhados

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PATCH /auth/me` —
  ver [notes](notes.md).
- Schemas Zod `packages/shared/src/schemas/auth.ts`.
- `@nestjs/jwt`, `passport-jwt`, `argon2`.

## Cobertura de Testes

- `apps/api/src/modules/auth/auth.service.spec.ts` — cadastro com hash, e-mail
  normalizado, rejeição de duplicado, login válido/ inválido, e-mail inexistente
  e DTO sem `passwordHash`.
- Smoke test HTTP do fluxo (login, `/auth/me`, proteção `401`, cadastro, e-mail
  duplicado `409`) validado com a API no ar.
- (Pendente) E2E (Playwright) — fase posterior.

## Rastreabilidade

- Decisões: [D004](../../DECISIONS.md#d004) (auth própria JWT + localStorage),
  [D009](../../DECISIONS.md#d009) (build CJS do shared, descoberto nesta fase).
- Glossário: [Single-user](../../GLOSSARY.md#single-user).
- Modelo de dados: [`../../data-model.md`](../../data-model.md).

## Não Escopo

- Refresh tokens / cookies `httpOnly` (token fica no `localStorage` — ver
  [D004](../../DECISIONS.md#d004)).
- Login social / OAuth (Google etc.).
- Recuperação de senha, verificação de e-mail, MFA.
- Papéis/permissões (RBAC); todo usuário tem o mesmo nível.
- Upload real de avatar — por ora apenas URL externa (anexos chegam na Fase 10,
  ver [attachments](../attachments/README.md)).

## Questões em Aberto

1. Migrar para cookies `httpOnly` + refresh token antes do deploy público?
2. Recuperação de senha entra em qual frente?
