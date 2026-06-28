# Autenticação + Perfil — Fluxos

> Referência: [README.md](README.md) | [Glossário](../../GLOSSARY.md#single-user)

## Índice

- Cadastro / login → token no `localStorage` → requests com Bearer.
- Re-hidratação da sessão no boot da web.
- Logout (explícito e por `401` de sessão).

## Cadastro / login e requests autenticados

```mermaid
flowchart TD
    A["AuthPage: cadastro ou login"] --> B["POST /auth/register | /auth/login"]
    B --> C["API valida (Zod) · argon2 · assina JWT"]
    C --> D["Resposta { token, user }"]
    D --> E["setToken(token) → localStorage"]
    E --> F["AuthContext: user + status=authenticated"]
    F --> G["Requests subsequentes via lib/api"]
    G --> H["Header Authorization: Bearer <token>"]
    H --> I["JwtAuthGuard valida → @CurrentUser('id')"]
    I --> J["Service filtra dados pelo userId"]
```

## Re-hidratação no boot

```mermaid
flowchart TD
    A["App monta · AuthProvider"] --> B{"getToken() existe?"}
    B -- não --> C["status = unauthenticated → AuthPage"]
    B -- sim --> D["GET /auth/me (Bearer)"]
    D -- 200 --> E["setUser · status = authenticated → app"]
    D -- erro/401 --> F["clearToken · status = unauthenticated"]
```

## Logout (explícito e por sessão expirada)

```mermaid
flowchart LR
    A["Autenticado"] -->|botão Sair| B["logout()"]
    A -->|"401 em request com token"| C["notifyUnauthorized()"]
    C --> B
    B --> D["clearToken() + user=null"]
    D --> E["status = unauthenticated → AuthPage"]
```
