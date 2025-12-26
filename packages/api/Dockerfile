# =============================================================================
# BASE STAGE
# =============================================================================
FROM oven/bun:1 AS base
WORKDIR /app

# =============================================================================
# DEPENDENCIES INSTALLATION
# =============================================================================
FROM base AS install
RUN mkdir -p /temp/deps
COPY package.json bun.lock* /temp/deps/
COPY packages /temp/packages
RUN cd /temp/deps && bun install --frozen-lockfile --production=false

# =============================================================================
# PRODUCTION DEPENDENCIES (only runtime dependencies)
# =============================================================================
FROM base AS production-install
RUN mkdir -p /temp/deps
COPY package.json bun.lock* /temp/deps/
RUN cd /temp/deps && bun install --frozen-lockfile --production

# =============================================================================
# BUILD STAGE (compile TypeScript)
# =============================================================================
FROM base AS build
COPY --from=install /temp/node_modules /node_modules
COPY . .
RUN bun run build

# =============================================================================
# DEVELOPMENT STAGE (with hot reload)
# =============================================================================
FROM base AS development
ENV NODE_ENV=development

# Install all dependencies (including dev dependencies)
COPY package.json bun.lock* ./
COPY packages ./packages
RUN bun install --frozen-lockfile

# Set working directory
WORKDIR /app/packages/api

# Expose port
EXPOSE 3000

# Run with watch mode for hot reload
CMD ["bun", "--watch", "src/server.ts"]

# =============================================================================
# PRODUCTION STAGE (minimal image)
# =============================================================================
FROM base AS release
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=production-install /temp/node_modules /node_modules

# Copy built application
COPY --from=build /app/packages/api/dist /app/packages/api/dist
COPY --from=build /app/packages/shared/dist /app/packages/shared/dist
COPY --from=build /app/packages/database/dist /app/packages/database/dist

# Copy source files (needed for runtime)
COPY packages/api/package.json /app/packages/api/
COPY packages/shared/package.json /app/packages/shared/
COPY packages/database/package.json /app/packages/database/

# Set working directory
WORKDIR /app/packages/api

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Run the application
CMD ["bun", "run", "dist/server.js"]
