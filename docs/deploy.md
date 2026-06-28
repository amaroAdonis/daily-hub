# Deploy & staging (Fase 12)

Direção de deploy escolhida para colocar o Daily Hub no ar como **demo ao vivo**
(vitrine de portfólio). A executar **depois** do polimento de UI/UX, para a demo
já nascer com a aparência final. Status: **planejado, não executado.**

## Topologia — Railway Hobby (~US$5/mês) + Cloudflare R2

Um **projeto** no Railway com os serviços abaixo; o **storage** fica na Cloudflare
(o Railway não oferece S3).

| Peça         | Onde                          | Observações                                                      |
| ------------ | ----------------------------- | ---------------------------------------------------------------- |
| **Postgres** | Railway (gerenciado)          | Injeta `DATABASE_URL` automaticamente.                           |
| **API**      | Railway (serviço próprio)     | `prisma migrate deploy` no start; depois `node dist/main.js`.    |
| **Web**      | Railway (serviço estático)    | Build Vite servido por `serve`/Caddy; URL própria.               |
| **Storage**  | Cloudflare R2 (S3-compatível) | Só trocar as `STORAGE_*`; nenhum código muda (`forcePathStyle`). |

**Decisões fixadas:**

- **Storage = Cloudflare R2** (free tier generoso, sem custo de egress). Alternativa
  considerada: MinIO como serviço no Railway (tudo num lugar, mas consome recursos
  e exige volume). R2 é o padrão "de produção".
- **Web como serviço separado** (não a API servindo os estáticos): separação limpa,
  URLs/logs/escala independentes, melhor para mostrar a arquitetura.
- **Build via Dockerfile por serviço** (multi-stage), não Nixpacks — mais robusto
  para o monorepo pnpm + Turborepo.

## A preparar no repositório

- [x] **Dockerfile da API** (`apps/api/Dockerfile`, multi-stage, Node 22; roda
      `migrate:deploy:ci` e `node apps/api/dist/main.js` no start). Validado com
      `docker build` + boot local.
- [x] **Dockerfile da web** (`apps/web/Dockerfile`, build do Vite com `VITE_API_URL`
      via `ARG`; estáticos servidos por `serve -s`). Validado localmente.
- [x] **`.dockerignore`** (exclui `node_modules`, `dist`, `.git`, `.env`…).
- [x] **API ouve em `PORT`** (injetada pela PaaS) e em `0.0.0.0`; healthcheck
      público em `GET /api/health`.
- [x] **`migrate deploy` no start** via script `migrate:deploy:ci` (sem
      `dotenv-cli`; usa a `DATABASE_URL` do ambiente).
- [x] **README voltado a recrutadores** (bilíngue) + logo + badges.
- [ ] **Seed de demonstração** (idempotente; revisar dados de vitrine antes de
      rodar contra produção).
- [ ] **Screenshots/GIF e link da demo** no README (após o deploy no ar).

### Como cada serviço é construído no Railway

| Serviço | Builder    | Dockerfile Path       | Build context |
| ------- | ---------- | --------------------- | ------------- |
| API     | Dockerfile | `apps/api/Dockerfile` | raiz do repo  |
| Web     | Dockerfile | `apps/web/Dockerfile` | raiz do repo  |

### Ordem de deploy (por causa da `VITE_API_URL`)

O Vite **congela** a `VITE_API_URL` em build-time, então a ordem importa:

1. Sobe a **API** primeiro e gera o domínio público dela (`Generate Domain`).
2. No serviço **web**, define `VITE_API_URL` = URL pública da API e faz o build.
3. Na **API**, ajusta `API_CORS_ORIGIN` = URL pública da web e redeploy.
4. (Opcional) roda o seed uma vez contra o banco de produção.

## Variáveis de ambiente (local → produção)

| Variável           | Local                   | Produção (Railway)                           |
| ------------------ | ----------------------- | -------------------------------------------- |
| `DATABASE_URL`     | Postgres do Docker      | injetada pelo Postgres do Railway            |
| `API_JWT_SECRET`   | `dev-secret-change-me`  | segredo forte gerado                         |
| `API_CORS_ORIGIN`  | `http://localhost:5173` | URL pública da **web**                       |
| `STORAGE_ENDPOINT` | MinIO local             | endpoint do bucket **R2**                    |
| `STORAGE_*`        | credenciais MinIO       | access/secret/bucket/region do **R2**        |
| `VITE_API_URL`     | `http://localhost:3333` | URL pública da **API** (entra no build Vite) |

## Checklist do Railway (passo a passo, na hora da execução)

1. **Cloudflare R2:** criar o bucket → obter endpoint, access key e secret key.
2. **Railway:** criar projeto e conectar o repositório do GitHub.
3. Adicionar **Postgres** (gerenciado) ao projeto — injeta `DATABASE_URL`.
4. Criar o serviço **API** a partir do repo: _Settings → Build → Dockerfile Path_
   = `apps/api/Dockerfile`. Variáveis: `API_JWT_SECRET` (forte), `API_JWT_EXPIRES_IN`,
   `STORAGE_*` (do R2), `DATABASE_URL` (referência ao Postgres). `Generate Domain`.
5. Criar o serviço **Web**: _Dockerfile Path_ = `apps/web/Dockerfile`. Definir
   `VITE_API_URL` = URL pública da API (é lida como **build arg**). `Generate Domain`.
6. Ajustar `API_CORS_ORIGIN` (na API) = URL pública da web → redeploy da API.
7. (Opcional) rodar o seed uma vez: `railway run --service API pnpm --filter @daily-hub/db seed:ci`.
8. Validar: `GET <api>/api/health` responde; a web carrega e o login funciona.

## Custo

Cabe no **Hobby do Railway (~US$5/mês)** (Postgres + API + web). O **R2** fica no
free tier da Cloudflare. Demo ao vivo real sem custo relevante.
