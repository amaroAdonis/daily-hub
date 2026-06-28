# Requisitos Não-Funcionais

- Prioridade padrão: P0
- Status: Ativo
- Última atualização: 2026-06-29

## Contexto

Requisitos transversais que valem para o produto inteiro, independentemente da
feature. Complementam os requisitos funcionais (`REQ-*`) das features e são
citados por ID (`NFR-*`) onde se aplicam.

## Escopo

Desempenho, acessibilidade, segurança, confiabilidade, manutenibilidade e
portabilidade.

## Requisitos (NFR-*)

- `NFR-001` **Desempenho.** O dashboard do dia DEVE ser escaneável em ~10s; as
  telas principais usam skeletons no carregamento e cache de dados (TanStack
  Query) para evitar re-fetch desnecessário.
- `NFR-002` **Acessibilidade.** A UI DEVE ter foco de teclado visível, respeitar
  `prefers-reduced-motion` e manter contraste AA; cor nunca é usada sozinha para
  comunicar status (sempre com ícone/rótulo).
- `NFR-003` **Segurança e isolamento.** Senhas DEVEM ser hasheadas com argon2; as
  rotas (salvo `@Public()`) DEVEM exigir JWT; cada usuário só acessa os próprios
  dados; anexos trafegam por URL assinada (bucket privado); nenhum segredo real
  é versionado.
- `NFR-004` **Confiabilidade.** O deploy DEVE aplicar as migrations no start e
  expor `GET /api/health`; o container reinicia em caso de falha.
- `NFR-005` **Manutenibilidade.** A validação é única (Zod compartilhado, borda
  do banco à UI); a CI (lint, typecheck, test) DEVE estar verde; commits seguem
  Conventional Commits.
- `NFR-006` **Portabilidade.** O storage DEVE ser S3-compatível e trocável
  (MinIO local ↔ Cloudflare R2) apenas por variáveis de ambiente, sem mudança de
  código.

## Critérios de Aceite (AC-NFR-*)

### AC-NFR-001 - Isolamento por usuário (NFR-003)

- **Given** um recurso pertencente a outro usuário
- **When** um usuário autenticado tenta acessá-lo pelo `id`
- **Then** a API responde `404` (não vaza a existência do recurso)

### AC-NFR-002 - Healthcheck disponível (NFR-004)

- **Given** a API em produção
- **When** `GET /api/health` é chamado
- **Then** responde `200` com `{ "status": "ok" }`

### AC-NFR-003 - Movimento reduzido respeitado (NFR-002)

- **Given** um usuário com `prefers-reduced-motion` ativo
- **When** a UI animaria entradas/transições
- **Then** as animações são suprimidas ou reduzidas

## Dependências

- Autenticação ([features/auth](../features/auth/README.md)) — base do NFR-003.
- Deploy ([deploy.md](../deploy.md)) — base dos NFR-004 e NFR-006.

## Rastreabilidade

- Arquitetura: [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
- Decisões: [`../DECISIONS.md`](../DECISIONS.md) (D004, D006, D008, D009)

## Não Escopo

- SLA formal / uptime contratual — é um projeto pessoal.

## Questões em Aberto

1. Quando entram testes E2E (Playwright) e medição automatizada de performance?
