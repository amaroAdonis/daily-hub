# Decisões de Arquitetura

Registro leve de decisões (ADR) do Daily Hub. Uma decisão por entrada,
identificada por `D00N` e citada por ID nas demais docs. Formato: Registro,
Decisão, Status, Contexto, Consequências.

> Status: **Ativo** (em vigor) · **Revisar** · **Substituído**.

## D001 — Registrar decisões de arquitetura {#d001}

- **Registro:** Fase 0
- **Decisão:** manter um registro de decisões estruturais, no formato Contexto /
  Decisão / Consequências, citável por ID. (Originalmente ADRs numerados em
  `docs/adr/`; consolidado neste `DECISIONS.md` em 2026-06-28.)
- **Status:** Ativo

**Contexto.** Decisões estruturais (stack, modelagem) precisam de rastro do
"porquê", tanto para o futuro quanto como evidência de raciocínio no portfólio.

**Consequências.** Histórico claro das escolhas; pequeno overhead a cada decisão
grande (aceitável). Decisões são referenciadas por ID em features e docs de topo.

## D002 — Monorepo separado (React + NestJS) {#d002}

- **Registro:** Fase 0
- **Decisão:** monorepo (pnpm + Turborepo) com `apps/web` (React + Vite) e
  `apps/api` (NestJS) separados, comunicando por REST documentado (OpenAPI), com
  tipos e validação compartilhados via Zod em `packages/shared`.
- **Status:** Ativo

**Contexto.** O projeto é vitrine de portfólio fullstack TypeScript. A
alternativa natural seria um monolito Next.js (mais rápido de entregar), mas
busca-se demonstrar amplitude arquitetural: design de API, código compartilhado,
separação clara. NestJS porque a organização por módulos mapeia 1:1 com as
features; REST + OpenAPI (em vez de tRPC) para tornar o design da API explícito.

**Consequências.** Mais arquivos e configuração que um monolito; em troca,
contratos de API explícitos, fronteira limpa e melhor narrativa de portfólio.
Caso a velocidade vire prioridade, é possível colapsar em Next.js.

## D003 — Links e tags polimórficos {#d003}

- **Registro:** Fase 0
- **Decisão:** usar duas tabelas polimórficas — `Tagging (tagId, entityType,
entityId)` para categorização transversal e `EntityLink (sourceType, sourceId,
targetType, targetId, relation)` para relações dirigidas entre quaisquer dois
  itens. Relações naturais e frequentes (ex.: `Task → Goal`) mantêm FK própria.
- **Status:** Ativo

**Contexto.** O requisito central é interligar todas as features. Opções:
(a) tabelas de junção explícitas por par de entidades; (b) associações
polimórficas genéricas.

**Consequências.** Liga qualquer item a qualquer item sem explosão de tabelas;
sem integridade referencial via FK no alvo polimórfico — garantida na camada de
serviço (validar existência antes de criar o link). Permite um "painel de itens
relacionados" uniforme. Ver [integração](features/integration/README.md).

## D004 — Autenticação própria (NestJS + JWT) {#d004}

- **Registro:** Fase 8
- **Decisão:** autenticação própria por e-mail/senha — hash com **argon2**,
  **JWT** (`@nestjs/jwt` + `passport-jwt`), `JwtAuthGuard` global via `APP_GUARD`,
  decorators `@Public()` e `@CurrentUser()`. Multiusuário com cadastro aberto. O
  token é guardado no **localStorage** e enviado como **Bearer**.
- **Status:** Ativo

**Contexto.** Até a Fase 7 o app era single-user (o service resolvia o usuário
como o primeiro do banco). Para virar produto/demo real era preciso isolar dados
por usuário. Optou-se por auth própria (em vez de um provedor externo) para
demonstrar o domínio do tema e manter o custo zero.

**Consequências.** Fim do modo single-user; `currentUserId` substituído pelo
usuário autenticado em todos os services. localStorage + Bearer é simples e
suficiente para a demo (sem cookies httpOnly/refresh tokens — anotado como
possível evolução). Ver [auth](features/auth/README.md).

## D005 — Status comum (TODO/DOING/DONE) entre tarefas, compromissos e metas {#d005}

