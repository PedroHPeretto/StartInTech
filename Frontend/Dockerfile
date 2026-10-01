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

# Install dependencies across the monorepo
RUN bun install --frozen-lockfile

# Copy shared source and compile shared contracts
COPY shared/ ./shared/
RUN bun run build:shared

# Copy Frontend source and compile production SPA bundle
COPY Frontend/ ./Frontend/
RUN bun --cwd Frontend build

# ==============================================================================
# Production Runner Stage
# ==============================================================================
FROM nginx:1.27-alpine AS runner

# Copy custom Nginx configuration for SPA routing and static caching
COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled SPA assets from the builder stage
COPY --from=builder /app/Frontend/dist /usr/share/nginx/html

EXPOSE 80

# Health check to ensure Nginx is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

