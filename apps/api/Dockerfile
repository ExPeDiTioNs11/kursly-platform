# ── Build stage ───────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /repo

# Install dependencies (workspace-aware) using only manifests for caching.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile=false

# Copy sources and build shared + api.
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @kursly/shared build \
  && pnpm --filter @kursly/api exec prisma generate \
  && pnpm --filter @kursly/api build

# ── Runtime stage ─────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN corepack enable
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/package.json ./package.json
COPY --from=builder /repo/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /repo/packages/shared ./packages/shared
COPY --from=builder /repo/apps/api ./apps/api

WORKDIR /repo/apps/api
EXPOSE 4000
# Apply migrations then start. DATABASE_URL must be provided at runtime.
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main.js"]
