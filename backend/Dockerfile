# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
# Install all dependencies for build (if any build steps required, though this is JS)
RUN npm ci

COPY . .

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Set Node environment
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code from builder
COPY --from=builder /usr/src/app .

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health/live || exit 1

CMD ["node", "server.js"]
