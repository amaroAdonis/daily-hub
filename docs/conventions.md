# Convenções

## Commits

Seguimos **Conventional Commits** (validado por Commitlint no `commit-msg`):

```
feat(tasks): adiciona criação de tarefa
fix(api): corrige timezone de Task.date
docs(roadmap): marca Fase 1 como concluída
```

Tipos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`.

## Código

- TypeScript estrito em todo o monorepo.
- Validação de entrada **sempre** via schemas Zod de `@daily-hub/shared`.
- Organização por **feature** (web e api espelhados).
- Funções/serviços públicos documentados com TSDoc.
- Formatação por Prettier; lint por ESLint (rodam no `pre-commit`).

## Nomeação

- Arquivos: `kebab-case` (`task.service.ts`, `app-shell.tsx`).
- Tipos/Classes: `PascalCase`. Variáveis/funções: `camelCase`.
- Tabelas no banco: `snake_case` plural (via `@@map`).

## Definição de pronto (por feature)

1. Schema Prisma atualizado e migrado.
2. Schemas Zod (request/response) em `shared`.
3. Módulo da API com testes passando.
4. Feature na web consumindo a API.
5. Pasta `docs/features/<feature>/` preenchida (README/rules/flows/notes) e a
   feature registrada em [`docs/features/INDEX.md`](features/INDEX.md).
6. CI verde.

## Documentação

A documentação segue um padrão fixo, descrito em
[`features/INDEX.md`](features/INDEX.md):

- **Docs de topo** em CAPS: `PROJECT_BRIEF`, `ARCHITECTURE`, `DECISIONS`,
  `GLOSSARY`, `ROADMAP`, `BACKLOG` (+ `data-model`, `conventions`, `deploy`).
- **Uma pasta por feature** em `features/<feature>/` com `README.md` (visão +
  requisitos `REQ-*` + critérios `AC-*`), `rules.md`, `flows.md` (Mermaid) e
  `notes.md`. Modelo em [`features/_template/`](features/_template/README.md).
- **Design system** em `design-system/` (`index`, `tokens`, `components`).
- **Requisitos transversais** em `nfr/NON_FUNCTIONAL.md` (`NFR-*`).
- **Rastreabilidade** por IDs `REQ-<FEATURE>-NNN` / `AC-<FEATURE>-NNN`; decisões
  em `DECISIONS.md` (`D00N`). Convenção completa no `INDEX.md`.
- O site é gerado com **MkDocs Material** (`mkdocs.yml` na raiz).
