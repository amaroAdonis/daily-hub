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

- [ ] **Dockerfile da API** (multi-stage: instala o workspace, `nest build`,
      imagem final enxuta; `migrate deploy` no start).
- [ ] **Dockerfile da web** (build `vite build` → estáticos servidos por `serve`/Caddy).
- [ ] **`.dockerignore`** (não copiar `node_modules`, `dist`, `.env`).
- [ ] **Seed de demonstração** (já idempotente; revisar dados de vitrine).
- [ ] **README voltado a recrutadores** + screenshots + link da demo.
- [ ] Conferir `prisma migrate deploy` como passo de release.

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

1. Criar projeto e conectar o repositório do GitHub.
2. Adicionar **Postgres** (gerenciado) → copiar a `DATABASE_URL`.
3. Criar o bucket no **Cloudflare R2** → obter endpoint + access/secret keys.
4. Criar o serviço **API** (Dockerfile), setar as env vars, garantir o
   `migrate deploy` no start.
5. Criar o serviço **Web** (Dockerfile), com `VITE_API_URL` = URL pública da API.
6. Ajustar `API_CORS_ORIGIN` para a URL pública da web.
7. (Opcional) rodar o seed de demonstração uma vez contra o banco de produção.
8. Conferir domínios/healthcheck e validar o fluxo ponta a ponta.

## Custo

Cabe no **Hobby do Railway (~US$5/mês)** (Postgres + API + web). O **R2** fica no
free tier da Cloudflare. Demo ao vivo real sem custo relevante.