- **Registro:** frente de redesenho (pós-Fase 11)
- **Decisão:** unificar o eixo de progresso dos três tipos num enum comum
  **A fazer → Em andamento → Concluído**. Tarefas já tinham `status`;
  compromissos ganharam `EventStatus`; metas foram migradas de
  `ACTIVE/ACHIEVED/ARCHIVED` para `TODO/DOING/DONE/ARCHIVED` (com `ARCHIVED`
  fora do quadro). Rótulos/cores centralizados num helper
  (`apps/web/src/lib/status.ts`); pílula de status clicável que cicla os estágios.
- **Status:** Ativo

**Contexto.** O Kanban unificado precisa de um eixo único de status para os três
tipos; manter enums divergentes exigiria mapeamentos frágeis em todo lugar.

**Consequências.** Um único vocabulário de status na UI e no Kanban; exigiu uma
migração de dados das metas (`ACTIVE→DOING`, `ACHIEVED→DONE`). Ver
[kanban](features/kanban/README.md) e [goals](features/goals/README.md).

## D006 — Anexos em storage S3-compatível, modelo polimórfico {#d006}

- **Registro:** Fase 10
- **Decisão:** anexos em storage S3-compatível (**MinIO** local, **Cloudflare
  R2** em produção), via `@aws-sdk/client-s3` com `forcePathStyle`. Modelo
  `Attachment` **polimórfico** (`entityType` + `entityId`). Upload/download por
  **URL assinada** (web fala direto com o storage; a API só registra metadados e
  emite as URLs).
- **Status:** Ativo

**Contexto.** Anexar arquivos a tarefas, compromissos e notas sem rotear bytes
pela API (que seria caro e lento). URLs assinadas resolvem isso e mantêm o
storage privado.

**Consequências.** Nenhum byte de arquivo passa pela API; trocar MinIO→R2 é só
mudar as `STORAGE_*` (nenhum código muda). Segue o polimorfismo de [D003]. Ver
[attachments](features/attachments/README.md).

## D007 — Integrações externas leves (sem OAuth) {#d007}

- **Registro:** Fase 11
- **Decisão:** começar simples — `Event.meetingUrl` (botão "Entrar na reunião") e
  link "Adicionar ao Google Agenda" montado por **URL-template** (sem OAuth).
- **Status:** Ativo

**Contexto.** Sync real do Google Calendar (OAuth) é uma fase própria, cara em
escopo. O valor imediato (entrar na reunião, exportar um evento) cabe sem OAuth.

**Consequências.** Zero custo de integração e nenhuma credencial externa; sync
bidirecional fica para o futuro. Ver [events](features/events/README.md).

## D008 — Deploy: Railway Hobby + Cloudflare R2 {#d008}

- **Registro:** Fase 12 (planejado)
- **Decisão:** deploy no **Railway Hobby** (Postgres gerenciado + API + web como
  serviço estático **separado**), com **Cloudflare R2** para o storage. Build via
  **Dockerfile por serviço** (multi-stage), não Nixpacks. `prisma migrate deploy`
  no start da API.
- **Status:** Ativo (a executar)

**Contexto.** Demo ao vivo de portfólio com custo mínimo. Railway não oferece S3,
daí o R2 (free tier, sem egress). Web separada da API mostra melhor a arquitetura.

**Consequências.** Custo ~US$5/mês; Dockerfiles a preparar; `STORAGE_*` apontam
para R2 em prod. Detalhes em [deploy](deploy.md).

## D009 — `@daily-hub/shared` compila para CJS (Node 22) {#d009}

- **Registro:** Fase 8
- **Decisão:** `packages/shared` compila para `dist` (CommonJS) via
  `tsconfig.build.json`, com `main/types/exports` apontando para `dist`. O
  `turbo.json` ganhou `dependsOn: ["^build"]` também na task `dev`.
- **Status:** Ativo

**Contexto.** No Node 22.18+, `nest start` quebrava com `ERR_MODULE_NOT_FOUND` ao
importar `@daily-hub/shared` servido como `.ts` (`main → src/index.ts`): o
type-stripping tratava-o como ESM e exigia extensões nos imports relativos.

**Consequências.** `pnpm dev`/`typecheck`/`test`/`build` constroem o shared
antes; editar o shared durante o `dev` exige seu watch (`tsc --watch`). `dist/`
fica no `.gitignore`. Ver [notas de auth](features/auth/notes.md).
