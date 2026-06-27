# ADR 0002 — Monorepo separado (React + NestJS)

- **Status:** aceito
- **Data:** Fase 0

## Contexto

O projeto é uma vitrine de portfólio fullstack TypeScript. A alternativa natural
seria um monolito Next.js (mais rápido de entregar). Buscamos demonstrar
amplitude arquitetural: design de API, código compartilhado, separação clara.

## Decisão

Monorepo (pnpm + Turborepo) com `apps/web` (React + Vite) e `apps/api` (NestJS)
separados, comunicando por REST documentado (OpenAPI), tipos e validação
compartilhados via Zod em `packages/shared`.

NestJS porque sua organização por módulos mapeia 1:1 com as features do produto.
REST + OpenAPI (em vez de tRPC) para tornar o design da API explícito e
"padrão de mercado".

## Consequências

- Mais arquivos e configuração que um monolito.
- Em troca: contratos de API explícitos, fronteira limpa, melhor narrativa de
  portfólio. Caso a velocidade vire prioridade, é possível colapsar em Next.js.
