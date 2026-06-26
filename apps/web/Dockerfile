# ── Build stage ───────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile=false

COPY packages/shared packages/shared
COPY apps/web apps/web
RUN pnpm --filter @kursly/shared build \
  && pnpm --filter @kursly/web build

# ── Runtime stage ─────────────────────────────────────────────
# Next.js standalone output bundles a minimal server with its deps.
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /repo/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
