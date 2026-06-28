# syntax=docker/dockerfile:1
# Imagem da web (React + Vite, servida estática). Contexto de build = raiz do monorepo.

# ---------- builder ----------
FROM node:22-bookworm-slim AS builder
ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /app

# URL pública da API, embutida no bundle pelo Vite (build-time).
# No Railway, defina VITE_API_URL nas variáveis do serviço da web.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @daily-hub/shared build \
  && pnpm --filter @daily-hub/web build

# ---------- runner ----------
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

# Servidor estático leve, com fallback de SPA (-s).
RUN npm install -g serve@14
COPY --from=builder /app/apps/web/dist ./dist

EXPOSE 8080
# Railway injeta PORT; 8080 é o default local.
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
