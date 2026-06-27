# Daily Hub

Agenda pessoal centrada no **dia**: tarefas, metas, anotações, compromissos e
contatos — todos interligados — organizados como um calendário de uso diário.

Projeto de portfólio fullstack **TypeScript** (React + NestJS, monorepo).

---

## Stack

| Camada      | Tecnologia                                                |
| ----------- | --------------------------------------------------------- |
| Monorepo    | pnpm workspaces + Turborepo                               |
| Frontend    | React + Vite + TypeScript, TanStack Query, Tailwind CSS   |
| Backend     | NestJS (módulos por feature), Swagger/OpenAPI             |
| Validação   | Zod (schemas compartilhados em `packages/shared`)         |
| Banco / ORM | PostgreSQL + Prisma (`packages/db`)                       |
| Testes      | Vitest (unit/integração), Playwright (e2e, fases futuras) |
| Qualidade   | ESLint, Prettier, Husky, Commitlint, GitHub Actions       |

## Estrutura do repositório

```
daily-hub/
├─ apps/
│  ├─ web/        # React + Vite (frontend)
│  └─ api/        # NestJS (backend)
├─ packages/
│  ├─ db/         # schema Prisma + cliente
│  ├─ shared/     # schemas Zod e tipos compartilhados
│  └─ config/     # presets de tsconfig
└─ docs/          # documentação (ver docs/README abaixo)
```

## Pré-requisitos

- Node.js >= 20.11
- pnpm 9 (`npm install -g pnpm`)
- Docker (para o Postgres local)

## Como rodar (primeira vez)

```bash
# 1. Dependências
pnpm install

# 2. Variáveis de ambiente
cp .env.example .env

# 3. Banco de dados
docker compose up -d            # sobe o Postgres
pnpm db:generate                # gera o Prisma Client
pnpm db:migrate                 # cria as tabelas
pnpm db:seed                    # (opcional) dados de exemplo

# 4. Subir tudo
pnpm dev                        # web + api em paralelo (Turborepo)
```

- Web: http://localhost:5173
- API: http://localhost:3333/api
- Docs da API (Swagger): http://localhost:3333/api/docs

## Scripts úteis

| Comando          | O que faz                    |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Sobe web e api em modo watch |
| `pnpm build`     | Build de todos os pacotes    |
| `pnpm lint`      | ESLint em todo o monorepo    |
| `pnpm typecheck` | Checagem de tipos            |
| `pnpm test`      | Testes                       |
| `pnpm db:studio` | Abre o Prisma Studio         |

## Documentação

| Documento                                      | Conteúdo                              |
| ---------------------------------------------- | ------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)   | Visão de arquitetura e fluxo de dados |
| [docs/data-model.md](docs/data-model.md)       | Entidades, ER e a camada de links     |
| [docs/ROADMAP.md](docs/ROADMAP.md)             | Plano em fases                        |
| [docs/design-system.md](docs/design-system.md) | Tokens visuais e direção de design    |
| [docs/conventions.md](docs/conventions.md)     | Padrões de código e commits           |
| [docs/adr/](docs/adr/)                         | Registros de decisão de arquitetura   |
| [docs/features/](docs/features/)               | Especificação de cada feature         |

## Status

**Fase 0 — Fundação concluída.** Próxima: Fase 1 (Tarefas / atividades diárias).
Ver [docs/ROADMAP.md](docs/ROADMAP.md).
