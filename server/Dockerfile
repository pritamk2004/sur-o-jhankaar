# Stage 1: Build & Prune
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy root workspace configurations
COPY package*.json ./
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/theme-engine/package*.json ./packages/theme-engine/
COPY packages/player-core/package*.json ./packages/player-core/
COPY server/package*.json ./server/

# Install dependencies across workspaces
RUN npm ci

# Copy full source trees
COPY packages/ ./packages/
COPY server/ ./server/
COPY data/ ./data/

# Build monorepo packages and server
RUN npm run build:packages
RUN npm --workspace=server run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install PM2 globally for clustering
RUN npm install -g pm2

# Create non-root user
USER node

# Copy built artifacts and dependencies
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/packages ./packages
COPY --from=builder --chown=node:node /app/server/dist ./server/dist
COPY --from=builder --chown=node:node /app/server/package.json ./server/package.json
COPY --from=builder --chown=node:node /app/data ./data
COPY --from=builder --chown=node:node /app/ecosystem.config.js ./ecosystem.config.js

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["pm2-runtime", "ecosystem.config.js"]
