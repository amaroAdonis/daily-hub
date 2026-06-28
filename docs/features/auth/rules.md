# Autenticação + Perfil — Regras de Negócio

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#single-user)

## Rotas públicas vs protegidas

O `JwtAuthGuard` é global (`APP_GUARD`): toda rota exige token, salvo as marcadas
com `@Public()`.

| Rota                  | Acesso              | Como         |
| --------------------- | ------------------- | ------------ |
| `POST /auth/register` | Pública             | `@Public()`  |
| `POST /auth/login`    | Pública             | `@Public()`  |
| `GET  /health`        | Pública             | `@Public()`  |
| `GET  /auth/me`       | Protegida (Bearer)  | guard global |
| `PATCH /auth/me`      | Protegida (Bearer)  | guard global |
| demais rotas de dados | Protegidas (Bearer) | guard global |

> Falta de token (ou token inválido/expirado) em rota protegida ⇒ `401`.

## Transições anônimo → autenticado

| Estado inicial | Evento                          | Estado final | Efeito colateral                              |
| -------------- | ------------------------------- | ------------ | --------------------------------------------- |
| Anônimo        | cadastro (`register`) com êxito | Autenticado  | salva token no `localStorage`, hidrata `user` |
| Anônimo        | login com êxito                 | Autenticado  | salva token no `localStorage`, hidrata `user` |
| Autenticado    | recarga da página               | Autenticado  | re-hidrata via `GET /auth/me` (token salvo)   |
| Autenticado    | logout                          | Anônimo      | limpa o token e o `user` do contexto          |
| Autenticado    | `401` em request com token      | Anônimo      | logout automático (sessão expirada/inválida)  |
| Anônimo        | `401` em login/cadastro         | Anônimo      | erro exibido; **não** dispara logout global   |

> O `401` só encerra a sessão quando havia um token presente — falha de
> login/cadastro (sem token) apenas mostra o erro.

## Validações de senha e e-mail (Zod)

Schemas em `packages/shared/src/schemas/auth.ts`.

| Campo      | Regra (cadastro)              | Regra (login)       |
| ---------- | ----------------------------- | ------------------- |
| `name`     | obrigatório, 1–120 chars      | —                   |
| `email`    | formato de e-mail, ≤200 chars | formato, ≤200 chars |
| `password` | mínimo 8, máximo 200 chars    | mínimo 1 (presença) |

Regras de domínio aplicadas no service:

| Regra                      | Detalhe                                           |
| -------------------------- | ------------------------------------------------- |
| Normalização de e-mail     | gravado e consultado em **minúsculas** (`lower`)  |
| Unicidade de e-mail        | duplicado ⇒ `409 Conflict`                        |
| Mensagem de login genérica | e-mail inexistente e senha errada ⇒ mesmo `401`   |
| Senha em hash              | argon2; texto puro nunca persistido nem retornado |

## Atualização de perfil (`PATCH /auth/me`)

| Campo        | Editável | Observação                                       |
| ------------ | -------- | ------------------------------------------------ |
| `name`       | sim      | 1–120 chars                                      |
| `occupation` | sim      | ≤120 chars; `null` limpa o campo                 |
| `avatarUrl`  | sim      | URL válida, ≤500 chars; `null` limpa o campo     |
| `email`      | **não**  | somente leitura na UI; não há rota para trocá-lo |
| `password`   | **não**  | sem rota de troca de senha (não escopo)          |
