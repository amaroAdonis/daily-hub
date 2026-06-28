# syntax=docker/dockerfile:1
# Imagem da API (NestJS). Contexto de build = raiz do monorepo.
# Node 22: o @daily-hub/db é resolvido como .ts via type-stripping nativo (ver D009).

# ---------- builder ----------
FROM node:22-bookworm-slim AS builder
ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
# OpenSSL é exigido pelo engine do Prisma (slim não o traz por padrão).
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# Copia o workspace (node_modules/dist ficam de fora via .dockerignore).
COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @daily-hub/shared build \
  && pnpm --filter @daily-hub/db generate \
  && pnpm --filter @daily-hub/api build

# ---------- runner ----------
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
# OpenSSL também no runtime: o query engine do Prisma o carrega em execução.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3333
# Aplica migrações pendentes e sobe a API. PORT é injetada pelo Railway.
CMD ["sh", "-c", "pnpm --filter @daily-hub/db migrate:deploy:ci && node apps/api/dist/main.js"]
