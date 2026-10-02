# ==============================================================================
# Build Stage
# ==============================================================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy root and workspace manifests for efficient caching
COPY package.json bun.lock ./
COPY shared/package.json ./shared/
COPY Backend/package.json ./Backend/
COPY Frontend/package.json ./Frontend/

# Install all dependencies across the monorepo
RUN bun install --frozen-lockfile --ignore-scripts

# Copy shared source and compile shared contracts
COPY shared/ ./shared/
RUN bun run build:shared

# Copy Backend source and compile NestJS application
COPY Backend/ ./Backend/
RUN bun --cwd Backend build

# ==============================================================================
# Production Runner Stage
# ==============================================================================
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy manifests to install production dependencies only
COPY package.json bun.lock ./
COPY shared/package.json ./shared/
COPY Backend/package.json ./Backend/
COPY Frontend/package.json ./Frontend/

RUN bun install --frozen-lockfile --production --ignore-scripts

# Copy compiled shared library and backend distribution from builder
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/Backend/dist ./Backend/dist

WORKDIR /app/Backend

# Run as non-root user for security
USER bun

EXPOSE 3000

# Health check to ensure HTTP server is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e 'fetch("http://localhost:" + (process.env.PORT || 3000) + "/").then(() => process.exit(0)).catch(() => process.exit(1))'

CMD ["bun", "dist/main.js"]

