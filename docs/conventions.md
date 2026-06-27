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
5. `docs/features/<feature>.md` preenchido.
6. CI verde.
