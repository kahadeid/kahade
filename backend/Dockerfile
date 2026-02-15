# ==============================================
# Stage 1: Dependencies
# ==============================================
FROM node:22-alpine3.20 AS deps

# Security: Update packages and remove cache
RUN apk update && \
    apk upgrade && \
    apk add --no-cache libc6-compat openssl && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and prod dependencies
RUN npm install -g pnpm@9.15.0 && \
    pnpm install --frozen-lockfile --prod

# ==============================================
# Stage 2: Builder
# ==============================================
FROM node:22-alpine3.20 AS builder

# Security: Update packages and remove cache
RUN apk update && \
    apk upgrade && \
    apk add --no-cache libc6-compat openssl bash && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy all package files first
COPY package.json pnpm-lock.yaml ./

# Install pnpm and ALL dependencies (including dev) for build
RUN npm install -g pnpm@9.15.0 && \
    pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Combine Prisma schema files and generate client
# NOTE: We run combine-schema.sh + prisma generate directly here
# (pnpm run build triggers prebuild which also does this, but we need it first)
RUN bash scripts/combine-schema.sh && \
    npx prisma generate

# Build application (prebuild is skipped to avoid double schema combine)
RUN npx nest build

# Remove dev dependencies for smaller final image
RUN pnpm prune --prod

# ==============================================
# Stage 3: Runner (Production)
# ==============================================
FROM node:22-alpine3.20 AS runner

# Security Labels
LABEL maintainer="Kahade Team" \
      org.opencontainers.image.title="Kahade Backend" \
      org.opencontainers.image.description="Bank-Grade P2P Escrow Platform API" \
      org.opencontainers.image.vendor="Kahade" \
      org.opencontainers.image.source="https://github.com/kahadeid/kahade" \
      security.scan="required"

# Security: Update packages and install only required runtime dependencies
RUN apk update && \
    apk upgrade && \
    apk add --no-cache dumb-init openssl ca-certificates && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user with specific UID/GID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy built application with proper ownership
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Create necessary directories with restricted permissions
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nodejs:nodejs /app && \
    chmod -R 750 /app && \
    chmod -R 770 /app/uploads /app/logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check: /api/v1/health (globalPrefix=api + version=v1 + controller=health)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = {host: 'localhost', port: 3000, path: '/api/v1/health', timeout: 5000}; \
    const req = http.request(options, (res) => { \
      process.exit(res.statusCode === 200 ? 0 : 1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.on('timeout', () => { req.destroy(); process.exit(1); }); \
    req.end();"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/src/main.js"]
